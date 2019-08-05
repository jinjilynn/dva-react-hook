import React from 'react';
import { useModel, useDispatch } from 'dva-react-hook';

export default function Counter(){
    const [ { value: name } ] = useModel('name');
    const [ { value: count }, setCount ] = useModel('apples/count');
    const login = useDispatch({type:'login/login'})

    const eat = () => {
        setCount(count - 1)
    }
    const loginclick = () => {
        login({name:'lynn',pass:'123456'}).then(data => {
            console.log(data)
        })
    }

    return <div>
        <div><span> { name } has { count } apples</span></div>
        <div><button onClick={eat}>Eat One</button></div>
        <div><button onClick={loginclick}>login</button></div>
    </div>    
}