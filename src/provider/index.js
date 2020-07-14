import React from 'react';
import store from '../store';
import reducer from '../reducer';
import { registeReducers } from '../dynamic';
function initState($i) {
  store.runtime_state = $i;
  return $i;
}
function Provider({ models, children, ...rest }) {
  const [state, dispatch] = React.useReducer(reducer, { ...rest }, initState);
  if (Array.isArray(models)) {
    models.forEach(_it => {
      registeReducers(_it, dispatch);
    });
  }
  return (
    <store.StateContext.Provider value={state}>
      <store.DispatchContext.Provider value={dispatch}>
        {children}
      </store.DispatchContext.Provider>
    </store.StateContext.Provider>
  )
}

export default Provider;