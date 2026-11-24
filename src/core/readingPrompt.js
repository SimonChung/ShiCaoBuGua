import { changedLines, findHexagram, lineLabel, movingPositions, readingGuide, toBinary } from './hexagram.js';

export function buildReadingPrompt({ question, lines }) {
  if (!Array.isArray(lines) || lines.length !== 6 || !lines.every(v => [6, 7, 8, 9].includes(v))) {
    return '';
  }

  // 用紀錄的六爻還原卦象，舊紀錄也能依相同準則取得完整經文。
  const primary = findHexagram(toBinary(lines));
  const moving = movingPositions(lines);
  const changed = moving.length ? findHexagram(toBinary(changedLines(lines))) : null;
  const guide = readingGuide(lines, primary, changed);
  const passages = guide.focus.map(focus => {
    const hex = focus.target === 'changed' ? changed : primary;
    if (focus.type === 'judgment') return focus.label; // 卦辭全文見上方
    const text = focus.type === 'extra' ? hex.extra.text : hex.lines[focus.position - 1].text;
    return `${focus.label}　${text}`;
  });

  return [
    '請以繁體中文解讀以下蓍草卦。先說明主要參看的經文及其白話意思，再結合所問之事，提出一到兩個可以思考或查證的問題。若未填寫問題，請就卦義解讀。請區分經文原意與情境推論。',
    '',
    `所問之事：${question?.trim() || '未填寫'}`,
    `六爻（初爻至上爻）：${lines.join('、')}`,
    `本卦：第 ${primary.number} 卦 ${primary.fullName}。卦辭：${primary.judgment}`,
    `動爻：${moving.map(pos => lineLabel(pos, lines[pos - 1])).join('、') || '無'}`,
    changed ? `之卦：第 ${changed.number} 卦 ${changed.fullName}。卦辭：${changed.judgment}` : '之卦：無',
    '',
    `取辭規則（朱熹《易學啟蒙》）：${guide.ruleName}。 ${guide.summary}`,
    ...passages,
  ].join('\n');
}
