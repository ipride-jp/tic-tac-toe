誰でも知っているゲーム「[三目並べ](https://ja.wikipedia.org/wiki/三目並べ)」を実装することを通じて、2つのフレームワークにおける書き方を比較する記事です。

- React編……[三目並べに見るReactとAngularの比較(React編)](https://www.ipride.co.jp/blog/2769)
- Angular編……ここ

# 環境構築

```
ng new tic-tac-toe
? Would you like to add Angular routing? Yes
? Which stylesheet format would you like to use? Sass   (.scss) [ http://sass-lang.com   ]
```

後は`ng serve`でデバッグビルド起動します。

# マス・盤面を作成

Angularでも、Reactと同様にマスの段階からコンポーネントを作成できます。ただ、コンポーネント生成時の周辺コードが多いので、そこまで細かい粒度で作らないことが多いと思います。ここでは「マス付きの盤面」を作成します。

`ng generate component Board`

でBoardコンポーネントを作成し、テンプレートである`board.component.html`と、付随するコードである`board.component.ts`を修正します。

```html
<div *ngFor='let markLine of board'>
  <button *ngFor='let mark of markLine' [ngStyle]='BUTTON_STYLE'>{{mark}}</button>
</div>
```

```typescript
import { Component, OnInit } from '@angular/core';
import { BoardInfo, MarkType } from '../constant';

const BOARD_SIZE = 3;

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  board: BoardInfo = Array.from(new Array<MarkType[]>(BOARD_SIZE),
    () => new Array<MarkType>(BOARD_SIZE).fill('　'));

  BUTTON_STYLE = {
    fontSize: '40px',
    height: '50px',
    width: '50px'
  };
  constructor() { }

  ngOnInit() {
  }
}
```

ここでReactの場合と比較すると、次のような点に差が見られます。

- UIの作成方法
  - React……JSX記法で「HTML(仮想DOM)」を作成する
  - Angular……テンプレートのHTMLを作成する
- UIに対する変数の適用方法
  - React……JSXにPropsの値などを変数として埋め込む
    - 変数定義はどこからでも構わない
  - Angular……テンプレートに変数名を埋め込む
    - 変数は必ずコンポーネントのクラス内に定義する必要がある
- UIにおける条件分岐・ループ処理
  - React……JSXの生成処理を`map`などのメソッドを使って工夫すればいい
  - Angular……`ngIf`や`ngFor`などのキーワードを利用する
- 変数によるCSSの定義方法
  - React……ケバブケースではなくローワーキャメルケース
    - px指定については文字列ではなく数字で定義する
  - Angular……Reactと同様
    - px指定についても「`'50px'`」などと表記する
- 変数によるCSSの適用方法
  - React……「`style={cssValue}`」といった風に埋め込める
  - Angular……「`[ngStyle]='cssValue'`」といった風に書く
- 変数によるclassの適用方法
  - React……「`className={classValue}`」
  - Angular……「`[ngClass]='classsValue'`」
  

# 状態を作成

AngularはServiceを定義して[DI(依存性の注入)](https://ja.wikipedia.org/wiki/依存性の注入)しやすいことが特徴です。なので今回の場合も、ゲームの状態を保持するServiceを定義し、それをBoardコンポーネントにDIします。手順としてはまず、

`ng generate service GameState`

としてから、`game-state.service.ts`を修正します。後々必要になってくるメソッドをここでは一緒に定義しています。

```typescript
import { Injectable } from '@angular/core';
import { BoardInfo, MarkType } from './constant';

const BOARD_SIZE = 3;

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  private mBoard: BoardInfo = Array.from(new Array<MarkType[]>(BOARD_SIZE),
    () => new Array<MarkType>(BOARD_SIZE).fill('　'));

  private mTurnMark: MarkType = '○';

  private mResult = '';

  constructor() { }

  flipTurnMark() {
    this.mTurnMark = this.mTurnMark === '○' ? '×' : '○';
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
  }
}
```

すると、`board.component.ts`が次のように簡略化されます。

```typescript
import { Component, OnInit } from '@angular/core';
import { BoardInfo } from '../constant';
import { GameStateService } from '../game-state.service';

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
  constructor(private gameState: GameStateService) { }

  ngOnInit() {
  }
}
```

# イベントを作成

次に、このような処理を実装します。

- マスのボタンを押した際に、現在の手番のマークを入力する
- マスのボタンを押した際に、現在の手番を変更する
- マークが決定したボタンは二度と変更できないようにする

Angularの場合、ngForにおけるループのインデックスは、「`let i = index`」などと続けて書くことによって取り出せます。言うなれば、`index`という特別な変数が存在する感じですね。まず`board.component.html`を修正し、

```html
<div *ngFor='let markLine of board; let i = index'>
  <button *ngFor='let mark of markLine; let j = index'
    [ngStyle]='BUTTON_STYLE'
    (click)='onClickButton(i, j)'>{{mark}}</button>
</div>
```

その後に`board.component.ts`を修正します。重要なのは、GameStateServiceのメソッドをBoardComponentが叩けることから、ちょっとした **ゲームロジック的なものも書けてしまう** ということですね。

```typescript
import { Component, OnInit } from '@angular/core';
import { BoardInfo } from '../constant';
import { GameStateService } from '../game-state.service';

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
  constructor(private gameState: GameStateService) { }

  ngOnInit() {
  }

  onClickButton(i: number, j: number) {
    if (this.gameState.board[i][j] !== '　') {
      return;
    }
    // この辺がゲームロジック
    this.gameState.addMark(i, j);
    this.gameState.flipTurnMark();
  }
}
```

さすがにそれは良くありませんので、ゲームロジック用のServiceも作成します。

`ng generate service GameLogic`

```typescript
import { Injectable } from '@angular/core';
import { GameStateService } from './game-state.service';

@Injectable({
  providedIn: 'root'
})
export class GameLogicService {

  constructor(private gameState: GameStateService) { }

  setMark(i: number, j: number) {
    this.gameState.addMark(i, j);
    this.gameState.flipTurnMark();
  }
}
```

すると、BoardComponent内のonClickButtonからゲームロジックを無くせます。

```typescript
import { GameLogicService } from '../game-logic.service';

  constructor(private gameState: GameStateService,
              private gameLogic: GameLogicService) { }

  onClickButton(i: number, j: number) {
    if (this.gameState.board[i][j] !== '　') {
      return;
    }
    this.gameLogic.setMark(i, j);
  }
```

# 勝敗を判定

- 縦・横・斜めに見て、同じマークが3つ並んでいればそのマークが勝ち
- 1つ手を打つたびに判定するため、「両方のマークが勝っている状態」は無い
- どちらも勝ちではなく、盤面が埋まった際は引き分け
- それ以外は「勝敗不明」とする

ようにします。この辺りは[Reactのとき]()に書いたものの流用でOKです。

```typescript
export class GameLogicService {
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
```

後は、この結果表示などの機能を組み込めば、とりあえず完成…… **と思ったら大間違い**。実は、以下のように書いたとして、石を打っても「現在の手番」「勝敗の結果」の情報が変化しません。いったいなぜなのでしょうか？

```html
<!-- app.component.html -->
<app-board></app-board>
<p>現在の手番：{{turnMark}}<br/>
勝敗の結果：{{result}}</p>
```

```typescript
// app.component.ts
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

  constructor(private gameState: GameStateService) { }
}
```

……それは、AppComponentクラスにおける「turnMark」や「result」がプリミティブ型だからです。BoardComponentクラスにおける「board」がちゃんと書き換わるのは、その実態がMarkTypeの配列……つまり参照型だからです。

じゃあどうするのかといった話になりますが、そもそもAngularにおけるデータ伝達は **RxJSを使う** のが基本とされています。つまり今回では、「turnMark」や「result」の情報を送るSubjectを作成し、それが発火した際の動きをAppComponentクラス内で書けばよいのです。GameStateService内で入念にsetterを書いていたのは、これが理由だったのです。

```typescript
// game-state.service.ts
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
```

```typescript
// app.component.ts
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
```
