import useDispatch from '../src/useDispatch';

describe('useDispatch', () => {
  function createStore() {
    return {
      MODELS: {},
      runtime_state: {
        user: { count: 1 },
      },
      inner: Symbol('inner'),
      dispatch: jest.fn().mockResolvedValue(undefined),
      offlineInstance: {},
    };
  }

  test('validates action parameter', () => {
    expect(() => useDispatch(null)).toThrow('must be an Object');
    expect(() => useDispatch({})).toThrow('must have a property named');
    expect(() => useDispatch({ type: 1 })).toThrow('must be a string');
    expect(() => useDispatch({ type: 'invalid' })).toThrow(
      'must do some effects',
    );
  });

  test('wraps effect and injects helpers', async () => {
    const store = createStore();
    const callback = jest.fn();

    const effect = jest.fn(async (_payload, helpers) => {
      await helpers.setState({ count: 3 }, { callbacks: 'after' });
      return helpers.select('user')[0].count;
    });

    store.MODELS.user = {
      effects: { run: effect },
      callbacks: {
        after: callback,
      },
    };

    const run = useDispatch({ type: 'user/run', store, extra: 1 });
    const result = await run({ any: true });

    expect(result).toBe(1);
    expect(effect).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'modify',
        name: 'user',
        data: { count: 3 },
      }),
    );
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('throws when target model/effect is missing', () => {
    const store = createStore();

    expect(() => useDispatch({ type: 'missing/run', store })).toThrow(
      'can not find the Model',
    );

    store.MODELS.user = { effects: {} };
    expect(() => useDispatch({ type: 'user/run', store })).toThrow(
      'must be a function',
    );
  });
});
