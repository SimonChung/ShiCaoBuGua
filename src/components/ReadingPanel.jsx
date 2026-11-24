import React, { useState } from 'react';
import { useDivination } from '../state/DivinationContext.jsx';
import { readingGuide } from '../core/hexagram.js';
import { toMarkdown, downloadFile } from '../services/records.js';
import { ReadingAiButtons } from './ReadingAiButtons.jsx';
import { Download, Copy, Check, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

export function ReadingPanel() {
  const { state } = useDivination();
  const {
    phase,
    lines,
    primaryHex,
    changedHex,
    movingLines,
    readingQuestion: question,
    startedAt,
    finishedAt,
    changes,
    recordSaved,
  } = state;

  const [copied, setCopied] = useState(false);

  if (phase !== 'finished' || !primaryHex) {
    return null;
  }

  const guide = readingGuide(lines, primaryHex, changedHex);

  const fullRecord = {
    id: recordSaved?.id,
    question,
    startedAt,
    finishedAt,
    lines,
    changes,
    primary: primaryHex,
    changed: changedHex,
    movingLines,
  };

  const handleDownloadMd = () => {
    const md = toMarkdown(fullRecord);
    const fname = `shicao-${(recordSaved?.id || 'record')}.md`;
    downloadFile(md, fname, 'text/markdown;charset=utf-8');
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(fullRecord, null, 2);
    const fname = `shicao-${(recordSaved?.id || 'record')}.json`;
    downloadFile(jsonStr, fname, 'application/json;charset=utf-8');
  };

  const handleCopyText = async () => {
    const md = toMarkdown(fullRecord);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-ink-900 border border-ink-600/70 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      {/* 標題與操作區 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-700 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gold" />
            <span>易經解卦與辭理</span>
          </h2>
          {question && (
            <p className="text-sm text-paper/90 mt-1">
              所問之事：<span className="text-gold font-medium">{question}</span>
            </p>
          )}
        </div>

        {/* 存檔狀態與下載按鈕 */}
        <div className="flex flex-wrap items-center gap-2">
          {recordSaved && (
            <span className="text-xs text-jade bg-jade/10 border border-jade/30 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>{recordSaved.source === 'fs' ? '已儲存至 records/' : '已存於本機'}</span>
            </span>
          )}

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-ink-800 hover:bg-ink-700 text-paper border border-ink-600 hover:border-gold/50 transition-all cursor-pointer"
            title="複製完整占卦 Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-jade" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '已複製' : '複製文字'}</span>
          </button>

          <button
            onClick={handleDownloadMd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-ink-800 hover:bg-ink-700 text-paper border border-ink-600 hover:border-gold/50 transition-all cursor-pointer"
            title="下載 .md 紀錄檔"
          >
            <Download className="w-3.5 h-3.5 text-gold" />
            <span>下載 .md</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-ink-800 hover:bg-ink-700 text-paper border border-ink-600 hover:border-gold/50 transition-all cursor-pointer"
            title="下載 .json 資料檔"
          >
            <Download className="w-3.5 h-3.5 text-gold" />
            <span>下載 .json</span>
          </button>
        </div>
      </div>

      <ReadingAiButtons record={fullRecord} />

      {/* 朱熹《易學啟蒙》解卦指引 */}
      {guide && (
        <div className="bg-ink-950/80 border border-gold/40 rounded-xl p-4 shadow-inner space-y-1.5">
          <div className="flex items-center gap-2 text-gold font-serif font-bold text-sm sm:text-base">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>解卦參考（朱熹《易學啟蒙》筮法準則）</span>
            <span className="text-xs px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/30 font-sans">
              {guide.ruleName}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-paper/95 leading-relaxed">
            {guide.summary}
          </p>
          <div className="pt-1 flex flex-wrap gap-2 text-xs">
            <span className="text-muted">主要參看重點：</span>
            {guide.focus.map((f, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-gold/20 text-gold border border-gold/40 font-serif font-bold"
              >
                {f.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 雙卡片：本卦與變卦 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 卡片 1：本卦 */}
        <div className="bg-ink-950/60 border border-ink-700/80 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="border-b border-ink-700 pb-2.5">
            <div className="text-xs text-gold font-mono">第 {primaryHex.number} 卦</div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-paper flex items-center justify-between">
              <span>{primaryHex.fullName}</span>
              <span className="text-xs font-sans text-muted font-normal">
                上{primaryHex.upper}（{primaryHex.upperNature}）下{primaryHex.lower}（{primaryHex.lowerNature}）
              </span>
            </h3>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-1">
              【卦辭】
            </h4>
            <p className="text-sm sm:text-base text-paper font-serif leading-relaxed bg-ink-900/60 p-3 rounded-lg border border-ink-700/60">
              {primaryHex.judgment}
            </p>
          </div>

          {/* 變爻爻辭 */}
          <div>
            <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>【變爻爻辭】</span>
              <span className="text-[11px] font-normal text-muted">
                共 {movingLines.length} 個變爻
              </span>
            </h4>
            {movingLines.length > 0 ? (
              <div className="space-y-2">
                {movingLines.map((pos) => {
                  const lineData = primaryHex.lines[pos - 1];
                  const lineVal = lines[pos - 1];
                  const isSun = lineVal === 9;

                  return (
                    <div
                      key={pos}
                      className="p-3 rounded-lg bg-ink-900 border border-ink-600/80 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-paper text-sm flex items-center gap-2">
                          <span>{lineData.label}</span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded font-sans ${
                              isSun
                                ? 'bg-cinnabar/20 text-cinnabar border border-cinnabar/30'
                                : 'bg-verdant/20 text-verdant border border-verdant/30'
                            }`}
                          >
                            {isSun ? '○ 老陽 (9)' : '✕ 老陰 (6)'}
                          </span>
                        </span>
                        <span className="text-[11px] text-muted font-mono">
                          第 {pos} 爻
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-paper/90 font-serif leading-relaxed pt-1">
                        {lineData.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted italic bg-ink-900/40 p-2.5 rounded-lg border border-ink-700/50">
                本卦無動爻，純觀本卦卦辭。
              </p>
            )}
          </div>

          {/* 特殊：用九 / 用六 */}
          {primaryHex.extra && movingLines.length === 6 && (
            <div className="p-3 rounded-lg bg-gold/10 border border-gold/40">
              <span className="text-xs font-bold text-gold block mb-1">
                【{primaryHex.extra.label}】
              </span>
              <p className="text-sm font-serif text-paper">
                {primaryHex.extra.text}
              </p>
            </div>
          )}
        </div>

        {/* 卡片 2：變卦 */}
        <div className="bg-ink-950/60 border border-ink-700/80 rounded-xl p-4 sm:p-5 space-y-4">
          {changedHex ? (
            <>
              <div className="border-b border-ink-700 pb-2.5">
                <div className="text-xs text-gold font-mono">第 {changedHex.number} 卦</div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-paper flex items-center justify-between">
                  <span>{changedHex.fullName}</span>
                  <span className="text-xs font-sans text-muted font-normal">
                    上{changedHex.upper}（{changedHex.upperNature}）下{changedHex.lower}（{changedHex.lowerNature}）
                  </span>
                </h3>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-1">
                  【卦辭】
                </h4>
                <p className="text-sm sm:text-base text-paper font-serif leading-relaxed bg-ink-900/60 p-3 rounded-lg border border-ink-700/60">
                  {changedHex.judgment}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                  【之卦六爻】
                </h4>
                <div className="space-y-1.5 text-xs text-muted/80">
                  {changedHex.lines.map((l, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="w-10 font-serif text-paper/70 shrink-0">
                        {l.label}
                      </span>
                      <span className="truncate">{l.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
              <span className="text-3xl text-muted/40">☯</span>
              <h3 className="font-serif font-bold text-paper/90 text-base">
                六爻皆不變，無變卦
              </h3>
              <p className="text-xs text-muted leading-relaxed max-w-xs">
                所得六爻皆為少陽（七）或少陰（八），無老陽（九）亦無老陰（六）。依易法無之卦，專以本卦卦辭全體定吉凶。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
