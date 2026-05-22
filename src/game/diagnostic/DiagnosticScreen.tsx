/**
 * DiagnosticScreen — Phase 4 Step 2 진단 테스트 본체.
 *
 * 리서치 1-4절 정본.
 *
 * 흐름:
 *   1. 출제 풀 빌드 (`buildDiagnosticPool` 28문항 default)
 *   2. 1문항씩 표시 — 보기 4개, 선택 시 즉시 다음 문항으로 (피드백 X — 진단 목적)
 *   3. 진행률 표시 ("10/28 완료 — 진단 정확도 60%")
 *   4. 적응형 trigger 시 자동 추가 5문항 (50%+ 오답 단원)
 *   5. 15+ 풀이 후 "그만하고 결과 보기" 옵션 활성
 *   6. 종료 시 결과 화면 (단원별 정답률 + 종합 메시지 + 합격 가능성 + CTA)
 */

import { useEffect, useMemo, useState } from 'react';
import Ques from '@/components/mascot/Ques';
import { DEFAULT_CHARACTER, type MascotCharacter } from '@/components/mascot/types';
import SpeechBubble from '@/game/lesson/SpeechBubble';
import OptionsPanel from '@/game/lesson/OptionsPanel';
import PageAmbientBg from '@/game/components/PageAmbientBg';
import {
  buildDiagnosticPool,
  buildAdaptiveExtension,
  allChapterIds,
  CHAPTER_NAMES,
  CHAPTER_WEIGHTS,
  type DiagnosticQuestion,
} from './diagnosticPool';
import {
  buildChapterResults,
  extractWeakChapterIds,
  buildSummaryMessage,
  predictPassProbability,
  predictAfterImprovement,
  shouldTriggerAdaptive,
  canEarlyAbort,
  type DiagnosticAnswer,
} from './diagnostic';
import type { Subject } from '@/types/question';
import type { ChapterDiagnosticResult, WeaknessLevel } from '@/types/learning';
import {
  buildWeakRoadmap,
  type WeakRoadmap,
  type WeakRoadmapEntry,
} from '../studyPlan/weakRoadmap';
import { formatMinutes } from '../studyPlan/timeAllocation';

type ExamSubject = Extract<Subject, 'adsp' | 'sqld'>;

interface DiagnosticScreenProps {
  exams: ExamSubject[];
  /** 진단 종료 시 callback — weak chapter ids 전달. */
  onComplete: (weak_chapters: string[]) => void;
  /** 사용자가 진단 중단 후 onboarding 으로 복귀. */
  onAbort?: () => void;
}

type Phase = 'in_progress' | 'results';

