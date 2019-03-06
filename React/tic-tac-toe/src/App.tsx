import * as React from 'react';
import { Board } from './Board';
import { BoardInfo, MarkType } from './constant';

const BOARD_SIZE = 3;

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

const App: React.FC = () => {
  const [board, setBoard] = React.useState<BoardInfo>(
    Array.from(new Array<MarkType[]>(BOARD_SIZE),
      () => new Array<MarkType>(BOARD_SIZE).fill('　'))
  );
  const [turnMark, setTurnMark] = React.useState<MarkType>('○');
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

  return (
    <>
      <Board boardInfo={board} onClick={onBoardClick}/>
      <p>現在の手番：{turnMark}<br/>
      勝敗の結果：{result}</p>
    </>
  );
}

export default App;
