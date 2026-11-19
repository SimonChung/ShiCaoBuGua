import React from 'react';
import { useDivination } from '../state/DivinationContext.jsx';
import { Play, RotateCcw, FastForward, SkipForward, Gauge } from 'lucide-react';

export function ControlBar() {
  const { state, startOrRestart, skipChange, skipAll, setSpeed } = useDivination();
  const { phase, speed, question } = state;

  const isIdle = phase === 'idle';
  const isFinished = phase === 'finished';
  const isRunning = !isIdle && !isFinished;

  const handleStartRestart = () => {
    startOrRestart(question);
  };

  const speedOptions = [0.5, 1, 2, 4];

  return (
    <div className="bg-ink-900 border border-ink-600/60 rounded-xl p-3 sm:p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
      {/* 主要按鈕：開始 / 重新開始 */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleStartRestart}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm sm:text-base tracking-wide transition-all shadow-md active:scale-95 cursor-pointer ${
            isIdle
              ? 'bg-gold hover:bg-gold-hover text-ink-950 font-bold shadow-gold/20'
              : 'bg-ink-800 hover:bg-ink-700 text-gold border border-gold/40 hover:border-gold'
          }`}
          title={isIdle ? '開始卜卦' : '隨時按下重新卜卦'}
        >
          {isIdle ? (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>開始卜卦</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>重新卜卦</span>
            </>
          )}
        </button>

        {/* 快捷跳過按鈕 */}
        {isRunning && (
          <div className="flex items-center gap-2">
            <button
              onClick={skipChange}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ink-800 hover:bg-ink-700 text-paper/90 border border-ink-600 hover:border-paper/40 transition-all text-xs sm:text-sm cursor-pointer"
              title="立即完成當前這一變"
            >
              <SkipForward className="w-3.5 h-3.5 text-gold" />
              <span>跳過本變</span>
            </button>
            <button
              onClick={skipAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ink-800 hover:bg-ink-700 text-paper/90 border border-ink-600 hover:border-paper/40 transition-all text-xs sm:text-sm cursor-pointer"
              title="剩餘所有變以隨機切分快速算出結果"
            >
              <FastForward className="w-3.5 h-3.5 text-gold" />
              <span>快速完成</span>
            </button>
          </div>
        )}
      </div>

      {/* 動畫速度切換 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted flex items-center gap-1 select-none">
          <Gauge className="w-3.5 h-3.5" />
          <span>動畫速度</span>
        </span>
        <div className="flex bg-ink-950 p-1 rounded-lg border border-ink-700">
          {speedOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setSpeed(opt)}
              className={`px-2.5 py-1 text-xs rounded transition-all cursor-pointer ${
                speed === opt
                  ? 'bg-gold text-ink-950 font-bold shadow-sm'
                  : 'text-muted hover:text-paper hover:bg-ink-800'
              }`}
            >
              {opt}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
