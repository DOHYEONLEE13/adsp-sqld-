/**
 * Quest 화면 — 실제 문제 풀이 UI. flow 3종 지원:
 *   - play  : 선택 → 즉시 정답/오답 + 해설 → 다음
 *   - learn : 해설 먼저 노출 → '확인' → 선택 → (normal play-like)
 *   - test  : 타이머 · 선택 즉시 다음 · 피드백 없음
 */

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Crosshair,
  Lightbulb,
  Star,
  StickyNote,
  XCircle,
} from 'lucide-react';
import type { QuestSession } from '../types';
import { explanationToText } from '@/types/question';
import { cx } from '@/lib/utils';
import ScreenShell from '../components/ScreenShell';
import PageAmbientBg from '../components/PageAmbientBg';
import { setNote, toggleBookmark } from '../bookmarks';
import { useBookmarks } from '../useBookmarks';
import XpPopup from '../components/XpPopup';
import CorrectBurst from '../components/CorrectBurst';
import { XP_PER_CORRECT } from '../rpg';
import SqlQuestionContextCard from '../components/SqlQuestionContextCard';

interface Props {
  session: QuestSession;
  onAnswer: (chosenIndex: number) => void;
  onFinish: () => void;
  onAbort: () => void;
}

interface LocalState {
  chosen: number | null;
  revealed: boolean;
  /** learn flow 에서 "해설 읽는 중" 단계 여부. */
  studying: boolean;
}

/** Test mode 문제당 제한 시간 (ms). */
const TEST_TIME_LIMIT_MS = 45 * 1000;

