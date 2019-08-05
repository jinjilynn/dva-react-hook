import React from 'react';
import store from '../store';
export default function useDispatcher() {
    const dispatch = React.useContext(store.DispatchContext)
    if (dispatch === undefined) {
      throw new Error('useDispatcher must be used within a Provider')
    }
    return dispatch
   }