import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const RECORDS_DIR = path.resolve(process.cwd(), 'records');

describe('Local file records verification', () => {
  const testId = '20261117-210001';
  const jsonPath = path.join(RECORDS_DIR, `${testId}.json`);
  const mdPath = path.join(RECORDS_DIR, `${testId}.md`);

  beforeEach(() => {
    if (!fs.existsSync(RECORDS_DIR)) {
      fs.mkdirSync(RECORDS_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
    if (fs.existsSync(mdPath)) fs.unlinkSync(mdPath);
  });

  it('can write and read .json and .md record files properly', () => {
    const dummyRecord = {
      id: testId,
      question: '測試寫入檔案',
      lines: [9, 7, 8, 6, 8, 7],
      primary: { number: 1, fullName: '乾為天' },
    };

    fs.writeFileSync(jsonPath, JSON.stringify(dummyRecord, null, 2), 'utf-8');
    fs.writeFileSync(mdPath, '# 測試 Markdown', 'utf-8');

    expect(fs.existsSync(jsonPath)).toBe(true);
    expect(fs.existsSync(mdPath)).toBe(true);

    const readJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    expect(readJson.id).toBe(testId);
    expect(readJson.question).toBe('測試寫入檔案');

    const readMd = fs.readFileSync(mdPath, 'utf-8');
    expect(readMd).toBe('# 測試 Markdown');
  });
});
