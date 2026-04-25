import React from 'react';
import { useSyncExternalStore as mockedUseSyncExternalStore } from 'use-sync-external-store/shim';
import useModel from '../src/useModel';
import useReference from '../src/useReference';
import StoreContext, { useNearestStore } from '../src/store';
import { get } from '../src/utils';

jest.mock('use-sync-external-store/shim', () => ({
  useSyncExternalStore: jest.fn(),
}));

jest.mock('../src/utils', () => ({
  get: jest.fn(),
}));

jest.mock('../src/store', () => {
  const actual = jest.requireActual('../src/store');
  return {
    ...actual,
    useNearestStore: jest.fn(),
  };
});

describe('useModel / useReference / useNearestStore', () => {
  let cleanupFn;

  beforeEach(() => {
    jest.clearAllMocks();
    cleanupFn = undefined;
    mockedUseSyncExternalStore.mockImplementation((subscribe, getSnapshot) => {
      cleanupFn = subscribe(() => {});
      return getSnapshot();
    });
    jest
      .spyOn(React, 'useRef')
      .mockImplementation((initial) => ({ current: initial }));
    jest.spyOn(React, 'useCallback').mockImplementation((fn) => fn);
  });

  afterEach(() => {
    React.useRef.mockRestore();
    React.useCallback.mockRestore();
  });

  test('useModel reads from nearest store and registers a REFRESH_CACHE listener', () => {
    const store = { REFRESH_CACHE: {} };
    const setter = jest.fn();
    const latest = jest.fn();
    const value = { count: 1 };

    useNearestStore.mockReturnValue(store);
    get.mockReturnValue([value, setter, latest]);

    const result = useModel('user');

    expect(result).toEqual([value, setter, latest]);
    expect(get).toHaveBeenCalledWith('user', store, undefined);
    const key = Object.keys(store.REFRESH_CACHE)[0];
    expect(store.REFRESH_CACHE[key]).toEqual(
      expect.objectContaining({
        _s: 'user',
        version: 0,
        listener: expect.any(Function),
      }),
    );

    cleanupFn();
    expect(Object.keys(store.REFRESH_CACHE)).toHaveLength(0);
  });

  test('useModel skips REFRESH_CACHE when cancelupdate=true', () => {
    const store = { REFRESH_CACHE: {} };
    const setter = jest.fn();
    const latest = jest.fn();

    useNearestStore.mockReturnValue(store);
    get.mockReturnValue([{ count: 1 }, setter, latest]);

    useModel('user', true);

    expect(store.REFRESH_CACHE).toEqual({});
  });

  test('useReference forces referenced mode and returns value/setter', () => {
    const store = { REFRESH_CACHE: {} };
    const setter = jest.fn();
    const options = { store };

    get.mockReturnValue([{ count: 2 }, setter]);

    const result = useReference('user', false, options);

    expect(result).toEqual([{ count: 2 }, setter]);
    expect(get).toHaveBeenCalledWith(
      'user',
      store,
      expect.objectContaining({ store, referenced: true }),
    );
    const key = Object.keys(store.REFRESH_CACHE)[0];
    expect(store.REFRESH_CACHE[key]).toEqual(
      expect.objectContaining({
        _s: 'user',
        version: 0,
        listener: expect.any(Function),
      }),
    );

    cleanupFn();
    expect(Object.keys(store.REFRESH_CACHE)).toHaveLength(0);
  });

  test('useNearestStore returns the first truthy context value', () => {
    const actualStoreModule = jest.requireActual('../src/store');
    const actualMountedStores = actualStoreModule.default;
    const actualUseNearestStore = actualStoreModule.useNearestStore;
    const store = { id: 1 };
    const useContextSpy = jest
      .spyOn(React, 'useContext')
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(store);

    actualMountedStores.length = 0;
    actualMountedStores.push({ uid: 'first', context: { name: 'first' } });
    actualMountedStores.push({ uid: 'second', context: { name: 'second' } });

    expect(actualUseNearestStore()).toBe(store);
    expect(useContextSpy).toHaveBeenNthCalledWith(1, { name: 'first' });
    expect(useContextSpy).toHaveBeenNthCalledWith(2, { name: 'second' });

    actualMountedStores.length = 0;

    useContextSpy.mockRestore();
  });
});
