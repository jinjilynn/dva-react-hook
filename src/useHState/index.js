import React from 'react';
import store from '../store';

function useHState(){
    const state = React.useContext(store.StateContext);
    if (state === undefined) {
      throw new Error('useHState hook must be used within a Provider');
    }
    !store.runtime_state && (store.runtime_state = state);
    //return store.runtime_state;
  }

  export default useHState;