import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { divinationReducer, INITIAL_STATE } from './reducer.js';
import { saveRecord } from '../services/records.js';

const DivinationContext = createContext(null);

export function DivinationProvider({ children }) {
  const [state, dispatch] = useReducer(divinationReducer, INITIAL_STATE, (init) => {
    // 讀取先前儲存的速度設定
    try {
      const savedSpeed = localStorage.getItem('shicao.speed');
      if (savedSpeed) {
        const parsed = parseFloat(savedSpeed);
        if ([0.5, 1, 2, 4].includes(parsed)) {
          return { ...init, speed: parsed };
        }
      }
    } catch {
      // ignore
    }
    return init;
  });

  // 自動存檔：當進入 finished 階段時自動呼叫 saveRecord
  useEffect(() => {
    if (state.phase === 'finished' && state.lines.length === 6 && !state.recordSaved) {
      const record = {
        question: state.question,
        startedAt: state.startedAt,
        finishedAt: state.finishedAt,
        lines: state.lines,
        changes: state.changes,
        primary: state.primaryHex,
        changed: state.changedHex,
        movingLines: state.movingLines,
      };

      saveRecord(record).then(res => {
        if (res.ok) {
          dispatch({ type: 'SET_RECORD_SAVED', payload: res });
        }
      });
    }
  }, [state.phase, state.lines, state.primaryHex, state.changedHex, state.movingLines, state.recordSaved, state.question, state.startedAt, state.finishedAt, state.changes]);

  const startOrRestart = useCallback((question) => {
    dispatch({ type: 'RESET_AND_START', payload: { question } });
  }, []);

  const split = useCallback((k) => {
    dispatch({ type: 'SPLIT', payload: { k } });
  }, []);

  const advance = useCallback(() => {
    dispatch({ type: 'ADVANCE' });
  }, []);

  const skipChange = useCallback(() => {
    dispatch({ type: 'SKIP_CHANGE' });
  }, []);

  const skipAll = useCallback(() => {
    dispatch({ type: 'SKIP_ALL' });
  }, []);

  const setSpeed = useCallback((speed) => {
    try {
      localStorage.setItem('shicao.speed', String(speed));
    } catch {
      // ignore
    }
    dispatch({ type: 'SET_SPEED', payload: { speed } });
  }, []);

  const setQuestion = useCallback((text) => {
    dispatch({ type: 'SET_QUESTION', payload: { text } });
  }, []);

  const value = {
    state,
    dispatch,
    startOrRestart,
    split,
    advance,
    skipChange,
    skipAll,
    setSpeed,
    setQuestion,
  };

  return (
    <DivinationContext.Provider value={value}>
      {children}
    </DivinationContext.Provider>
  );
}

export function useDivination() {
  const context = useContext(DivinationContext);
  if (!context) {
    throw new Error('useDivination must be used within a DivinationProvider');
  }
  return context;
}
