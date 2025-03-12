import './styles.css';
import {useState} from "react";

function Square() {

    const [value, setValue] = useState(null);

    function handleClick() {
        setValue('X');
    }

    return <button className="square" onClick={handleClick}>{value}</button>;
}

export function Board() {
    return (
        <>
            <div className="board-row">
                <Square/>
                <Square/>
                <Square/>
            </div>
            <div className="board-row">
                <Square/>
                <Square/>
                <Square/>
            </div>
            <div className="board-row">
                <Square/>
                <Square/>
                <Square/>
            </div>
        </>
    )
}

function App() {

    return (
        <>
            <Board/>
        </>
    )
}

export default App