export default function QuestScreen({
  session,
  onAnswer,
  onFinish,
  onAbort,
}: Props) {
  const current = session.questions[session.index];
  const isLearn = session.flow === 'learn';
  const isTest = session.flow === 'test';
  const isServerDeferred = !!session.sessionToken && (current?.answerIndex ?? -1) < 0;

  // learn flow 에서 해설이 있으면 studying=true 로 시작. 해설 없으면 바로 풀이.
  const initialState: LocalState = {
    chosen: null,
    revealed: false,
    studying: !isServerDeferred && isLearn && !!current?.explanation,
  };
  const [local, setLocal] = useState<LocalState>(initialState);

  // Test mode 타이머 — 문제 바뀔 때마다 리셋.
  const [remainingMs, setRemainingMs] = useState<number>(TEST_TIME_LIMIT_MS);

  // 북마크 · 노트 — 문제 단위 (test flow 에선 비활성).
  const bookmarks = useBookmarks();
  const isBookmarked = current ? bookmarks.ids.has(current.id) : false;
  const savedNote = current ? (bookmarks.notes[current.id] ?? '') : '';
  const [noteOpen, setNoteOpen] = useState<boolean>(false);
  const [noteDraft, setNoteDraft] = useState<string>('');

  // XP 팝업 — 정답일 때마다 token 을 갱신해 애니메이션 재생 (key 로 주입).
  const [xpEvent, setXpEvent] = useState<{
    token: number;
    xp: number;
    label?: string;
  } | null>(null);

  useEffect(() => {
    // 문제 바뀌면 노트 초기화 — 저장된 값이 있으면 프리필 + 자동 펼침.
    setNoteDraft(savedNote);
    setNoteOpen(savedNote !== '');
    // savedNote 는 bookmarks 구독으로 바뀌므로 의존성에 직접 넣지 않고 session.index 로 트리거.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.index]);

  useEffect(() => {
    // 문제 바뀔 때마다 local state 리셋.
    setLocal({
      chosen: null,
      revealed: false,
      studying: !isServerDeferred && isLearn && !!current?.explanation,
    });
    setRemainingMs(TEST_TIME_LIMIT_MS);
  }, [session.index, isLearn, isServerDeferred, current?.explanation]);

  useEffect(() => {
    if (!isTest || !current) return;
    const id = window.setInterval(() => {
      setRemainingMs((prev) => {
        const next = prev - 1000;
        if (next <= 0) {
          window.clearInterval(id);
          // 시간 초과 → 미응답으로 제출.
          onAnswer(-1);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isTest, current, onAnswer, session.index]);

  const progress = useMemo(
    () => ({
      curr: Math.min(session.index + 1, session.questions.length),
      total: session.questions.length,
    }),
    [session.index, session.questions.length],
  );

  if (!current) {
    return (
      <ScreenShell
        eyebrow="Quest"
        title="세션 종료"
        onExit={onAbort}
        exitLabel="나가기"
        ambient={<PageAmbientBg />}
      >
        <button
          type="button"
          onClick={onFinish}
          className="liquid-glass rounded-[20px] px-6 py-4 kr-heading uppercase tracking-widest text-[13px] hover:bg-white/10 transition"
        >
          결과 보기
        </button>
      </ScreenShell>
    );
  }

  const handleSelect = (idx: number) => {
    if (local.studying) return;
    if (isTest) {
      // 즉시 제출 후 다음으로 — test 는 XP 피드백도 숨김.
      onAnswer(idx);
      return;
    }
    if (local.revealed) return;
    setLocal({ ...local, chosen: idx, revealed: true });
    if (isServerDeferred) return;

    // 정답일 때만 XP 팝업. 이전까지의 연속 정답 수 + 1 로 streak 라벨.
    if (current && idx === current.answerIndex) {
      let run = 1;
      for (let i = session.answers.length - 1; i >= 0; i -= 1) {
        if (session.answers[i]!.correct) run += 1;
        else break;
      }
      setXpEvent({
        token: Date.now(),
        xp: XP_PER_CORRECT,
        label: run >= 3 ? `${run}연속!` : undefined,
      });
    }
  };

  const handleNext = () => {
    if (!local.revealed || local.chosen == null) return;
    onAnswer(local.chosen);
  };

  const isLast = session.index === session.questions.length - 1;
  const accent = session.subject === 'sqld' ? '#c084fc' : '#67e8f9';
  const progressPercent = (progress.curr / Math.max(progress.total, 1)) * 100;
  const displayTitle = current.topic || session.chapterTitle;
  const displaySubtitle =
    displayTitle !== session.chapterTitle ? session.chapterTitle : null;

  return (
    <section className="relative min-h-screen text-cream isolate overflow-hidden">
      <PageAmbientBg blur />
      <div className="relative mx-auto w-full max-w-[760px] px-5 pt-7 pb-12 md:px-8 md:pt-12 md:pb-16">
        <header className="mb-6 md:mb-8">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onAbort}
              className="game-back-button kr-heading inline-flex items-center gap-2 text-[12px] transition"
            >
              <ArrowLeft size={17} strokeWidth={2.4} />
              중단
            </button>
            {isTest ? (
              <div
                className="kr-heading inline-flex min-w-[76px] items-center justify-center gap-2 rounded-full border px-3.5 py-2 text-[12px] tabular-nums backdrop-blur-xl"
                style={{
                  color: remainingMs <= 10000 ? '#fb7185' : 'var(--cream)',
                  background: 'rgba(7, 17, 49, 0.56)',
                  borderColor:
                    remainingMs <= 10000
                      ? 'rgba(251,113,133,0.46)'
                      : 'rgba(239,244,255,0.14)',
                }}
              >
                <Clock size={14} strokeWidth={2.4} />
                {Math.ceil(remainingMs / 1000)}초
              </div>
            ) : null}
          </div>

          <div
            className="mt-5 overflow-hidden rounded-[24px] border px-5 py-5 backdrop-blur-2xl md:px-6 md:py-6"
            style={{
              background: `linear-gradient(145deg, color-mix(in srgb, ${accent} 10%, rgba(14,30,72,0.78)), rgba(5,14,43,0.74))`,
              borderColor: `color-mix(in srgb, ${accent} 34%, rgba(255,255,255,0.12))`,
              boxShadow: `0 18px 46px -34px ${accent}, inset 0 1px 0 rgba(255,255,255,0.11)`,
            }}
          >
            <div className="flex items-start gap-3.5">
              <div
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border"
                style={{
                  color: accent,
                  background: `color-mix(in srgb, ${accent} 13%, rgba(8,20,55,0.74))`,
                  borderColor: `color-mix(in srgb, ${accent} 28%, transparent)`,
                }}
              >
                <Crosshair size={20} strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="kr-heading text-[11px] uppercase tracking-widest"
                    style={{ color: accent }}
                  >
                    {session.label || '문제 풀이'}
                  </span>
                  <span className="kr-num shrink-0 text-[13px] text-cream/72 tabular-nums">
                    {progress.curr} / {progress.total}
                  </span>
                </div>
                <h1 className="kr-heading mt-2 text-[23px] leading-[1.3] text-cream md:text-[28px]">
                  {displayTitle}
                </h1>
                {displaySubtitle ? (
                  <p className="kr-body mt-1 text-[12px] text-cream/52 md:text-[13px]">
                    {displaySubtitle}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, color-mix(in srgb, ${accent} 72%, #ffffff), ${accent})`,
                  boxShadow: `0 0 14px color-mix(in srgb, ${accent} 45%, transparent)`,
                }}
              />
            </div>
          </div>
        </header>

      {/* Learn: 해설 선공개 패널 */}
      {local.studying ? (
        <div
          className="mb-5 rounded-[24px] border p-5 backdrop-blur-2xl md:p-7"
          style={{
            background: 'rgba(8,18,51,0.68)',
            borderColor: `color-mix(in srgb, ${accent} 28%, rgba(255,255,255,0.1))`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <span
            className="kr-heading inline-flex items-center gap-2 text-[11px] uppercase tracking-widest"
            style={{ color: accent }}
          >
            <BookOpen size={14} strokeWidth={2.4} />
            먼저 살펴보기
          </span>
          <p className="kr-body text-[14px] md:text-[15px] leading-[1.8] mt-3 text-cream/85 whitespace-pre-wrap">
            {explanationToText(current.explanation)}
          </p>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setLocal({ ...local, studying: false })}
              className="kr-heading inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13px] transition hover:brightness-110"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 84%, white), ${accent})`,
                color: '#07122f',
                boxShadow: `0 12px 28px -18px ${accent}`,
              }}
            >
              문제 풀기
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      ) : null}

      {/* 문제 지문 — 바깥 래퍼는 overflow visible 로 XP 팝업이 위로 빠질 수 있게. */}
      <div className="relative mb-6">
        {xpEvent ? (
          <>
            <CorrectBurst key={`burst-${xpEvent.token}`} />
            <XpPopup key={xpEvent.token} xp={xpEvent.xp} label={xpEvent.label} />
          </>
        ) : null}
        <div
          className="rounded-[26px] border p-5 backdrop-blur-2xl md:p-7"
          style={{
            background:
              'linear-gradient(145deg, rgba(17,35,80,0.76), rgba(7,17,49,0.78))',
            borderColor: 'rgba(203,216,255,0.18)',
            boxShadow:
              '0 22px 50px -38px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
        <div className="flex items-start justify-between gap-3">
          <span
            className="kr-heading inline-flex items-center gap-2 text-[11px] uppercase tracking-widest"
            style={{ color: accent }}
          >
            <span
              className="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 kr-num text-[11px]"
              style={{
                background: `color-mix(in srgb, ${accent} 14%, rgba(7,17,49,0.7))`,
                border: `1px solid color-mix(in srgb, ${accent} 28%, transparent)`,
              }}
            >
              {String(progress.curr).padStart(2, '0')}
            </span>
            문제
          </span>
          {!isTest ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => toggleBookmark(current.id)}
                aria-pressed={isBookmarked}
                aria-label={isBookmarked ? '북마크 해제' : '북마크'}
                className={cx(
                  'w-9 h-9 rounded-full inline-flex items-center justify-center transition',
                  isBookmarked
                    ? 'bg-[rgba(251,191,36,0.14)] text-[#fbbf24]'
                    : 'text-cream/60 hover:text-[#fbbf24] hover:bg-white/5',
                )}
              >
                <Star
                  size={18}
                  strokeWidth={2.2}
                  fill={isBookmarked ? 'currentColor' : 'none'}
                />
              </button>
              <button
                type="button"
                onClick={() => setNoteOpen((v) => !v)}
                aria-expanded={noteOpen}
                aria-label={noteOpen ? '메모 접기' : '메모 펼치기'}
                className={cx(
                  'w-9 h-9 rounded-full inline-flex items-center justify-center transition',
                  noteOpen || savedNote
                    ? 'bg-[rgba(103,232,249,0.14)] text-[#67e8f9]'
                    : 'text-cream/60 hover:text-[#67e8f9] hover:bg-white/5',
                )}
              >
                <StickyNote size={18} strokeWidth={2.2} />
              </button>
            </div>
          ) : null}
        </div>
        <p className="kr-heading mt-5 whitespace-pre-wrap text-[16px] leading-[1.75] text-cream md:text-[18px]">
          {current.question}
        </p>
        <SqlQuestionContextCard
          context={current.sqlContext}
          revealed={!isTest && local.revealed}
          className="mt-4"
        />

        {/* 메모 입력 — 저장은 blur 에 + Ctrl/Cmd+Enter. */}
        {!isTest && noteOpen ? (
          <div className="mt-4 pt-4 border-t border-white/10">
            <label className="kr-heading text-[11px] uppercase tracking-widest text-[#67e8f9] flex items-center gap-2">
              <StickyNote size={12} strokeWidth={2.4} />
              My Note
            </label>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onBlur={(e) => {
                // DOM 값을 직접 읽어야 빠른 blur 에도 마지막 타이핑이 누락되지 않음.
                const v = e.currentTarget.value;
                if (v !== savedNote) setNote(current.id, v);
              }}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  const v = (e.currentTarget as HTMLTextAreaElement).value;
                  setNote(current.id, v);
                  (e.currentTarget as HTMLTextAreaElement).blur();
                }
              }}
              placeholder="이 문제에 대한 나만의 메모 · 핵심 개념 · 실수한 이유 등..."
              rows={3}
              className="kr-body text-[13px] md:text-[14px] leading-[1.7] w-full mt-2 bg-white/5 border border-white/10 rounded-[14px] px-4 py-3 outline-none focus:border-[#67e8f9] focus:bg-white/10 resize-y placeholder:text-cream/40"
            />
            <p className="kr-body text-[11px] text-cream/40 mt-1.5 leading-[1.7]">
              탭 바깥을 누르거나 Ctrl/⌘ + Enter 로 저장. 저장한 메모는 이 문제를
              다시 풀 때나 <span className="text-[#67e8f9]">⭐ 북마크</span> 페이지에서
              언제든 다시 볼 수 있어요.
            </p>
          </div>
        ) : null}
        </div>
      </div>

      {/* 선지 */}
      <div className="grid grid-cols-1 gap-2.5 md:gap-3">
        {current.choices.map((choice, idx) => {
          const isChosen = local.chosen === idx;
          const isCorrect = !isServerDeferred && idx === current.answerIndex;
          const showCorrect = !isTest && local.revealed && isCorrect;
          const showWrong =
            !isTest &&
            !isServerDeferred &&
            local.revealed &&
            isChosen &&
            !isCorrect;
          const showServerSelected =
            isServerDeferred && local.revealed && isChosen;
          const disabled = local.studying || local.revealed;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(idx)}
              disabled={disabled}
              className={cx(
                'group rounded-[20px] border px-4 py-4 text-left transition-all duration-200 flex items-start gap-3.5 backdrop-blur-xl md:px-5 md:py-5',
                !disabled && 'cursor-pointer hover:-translate-y-0.5',
                local.studying && 'opacity-40',
              )}
              style={{
                background: showCorrect
                  ? 'linear-gradient(135deg, rgba(125,216,80,0.15), rgba(8,28,51,0.78))'
                  : showWrong
                    ? 'linear-gradient(135deg, rgba(251,113,133,0.14), rgba(35,15,48,0.78))'
                    : showServerSelected
                      ? `color-mix(in srgb, ${accent} 11%, rgba(8,18,51,0.76))`
                      : 'linear-gradient(145deg, rgba(20,39,84,0.66), rgba(7,17,49,0.72))',
                borderColor: showCorrect
                  ? 'rgba(125,216,80,0.62)'
                  : showWrong
                    ? 'rgba(251,113,133,0.62)'
                    : showServerSelected
                      ? `color-mix(in srgb, ${accent} 64%, transparent)`
                      : 'rgba(203,216,255,0.14)',
                boxShadow: showCorrect
                  ? '0 12px 30px -24px rgba(125,216,80,0.8), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : showWrong
                    ? '0 12px 30px -24px rgba(251,113,133,0.72), inset 0 1px 0 rgba(255,255,255,0.08)'
                    : `0 14px 34px -30px ${accent}, inset 0 1px 0 rgba(255,255,255,0.08)`,
              }}
            >
              <span
                className="kr-heading mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] border text-[12px] transition-colors"
                style={{
                  color: showWrong ? '#fb7185' : showCorrect ? '#9bea72' : accent,
                  background: showWrong
                    ? 'rgba(251,113,133,0.1)'
                    : showCorrect
                      ? 'rgba(125,216,80,0.12)'
                      : `color-mix(in srgb, ${accent} 10%, rgba(6,15,45,0.72))`,
                  borderColor: showWrong
                    ? 'rgba(251,113,133,0.36)'
                    : showCorrect
                      ? 'rgba(125,216,80,0.38)'
                      : `color-mix(in srgb, ${accent} 25%, rgba(255,255,255,0.08))`,
                }}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="kr-body flex-1 whitespace-pre-wrap text-[14px] leading-[1.65] text-cream/90 md:text-[15px]">
                {choice}
              </span>
              {showCorrect ? (
                <CheckCircle2
                  className="text-neon shrink-0"
                  size={20}
                  strokeWidth={2.4}
                />
              ) : null}
              {showWrong ? (
                <XCircle
                  className="text-red-400 shrink-0"
                  size={20}
                  strokeWidth={2.4}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* 해설 + 다음 버튼 (play/learn 에서 reveal 된 후) */}
      {!isTest && local.revealed ? (
        <div className="mt-6">
          {current.explanation && !isLearn ? (
            // learn 은 이미 위에서 해설을 봤으니 중복 금지.
            <div
              className="mb-5 rounded-[22px] border p-5 backdrop-blur-2xl md:p-6"
              style={{
                background: 'rgba(8,18,51,0.72)',
                borderColor: `color-mix(in srgb, ${accent} 24%, rgba(255,255,255,0.1))`,
              }}
            >
              <span
                className="kr-heading inline-flex items-center gap-2 text-[11px] uppercase tracking-widest"
                style={{ color: accent }}
              >
                <Lightbulb size={14} strokeWidth={2.4} />
                해설
              </span>
              <p className="kr-body text-[13px] md:text-[14px] leading-[1.8] text-cream/85 mt-2 whitespace-pre-wrap">
                {explanationToText(current.explanation)}
              </p>
            </div>
          ) : null}
          <div className="flex justify-stretch md:justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="kr-heading inline-flex w-full items-center justify-center gap-2 rounded-[18px] px-7 py-4 text-[14px] transition hover:brightness-110 md:w-auto md:min-w-[180px]"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 82%, white), ${accent})`,
                color: '#07122f',
                boxShadow: `0 14px 34px -20px ${accent}, inset 0 1px 0 rgba(255,255,255,0.38)`,
              }}
            >
              {isLast ? '결과 보기' : '다음 문제'}
              <ArrowRight size={17} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      ) : null}

      {/* Test mode 하단 안내 */}
      {isTest ? (
        <p className="kr-body text-[12px] text-cream/50 mt-6 text-center">
          선택하면 즉시 다음 문제로 넘어갑니다. 정답은 세션 종료 후에 공개됩니다.
        </p>
      ) : null}
      </div>
    </section>
  );
}
