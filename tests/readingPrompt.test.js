import { describe, expect, it } from 'vitest';
import { buildReadingPrompt } from '../src/core/readingPrompt.js';
import { INITIAL_STATE, divinationReducer } from '../src/state/reducer.js';

describe('解卦提示詞', () => {
  it('使用當筆紀錄的問題、初爻至上爻順序及選定經文', () => {
    const record = { question: '這次合作要注意什麼？', lines: [7, 9, 7, 7, 7, 7] };
    const prompt = buildReadingPrompt(record);
    for (const text of [record.question, '7、9、7、7、7、7', '乾為天', '動爻：九二', '天火同人', '見龍在田，利見大人。']) {
      expect(prompt).toContain(text);
    }
  });

  it('四爻變時依之卦選出兩個不變爻的原文', () => {
    const prompt = buildReadingPrompt({ lines: [9, 9, 9, 9, 7, 7] });
    expect(prompt).toContain('之卦：第 20 卦 風地觀');
    expect(prompt).toContain('變卦 九五（主）　觀我生，君子无咎。');
    expect(prompt).toContain('變卦 上九（次）　觀其生，君子无咎。');
  });

  it.each([
    [7, '之卦：無', '本卦卦辭'],
    [9, '乾卦 用九', '見群龍无首，吉。'],
    [6, '坤卦 用六', '利永貞。'],
  ])('未填問題時仍依六爻皆為 %i 的規則取辭', (value, rule, text) => {
    const prompt = buildReadingPrompt({ lines: Array(6).fill(value) });
    expect(prompt).toContain('所問之事：未填寫');
    expect(prompt).toContain(rule);
    expect(prompt).toContain(text);
  });

  it('六爻缺漏或數值無效時不產生卦象', () => {
    expect(buildReadingPrompt({})).toBe('');
    expect(buildReadingPrompt({ lines: [7, 7] })).toBe('');
    expect(buildReadingPrompt({ lines: [0, 0, 0, 0, 0, 0] })).toBe('');
  });

  it('成卦後輸入下一題，原卦仍使用起卦時的問題', () => {
    const start = divinationReducer(INITIAL_STATE, { type: 'RESET_AND_START', payload: { question: '第一題' } });
    const finish = divinationReducer(start, { type: 'SKIP_ALL' });
    const next = divinationReducer(finish, { type: 'SET_QUESTION', payload: { text: '第二題' } });
    expect(next.readingQuestion).toBe('第一題');
    expect(next.question).toBe('第二題');
  });
});
