import React, {CSSProperties, useState} from "react";

export interface MyButtonProps {
    title: string;
}

function MyButtonWrapper({children}: { readonly children: React.ReactElement }) {
    return (
        <>
            {children}
        </>
    );
}

const Title = ({title, style}: { title: string, style: CSSProperties }) => {
    return (
        <h2 style={style}>{title}</h2>
    )
}

const MyButton = ({title}: MyButtonProps) => {
    const styleAsObject: CSSProperties = {
        color: 'red'
    }
    return (
        <MyButtonWrapper>
            {<Title title={'HI'} key={1} style={styleAsObject}/>}
        </MyButtonWrapper>
    );
}

export default MyButton;