export function DiagnosticScreen({ exams, onComplete, onAbort }: DiagnosticScreenProps) {
  // 출제 풀 — 한 번만 빌드 (useMemo)
  const initialPool = useMemo(() => buildDiagnosticPool(exams, 28), [exams]);
  const [pool, setPool] = useState<DiagnosticQuestion[]>(initialPool);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<DiagnosticAnswer[]>([]);
  const [phase, setPhase] = useState<Phase>('in_progress');
  const [adaptiveTriggered, setAdaptiveTriggered] = useState(false);
  const [questionStartAt, setQuestionStartAt] = useState<number>(Date.now());

  const character: MascotCharacter =
    exams[0] === 'sqld' ? 'selli' : DEFAULT_CHARACTER;

  // 빈 풀 처리 (운영 question 부족) — 즉시 fallback
  if (initialPool.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--base)]">
        <div className="liquid-glass p-6 rounded-2xl max-w-md text-center text-white kr-body">
          <Ques pose="sad" character={character} size={80} />
          <p className="mt-4">진단 테스트 출제 풀이 부족해요. 약점 단원을 직접 선택해주세요.</p>
          <button
            type="button"
            onClick={() => onComplete([])}
            className="mt-4 w-full p-3 rounded-xl bg-[var(--neon)] text-[var(--base)] font-bold"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 현재 문항
  const currentQuestion = pool[index];

  // 결과 단계 진입
  if (phase === 'results') {
    return (
      <DiagnosticResults
        exams={exams}
        answers={answers}
        character={character}
        onComplete={onComplete}
      />
    );
  }

  // 진행률 — 풀이 정확도 표시 (10/28 → 진단 정확도 ~36%, 단조 증가)
  const progressPct = Math.round(((index + 1) / pool.length) * 100);

  const handleAnswer = (choiceIdx: number) => {
    const elapsedSec = Math.max(1, Math.round((Date.now() - questionStartAt) / 1000));
    const isCorrect = choiceIdx === currentQuestion.answer_index;
    const newAnswer: DiagnosticAnswer = {
      question_id: currentQuestion.question_id,
      chapter_id: currentQuestion.chapter_id,
      is_correct: isCorrect,
      time_spent_seconds: elapsedSec,
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    // 적응형 trigger 검사 (시험당 1회만)
    if (
      !adaptiveTriggered &&
      shouldTriggerAdaptive(updatedAnswers, currentQuestion.chapter_id)
    ) {
      const excludeIds = new Set(updatedAnswers.map((a) => a.question_id));
      pool.forEach((q) => excludeIds.add(q.question_id));
      const extras = buildAdaptiveExtension(exams, currentQuestion.chapter_id, excludeIds, 5);
      if (extras.length > 0) {
        setAdaptiveTriggered(true);
        setPool((p) => [...p, ...extras]);
      }
    }

    // 다음 문항 또는 종료
    if (index + 1 >= pool.length) {
      setPhase('results');
    } else {
      setIndex((i) => i + 1);
      setQuestionStartAt(Date.now());
    }
  };

  const earlyAbortAllowed = canEarlyAbort(answers);

  return <DiagnosticInProgress
    pool={pool}
    index={index}
    progressPct={progressPct}
    currentQuestion={currentQuestion}
    character={character}
    earlyAbortAllowed={earlyAbortAllowed}
    adaptiveTriggered={adaptiveTriggered}
    answersCount={answers.length}
    onAnswer={handleAnswer}
    onEarlyResults={() => setPhase('results')}
    onAbort={onAbort}
  />;
}

// ─── 진행 중 (DialogueLesson 패턴 — 마스코트 + SpeechBubble + OptionsPanel) ──
interface InProgressProps {
  pool: DiagnosticQuestion[];
  index: number;
  progressPct: number;
  currentQuestion: DiagnosticQuestion;
  character: MascotCharacter;
  earlyAbortAllowed: boolean;
  adaptiveTriggered: boolean;
  answersCount: number;
  onAnswer: (idx: number) => void;
  onEarlyResults: () => void;
  onAbort?: () => void;
}

