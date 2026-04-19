/**
 * Quest 화면 — 실제 문제 풀이 UI. flow 3종 지원:
 *   - play  : 선택 → 즉시 정답/오답 + 해설 → 다음
 *   - learn : 해설 먼저 노출 → '확인' → 선택 → (normal play-like)
 *   - test  : 타이머 · 선택 즉시 다음 · 피드백 없음
 */

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Star,
  StickyNote,
  XCircle,
} from 'lucide-react';
import type { QuestSession } from '../types';
import { cx } from '@/lib/utils';
import ScreenShell from '../components/ScreenShell';
import { setNote, toggleBookmark } from '../bookmarks';
import { useBookmarks } from '../useBookmarks';

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

  // learn flow 에서 해설이 있으면 studying=true 로 시작. 해설 없으면 바로 풀이.
  const initialState: LocalState = {
    chosen: null,
    revealed: false,
    studying: isLearn && !!current?.explanation,
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
      studying: isLearn && !!current?.explanation,
    });
    setRemainingMs(TEST_TIME_LIMIT_MS);
  }, [session.index, isLearn, current?.explanation]);

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
      // 즉시 제출 후 다음으로.
      onAnswer(idx);
      return;
    }
    if (local.revealed) return;
    setLocal({ ...local, chosen: idx, revealed: true });
  };

  const handleNext = () => {
    if (!local.revealed || local.chosen == null) return;
    onAnswer(local.chosen);
  };

  const isLast = session.index === session.questions.length - 1;
  const eyebrowText = session.label
    ? `${session.label} · ${progress.curr}/${progress.total}`
    : `Quest ${progress.curr} / ${progress.total}`;

  return (
    <ScreenShell
      eyebrow={eyebrowText}
      title={current.topic}
      subtitle={session.chapterTitle}
      onExit={onAbort}
      exitLabel="중단"
    >
      {/* 상단 HUD — 진행률 + (test 일 때) 타이머 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="liquid-glass rounded-full h-2 overflow-hidden flex-1">
          <div
            className="h-full transition-[width] duration-500"
            style={{
              width: `${((progress.curr - 1) / progress.total) * 100}%`,
              background:
                'linear-gradient(90deg, var(--purple-1), var(--purple-2), #6FFF00)',
            }}
          />
        </div>
        {isTest ? (
          <div
            className="liquid-glass kr-heading inline-flex items-center gap-2 text-[13px] px-4 py-2 rounded-full tabular-nums"
            style={{
              color: remainingMs <= 10000 ? '#f87171' : 'var(--cream)',
            }}
          >
            <Clock size={14} strokeWidth={2.4} />
            {Math.ceil(remainingMs / 1000)}초
          </div>
        ) : null}
      </div>

      {/* Learn: 해설 선공개 패널 */}
      {local.studying ? (
        <div className="liquid-glass rounded-[24px] p-6 md:p-8 mb-6">
          <span className="kr-heading text-[11px] uppercase tracking-widest text-neon inline-flex items-center gap-2">
            <BookOpen size={14} strokeWidth={2.4} />
            Study First
          </span>
          <p className="kr-body text-[14px] md:text-[15px] leading-[1.8] mt-3 text-cream/85 whitespace-pre-wrap">
            {current.explanation}
          </p>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setLocal({ ...local, studying: false })}
              className="kr-heading uppercase tracking-widest text-[13px] px-6 py-3 rounded-full"
              style={{
                background:
                  'linear-gradient(135deg, var(--purple-1), var(--purple-2))',
                color: '#fff',
                boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.55)',
              }}
            >
              확인 · 풀어보기
            </button>
          </div>
        </div>
      ) : null}

      {/* 문제 지문 */}
      <div className="liquid-glass rounded-[24px] p-6 md:p-8 mb-6">
        <div className="flex items-start justify-between gap-3">
          <span className="kr-heading text-[11px] uppercase tracking-widest text-cream/60">
            Question {progress.curr}
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
        <p className="kr-body text-[15px] md:text-[17px] leading-[1.8] mt-3 whitespace-pre-wrap">
          {current.question}
        </p>

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
            <p className="kr-body text-[11px] text-cream/40 mt-1.5">
              탭 바깥을 누르거나 Ctrl/⌘ + Enter 로 저장.
            </p>
          </div>
        ) : null}
      </div>

      {/* 선지 */}
      <div className="grid grid-cols-1 gap-3">
        {current.choices.map((choice, idx) => {
          const isChosen = local.chosen === idx;
          const isCorrect = idx === current.answerIndex;
          const showCorrect = !isTest && local.revealed && isCorrect;
          const showWrong =
            !isTest && local.revealed && isChosen && !isCorrect;
          const disabled = local.studying || local.revealed;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(idx)}
              disabled={disabled}
              className={cx(
                'liquid-glass rounded-[18px] px-5 py-4 md:py-5 text-left transition flex items-start gap-4',
                !disabled && 'hover:bg-white/10 cursor-pointer',
                local.studying && 'opacity-40',
                showCorrect &&
                  'ring-2 ring-neon bg-[rgba(111,255,0,0.10)]',
                showWrong && 'ring-2 ring-red-400 bg-[rgba(248,113,113,0.10)]',
              )}
            >
              <span className="kr-heading text-[13px] uppercase tracking-widest text-cream/70 shrink-0 mt-0.5">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="kr-body text-[14px] md:text-[15px] leading-[1.7] flex-1">
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
            <div className="liquid-glass rounded-[20px] p-5 md:p-6 mb-5">
              <span className="kr-heading text-[11px] uppercase tracking-widest text-neon">
                Explanation
              </span>
              <p className="kr-body text-[13px] md:text-[14px] leading-[1.8] text-cream/85 mt-2 whitespace-pre-wrap">
                {current.explanation}
              </p>
            </div>
          ) : null}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="kr-heading uppercase tracking-widest text-[13px] px-7 py-4 rounded-full transition hover:scale-[1.02]"
              style={{
                background:
                  'linear-gradient(135deg, var(--purple-1), var(--purple-2))',
                color: '#fff',
                boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.55)',
              }}
            >
              {isLast ? '결과 보기' : '다음 문제'}
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
    </ScreenShell>
  );
}
