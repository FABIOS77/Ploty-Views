import { describe, it, expect } from 'vitest';
import {
  ok,
  err,
  isOk,
  isErr,
  mapResult,
  flatMapResult,
  unwrapOr,
  pipe,
  compose,
  map,
  filter,
  reduce,
  groupBy,
  sortBy,
} from './fp-core';

describe('Frontend Pure FP Core (fp-core.ts)', () => {
  describe('Result / Either pattern', () => {
    it('creates an Ok result and checks isOk/isErr', () => {
      const res = ok(42);
      expect(isOk(res)).toBe(true);
      expect(isErr(res)).toBe(false);
      if (isOk(res)) {
        expect(res.value).toBe(42);
      }
    });

    it('creates an Err result and checks isOk/isErr', () => {
      const res = err('Something failed');
      expect(isOk(res)).toBe(false);
      expect(isErr(res)).toBe(true);
      if (isErr(res)) {
        expect(res.error).toBe('Something failed');
      }
    });

    it('maps value over Ok result and leaves Err intact', () => {
      const okRes = ok(10);
      const mappedOk = mapResult(okRes, (x) => x * 2);
      expect(isOk(mappedOk)).toBe(true);
      expect(unwrapOr(mappedOk, 0)).toBe(20);

      const errRes = err('failure');
      const mappedErr = mapResult(errRes, (x: number) => x * 2);
      expect(isErr(mappedErr)).toBe(true);
      expect(unwrapOr(mappedErr, 99)).toBe(99);
    });

    it('flatMaps correctly over Ok and Err results', () => {
      const doubleIfPositive = (n: number) => (n > 0 ? ok(n * 2) : err('negative'));

      const r1 = flatMapResult(ok(5), doubleIfPositive);
      expect(isOk(r1)).toBe(true);
      expect(unwrapOr(r1, 0)).toBe(10);

      const r2 = flatMapResult(ok(-3), doubleIfPositive);
      expect(isErr(r2)).toBe(true);
    });
  });

  describe('pipe and compose', () => {
    it('pipes values through a series of transformations', () => {
      const add2 = (x: number) => x + 2;
      const mult3 = (x: number) => x * 3;
      const toString = (x: number) => `Val: ${x}`;

      const res = pipe(5, add2, mult3, toString);
      expect(res).toBe('Val: 21');
    });

    it('composes functions right-to-left', () => {
      const add2 = (x: number) => x + 2;
      const mult3 = (x: number) => x * 3;

      const calc = compose(add2, mult3);
      expect(calc(5)).toBe(17); // 5 * 3 = 15, + 2 = 17
    });
  });

  describe('Immutable collection utilities', () => {
    const numbers = Object.freeze([1, 2, 3, 4, 5]);

    it('map transforms items immutably', () => {
      const doubled = map((n: number) => n * 2)(numbers);
      expect(doubled).toEqual([2, 4, 6, 8, 10]);
      expect(Object.isFrozen(doubled)).toBe(true);
    });

    it('filter keeps matching items immutably', () => {
      const evens = filter((n: number) => n % 2 === 0)(numbers);
      expect(evens).toEqual([2, 4]);
      expect(Object.isFrozen(evens)).toBe(true);
    });

    it('reduce folds items', () => {
      const sum = reduce((acc: number, n: number) => acc + n, 0)(numbers);
      expect(sum).toBe(15);
    });

    it('groupBy organizes items by key immutably', () => {
      const words = ['apple', 'apricot', 'banana', 'cherry', 'blueberry'];
      const grouped = groupBy((w: string) => w[0])(words);

      expect(grouped['a']).toEqual(['apple', 'apricot']);
      expect(grouped['b']).toEqual(['banana', 'blueberry']);
      expect(grouped['c']).toEqual(['cherry']);
      expect(Object.isFrozen(grouped)).toBe(true);
      expect(Object.isFrozen(grouped['a'])).toBe(true);
    });

    it('sortBy sorts items immutably without mutating the source', () => {
      const original = [5, 2, 8, 1];
      const sorted = sortBy((a: number, b: number) => a - b)(original);

      expect(sorted).toEqual([1, 2, 5, 8]);
      expect(original).toEqual([5, 2, 8, 1]);
      expect(Object.isFrozen(sorted)).toBe(true);
    });
  });
});
