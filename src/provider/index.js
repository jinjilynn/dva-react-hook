import React from 'react';
import store from '../store';
import reducer from '../reducer';
function initState($i){
    store.runtime_state = undefined;
    return $i;
  }
function Provider({children,...rest}) {
    const [state, dispatch] = React.useReducer(reducer, {...rest}, initState)
    return (
      <store.StateContext.Provider value={state}>
        <store.DispatchContext.Provider value={dispatch}>
          {children}
        </store.DispatchContext.Provider>
      </store.StateContext.Provider>
    )
}

export default Provider;