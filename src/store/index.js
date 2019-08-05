import React from 'react'

 const inner = Symbol();
 const StateContext = React.createContext()
 const DispatchContext = React.createContext()
 const MODELS = {};
 const REFRESH_CACHE = {};
 let runtime_state = undefined;
 const store = {
    inner,
    StateContext,
    DispatchContext,
    MODELS,
    REFRESH_CACHE,
    runtime_state
 }
 export default store;
