import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  return (
    <button
      className="square"
      onClick={props.onClick}
      winnerSquare={props.winnerSquare}
    ></button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    let winner = false;
    for (var k = 0; k < this.props.winnerSquares.length; k++) {
      if (this.props.winnerSquares[k] === i) {
        winner = true;
      }
    }

    return (
      <Square
        winnerSquare={winner ? "true" : "false"}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderBoard() {
    const items = [];
    for (
      let y = 0;
      y < this.props.squares.length;
      y = y + this.props.squares.length / 3
    ) {
      items.push(this.renderRow(y));
    }
    return items;
  }

  renderRow(i) {
    return <div className="board-row">{this.renderColumnsPerRow(i)}</div>;
  }

  renderColumnsPerRow(i) {
    const items = [];
    for (let y = 0; y < this.props.squares.length / 3; y++) {
      items.push(this.renderSquare(i + y));
    }
    return items;
  }
  render() {
    return <div>{this.renderBoard()}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ordenDescendente: false,
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true
    };
  }

  handleOrdenDescendenteClick() {
    this.setState({
      ordenDescendente: !this.state.ordenDescendente
    });
  }

  handleBoardClick(i) {
    console.log(this.state.history);
    // el histórico me devuelve todos los movimientos menos el último
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    // el actual me devuelve el estado actual del tablero
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (this.calculateWinner(squares) || squares[i]) {
      return;
    }

    // i es la posición de cada "square"; empezamos con "X", de modo que cada vez hacemos un click
    // establecemos la propiedad "xIsNext" a false, por lo que el siguiente movimiento lo hará "O"
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0
    });
  }

  lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  // función que me compara los "squares" marcados con las posibles combinaciones ganadoras
  calculateWinner(squares) {
    for (let i = 0; i < this.lines.length; i++) {
      const [a, b, c] = this.lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return [squares[a], i];
      }
    }
    return null;
  }

  currentMove(step, move) {
    if (move === 0) {
      return;
    }
    const previousMove = this.state.history[move - 1];
    const currentSquares = step.squares;
    let diff;

    for (var i = 0; i < previousMove.squares.length; i++) {
      if (previousMove.squares[i] !== currentSquares[i]) {
        diff = i;
        break;
      }
      diff = null;
    }
    if (diff === null) {
      return "";
    }
    const humanReadablePos = diff + 1;
    return "" + currentSquares[diff] + "->" + humanReadablePos;
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = this.calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const bold = move === this.state.stepNumber;
      const desc = move
        ? "Go to move " + this.currentMove(step, move)
        : "Go to game start";

      return (
        <li value={move + 1} key={move} select={bold ? "true" : "false"}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    const reverseButtonDesc = this.state.ordenDescendente
      ? "Orden descendente"
      : "Orden ascendente";
    const reverseButton = (
      <button onClick={() => this.handleOrdenDescendenteClick()}>
        {reverseButtonDesc}
      </button>
    );
    if (!this.state.ordenDescendente) {
      moves.reverse();
    }

    let draw = true;
    for (var k = 0; k < current.squares.length; k++) {
      if (current.squares[k] === null || winner) {
        draw = false;
      }
    }

    let status;
    let winnerSquares;
    if (winner) {
      status = "Winner: " + winner[0];
      winnerSquares = this.lines[winner[1]];
    } else {
      if (draw) {
        status = "Draw";
      } else {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      }
      winnerSquares = [];
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winnerSquares={winnerSquares}
            onClick={i => this.handleBoardClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <div>{reverseButton}</div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
