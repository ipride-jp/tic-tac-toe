import { Injectable } from '@angular/core';
import { BoardInfo, MarkType } from './constant';
import { Subject } from 'rxjs';

export const BOARD_SIZE = 3;

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private mBoard: BoardInfo = Array.from(new Array<MarkType[]>(BOARD_SIZE),
    () => new Array<MarkType>(BOARD_SIZE).fill('　'));

  private mTurnMark: MarkType = '○';

  private mResult = '';

  turnMarkSubject: Subject<MarkType> = new Subject();
  resultSubject: Subject<string> = new Subject();

  constructor() {}

  flipTurnMark() {
    this.mTurnMark = this.mTurnMark === '○' ? '×' : '○';
    this.turnMarkSubject.next(this.mTurnMark);
  }

  addMark(i: number, j: number) {
    this.mBoard[i][j] = this.mTurnMark;
  }

  get board(): BoardInfo {
    return this.mBoard;
  }

  get turnMark(): MarkType {
    return this.mTurnMark;
  }

  get result(): string {
    return this.mResult;
  }

  set result(value: string) {
    this.mResult = value;
    this.resultSubject.next(this.mResult);
  }
}
