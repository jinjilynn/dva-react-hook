import { getPathArray, checkPrefixRelation } from '../src/reducer';

describe('reducer helpers', () => {
  test('getPathArray trims trailing split and caches result', () => {
    const first = getPathArray('a/b/');
    const second = getPathArray('a/b');

    expect(first).toEqual(['a', 'b']);
    expect(second).toBe(first);
  });

  test('checkPrefixRelation identifies prefix relation', () => {
    expect(checkPrefixRelation(['a'], ['a', 'b'])).toBe(true);
    expect(checkPrefixRelation(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(checkPrefixRelation(['a', 'c'], ['a', 'b'])).toBe(false);
    expect(checkPrefixRelation(['a', 'b', 'c'], ['a', 'b'])).toBe(false);
  });
});
