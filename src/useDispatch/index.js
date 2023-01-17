
import { useNearestStore } from '../store';
import { get, execBack } from '../utils';
import clone from 'clone';

export default function useDispatch(action) {
   const store = useNearestStore();
   if (!store) {
      throw new Error('strange!! there is no store in useDispatch, please issue it.');
   }
   if (Object.prototype.toString.call(action) !== '[object Object]') {
      throw new Error('action in useDispatch must be an Object');
   }
   if (!action.hasOwnProperty('type')) {
      throw new Error('action in useDispatch must have a property named "type"');
   }
   if (typeof action.type !== 'string') {
      throw new Error('your must be a string');
   }
   if (action.type.indexOf('/') === -1) {
      throw new Error('you must do some effects in your type');
   }

   let { type, ...others } = action;
   type = type.split('/');
   if (type[0].length === 0) {
      throw new Error('can not resolve the empty model name');
   }
   const model = store.MODELS[type[0]];
   if (!model) {
      throw new Error(`can not find the Model named ${type[0]}`);
   }
   if (!model.hasOwnProperty('effects')) {
      throw new Error(`can not find the effects in the Model ${type[0]}`);
   }
   const effects = model.effects;
   if (Object.prototype.toString.call(effects) !== '[object Object]') {
      throw new Error('effects must be an Object');
   }
   let effect = effects[type[1]];
   if (typeof effect !== 'function') {
      throw new Error(`the effect named ${type[1]} must be a function`);
   }

   const modelbacks = model.callbacks;

   const effectwrapped = async (...rest) => {
      return effect(...rest, {
         ...others, state: clone(store.runtime_state[type[0]], true), setState: (data, { cancelUpdate, callbacks } = {}) => {
            store.dispatch({ type: 'set', name: type[0], data, cancelUpdate });
            if (callbacks) {
               const value = clone(store.runtime_state[type[0]], true);
               execBack(modelbacks, callbacks, value);
            }
         },
         select: (name) => {
            return get(name, store);
         }
      });
   }
   return effectwrapped;
}