import React from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { nanoid } from 'nanoid';
import { get } from '../utils';
import { useNearestStore } from '../store';
import { isEqual } from 'lodash-es';

const NOOP_UNSUBSCRIBE = () => {};
const ZERO_SNAPSHOT = () => 0;

export default function useModel(name, cancelupdate, _store, options) {
  const store = _store || useNearestStore();
  if (!store) {
    throw new Error('odd!! there is no store in useModel, please issue it.');
  }
  if (typeof name !== 'string') {
    throw new Error("useModel's argument must be a string");
  }

  // Per-hook-instance entry shared with the store's REFRESH_CACHE. `_s` is
  // kept in sync with the latest `name` so the reducer's prefix match sees the
  // current subscription path. `version` is bumped by the reducer whenever a
  // relevant path changes, which is what powers useSyncExternalStore.
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
      store.REFRESH_CACHE[uid] = entry;
      return () => {
        entry.listener = null;
        delete store.REFRESH_CACHE[uid];
      };
    },
    [store, cancelupdate, name],
  );

  const getSnapshot = React.useCallback(
    () => (cancelupdate ? 0 : entryRef.current.version),
    [cancelupdate],
  );

  // Subscribe for tear-free re-renders. Server snapshot returns a stable 0.
  useSyncExternalStore(
    subscribe,
    getSnapshot,
    cancelupdate ? ZERO_SNAPSHOT : getSnapshot,
  );

  const valueref = React.useRef();
  const [value, setValue, getlatest] = get(name, store, options);
  if (!isEqual(valueref.current, value)) {
    valueref.current = value;
  }
  return [valueref.current, setValue, getlatest];
}
