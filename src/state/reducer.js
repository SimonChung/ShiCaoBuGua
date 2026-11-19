import { USED_STICKS, performChange, lineValue } from '../core/yarrow.js';
import { randomSplit } from '../core/random.js';
import { toBinary, findHexagram, changedLines, movingPositions } from '../core/hexagram.js';

export const INITIAL_STATE = {
  phase: 'idle', // 'idle' | 'setup' | 'awaitSplit' | 'splitting' | 'hanging' | 'countLeft' | 'countRight' | 'gathering' | 'merging' | 'lineFormed' | 'finished'
  runId: 0,
  question: '',
  startedAt: null,
  finishedAt: null,
  lineIndex: 0,    // 0~5 (初爻~上爻)
  changeIndex: 0,  // 0~2 (第一、二、三變)

  // 蓍草當前狀態
  setAside: 1,     // 太極之數，不用之一
  sticks: USED_STICKS, // 當前可用蓍草數（49, 44, 40...）
  split: null,     // { left, right, k }
  currentChange: null, // performChange 結果
  gatheredForLine: [], // 當前爻各變歸奇數，如 [9, 4, 8]

  // 成爻與成卦紀錄
  changes: [],     // 全部 18 變紀錄
  lines: [],       // 已產生的爻值（0:初爻 ... 5:上爻）
  primaryHex: null,
  changedHex: null,
  movingLines: [],

  // 系統控制
  speed: 1,        // 0.5 | 1 | 2 | 4
  recordSaved: null, // { ok: true, id, source: 'fs'|'local' }
};

