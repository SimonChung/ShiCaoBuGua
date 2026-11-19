import React from 'react';
import { useDivination } from '../state/DivinationContext.jsx';
import { HelpCircle } from 'lucide-react';

export function QuestionInput() {
  const { state, setQuestion } = useDivination();
  const { phase, question } = state;

  const isLocked = phase !== 'idle' && phase !== 'finished';

  return (
    <div className="bg-ink-900 border border-ink-600/60 rounded-xl p-3 sm:p-4 shadow-md transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
        <label htmlFor="question-input" className="text-sm font-medium text-paper flex items-center gap-1.5">
          <span className="text-gold">✦</span>
          <span>所問之事</span>
          <span className="text-xs text-muted font-normal">（心誠則靈，請靜心默念）</span>
        </label>
        {isLocked && (
          <span className="text-xs text-gold/80 bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
            卜卦進行中已鎖定
          </span>
        )}
      </div>

      <div className="relative">
        <input
          id="question-input"
          type="text"
          maxLength={200}
          disabled={isLocked}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="例如：今年職涯規劃、換工作是否合適、此行吉凶？（可留空）"
          className={`w-full bg-ink-950 border text-paper placeholder-muted/60 rounded-lg px-3.5 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-colors ${
            isLocked
              ? 'border-ink-700/50 opacity-75 cursor-not-allowed bg-ink-900/50'
              : 'border-ink-600 hover:border-ink-600/90'
          }`}
        />
        <span className="absolute right-3 top-2.5 text-xs text-muted select-none">
          {question.length}/200
        </span>
      </div>
    </div>
  );
}
