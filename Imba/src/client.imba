const store = {
  board: [
    ['　', '　', '　'],
    ['　', '　', '　'],
    ['　', '　', '　'],
  ],
  turnMark: '○',
  result: ''
}

const BUTTON_STYLE = 'font-size: 40px; height: 50px; width: 50px;'

tag BoardButton
  def setMark
    data:setMark()

  def render
    <self>
      <button style=BUTTON_STYLE :tap.setMark> data:mark

tag App
  def addMark i, j
    if data:board[i][j] != '　'
      return
    data:board[i][j] = data:turnMark
    data:turnMark = data:turnMark == '○' ? '×' : '○'
    data:result = judge()

  def judge
    for mark in ['○', '×']
      # 縦
      for i in [0, 1, 2]
        let flg = true
        for j in [0, 1, 2]
          if data:board[j][i] != mark
            flg = false
            break
        if flg
          return "{mark}が勝利"
      # 横
      for i in [0, 1, 2]
        let flg = true
        for j in [0, 1, 2]
          if data:board[i][j] != mark
            flg = false
            break
        if flg
          return "{mark}が勝利"
      # 斜め
      let flg = true
      for i in [0, 1, 2]
        if data:board[i][i] != mark
            flg = false
            break
      if flg
          return "{mark}が勝利"
      flg = true
      for i in [0, 1, 2]
        if data:board[i][2 - i] != mark
            flg = false
            break
      if flg
          return "{mark}が勝利"
    return ''

  def render
    return <self>
      for i in [0, 1, 2]
        <div css:display='flex'>
          for j in [0, 1, 2]
            const setMark = do addMark(i, j)
            <BoardButton[{mark: data:board[i][j], setMark: setMark}]>
      <p> "現在の手番：{data:turnMark}"
        <br>
        "勝敗の結果：{data:result}"

Imba.mount <App[store]>
