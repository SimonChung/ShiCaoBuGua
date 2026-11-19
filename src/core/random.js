import { clampSplit } from './yarrow.js';

/**
 * 產生均勻隨機浮點數 [0, 1) 使用 Web Crypto API
 */
function secureRandom() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  }
  return Math.random();
}

/**
 * Box-Muller 變換產生標準常態分佈亂數 (mean=0, std=1)
 */
function randomNormal() {
  let u = 0;
  let v = 0;
  while (u === 0) u = secureRandom();
  while (v === 0) v = secureRandom();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * 模擬人手從蓍草堆中隨意抓取兩分
 * 常態分佈（以中點為期望值，標準差約為 total / 6），確保切分自然且符合真實人為抓取
 * @param {number} total 當前蓍草總數
 * @returns {number} 左堆枝數 (1 <= k <= total - 2)
 */
export function randomSplit(total) {
  const mean = total / 2;
  const std = total / 6;
  const sample = mean + randomNormal() * std;
  return clampSplit(Math.round(sample), total);
}
