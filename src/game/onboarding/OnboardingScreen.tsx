/**
 * OnboardingScreen — Phase 4 Step 2 첫 진입 마스코트 대화 플로우.
 *
 * 리서치 1-1·1-2·1-3절 정본.
 *
 * 구조:
 *   - 좌상단: 마스코트 (Ques) — pose 가 단계별로 변화
 *   - 중앙: 질문 텍스트 (SpeechBubble 스타일)
 *   - 하단: 답 선택 옵션 (버튼 또는 입력)
 *   - 좌하단: 뒤로가기 (history > 0 일 때만)
 *
 * 통합 정책:
 *   - 진단형 분기 (q3 reviewer) → DiagnosticScreen 진입 (별도 컴포넌트, 본 파일에서는 callback)
 *   - 완료 시 onComplete(state) 호출 → caller 가 UserProfile 갱신
 *
 * Skeleton 단계 — UI 디자인 디테일 (애니메이션, 마이크로 인터랙션) 은 Step 별 폴리싱.
 */

import React, { useEffect, useMemo, useReducer, useState } from 'react';
import Ques from '@/components/mascot/Ques';
import { DEFAULT_CHARACTER, type MascotCharacter } from '@/components/mascot/types';
import SpeechBubble from '@/game/lesson/SpeechBubble';
import PageAmbientBg from '@/game/components/PageAmbientBg';
import { getUpcomingPresets, type ExamPreset } from '../examDate';
import {
  initialOnboardingState,
  reduce,
  isComplete,
  REVIEWER_DEFAULTS,
  type OnboardingState,
  type OnboardingEvent,
} from './onboardingState';
import type { Subject } from '@/types/question';
import type { Persona, UserBackground, StudyStyle } from '@/types/learning';

type ExamSubject = Extract<Subject, 'adsp' | 'sqld'>;

interface OnboardingScreenProps {
  /** 완료 시 callback — caller (App 또는 GamePage) 가 UserProfile 갱신. */
  onComplete: (result: {
    persona: Persona;
    background: UserBackground;
    exams: ExamSubject[];
    exam_dates: { [exam in ExamSubject]?: Date };
    daily_minutes: number;
    study_style: StudyStyle;
    weak_chapters?: string[];
  }) => void;

  /** 진단 테스트 진입 trigger (재응시생 진단형 선택 시). */
  onDiagnosticEntry: (exams: ExamSubject[], onDiagnosticDone: (weak_chapters: string[]) => void) => void;

  /** 사용자가 onboarding 건너뛰기 옵션 (게스트 모드 유지). */
  onSkip?: () => void;
}

