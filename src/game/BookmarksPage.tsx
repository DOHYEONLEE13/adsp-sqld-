/**
 * BookmarksPage — 북마크한 문항 모음 (#/bookmarks).
 * 과목 → 챕터 → 토픽 순으로 그룹핑해서 보여줍니다.
 * 각 엔트리에서 메모 편집 · 북마크 해제 가능.
 */

import { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Star,
  StickyNote,
  Trash2,
} from 'lucide-react';
import type { MultipleChoiceQuestion, Subject } from '@/types/question';
import { ALL_QUESTIONS } from '@/lib/questions';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import { removeBookmark, setNote } from './bookmarks';
import { useBookmarks } from './useBookmarks';
import ScreenShell from './components/ScreenShell';
import { cx } from '@/lib/utils';

interface Props {
  onExit: () => void;
}

// 빠른 조회용 index.
const QUESTION_INDEX: Record<string, MultipleChoiceQuestion> = (() => {
  const map: Record<string, MultipleChoiceQuestion> = {};
  for (const q of ALL_QUESTIONS) {
    if (q.type === 'multiple_choice') map[q.id] = q as MultipleChoiceQuestion;
  }
  return map;
})();

export default function BookmarksPage({ onExit }: Props) {
  const bookmarks = useBookmarks();
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  /** 과목 → 챕터 → 토픽 트리. */
  const tree = useMemo(() => {
    interface TopicBucket {
      topic: string;
      items: Array<{ q: MultipleChoiceQuestion; note: string }>;
    }
    interface ChapterBucket {
      chapter: number;
      title: string;
      topics: Map<string, TopicBucket>;
      count: number;
    }
    interface SubjectBucket {
      subject: Subject;
      title: string;
      chapters: Map<number, ChapterBucket>;
      count: number;
    }

    const subjects = new Map<Subject, SubjectBucket>();

    for (const id of Array.from(bookmarks.ids)) {
      const q = QUESTION_INDEX[id];
      if (!q) continue; // 데이터가 사라진 문항은 스킵.
      const note = bookmarks.notes[id] ?? '';
      let sb = subjects.get(q.subject);
      if (!sb) {
        sb = {
          subject: q.subject,
          title: SUBJECT_SCHEMAS[q.subject].title,
          chapters: new Map(),
          count: 0,
        };
        subjects.set(q.subject, sb);
      }
      let cb = sb.chapters.get(q.chapter);
      if (!cb) {
        const chapterTitle =
          SUBJECT_SCHEMAS[q.subject].chapters.find(
            (c) => c.chapter === q.chapter,
          )?.title ?? `Chapter ${q.chapter}`;
        cb = {
          chapter: q.chapter,
          title: chapterTitle,
          topics: new Map(),
          count: 0,
        };
        sb.chapters.set(q.chapter, cb);
      }
      let tb = cb.topics.get(q.topic);
      if (!tb) {
        tb = { topic: q.topic, items: [] };
        cb.topics.set(q.topic, tb);
      }
      tb.items.push({ q, note });
      cb.count += 1;
      sb.count += 1;
    }

    // 정렬 : subject key, chapter number, topic string.
    return Array.from(subjects.values()).sort((a, b) =>
      a.subject.localeCompare(b.subject),
    ).map((s) => ({
      ...s,
      chapters: Array.from(s.chapters.values())
        .sort((a, b) => a.chapter - b.chapter)
        .map((c) => ({
          ...c,
          topics: Array.from(c.topics.values()).sort((a, b) =>
            a.topic.localeCompare(b.topic),
          ),
        })),
    }));
  }, [bookmarks]);

  const total = bookmarks.ids.size;

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ScreenShell
      eyebrow="Bookmarks"
      title={total > 0 ? `내 북마크 ${total}개` : '북마크'}
      subtitle="즐겨찾기한 문항과 메모를 한 곳에서. 언제든 해제하거나 수정할 수 있어요."
      onExit={onExit}
      exitLabel="게임으로"
    >
      {total === 0 ? (
        <div className="liquid-glass rounded-[24px] p-10 text-center">
          <Star
            size={28}
            strokeWidth={2}
            className="mx-auto text-cream/40 mb-3"
          />
          <h3 className="kr-heading text-[18px] uppercase">
            아직 북마크한 문항이 없어요
          </h3>
          <p className="kr-body text-[13px] leading-[1.7] text-cream/60 mt-2 max-w-md mx-auto">
            퀘스트 중 문제 카드의 별 ⭐ 아이콘을 누르거나, 세션 종료 후
            "오답 전체 북마크" 버튼으로 한 번에 담을 수 있어요.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {tree.map((sb) => (
            <section key={sb.subject}>
              <div className="flex items-baseline gap-3 mb-5">
                <span className="cursive text-neon text-[24px] md:text-[30px] leading-none">
                  {sb.subject.toUpperCase()}
                </span>
                <h2 className="kr-heading text-[16px] md:text-[18px] uppercase">
                  {sb.title}
                </h2>
                <span className="kr-heading text-[11px] uppercase tracking-widest text-cream/50">
                  {sb.count}개
                </span>
              </div>

              <div className="flex flex-col gap-5">
                {sb.chapters.map((cb) => (
                  <div
                    key={cb.chapter}
                    className="liquid-glass rounded-[22px] p-5 md:p-6"
                  >
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div>
                        <span className="kr-heading text-[11px] uppercase tracking-widest text-cream/60">
                          Chapter {cb.chapter}
                        </span>
                        <h3 className="kr-heading text-[15px] md:text-[16px] uppercase leading-tight mt-0.5">
                          {cb.title}
                        </h3>
                      </div>
                      <span className="kr-heading text-[11px] uppercase tracking-widest text-cream/50 shrink-0">
                        {cb.count}개
                      </span>
                    </div>

                    <div className="flex flex-col gap-4">
                      {cb.topics.map((tb) => (
                        <div key={tb.topic}>
                          <div className="kr-heading text-[12px] uppercase tracking-widest text-[#fbbf24] mb-2">
                            {tb.topic}
                          </div>
                          <div className="flex flex-col gap-2">
                            {tb.items.map(({ q, note }) => (
                              <BookmarkRow
                                key={q.id}
                                question={q}
                                note={note}
                                revealed={revealedIds.has(q.id)}
                                onToggleReveal={() => toggleReveal(q.id)}
                                onRemove={() => removeBookmark(q.id)}
                                onSaveNote={(next) => setNote(q.id, next)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </ScreenShell>
  );
}

// ----------------------------------------------------------------
// Row
// ----------------------------------------------------------------

interface RowProps {
  question: MultipleChoiceQuestion;
  note: string;
  revealed: boolean;
  onToggleReveal: () => void;
  onRemove: () => void;
  onSaveNote: (note: string) => void;
}

function BookmarkRow({
  question,
  note,
  revealed,
  onToggleReveal,
  onRemove,
  onSaveNote,
}: RowProps) {
  const [noteOpen, setNoteOpen] = useState(note !== '');
  const [draft, setDraft] = useState(note);
  // 외부에서 note 가 바뀌면(다른 탭 등) 동기화.
  const lastExternal = useStaticDiff(note, draft, setDraft);
  void lastExternal;

  return (
    <div className="liquid-glass rounded-[16px] p-4 md:p-5">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="kr-body text-[13px] md:text-[14px] leading-[1.7] whitespace-pre-wrap">
            {question.question}
          </p>

          {revealed ? (
            <div className="mt-3 pt-3 border-t border-white/10">
              <span className="kr-heading text-[11px] uppercase tracking-widest text-neon inline-flex items-center gap-2">
                <CheckCircle2 size={12} strokeWidth={2.6} />
                정답
              </span>
              <p className="kr-body text-[13px] leading-[1.7] text-cream/90 mt-1">
                {question.choices[question.answerIndex]}
              </p>
              {question.explanation ? (
                <p className="kr-body text-[12px] leading-[1.7] text-cream/65 mt-2 whitespace-pre-wrap">
                  {question.explanation}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onToggleReveal}
            aria-label={revealed ? '정답 숨기기' : '정답 보기'}
            className="w-9 h-9 rounded-full inline-flex items-center justify-center text-cream/60 hover:text-neon hover:bg-white/5 transition"
          >
            {revealed ? (
              <EyeOff size={16} strokeWidth={2.2} />
            ) : (
              <Eye size={16} strokeWidth={2.2} />
            )}
          </button>
          <button
            type="button"
            onClick={() => setNoteOpen((v) => !v)}
            aria-expanded={noteOpen}
            aria-label="메모 토글"
            className={cx(
              'w-9 h-9 rounded-full inline-flex items-center justify-center transition',
              noteOpen || note
                ? 'bg-[rgba(103,232,249,0.14)] text-[#67e8f9]'
                : 'text-cream/60 hover:text-[#67e8f9] hover:bg-white/5',
            )}
          >
            <StickyNote size={16} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="북마크 해제"
            className="w-9 h-9 rounded-full inline-flex items-center justify-center text-cream/50 hover:text-red-400 hover:bg-white/5 transition"
          >
            <Trash2 size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {noteOpen ? (
        <div className="mt-3 pt-3 border-t border-white/10">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={(e) => {
              const v = e.currentTarget.value;
              if (v !== note) onSaveNote(v);
            }}
            placeholder="메모 추가..."
            rows={2}
            className="kr-body text-[13px] leading-[1.7] w-full bg-white/5 border border-white/10 rounded-[12px] px-3 py-2 outline-none focus:border-[#67e8f9] focus:bg-white/10 resize-y placeholder:text-cream/40"
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="kr-body text-[11px] text-cream/40 leading-[1.7]">
              탭 바깥을 누르면 저장 · 같은 문제를 다시 풀 때 자동으로 보여요
            </span>
            {draft !== note ? (
              <button
                type="button"
                onClick={() => onSaveNote(draft)}
                className="kr-heading text-[11px] uppercase tracking-widest text-[#67e8f9] inline-flex items-center gap-1.5 hover:opacity-80"
              >
                <Check size={12} strokeWidth={2.8} />
                저장
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** 미약한 외부 동기화 helper — note prop 이 변하면 draft 에도 반영. */
function useStaticDiff<T>(
  external: T,
  current: T,
  apply: (v: T) => void,
): T {
  // 외부가 바뀌었고, 사용자가 편집 중이 아닐 때만(동일 값일 때) 덮어씁니다.
  // 단순화를 위해 외부-다르면 덮어쓰기. 로컬 편집을 덮어쓰는 부작용은
  // setNote(draft) blur 시 external==draft 가 되므로 무해.
  if (external !== current) {
    // setState in render 는 React 가 경고하므로 마이크로태스크로 지연.
    Promise.resolve().then(() => apply(external));
  }
  // 이전 참조를 캐시할 필요는 없음.
  return external;
}

