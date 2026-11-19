import React from 'react';
import { useDivination } from '../state/DivinationContext.jsx';
import { HexagramFigure } from './HexagramFigure.jsx';
import { changeLine } from '../core/yarrow.js';
import { ArrowRight } from 'lucide-react';

export function HexagramPanel() {
  const { state } = useDivination();
  const { lines, phase, primaryHex, changedHex, movingLines } = state;

  const isFinished = phase === 'finished';
  const hasMoving = movingLines.length > 0;

  // 變卦爻值陣列
  const changedLinesValues = lines.map(changeLine);

  return (
    <div className="bg-ink-900 border border-ink-600/60 rounded-xl p-3 sm:p-4 shadow-md flex flex-col items-center">
      <div className="w-full flex items-center justify-between border-b border-ink-700 pb-2 mb-3">
        <h2 className="font-serif font-bold text-paper text-sm sm:text-base flex items-center gap-2">
          <span className="text-gold">☰</span>
          <span>卦象展示區</span>
        </h2>
        <span className="text-xs text-muted">
          由下至上成爻（初至上）
        </span>
      </div>

      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 my-1">
        {/* 本卦 */}
        <div className="flex-1 w-full flex flex-col items-center">
          <HexagramFigure
            lines={lines}
            isChanged={false}
            title={primaryHex ? `本卦：${primaryHex.name}卦` : '本卦'}
            subtitle={
              primaryHex
                ? `第 ${primaryHex.number} 卦 ${primaryHex.fullName}（上${primaryHex.upper}下${primaryHex.lower}）`
                : '筮得之卦'
            }
            highlightMoving={true}
          />
        </div>

        {/* 變換箭頭（當六爻完成且有變卦時） */}
        {isFinished && hasMoving && (
          <div className="hidden md:flex flex-col items-center justify-center text-gold/80 px-1">
            <ArrowRight className="w-6 h-6 animate-pulse" />
            <span className="text-[11px] font-serif text-muted mt-1">之卦</span>
          </div>
        )}

        {/* 變卦 */}
        <div className="flex-1 w-full flex flex-col items-center">
          {isFinished ? (
            hasMoving && changedHex ? (
              <HexagramFigure
                lines={changedLinesValues}
                isChanged={true}
                title={`變卦：${changedHex.name}卦`}
                subtitle={`第 ${changedHex.number} 卦 ${changedHex.fullName}（上${changedHex.upper}下${changedHex.lower}）`}
                highlightMoving={false}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-ink-950/40 border border-dashed border-ink-700/80 w-full max-w-[280px] h-full min-h-[220px] text-center">
                <span className="text-2xl text-muted/60 mb-2">☯</span>
                <span className="font-serif font-bold text-paper/80 mb-1">無變卦</span>
                <p className="text-xs text-muted leading-relaxed">
                  本卦六爻皆為少陽或少陰（無老陽九、無老陰六），無爻變動，純以本卦斷之。
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-ink-950/30 border border-dashed border-ink-700/50 w-full max-w-[280px] h-full min-h-[220px] text-center">
              <span className="text-xs text-muted/60 font-serif">
                待六爻成卦後<br />若有動爻將於此展現變卦
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
