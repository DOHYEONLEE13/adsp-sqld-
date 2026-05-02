/**
 * lessons.integration.test.ts — A-7 분할 후 전수 무결성 검증.
 *
 * 검증 목적:
 * 8968줄 lessons.ts 를 7개 챕터 파일로 자른 뒤, 사용자 학습 흐름이
 * 어딘가에서 "끊기는 부분" 이 없는지 확인. 분할은 구조만 바꾸고 내용은
 * 보존해야 하므로, 다음을 모두 통과해야 함:
 *
 * 1. ALL_LESSONS 가 정확히 15개 lesson, 257 step.
 * 2. 모든 lesson 의 (subject, chapter, topic) 으로 getLesson() 으로
 *    역조회 가능 (Zone 노드 클릭 → LessonScreen 진입의 핵심 경로).
 * 3. 모든 step.quizId 가 getQuizQuestion() 으로 매칭됨 (인라인 MCQ
 *    렌더링 핵심).
 * 4. 모든 lesson.topic 이 SUBJECT_SCHEMAS 에 실제 등록된 토픽인지
 *    (스키마 ↔ 레슨 동기화).
 * 5. getChapterSteps() 의 step 인덱스가 0..N-1 연속이며 lesson 경계 보존.
 * 6. step.id 형식이 일관 (`<lessonId>-s<n>` 또는 `<lessonId>-s<n>-<sub>`).
 *
 * 하나라도 실패하면 사용자 흐름이 끊기는 지점이 존재 → 분할이 무결하지
 * 않음.
 */

import { describe, it, expect } from 'vitest';
import {
  ALL_LESSONS,
  getLesson,
  getLessonsInChapter,
  getChapterSteps,
  getQuizQuestion,
} from './index';
import { SUBJECT_SCHEMAS } from '../subjects';

