import { nanoid } from 'nanoid';

async function runDispatch(store, uid, action) {
  store.dispatch_queue.push({ uid, action });
  store.isDispatching = {
    dispatching: true,
    name: action.name || null,
  };
  try {
    await store.REDUCER(action);
  } finally {
    const queueIndex = store.dispatch_queue.findIndex(
      (item) => item.uid === uid,
    );
    if (queueIndex !== -1) {
      store.dispatch_queue.splice(queueIndex, 1);
    }
    store.isDispatching = {
      dispatching: store.dispatch_queue.length > 0,
      name: store.dispatch_queue[0]?.action?.name || null,
    };
  }
}

async function dispatch(action) {
  const store = this;
  const uid = nanoid();
  if (!store) {
    throw new Error(
      'odd!! there is no store in dispatch of utils, please issue it.',
    );
  }

  if (!action) {
    throw new Error('Actions must be plain objects.');
  }

  if (typeof action.type === 'undefined') {
    throw new Error('Actions may not have an undefined "type" property.');
  }

  const previousTask = store.dispatchPromise || Promise.resolve();
  const currentTask = previousTask
    .catch(() => {})
    .then(() => {
      return runDispatch(store, uid, action);
    });
  store.dispatchPromise = currentTask;

  try {
    await currentTask;
  } finally {
    if (store.dispatchPromise === currentTask) {
      store.dispatchPromise = null;
    }
  }
}

async function initfun($i) {
  const store = this;
  if ($i && typeof $i == 'object' && !Array.isArray($i)) {
    const keys = Object.keys($i);
    if (keys.length > 0) {
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!store.runtime_state.hasOwnProperty(key))
          await store.dispatch({
            type: 'add',
            name: key,
            data: $i[key],
            inner: store.inner,
          });
      }
    }
  }
}

export function restoreForce(state) {
  const store = this;
  if (state && typeof state == 'object' && !Array.isArray(state)) {
    const keys = Object.keys(state);
    if (keys.length > 0) {
      keys.forEach((key) => {
        store.runtime_state[key] = state[key];
        store.offline && store.offlineInstance.setItem(key, state[key]);
      });
    }
  }
}

export default async function initStore(reducer, preloadedState, store) {
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }
  !store.REDUCER && (store.REDUCER = reducer.bind(store));
  !store.dispatch && (store.dispatch = dispatch.bind(store));
  if (typeof preloadedState !== 'undefined') {
    await initfun.call(store, preloadedState);
  }
  return [store.runtime_state, store.dispatch];
}
