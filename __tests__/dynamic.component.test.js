import React from 'react';
import Dynamic from '../src/dynamic';
import { useNearestStore } from '../src/store';

jest.mock('../src/store', () => ({
  useNearestStore: jest.fn(),
}));

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('Dynamic', () => {
  let setMount;

  beforeEach(() => {
    jest.clearAllMocks();
    setMount = jest.fn();
    jest
      .spyOn(React, 'useState')
      .mockReturnValue([{ loaded: false }, setMount]);
    jest.spyOn(React, 'useEffect').mockImplementation((effect) => effect());
  });

  afterEach(() => {
    React.useState.mockRestore();
    React.useEffect.mockRestore();
  });

  test('throws when there is no nearest store', () => {
    useNearestStore.mockReturnValue(undefined);

    expect(() =>
      Dynamic({
        component: async () => ({ default: () => null }),
      }),
    ).toThrow('there is no store in dynamic');
  });

  test('loads models and marks component as loaded after registration', async () => {
    const store = {
      MODELS: {},
      runtime_state: {},
      noCached: false,
      inner: Symbol('inner'),
      dispatch: jest.fn().mockResolvedValue(undefined),
    };
    const renderBefore = jest.fn();

    useNearestStore.mockReturnValue(store);

    Dynamic({
      models: [{ name: 'user', init: { age: 18 } }],
      renderBefore,
      component: async () => ({ default: () => null }),
    });

    await flushPromises();
    await flushPromises();

    expect(renderBefore).toHaveBeenCalledTimes(1);
    expect(store.MODELS.user).toEqual({ name: 'user', init: { age: 18 } });
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'add',
        name: 'user',
        data: { age: 18 },
      }),
    );
    expect(setMount).toHaveBeenCalledWith({ loaded: true });
  });
});
