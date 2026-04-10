import { registeModel } from '../src/dynamic';

describe('registeModel', () => {
  function createStore(overrides = {}) {
    return {
      MODELS: {},
      runtime_state: {},
      noCached: false,
      inner: Symbol('inner'),
      dispatch: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    };
  }

  test('validates model shape', async () => {
    const store = createStore();

    await expect(registeModel(null, store)).rejects.toThrow(
      'must be an object',
    );
    await expect(registeModel({}, store)).rejects.toThrow(
      'please name your model',
    );
    await expect(registeModel({ name: '' }, store)).rejects.toThrow(
      'name can not be empty',
    );
    await expect(registeModel({ name: 1 }, store)).rejects.toThrow(
      'name is a string',
    );
    await expect(registeModel({ name: 'a' }, null)).rejects.toThrow(
      'there is no store',
    );
  });

  test('registers model and dispatches add with init object', async () => {
    const store = createStore();
    const model = { name: 'user', init: { age: 1 } };

    await registeModel(model, store);

    expect(store.MODELS.user).toBe(model);
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'add',
        name: 'user',
        data: { age: 1 },
      }),
    );
  });

  test('supports init as function', async () => {
    const store = createStore();

    await registeModel(
      {
        name: 'count',
        init: () => 2,
      },
      store,
    );

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'count', data: 2 }),
    );
  });

  test('skips add when state already exists and noCached is false', async () => {
    const store = createStore({ runtime_state: { user: { age: 2 } } });

    await registeModel({ name: 'user', init: { age: 1 } }, store);

    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
