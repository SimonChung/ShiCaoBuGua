import { describe, it, expect } from 'vitest';
import {
  HEXAGRAMS,
  toBinary,
  changedLines,
  findHexagram,
  movingPositions,
  lineLabel,
  readingGuide,
} from '../src/core/hexagram.js';

describe('Hexagram core and data (hexagram.js & iching.js)', () => {
  it('HEXAGRAMS has exactly 64 items with unique numbers and binary strings', () => {
    expect(HEXAGRAMS.length).toBe(64);
    const binaries = new Set(HEXAGRAMS.map(h => h.binary));
    expect(binaries.size).toBe(64);
    const numbers = new Set(HEXAGRAMS.map(h => h.number));
    expect(numbers.size).toBe(64);

    HEXAGRAMS.forEach(h => {
      expect(h.name).toBeTruthy();
      expect(h.fullName).toBeTruthy();
      expect(h.judgment).toBeTruthy();
      expect(h.lines.length).toBe(6);
      h.lines.forEach(l => {
        expect(l.label).toBeTruthy();
        expect(l.text).toBeTruthy();
      });
      if (h.number === 1) {
        expect(h.extra?.label).toBe('用九');
        expect(h.extra?.text).toBeTruthy();
      } else if (h.number === 2) {
        expect(h.extra?.label).toBe('用六');
        expect(h.extra?.text).toBeTruthy();
      } else {
        expect(h.extra).toBeNull();
      }
    });
  });

  it('toBinary properly converts line values (initial line to top line)', () => {
    // 7,9 -> 1; 6,8 -> 0
    expect(toBinary([7, 8, 9, 6, 7, 8])).toBe('101010');
    expect(toBinary([9, 9, 9, 9, 9, 9])).toBe('111111');
    expect(toBinary([6, 6, 6, 6, 6, 6])).toBe('000000');
  });

  it('findHexagram locates key canonical hexagrams', () => {
    expect(findHexagram('111111')?.fullName).toBe('乾為天');
    expect(findHexagram('000000')?.fullName).toBe('坤為地');
    expect(findHexagram('100010')?.fullName).toBe('水雷屯');
    expect(findHexagram('010001')?.fullName).toBe('山水蒙');
  });

  it('changedLines properly flips moving lines and keeps non-moving', () => {
    expect(changedLines([9, 8, 7, 6, 7, 8])).toEqual([8, 8, 7, 7, 7, 8]);
    expect(changedLines([7, 8, 7, 8, 7, 8])).toEqual([7, 8, 7, 8, 7, 8]);
    expect(changedLines([9, 9, 9, 6, 6, 6])).toEqual([8, 8, 8, 7, 7, 7]);
  });

  it('movingPositions returns 1-based positions of 6 and 9', () => {
    expect(movingPositions([7, 9, 8, 8, 6, 7])).toEqual([2, 5]);
    expect(movingPositions([7, 8, 7, 8, 7, 8])).toEqual([]);
    expect(movingPositions([6, 9, 6, 9, 6, 9])).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('lineLabel returns proper traditional line titles', () => {
    expect(lineLabel(1, 9)).toBe('初九');
    expect(lineLabel(1, 6)).toBe('初六');
    expect(lineLabel(2, 7)).toBe('九二');
    expect(lineLabel(2, 8)).toBe('六二');
    expect(lineLabel(5, 9)).toBe('九五');
    expect(lineLabel(6, 6)).toBe('上六');
    expect(lineLabel(6, 7)).toBe('上九');
  });

  it('readingGuide covers 0 through 6 moving lines correctly', () => {
    const qian = findHexagram('111111');
    const kun = findHexagram('000000');
    const tun = findHexagram('100010');

    // 0 moving lines
    const g0 = readingGuide([7, 7, 7, 7, 7, 7], qian, null);
    expect(g0.count).toBe(0);
    expect(g0.focus[0].target).toBe('primary');

    // 1 moving line
    const g1 = readingGuide([7, 9, 7, 7, 7, 7], qian, tun);
    expect(g1.count).toBe(1);
    expect(g1.focus[0].position).toBe(2);

    // 2 moving lines
    const g2 = readingGuide([7, 9, 7, 7, 9, 7], qian, tun);
    expect(g2.count).toBe(2);
    expect(g2.focus[0].position).toBe(5); // upper is primary
    expect(g2.focus[1].position).toBe(2);

    // 3 moving lines
    const g3 = readingGuide([7, 9, 7, 6, 9, 7], qian, tun);
    expect(g3.count).toBe(3);

    // 4 moving lines (2 unchanged lines)
    const g4 = readingGuide([9, 9, 7, 9, 8, 9], qian, tun);
    expect(g4.count).toBe(4);
    // unchanged are positions 3 and 5, lower unchanged is 3
    expect(g4.focus[0].position).toBe(3);

    // 5 moving lines (1 unchanged line)
    const g5 = readingGuide([9, 9, 7, 9, 9, 9], qian, tun);
    expect(g5.count).toBe(5);
    expect(g5.focus[0].position).toBe(3);

    // 6 moving lines for Qian (用九)
    const g6Qian = readingGuide([9, 9, 9, 9, 9, 9], qian, kun);
    expect(g6Qian.ruleName).toContain('用九');

    // 6 moving lines for Kun (用六)
    const g6Kun = readingGuide([6, 6, 6, 6, 6, 6], kun, qian);
    expect(g6Kun.ruleName).toContain('用六');
  });
});
