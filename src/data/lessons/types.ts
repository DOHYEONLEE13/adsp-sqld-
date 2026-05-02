/**
 * 레슨 데이터 타입 정의 — 단일 출처.
 *
 * 모든 챕터별 lesson 파일이 이 모듈에서 타입을 import 합니다.
 * 호출측 (`@/data/lessons`) 은 index.ts 가 re-export 하므로 변경 0.
 *
 * 구조 원칙: 한 개념을 배우고 그 개념에 대한 예제를 "바로" 푼다.
 *   Lesson (= 토픽 하나) 은 여러 개의 LessonStep 으로 나뉘고,
 *   각 Step 은 (concept blocks + quizId 1개) 로 구성됩니다.
 */

import type { Subject } from '@/types/question';
import type { QuesPose } from '@/components/mascot/types';

// ================================================================
// Dialogue 타입 (듀오링고식 캐릭터 대화)
// ================================================================

/**
 * 한 번의 말풍선 단위. [키워드] 브래킷 안의 텍스트는 SpeechBubble 에서
 * `.dialogue-keyword` 로 하이라이트됨 (과목색 + 점선 밑줄).
 */
export interface DialogueTurn {
  text: string;
  /** 이 대사를 할 때 Ques 의 포즈. 기본 'idle'. */
  pose?: QuesPose;
}

// ================================================================
// Block 타입 (개념 카드 구성 요소)
// ================================================================

export interface IntroBlock {
  kind: 'intro';
  body: string;
}
export interface SectionBlock {
  kind: 'section';
  title: string;
  body: string;
}
export interface KeyPointsBlock {
  kind: 'keypoints';
  title?: string;
  items: string[];
}
export interface TableBlock {
  kind: 'table';
  title?: string;
  headers: string[];
  rows: string[][];
}
export interface ExampleBlock {
  kind: 'example';
  title?: string;
  body: string;
}
export interface CalloutBlock {
  kind: 'callout';
  tone: 'mnemonic' | 'tip' | 'warn';
  title: string;
  body: string;
}

export type LessonBlock =
  | IntroBlock
  | SectionBlock
  | KeyPointsBlock
  | TableBlock
  | ExampleBlock
  | CalloutBlock;

// ================================================================
// Step / Lesson
// ================================================================

export interface ConceptReminder {
  /** "이거 기억나?" 같은 헤드라인. 한 줄. */
  headline: string;
  /** 핵심 요약. 2~3문장. 처음 학습이 아닌 복습 톤. */
  summary: string;
  /** 핵심 키워드/공식 3~5개 (불릿). */
  keyPoints: string[];
}

export interface LessonStep {
  /** `<lessonId>-s<n>` — progress 추적/딥링크용. */
  id: string;
  /** 이 스텝이 다루는 개념 이름. "DIKW 피라미드" 같은 짧은 타이틀. */
  title: string;
  /** 개념 설명을 구성하는 블록들. */
  blocks: LessonBlock[];
  /**
   * 듀오링고식 대사 스크립트. 존재하면 LessonScreen 대신 DialogueLesson
   * 이 활성화됨. blocks 는 "📖 상세보기" 바텀시트에서 그대로 재사용.
   */
  dialogue?: DialogueTurn[];
  /** 이 개념을 막 배운 사람이 바로 풀 문제 id (concept-practice.json). */
  quizId: string;
  /**
   * 명시적 sub-step 그룹 키. 미지정 시 id 의 `-s\d+` prefix 가 그룹.
   * 한 lesson 안에서 여러 주제 패밀리 (예: s4 안의 DB / DW / DM / Lake)
   * 를 trail 로 따로 묶고 싶을 때 같은 group 값을 공유하게 설정.
   */
  group?: string;
  /**
   * 2회독+ 진입 시 노출되는 짧은 리마인더. 처음 학습 X, "이거 기억나?" 톤.
   * 미정의 시 UI 가 첫 dialogue turn 또는 keypoints 로 fallback.
   */
  reminder?: ConceptReminder;
}

export interface Lesson {
  id: string;
  subject: Subject;
  chapter: number;
  chapterTitle: string;
  /** subjects.ts 의 topic 문자열과 완전히 동일. */
  topic: string;
  title: string;
  hook: string;
  estimatedMinutes: number;
  steps: LessonStep[];
}

/**
 * 챕터 전체의 (lesson, step, chapterStepIndex) flat 리스트 항목.
 * chapterStepIndex 는 0-based — 진행바에 바로 쓸 수 있음.
 */
export interface ChapterStepEntry {
  lesson: Lesson;
  step: LessonStep;
  /** 0-based 챕터 내 스텝 인덱스. */
  index: number;
}
