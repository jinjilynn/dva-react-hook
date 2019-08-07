import React from 'react';
import useHState from '../useHState';
import useDispatcher from '../useDispatcher';
import store from '../store';

export default function useAdd(name, initdate, once){
    if(typeof name !== 'string'){
      throw new Error('name must be a string')
    }
    if(name.length === 0){
      throw new Error('name can not be empty')
    }
    useHState();
    const dispatch = useDispatcher()
    if (store.runtime_state === undefined || dispatch === undefined) {
      throw new Error('useAdd must be used within a Provider')
    }
    if(store.runtime_state.hasOwnProperty(name)){
      console.warn(`you have already added the state name -- ${name}  before !`)
    }
    let data = initdate;
    if(typeof initdate === 'function'){
      data = initdate();
    }
    React.useEffect(() => {
      dispatch({type:'add',name,initdate:data,inner:store.inner});
    },once ? [] : undefined)
  }