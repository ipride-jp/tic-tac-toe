誰でも知っているゲーム「[三目並べ](https://ja.wikipedia.org/wiki/三目並べ)」を実装することを通じて、AltJS言語であるImbaにおける書き方を勉強する記事です。

- React編……[三目並べに見るReactとAngularの比較(React編)](https://www.ipride.co.jp/blog/2769)
- Angular編……[三目並べに見るReactとAngularの比較(Angular編)](https://www.ipride.co.jp/blog/2770)
- Imba編……ここ

# 環境構築

　プロジェクトを作る前に、まずImbaの処理系を導入する必要があります。ここではどちらのコマンドでも構いません。  
　余裕があれば、自分が使うエディタ(Atom・Sublime Text・VSCode)にImbaプラグインを導入しておきましょう。

```
npm install -g imba
yarn global add imba
```

　基本的には「`imba {*.imba}`」で実行できると公式GitHubの[readme.md](https://github.com/imba/imba)に書いています。  
　ただ、実際にはWebpackでパッケージ管理しつつコンパイル・実行することが多いでしょう。あいにくコマンド一つで雛形プロジェクトを作成するコマンドは無いようですので、サンプルプロジェクトをcloneして感覚を掴むことにします。ソースコードを見る限り、Imba言語を使えばWebサーバーもWebクライアントも記述できるようです。  
　　https://github.com/imba/hello-world-imba

※以降はこのサンプルプロジェクトを改造することを通じてフロントエンドのアプリを開発します。また、webpack-dev-serverを利用してデバッグビルドしますので、`server.imba`は不要になります。恐らく`server.imba`はNode.jsによるサーバーサイドを担当するためのものと思われますが……。

# マスを作成

Reactの時と同じく、まずはマスを作成します。  
TypeScriptのunion型のように重度の高い型は[リファレンス](http://imba.io/guides/language/basics)を流し見る限り無さそうなので、無難にstring型で構築します。

```imba
tag BoardButton
  def render
    <self>
      <button.mark> data:mark
```

恐ろしく簡素な構文ですが、これでReactにおける次の構文と同じ意味です。

```tsx
// Class Component
class BoardButton extends React.Component<{mark: string}> {
  public render() {
    return (
      <button className='mark'>{this.props.mark}</button>
    );
  }
}

// Functional Component
const BoardButton: React.FC<{mark: string}> = ({mark}) => (
  <button className='mark'>{mark}</button>
);
```

つまり、

- 「`data:`」がReactにおける「`this.props.`」に対応している
- タグ(ReactにおけるComponent)定義のための「`tag`」というキーワードがある
- CSSのclassを使用する際には「.mark」と付けるだけでOK
  - `<button class=変数名>`などとは書けない
  - `<button .{変数名}>`とは書ける
  - `<button .hoge=式>`と書くと、式がtrueな時だけ.hogeが適用される
- 変数を取り込むために`{}`で囲む必要がない
- `<self>`がReactで言うところの`<>`。ただし省けない
- 閉じタグが不要

というわけですね。JSX記法もかなり強烈でしたが、それに輪をかけて無駄を削ぎ落とした構文です。CSSは、今回下地にしたhello-world-imbaリポジトリによると**dist/index.cssに書けば自動で反映される**ようです。どういったトリックを使っているのでしょう……？

ちなみに、style属性をどう適用すればいいか迷いましたが、これは単純に「`<button style="margin: 50px">`」などと書けば効きます。また、インライン記法として「`<button css:margin='50px'>`と書くこともできます。」style属性で指定する場合、連想配列ではなく文字列を放り込む必要があるようです。

# どうやってタグを表示するの？

サンプルコードを読めば明らかなように、

```
Imba.mount <App[store]>
```

ここがスタートアップコードとなります。Appも上記のように`tag App`と定義されており、storeは**storeという名前の連想配列がそのまま放り込まれている**格好です。  
また、「定義したタグXの属性Yに値Zを入れる」場合、「`<X[Y: Z]>`」と書きます。ゆえに上記のBoardButtonタグを表示テストする際は、

```imba
const store = {
  mark1: "　",
  mark2: "○",
  mark3: "×",
}

tag BoardButton
  (中略)

tag App
  def render
    <self>
      <BoardButton[{mark: data:mark1}]>
      <BoardButton[{mark: data:mark2}]>
      <BoardButton[{mark: data:mark3}]>

Imba.mount <App[store]>
```

と書けばもうOKです。短いですね！

# 盤面を作成

型を定義してから使うノリではなく、また「定義はアルファベット順に並べてね！」などとlinterがうるさくないことから、サクサク書き進められます。ただ、いわゆる**range**をどう書けばいいのかが分からなかったため、以下の記述ではstore内にべた書きしています。

```imba
const store = {
  board: [
    ['　', '　', '　'],
    ['　', '　', '　'],
    ['　', '　', '　'],
  ]
}

const BUTTON_STYLE = 'font-size: 40px; height: 50px; width: 50px;'

tag BoardButton
  def render
    <self>
      <button style=BUTTON_STYLE> data:mark

tag App
  def render
    <self>
      for list in data:board
        <div css:display='flex'>
          for mark in list
            <BoardButton[{mark: mark}]>

Imba.mount <App[store]>
```

ここでAppタグのrenderメソッド内を見てほしいですが、何のためらいもなく「for list in data:board」などと書かれています。JSX記法でも{}内にJavaScriptを書いてタグを錬成できましたが、Imbaでは中括弧不要なので更にカオスになっています。

また、今回は「三目並べの一行ごとを区切るdiv」に「`display: flex`」が設定されています。ReactやAngularで作っていた時はこの指定をしなかったので違和感を感じた人もいるかも知れません。実は、↑がコンパイル・実行されると、

```
<div class="App scheduled_">
  <div style="display: flex;">
    <div class="BoardButton">
      <button style="font-size: 40px; height: 50px; width: 50px;">　</button>
    </div>
    (中略)
  </div>
  <div style="display: flex;">
  (中略)
</div>
```

となります。つまり、**tagで定義した独自タグは毎回divで囲まれる**のです。その点、勝手にdivで囲まないAngularや、ビルド時に無になることが保証されている「`<></>`」を持つReactとは勝手が違いますね。

# 状態を作成

　もはや自明に近いですが、

```imba
const store = {
  board: [
    ['　', '　', '　'],
    ['　', '　', '　'],
    ['　', '　', '　'],
  ],
  turnMark: '○',
  result: ''
}
```

で定義が完了します。ただ、これを表示する際にどうするかで難儀しました。

まず、[
マニュアル](http://imba.io/guides/language/basics)に埋め込み文字列の文法が分かりやすく書かれていませんので、「`<p> "aaa{data:bbb}"`とすれば書ける」ことに気づくまで時間を要しました(**一重引用符だと駄目**)。

また、「`<p>aaa<br>bbb<br>ccc</p>`」などのように、閉じタグが無いタグを閉じタグがあるタグの中に仕込む記法をImbaでどう書けばいいのか……もマニュアルに書いていませんでした。正解は以下の通りですが、brタグを挟むとどんどんインデントが深くなるのは地味に辛い気がします。  
(※brタグの横に何か書くとコンパイルエラーになる)

```imba
<p>aaa
  <br>
  bbb
    <br>
    ccc
```

上2つに気をつけながら、状態を表示するコードを書くとこんな感じ。

```imba
tag App
  def render
    <self>
      for list in data:board
        <div css:display='flex'>
          for mark in list
            <BoardButton[{mark: mark}]>
      <p> "現在の手番：{data:turnMark}"
        <br>
        "勝敗の結果：{data:result}"
```

# イベントを作成

- マスのボタンを押した際に、現在の手番のマークを入力する
- マスのボタンを押した際に、現在の手番を変更する
- マークが決定したボタンは二度と変更できないようにする

この辺りの処理を書いていく必要がありますが、ReactとImbaが決定的に異なるのは、**Imbaにおけるstateはimmutableじゃない**ということです。

つまり、いきなりstateを書き換えても画面にその内容が反映されます(ReactだとsetStateで「上書きする」所作になる)。また、stateなどの連想配列の中身は、「`state['aaa']['bbb']`」のように書くことを推奨します(関数呼び出しと勘違いされる恐れがあるため)。

```imba
tag BoardButton
  def setMark
    if store['board'][data:row][data:column] != '　'
      return
    store['board'][data:row][data:column] = store['turnMark']
    store['turnMark'] = store['turnMark'] == '○' ? '×' : '○'
  def render
    <self>
      <button style=BUTTON_STYLE :tap.setMark> data:mark

tag App
  def render
    return <self>
      for i in [0, 1, 2]
        <div css:display='flex'>
          for j in [0, 1, 2]
            <BoardButton[{mark: data:board[i][j], row: i, column: j}]>
      <p> "現在の手番：{data:turnMark}"
        <br>
        "勝敗の結果：{data:result}"
```

上記では、ゲームロジックの一部をBoardButton内のsetMarkメソッド内に書いてしまっています。また、BoardButtonが自身の位置についての情報を持ってしまい、さらに直接stateをBoardButtonが操作してしまっています(※動きはします)。

そこで、行儀が良いコードにするため、AppからBoardButtonに対してクリック用関数のオブジェクトを渡すことにします。ここでも全然Type Hintingしませんので、書く際は混乱しないようにしましょう。

```imba
tag BoardButton
  def setMark
    data:setMark()

  def render
    <self>
      <button style=BUTTON_STYLE :tap.setMark> data:mark

tag App
  def addMark i, j
    if data:board[i][j] != '　'
      return
    data:board[i][j] = data:turnMark
    data:turnMark = data:turnMark == '○' ? '×' : '○'

  def render
    return <self>
      for i in [0, 1, 2]
        <div css:display='flex'>
          for j in [0, 1, 2]
            const setMark = do addMark(i, j)
            <BoardButton[{mark: data:board[i][j], setMark: setMark}]>
      <p> "現在の手番：{data:turnMark}"
        <br>
        "勝敗の結果：{data:result}"
```

# 勝敗を判定

ReactやAngularで作っていた関数をそのままコピペはできませんので、Imba言語向けに移植する必要があります。前述したコードにもあったように、プログラミング言語にはよくある「`for i=0; i < 3; ++i`」のような構文がImbaには無いらしく(要検証)、結果として「`for i in [0, 1, 2]`」がコード中に溢れることになりました。

```imba
tag App
  def addMark i, j
    if data:board[i][j] != '　'
      return
    data:board[i][j] = data:turnMark
    data:turnMark = data:turnMark == '○' ? '×' : '○'
    data:result = judge()

  def judge
    for mark in ['○', '×']
      # 縦
      for i in [0, 1, 2]
        let flg = true
        for j in [0, 1, 2]
          if data:board[j][i] != mark
            flg = false
            break
        if flg
          return "{mark}が勝利"
      # 横
      for i in [0, 1, 2]
        let flg = true
        for j in [0, 1, 2]
          if data:board[i][j] != mark
            flg = false
            break
        if flg
          return "{mark}が勝利"
      # 斜め
      let flg = true
      for i in [0, 1, 2]
        if data:board[i][i] != mark
            flg = false
            break
      if flg
          return "{mark}が勝利"
      flg = true
      for i in [0, 1, 2]
        if data:board[i][2 - i] != mark
            flg = false
            break
      if flg
          return "{mark}が勝利"
    return ''

    (後略)
```

# Imbaの使い勝手まとめ

## IDE(ここではVSCodeのプラグイン)における対応が不十分

例えばキーワード色分けですが、添付画像のように色分けが混乱している箇所も見られました。このように小規模なアプリケーションでもこれですので、分量を書けば言わずもがなでしょう。

[image]()

また、VSCode使いがTypeScriptを書く際、「定義へ移動」「ドキュメントのフォーマット」「シンボルの名前変更」「変数や関数の型ポップアップ」などは息をするように行うことでしょう。現状Imbaプラグインではそれらの機能が**全部使えない**ので、書く際に面倒さを覚えることが多いです。この辺りは、今後の改良に期待ですね。

## Imba自体の文法の不十分さ、ドキュメントが不完全

[Imbaの公式ドキュメント](http://imba.io/guides/essentials/introduction)は、

- 変数の宣言方法についての情報が不足している
  - varだけでなくletやconstでも宣言できることが書かれていません
  - **違う型の値で変数を上書きしてもいい**ことが書かれていません
  - Type Hintingできないことが書かれていません
- JavaScriptの標準ライブラリが叩けるかが書かれていません
  - 結論から言うと叩けますが、**なぜ明示されていないのですか？**
- 「`for i=0; i < 3; ++i`」のような構文はどうやって書くの？
  - なんで連想配列のイテレートまで可能なのにそれだけ省いたの？
  - ついでにrange記法もreduce構文も無さそう
- 「tagで定義した独自タグは毎回divで囲まれる」ことが明示されていない
  - 「`X`」という独自タグは「`<div class="X">`」に変換されるということ
  - 「The DOM element also has a reference to its Imba.Tag wrapper, through domElement:_tag」で察するのは難しいのでは？
- 閉じタグが無いタグを閉じタグがあるタグ内で書く作法が書かれていない
  - 結果は上記の通り。これは初見殺しなのではないでしょうか……

など、記述が不完全な箇所が多々あります。「あれはオフィシャルガイドであってリファレンスではない」というのでしたらリファレンスを別途作るべきです。[コミュニティ](https://gitter.im/somebee/imba)に質問する手もありますが、リファレンスがあれば済むような問題にまで聞きに行く必要があるのでしょうか？

## ビルドが恐ろしく速い

Reactのビルドは(Angularと比べて)かなりゆっくりですが、ImbaのビルドはAngularより更に速いです。今回の場合、修正してからビルドが完了するまで**長くても1秒弱**でした。どういった仕組みを使っているのかは分かりませんが、開発者にストレスを感じさせない速度なのは素直に凄いと感じました。
