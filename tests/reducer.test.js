import { describe, it, expect } from 'vitest';
import { divinationReducer, INITIAL_STATE } from '../src/state/reducer.js';

describe('Divination state machine reducer (reducer.js)', () => {
  it('RESET_AND_START initializes state and increments runId', () => {
    const s1 = divinationReducer(INITIAL_STATE, {
      type: 'RESET_AND_START',
      payload: { question: '事業運勢' },
    });
    expect(s1.phase).toBe('setup');
    expect(s1.question).toBe('事業運勢');
    expect(s1.runId).toBe(1);
    expect(s1.lines).toEqual([]);
    expect(s1.changes).toEqual([]);
  });

  it('ADVANCE from setup enters awaitSplit with 49 sticks', () => {
    let state = divinationReducer(INITIAL_STATE, { type: 'RESET_AND_START' });
    state = divinationReducer(state, { type: 'ADVANCE' });
    expect(state.phase).toBe('awaitSplit');
    expect(state.sticks).toBe(49);
  });

  it('SPLIT sets splitting phase and calculates currentChange', () => {
    let state = divinationReducer(INITIAL_STATE, { type: 'RESET_AND_START' });
    state = divinationReducer(state, { type: 'ADVANCE' }); // awaitSplit
    state = divinationReducer(state, { type: 'SPLIT', payload: { k: 23 } });
    expect(state.phase).toBe('splitting');
    expect(state.currentChange).toBeTruthy();
    expect(state.currentChange.left).toBe(23);
    expect(state.currentChange.right).toBe(26);
    expect(state.currentChange.gathered).toBe(5);
  });

  it('SKIP_ALL quickly completes all remaining lines to finished phase', () => {
    let state = divinationReducer(INITIAL_STATE, { type: 'RESET_AND_START' });
    state = divinationReducer(state, { type: 'ADVANCE' }); // awaitSplit
    state = divinationReducer(state, { type: 'SKIP_ALL' });
    expect(state.phase).toBe('finished');
    expect(state.lines.length).toBe(6);
    expect(state.changes.length).toBe(18);
    expect(state.primaryHex).toBeTruthy();
    expect(state.finishedAt).toBeTruthy();
  });
});
