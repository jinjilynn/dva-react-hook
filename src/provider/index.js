import React from "react";
import * as localForage from "localforage";
import { nanoid } from "nanoid";
import { mergeWith } from "lodash-es";
import store, { generateStore, getStoreByKey, identifier } from "../store";
import reducer from "../reducer";
import initStore from "../utils/redux";
import { registeModel } from "../dynamic";

function generateContext(_key, _com_key) {
  const Context = React.createContext();
  let _store = getStoreByKey(_key);
  if (!_store) {
    _store = generateStore();
  }
  store[_com_key] = Context;
  return [_store, Context];
}

function Provider({
  uniqueKey,
  models,
  offlineConfig = {},
  noCached,
  children,
  changedelay = 300,
  ...rest
}) {
  const [combinedWithStore, setCombinedWithStore] = React.useState({
    com: null,
    store: null,
  });
  React.useEffect(() => {
    const _new_uid = nanoid();
    const _key = (uniqueKey && uniqueKey.toString()) || "default";
    const _com_key = `${_key}_${_new_uid}`;
    const [_store, _Context] = generateContext(_key, _com_key);
    _store.offline = offlineConfig.offline === true;
    _store.offlineExcludes = offlineConfig.excludes || [];
    const customizer = offlineConfig.customizer;
    _store.offlineInstance = localForage.createInstance({
      name: _key,
    });
    const _init = async () => {
      await initStore(reducer, { ...rest }, _store);
      if (Array.isArray(models)) {
        for (let i = 0; i < models.length; i++) {
          const _it = models[i];
          await registeModel(_it, _store);
        }
      }
    };
    const recover = async () => {
      await _init();
      _store.offlineInstance
        .iterate((value, key) => {
          const _v = mergeWith(
            _store.runtime_state[key] || {},
            value,
            customizer
          );
          _store.runtime_state[key] = _v;
          window[`${identifier}${_key}`] = _store;
        })
        .then(() => {
          setCombinedWithStore({ com: _Context.Provider, store: _store });
        })
        .catch((err) => {
          console.error(`recover from offline database failed:${err}`);
        });
    };
    const notrecover = async () => {
      await _init();
      window[`${identifier}${_key}`] = _store;
      setCombinedWithStore({ com: _Context.Provider, store: _store });
    };
    if (offlineConfig.autoRecover === true) {
      recover();
    } else {
      notrecover();
    }
    return () => {
      delete store[_com_key];
      noCached === true && delete window[`${identifier}${_key}`];
      localForage.dropInstance({ name: _key });
      setCombinedWithStore({ com: null, store: null });
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
