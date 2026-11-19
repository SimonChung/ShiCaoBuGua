import { formatDateTime, formatLinePosition, formatLineSymbol } from '../utils/format.js';
import { getLineName, changeLine } from '../core/yarrow.js';
import { readingGuide } from '../core/hexagram.js';

const STORAGE_KEY = 'shicao.records';

/**
 * 產生卜卦結果的 Markdown 文本
 */
export function toMarkdown(record) {
  const { question, startedAt, finishedAt, lines = [], changes = [], primary, changed } = record;
  const guide = primary ? readingGuide(lines, primary, changed) : null;

  const linesDesc = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

  let md = `# 蓍草卜卦紀錄 — ${formatDateTime(startedAt)}\n\n`;
  md += `- **所問之事**：${question || '（未具體填寫）'}\n`;
  md += `- **卜卦時間**：${formatDateTime(startedAt)} ～ ${formatDateTime(finishedAt)}\n\n`;

  // 卦象表格（由上往下展示：上爻到初爻）
  md += `## 卦象\n\n`;
  md += `| 爻位 | 數值與名稱 | 本卦 | 變卦 |\n`;
  md += `|:---:|:---|:---:|:---:|\n`;

  for (let i = 5; i >= 0; i--) {
    const val = lines[i];
    const chVal = changeLine(val);
    const valName = `${val} ${getLineName(val)}`;
    const primSym = formatLineSymbol(val);
    const chSym = changed ? formatLineSymbol(chVal) : primSym;
    md += `| ${linesDesc[i]} | ${valName} | \`${primSym}\` | \`${chSym}\` |\n`;
  }
  md += `\n`;

  // 本卦
  if (primary) {
    md += `## 本卦：第 ${primary.number} 卦 ${primary.fullName}\n\n`;
    md += `> **卦辭**：${primary.judgment}\n\n`;

    // 變爻爻辭
    const movingLines = [];
    lines.forEach((v, idx) => {
      if (v === 6 || v === 9) {
        movingLines.push({ pos: idx + 1, val: v, lineData: primary.lines[idx] });
      }
    });

    if (movingLines.length > 0) {
      md += `### 變爻爻辭\n\n`;
      movingLines.forEach(({ pos, val, lineData }) => {
        const mark = val === 9 ? '○ 老陽' : '✕ 老陰';
        md += `- **${lineData.label}** (${mark})：${lineData.text}\n`;
      });
      md += `\n`;
    }
  }

  // 變卦
  if (changed) {
    md += `## 變卦：第 ${changed.number} 卦 ${changed.fullName}\n\n`;
    md += `> **卦辭**：${changed.judgment}\n\n`;
  } else {
    md += `## 變卦\n\n無變爻，六爻皆不變，故無變卦（以此本卦卦辭全體為主）。\n\n`;
  }

  // 解卦參考
  if (guide) {
    md += `## 解卦參考（朱熹《易學啟蒙》）\n\n`;
    md += `> **${guide.ruleName}**：${guide.summary}\n\n`;
  }

  // 十八變明細
  if (changes && changes.length > 0) {
    md += `## 十八變明細紀錄\n\n`;
    md += `| 爻 | 變 | 蓍數 | 左堆 | 右堆 | 左餘 | 右餘 | 歸奇 | 剩餘 |\n`;
    md += `|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n`;
    changes.forEach(c => {
      md += `| ${linesDesc[c.line - 1]} | 第${c.change}變 | ${c.total} | ${c.left} | ${c.right} | ${c.leftRemainder} | ${c.rightRemainder} | ${c.gathered} | ${c.after} |\n`;
    });
    md += `\n`;
  }

  return md;
}

/**
 * 儲存紀錄（優先呼叫 API，失敗時降級至 localStorage）
 */
export async function saveRecord(record) {
  const md = toMarkdown(record);
  const payload = { ...record, markdown: md };

  try {
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, id: data.id, source: 'fs' };
    }
  } catch (err) {
    console.warn('API save failed, falling back to localStorage:', err);
  }

  // Fallback to localStorage
  try {
    const records = getLocalRecords();
    let id = record.id || generateId();
    payload.id = id;
    const existingIndex = records.findIndex(r => r.id === id);
    if (existingIndex >= 0) {
      records[existingIndex] = payload;
    } else {
      records.unshift(payload);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return { ok: true, id, source: 'local' };
  } catch (err) {
    console.error('LocalStorage save failed:', err);
    return { ok: false, error: err.message };
  }
}

/**
 * 列出歷史紀錄
 */
export async function listRecords() {
  try {
    const res = await fetch('/api/records');
    if (res.ok) {
      const data = await res.json();
      return { records: data, source: 'fs' };
    }
  } catch (err) {
    console.warn('API list failed, falling back to localStorage:', err);
  }

  const local = getLocalRecords();
  return {
    records: local.map(r => ({
      id: r.id,
      question: r.question,
      startedAt: r.startedAt,
      finishedAt: r.finishedAt,
      primary: r.primary,
      changed: r.changed,
      movingLines: r.movingLines,
      lines: r.lines,
    })),
    source: 'local',
  };
}

/**
 * 取得單筆完整紀錄
 */
export async function getRecord(id) {
  try {
    const res = await fetch(`/api/records/${id}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('API getRecord failed, falling back to localStorage:', err);
  }

  const local = getLocalRecords();
  return local.find(r => r.id === id) || null;
}

/**
 * 更新紀錄（例如修改所問之事）
 */
export async function updateRecord(id, updates) {
  const existing = await getRecord(id);
  if (!existing) return { ok: false, error: 'Record not found' };

  const merged = { ...existing, ...updates };
  merged.markdown = toMarkdown(merged);

  try {
    const res = await fetch(`/api/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged),
    });
    if (res.ok) {
      return { ok: true, source: 'fs' };
    }
  } catch (err) {
    console.warn('API update failed, fallback to local:', err);
  }

  const local = getLocalRecords();
  const idx = local.findIndex(r => r.id === id);
  if (idx >= 0) {
    local[idx] = merged;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
    return { ok: true, source: 'local' };
  }
  return { ok: false, error: 'Not found in localStorage' };
}

/**
 * 刪除紀錄
 */
export async function deleteRecord(id) {
  try {
    const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
    if (res.ok) {
      return { ok: true, source: 'fs' };
    }
  } catch (err) {
    console.warn('API delete failed, fallback to local:', err);
  }

  const local = getLocalRecords();
  const next = local.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return { ok: true, source: 'local' };
}

/**
 * 下載檔案至瀏覽器本機
 */
export function downloadFile(content, filename, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getLocalRecords() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function generateId() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const d = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const t = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${d}-${t}`;
}
