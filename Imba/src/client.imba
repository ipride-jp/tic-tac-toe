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
