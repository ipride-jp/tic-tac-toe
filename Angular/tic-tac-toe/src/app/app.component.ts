import { Component } from '@angular/core';
import { GameStateService } from './game-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'tic-tac-toe';
  turnMark = this.gameState.turnMark;
  result = this.gameState.result;

  constructor(private gameState: GameStateService) {
    this.gameState.turnMarkSubject
      .subscribe(m => this.turnMark = m);
    this.gameState.resultSubject
      .subscribe(r => this.result = r);
  }
}
