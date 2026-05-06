/**
 * Diagnostic 출제 풀 — Phase 4 Step 2.
 *
 * 리서치 1-4-1절 정본:
 *   - difficulty=중 난이도, 단원별 동일 비율
 *   - 기본 25~30 + 적응형 5
 *   - 운영 question-bank 의 ALL_QUESTIONS 활용
 *
 * 본 모듈은 mock 단계 — 운영 RPC 미사용. 클라이언트 사이드에서 풀 추출.
 * 마이그레이션 적용 후 (Phase 4 Step 5/6) 서버 출제 RPC 로 전환 가능.
 */

import { ALL_QUESTIONS } from '@/lib/questions';
import { isPlayable } from '@/game/session';
import { canonicalTopic } from '@/data/topicAlias';
import type { Subject, MultipleChoiceQuestion, Question } from '@/types/question';

type ExamSubject = Extract<Subject, 'adsp' | 'sqld'>;

/** Diagnostic 출제 단위. */
export interface DiagnosticQuestion {
  question_id: string;
  chapter_id: string;          // 운영 lesson chapter id (예: 'adsp-1-1')
  question: string;
  choices: string[];
  answer_index: number;
  topic: string;
  subtopic?: string;
}

/**
 * 단원 ID 매핑 — q.chapter (subject 번호 1/2/3) + canonical topic 으로
 * Phase 4 chapter slug 를 도출.
 *
 * 운영 코드와의 정합:
 *   - q.chapter = 1/2/3 (subject 번호)
 *   - q.topic = canonical topic (topicAlias 적용 후)
 *   - 결합 → 'adsp-1-1' 같은 lesson chapter id
 *
 * 본 매핑은 phase4-schema-design.md 의 chapter slug 와 일치.
 */
