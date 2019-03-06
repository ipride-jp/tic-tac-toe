import * as React from 'react';
import { BoardButton } from './BoardButton';
import { BoardInfo } from "./constant";

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
