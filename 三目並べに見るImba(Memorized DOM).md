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

というわけですね。JSX記法もかなり強烈でしたが、それに輪をかけて無駄を削ぎ落とした構文です。CSSは、今回下地にしたhello-world-imbaリポジトリによると**dist/index.cssに書けば自動で反映される**ようです。どういったトリックを使っているんだ……？

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

と書けばもうOKです。短い！

# 盤面を作成

型を定義してから使うノリではなく、また「定義はアルファベット順に並べてね！」などとlinterがうるさくないことから、サクサク書き進められます。ただ、いわゆる**range**をどう書けばいいのかが分からなかったため、以下の記述ではstore内にべた書きしています。

```imba
const BOARD_SIZE = 3;

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





TypeScriptと違い、型をType Hintingできるようなノリではないようですので、

この時気づきましたが、TypeScriptのようにエディタ(例えばVSCode)側の対応が進んでいませんので、IntelliSenseなどの支援機能が機能しません。  
例えば、

コンパイルが速い
