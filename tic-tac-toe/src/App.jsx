import './styles.css';
import {useState} from "react";
import AppV2 from "./sample/SqureSample.jsx";

function Square({value, onSquareClick}) {
    return <button className="square" onClick={onSquareClick}>{value}</button>;
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}

/**
 * 주어진 길이만큼 연속된 숫자의 배열을 생성 <br/>
 * 예) createSequenceNumberArray(3) => [0, 1, 2]
 */
function createSequenceNumberArray(length) {
    return Array.from({length}, (_, i) => i + 1)
}

function SquareRows({rowCount, colCount, squares, handleClick}) {
    let currentColIndex = 0;
    return createSequenceNumberArray(rowCount)
        .map((rowIndex) => <div key={String(rowIndex)} className="board-row">
            {createSequenceNumberArray(colCount)
                .map(() => {
                    const squareIndex = currentColIndex++;
                    return <Square key={squareIndex} value={squares[squareIndex]}
                                   onSquareClick={() => handleClick(squareIndex)}/>
                })}
        </div>)
}

export function Board({xIsNext, squares, onPlay}) {

    function handleClick(index) {
        if (squares[index] || calculateWinner(squares)) {
            return;
        }
        const nextSquares = squares.slice();
        if (xIsNext) {
            nextSquares[index] = "X";
        } else {
            nextSquares[index] = "O";
        }
        onPlay(nextSquares);
    }

    const winner = calculateWinner(squares);
    let status;
    if (winner) {
        status = 'Winner: ' + winner;
    } else {
        status = 'Next player: ' + (xIsNext ? 'X' : 'O');
    }

    return (
        <>
            <div className="status">{status}</div>
            <SquareRows squares={squares} colCount={3} rowCount={3} handleClick={handleClick}/>
        </>
    )
}

function Game() {
    const [history, setHistory] = useState([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];

    function handlePlay(nextSquares) {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    function jumpTo(nextMove) {
        setCurrentMove(nextMove);
    }

    const moves = history.map((squares, move) => {
        let description;
        if (move > 0) {
            description = 'Go to move #' + move;
        } else {
            description = 'Go to game start';
        }
        return (
            <li key={move}>
                <button onClick={() => jumpTo(move)}>{description}</button>
            </li>
        );
    });


    return (
        <div className="game">
            <div className="game-board">
                <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay}/>
            </div>
            <div className="game-info">
                <ol>{moves}</ol>
            </div>
        </div>
    );
}


function App() {

    return (
        <>
            <Game/>
        </>
    )
}

export default AppV2

