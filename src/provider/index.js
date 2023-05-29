import React from "react";
import * as localForage from "localforage";
import { nanoid } from "nanoid";
import store, { setStoreByKey, getStoreByKey } from "../store";
import reducer from "../reducer";
import initStore from "../utils/redux";
import { registeModel } from "../dynamic";

function generateContext(_key, _uid) {
  const Context = React.createContext();
  let _store = getStoreByKey(_key);
  if (!_store) {
    _store = setStoreByKey(_key);
  }
  store[`${_key}_${_uid}`] = Context;
  return [_store, Context];
}

function Provider({
  uniqueKey,
  models,
  offlineConfig = {},
  noCached,
  children,
  ...rest
}) {
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
    _store.offline = offlineConfig.offline === true;
    _store.offlineExcludes = offlineConfig.excludes || [];
    _store.offlineInstance = localForage.createInstance({
      name: _key,
    });
    const _init = () => {
      initStore(reducer, { ...rest }, _store);
      if (Array.isArray(models)) {
        models.forEach((_it) => {
          registeModel(_it, _store);
        });
      }
    };
    if (offlineConfig.autoRecover === true) {
      _store.offlineInstance
        .iterate((value, key) => {
          _store.runtime_state[key] = value;
        })
        .then((value) => {
          _init();
          setCombinedWithStore({ com: _Context.Provider, store: _store });
        })
        .catch((err) => {
          console.error(`recover from offline database failed:${err}`);
        });
    } else {
      _init();
      setCombinedWithStore({ com: _Context.Provider, store: _store });
    }
    return () => {
      uid_cache.current.forEach((item) => {
        delete store[item];
      });
      noCached === true && delete window[`dva_react_hook_store_${_key}`];
      localForage.dropInstance({ name: uniqueKey });
    };
  }, [uniqueKey]);
  !!combinedWithStore.com &&
    console.log(`Provider for ${uniqueKey || "default"} is rendering`);
  return (
    !!combinedWithStore.com && (
      <combinedWithStore.com value={combinedWithStore.store}>
        {children}
      </combinedWithStore.com>
    )
  );
}

export default Provider;
