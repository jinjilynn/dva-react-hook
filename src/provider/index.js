import React from "react";
import * as localForage from "localforage";
import { nanoid } from "nanoid";
import { mergeWith } from "lodash-es";
import store, { setStoreByKey, getStoreByKey } from "../store";
import reducer from "../reducer";
import initStore from "../utils/redux";
import { registeModel } from "../dynamic";

function generateContext(_key, _uid, nested) {
  const Context = React.createContext();
  let _store = getStoreByKey(_key);
  if (!_store) {
    _store = setStoreByKey(_key);
  }
  if (nested === true) {
    store[`${_key}_${_uid}`] = Context;
  }
  return [_store, Context];
}

function Provider({
  uniqueKey,
  nested = true,
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
    const [_store, _Context] = generateContext(_key, _new_uid, nested);
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
      setCombinedWithStore({ com: _Context.Provider, store: _store });
    };
    if (offlineConfig.autoRecover === true) {
      recover();
    } else {
      notrecover();
    }
    return () => {
      uid_cache.current.forEach((item) => {
        delete store[item];
      });
      noCached === true && delete window[`dva_react_hook_store_${_key}`];
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
