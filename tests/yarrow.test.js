import { describe, it, expect } from 'vitest';
import {
  remainder4,
  clampSplit,
  performChange,
  lineValue,
  isYang,
  isMoving,
  changeLine,
} from '../src/core/yarrow.js';
import { randomSplit } from '../src/core/random.js';

describe('Yarrow algorithm core (yarrow.js)', () => {
  it('remainder4: returns 4 when divisible by 4, else modulo 4', () => {
    expect(remainder4(4)).toBe(4);
    expect(remainder4(8)).toBe(4);
    expect(remainder4(12)).toBe(4);
    expect(remainder4(5)).toBe(1);
    expect(remainder4(7)).toBe(3);
    expect(remainder4(6)).toBe(2);
    expect(remainder4(1)).toBe(1);
  });

  it('clampSplit: clamps k between 1 and total - 2', () => {
    expect(clampSplit(0, 49)).toBe(1);
    expect(clampSplit(-10, 49)).toBe(1);
    expect(clampSplit(48, 49)).toBe(47);
    expect(clampSplit(49, 49)).toBe(47);
    expect(clampSplit(100, 49)).toBe(47);
    expect(clampSplit(25, 49)).toBe(25);
  });

  it('First change (49 sticks): gathered MUST always be 5 or 9 for any split k', () => {
    for (let k = 1; k <= 47; k++) {
      const res = performChange(49, k);
      expect([5, 9]).toContain(res.gathered);
      expect([40, 44]).toContain(res.after);
      expect(res.left + res.right).toBe(49);
      expect(res.hung).toBe(1);
      expect(res.leftGroups * 4 + res.leftRemainder).toBe(res.left);
      expect(res.rightGroups * 4 + res.rightRemainder).toBe(res.right - 1);
    }
  });

  it('Second change (44 or 40 sticks): gathered MUST always be 4 or 8', () => {
    for (const total of [44, 40]) {
      for (let k = 1; k <= total - 2; k++) {
        const res = performChange(total, k);
        expect([4, 8]).toContain(res.gathered);
        expect([total - 4, total - 8]).toContain(res.after);
      }
    }
  });

  it('Third change: gathered MUST always be 4 or 8', () => {
    for (const total of [40, 36, 32]) {
      for (let k = 1; k <= total - 2; k++) {
        const res = performChange(total, k);
        expect([4, 8]).toContain(res.gathered);
      }
    }
  });

  it('Three changes end with 24, 28, 32, or 36 remaining sticks, yielding 6, 7, 8, 9', () => {
    for (let sim = 0; sim < 500; sim++) {
      // 1st change
      const c1 = performChange(49, randomSplit(49));
      // 2nd change
      const c2 = performChange(c1.after, randomSplit(c1.after));
      // 3rd change
      const c3 = performChange(c2.after, randomSplit(c2.after));

      expect([24, 28, 32, 36]).toContain(c3.after);
      const val = lineValue(c3.after);
      expect([6, 7, 8, 9]).toContain(val);
    }
  });

  it('line value helpers work as expected', () => {
    expect(isYang(9)).toBe(true);
    expect(isYang(7)).toBe(true);
    expect(isYang(8)).toBe(false);
    expect(isYang(6)).toBe(false);

    expect(isMoving(9)).toBe(true);
    expect(isMoving(6)).toBe(true);
    expect(isMoving(7)).toBe(false);
    expect(isMoving(8)).toBe(false);

    expect(changeLine(9)).toBe(8);
    expect(changeLine(6)).toBe(7);
    expect(changeLine(7)).toBe(7);
    expect(changeLine(8)).toBe(8);
  });
});
