import React from "react";

const store = [];

export const identifier = "dva_react_hook_store_";

export function generateStore() {
  const inner = Symbol();
  const MODELS = {};
  const REFRESH_CACHE = {};
  const isDispatching = {
    dispatching: false,
    name: null,
  };
  const dispatch_queue = [];
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
  const prestore = window[`${identifier}${key}`];
  if (prestore) {
    delete window[`${identifier}${key}`];
  }
  return prestore;
}

export function useNearestStore() {
  let _nearst_state;
  for (let i = 0; i < store.length; i += 1) {
    const _item = React.useContext(store[i].context);
    if (_item) {
      _nearst_state = _item;
      break;
    }
  }
  return _nearst_state;
}

export default store;
