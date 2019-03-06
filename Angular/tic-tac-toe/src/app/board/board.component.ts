import { Component, OnInit } from '@angular/core';
import { BoardInfo } from '../constant';
import { GameStateService } from '../game-state.service';
import { GameLogicService } from '../game-logic.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  board: BoardInfo = this.gameState.board;

  BUTTON_STYLE = {
    fontSize: '40px',
    height: '50px',
    width: '50px'
  };
  constructor(private gameState: GameStateService,
              private gameLogic: GameLogicService) { }

  ngOnInit() {
  }

  onClickButton(i: number, j: number) {
    if (this.gameState.board[i][j] !== '　') {
      return;
    }
    this.gameLogic.setMark(i, j);
  }
}
