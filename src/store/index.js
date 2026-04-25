import React from 'react';

const store = [];

export const identifier = 'dva_react_hook_store_';

// Module-scoped cache replaces the previous `window[...]` storage so that:
//   - SSR environments (no `window`) don't crash
//   - stores can't be mutated from outside the library
const storeCache = new Map();

export function setStoreByKey(key, value) {
  storeCache.set(`${identifier}${key}`, value);
}

export function deleteStoreByKey(key) {
  storeCache.delete(`${identifier}${key}`);
}

// Look up a cached store by its `uniqueKey` (the same value passed to
// <Provider uniqueKey="..." />). Unlike `getStoreByKey`, this does NOT remove
// the entry from the cache, so it is safe to call from application code that
// just wants read/dispatch access to an existing store.
export function getStoreByUniqueKey(uniqueKey) {
  const _key = (uniqueKey != null && uniqueKey.toString()) || 'default';
  return storeCache.get(`${identifier}${_key}`);
}

export function generateStore() {
  const inner = Symbol();
  const MODELS = {};
  const REFRESH_CACHE = {};
  const isDispatching = {
    dispatching: false,
    name: null,
  };
  const dispatch_queue = [];
  let dispatchPromise = null;
  let runtime_state = {};
  let REDUCER;
  let dispatch;
  let offline = false;
  let offlineInstance;
  let offlineExcludes = [];
  const changeSubscribes = {};
  const observerSubscribes = {};
  const debounceTimers = new Map();
  const previousStateMap = new Map();
  const currentStateMap = new Map();
  const onChangeOtherProps = {};
  const initstore = {
    offline,
    offlineInstance,
    offlineExcludes,
    dispatch,
    inner,
    MODELS,
    REFRESH_CACHE,
    REDUCER,
    isDispatching,
    runtime_state,
    dispatch_queue,
    dispatchPromise,
    changeSubscribes,
    observerSubscribes,
    debounceTimers,
    previousStateMap,
    currentStateMap,
    onChangeOtherProps,
  };
  return initstore;
}

export function getStoreByKey(key) {
  const cacheKey = `${identifier}${key}`;
  const prestore = storeCache.get(cacheKey);
  if (prestore) {
    storeCache.delete(cacheKey);
  }
  return prestore;
}

export function useNearestStore() {
  // Snapshot the provider list on the first render of this component so that
  // the number (and order) of React.useContext() calls stays consistent for
  // this component instance across re-renders, satisfying the Rules of Hooks.
  // Previously an early `break` + a module-level array whose length could
  // change between renders made the hook call count unstable, which can
  // trigger "Rendered more/fewer hooks than during the previous render".
  const snapshotRef = React.useRef(null);
  if (snapshotRef.current == null) {
    snapshotRef.current = store.slice();
  }
  const snapshot = snapshotRef.current;
  const values = [];
  for (let i = 0; i < snapshot.length; i += 1) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    values.push(React.useContext(snapshot[i].context));
  }
  for (let i = 0; i < values.length; i += 1) {
    if (values[i]) return values[i];
  }
  return undefined;
}

export default store;
