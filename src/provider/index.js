import React from "react";
import { nanoid } from "nanoid";
import store, { setStoreByKey, getStoreByKey } from "../store";
import reducer from "../reducer";
import createStore from "../utils/redux";
import { registeReducers } from "../dynamic";

function generateContext(_key, _uid) {
  const Context = React.createContext();
  let _store = getStoreByKey(_key);
  if (!_store) {
    _store = setStoreByKey(_key);
  }
  store[`${_key}_${_uid}`] = Context;
  return [_store, Context];
}

function Provider({ uniqueKey, models, children, ...rest }) {
  const [combinedWithStore, setCombinedWithStore] = React.useState({
    com: null,
    store: null,
  });
  const uid_cache = React.useRef([]);
  React.useEffect(() => {
    const _new_uid = nanoid();
    const _key = (uniqueKey && uniqueKey.toString()) || "default";
    const _com_key = `${_key}_${_new_uid}`;
    uid_cache.current.push(_com_key);
    const [_store, _Context] = generateContext(_key, _new_uid);
    setCombinedWithStore({ com: _Context.Provider, store: _store });
    createStore(reducer, { ...rest }, _store);
    if (Array.isArray(models)) {
      models.forEach((_it) => {
        registeReducers(_it, _store);
      });
    }
    return () => {
      uid_cache.current.forEach((item) => {
        delete store[item];
      });
    };
  }, [uniqueKey]);
  console.log(`Provider for ${uniqueKey || "default"} is rendering`);
  return (
    combinedWithStore.com && (
      <combinedWithStore.com value={combinedWithStore.store}>
        {children}
      </combinedWithStore.com>
    )
  );
}

export default Provider;
