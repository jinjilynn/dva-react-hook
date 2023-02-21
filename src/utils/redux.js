import { nanoid } from "nanoid";

async function loop_dispatch(store) {
  while (true) {
    if (!store.isDispatching.dispatching) {
      store.isDispatching.dispatching = true;
      const keys = Object.keys(store.dispatch_queue);
      if (keys.length > 0) {
        let it = keys[0];
        store.isDispatching.name = it.split("_")[0].split("/")[0];
        await store.REDUCER(store.dispatch_queue[it]);
        delete store.dispatch_queue[it];
      }
      store.isDispatching.dispatching = false;
      store.isDispatching.name = null;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }
}

function dispatch(action) {
  const store = this;
  if (!store) {
    throw new Error(
      "strange!! there is no store in dispatch of utils, please issue it."
    );
  }
  if (!action) {
    throw new Error("Actions must be plain objects. ");
  }

  if (typeof action.type === "undefined") {
    throw new Error('Actions may not have an undefined "type" property.');
  }

  if (store.isDispatching.dispatching) {
    action.temp_id = `${action.name}_${nanoid()}`;
    store.dispatch_queue[action.temp_id] = action;
  }

  try {
    store.isDispatching.dispatching = true;
    store.isDispatching.name = action.name.split("/")[0];
    store.REDUCER(action);
  } finally {
    store.isDispatching.dispatching = false;
    store.isDispatching.name = null;
  }
}

function initfun($i) {
  const store = this;
  if ($i && typeof $i == "object" && !Array.isArray($i)) {
    const keys = Object.keys($i);
    if (keys.length > 0) {
      keys.forEach((key) => {
        if (!store.runtime_state.hasOwnProperty(key))
          store.dispatch({
            type: "add",
            name: key,
            initdate: $i[key],
            inner: store.inner,
          });
      });
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

export default function initStore(reducer, preloadedState, store) {
  if (typeof reducer !== "function") {
    throw new Error("Expected the reducer to be a function.");
  }
  !store.REDUCER && (store.REDUCER = reducer.bind(store));
  !store.dispatch && (store.dispatch = dispatch.bind(store));
  if (typeof preloadedState !== "undefined") {
    initfun.call(store, preloadedState);
  }
  loop_dispatch(store);
  return [store.runtime_state, store.dispatch];
}
