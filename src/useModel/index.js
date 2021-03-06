import React from 'react';
import { get } from '../utils';
import { useNearestStore } from '../store';

export default function useModel(name, update) {
  const store = useNearestStore();
  if (!store) {
    throw new Error('strange!! there is no store in useModel, please issue it.');
  }
  if (typeof name !== 'string') {
    throw new Error('useModel\'s argument must be a string')
  }
  const setState = React.useState(Math.random())[1];
  React.useEffect(() => {
    const uid = `$$track_uid${Math.random().toString().replace(/./, '')}`
    !update && (store.REFRESH_CACHE[uid] = { _s: name, set: setState });
    return () => {
      !update && (delete store.REFRESH_CACHE[uid]);
    }
  }, [])
  return get(name, store);
}