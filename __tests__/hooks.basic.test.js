import React from 'react';
import useAdd from '../src/useAdd';
import useChange from '../src/useChange';
import useObserver from '../src/useObserver';
import useDispatcher from '../src/useDispatcher';
import { useNearestStore } from '../src/store';

jest.mock('../src/useDispatcher');
jest.mock('../src/store', () => ({
  useNearestStore: jest.fn(),
}));

describe('basic hooks', () => {
  let cleanup;

  beforeEach(() => {
    jest.clearAllMocks();
    cleanup = undefined;
    jest.spyOn(React, 'useEffect').mockImplementation((effect) => {
      cleanup = effect();
    });
  });

  afterEach(() => {
    React.useEffect.mockRestore();
  });

  test('useAdd dispatches add action with data', () => {
    const dispatch = jest.fn();
    useDispatcher.mockReturnValue(dispatch);
    useNearestStore.mockReturnValue({
      runtime_state: {},
      inner: Symbol('inner'),
    });

    useAdd('model', 1, true);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'add', name: 'model', data: 1 }),
    );
  });

  test('useChange subscribes and unsubscribes callbacks', () => {
    const store = {
      changeSubscribes: {},
      onChangeOtherProps: {},
    };

    const cb = jest.fn();
    useChange(cb, [], { store, others: ['a/b'] });

    const subscribedKeys = Object.keys(store.changeSubscribes);
    expect(subscribedKeys.length).toBe(1);
    expect(store.onChangeOtherProps[subscribedKeys[0]]).toEqual(['a/b']);

    cleanup();

    expect(Object.keys(store.changeSubscribes)).toHaveLength(0);
    expect(Object.keys(store.onChangeOtherProps)).toHaveLength(0);
  });

  test('useObserver supports clean subscribe/unsubscribe', () => {
    const store = {
      observerSubscribes: {},
    };
    const cb = jest.fn();

    useObserver('a/b', cb, [], store);

    expect(Object.keys(store.observerSubscribes['a/b']).length).toBe(1);

    cleanup();

    expect(store.observerSubscribes['a/b']).toBeUndefined();
  });
});
