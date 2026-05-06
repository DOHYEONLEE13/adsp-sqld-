/**
 * nextStep — 본 주차 목표에서 사용자가 곧장 시작할 lesson step 추천.
 *
 * Phase 4 Step 3 작업 B:
 *   GalaxyScreen 의 메인 CTA "본 주차 목표 시작" 버튼 클릭 시 — 사용자를
 *   PlanetScreen / ZoneScreen 거치지 않고 곧장 lesson step 으로 점프.
 *
 * 알고리즘:
 *   1. 본 주차의 chapters 중 completion_rate < 100% 인 첫 chapter
 *   2. 그 chapter_id 를 areaConfig 의 topics 로 변환 (예: 'adsp-3-stats' → ch3 의 두 topic)
 *   3. 운영 lessons 에서 해당 (subject, chapter, topic) 의 첫 lesson 조회
 *   4. lesson 안에서 questionStats 에 정답 기록 없는 첫 step 의 index 반환
 *   5. 모든 chapter 가 100% 면 다음 주차의 첫 미완료 chapter 로 fallback
 *   6. 데이터 부족하면 null — caller 가 legacy "ADSP 플레이하기" 동작으로 fallback
 *
 * 출력은 GamePage 가 lesson 화면을 직접 mount 하는 데 필요한 정보.
 */

import type { StudyPlan } from '@/types/learning/studyPlan';
import type { Subject } from '@/types/question';
import type { ChapterStepEntry } from '@/data/lessons';
import type { ProgressStore } from '@/game/storage';
import { getLessonsInChapter } from '@/data/lessons';
import { getAreas, type AreaConfig, type AreaTopic } from './areaConfig';
import { getCurrentWeekProgress } from './progressTracker';

type ExamSubject = Extract<Subject, 'adsp' | 'sqld'>;

/** 본 주차 목표 진입 정보. */
export interface NextStepRecommendation {
  /** 시험 (운영 라우팅용). */
  subject: ExamSubject;
  /** 운영 chapter 번호. */
  chapter: number;
  /** 운영 topic 이름 (lessons schema 의 topic). */
  topic: string;
  /** lesson 안에서 시작할 step 의 0-based index. */
  initialStepIdx: number;
  /** 컨텍스트 표시용 — chapter display_name (예: "1과목 데이터 이해"). */
  chapter_display_name: string;
  /** lesson 의 사람-읽는 제목. */
  lesson_title: string;
  /** 본 주차 번호. */
  week_number: number;
  /** 진단 정보 — 진입 사유 (UI 디버그 또는 향후 분석). */
  reason:
    | 'first_pending_in_week'    // 본 주차 첫 미완료 chapter 의 첫 미완료 step
    | 'next_week_pending'        // 본 주차 모두 완료 → 다음 주차 첫 미완료
    | 'plan_completed';          // 모든 chapter 완료 — 시험 모드 추천
}

/**
 * 메인 CTA 추천.
 *
 * @param plan - 활성 study plan
 * @param sessions - 진도 계산용
 * @param questionStats - step 의 quiz 정답 여부 판정용
 * @param now - 테스트 주입
 */
