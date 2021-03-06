import React from 'react';
import { get, execBack } from '../utils';

const store = {};

function generateStore(key) {
   if (!window[key]) {
      const inner = Symbol();
      const MODELS = {};
      const REFRESH_CACHE = {};
      const isDispatching = {
         dispatching: false,
         name: null
      };
      const dispatch_queue = {

      };
      let runtime_state = undefined;
      let REDUCER;
      let dispatch;
      window[key] = {
         dispatch,
         inner,
         MODELS,
         REFRESH_CACHE,
         REDUCER,
         isDispatching,
         runtime_state,
         dispatch_queue,
         get,
         execBack
      };
   };
   return window[key];
}

export function setStoreByKey(key) {
   return generateStore(`dva_react_hook_store_${key.toString()}`);
}

export function getStoreByKey(key) {
   return window[`dva_react_hook_store_${key.toString()}`];
}

export function useNearestStore() {
   let _nearst_state;
   const _store_values = Object.values(store).reverse();
   for (let i = 0; i < _store_values.length; i += 1) {
      const _item = React.useContext(_store_values[i]);
      if (_item) {
         _nearst_state = _item;
         break;
      }
   }
   return _nearst_state;
}

export default store;
