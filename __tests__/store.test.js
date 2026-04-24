import { generateStore, getStoreByKey, setStoreByKey } from '../src/store';

describe('store', () => {
  test('generateStore creates expected runtime fields', () => {
    const store = generateStore();

    expect(store.runtime_state).toEqual({});
    expect(store.dispatch_queue).toEqual([]);
    expect(store.dispatchPromise).toBeNull();
    expect(typeof store.inner).toBe('symbol');
  });

  test('getStoreByKey returns and clears the module-level cache', () => {
    const key = 'unit';
    const value = { x: 1 };
    setStoreByKey(key, value);

    const picked = getStoreByKey(key);

    expect(picked).toBe(value);
    // second read should have been cleared by the first getStoreByKey call
    expect(getStoreByKey(key)).toBeUndefined();
  });
});
