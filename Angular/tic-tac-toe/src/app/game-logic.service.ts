import { Injectable } from '@angular/core';
import { GameStateService, BOARD_SIZE } from './game-state.service';
import { BoardInfo, MarkType } from './constant';

@Injectable({
  providedIn: 'root'
})
export class GameLogicService {

  constructor(private gameState: GameStateService) { }

  setMark(i: number, j: number) {
    this.gameState.addMark(i, j);
    this.gameState.flipTurnMark();
    this.gameState.result = this.judge(this.gameState.board);
  }

  // [0, 1, 2, ..., n-1]を作成する
  private range(n: number) {
    return Array.from(Array(n).keys());
  }

  private judge(boardInfo: BoardInfo): string {
    const markList: MarkType[] = ['○', '×'];
    // どちらかが勝っているかを調べる
    for (const mark of markList) {
      // 縦
      for (let i = 0; i < BOARD_SIZE; ++i) {
        if (this.range(BOARD_SIZE)
          .filter(j => boardInfo[j][i] !== mark)
          .length === 0) {
            return `${mark}の勝利`;
        }
      }
      // 横
      for (let i = 0; i < BOARD_SIZE; ++i) {
        if (this.range(BOARD_SIZE)
          .filter(j => boardInfo[i][j] !== mark)
          .length === 0) {
            return `${mark}の勝利`;
        }
      }
      // 斜め
      if (this.range(BOARD_SIZE)
        .filter(i => boardInfo[i][i] !== mark)
        .length === 0) {
          return `${mark}の勝利`;
      }
      if (this.range(BOARD_SIZE)
        .filter(i => boardInfo[i][BOARD_SIZE - i - 1] !== mark)
        .length === 0) {
          return `${mark}の勝利`;
      }
    }
    // 引き分け判定
    if (this.range(BOARD_SIZE * BOARD_SIZE).filter(k => {
        const i = Math.floor(k / BOARD_SIZE);
        const j = k % BOARD_SIZE;
        return (boardInfo[i][j] === '　')
      }).length === 0) {
      return '引き分け';
    }
    return '';
  }
}
