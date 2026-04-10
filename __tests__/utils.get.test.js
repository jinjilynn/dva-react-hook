import { get } from '../src/utils';

describe('utils.get', () => {
  function createStore(state) {
    return {
      runtime_state: state,
      inner: Symbol('inner'),
      dispatch: jest.fn().mockResolvedValue(undefined),
      MODELS: {},
      offline: false,
      offlineExcludes: [],
      offlineInstance: {
        setItem: jest.fn().mockResolvedValue(undefined),
      },
    };
  }

  test('returns cloned state by default', () => {
    const store = createStore({ user: { age: 18 } });
    const [value] = get('user', store);

    value.age = 30;
    expect(store.runtime_state.user.age).toBe(18);
  });

  test('returns referenced state when referenced=true', () => {
    const store = createStore({ user: { age: 18 } });
    const [value] = get('user', store, { referenced: true });

    value.age = 30;
    expect(store.runtime_state.user.age).toBe(30);
  });

  test('setter dispatches modify action', async () => {
    const store = createStore({ user: { age: 18 } });
    const [, setValue] = get('user', store);

    await setValue({ age: 20 }, { cancelUpdate: true });

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'modify',
        name: 'user',
        data: { age: 20 },
        cancelUpdate: true,
      }),
    );
  });

  test('autoCreate creates nested path with defaultValue', () => {
    const store = createStore({ user: {} });
    const [value] = get('user/profile/name', store, {
      autoCreate: true,
      defaultValue: 'Lynn',
    });

    expect(value).toBe('Lynn');
    expect(store.runtime_state.user.profile.name).toBe('Lynn');
  });

  test('throws when traversing non-object without autoCreate', () => {
    const store = createStore({ user: 1 });

    expect(() => get('user/name', store)).toThrow('cannot be reached');
  });
});