function DiagnosticInProgress({
  pool,
  index,
  progressPct,
  currentQuestion,
  character,
  earlyAbortAllowed,
  adaptiveTriggered,
  answersCount,
  onAnswer,
  onEarlyResults,
  onAbort,
}: InProgressProps) {
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

  return (
    <section className="relative min-h-screen text-cream flex flex-col isolate bg-[var(--base)]">
      <PageAmbientBg blur />

      {/* Sticky 진행바 — DialogueLesson 의 TopBar 와 동일 톤 */}
      <div
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{
          background: 'rgba(1,8,40,0.85)',
        }}
      >
        <div className="mx-auto max-w-[820px] px-5 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div>
              <p
                className="kr-num text-[10.5px] uppercase tracking-[0.18em] mb-0.5"
                style={{ color: 'var(--neon)' }}
              >
                진단 · {index + 1}/{pool.length}
                {adaptiveTriggered && ' · 추가 출제'}
              </p>
              <p className="kr-body text-[12px] text-cream/55">
                정확도 향상 · {Math.round(progressPct)}%
              </p>
            </div>
            {earlyAbortAllowed && (
              <button
                type="button"
                onClick={onEarlyResults}
                className="kr-num text-[11px] uppercase tracking-widest text-cream/60 hover:text-cream transition px-3 py-1.5 rounded-full"
                style={{
                  border: '1px solid rgba(239,244,255,0.2)',
                }}
              >
                결과 보기
              </button>
            )}
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--neon)] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-[820px] lg:max-w-[1000px] xl:max-w-[1180px] px-5 md:px-8 lg:px-12 xl:px-16 pt-6 lg:pt-10 pb-20">
        {/* 캐릭터 + 말풍선 + 영역 라벨 */}
        <div
          className={
            'flex gap-4 md:gap-6 ' +
            (bubblePlacement === 'top' ? 'flex-col items-center' : 'items-start')
          }
        >
          <div className="shrink-0">
            <Ques
              pose="think"
              character={character}
              size={isMobile ? 140 : 180}
            />
          </div>
          <div className="flex-1 w-full pt-2">
            {/* 영역 라벨 — 말풍선 위에 작게 */}
            <div
              className={
                'kr-num text-[10.5px] uppercase tracking-[0.18em] mb-2 ' +
                (bubblePlacement === 'top' ? 'text-center' : '')
              }
              style={{ color: 'rgba(239,244,255,0.55)' }}
            >
              {CHAPTER_NAMES[currentQuestion.chapter_id] ??
                currentQuestion.chapter_id}
            </div>
            <SpeechBubble
              text={currentQuestion.question}
              placement={bubblePlacement}
            />
          </div>
        </div>

        {/* 4지선다 — DialogueLesson 의 OptionsPanel 재활용 */}
        <div className="mt-8">
          <OptionsPanel
            choices={currentQuestion.choices}
            chosen={null}
            correctIndex={null}
            graded={false}
            onChoose={onAnswer}
          />
        </div>

        {/* Footer hints */}
        {!earlyAbortAllowed && answersCount > 5 && (
          <p className="kr-body text-xs text-cream/40 text-center mt-6">
            {15 - answersCount}문항 더 풀면 결과 보기 옵션이 활성화돼요
          </p>
        )}
        {onAbort && (
          <button
            type="button"
            onClick={onAbort}
            className="w-full text-center kr-body text-xs text-cream/40 hover:text-cream/70 mt-4"
          >
            진단 취소하고 돌아가기
          </button>
        )}
      </main>
    </section>
  );
}

