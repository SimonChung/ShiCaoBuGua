import React, { useState } from 'react';
import { DivinationProvider, useDivination } from './state/DivinationContext.jsx';
import { useStepRunner } from './hooks/useStepRunner.js';
import { Header } from './components/Header.jsx';
import { QuestionInput } from './components/QuestionInput.jsx';
import { ControlBar } from './components/ControlBar.jsx';
import { ProgressIndicator } from './components/ProgressIndicator.jsx';
import { StepNarration } from './components/StepNarration.jsx';
import { YarrowBoard } from './components/YarrowBoard.jsx';
import { HexagramPanel } from './components/HexagramPanel.jsx';
import { ReadingPanel } from './components/ReadingPanel.jsx';
import { HistoryDrawer } from './components/HistoryDrawer.jsx';

function DivinationApp() {
  // 自動推進動畫時序（受速度與階段控制）
  useStepRunner();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink-950 text-paper flex flex-col">
      <Header onOpenHistory={() => setIsHistoryOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* 輸入所問之事 */}
        <QuestionInput />

        {/* 控制列（開始/重新卜卦、速度、跳過） */}
        <ControlBar />

        {/* 進度條與當前爻變進度 */}
        <ProgressIndicator />

        {/* 步驟釋義與經典引導 */}
        <StepNarration />

        {/* 核心操作舞台：左為蓍草動畫操作舞台，右為卦象展示區 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          <div className="lg:col-span-8 w-full">
            <YarrowBoard />
          </div>
          <div className="lg:col-span-4 w-full">
            <HexagramPanel />
          </div>
        </div>

        {/* 卜卦完成解讀區（卦名、卦辭、變爻爻辭、解卦參考與匯出下載） */}
        <ReadingPanel />
      </main>

      {/* 頁尾 */}
      <footer className="border-t border-ink-700/60 py-4 text-center text-xs text-muted">
        <p className="font-serif">
          《易經》大衍筮法求卦模擬系統 ｜ 其用四十有九 ｜ 十有八變而成卦
        </p>
      </footer>

      {/* 歷史紀錄抽屜 */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <DivinationProvider>
      <DivinationApp />
    </DivinationProvider>
  );
}
