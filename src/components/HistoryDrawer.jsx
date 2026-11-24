import React, { useState, useEffect } from 'react';
import { listRecords, getRecord, deleteRecord, toMarkdown, downloadFile } from '../services/records.js';
import { formatDateTime } from '../utils/format.js';
import { HexagramFigure } from './HexagramFigure.jsx';
import { ReadingAiButtons } from './ReadingAiButtons.jsx';
import { X, Search, Trash2, Download, Calendar, ArrowRight, BookOpen, HardDrive, Database } from 'lucide-react';

export function HistoryDrawer({ isOpen, onClose }) {
  const [records, setRecords] = useState([]);
  const [source, setSource] = useState('fs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await listRecords();
    setRecords(res.records || []);
    setSource(res.source);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setSelectedRecord(null);
    }
  }, [isOpen]);

  // ESC 關閉抽屜
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (selectedRecord) {
          setSelectedRecord(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedRecord, onClose]);

  const filteredRecords = records.filter((r) => {
    const q = r.question || '';
    const primName = r.primary?.fullName || r.primary?.name || '';
    const chName = r.changed?.fullName || r.changed?.name || '';
    const match = `${q} ${primName} ${chName}`.toLowerCase();
    return match.includes(searchTerm.toLowerCase());
  });

  const handleSelectRecord = async (id) => {
    const rec = await getRecord(id);
    setSelectedRecord(rec);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('確定要刪除這筆卜卦紀錄嗎？')) return;
    await deleteRecord(id);
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
    loadData();
  };

  const handleDownload = (rec, type, e) => {
    if (e) e.stopPropagation();
    if (type === 'md') {
      const md = toMarkdown(rec);
      downloadFile(md, `shicao-${rec.id}.md`, 'text/markdown;charset=utf-8');
    } else {
      downloadFile(JSON.stringify(rec, null, 2), `shicao-${rec.id}.json`, 'application/json;charset=utf-8');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 遮罩背景 */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* 抽屜主體 */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-ink-900 border-l border-ink-600/80 shadow-2xl flex flex-col">
          {/* 抽屜頂部 Header */}
          <div className="px-5 py-4 border-b border-ink-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl text-gold">📜</span>
              <h2 className="font-serif font-bold text-lg text-paper">
                {selectedRecord ? '卜卦詳細紀錄' : '歷史卜卦紀錄'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[11px] text-muted">
                {source === 'fs' ? (
                  <>
                    <HardDrive className="w-3.5 h-3.5 text-jade" />
                    <span>本機檔案 (records/)</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5 text-gold" />
                    <span>本機儲存 (localStorage)</span>
                  </>
                )}
              </div>
              <button
                onClick={selectedRecord ? () => setSelectedRecord(null) : onClose}
                className="p-1 rounded-lg hover:bg-ink-800 text-muted hover:text-paper transition-colors cursor-pointer"
                aria-label="關閉"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 搜尋與過濾（在清單檢視時顯示） */}
          {!selectedRecord && (
            <div className="p-4 border-b border-ink-700/60 bg-ink-950/40">
              <div className="relative">
                <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="搜尋所問之事、卦名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-ink-950 border border-ink-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-paper placeholder-muted/60 focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          )}

          {/* 內容區 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedRecord ? (
              // 詳細檢視
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="text-xs text-gold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    ← 返回紀錄清單
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDownload(selectedRecord, 'md', e)}
                      className="px-2.5 py-1 text-xs rounded bg-ink-800 hover:bg-ink-700 text-paper border border-ink-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-gold" />
                      <span>.md</span>
                    </button>
                    <button
                      onClick={(e) => handleDownload(selectedRecord, 'json', e)}
                      className="px-2.5 py-1 text-xs rounded bg-ink-800 hover:bg-ink-700 text-paper border border-ink-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-gold" />
                      <span>.json</span>
                    </button>
                    <button
                      onClick={(e) => handleDelete(selectedRecord.id, e)}
                      className="px-2 py-1 text-xs rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 詳細資訊卡 */}
                <div className="bg-ink-950/70 p-4 rounded-xl border border-ink-700 space-y-3">
                  <div className="text-xs text-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDateTime(selectedRecord.startedAt)}</span>
                  </div>

                  <div>
                    <span className="text-xs text-gold font-bold">所問之事：</span>
                    <p className="text-sm text-paper mt-0.5">
                      {selectedRecord.question || '（未具體填寫）'}
                    </p>
                  </div>

                  <ReadingAiButtons key={selectedRecord.id} record={selectedRecord} />

                  {/* 雙卦展示 */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex flex-col items-center">
                      <HexagramFigure
                        lines={selectedRecord.lines}
                        title={`本卦：${selectedRecord.primary?.name || ''}`}
                        subtitle={selectedRecord.primary?.fullName || ''}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      {selectedRecord.changed ? (
                        <HexagramFigure
                          lines={selectedRecord.lines?.map(v => (v === 9 ? 8 : v === 6 ? 7 : v))}
                          title={`變卦：${selectedRecord.changed?.name || ''}`}
                          subtitle={selectedRecord.changed?.fullName || ''}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center p-4 border border-dashed border-ink-700 rounded-xl text-center text-xs text-muted">
                          無變卦
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 卦辭 */}
                  {selectedRecord.primary && (
                    <div className="border-t border-ink-700 pt-3">
                      <span className="text-xs font-bold text-gold">本卦卦辭：</span>
                      <p className="text-xs sm:text-sm text-paper/90 font-serif mt-1 leading-relaxed">
                        {selectedRecord.primary.judgment}
                      </p>
                    </div>
                  )}

                  {/* 變爻爻辭 */}
                  {selectedRecord.movingLines?.length > 0 && selectedRecord.primary && (
                    <div className="border-t border-ink-700 pt-3 space-y-1.5">
                      <span className="text-xs font-bold text-gold">變爻爻辭：</span>
                      {selectedRecord.movingLines.map(pos => {
                        const lData = selectedRecord.primary.lines?.[pos - 1];
                        if (!lData) return null;
                        return (
                          <div key={pos} className="text-xs bg-ink-900/60 p-2 rounded border border-ink-700/60">
                            <span className="font-serif font-bold text-gold mr-2">{lData.label}：</span>
                            <span className="font-serif text-paper/90">{lData.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // 清單檢視
              <>
                {loading ? (
                  <div className="text-center py-10 text-xs text-muted">載入紀錄中...</div>
                ) : filteredRecords.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted space-y-2">
                    <p>尚無符合的卜卦紀錄</p>
                    <p className="text-[11px] text-muted/60">每次卜卦完成後系統皆會自動記錄於此</p>
                  </div>
                ) : (
                  filteredRecords.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => handleSelectRecord(rec.id)}
                      className="p-3.5 rounded-xl bg-ink-950/60 hover:bg-ink-950 border border-ink-700/70 hover:border-gold/50 transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between text-[11px] text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDateTime(rec.startedAt)}</span>
                        </span>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={(e) => handleDownload(rec, 'md', e)}
                            className="p-1 hover:text-gold transition-colors"
                            title="下載 Markdown"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(rec.id, e)}
                            className="p-1 hover:text-red-400 transition-colors"
                            title="刪除紀錄"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="font-medium text-sm text-paper group-hover:text-gold transition-colors line-clamp-1">
                        {rec.question || '（默念求卦，未具名）'}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-serif text-muted">
                        <span className="text-paper/90 font-bold">
                          {rec.primary?.fullName || '本卦'}
                        </span>
                        {rec.changed && (
                          <>
                            <ArrowRight className="w-3 h-3 text-gold/60" />
                            <span className="text-paper/90 font-bold">
                              {rec.changed.fullName}
                            </span>
                          </>
                        )}
                        {rec.movingLines?.length > 0 && (
                          <span className="ml-auto text-[10px] font-sans px-1.5 py-0.2 rounded bg-gold/10 text-gold border border-gold/20">
                            {rec.movingLines.length} 變爻
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