// ─── 결과 화면 ───
function DiagnosticResults({
  exams,
  answers,
  character,
  onComplete,
}: {
  exams: ExamSubject[];
  answers: DiagnosticAnswer[];
  character: MascotCharacter;
  onComplete: (weak_chapters: string[]) => void;
}) {
  const allIds = useMemo(() => allChapterIds(exams), [exams]);
  const results = useMemo(() => buildChapterResults(answers, allIds), [answers, allIds]);
  const weakIds = useMemo(() => extractWeakChapterIds(results), [results]);
  const summaryMsg = useMemo(
    () => buildSummaryMessage(results, CHAPTER_NAMES),
    [results],
  );
  const passProb = useMemo(
    () => predictPassProbability(results, CHAPTER_WEIGHTS),
    [results],
  );
  const projectedProb = useMemo(
    () => predictAfterImprovement(results, CHAPTER_WEIGHTS),
    [results],
  );

  // 응시한 단원만 정렬 표시 (정답률 낮은 순)
  const sortedDisplayed = useMemo(() => {
    return results
      .filter((r) => r.attempted > 0)
      .sort((a, b) => a.accuracy - b.accuracy);
  }, [results]);

  // 약점 보강 로드맵 — 사용자에게 "어디 집중 + 얼마면 커버" 한눈에.
  // 진단형은 daily_minutes 미입력 단계라 default 60 사용. StudyPlanScreen 에서 변경 가능.
  const targetExam: ExamSubject = exams[0] ?? 'adsp';
  const roadmap = useMemo(
    () => buildWeakRoadmap(targetExam, results, 60),
    [targetExam, results],
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--base)] px-4 py-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Ques pose="celebrate" character={character} size={80} />
          <div className="flex-1">
            <h1 className="kr-heading text-xl text-white mb-1">진단 결과</h1>
            <p className="kr-body text-sm text-white/70">{answers.length}문항 풀이 완료</p>
          </div>
        </div>

        {/* 종합 메시지 */}
        <div className="liquid-glass p-5 rounded-2xl">
          <p className="kr-body text-base text-white/95">{summaryMsg}</p>
        </div>

        {/* 약점 보강 로드맵 — "어디 집중 + 얼마면 커버" 한눈에 */}
        {roadmap.entries.length > 0 && <WeakRoadmapCard roadmap={roadmap} />}

        {/* 합격 가능성 */}
        <div className="liquid-glass p-5 rounded-2xl space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="kr-body text-sm text-white/70">합격 가능성 (현재)</span>
            <span className="text-3xl kr-heading font-bold text-white">
              {passProb.confidence === 'low' ? '—' : `${passProb.score}%`}
            </span>
          </div>
          {passProb.confidence !== 'low' && (
            <>
              <div className="flex items-baseline justify-between">
                <span className="kr-body text-xs text-white/50">약점 보강 시 (예상)</span>
                <span className="kr-body text-lg text-[var(--neon)] font-bold">
                  {projectedProb}%
                </span>
              </div>
              <div className="text-xs text-white/40 kr-body">
                신뢰도: {confidenceLabel(passProb.confidence)}
              </div>
            </>
          )}
          {passProb.confidence === 'low' && (
            <p className="kr-body text-xs text-white/50">
              아직 데이터가 부족해. 더 풀면 정확한 예측 가능해.
            </p>
          )}
        </div>

        {/* 단원별 정답률 표 */}
        <div className="liquid-glass p-5 rounded-2xl">
          <h2 className="kr-heading text-sm text-white mb-3">단원별 진단</h2>
          <div className="space-y-2">
            {sortedDisplayed.map((r) => (
              <ChapterRow key={r.chapter_id} result={r} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => onComplete(weakIds)}
          className="w-full p-4 rounded-xl bg-[var(--neon)] text-[var(--base)] kr-body font-bold"
        >
          {weakIds.length > 0
            ? `약점 집중 학습 시작 (${weakIds.length}개 단원)`
            : '학습 시작'}
        </button>
      </div>
    </div>
  );
}

function ChapterRow({ result }: { result: ChapterDiagnosticResult }) {
  const name = CHAPTER_NAMES[result.chapter_id] ?? result.chapter_id;
  const colorClass = colorForLevel(result.level);
  const accuracyPct = Math.round(result.accuracy * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="kr-body text-sm text-white truncate">{name}</span>
          <span className={`kr-body text-xs ${colorClass.text}`}>
            {accuracyPct}% · {result.attempted}문항
          </span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
          <div className={`h-full ${colorClass.bg}`} style={{ width: `${accuracyPct}%` }} />
        </div>
      </div>
      <span className={`kr-body text-xs ${colorClass.text} whitespace-nowrap`}>
        {levelLabel(result.level)}
      </span>
    </div>
  );
}

function colorForLevel(level: WeaknessLevel): { bg: string; text: string } {
  switch (level) {
    case 'strong':
      return { bg: 'bg-green-400', text: 'text-green-300' };
    case 'normal':
      return { bg: 'bg-yellow-400', text: 'text-yellow-300' };
    case 'weak':
      return { bg: 'bg-orange-400', text: 'text-orange-300' };
    case 'critical':
      return { bg: 'bg-red-400', text: 'text-red-300' };
    case 'low_confidence':
      return { bg: 'bg-gray-400', text: 'text-gray-400' };
    case 'unknown':
      return { bg: 'bg-gray-500', text: 'text-gray-500' };
  }
}

