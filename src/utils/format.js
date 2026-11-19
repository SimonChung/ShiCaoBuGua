/**
 * 格式化時間與爻位名稱工具函式
 */

export function formatDateTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const pad = n => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const date = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

export function formatLinePosition(index0) {
  const names = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
  return names[index0] || `第 ${index0 + 1} 爻`;
}

export function formatChangeIndex(index0) {
  const names = ['第一變', '第二變', '第三變'];
  return names[index0] || `第 ${index0 + 1} 變`;
}

export function formatLineSymbol(val) {
  switch (val) {
    case 9:
      return '━━━━━ ○'; // 老陽
    case 8:
      return '━━　━━';   // 少陰
    case 7:
      return '━━━━━';   // 少陽
    case 6:
      return '━━　━━ ✕'; // 老陰
    default:
      return '━━━━━';
  }
}
