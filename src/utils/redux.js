function loop_dispatch(store) {
  if (store.loopRunning) return;
  store.loopRunning = true;

  while (store.dispatch_queue.length > 0) {
    const action = store.dispatch_queue.shift();
    if (action) {
      store.REDUCER(action);
    }
  }
  store.loopRunning = false;
}

function dispatch(action) {
  const store = this;

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

  store.dispatch_queue.push(action);

  if (!store.loopRunning) {
    loop_dispatch(store);
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
  store.loopRunning = false;
  if (typeof preloadedState !== "undefined") {
    initfun.call(store, preloadedState);
  }
  return [store.runtime_state, store.dispatch];
}