export function OnboardingScreen({ onComplete, onDiagnosticEntry, onSkip }: OnboardingScreenProps) {
  const [state, dispatch] = useReducer(
    (s: OnboardingState, e: OnboardingEvent) => reduce(s, e),
    initialOnboardingState(),
  );

  // 인트로 화면 (UI-only — 상태 머신 비포함). 사용자가 [시작] 누르기 전에 노출.
  const [showIntro, setShowIntro] = useState(true);

  // 페르소나 결정 후 mascot character 자동 라우팅 (adsp → tori, sqld → selli, 기본 → tori)
  const character: MascotCharacter =
    state.exams[0] === 'sqld' ? 'selli' : DEFAULT_CHARACTER;

  // 단계별 마스코트 pose
  const pose = posefor(state.current_step);

  // 완료 처리 — 'done' 단계에서 사용자가 [시작하기] 클릭 시에만 실행 (자동 X).
  const handleFinish = () => {
    if (isComplete(state)) {
      const result = stateToProfileResult(state);
      onComplete(result);
    }
  };

  // 진단 진입 분기
  React.useEffect(() => {
    if (state.current_step === 'reviewer_diagnostic_entry') {
      onDiagnosticEntry(state.exams, (weak_chapters) => {
        dispatch({ type: 'diagnostic_complete', weak_chapters });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.current_step]);

  // 진단 경유 사용자 — done 단계 진입 시 자동 완료 (추가 [학습 시작하기] 클릭 마찰 제거).
  // 일반 입문자/메타인지형은 명시적 버튼 클릭 유지 — 일관성 있는 UX.
  React.useEffect(() => {
    if (state.current_step !== 'done') return;
    if (!state.history.includes('reviewer_diagnostic_entry')) return;
    if (!isComplete(state)) return;
    const result = stateToProfileResult(state);
    onComplete(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.current_step]);

  // 모바일/데스크톱 분기 — DialogueLesson 과 동일한 패턴
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const bubblePlacement: 'top' | 'right' = isMobile ? 'top' : 'right';

  // ─── 인트로 화면 (상태 머신 진입 전) ───
  if (showIntro) {
    return (
      <section className="relative min-h-screen text-cream flex flex-col isolate bg-[var(--base)]">
        <PageAmbientBg blur />
        <main className="flex-1 mx-auto w-full max-w-[820px] lg:max-w-[1000px] xl:max-w-[1180px] px-5 md:px-8 lg:px-12 xl:px-16 pt-10 lg:pt-14 pb-16">
          <div
            className={
              'flex gap-4 md:gap-6 ' +
              (bubblePlacement === 'top' ? 'flex-col items-center' : 'items-start')
            }
          >
            <div className="shrink-0">
              <Ques pose="wave" character={DEFAULT_CHARACTER} size={isMobile ? 140 : 180} />
            </div>
            <div className="flex-1 w-full pt-2">
              <SpeechBubble
                text="안녕! 나는 토리라고 해. 시작하기 전에 몇 가지만 물어볼게!"
                placement={bubblePlacement}
              />
            </div>
          </div>
          <div className="mt-8 max-w-[560px] mx-auto w-full">
            <button
              type="button"
              onClick={() => setShowIntro(false)}
              className="w-full p-4 rounded-xl liquid-glass kr-heading uppercase tracking-widest text-[14px] transition hover:bg-white/10 active:scale-[0.98]"
              style={{
                color: 'var(--neon)',
                border: '1px solid color-mix(in srgb, var(--neon) 45%, transparent)',
                boxShadow:
                  '0 6px 24px -10px color-mix(in srgb, var(--neon) 60%, transparent), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              시작
            </button>
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="w-full text-center kr-body text-sm text-white/60 hover:text-white mt-3"
              >
                건너뛰기
              </button>
            )}
          </div>
        </main>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen text-cream flex flex-col isolate bg-[var(--base)]">
      <PageAmbientBg blur />
      <main className="flex-1 mx-auto w-full max-w-[820px] lg:max-w-[1000px] xl:max-w-[1180px] px-5 md:px-8 lg:px-12 xl:px-16 pt-10 lg:pt-14 pb-16">
        {/* 캐릭터 + 말풍선 — DialogueLesson 컨셉 학습 포맷과 동일 */}
        <div
          className={
            'flex gap-4 md:gap-6 ' +
            (bubblePlacement === 'top' ? 'flex-col items-center' : 'items-start')
          }
        >
          <div className="shrink-0">
            <Ques pose={pose} character={character} size={isMobile ? 140 : 180} />
          </div>
          <div className="flex-1 w-full pt-2">
            <SpeechBubble text={questionText(state)} placement={bubblePlacement} />
          </div>
        </div>

        {/* 단계별 인풋 */}
        <div className="mt-8 max-w-[560px] mx-auto w-full">
          <StepContent state={state} dispatch={dispatch} onFinish={handleFinish} />
        </div>

        {/* 하단 네비 — 이전 / 건너뛰기 */}
        <div className="mt-8 max-w-[560px] mx-auto w-full flex justify-between items-center">
          {state.history.length > 0 ? (
            <button
              type="button"
              onClick={() => dispatch({ type: 'back' })}
              className="kr-body text-sm text-white/60 hover:text-white"
            >
              ← 이전
            </button>
          ) : (
            <span />
          )}
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="kr-body text-sm text-white/60 hover:text-white"
            >
              건너뛰기
            </button>
          )}
        </div>
      </main>
    </section>
  );
}

// ─── 단계별 질문 텍스트 ───
function questionText(s: OnboardingState): string {
  switch (s.current_step) {
    case 'q1_persona':
      return '안녕! 만나서 반가워. 너의 학습 목표를 알려줘.';
    case 'q2_exam':
      return '어떤 시험을 준비하고있어?';
    case 'q3_beginner_background':
      return '얼마나 알고있어?';
    case 'q3_reviewer_weak_known':
      return '너의 약점이 어디인지 알고 있어?';
    case 'q4_beginner_exam_date':
      return '어느 회차를 준비하고 있어?';
    case 'q4_reviewer_weak_chapters':
      return '약점 단원을 골라줘 (복수 선택 가능). 어느 회차를 준비하고 있어?';
    case 'q5_beginner_daily_minutes':
      return '하루에 얼마나 학습할 수 있어?';
    case 'q6_beginner_study_style':
      return '너의 학습 스타일은?';
    case 'reviewer_diagnostic_entry':
      return '정확한 진단을 위해 진단 테스트를 받아볼까? 결제 유도 없이 분석 결과만 알려줄게. 안심해!';
    case 'done':
      return '준비 완료! 이제 학습을 시작해보자!';
  }
}

function posefor(step: OnboardingState['current_step']) {
  switch (step) {
    case 'q1_persona':
      return 'wave' as const;
    case 'q2_exam':
    case 'q3_beginner_background':
    case 'q3_reviewer_weak_known':
      return 'think' as const;
    case 'q4_beginner_exam_date':
    case 'q4_reviewer_weak_chapters':
    case 'q5_beginner_daily_minutes':
    case 'q6_beginner_study_style':
      return 'lightbulb' as const;
    case 'reviewer_diagnostic_entry':
      return 'happy' as const;
    case 'done':
      return 'celebrate' as const;
  }
}

// ─── 단계별 인풋 컴포넌트 ───
function StepContent({
  state,
  dispatch,
  onFinish,
}: {
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingEvent>;
  onFinish: () => void;
}) {
  switch (state.current_step) {
    case 'q1_persona':
      return (
        <div className="space-y-2">
          <ChoiceButton onClick={() => dispatch({ type: 'q1_answer', persona: 'beginner' })}>
            ① 처음부터 차근차근 배우고 싶어
          </ChoiceButton>
          <ChoiceButton onClick={() => dispatch({ type: 'q1_answer', persona: 'reviewer' })}>
            ② 이미 공부한 적 있어. 약점 보강이 필요해
          </ChoiceButton>
        </div>
      );
    case 'q2_exam':
      return (
        <div className="space-y-2">
          <ChoiceButton onClick={() => dispatch({ type: 'q2_answer', exams: ['adsp'] })}>
            ① ADsP (데이터분석 준전문가)
          </ChoiceButton>
          <ChoiceButton onClick={() => dispatch({ type: 'q2_answer', exams: ['sqld'] })}>
            ② SQLD (SQL 개발자)
          </ChoiceButton>
          <ChoiceButton onClick={() => dispatch({ type: 'q2_answer', exams: ['adsp', 'sqld'] })}>
            ③ 둘 다 (순차 학습 권장)
          </ChoiceButton>
        </div>
      );
    case 'q3_beginner_background': {
      // 선택한 시험에 따라 경험 도메인 워딩 분기 — ADsP=통계, SQLD=SQL, 둘 다=통계/SQL
      const hasAdsp = state.exams.includes('adsp');
      const hasSqld = state.exams.includes('sqld');
      const domain =
        hasAdsp && hasSqld ? '통계/SQL' : hasSqld ? 'SQL' : '통계';
      const expDomain =
        hasAdsp && hasSqld ? '개발/통계' : hasSqld ? '개발' : '통계';
      return (
        <div className="space-y-2">
          <ChoiceButton onClick={() => dispatch({ type: 'q3_beginner_answer', background: 'novice' })}>
            ① 비전공자, 처음이야 ({domain} 경험 없음)
          </ChoiceButton>
          <ChoiceButton onClick={() => dispatch({ type: 'q3_beginner_answer', background: 'some_basis' })}>
            ② 일부 기초 있어 ({domain} 경험 있음)
          </ChoiceButton>
          <ChoiceButton onClick={() => dispatch({ type: 'q3_beginner_answer', background: 'experienced' })}>
            ③ {expDomain} 경험 충분 (전공자 또는 실무자)
          </ChoiceButton>
        </div>
      );
    }
    case 'q3_reviewer_weak_known':
      return (
        <div className="space-y-2">
          <ChoiceButton onClick={() => dispatch({ type: 'q3_reviewer_answer', choice: 'metacognitive' })}>
            ① 알고 있어. 직접 선택할게
          </ChoiceButton>
          {/* "② 잘 모르겠어. 진단받고 싶어" — 진단 시스템은 v1.1 에 별도 추가 예정.
              DiagnosticScreen / diagnosticPool / diagnostic 알고리즘 자산은 보존.
              상태 머신의 'diagnostic' 분기도 코드상 보존 (재활성화 시 1줄 복원). */}
          <ChoiceButton onClick={() => dispatch({ type: 'q3_reviewer_answer', choice: 'fallback_beginner' })}>
            ② 그냥 처음부터 다시 보고 싶어
          </ChoiceButton>
        </div>
      );
    case 'q4_beginner_exam_date':
      return <ExamDateInput exams={state.exams} dispatch={dispatch} />;
    case 'q4_reviewer_weak_chapters':
      return <WeakChapterInput exams={state.exams} dispatch={dispatch} />;
    case 'q5_beginner_daily_minutes':
      return (
        <div className="space-y-2">
          <ChoiceButton onClick={() => dispatch({ type: 'q5_beginner_answer', daily_minutes: 30 })}>① 30분</ChoiceButton>
          <ChoiceButton onClick={() => dispatch({ type: 'q5_beginner_answer', daily_minutes: 60 })}>② 1시간</ChoiceButton>
          <ChoiceButton onClick={() => dispatch({ type: 'q5_beginner_answer', daily_minutes: 120 })}>③ 2시간 이상</ChoiceButton>
          <ChoiceButton onClick={() => dispatch({ type: 'q5_beginner_answer', daily_minutes: 90 })}>④ 주말에만 집중 (평균 90분)</ChoiceButton>
        </div>
      );
    case 'q6_beginner_study_style':
      return (
        <div className="space-y-2">
          <ChoiceButton onClick={() => dispatch({ type: 'q6_beginner_answer', study_style: 'distributed' })}>
            ① 매일 꾸준히 (분산형)
          </ChoiceButton>
          <ChoiceButton onClick={() => dispatch({ type: 'q6_beginner_answer', study_style: 'intensive' })}>
            ② 몰아서 집중 (집중형)
          </ChoiceButton>
        </div>
      );
    case 'reviewer_diagnostic_entry':
      return (
        <div className="text-center text-white/60 kr-body text-sm">진단 테스트를 준비하고 있어요...</div>
      );
    case 'done':
      return (
        <button
          type="button"
          onClick={onFinish}
          className="w-full p-4 rounded-xl liquid-glass kr-heading uppercase tracking-widest text-[14px] transition hover:bg-white/10 active:scale-[0.98]"
          style={{
            color: 'var(--neon)',
            border: '1px solid color-mix(in srgb, var(--neon) 45%, transparent)',
            boxShadow:
              '0 6px 24px -10px color-mix(in srgb, var(--neon) 60%, transparent), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          학습 시작하기
        </button>
      );
  }
}

function ChoiceButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl liquid-glass hover:bg-white/10 transition kr-body text-sm text-white"
    >
      {children}
    </button>
  );
}

// ─── 시험일 입력 (입문자) ───
// 자유 date input 대신 EXAM_PRESETS 의 다가오는 회차 중 선택. 프로필 탭과 동일 데이터.
function ExamDateInput({
  exams,
  dispatch,
}: {
  exams: ExamSubject[];
  dispatch: React.Dispatch<OnboardingEvent>;
}) {
  const [dates, setDates] = useState<{ [k in ExamSubject]?: string }>({});

  const allReady = exams.every((ex) => !!dates[ex]);

  const handleSubmit = () => {
    const exam_dates: { [k in ExamSubject]?: Date } = {};
    for (const ex of exams) {
      const ymd = dates[ex];
      if (ymd) exam_dates[ex] = ymdToDate(ymd);
    }
    dispatch({ type: 'q4_beginner_answer', exam_dates });
  };

  const handleSkip = () => {
    // "아직 정하지 않았어" — D-60 가정
    const placeholder = new Date(Date.now() + 60 * 24 * 3600 * 1000);
    const exam_dates: { [k in ExamSubject]?: Date } = {};
    for (const ex of exams) exam_dates[ex] = placeholder;
    dispatch({ type: 'q4_beginner_answer', exam_dates });
  };

  return (
    <div className="space-y-5">
      {exams.map((ex) => (
        <ExamRoundPicker
          key={ex}
          exam={ex}
          selected={dates[ex]}
          onSelect={(ymd) => setDates((d) => ({ ...d, [ex]: ymd }))}
        />
      ))}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allReady}
        className="w-full p-3 rounded-xl liquid-glass kr-heading uppercase tracking-widest text-[14px] transition hover:bg-white/10 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          color: 'var(--neon)',
          border: '1px solid color-mix(in srgb, var(--neon) 45%, transparent)',
          boxShadow:
            '0 6px 24px -10px color-mix(in srgb, var(--neon) 60%, transparent), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        다음
      </button>
      <button
        type="button"
        onClick={handleSkip}
        className="w-full text-center kr-body text-xs text-white/50 hover:text-white"
      >
        아직 정하지 않았어 (D-60 가정)
      </button>
    </div>
  );
}

/** YYYY-MM-DD → Date (로컬 자정). examDate.ts 와 동일 파싱. */
function ymdToDate(ymd: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return new Date(ymd);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** 다가오는 회차 + D-day 라벨. */
function presetLabel(p: ExamPreset, now: number = Date.now()): string {
  const target = ymdToDate(p.date);
  target.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / (24 * 3600 * 1000));
  const dday = days <= 0 ? 'D-day' : `D-${days}`;
  return `${p.round} · ${p.display} · ${dday}`;
}

/** 한 시험의 다가오는 회차 목록 + 라디오식 선택. */
function ExamRoundPicker({
  exam,
  selected,
  onSelect,
}: {
  exam: ExamSubject;
  selected?: string;
  onSelect: (ymd: string) => void;
}) {
  const presets = useMemo(() => getUpcomingPresets(exam), [exam]);
  if (presets.length === 0) {
    return (
      <div className="kr-body text-sm text-white/60">
        {exam.toUpperCase()} 다가오는 회차가 없어요. 일정 발표 후 다시 알려드릴게요.
      </div>
    );
  }
  return (
    <div>
      <div className="kr-body text-sm text-white/80 mb-2">
        {exam.toUpperCase()} 시험 회차를 선택해줘
      </div>
      <div className="space-y-2">
        {presets.map((p) => {
          const isSel = selected === p.date;
          return (
            <button
              key={p.date}
              type="button"
              onClick={() => onSelect(p.date)}
              className={
                'w-full text-left p-3 rounded-xl kr-body text-sm transition ' +
                (isSel
                  ? 'liquid-glass font-bold'
                  : 'liquid-glass text-white hover:bg-white/10')
              }
              style={
                isSel
                  ? {
                      color: 'var(--neon)',
                      border:
                        '1px solid color-mix(in srgb, var(--neon) 55%, transparent)',
                      background:
                        'color-mix(in srgb, var(--neon) 8%, transparent)',
                    }
                  : undefined
              }
            >
              {presetLabel(p)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 약점 단원 선택 (재응시생 메타인지형) ───
function WeakChapterInput({
  exams,
  dispatch,
}: {
  exams: ExamSubject[];
  dispatch: React.Dispatch<OnboardingEvent>;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [dates, setDates] = useState<{ [k in ExamSubject]?: string }>({});

  // 단원 후보 — Phase 4 Step 1 의 chapter slug 기반
  // 실제 운영 시점에는 SUBJECT_SCHEMAS 또는 question-bank meta 에서 동적 로드
  const chapterCandidates: { [k in ExamSubject]?: { id: string; name: string }[] } = {
    adsp: [
      { id: 'adsp-1-1', name: '데이터의 이해' },
      { id: 'adsp-1-2', name: '데이터의 가치와 미래' },
      { id: 'adsp-1-3', name: '가치 창조 데이터 사이언스' },
      { id: 'adsp-2-1', name: '데이터 분석 기획의 이해' },
      { id: 'adsp-2-2', name: '분석 마스터플랜' },
      { id: 'adsp-3-1', name: 'R 기초와 데이터 마트' },
      { id: 'adsp-3-2', name: '통계 분석' },
      { id: 'adsp-3-3', name: '정형 데이터 마이닝' },
    ],
    sqld: [
      { id: 'sqld-1-1', name: '데이터 모델링의 이해' },
      { id: 'sqld-1-2', name: '데이터 모델과 성능' },
      { id: 'sqld-2-1', name: 'SQL 기본' },
      { id: 'sqld-2-2', name: 'SQL 활용' },
      { id: 'sqld-2-3', name: '관리 구문' },
    ],
  };

  const candidates = exams.flatMap((ex) => chapterCandidates[ex] ?? []);
  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const handleSubmit = () => {
    if (selected.length === 0) return;
    const exam_dates: { [k in ExamSubject]?: Date } = {};
    for (const ex of exams) {
      const ymd = dates[ex];
      exam_dates[ex] = ymd
        ? ymdToDate(ymd)
        : new Date(Date.now() + 60 * 24 * 3600 * 1000);
    }
    dispatch({ type: 'q4_reviewer_answer', weak_chapters: selected, exam_dates });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="kr-body text-sm text-white/80 mb-2">약점 단원 (복수 선택)</div>
        <div className="grid grid-cols-2 gap-2">
          {candidates.map((c) => {
            const isSel = selected.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                className={
                  'p-3 rounded-xl text-left kr-body text-xs transition ' +
                  (isSel ? 'liquid-glass font-bold' : 'liquid-glass text-white')
                }
                style={
                  isSel
                    ? {
                        color: 'var(--neon)',
                        border:
                          '1px solid color-mix(in srgb, var(--neon) 55%, transparent)',
                        background:
                          'color-mix(in srgb, var(--neon) 8%, transparent)',
                      }
                    : undefined
                }
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>
      {exams.map((ex) => (
        <ExamRoundPicker
          key={ex}
          exam={ex}
          selected={dates[ex]}
          onSelect={(ymd) => setDates((d) => ({ ...d, [ex]: ymd }))}
        />
      ))}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={selected.length === 0}
        className="w-full p-3 rounded-xl liquid-glass kr-heading uppercase tracking-widest text-[14px] transition hover:bg-white/10 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          color: 'var(--neon)',
          border: '1px solid color-mix(in srgb, var(--neon) 45%, transparent)',
          boxShadow:
            '0 6px 24px -10px color-mix(in srgb, var(--neon) 60%, transparent), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        다음 ({selected.length}개 선택)
      </button>
    </div>
  );
}

// ─── 헬퍼 ───
function stateToProfileResult(state: OnboardingState) {
  return {
    persona: state.persona,
    background: state.background ?? REVIEWER_DEFAULTS.background,
    exams: state.exams,
    exam_dates: state.exam_dates,
    daily_minutes: state.daily_minutes ?? REVIEWER_DEFAULTS.daily_minutes,
    study_style: state.study_style ?? REVIEWER_DEFAULTS.study_style,
    weak_chapters: state.weak_chapters,
  };
}
