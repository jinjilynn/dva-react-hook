import React from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { nanoid } from 'nanoid';
import { get } from '../utils';
import { useNearestStore } from '../store';

const NOOP_UNSUBSCRIBE = () => {};
const ZERO_SNAPSHOT = () => 0;

export default function useReference(name, cancelupdate, options = {}) {
  const _store = options.store || useNearestStore();
  if (!_store) {
    throw new Error(
      'odd!! there is no store in useReference, please issue it.',
    );
  }
  if (typeof name !== 'string') {
    throw new Error("useReference's name must be string");
  }

  const entryRef = React.useRef(null);
  if (entryRef.current === null) {
    entryRef.current = { _s: name, version: 0, listener: null };
  } else {
    entryRef.current._s = name;
  }

  const subscribe = React.useCallback(
    (onStoreChange) => {
      if (cancelupdate) return NOOP_UNSUBSCRIBE;
      const entry = entryRef.current;
      entry.listener = onStoreChange;
      const uid = nanoid();
      _store.REFRESH_CACHE[uid] = entry;
      return () => {
        entry.listener = null;
        delete _store.REFRESH_CACHE[uid];
      };
    },
    [_store, cancelupdate, name],
  );

  const getSnapshot = React.useCallback(
    () => (cancelupdate ? 0 : entryRef.current.version),
    [cancelupdate],
  );

  useSyncExternalStore(
    subscribe,
    getSnapshot,
    cancelupdate ? ZERO_SNAPSHOT : getSnapshot,
  );

  options.referenced = true;
  const [value, setValue] = get(name, _store, options);
  return [value, setValue];
}