function levelLabel(level: WeaknessLevel): string {
  switch (level) {
    case 'strong': return '강점';
    case 'normal': return '보통';
    case 'weak': return '약점';
    case 'critical': return '심각';
    case 'low_confidence': return '신뢰도↓';
    case 'unknown': return '미응시';
  }
}

function confidenceLabel(c: 'low' | 'medium' | 'high'): string {
  return c === 'high' ? '높음' : c === 'medium' ? '보통' : '낮음';
}

// ─── 약점 보강 로드맵 카드 ────────────────────────────────────────
// "어디 집중 + 얼마면 커버" 를 한눈에. priority 순 카드 + 합계 박스.

function WeakRoadmapCard({ roadmap }: { roadmap: WeakRoadmap }) {
  return (
    <div className="liquid-glass p-5 rounded-2xl space-y-4">
      <div>
        <h2 className="kr-heading text-base text-white mb-1">약점 보강 로드맵</h2>
        <p className="kr-body text-xs text-white/55 leading-[1.55]">
          정답률 낮은 순. 매일 {formatMinutes(roadmap.daily_minutes)} 학습 기준
          예상 일수입니다. 다음 화면에서 일일 시간 변경 가능.
        </p>
      </div>

      {/* 약점 카드 그리드 */}
      <div className="space-y-2">
        {roadmap.entries.map((e) => (
          <RoadmapEntryRow key={e.chapter_id} entry={e} />
        ))}
      </div>

      {/* 합계 박스 */}
      <div
        className="rounded-xl px-4 py-3 flex items-baseline justify-between gap-3"
        style={{
          background: 'var(--neon-08)',
          border: '1px solid var(--neon-32)',
        }}
      >
        <div className="min-w-0 flex-1">
          <div
            className="kr-num text-[10px] uppercase tracking-[0.18em] mb-0.5"
            style={{ color: 'var(--neon)' }}
          >
            합계 — 약점 보강 시간
          </div>
          <div className="kr-body text-[13px] text-white/85 leading-tight">
            {formatMinutes(roadmap.total_planned_minutes)} · 매일{' '}
            {formatMinutes(roadmap.daily_minutes)} 기준{' '}
            {roadmap.total_days_at_daily}일
          </div>
        </div>
      </div>
    </div>
  );
}

function RoadmapEntryRow({ entry }: { entry: WeakRoadmapEntry }) {
  const colorClass = colorForLevel(entry.level);
  const accuracyPct = Math.round(entry.accuracy * 100);
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* 우선순위 번호 */}
      <span
        className="shrink-0 w-7 h-7 rounded-full inline-flex items-center justify-center kr-num text-[12px] tabular-nums"
        style={{
          background:
            entry.level === 'critical'
              ? 'rgba(248,113,113,0.18)'
              : 'rgba(251,146,60,0.16)',
          color: entry.level === 'critical' ? '#fca5a5' : '#fdba74',
          border:
            entry.level === 'critical'
              ? '1px solid rgba(248,113,113,0.4)'
              : '1px solid rgba(251,146,60,0.4)',
          fontWeight: 700,
        }}
      >
        {entry.rank}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <span className="kr-body text-sm text-white truncate">
            {entry.display_name}
          </span>
          <span className={`kr-num text-[11px] tabular-nums ${colorClass.text}`}>
            {levelLabel(entry.level)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="kr-body text-[11.5px] text-white/55">
            정답률 {accuracyPct}% · {entry.attempted}문항
          </span>
          <span className="kr-num text-[11.5px] tabular-nums text-white/70">
            {formatMinutes(entry.planned_minutes)} · {entry.days_at_daily}일
          </span>
        </div>
      </div>
    </div>
  );
}
