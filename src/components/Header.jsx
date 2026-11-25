import React from 'react';
import { History, Sparkles } from 'lucide-react';

export function Header({ onOpenHistory }) {
  return (
    <>
      <header className="bg-ink-900 px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl sm:text-3xl text-gold select-none animate-pulse">☯</span>
            <div>
              <div className="text-base sm:text-lg font-serif font-bold text-paper tracking-wider flex items-center gap-2">
                蓍草卜卦
                <span className="text-xs sm:text-sm font-sans px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/30">
                  周易大衍筮法
                </span>
              </div>
              <h2 className="font-serif font-bold text-gold text-xl sm:text-3xl tracking-wide text-balance">
                大衍之數五十，其用四十有九。
              </h2>
              <p className="text-sm sm:text-base text-paper/90 leading-relaxed">
                分而為二以象兩，掛一以象三，揲之以四以象四時，歸奇於扐以象閏，五歲再閏，故再扐而後掛。天數五，地數五，五位相得而各有合。天數二十有五，地數三十，凡天地之數，五十有五，此所以成變化，而行鬼神也。乾之策二百一十有六，坤之策百四十有四，凡三百有六十，當期之日。二篇之策，萬有一千五百二十，當萬物之數也，是故，四營而成易，十有八變而成卦，八卦而小成，引而伸之，觸類而長之，天下之能事畢矣。顯道，神德行，是故可與酬酢，可與祐神矣。
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
    </>
  );
}
