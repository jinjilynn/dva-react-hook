import { generateStore } from '../src/store';
import reducer from '../src/reducer';
import initStore from '../src/utils/redux';

if (typeof global.Worker === 'undefined') {
  global.Worker = class Worker {};
}
if (typeof global.Node === 'undefined') {
  global.Node = class Node {};
}
if (typeof global.Event === 'undefined') {
  global.Event = class Event {};
}

function createStore() {
  const store = generateStore();
  store.offline = false;
  store.offlineInstance = {
    keys: async () => [],
    setItem: async () => {},
  };
  return store;
}

describe('core behavior locks', () => {
  test('initStore preloadedState initializes runtime state', async () => {
    const store = createStore();

    await initStore(reducer, { counter: 1 }, store);

    expect(store.runtime_state.counter).toBe(1);
  });

  test('dispatch is serialized in call order', async () => {
    const store = createStore();
    const trace = [];

    const customReducer = async (action) => {
      trace.push(`${action.type}-start`);
      if (action.type === 'first') {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      trace.push(`${action.type}-end`);
    };

    await initStore(customReducer, undefined, store);

    const first = store.dispatch({ type: 'first', name: 'first' });
    const second = store.dispatch({ type: 'second', name: 'second' });

    await Promise.all([first, second]);

    expect(trace).toEqual([
      'first-start',
      'first-end',
      'second-start',
      'second-end',
    ]);
  });

  test('observer supports multiple subscribers on same path', async () => {
    const store = createStore();
    await initStore(reducer, { a: { b: 1, c: 2 } }, store);

    const subscriber1 = jest.fn();
    const subscriber2 = jest.fn();

    // reducer currently gates observer notification behind change subscribers
    store.changeSubscribes.__test__ = () => {};
    store.observerSubscribes['a/b'] = {
      s1: subscriber1,
      s2: subscriber2,
    };

    await store.dispatch({
      type: 'modify',
      name: 'a',
      data: { b: 3, c: 2 },
      inner: store.inner,
    });

    await new Promise((resolve) => setTimeout(resolve, 360));

    expect(subscriber1).toHaveBeenCalledWith(3, 1, 'modify');
    expect(subscriber2).toHaveBeenCalledWith(3, 1, 'modify');
  });
});
