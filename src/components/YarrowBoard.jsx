import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDivination } from '../state/DivinationContext.jsx';
import { YarrowStick } from './YarrowStick.jsx';
import { YarrowTable } from './YarrowTable.jsx';
import { TOTAL_STICKS, getLineName } from '../core/yarrow.js';
import { CheckCircle2 } from 'lucide-react';

export function YarrowBoard() {
  const { state, split } = useDivination();
  const {
    phase,
    sticks,
    split: splitData,
    currentChange,
    gatheredForLine,
    lines,
    lineIndex,
    changeIndex,
  } = state;

  // 歸奇總數計算
  const totalGatheredForLine = useMemo(() => {
    return (gatheredForLine || []).reduce((acc, v) => acc + v, 0);
  }, [gatheredForLine]);

  const tablePhase = ['idle', 'setup', 'awaitSplit', 'splitting', 'hanging', 'merging'].includes(phase);
  const tableCaptions = {
    idle: '天地之數五十有五，大衍之數五十，其用四十有九。',
    setup: '虛一置旁，四十九枝起筮。',
    awaitSplit: '按住草束，向右撥開後放手',
    merging: `剩餘 ${currentChange?.after} 枝，重新合束。`,
  };
  let tableTotal = sticks;
  if (phase === 'idle') tableTotal = TOTAL_STICKS;
  if (phase === 'hanging') tableTotal = sticks - 1;
  if (phase === 'merging') tableTotal = currentChange.after;

  return (
    <div className="bg-ink-900 border border-ink-600/60 rounded-xl p-4 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[460px]">
      {/* 頂部區域：不用之一（太極）、掛一區（三才）、歸奇區（扐） */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* 左上：不用之一（太極） */}
        <div className="bg-ink-950/70 border border-ink-700/80 rounded-lg p-2.5 flex flex-col items-center justify-between min-h-[105px]">
          <span className="text-[11px] font-serif text-gold tracking-wide">
            不用之一（象太極）
          </span>
          <div className="flex items-center justify-center py-1">
            {phase !== 'idle' ? (
              <YarrowStick id="tai-chi" height={64} width={5} tilt={-4} isHighlighted />
            ) : (
              <span className="text-[10px] text-muted/60">虛一以待</span>
            )}
          </div>
          <span className="text-[10px] text-muted font-mono">1 枝置旁不用</span>
        </div>

        {/* 中上：掛一區（象三才） */}
        <div className="bg-ink-950/70 border border-ink-700/80 rounded-lg p-2.5 flex flex-col items-center justify-between min-h-[105px]">
          <span className="text-[11px] font-serif text-jade tracking-wide">
            掛一區（象三才）
          </span>
          <div className="flex items-center justify-center py-1">
            {['hanging', 'countLeft', 'countRight', 'gathering'].includes(phase) ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <YarrowStick id="hung-stick" height={64} width={5} tilt={3} isHung />
              </motion.div>
            ) : (
              <span className="text-[10px] text-muted/60">右手抽出一枝</span>
            )}
          </div>
          <span className="text-[10px] text-muted font-mono">
            {['hanging', 'countLeft', 'countRight', 'gathering'].includes(phase)
              ? '掛一：1 枝'
              : '待掛一'}
          </span>
        </div>

        {/* 右上：歸奇區（扐，象閏） */}
        <div className="bg-ink-950/70 border border-ink-700/80 rounded-lg p-2.5 flex flex-col items-center justify-between min-h-[105px]">
          <span className="text-[11px] font-serif text-gold tracking-wide">
            歸奇區（扐，象閏）
          </span>
          <div className="flex items-center justify-center gap-1.5 flex-wrap py-1 px-1 max-w-[120px]">
            {phase === 'gathering' || phase === 'merging' || phase === 'lineFormed' ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 text-gold font-bold text-sm"
              >
                <span>扐 {currentChange?.gathered || totalGatheredForLine} 枝</span>
              </motion.div>
            ) : gatheredForLine.length > 0 ? (
              <div className="text-[11px] text-gold/80 flex flex-col items-center font-mono">
                <span>前變已歸奇：</span>
                <span className="font-bold">{gatheredForLine.join(' + ')} 枝</span>
              </div>
            ) : (
              <span className="text-[10px] text-muted/60">奇數置於指間</span>
            )}
          </div>
          <span className="text-[10px] text-muted font-mono">
            {totalGatheredForLine > 0
              ? `本爻已歸奇 ${totalGatheredForLine} 枝`
              : '合閏餘數'}
          </span>
        </div>
      </div>

      {/* 中央主舞台：蓍草排列與分揲動態 */}
      <div className="flex-1 flex flex-col justify-center items-center py-4 relative">
        {tablePhase && (
          <YarrowTable
            key={`${state.runId}-${lineIndex}-${changeIndex}`}
            total={tableTotal}
            caption={tableCaptions[phase]}
            left={phase === 'splitting' || phase === 'hanging' ? splitData.left : null}
            afterHang={phase === 'hanging'}
            onSplit={phase === 'awaitSplit' ? split : undefined}
          />
        )}

        {/* 階段 6 & 7：countLeft / countRight 揲四 */}
        {(phase === 'countLeft' || phase === 'countRight') && currentChange && (
          <div className="w-full flex flex-col items-center space-y-4">
            {/* 左堆揲四分組 */}
            <div className="w-full bg-ink-950/70 p-3 rounded-xl border border-ink-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-serif font-bold text-gold">
                  左堆揲四（{currentChange.left} 枝）：共 {currentChange.leftGroups} 組，餘數 {currentChange.leftRemainder}
                </span>
                <span className="text-xs text-gold font-mono font-bold bg-gold/15 px-2 py-0.5 rounded border border-gold/30">
                  左餘：{currentChange.leftRemainder} 枝
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* 4 枝一組 */}
                {Array.from({ length: currentChange.leftGroups }, (_, gIdx) => (
                  <div
                    key={gIdx}
                    className="flex gap-0.5 p-1 rounded bg-ink-900 border border-ink-700/80"
                    title={`第 ${gIdx + 1} 組（四枝）`}
                  >
                    {Array.from({ length: 4 }, (_, sIdx) => (
                      <YarrowStick key={sIdx} height={50} width={3.5} />
                    ))}
                  </div>
                ))}
                {/* 餘數高亮 */}
                <div
                  className="flex gap-0.5 p-1 rounded bg-amber-500/20 border border-gold"
                  title={`左堆餘數：${currentChange.leftRemainder} 枝`}
                >
                  {Array.from({ length: currentChange.leftRemainder }, (_, sIdx) => (
                    <YarrowStick key={sIdx} height={50} width={3.5} isHighlighted />
                  ))}
                </div>
              </div>
            </div>

            {/* 右堆揲四分組 */}
            <div
              className={`w-full bg-ink-950/70 p-3 rounded-xl border transition-all ${
                phase === 'countRight' ? 'border-gold/50' : 'border-ink-700 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-serif font-bold text-paper">
                  右堆揲四（{currentChange.rightAfterHang} 枝）：共 {currentChange.rightGroups} 組，餘數 {currentChange.rightRemainder}
                </span>
                {phase === 'countRight' && (
                  <span className="text-xs text-paper font-mono font-bold bg-ink-800 px-2 py-0.5 rounded border border-ink-600">
                    右餘：{currentChange.rightRemainder} 枝
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {Array.from({ length: currentChange.rightGroups }, (_, gIdx) => (
                  <div
                    key={gIdx}
                    className="flex gap-0.5 p-1 rounded bg-ink-900 border border-ink-700/80"
                    title={`第 ${gIdx + 1} 組（四枝）`}
                  >
                    {Array.from({ length: 4 }, (_, sIdx) => (
                      <YarrowStick key={sIdx} height={50} width={3.5} />
                    ))}
                  </div>
                ))}
                {/* 右堆餘數 */}
                <div
                  className={`flex gap-0.5 p-1 rounded ${
                    phase === 'countRight'
                      ? 'bg-amber-500/20 border border-gold'
                      : 'bg-ink-900 border border-ink-700'
                  }`}
                  title={`右堆餘數：${currentChange.rightRemainder} 枝`}
                >
                  {Array.from({ length: currentChange.rightRemainder }, (_, sIdx) => (
                    <YarrowStick
                      key={sIdx}
                      height={50}
                      width={3.5}
                      isHighlighted={phase === 'countRight'}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 階段 8：gathering 歸奇 */}
        {phase === 'gathering' && currentChange && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center bg-ink-950/80 p-5 rounded-2xl border border-gold/40 text-center space-y-3"
          >
            <span className="text-xs font-serif text-muted">本次歸奇於扐（象閏月）</span>
            <div className="flex items-center gap-3 font-mono text-base sm:text-lg">
              <span className="text-jade font-bold">掛一(1)</span>
              <span>+</span>
              <span className="text-gold font-bold">左餘({currentChange.leftRemainder})</span>
              <span>+</span>
              <span className="text-paper font-bold">右餘({currentChange.rightRemainder})</span>
              <span>=</span>
              <span className="text-xl sm:text-2xl font-bold text-gold bg-gold/20 px-3 py-1 rounded-lg border border-gold">
                {currentChange.gathered} 枝
              </span>
            </div>
            <span className="text-xs text-muted">
              正營剩餘：{currentChange.total} − {currentChange.gathered} = {currentChange.after} 枝
            </span>
          </motion.div>
        )}

        {/* 階段 10：lineFormed 三變皆畢成爻 */}
        {phase === 'lineFormed' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center bg-ink-950/80 p-5 rounded-2xl border border-gold/60 text-center space-y-3"
          >
            <div className="flex items-center gap-2 text-gold">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-serif font-bold text-base sm:text-lg">三變圓滿成爻！</span>
            </div>
            {(() => {
              const lastVal = lines[lines.length - 1];
              const remaining = lastVal * 4;
              return (
                <div className="space-y-1 font-mono">
                  <div className="text-sm text-paper">
                    剩餘蓍草數：<span className="text-gold font-bold">{remaining}</span> 枝
                  </div>
                  <div className="text-base sm:text-lg font-bold text-gold">
                    {remaining} ÷ 4 = {lastVal} ➔ {getLineName(lastVal)}
                  </div>
                </div>
              );
            })()}
            <span className="text-xs text-muted animate-pulse">
              爻線已即時飛入右側卦象區相應爻位
            </span>
          </motion.div>
        )}

        {/* 階段 11：finished 六爻皆成 */}
        {phase === 'finished' && (
          <div className="flex flex-col items-center text-center space-y-3 p-4">
            <span className="text-3xl text-gold animate-bounce">☯</span>
            <h3 className="font-serif font-bold text-xl text-paper">
              十有八變圓滿成卦
            </h3>
            <p className="text-xs text-muted max-w-md leading-relaxed">
              六爻已依大衍之數完全推演得出。請參閱右側卦象及下方卦辭、變爻爻辭與解卦指引。紀錄已自動儲存。
            </p>
          </div>
        )}
      </div>

      {/* 底部輔助條 */}
      <div className="border-t border-ink-700/60 pt-2.5 flex items-center justify-between text-[11px] text-muted">
        <span className="font-serif">大衍筮法：分二 ➔ 掛一 ➔ 揲四 ➔ 歸奇</span>
        <span className="font-mono">
          {phase === 'awaitSplit'
            ? '待分二'
            : phase === 'finished'
            ? '卜卦已完成'
            : '推演計算中...'}
        </span>
      </div>
    </div>
  );
}
