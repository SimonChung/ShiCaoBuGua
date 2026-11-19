import React from 'react';
import { useDivination } from '../state/DivinationContext.jsx';
import { formatLinePosition, formatChangeIndex } from '../utils/format.js';

export function ProgressIndicator() {
  const { state } = useDivination();
  const { phase, lineIndex, changeIndex, lines, changes } = state;

  if (phase === 'idle') {
    return (
      <div className="bg-ink-900/60 border border-ink-700/50 rounded-xl p-3 text-center text-xs text-muted">
        請按下「開始卜卦」展開大衍五十之數
      </div>
    );
  }

  const completedChanges = changes.length;
  const isFinished = phase === 'finished';

  return (
    <div className="bg-ink-900 border border-ink-600/60 rounded-xl p-3 sm:p-4 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
          <span className="font-serif font-bold text-paper text-sm sm:text-base">
            {isFinished
              ? '十有八變圓滿成卦'
              : `${formatLinePosition(lineIndex)} ・ ${formatChangeIndex(changeIndex)}`}
          </span>
          {!isFinished && (
            <span className="text-xs text-muted font-sans">
              （已得 {lines.length} 爻 / 共 6 爻）
            </span>
          )}
        </div>
        <div className="text-xs text-gold/90 font-mono">
          進度：{completedChanges} / 18 變
        </div>
      </div>

      {/* 18 變進度圓點（6 群組，每組 3 變） */}
      <div className="grid grid-cols-6 gap-2 sm:gap-3">
        {[0, 1, 2, 3, 4, 5].map((lIdx) => {
          const lineNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
          const isCurrentLine = lIdx === lineIndex && !isFinished;
          const isCompletedLine = lines.length > lIdx;

          return (
            <div
              key={lIdx}
              className={`p-1.5 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                isCurrentLine
                  ? 'border-gold/60 bg-gold/5 shadow-sm ring-1 ring-gold/30'
                  : isCompletedLine
                  ? 'border-ink-600 bg-ink-800/80'
                  : 'border-ink-700/40 bg-ink-950/40 opacity-50'
              }`}
            >
              <span className="text-[11px] font-serif text-paper/80">{lineNames[lIdx]}</span>
              <div className="flex gap-1">
                {[0, 1, 2].map((cIdx) => {
                  const changeNum = lIdx * 3 + cIdx;
                  const isDone = completedChanges > changeNum;
                  const isCurrent = lIdx === lineIndex && cIdx === changeIndex && !isFinished;

                  return (
                    <span
                      key={cIdx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        isDone
                          ? 'bg-gold'
                          : isCurrent
                          ? 'bg-gold animate-pulse ring-2 ring-gold/40'
                          : 'bg-ink-700'
                      }`}
                      title={`${lineNames[lIdx]} 第 ${cIdx + 1} 變`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
