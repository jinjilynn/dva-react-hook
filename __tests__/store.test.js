import { generateStore, getStoreByKey, identifier } from '../src/store';

describe('store', () => {
  test('generateStore creates expected runtime fields', () => {
    const store = generateStore();

    expect(store.runtime_state).toEqual({});
    expect(store.dispatch_queue).toEqual([]);
    expect(store.dispatchPromise).toBeNull();
    expect(typeof store.inner).toBe('symbol');
  });

  test('getStoreByKey returns and clears global cache', () => {
    const key = 'unit';
    const value = { x: 1 };
    window[`${identifier}${key}`] = value;

    const picked = getStoreByKey(key);

    expect(picked).toBe(value);
    expect(window[`${identifier}${key}`]).toBeUndefined();
  });
});