export function divinationReducer(state, action) {
  switch (action.type) {
    case 'RESET_AND_START': {
      const now = action.payload?.now || new Date().toISOString();
      return {
        ...INITIAL_STATE,
        runId: state.runId + 1,
        question: action.payload?.question !== undefined ? action.payload.question : state.question,
        startedAt: now,
        speed: state.speed,
        phase: 'setup',
      };
    }

    case 'SPLIT': {
      if (state.phase !== 'awaitSplit') return state;
      const k = action.payload?.k ?? Math.floor(state.sticks / 2);
      const changeRes = performChange(state.sticks, k);
      return {
        ...state,
        phase: 'splitting',
        split: { left: changeRes.left, right: changeRes.right, k },
        currentChange: changeRes,
      };
    }

    case 'ADVANCE': {
      switch (state.phase) {
        case 'setup':
          return {
            ...state,
            phase: 'awaitSplit',
            sticks: USED_STICKS,
          };

        case 'splitting':
          return { ...state, phase: 'hanging' };

        case 'hanging':
          return { ...state, phase: 'countLeft' };

        case 'countLeft':
          return { ...state, phase: 'countRight' };

        case 'countRight':
          return { ...state, phase: 'gathering' };

        case 'gathering':
          return { ...state, phase: 'merging' };

        case 'merging': {
          const changeRes = state.currentChange;
          const nextGathered = [...state.gatheredForLine, changeRes.gathered];
          const recordItem = {
            line: state.lineIndex + 1,
            change: state.changeIndex + 1,
            total: changeRes.total,
            left: changeRes.left,
            right: changeRes.right,
            leftRemainder: changeRes.leftRemainder,
            rightRemainder: changeRes.rightRemainder,
            hung: changeRes.hung,
            gathered: changeRes.gathered,
            after: changeRes.after,
          };
          const nextChanges = [...state.changes, recordItem];

          if (state.changeIndex < 2) {
            // 進入下一變
            return {
              ...state,
              phase: 'awaitSplit',
              changeIndex: state.changeIndex + 1,
              sticks: changeRes.after,
              split: null,
              currentChange: null,
              gatheredForLine: nextGathered,
              changes: nextChanges,
            };
          } else {
            // 三變完成，成爻！
            const newLineVal = lineValue(changeRes.after);
            const nextLines = [...state.lines, newLineVal];

            let primaryHex = null;
            let changedHex = null;
            let movings = [];

            if (nextLines.length === 6) {
              const bin = toBinary(nextLines);
              primaryHex = findHexagram(bin);
              movings = movingPositions(nextLines);
              if (movings.length > 0) {
                const chBin = toBinary(changedLines(nextLines));
                changedHex = findHexagram(chBin);
              }
            }

            return {
              ...state,
              phase: 'lineFormed',
              lines: nextLines,
              changes: nextChanges,
              gatheredForLine: nextGathered,
              primaryHex,
              changedHex,
              movingLines: movings,
            };
          }
        }

        case 'lineFormed': {
          if (state.lines.length < 6) {
            // 準備下一爻（重置為 49 枝）
            return {
              ...state,
              phase: 'awaitSplit',
              lineIndex: state.lineIndex + 1,
              changeIndex: 0,
              sticks: USED_STICKS,
              split: null,
              currentChange: null,
              gatheredForLine: [],
            };
          } else {
            // 六爻皆成，完成占卦！
            return {
              ...state,
              phase: 'finished',
              finishedAt: new Date().toISOString(),
            };
          }
        }

        default:
          return state;
      }
    }

    case 'SKIP_CHANGE': {
      if (state.phase === 'idle' || state.phase === 'finished') return state;

      // 若在 awaitSplit，先隨機分堆
      let currentChange = state.currentChange;
      if (!currentChange) {
        const k = randomSplit(state.sticks);
        currentChange = performChange(state.sticks, k);
      }

      const nextGathered = [...state.gatheredForLine, currentChange.gathered];
      const recordItem = {
        line: state.lineIndex + 1,
        change: state.changeIndex + 1,
        total: currentChange.total,
        left: currentChange.left,
        right: currentChange.right,
        leftRemainder: currentChange.leftRemainder,
        rightRemainder: currentChange.rightRemainder,
        hung: currentChange.hung,
        gathered: currentChange.gathered,
        after: currentChange.after,
      };
      const nextChanges = [...state.changes, recordItem];

      if (state.changeIndex < 2) {
        return {
          ...state,
          phase: 'awaitSplit',
          changeIndex: state.changeIndex + 1,
          sticks: currentChange.after,
          split: null,
          currentChange: null,
          gatheredForLine: nextGathered,
          changes: nextChanges,
        };
      } else {
        // 成爻
        const newLineVal = lineValue(currentChange.after);
        const nextLines = [...state.lines, newLineVal];

        let primaryHex = null;
        let changedHex = null;
        let movings = [];

        if (nextLines.length === 6) {
          const bin = toBinary(nextLines);
          primaryHex = findHexagram(bin);
          movings = movingPositions(nextLines);
          if (movings.length > 0) {
            const chBin = toBinary(changedLines(nextLines));
            changedHex = findHexagram(chBin);
          }
          return {
            ...state,
            phase: 'finished',
            finishedAt: new Date().toISOString(),
            lines: nextLines,
            changes: nextChanges,
            gatheredForLine: nextGathered,
            primaryHex,
            changedHex,
            movingLines: movings,
          };
        }

        return {
          ...state,
          phase: 'awaitSplit',
          lineIndex: state.lineIndex + 1,
          changeIndex: 0,
          sticks: USED_STICKS,
          split: null,
          currentChange: null,
          gatheredForLine: [],
          lines: nextLines,
          changes: nextChanges,
        };
      }
    }

    case 'SKIP_ALL': {
      if (state.phase === 'finished') return state;

      let currentLines = [...state.lines];
      let currentChanges = [...state.changes];

      // 完成當前尚未完成的爻
      let lineIdx = state.lineIndex;
      let changeIdx = state.changeIndex;
      let sticks = state.sticks;

      while (currentLines.length < 6) {
        let afterSticks = sticks;
        for (let c = changeIdx; c < 3; c++) {
          const k = randomSplit(afterSticks);
          const chRes = performChange(afterSticks, k);
          currentChanges.push({
            line: lineIdx + 1,
            change: c + 1,
            total: chRes.total,
            left: chRes.left,
            right: chRes.right,
            leftRemainder: chRes.leftRemainder,
            rightRemainder: chRes.rightRemainder,
            hung: chRes.hung,
            gathered: chRes.gathered,
            after: chRes.after,
          });
          afterSticks = chRes.after;
        }

        const lVal = lineValue(afterSticks);
        currentLines.push(lVal);

        lineIdx++;
        changeIdx = 0;
        sticks = USED_STICKS;
      }

      const bin = toBinary(currentLines);
      const primaryHex = findHexagram(bin);
      const movings = movingPositions(currentLines);
      let changedHex = null;
      if (movings.length > 0) {
        const chBin = toBinary(changedLines(currentLines));
        changedHex = findHexagram(chBin);
      }

      return {
        ...state,
        phase: 'finished',
        startedAt: state.startedAt || new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        lineIndex: 5,
        changeIndex: 2,
        sticks: 0,
        split: null,
        currentChange: null,
        lines: currentLines,
        changes: currentChanges,
        primaryHex,
        changedHex,
        movingLines: movings,
      };
    }

    case 'SET_SPEED':
      return { ...state, speed: action.payload.speed };

    case 'SET_QUESTION':
      return { ...state, question: action.payload.text };

    case 'SET_RECORD_SAVED':
      return { ...state, recordSaved: action.payload };

    default:
      return state;
  }
}
