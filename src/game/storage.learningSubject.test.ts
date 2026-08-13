// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { pushProgressMetaToServer } from './progressMetaSync';
import {
  getSnapshot,
  resetProgress,
  setActiveSubject,
  setLearningSubject,
} from './storage';

vi.mock('./progressMetaSync', () => ({
  pushProgressMetaToServer: vi.fn().mockResolvedValue(undefined),
}));

const pushMeta = vi.mocked(pushProgressMetaToServer);

describe('learning subject metadata', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetProgress();
    pushMeta.mockClear();
  });

  it('stores a core subject and reports it for admin statistics', () => {
    setActiveSubject('sqld');

    expect(getSnapshot().activeSubject).toBe('sqld');
    expect(pushMeta).toHaveBeenCalledWith({
      active_subject: 'sqld',
      learning_subject: 'sqld',
    });
  });

  it('reports COMHWAL without changing the core router subject', () => {
    setActiveSubject('adsp');
    pushMeta.mockClear();

    setLearningSubject('comhwal');

    expect(getSnapshot().activeSubject).toBe('adsp');
    expect(pushMeta).toHaveBeenCalledWith({ learning_subject: 'comhwal' });
  });
});
