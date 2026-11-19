/**
 * 蓍草筮法核心演算法（大衍之數）
 * 純函式實作，無副作用，便於測試
 */

export const TOTAL_STICKS = 50;
export const USED_STICKS = 49;

/**
 * 揲四餘數：以 4 數之，若整除則餘數算 4（不可為 0）
 * @param {number} n
 * @returns {number} 1, 2, 3 或 4
 */
export function remainder4(n) {
  if (n <= 0) return 4;
  const r = n % 4;
  return r === 0 ? 4 : r;
}

/**
 * 夾限分二切分點
 * 規定左堆至少 1 枝，右堆至少 2 枝（掛一後右堆仍至少 1 枝）
 * @param {number} k 左堆枝數
 * @param {number} total 當前總枝數
 * @returns {number}
 */
export function clampSplit(k, total) {
  return Math.min(Math.max(Math.round(k), 1), total - 2);
}

/**
 * 執行一變（四營：分二、掛一、揲四、歸奇）
 * @param {number} total 當前蓍草總數（第一變為 49，第二三變為 44 或 40 等）
 * @param {number} k 使用者選擇的左堆枝數
 */
export function performChange(total, k) {
  const left = clampSplit(k, total);
  const right = total - left;
  const hung = 1;
  const rightAfterHang = right - hung;

  const leftRemainder = remainder4(left);
  const rightRemainder = remainder4(rightAfterHang);

  const gathered = hung + leftRemainder + rightRemainder;
  const after = total - gathered;

  return {
    total,
    left,
    right,
    hung,
    rightAfterHang,
    leftRemainder,
    rightRemainder,
    leftGroups: (left - leftRemainder) / 4,
    rightGroups: (rightAfterHang - rightRemainder) / 4,
    gathered,
    after,
  };
}

/**
 * 三變後之剩餘蓍草數除以 4 得爻值
 * @param {number} remaining 三變後剩下的蓍草數（24, 28, 32, 36）
 * @returns {number} 6, 7, 8, 9
 */
export function lineValue(remaining) {
  return remaining / 4;
}

export function isYang(val) {
  return val === 7 || val === 9;
}

export function isYin(val) {
  return val === 6 || val === 8;
}

export function isMoving(val) {
  return val === 6 || val === 9;
}

export function getLineName(val) {
  switch (val) {
    case 9:
      return '老陽（太陽）';
    case 8:
      return '少陰';
    case 7:
      return '少陽';
    case 6:
      return '老陰（太陰）';
    default:
      return '';
  }
}

/**
 * 老陽變陰、老陰變陽、少陽少陰不變
 * @param {number} val
 * @returns {number}
 */
export function changeLine(val) {
  if (val === 9) return 8; // 陽變陰
  if (val === 6) return 7; // 陰變陽
  return val;
}
