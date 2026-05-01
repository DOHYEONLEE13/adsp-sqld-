/**
 * studyMode — 사용자가 과목별로 처음 진입할 때 한 번 묻는 학습 의도.
 *
 * 'first'  : 처음 학습. passNumber=1 (개념 + 원본 문제) 로 진행.
 * 'review' : 시험 임박 / 이미 한 번 본 사용자. passNumber=2 (변형 문제 우선,
 *            부족하면 원본으로 보충) 로 진행. session.ts 의 기존 N회독 로직 재사용.
 *
 * 사용자가 한 번 답하면 localStorage 에 저장 후 그 과목엔 다시 묻지 않음.
 * 변경하려면 (현 구현) localStorage 정리 또는 별도 설정 화면 추가 필요.
 *
 * 저장 포맷: `{ adsp?: 'first' | 'review', sqld?: 'first' | 'review' }`
 */

import type { Subject } from '@/types/question';

const STORAGE_KEY = 'questdp.studyMode.v1';

export type StudyMode = 'first' | 'review';

type StudyModes = Partial<Record<Subject, StudyMode>>;

function load(): StudyModes {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object') return {};
    const out: StudyModes = {};
    for (const k of ['adsp', 'sqld'] as const) {
      const v = (obj as Record<string, unknown>)[k];
      if (v === 'first' || v === 'review') out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function save(modes: StudyModes): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(modes));
  } catch {
    /* quota — 무시 */
  }
}

/** 과목의 학습 모드. 미설정이면 undefined. */
export function getStudyMode(subject: Subject): StudyMode | undefined {
  return load()[subject];
}

/** 과목의 학습 모드 설정. null 이면 삭제. */
export function setStudyMode(subject: Subject, mode: StudyMode | null): void {
  const cur = load();
  if (mode === null) delete cur[subject];
  else cur[subject] = mode;
  save(cur);
}

/**
 * 학습 모드에 따른 시작 passNumber.
 * 'review' → 2 (변형 문제 우선, 부족 시 원본 보충 — session.ts 가 처리)
 * 그 외   → 1
 */
export function passNumberFor(subject: Subject): 1 | 2 {
  return getStudyMode(subject) === 'review' ? 2 : 1;
}
