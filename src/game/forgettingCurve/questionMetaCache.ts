/**
 * questionMetaCache — question_id → meta (subject/chapter/topic/chapter_id) 빠른 조회.
 *
 * Phase 4 Step 4 — reviewQueue 의 약점 chapter 매칭 + UI 표시용.
 *
 * ALL_QUESTIONS 를 1회 인덱싱 + canonicalTopic 적용해 chapter_id 결정.
 * Step 5/6 에서 서버 RPC 가 같은 정보를 query 단계에서 join 으로 반환.
 */

import { ALL_QUESTIONS } from '@/lib/questions';
import { canonicalTopic } from '@/data/topicAlias';
import type { Subject } from '@/types/question';

type ExamSubject = Extract<Subject, 'adsp' | 'sqld'>;

export interface QuestionMeta {
  subject: Subject;
  chapter: number;
  topic?: string;
  /** 진단 시스템과 동일한 chapter_id (예: 'adsp-1-1', 'sqld-2-2'). */
  chapter_id?: string;
}

let _cache: Record<string, QuestionMeta> | null = null;

/** ALL_QUESTIONS 인덱싱 (1회만, lazy). */
function buildCache(): Record<string, QuestionMeta> {
  const result: Record<string, QuestionMeta> = {};
  for (const q of ALL_QUESTIONS) {
    const subject = q.subject as ExamSubject;
    const canon = canonicalTopic(subject, q.chapter, q.topic ?? '');
    const chapter_id = canon ? deriveChapterId(subject, canon) : deriveChapterIdFallback(subject, q.chapter);
    result[q.id] = {
      subject: q.subject,
      chapter: q.chapter,
      topic: q.topic,
      chapter_id,
    };
  }
  return result;
}

/** canonical topic → 운영 chapter_id (예: '데이터의 이해' → 'adsp-1-1'). */
function deriveChapterId(subject: ExamSubject, topic: string): string | undefined {
  const map: Record<string, Record<string, string>> = {
    adsp: {
      '데이터의 이해': 'adsp-1-1',
      '데이터의 가치와 미래': 'adsp-1-2',
      '가치 창조를 위한 데이터 사이언스': 'adsp-1-3',
      '데이터 분석 기획의 이해': 'adsp-2-1',
      '분석 마스터플랜': 'adsp-2-2',
      '분석 과제 발굴': 'adsp-2-1',
      'R 기초와 데이터 마트': 'adsp-3-1',
      '통계 분석': 'adsp-3-2',
      '통계적 가설 검정': 'adsp-3-2',
      '정형 데이터 마이닝': 'adsp-3-3',
    },
    sqld: {
      '데이터 모델링의 이해': 'sqld-1-1',
      '데이터 모델과 성능': 'sqld-1-2',
      'SQL 기본': 'sqld-2-1',
      'SQL 활용': 'sqld-2-2',
      '관리 구문': 'sqld-2-3',
    },
  };
  return map[subject]?.[topic];
}

/** chapter 번호만으로 fallback chapter_id (canonical 매핑 실패 시). */
function deriveChapterIdFallback(
  subject: ExamSubject,
  chapter: number,
): string | undefined {
  if (subject === 'adsp') {
    if (chapter === 1) return 'adsp-1-1';
    if (chapter === 2) return 'adsp-2-1';
    if (chapter === 3) return 'adsp-3-2';
  }
  if (subject === 'sqld') {
    if (chapter === 1) return 'sqld-1-1';
    if (chapter === 2) return 'sqld-2-1';
  }
  return undefined;
}

/** question_id → meta. 미존재 시 undefined. */
export function getQuestionMeta(questionId: string): QuestionMeta | undefined {
  if (!_cache) _cache = buildCache();
  return _cache[questionId];
}

/** 큐 빌드 시 input 으로 넣을 record map. */
export function getQuestionMetaMap(): Record<string, QuestionMeta> {
  if (!_cache) _cache = buildCache();
  return _cache;
}
