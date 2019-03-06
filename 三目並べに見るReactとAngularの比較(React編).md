誰でも知っているゲーム「[三目並べ](https://ja.wikipedia.org/wiki/三目並べ)」を実装することを通じて、2つのフレームワークにおける書き方を比較する記事です。

- React編……ここ
- Angular編……[三目並べに見るReactとAngularの比較(Angular編)]()

# 環境構築

`npx create-react-app tic-tac-toe --scripts-version=react-scripts-ts`

後は`yarn start`でデバッグビルド起動します。

# マスを作成

まず、絶対に必要となる「石を置くためのマス」を用意します。  
今回はテキストで表現していますが、真面目に書くならCSSで描画することになるでしょう。

```tsx
import * as React from 'react';
import { MarkType } from "./constant";
const BUTTON_STYLE = { fontSize: 40, height: 50, width: 50 }

export const BoardButton: React.FC<{mark: MarkType}> = ({mark}) => (
  <button style={BUTTON_STYLE}>{mark}</button>
);
```

ここで、「石の情報」を表すためのMarkType型を作成しています。  
TypeScriptで書いているので、こうした型も簡単に作成できます。

```typescript
export type MarkType = '○' | '×' | '　'
```

# 盤面を作成

次に、「盤面」を用意します。「マス」を縦横に並べる必要があるので注意が必要です。  
ここでは「3×3」に対して厳密にこだわらず、運用でカバーする方向で実装しました。

```tsx
import * as React from 'react';
import { BoardButton } from './BoardButton';
import { BoardInfo } from "./constant";

export const Board: React.FC<{boardInfo: BoardInfo}> = ({boardInfo}) => (
  <>
    {boardInfo.map(line => (
      <div>{
        line.map(mark => (
          <BoardButton mark={mark}/>
        ))
      }</div>
    ))}
  </>
);
```
```typescript
export type BoardInfo = MarkType[][]
```

# 状態を作成

次に、「状態」を用意します。  
三目並べで必要なのは、盤面の情報・現在の手番・勝敗の結果ぐらいのものでしょう。  
今回は、React HooksにおけるuseStateを利用してそれぞれ作成します。

```tsx
const BOARD_SIZE = 3;

const App: React.FC = () => {
  const [board, setBoard] = React.useState<BoardInfo>(
    Array.from(new Array<MarkType[]>(BOARD_SIZE),
      () => new Array<MarkType>(BOARD_SIZE).fill('　'))
  );
  const [turnMark] = React.useState<MarkType>('○');
  const [result] = React.useState<string>('');

  return (
    <>
      <Board boardInfo={board}/>
      <p>現在の手番：{turnMark}<br/>
      勝敗の結果：{result}</p>
    </>
  );
}
```

# イベントを作成

次に、このような処理を実装します。

- マスのボタンを押した際に、現在の手番のマークを入力する
- マスのボタンを押した際に、現在の手番を変更する
- マークが決定したボタンは二度と変更できないようにする

BoardButtonには「ボタンをクリックした際の処理」が書かれていません。そこで、その処理を実装します。

```tsx
export const BoardButton: React.FC<{
  mark: MarkType, onClick: () => void
}> = ({mark, onClick}) => (
  <button style={BUTTON_STYLE} onClick={onClick}>{mark}</button>
);
```

上記処理では「どの位置のマスを押したか」の情報をどう扱うかが問題になります。BoardButtonのPropsに位置情報を割り当てる手もありましたが、今回はBoard側でそれを処理することにしました。

```tsx
export const Board: React.FC<{
  boardInfo: BoardInfo,
  onClick: (i: number, j: number) => void
}> = ({boardInfo, onClick}) => (
  <>
    {boardInfo.map((line, i) => (
      <div>{
        line.map((mark, j) => {
          const onClickFunc = () => onClick(i, j);
          return (
          <BoardButton key={`${i} ${j}`} mark={mark} onClick={onClickFunc}/>
        );})
      }</div>
    ))}
  </>
);
```

そして、盤面を更新する処理を記述します。盤面の情報(2次元配列)をディープコピーするために雑な手段を用いましたが、本来なら配列として各要素をコピーするべきだと思われます。

```tsx
const App: React.FC = () => {
  const [board, setBoard] = React.useState<BoardInfo>(
    Array.from(new Array<MarkType[]>(BOARD_SIZE),
      () => new Array<MarkType>(BOARD_SIZE).fill('　'))
  );
  const [turnMark, setTurnMark] = React.useState<MarkType>('○');
  const [result] = React.useState<string>('');

  const onBoardClick = (i: number, j: number) => {
    // 既に置かれている場所には置けない
    if (board[i][j] !== '　') {
      return;
    }
    // 石を置く
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[i][j] = turnMark;
    setBoard(newBoard);
    
    // 手番を交代する
    setTurnMark(turnMark === '○' ? '×' : '○');
  }

  return (
    <>
      <Board boardInfo={board} onClick={onBoardClick}/>
      <p>現在の手番：{turnMark}<br/>
      勝敗の結果：{result}</p>
    </>
  );
}
```

# 勝敗を判定

- 縦・横・斜めに見て、同じマークが3つ並んでいればそのマークが勝ち
- 1つ手を打つたびに判定するため、「両方のマークが勝っている状態」は無い
- どちらも勝ちではなく、盤面が埋まった際は引き分け
- それ以外は「勝敗不明」とする

ようにします。そこで、次のような判定関数を作成しました。
(これよりもっと短い書き方はありますが、可読性を優先させました)

```ts
// [0, 1, 2, ..., n-1]を作成する
const range = (n: number) => Array.from(Array(n).keys());

const judge = (boardInfo: BoardInfo) => {
  const markList: MarkType[] = ['○', '×'];
  // どちらかが勝っているかを調べる
  for (const mark of markList) {
    // 縦
    for (let i = 0; i < BOARD_SIZE; ++i) {
      if (range(BOARD_SIZE)
        .filter(j => boardInfo[j][i] !== mark)
        .length === 0) {
          return `${mark}の勝利`;
      }
    }
    // 横
    for (let i = 0; i < BOARD_SIZE; ++i) {
      if (range(BOARD_SIZE)
        .filter(j => boardInfo[i][j] !== mark)
        .length === 0) {
          return `${mark}の勝利`;
      }
    }
    // 斜め
    if (range(BOARD_SIZE)
      .filter(i => boardInfo[i][i] !== mark)
      .length === 0) {
        return `${mark}の勝利`;
    }
    if (range(BOARD_SIZE)
      .filter(i => boardInfo[i][BOARD_SIZE - i - 1] !== mark)
      .length === 0) {
        return `${mark}の勝利`;
    }
  }
  // 引き分け判定
  if (range(BOARD_SIZE * BOARD_SIZE).filter(k => {
      const i = Math.floor(k / BOARD_SIZE);
      const j = k % BOARD_SIZE;
      return (boardInfo[i][j] === '　')
    }).length === 0) {
    return '引き分け';
  }
  return '';
};
```

後は、盤面をクリックするたびにこれを走らせればとりあえず完成です。

```ts
  const [result, setResult] = React.useState<string>('');

  const onBoardClick = (i: number, j: number) => {
    // 既に置かれている場所には置けない
    if (board[i][j] !== '　') {
      return;
    }
    // 石を置く
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[i][j] = turnMark;
    setBoard(newBoard);
    
    // 手番を交代する
    setTurnMark(turnMark === '○' ? '×' : '○');

    // 判定結果を書き込む
    setResult(judge(newBoard));
  }
```
