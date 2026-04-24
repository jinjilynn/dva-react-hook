import React from 'react';
import * as localForage from 'localforage';
import { nanoid } from 'nanoid';
import { mergeWith } from 'lodash-es';
import store, {
  generateStore,
  getStoreByKey,
  setStoreByKey,
  deleteStoreByKey,
} from '../store';
import reducer from '../reducer';
import initStore from '../utils/redux';
import { registeModel } from '../dynamic';

function generateContext(key, componentKey, isolated) {
  const Context = React.createContext();
  let nearestStore = getStoreByKey(key);
  if (!nearestStore) {
    nearestStore = generateStore();
  }
  if (!isolated) {
    store.push({ uid: componentKey, context: Context });
  }
  return [nearestStore, Context];
}

function Provider({
  isolated = false,
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
  React.useEffect(() => {
    const uid = nanoid();
    const _key = (uniqueKey && uniqueKey.toString()) || 'default';
    const componentKey = `${_key}_${uid}`;
    const [_store, _Context] = generateContext(_key, componentKey, isolated);
    let unmounted = false;
    _store.offline = offlineConfig.offline === true;
    _store.offlineExcludes = offlineConfig.excludes || [];
    _store.noCached = noCached === true;
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
    const mountStore = () => {
      if (unmounted) {
        return;
      }
      !isolated && setStoreByKey(_key, _store);
      setCombinedWithStore({ com: _Context.Provider, store: _store });
    };
    const recover = async () => {
      await _init();
      if (unmounted) return;
      try {
        await _store.offlineInstance.iterate((value, key) => {
          const _v = mergeWith(
            _store.runtime_state[key] || {},
            value,
            customizer,
          );
          _store.runtime_state[key] = _v;
        });
        if (unmounted) return;
        mountStore();
      } catch (err) {
        console.error(`recover from offline database failed:${err}`);
      }
    };
    const notrecover = async () => {
      await _init();
      if (unmounted) return;
      mountStore();
    };
    if (offlineConfig.autoRecover === true) {
      recover();
    } else {
      notrecover();
    }
    return () => {
      unmounted = true;
      const storeIndex = store.findIndex((item) => item.uid === componentKey);
      if (storeIndex !== -1) {
        store.splice(storeIndex, 1);
      }
      !isolated && noCached === true && deleteStoreByKey(_key);
      // Clear any pending debounce timers/state-diff maps so they don't fire
      // against an unmounted Provider and hold references after teardown.
      if (_store.debounceTimers) {
        _store.debounceTimers.forEach((timer) => clearTimeout(timer));
        _store.debounceTimers.clear();
      }
      _store.previousStateMap && _store.previousStateMap.clear();
      _store.currentStateMap && _store.currentStateMap.clear();
      setCombinedWithStore({ com: null, store: null });
      _store.offlineInstance.dropInstance();
    };
  }, [isolated, noCached, uniqueKey]);
  return combinedWithStore.com ? (
    <combinedWithStore.com value={combinedWithStore.store}>
      {children}
    </combinedWithStore.com>
  ) : null;
}

export default Provider;