export function recommendNextStep(
  plan: StudyPlan,
  sessions: ProgressStore['sessions'],
  questionStats: ProgressStore['questionStats'],
  now: number = Date.now(),
): NextStepRecommendation | null {
  const areas = getAreas(plan.exam);

  // 1. 본 주차 진도
  const currentWeek = getCurrentWeekProgress(plan, sessions, now);

  // 2. 본 주차의 chapter 중 첫 미완료
  let candidate = currentWeek.chapters.find(
    (c) => c.completion_rate < 1 && c.planned_minutes > 0,
  );
  let reason: NextStepRecommendation['reason'] = 'first_pending_in_week';
  let weekNumber = currentWeek.week_number;

  // 3. 본 주차 다 끝났으면 다음 주차들 확인
  if (!candidate) {
    for (const w of plan.weeks) {
      if (w.week_number <= currentWeek.week_number) continue;
      const c = w.chapters.find((ch) => ch.planned_minutes > 0);
      if (c) {
        // 다음 주차의 chapter — actual 0 가정 (sessions 에 본 chapter 시간 없으면 미완료)
        candidate = {
          chapter_id: c.chapter_id,
          display_name:
            areas.find((a) => a.chapter_id === c.chapter_id)?.display_name ??
            c.chapter_id,
          planned_minutes: c.planned_minutes,
          actual_minutes: 0,
          completion_rate: 0,
        };
        reason = 'next_week_pending';
        weekNumber = w.week_number;
        break;
      }
    }
  }

  if (!candidate) {
    // 모든 chapter 완료 — 시험 모드/모의고사 흐름. caller 가 legacy 동작으로.
    return null;
  }

  // 4. chapter_id → AreaConfig
  const area = areas.find((a) => a.chapter_id === candidate!.chapter_id);
  if (!area) return null;

  // 5. AreaConfig.topics 의 첫 topic 의 첫 lesson 조회
  const lessonInfo = pickFirstLessonForArea(plan.exam, area, questionStats);
  if (!lessonInfo) return null;

  return {
    subject: plan.exam,
    chapter: lessonInfo.chapter,
    topic: lessonInfo.topic,
    initialStepIdx: lessonInfo.initialStepIdx,
    chapter_display_name: area.display_name,
    lesson_title: lessonInfo.lessonTitle,
    week_number: weekNumber,
    reason,
  };
}

/**
 * 영역 → 운영 lesson 의 첫 미완료 step 정보.
 *
 * 알고리즘:
 *   - area.topics 를 순회 (보통 1~2개)
 *   - 각 topic 매핑 (chapter, topic) 으로 getLessonsInChapter 의 lesson 들 조회
 *   - 각 lesson 의 step 들 중 quizId 가 questionStats 에 정답 (correct > 0) 없는 첫 step 반환
 *   - 모두 정답이면 다음 lesson, 다음 topic 으로
 *   - 영역 전체가 모두 정답이면 첫 lesson 의 마지막 step 반환 (재학습 fallback)
 */
function pickFirstLessonForArea(
  exam: ExamSubject,
  area: AreaConfig,
  questionStats: ProgressStore['questionStats'],
): { chapter: number; topic: string; initialStepIdx: number; lessonTitle: string } | null {
  const allCandidates: Array<{
    chapter: number;
    topic: string;
    lessons: ReturnType<typeof getLessonsInChapter>;
  }> = [];

  for (const t of area.topics) {
    const lessons = getLessonsInChapter(exam, t.chapter);
    if (lessons.length === 0) continue;
    if (t.topic === null) {
      // chapter 전체 = 모든 topic
      for (const lesson of lessons) {
        allCandidates.push({
          chapter: t.chapter,
          topic: lesson.topic,
          lessons: [lesson],
        });
      }
    } else {
      const matched = lessons.filter((l) => l.topic === t.topic);
      if (matched.length === 0) continue;
      allCandidates.push({ chapter: t.chapter, topic: t.topic, lessons: matched });
    }
  }

  if (allCandidates.length === 0) return null;

  // 첫 미완료 step 찾기
  for (const c of allCandidates) {
    for (const lesson of c.lessons) {
      const idx = lesson.steps.findIndex((s) => {
        if (!s.quizId) return true; // quiz 없는 step 은 미해결로 간주
        const stat = questionStats[s.quizId];
        return !stat || (stat.correct ?? 0) === 0;
      });
      if (idx !== -1) {
        return {
          chapter: c.chapter,
          topic: c.topic,
          initialStepIdx: idx,
          lessonTitle: lesson.title,
        };
      }
    }
  }

  // 모두 정답 — 첫 lesson 의 첫 step 으로 fallback (사용자 재학습)
  const first = allCandidates[0];
  const firstLesson = first.lessons[0];
  return {
    chapter: first.chapter,
    topic: first.topic,
    initialStepIdx: 0,
    lessonTitle: firstLesson.title,
  };
}

/** AreaConfig.topics 의 정확한 타입 export — caller 가 직접 사용 가능. */
export type { AreaTopic, ChapterStepEntry };
