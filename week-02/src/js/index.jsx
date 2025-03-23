import {createRoot} from 'react-dom/client'
import {useState} from "react";

const root = createRoot(document.getElementById('root'));

function tick() {
    const element = (
        <div>
            <h1>Hello, world!</h1>
            <h2>It is {new Date().toLocaleTimeString()}.</h2>
            <br/>
            <ColocChnageButton/>
        </div>
    );
    root.render(element);
}

setInterval(tick, 1000);

function ColocChnageButton() {
    const [styleConfig, setStyleConfig] = useState({color: 'red'});
    const handleClick = () => {
        setStyleConfig({...styleConfig, color: styleConfig?.color === 'red' ? 'blue' : 'red'});
    }

    return (
        <>
            <h1 style={styleConfig}>Text</h1>
            <button onClick={handleClick}>
                Change
            </button>
        </>
    )
}