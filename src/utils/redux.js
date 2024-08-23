import { nanoid } from "nanoid";

async function loop_dispatch(store, uid) {
  while (store.dispatch_queue[0].uid !== uid) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  const { action } = store.dispatch_queue[0];
  if (action) {
    await store.REDUCER(action);
    store.dispatch_queue.shift();
  }
}

async function dispatch(action) {
  const store = this;
  const uid = nanoid();
  if (!store) {
    throw new Error(
      "strange!! there is no store in dispatch of utils, please issue it."
    );
  }

  if (!action) {
    throw new Error("Actions must be plain objects.");
  }

  if (typeof action.type === "undefined") {
    throw new Error('Actions may not have an undefined "type" property.');
  }

  store.dispatch_queue.push({ uid, action });

  await loop_dispatch(store, uid);
}

async function initfun($i) {
  const store = this;
  if ($i && typeof $i == "object" && !Array.isArray($i)) {
    const keys = Object.keys($i);
    if (keys.length > 0) {
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!store.runtime_state.hasOwnProperty(key))
          await store.dispatch({
            type: "add",
            name: key,
            initdate: $i[key],
            inner: store.inner,
          });
      }
    }
  }
}

export function restoreForce(state) {
  const store = this;
  if (state && typeof state == "object" && !Array.isArray(state)) {
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
  if (typeof reducer !== "function") {
    throw new Error("Expected the reducer to be a function.");
  }
  !store.REDUCER && (store.REDUCER = reducer.bind(store));
  !store.dispatch && (store.dispatch = dispatch.bind(store));
  if (typeof preloadedState !== "undefined") {
    await initfun.call(store, preloadedState);
  }
  return [store.runtime_state, store.dispatch];
}
