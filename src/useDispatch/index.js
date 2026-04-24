import { useNearestStore } from '../store';
import { get, execBack } from '../utils';
import clone from '../clone';
import { _split } from '../reducer';

function validateAction(action) {
  if (Object.prototype.toString.call(action) !== '[object Object]') {
    throw new Error('action in useDispatch must be an Object');
  }
  if (!action.hasOwnProperty('type')) {
    throw new Error('action in useDispatch must have a property named "type"');
  }
  if (typeof action.type !== 'string') {
    throw new Error('your must be a string');
  }
  if (action.type.indexOf(_split) === -1) {
    throw new Error('you must do some effects in your type');
  }
}

// Pure factory that builds the wrapped effect function for a given action
// bound to a specific store. It performs no React Hook calls, so it can be
// invoked safely from anywhere (including inside callbacks / effects / other
// effect helpers such as `getDispatch`).
export function makeDispatcher(action, store) {
  validateAction(action);
  if (!store) {
    throw new Error('odd!! there is no store in useDispatch, please issue it.');
  }
  action.store = store;
  let { type, ...others } = action;
  type = type.split(_split);
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

  const effectwrapped = (...rest) => {
    const clonedValue = clone(store.runtime_state[type[0]]);
    return effect(...rest, {
      ...others,
      state: clonedValue,
      setState: async (data, { cancelUpdate, callbacks, referenced } = {}) => {
        await store.dispatch({
          type: 'modify',
          name: type[0],
          inner: store.inner,
          data,
          cancelUpdate,
          referenced,
        });
        if (callbacks) {
          const value = clonedValue;
          execBack(modelbacks, callbacks, { name: type[0], value }, store);
        }
      },
      select: (name, options) => {
        return get(name, store, options);
      },
      reference: (name, options = {}) => {
        return get(name, store, { ...options, referenced: true });
      },
      // `getDispatch` previously called `useDispatch` recursively, which is a
      // Rules-of-Hooks violation when invoked from an effect/callback. Use the
      // pure factory directly so no Hook is called.
      getDispatch: (nextAction) => {
        return makeDispatcher({ ...nextAction }, store);
      },
      offlineInstance: store.offlineInstance,
    });
  };
  return effectwrapped;
}

export default function useDispatch(action) {
  // Validate up-front so we can throw before any Hook is called on invalid
  // input. `makeDispatcher` re-validates but keeping this cheap check here
  // keeps error messages identical to the historical behaviour.
  validateAction(action);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const store = action.store || useNearestStore();
  return makeDispatcher(action, store);
}
