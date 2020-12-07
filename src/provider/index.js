import React from 'react';
import store from '../store';
import reducer from '../reducer';
import createStore from '../utils/redux';
import { registeReducers } from '../dynamic';
function initState($i) {
  if ($i && typeof $i == 'object' && !Array.isArray($i)) {
    const keys = Object.keys($i);
    if (keys.length > 0) {
      store.runtime_state = Object.assign($i, store.runtime_state);
    }
  }
}
function Provider({ models, children, ...rest }) {
  const [state, dispatch] = createStore(reducer, { ...rest }, initState);
  if (Array.isArray(models)) {
    models.forEach(_it => {
      registeReducers(_it, dispatch);
    });
  };
  return (
    <>
      {children}
    </>
  )
}

export default Provider;