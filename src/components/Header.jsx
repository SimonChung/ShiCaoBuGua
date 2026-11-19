import React from 'react';
import { History, BookOpen } from 'lucide-react';

export function Header({ onOpenHistory }) {
  return (
    <header className="border-b border-ink-600/70 bg-ink-900/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl sm:text-3xl text-gold select-none animate-pulse">☯</span>
          <div>
            <h1 className="text-lg sm:text-2xl font-serif font-bold text-paper tracking-wider flex items-center gap-2">
              蓍草卜卦
              <span className="text-xs sm:text-sm font-sans px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/30">
                周易大衍筮法
              </span>
            </h1>
            <p className="text-xs text-muted hidden sm:block">
              「大衍之數五十，其用四十有九。分而為二以象兩，掛一以象三，揲之以四以象四時，歸奇於扐以象閏。」
            </p>
          </div>
        </div>

        <button
          onClick={onOpenHistory}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-ink-800 hover:bg-ink-700 text-paper border border-ink-600/80 hover:border-gold/50 transition-all text-xs sm:text-sm font-medium shadow-sm hover:text-gold cursor-pointer"
          title="調閱歷史卜卦紀錄"
          aria-label="調閱歷史紀錄"
        >
          <History className="w-4 h-4 text-gold" />
          <span>歷史紀錄</span>
        </button>
      </div>
    </header>
  );
}
