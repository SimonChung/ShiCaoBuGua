import { useEffect, useRef } from 'react';
import { useDivination } from '../state/DivinationContext.jsx';

/**
 * 依階段自動推進動畫時序（受速度控制）
 */
export function useStepRunner() {
  const { state, advance } = useDivination();
  const { phase, speed, runId, currentChange } = state;

  const timerRef = useRef(null);

  useEffect(() => {
    // 清除先前的計時器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // idle, awaitSplit, finished 不需要自動計時推進
    if (['idle', 'awaitSplit', 'finished'].includes(phase)) {
      return;
    }

    let baseDurationMs = 800;

    switch (phase) {
      case 'setup':
        baseDurationMs = 1800;
        break;
      case 'splitting':
        baseDurationMs = 800;
        break;
      case 'hanging':
        baseDurationMs = 700;
        break;
      case 'countLeft': {
        const groups = currentChange?.leftGroups || 5;
        baseDurationMs = Math.max(900, groups * 180 + 400);
        break;
      }
      case 'countRight': {
        const groups = currentChange?.rightGroups || 5;
        baseDurationMs = Math.max(900, groups * 180 + 400);
        break;
      }
      case 'gathering':
        baseDurationMs = 900;
        break;
      case 'merging':
        baseDurationMs = 800;
        break;
      case 'lineFormed':
        baseDurationMs = 1400;
        break;
      default:
        baseDurationMs = 800;
    }

    const duration = Math.max(80, baseDurationMs / speed);

    const capturedRunId = runId;
    timerRef.current = setTimeout(() => {
      // 確保 runId 未被重設且階段一致
      if (capturedRunId === runId) {
        advance();
      }
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, speed, runId, currentChange, advance]);
}
