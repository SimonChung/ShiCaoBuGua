import React from 'react';
import { motion } from 'framer-motion';
import { isYang } from '../core/yarrow.js';
import { lineLabel } from '../core/hexagram.js';
import { LineMark } from './LineMark.jsx';

export function HexagramFigure({
  lines = [], // [初, 二, 三, 四, 五, 上]
  isChanged = false,
  title = '',
  subtitle = '',
  highlightMoving = false,
}) {
  const linePositions = [5, 4, 3, 2, 1, 0]; // 畫面上由上往下渲染：上爻到初爻
  const defaultLabels = ['上爻', '五爻', '四爻', '三爻', '二爻', '初爻'];

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-ink-950/60 border border-ink-700/80 w-full max-w-[280px]">
      {title && (
        <div className="font-serif font-bold text-gold text-base sm:text-lg mb-0.5 tracking-wider text-center">
          {title}
        </div>
      )}
      {subtitle && (
        <div className="text-xs text-muted mb-3 font-sans text-center">
          {subtitle}
        </div>
      )}

      {/* 六爻圖本體（由上至下顯示：上爻至初爻） */}
      <div className="w-full space-y-2.5 py-1">
        {linePositions.map((idx) => {
          const val = lines[idx];
          const hasLine = val !== undefined && val !== null;
          const yang = hasLine ? isYang(val) : false;
          const label = hasLine ? lineLabel(idx + 1, val) : defaultLabels[5 - idx];
          const isMovingLine = val === 6 || val === 9;

          return (
            <div key={idx} className="flex items-center gap-2 w-full text-xs">
              {/* 爻位標籤 */}
              <span
                className={`w-10 text-right font-serif select-none transition-colors ${
                  hasLine ? 'text-paper font-medium' : 'text-muted/40'
                }`}
              >
                {label}
              </span>

              {/* 爻線繪製 */}
              <div className="flex-1 h-5 flex items-center justify-center">
                {!hasLine ? (
                  // 佔位虛線
                  <div className="w-full h-1 border-b border-dashed border-ink-700/60" />
                ) : yang ? (
                  // 陽爻：整條實心金條
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className={`w-full h-3 rounded-sm transition-all ${
                      highlightMoving && isMovingLine
                        ? 'bg-gradient-to-r from-gold via-amber-300 to-gold shadow-[0_0_8px_rgba(212,166,74,0.6)]'
                        : 'bg-gold/90 shadow-sm'
                    }`}
                  />
                ) : (
                  // 陰爻：左右兩段，中間留空
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="w-full h-3 flex justify-between items-center"
                  >
                    <div
                      className={`w-[45%] h-full rounded-sm ${
                        highlightMoving && isMovingLine
                          ? 'bg-gradient-to-r from-gold via-amber-300 to-gold shadow-[0_0_8px_rgba(212,166,74,0.6)]'
                          : 'bg-gold/90 shadow-sm'
                      }`}
                    />
                    <div className="w-[10%]" />
                    <div
                      className={`w-[45%] h-full rounded-sm ${
                        highlightMoving && isMovingLine
                          ? 'bg-gradient-to-r from-gold via-amber-300 to-gold shadow-[0_0_8px_rgba(212,166,74,0.6)]'
                          : 'bg-gold/90 shadow-sm'
                      }`}
                    />
                  </motion.div>
                )}
              </div>

              {/* 數值與動爻標記（紅圈 ○ 或 綠叉 ✕） */}
              <div className="w-10 flex items-center justify-start gap-1">
                {hasLine && (
                  <>
                    <span className="font-mono text-muted/80 text-[11px]">{val}</span>
                    <LineMark value={val} size={16} />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