describe('lessons split — 전수 무결성 검증', () => {
  it('1. ALL_LESSONS 가 15 lesson · 300 step', () => {
    expect(ALL_LESSONS.length).toBe(15);
    const totalSteps = ALL_LESSONS.reduce(
      (sum, l) => sum + l.steps.length,
      0,
    );
    expect(totalSteps).toBe(300);
  });

  it('2. 모든 lesson 이 getLesson(subject, chapter, topic) 으로 역조회됨', () => {
    const missing: string[] = [];
    for (const lesson of ALL_LESSONS) {
      const found = getLesson(lesson.subject, lesson.chapter, lesson.topic);
      if (!found) {
        missing.push(
          `${lesson.id} (${lesson.subject} ch${lesson.chapter} "${lesson.topic}")`,
        );
      } else if (found.id !== lesson.id) {
        missing.push(
          `${lesson.id}: getLesson 가 다른 lesson(${found.id}) 반환`,
        );
      }
    }
    expect(missing, `역조회 실패한 lesson:\n${missing.join('\n')}`).toEqual(
      [],
    );
  });

  it('3. 모든 step.quizId 가 getQuizQuestion 으로 MCQ 매칭됨', () => {
    // 단, quizId 가 없는 review (그룹 복습) step 은 검증 대상 아님.
    const broken: string[] = [];
    for (const lesson of ALL_LESSONS) {
      for (const step of lesson.steps) {
        if (!step.quizId) continue; // review step skip
        const q = getQuizQuestion(step.quizId);
        if (!q) {
          broken.push(
            `${step.id} (lesson ${lesson.id}) → quizId "${step.quizId}" 매칭 실패`,
          );
        }
      }
    }
    expect(
      broken,
      `quiz 매칭 끊긴 step:\n${broken.slice(0, 20).join('\n')}`,
    ).toEqual([]);
  });

  it('4. 모든 lesson.topic 이 SUBJECT_SCHEMAS 에 등록됨 (스키마 sync)', () => {
    const orphans: string[] = [];
    for (const lesson of ALL_LESSONS) {
      const schema = SUBJECT_SCHEMAS[lesson.subject];
      const ch = schema.chapters.find((c) => c.chapter === lesson.chapter);
      if (!ch) {
        orphans.push(
          `${lesson.id}: chapter ${lesson.chapter} 가 SUBJECT_SCHEMAS 에 없음`,
        );
        continue;
      }
      if (!ch.topics.includes(lesson.topic)) {
        orphans.push(
          `${lesson.id}: topic "${lesson.topic}" 가 schema 의 ${lesson.subject} ch${lesson.chapter}.topics 에 없음`,
        );
      }
    }
    expect(orphans, `스키마 미등록 lesson:\n${orphans.join('\n')}`).toEqual(
      [],
    );
  });

  it('5. getChapterSteps 의 index 가 0..N-1 연속이며 lesson 경계 보존', () => {
    for (const subject of ['adsp', 'sqld'] as const) {
      const schema = SUBJECT_SCHEMAS[subject];
      for (const ch of schema.chapters) {
        const steps = getChapterSteps(subject, ch.chapter);
        if (steps.length === 0) continue; // 레슨 없는 챕터는 스킵
        // index 가 0, 1, 2, ... N-1 인지
        for (let i = 0; i < steps.length; i++) {
          expect(
            steps[i].index,
            `${subject} ch${ch.chapter} step[${i}].index !== ${i}`,
          ).toBe(i);
        }
        // lesson 경계가 동일 lesson 안에서만 step 묶이는지
        for (let i = 1; i < steps.length; i++) {
          if (steps[i].lesson.id !== steps[i - 1].lesson.id) {
            // lesson 전환 — 다음 step 은 새 lesson 의 첫 step 이어야 함
            const newLessonFirstStep =
              steps[i].lesson.steps[0];
            expect(
              steps[i].step.id,
              `lesson 전환 후 첫 step 이 lesson 첫 step 이 아님`,
            ).toBe(newLessonFirstStep.id);
          }
        }
      }
    }
  });

  it('6. step.id 가 lesson.id 로 시작 + s<n> 패턴 (일관성)', () => {
    const malformed: string[] = [];
    for (const lesson of ALL_LESSONS) {
      const prefix = `${lesson.id}-s`;
      for (const step of lesson.steps) {
        if (!step.id.startsWith(prefix)) {
          malformed.push(
            `${step.id} (lesson ${lesson.id}) — prefix "${prefix}" 미일치`,
          );
        }
      }
    }
    expect(
      malformed,
      `비정상 step.id:\n${malformed.slice(0, 10).join('\n')}`,
    ).toEqual([]);
  });

  it('7. lesson.id 가 unique (중복 0)', () => {
    const seen = new Set<string>();
    const dup: string[] = [];
    for (const lesson of ALL_LESSONS) {
      if (seen.has(lesson.id)) dup.push(lesson.id);
      seen.add(lesson.id);
    }
    expect(dup, `중복 lesson.id: ${dup.join(', ')}`).toEqual([]);
  });

  it('8. step.id 가 lesson 내에서 unique (중복 0)', () => {
    const dup: string[] = [];
    for (const lesson of ALL_LESSONS) {
      const seen = new Set<string>();
      for (const step of lesson.steps) {
        if (seen.has(step.id)) {
          dup.push(`${lesson.id} 내 중복: ${step.id}`);
        }
        seen.add(step.id);
      }
    }
    expect(dup, `중복 step.id: ${dup.join('\n')}`).toEqual([]);
  });

  it('9. getLessonsInChapter 가 SUBJECT_SCHEMAS 의 topic 순서로 반환', () => {
    for (const subject of ['adsp', 'sqld'] as const) {
      const schema = SUBJECT_SCHEMAS[subject];
      for (const ch of schema.chapters) {
        const lessons = getLessonsInChapter(subject, ch.chapter);
        if (lessons.length === 0) continue;
        // 반환된 lessons 의 topic 순서가 schema.topics 순서의 부분 수열인지
        // (스키마에 토픽이 있어도 lesson 이 없을 수 있으니 부분 수열)
        let schemaIdx = 0;
        for (const lesson of lessons) {
          while (
            schemaIdx < ch.topics.length &&
            ch.topics[schemaIdx] !== lesson.topic
          ) {
            schemaIdx++;
          }
          expect(
            schemaIdx,
            `${subject} ch${ch.chapter}: lesson "${lesson.topic}" 이 schema topic 순서를 깨뜨림`,
          ).toBeLessThan(ch.topics.length);
          schemaIdx++;
        }
      }
    }
  });

  it('10. 챕터별 step 카운트 합 = lesson 별 step 카운트 합', () => {
    // 모든 챕터의 getChapterSteps 합 = ALL_LESSONS 의 steps.length 합
    let chapterSum = 0;
    for (const subject of ['adsp', 'sqld'] as const) {
      const schema = SUBJECT_SCHEMAS[subject];
      for (const ch of schema.chapters) {
        chapterSum += getChapterSteps(subject, ch.chapter).length;
      }
    }
    const lessonSum = ALL_LESSONS.reduce(
      (s, l) => s + l.steps.length,
      0,
    );
    expect(chapterSum).toBe(lessonSum);
    expect(chapterSum).toBe(300);
  });
});
