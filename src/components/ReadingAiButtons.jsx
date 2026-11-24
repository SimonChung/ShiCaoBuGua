import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { buildReadingPrompt } from '../core/readingPrompt.js';

const providers = [
  { name: 'ChatGPT', url: 'https://chatgpt.com/' },
  { name: 'Gemini', url: 'https://gemini.google.com/app' },
];

export function ReadingAiButtons({ record }) {
  const prompt = buildReadingPrompt(record);
  const [result, setResult] = useState(null);

  async function copyAndOpen(provider) {
    setResult({ state: 'copying', provider });
    let tab;
    try {
      // 在同一次點擊中開始複製並取得新分頁，剪貼簿成功後才前往 AI 網站。
      const copied = navigator.clipboard.writeText(prompt);
      tab = window.open('about:blank', '_blank');
      if (tab) tab.opener = null;
      await copied;
    } catch {
      tab?.close();
      setResult({ state: 'manual', provider });
      return;
    }

    if (!tab || tab.closed) {
      setResult({ state: 'blocked', provider });
      return;
    }
    tab.location.replace(provider.url);
    setResult({ state: 'opened', provider });
  }

  const manual = result?.state === 'manual';
  const blocked = result?.state === 'blocked';
  return (
    <div role="group" aria-label="AI 解卦" className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-serif font-bold text-gold">AI 解卦</span>
        {providers.map(provider => (
          <button
            key={provider.name}
            type="button"
            disabled={!prompt || result?.state === 'copying'}
            onClick={() => copyAndOpen(provider)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-xs text-paper hover:border-gold hover:bg-ink-700 disabled:opacity-50 cursor-pointer"
          >
            複製並開啟 {provider.name}
            <ExternalLink aria-hidden="true" className="size-3.5 text-gold" />
          </button>
        ))}
      </div>
      <p role="status" className="text-xs text-muted">
        {!prompt && '這筆紀錄缺少完整六爻，無法產生提示詞。'}
        {prompt && !result && '複製這一卦的解卦提示詞，到新分頁貼上並送出。'}
        {result?.state === 'copying' && '正在複製提示詞…'}
        {result?.state === 'opened' && `已複製，請到 ${result.provider.name} 的新分頁貼上並送出。`}
        {blocked && '提示詞已複製。請點下方連結開啟新分頁，再貼上送出。'}
        {manual && '瀏覽器未允許自動複製。請複製下方提示詞，再開啟新分頁。'}
      </p>
      {manual && (
        <textarea
          aria-label="手動複製解卦提示詞" readOnly value={prompt} rows={5}
          onFocus={event => event.currentTarget.select()}
          className="w-full rounded border border-ink-600 bg-ink-950 p-2 text-sm text-paper"
        />
      )}
      {(manual || blocked) && (
        <a href={result.provider.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gold underline">
          開啟 {result.provider.name}
        </a>
      )}
    </div>
  );
}
