import clone from '../src/clone';

describe('clone', () => {
  test('clones plain data deeply', () => {
    const source = { a: { b: 1 }, c: [1, 2, 3] };
    const copied = clone(source);

    expect(copied).toEqual(source);
    expect(copied).not.toBe(source);
    expect(copied.a).not.toBe(source.a);
    expect(copied.c).not.toBe(source.c);
  });

  test('preserves Date type on clone and serialises when offline=true', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    const copied = clone({ date });

    expect(copied.date).toBeInstanceOf(Date);
    expect(copied.date).not.toBe(date);
    expect(copied.date.getTime()).toBe(date.getTime());

    const offlineCopy = clone({ date }, true);
    expect(offlineCopy.date).toBe(date.getTime());
  });

  test('clones typed array by value', () => {
    const typed = new Uint8Array([1, 2, 3]);
    const copied = clone({ typed });

    expect(Array.from(copied.typed)).toEqual([1, 2, 3]);
    expect(copied.typed).not.toBe(typed);
  });

  test('drops non-serializable values when offline=true', () => {
    const fn = () => 1;
    const copied = clone({ fn }, true);

    expect(copied.fn).toBeNull();
  });
});
