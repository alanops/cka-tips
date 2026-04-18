import { describe, it, expect } from 'vitest';
import {
  freshState,
  recordResult,
  BOX_CADENCE,
  CURRENT_VERSION,
} from './leitner.js';

describe('freshState', () => {
  it('returns a v1 state with session 0 and empty tips', () => {
    const s = freshState();
    expect(s.version).toBe(CURRENT_VERSION);
    expect(s.session).toBe(0);
    expect(s.tips).toEqual({});
  });
});

describe('recordResult — promotion', () => {
  it('promotes new tip from box 1 to box 2 on first correct', () => {
    const s = recordResult(freshState(), 'tip-a', true);
    expect(s.tips['tip-a'].box).toBe(2);
    expect(s.tips['tip-a'].mastered).toBe(false);
  });

  it('promotes through boxes 1→2→3→4→5', () => {
    let s = freshState();
    for (let i = 0; i < 5; i++) s = recordResult(s, 'tip-a', true);
    expect(s.tips['tip-a'].box).toBe(5);
    expect(s.tips['tip-a'].mastered).toBe(true);
  });

  it('caps box at 5 after mastery', () => {
    let s = freshState();
    for (let i = 0; i < 10; i++) s = recordResult(s, 'tip-a', true);
    expect(s.tips['tip-a'].box).toBe(5);
  });
});

describe('recordResult — demotion', () => {
  it('drops to box 1 on wrong answer in boxes 1-4', () => {
    let s = freshState();
    s = recordResult(s, 'tip-a', true);
    s = recordResult(s, 'tip-a', true);
    s = recordResult(s, 'tip-a', false);
    expect(s.tips['tip-a'].box).toBe(1);
  });

  it('drops mastered tip from box 5 to box 3 on wrong answer', () => {
    let s = freshState();
    for (let i = 0; i < 5; i++) s = recordResult(s, 'tip-a', true);
    expect(s.tips['tip-a'].box).toBe(5);
    s = recordResult(s, 'tip-a', false);
    expect(s.tips['tip-a'].box).toBe(3);
    expect(s.tips['tip-a'].mastered).toBe(true);
  });
});

describe('BOX_CADENCE', () => {
  it('defines the session cadence per box', () => {
    expect(BOX_CADENCE).toEqual({ 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 });
  });
});

import { selectDueTips, loadState, saveState, exportJson, importJson, incrementSession } from './leitner.js';

const sampleTips = [
  { id: 'a', domain: 'workloads', subtopic: 'x', principle: 'p', prompt: 'p', answer: 'a', docs: 'https://x', difficulty: 1 },
  { id: 'b', domain: 'networking', subtopic: 'x', principle: 'p', prompt: 'p', answer: 'a', docs: 'https://x', difficulty: 1 },
  { id: 'c', domain: 'workloads', subtopic: 'x', principle: 'p', prompt: 'p', answer: 'a', docs: 'https://x', difficulty: 1 },
];

describe('selectDueTips', () => {
  it('returns all tips at session 0 (all unseen, all due)', () => {
    const s = freshState();
    const due = selectDueTips(s, sampleTips, { count: 10 });
    expect(due.length).toBe(3);
  });

  it('filters by domain when requested', () => {
    const s = freshState();
    const due = selectDueTips(s, sampleTips, { count: 10, domain: 'networking' });
    expect(due.map(t => t.id)).toEqual(['b']);
  });

  it('excludes tips whose next-due session is in the future', () => {
    let s = freshState();
    s = recordResult(s, 'a', true);
    s = incrementSession(s);
    const due = selectDueTips(s, sampleTips, { count: 10 });
    expect(due.map(t => t.id).sort()).toEqual(['b', 'c']);
  });

  it('respects count cap', () => {
    const s = freshState();
    const due = selectDueTips(s, sampleTips, { count: 2 });
    expect(due.length).toBe(2);
  });
});

describe('incrementSession', () => {
  it('bumps session counter', () => {
    const s = incrementSession(freshState());
    expect(s.session).toBe(1);
  });
});

describe('exportJson / importJson', () => {
  it('round-trips state', () => {
    let s = freshState();
    s = recordResult(s, 'a', true);
    const json = exportJson(s);
    const back = importJson(json);
    expect(back).toEqual(s);
  });

  it('rejects payload with wrong version', () => {
    expect(() => importJson(JSON.stringify({ version: 99, tips: {} }))).toThrow();
  });
});

describe('loadState / saveState', () => {
  it('returns freshState when localStorage is empty', () => {
    const fakeStorage = { getItem: () => null, setItem: () => {} };
    const s = loadState(fakeStorage);
    expect(s.version).toBe(CURRENT_VERSION);
    expect(s.tips).toEqual({});
  });

  it('persists state to localStorage', () => {
    const store = {};
    const fakeStorage = {
      getItem: (k) => store[k] || null,
      setItem: (k, v) => { store[k] = v; },
    };
    const s = recordResult(freshState(), 'a', true);
    saveState(s, fakeStorage);
    expect(JSON.parse(store['cka.leitner.v1']).tips.a.box).toBe(2);
  });
});
