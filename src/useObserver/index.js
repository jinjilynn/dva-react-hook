import React from 'react';
import { nanoid } from 'nanoid';
import { useNearestStore } from '../store';

export default function useObserver(path, callback, dependencies = [], _store) {
  const store = _store || useNearestStore();
  if (!store) {
    throw new Error('odd!! there is no store in useModel, please issue it.');
  }
  if (typeof callback !== 'function') {
    throw new Error("useChange's argument must be a function");
  }
  React.useEffect(() => {
    const uid = nanoid();
    if (!store.observerSubscribes[path]) {
      store.observerSubscribes[path] = {};
    }
    store.observerSubscribes[path][uid] = callback;
    return () => {
      delete store.observerSubscribes[path][uid];
      if (Object.keys(store.observerSubscribes[path]).length === 0) {
        delete store.observerSubscribes[path];
      }
    };
  }, [path, store, ...dependencies]);
}
