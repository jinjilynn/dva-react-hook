import React from 'react';
import useHState from '../useHState';
import useDispatcher from '../useDispatcher';
import { get } from '../utils';
import store from '../store';

function removeConnect(uid){
    delete store.REFRESH_CACHE[uid];
}

export default function useModel(name, update){
    if(typeof name !== 'string'){
      throw new Error('useModel\'s argument must be a string')
    }
    useHState();
    const [state, setState] = React.useState(Math.random());
    React.useEffect(() => {
      const uid = `$$track_uid${Math.random().toString().replace(/./,'')}`
      !update && (store.REFRESH_CACHE[uid] = {_s:name,set:setState});
      return () => {
        !update && removeConnect(uid);
      }
    },[])
    const dispatch = useDispatcher()
    return get(name,dispatch);
}