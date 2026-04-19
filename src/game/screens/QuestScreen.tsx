/**
 * Quest 화면 — 실제 문제 풀이 UI. flow 3종 지원:
 *   - play  : 선택 → 즉시 정답/오답 + 해설 → 다음
 *   - learn : 해설 먼저 노출 → '확인' → 선택 → (normal play-like)
 *   - test  : 타이머 · 선택 즉시 다음 · 피드백 없음
 */

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { QuestSession } from '../types';
import { cx } from '@/lib/utils';
import ScreenShell from '../components/ScreenShell';

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
        <span className="kr-heading text-[11px] uppercase tracking-widest text-cream/60">
          Question {progress.curr}
        </span>
        <p className="kr-body text-[15px] md:text-[17px] leading-[1.8] mt-3 whitespace-pre-wrap">
          {current.question}
        </p>
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