const CHAPTER_ID_MAP: Record<string, Record<string, string>> = {
  adsp: {
    '데이터의 이해': 'adsp-1-1',
    '데이터의 가치와 미래': 'adsp-1-2',
    '가치 창조를 위한 데이터 사이언스': 'adsp-1-3',
    '데이터 분석 기획의 이해': 'adsp-2-1',
    '분석 마스터플랜': 'adsp-2-2',
    '분석 과제 발굴': 'adsp-2-1', // 가이드북 1단원으로 통합
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

/** topic → chapter_id 변환 (canonical topic 가정). */
function chapterIdFor(subject: ExamSubject, topic: string | undefined): string | null {
  if (!topic) return null;
  return CHAPTER_ID_MAP[subject]?.[topic] ?? null;
}

/**
 * 기출 JSON 의 raw topic → 운영 chapter_id 매핑.
 *
 * 처리 순서:
 *   1) canonicalTopic() 으로 raw → schema topic 변환 시도
 *   2) chapterIdFor() 로 schema topic → chapter_id
 *   3) 둘 다 실패 시 → q.chapter 기준 fallback (다음 함수)
 *
 * 이 헬퍼가 없으면 raw topic ('DIKW 피라미드', '빅데이터 3V' 등) 이
 * chapter_id 매핑에 실패해 출제 풀에서 누락 — 진단 분포 편중 원인.
 */
function chapterIdForQuestion(q: Question): string | null {
  const subject = q.subject as ExamSubject;
  const rawTopic = q.topic ?? '';

  // 1) canonical 변환 시도
  const canonical = canonicalTopic(subject, q.chapter, rawTopic);
  if (canonical) {
    const id = chapterIdFor(subject, canonical);
    if (id) return id;
  }

  // 2) raw topic 이 우연히 canonical 과 동일한 케이스 (수동 작성 문제 등)
  const direct = chapterIdFor(subject, rawTopic);
  if (direct) return direct;

  // 3) Fallback — q.chapter 만으로 대표 chapter_id 추정.
  // 정확한 sub-chapter 식별은 어려우나, 모든 chapter 가 진단에서 빠지지 않게 보장.
  return chapterIdByChapterNumber(subject, q.chapter);
}

/**
 * q.chapter (1~3) 만으로 대표 chapter_id 추정.
 *
 * 매핑 표 (운영 schema 기준 첫 chapter_id 사용):
 *   ADsP: ch1 → 'adsp-1-1' / ch2 → 'adsp-2-1' / ch3 → 'adsp-3-2' (통계 비중 큰 단원 대표)
 *   SQLD: ch1 → 'sqld-1-1' / ch2 → 'sqld-2-1' / ch3 → 'sqld-2-3' (관리 구문)
 *
 * 진단 분포 안전망 — canonical 매핑 실패 시에도 chapter 별 출제 보장.
 */
function chapterIdByChapterNumber(
  subject: ExamSubject,
  chapter: number | undefined,
): string | null {
  if (!chapter) return null;
  if (subject === 'adsp') {
    if (chapter === 1) return 'adsp-1-1';
    if (chapter === 2) return 'adsp-2-1';
    if (chapter === 3) return 'adsp-3-2';
  }
  if (subject === 'sqld') {
    if (chapter === 1) return 'sqld-1-1';
    if (chapter === 2) return 'sqld-2-1';
    if (chapter === 3) return 'sqld-2-3';
  }
  return null;
}

/**
 * 가이드북 단원 ID 목록 (subject 별).
 * DiagnosticResult 의 chapters 배열에 응시 0 단원도 'unknown' 으로 포함하기 위해 사용.
 */
export function allChapterIds(subjects: ExamSubject[]): string[] {
  const result = new Set<string>();
  for (const s of subjects) {
    for (const id of Object.values(CHAPTER_ID_MAP[s] ?? {})) {
      result.add(id);
    }
  }
  return [...result];
}

/**
 * 단원별 표시 이름 매핑 — buildSummaryMessage 에 전달.
 */
export const CHAPTER_NAMES: Record<string, string> = {
  'adsp-1-1': '데이터의 이해',
  'adsp-1-2': '데이터의 가치와 미래',
  'adsp-1-3': '가치 창조 데이터 사이언스',
  'adsp-2-1': '분석 기획의 이해',
  'adsp-2-2': '분석 마스터플랜',
  'adsp-3-1': 'R 기초와 데이터 마트',
  'adsp-3-2': '통계 분석',
  'adsp-3-3': '정형 데이터 마이닝',
  'sqld-1-1': '데이터 모델링의 이해',
  'sqld-1-2': '데이터 모델과 성능',
  'sqld-2-1': 'SQL 기본',
  'sqld-2-2': 'SQL 활용',
  'sqld-2-3': '관리 구문',
};

/**
 * Diagnostic 출제 풀 추출.
 *
 * 정책:
 *   - difficulty 2 (중) 만 사용 (일부 1·3 까지 fallback — 풀 부족 시)
 *   - 단원별 동일 비율 (round-robin) → 총 base_count 만큼
 *   - 단원이 부족하면 가용 단원만으로 채움
 *   - 출제 순서 = 단원 순회 (학습자가 모든 단원 골고루 만남)
 */
export function buildDiagnosticPool(
  subjects: ExamSubject[],
  baseCount = 28,
): DiagnosticQuestion[] {
  // 1. 후보 풀 — playable + difficulty 중심 + topic 매핑 가능
  // chapterIdForQuestion() 이 canonical 변환 + fallback 처리 → 모든 chapter 가 풀에 포함됨.
  const candidates: DiagnosticQuestion[] = [];
  for (const q of ALL_QUESTIONS) {
    if (!subjects.includes(q.subject as ExamSubject)) continue;
    if (!isPlayable(q)) continue;
    const mc = q as MultipleChoiceQuestion;
    if (mc.difficulty !== 2) continue; // 중 난이도만 1차 시도
    const chapter_id = chapterIdForQuestion(q);
    if (!chapter_id) continue;
    candidates.push({
      question_id: q.id,
      chapter_id,
      question: mc.question,
      choices: mc.choices,
      answer_index: mc.answerIndex,
      topic: q.topic ?? '',
      subtopic: q.subtopic,
    });
  }

  // 2. 단원별 그룹화
  const byChapter: Record<string, DiagnosticQuestion[]> = {};
  for (const c of candidates) {
    if (!byChapter[c.chapter_id]) byChapter[c.chapter_id] = [];
    byChapter[c.chapter_id].push(c);
  }
  const chapters = Object.keys(byChapter);
  if (chapters.length === 0) return [];

  // 3. 셔플 (각 단원 내부 + chapter 순서 자체)
  // chapter 순서 셔플 — 사용자가 첫 cycle 에 1과목만 만나는 인지 편향 제거.
  for (const k of chapters) byChapter[k] = shuffle(byChapter[k]);
  const orderedChapters = shuffle(chapters);

  // 4. round-robin 으로 단원별 동일 비율 추출 (chapter 순서는 위에서 셔플됨)
  const result: DiagnosticQuestion[] = [];
  const cursors: Record<string, number> = {};
  for (const k of orderedChapters) cursors[k] = 0;
  while (result.length < baseCount) {
    let added = false;
    for (const k of orderedChapters) {
      if (result.length >= baseCount) break;
      const list = byChapter[k];
      if (cursors[k] < list.length) {
        result.push(list[cursors[k]++]);
        added = true;
      }
    }
    if (!added) break; // 모든 단원 소진
  }

  return result;
}

/**
 * 적응형 추가 출제 — 특정 chapter 에서 추가 N문항 추출.
 * 이미 출제된 question_id 는 제외.
 */
export function buildAdaptiveExtension(
  subjects: ExamSubject[],
  chapter_id: string,
  excludeQuestionIds: Set<string>,
  count = 5,
): DiagnosticQuestion[] {
  const candidates: DiagnosticQuestion[] = [];
  for (const q of ALL_QUESTIONS) {
    if (!subjects.includes(q.subject as ExamSubject)) continue;
    if (!isPlayable(q)) continue;
    if (excludeQuestionIds.has(q.id)) continue;
    const mc = q as MultipleChoiceQuestion;
    if (mc.difficulty !== 2 && mc.difficulty !== 3) continue; // 중·상 모두 OK
    const ch = chapterIdForQuestion(q);
    if (ch !== chapter_id) continue;
    candidates.push({
      question_id: q.id,
      chapter_id,
      question: mc.question,
      choices: mc.choices,
      answer_index: mc.answerIndex,
      topic: q.topic ?? '',
      subtopic: q.subtopic,
    });
  }
  return shuffle(candidates).slice(0, count);
}

/** Fisher-Yates shuffle (immutable). */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * 단원별 가중치 (Phase 4 합격 예측 점수 산정용, 4-1절).
 *
 * subject 가중치를 단원에 균등 분배.
 *   - ADsP 1과목 = 20% / 1단원 1개당 6.67%
 *   - ADsP 2과목 = 20% / 2단원 = 10% per
 *   - ADsP 3과목 = 60% / 3단원 = 20% per
 *   - SQLD 1과목 = 20% / 2단원 = 10% per
 *   - SQLD 2과목 = 80% / 3단원 = 26.67% per
 */
export const CHAPTER_WEIGHTS: Record<string, number> = {
  // ADsP 1과목 (20% / 3단원)
  'adsp-1-1': 0.0667,
  'adsp-1-2': 0.0667,
  'adsp-1-3': 0.0667,
  // ADsP 2과목 (20% / 2단원)
  'adsp-2-1': 0.1,
  'adsp-2-2': 0.1,
  // ADsP 3과목 (60% / 3단원)
  'adsp-3-1': 0.2,
  'adsp-3-2': 0.2,
  'adsp-3-3': 0.2,
  // SQLD 1과목 (20% / 2단원)
  'sqld-1-1': 0.1,
  'sqld-1-2': 0.1,
  // SQLD 2과목 (80% / 3단원)
  'sqld-2-1': 0.2667,
  'sqld-2-2': 0.2667,
  'sqld-2-3': 0.2667,
};
