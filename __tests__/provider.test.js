import React from 'react';
import * as localForage from 'localforage';
import Provider from '../src/provider';
import initStore from '../src/utils/redux';
import { registeModel } from '../src/dynamic';
import mountedStores, {
  generateStore,
  getStoreByKey,
  identifier,
} from '../src/store';

jest.mock('localforage', () => ({
  createInstance: jest.fn(),
  dropInstance: jest.fn(),
}));

jest.mock('../src/utils/redux', () => jest.fn());

jest.mock('../src/dynamic', () => ({
  registeModel: jest.fn(),
}));

jest.mock('../src/store', () => ({
  __esModule: true,
  default: [],
  generateStore: jest.fn(),
  getStoreByKey: jest.fn(),
  identifier: 'dva_react_hook_store_',
}));

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('Provider', () => {
  let cleanup;
  let setCombinedWithStore;
  let store;
  let offlineInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mountedStores.length = 0;
    cleanup = undefined;
    setCombinedWithStore = jest.fn();
    store = {
      MODELS: {},
      REFRESH_CACHE: {},
      runtime_state: {},
      dispatch_queue: [],
      dispatchPromise: null,
      changeSubscribes: {},
      observerSubscribes: {},
      debounceTimers: new Map(),
      previousStateMap: new Map(),
      currentStateMap: new Map(),
      onChangeOtherProps: {},
      isDispatching: { dispatching: false, name: null },
      inner: Symbol('inner'),
    };
    offlineInstance = {
      dropInstance: jest.fn().mockResolvedValue(undefined),
      iterate: jest.fn().mockResolvedValue(undefined),
      keys: jest.fn().mockResolvedValue([]),
      setItem: jest.fn().mockResolvedValue(undefined),
    };

    generateStore.mockReturnValue(store);
    getStoreByKey.mockReturnValue(undefined);
    localForage.createInstance.mockReturnValue(offlineInstance);
    initStore.mockResolvedValue([store.runtime_state, jest.fn()]);
    registeModel.mockResolvedValue(undefined);

    jest
      .spyOn(React, 'useState')
      .mockReturnValue([{ store: null }, setCombinedWithStore]);
    jest.spyOn(React, 'useEffect').mockImplementation((effect) => {
      cleanup = effect();
    });
  });

  afterEach(() => {
    React.useState.mockRestore();
    React.useEffect.mockRestore();
    mountedStores.length = 0;
    delete window[`${identifier}demo`];
  });

  test('initializes store and registers models before mount', async () => {
    Provider({
      uniqueKey: 'demo',
      models: [{ name: 'user' }],
      count: 1,
      children: null,
    });

    await flushPromises();
    await flushPromises();

    expect(initStore).toHaveBeenCalledWith(
      expect.any(Function),
      { count: 1 },
      store,
    );
    expect(registeModel).toHaveBeenCalledWith({ name: 'user' }, store);
    expect(window[`${identifier}demo`]).toBe(store);
    expect(mountedStores).toHaveLength(1);
    expect(mountedStores[0]).toEqual(
      expect.objectContaining({ uid: expect.stringMatching(/^demo_/) }),
    );
    expect(setCombinedWithStore).toHaveBeenCalledWith(
      expect.objectContaining({ com: expect.anything(), store }),
    );
  });

  test('autoRecover restores offline state before mount', async () => {
    store.runtime_state.demo = { name: 'cached' };
    offlineInstance.iterate.mockImplementation(async (iterator) => {
      iterator({ age: 18 }, 'demo');
    });

    Provider({
      uniqueKey: 'demo',
      offlineConfig: { autoRecover: true },
      children: null,
    });

    await flushPromises();
    await flushPromises();

    expect(offlineInstance.iterate).toHaveBeenCalledTimes(1);
    expect(store.runtime_state.demo).toEqual({ name: 'cached', age: 18 });
    expect(setCombinedWithStore).toHaveBeenCalledWith(
      expect.objectContaining({ com: expect.anything(), store }),
    );
  });

  test('cleanup removes cache when noCached=true and drops offline db', async () => {
    Provider({ uniqueKey: 'demo', noCached: true, children: null });

    await flushPromises();
    await flushPromises();
    cleanup();

    expect(window[`${identifier}demo`]).toBeUndefined();
    expect(offlineInstance.dropInstance).toHaveBeenCalledTimes(1);
    expect(mountedStores).toHaveLength(0);
    expect(setCombinedWithStore).toHaveBeenLastCalledWith({
      com: null,
      store: null,
    });
  });
});
