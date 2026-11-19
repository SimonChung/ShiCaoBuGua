import { HEXAGRAMS, HEXAGRAMS_BY_BINARY, HEXAGRAMS_BY_NUMBER } from '../data/iching.js';
import { isYang, isMoving, changeLine } from './yarrow.js';

export { HEXAGRAMS, HEXAGRAMS_BY_BINARY, HEXAGRAMS_BY_NUMBER };

/**
 * 爻值陣列轉二進位字串（由初爻到上爻，1=陽，0=陰）
 * @param {number[]} lines 爻值陣列，長度 1~6
 * @returns {string}
 */
export function toBinary(lines) {
  return lines.map(v => (isYang(v) ? '1' : '0')).join('');
}

/**
 * 計算變卦的爻值陣列
 * 9（老陽）變 8（少陰），6（老陰）變 7（少陽），7、8 不變
 * @param {number[]} lines
 * @returns {number[]}
 */
export function changedLines(lines) {
  return lines.map(changeLine);
}

/**
 * 根據二進位字串查詢 64 卦
 * @param {string} binary 6 位長度二進位（初爻至上爻）
 */
export function findHexagram(binary) {
  if (!binary || binary.length !== 6) return null;
  return HEXAGRAMS_BY_BINARY[binary] || null;
}

/**
 * 取得所有變爻的 1-based 位置（初爻為 1，上爻為 6）
 * @param {number[]} lines
 * @returns {number[]}
 */
export function movingPositions(lines) {
  const result = [];
  lines.forEach((v, idx) => {
    if (isMoving(v)) {
      result.push(idx + 1);
    }
  });
  return result;
}

/**
 * 爻位名稱（初九、六二、九三、上六等）
 * @param {number} position 1 到 6
 * @param {number} value 6, 7, 8, 9
 */
export function lineLabel(position, value) {
  const yang = isYang(value);
  const prefix = yang ? '九' : '六';
  switch (position) {
    case 1:
      return `初${prefix}`;
    case 2:
      return `${prefix}二`;
    case 3:
      return `${prefix}三`;
    case 4:
      return `${prefix}四`;
    case 5:
      return `${prefix}五`;
    case 6:
      return `上${prefix}`;
    default:
      return `第${position}爻`;
  }
}

/**
 * 依朱熹《易學啟蒙》解卦參考規則
 * @param {number[]} lines 六爻陣列
 * @param {object} primaryHex 本卦
 * @param {object|null} changedHex 變卦
 */
export function readingGuide(lines, primaryHex, changedHex) {
  if (!lines || lines.length !== 6 || !primaryHex) {
    return null;
  }

  const movings = movingPositions(lines); // 1-based
  const count = movings.length;

  // 不變之爻（1-based）
  const unchangeds = [1, 2, 3, 4, 5, 6].filter(p => !movings.includes(p));

  if (count === 0) {
    return {
      count: 0,
      ruleName: '六爻皆不變',
      summary: '以本卦卦辭為主，占其全體形勢。',
      focus: [{ target: 'primary', type: 'judgment', label: '本卦卦辭' }],
    };
  }

  if (count === 1) {
    const pos = movings[0];
    const label = lineLabel(pos, lines[pos - 1]);
    return {
      count: 1,
      ruleName: '一爻變',
      summary: `以本卦變爻（${label}）之爻辭為主占。`,
      focus: [{ target: 'primary', type: 'line', position: pos, label: `本卦 ${label}` }],
    };
  }

  if (count === 2) {
    const [lower, upper] = movings;
    const lowerLabel = lineLabel(lower, lines[lower - 1]);
    const upperLabel = lineLabel(upper, lines[upper - 1]);
    return {
      count: 2,
      ruleName: '二爻變',
      summary: `以本卦兩變爻（${lowerLabel}、${upperLabel}）之爻辭參看，以上位爻（${upperLabel}）為主。`,
      focus: [
        { target: 'primary', type: 'line', position: upper, isPrimary: true, label: `本卦 ${upperLabel}（主）` },
        { target: 'primary', type: 'line', position: lower, isPrimary: false, label: `本卦 ${lowerLabel}（次）` },
      ],
    };
  }

  if (count === 3) {
    return {
      count: 3,
      ruleName: '三爻變',
      summary: '本卦卦辭與變卦卦辭參看，以本卦卦辭為主，變卦卦辭為輔（體卦與之卦各半）。',
      focus: [
        { target: 'primary', type: 'judgment', isPrimary: true, label: '本卦卦辭（主）' },
        { target: 'changed', type: 'judgment', isPrimary: false, label: '變卦卦辭（次）' },
      ],
    };
  }

  if (count === 4) {
    // 兩不變爻
    const [lowerUnchanged, upperUnchanged] = unchangeds;
    const chLines = changedLines(lines);
    const lowerLabel = lineLabel(lowerUnchanged, chLines[lowerUnchanged - 1]);
    const upperLabel = lineLabel(upperUnchanged, chLines[upperUnchanged - 1]);
    return {
      count: 4,
      ruleName: '四爻變',
      summary: `以之卦（變卦）中兩不變之爻辭參看，以下爻（${lowerLabel}）爻辭為主。`,
      focus: [
        { target: 'changed', type: 'line', position: lowerUnchanged, isPrimary: true, label: `變卦 ${lowerLabel}（主）` },
        { target: 'changed', type: 'line', position: upperUnchanged, isPrimary: false, label: `變卦 ${upperLabel}（次）` },
      ],
    };
  }

  if (count === 5) {
    // 一不變爻
    const pos = unchangeds[0];
    const chLines = changedLines(lines);
    const label = lineLabel(pos, chLines[pos - 1]);
    return {
      count: 5,
      ruleName: '五爻變',
      summary: `以之卦（變卦）中唯一不變之爻（${label}）之爻辭占。`,
      focus: [{ target: 'changed', type: 'line', position: pos, label: `變卦 ${label}` }],
    };
  }

  if (count === 6) {
    if (primaryHex.number === 1) {
      return {
        count: 6,
        ruleName: '六爻皆變（乾卦用九）',
        summary: '乾卦六爻皆變，以「用九」（見群龍无首，吉）之辭占。',
        focus: [{ target: 'primary', type: 'extra', label: '乾卦 用九' }],
      };
    }
    if (primaryHex.number === 2) {
      return {
        count: 6,
        ruleName: '六爻皆變（坤卦用六）',
        summary: '坤卦六爻皆變，以「用六」（利永貞）之辭占。',
        focus: [{ target: 'primary', type: 'extra', label: '坤卦 用六' }],
      };
    }
    return {
      count: 6,
      ruleName: '六爻皆變',
      summary: '六爻皆變，以之卦（變卦）之卦辭占。',
      focus: [{ target: 'changed', type: 'judgment', label: '變卦卦辭' }],
    };
  }

  return null;
}
