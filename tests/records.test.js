import { describe, it, expect } from 'vitest';
import { toMarkdown } from '../src/services/records.js';
import { findHexagram } from '../src/core/hexagram.js';

describe('Records service (toMarkdown)', () => {
  it('generates markdown with question, time, hexagrams and changes table', () => {
    const qian = findHexagram('111111');
    const tun = findHexagram('100010');

    const sampleRecord = {
      id: '20261117-210000',
      question: '測試問題：求事業運',
      startedAt: '2026-11-17T21:00:00.000Z',
      finishedAt: '2026-11-17T21:05:00.000Z',
      lines: [7, 9, 8, 8, 6, 7],
      changes: [
        { line: 1, change: 1, total: 49, left: 23, right: 26, leftRemainder: 3, rightRemainder: 1, hung: 1, gathered: 5, after: 44 }
      ],
      primary: qian,
      changed: tun,
      movingLines: [2, 5],
    };

    const md = toMarkdown(sampleRecord);
    expect(md).toContain('# 蓍草卜卦紀錄');
    expect(md).toContain('求事業運');
    expect(md).toContain('本卦：第 1 卦 乾為天');
    expect(md).toContain('元亨利貞。');
    expect(md).toContain('變爻爻辭');
    expect(md).toContain('九二');
    expect(md).toContain('解卦參考');
    expect(md).toContain('十八變明細紀錄');
  });
});
