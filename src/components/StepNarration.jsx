import React from 'react';
import { useDivination } from '../state/DivinationContext.jsx';
import { Sparkles, Info } from 'lucide-react';

export function StepNarration() {
  const { state } = useDivination();
  const { phase, split, currentChange, gatheredForLine } = state;

  const getNarration = () => {
    switch (phase) {
      case 'idle':
        return {
          classic: '大衍之數五十，其用四十有九。',
          vernacular: '周易以五十根蓍草起筮，虛其一以象太極，其用四十有九。請點擊「開始卜卦」。',
        };
      case 'setup':
        return {
          classic: '其用四十有九，虛一不用以象太極。',
          vernacular: '從一束五十枝蓍草中取出一枝置於旁，象徵天地未分之太極，其餘四十九枝用以起筮。',
        };
      case 'awaitSplit':
        return {
          classic: '分而為二以象兩儀。',
          vernacular: '在草束中選一處按住，用手指或滑鼠把右側蓍草撥開。放手後揭示左右枝數，以象天地兩儀。',
        };
      case 'splitting':
        return {
          classic: '分而為二以象兩儀。',
          vernacular: `已切分為左堆 ${split?.left ?? ''} 枝、右堆 ${split?.right ?? ''} 枝，天地陰陽已分。`,
        };
      case 'hanging':
        return {
          classic: '掛一以象三。',
          vernacular: '從右堆中抽出一枝，向上移至掛一區，象徵天地人三才。',
        };
      case 'countLeft':
        return {
          classic: '揲之以四以象四時（左堆）。',
          vernacular: `左堆 ${currentChange?.left ?? ''} 枝，每四枝為一組數出（共 ${currentChange?.leftGroups ?? ''} 組），餘數為 ${currentChange?.leftRemainder ?? ''} 枝。`,
        };
      case 'countRight':
        return {
          classic: '揲之以四以象四時（右堆）。',
          vernacular: `右堆（扣除掛一之一枝後剩 ${currentChange?.rightAfterHang ?? ''} 枝），每四枝為一組數出（共 ${currentChange?.rightGroups ?? ''} 組），餘數為 ${currentChange?.rightRemainder ?? ''} 枝。`,
        };
      case 'gathering':
        return {
          classic: '歸奇於扐以象閏。',
          vernacular: `將掛一之 1 枝、左餘 ${currentChange?.leftRemainder ?? ''} 枝、右餘 ${currentChange?.rightRemainder ?? ''} 枝合置於扐，本次歸奇共 ${currentChange?.gathered ?? ''} 枝（象閏月）。`,
        };
      case 'merging':
        return {
          classic: '五歲再閏，故再扐而後掛。',
          vernacular: `除去歸奇之蓍草，剩餘 ${currentChange?.after ?? ''} 枝重新合聚，準備進行下一變。`,
        };
      case 'lineFormed': {
        const lastGathered = gatheredForLine;
        const totalGathered = lastGathered.reduce((a, b) => a + b, 0);
        const remaining = 49 - totalGathered;
        const val = remaining / 4;
        return {
          classic: '三變而成爻。',
          vernacular: `三變皆畢，歸奇共計 ${totalGathered} 枝，剩餘 ${remaining} 枝。${remaining} ÷ 4 = ${val}，得一爻飛入卦象！`,
        };
      }
      case 'finished':
        return {
          classic: '十有八變而成卦。',
          vernacular: '六爻皆具，吉凶生大業。右側已展示本卦與變卦，下方附卦辭、變爻爻辭及解卦指南。',
        };
      default:
        return { classic: '', vernacular: '' };
    }
  };

  const { classic, vernacular } = getNarration();

  return (
    <div
      aria-live="polite"
      className="bg-ink-900/90 border border-gold/30 rounded-xl p-3 sm:p-4 shadow-inner flex items-start gap-3 transition-all"
    >
      <div className="p-2 rounded-lg bg-gold/10 text-gold shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="space-y-1">
        <div className="font-serif font-bold text-gold tracking-wide text-sm sm:text-base">
          {classic}
        </div>
        <div className="text-xs sm:text-sm text-paper/90 leading-relaxed">
          {vernacular}
        </div>
      </div>
    </div>
  );
}
