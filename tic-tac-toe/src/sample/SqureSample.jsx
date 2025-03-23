import {useState} from "react";

function IncrementButton() {
    const [value, setValue] = useState(0);
    const handleClick = () => {
        const newValue = value + 1
        setValue(newValue);
        console.log(`value: ${value}, newValue: ${newValue}`);
    }
    return (
        <div>
            <span>{value}</span>
            <button onClick={handleClick}>UP</button>
        </div>
    )
}

function AppV2() {
    return (
        <div>
            <IncrementButton></IncrementButton>
        </div>
    );
}

export default AppV2;