/**
 * BookmarkedConceptsList — 북마크한 [문제] 카드 리스트.
 *
 * - questionId 단위 (bookmarks.ts) — 학습·실전·모의고사 어디서든 별로 등록한 문제 모두.
 * - lesson 매칭이 되는 문제는 step 으로 직접 점프 (LessonScreen + 문제 phase),
 *   매칭 없는 문제 (실전 세트·모의고사 단독) 는 #/bookmarks 페이지로 fallback.
 *
 * 사용처:
 *   - StatsPage (프로필) — 전 과목
 *   - PlanetScreen (ADsP first 화면) — subject="adsp" 필터
 */

import { useState } from 'react';
import { Bookmark, ChevronDown, ChevronRight, X } from 'lucide-react';
import type { Subject } from '@/types/question';
import { useResolvedBookmarks } from '../useConceptBookmarks';
import { removeBookmark } from '../bookmarks';

const SUBJECT_ACCENT: Record<Subject, string> = {
  adsp: '#67e8f9',
  sqld: '#c084fc',
};

const SUBJECT_LABEL: Record<Subject, string> = {
  adsp: 'ADsP',
  sqld: 'SQLD',
};

interface Props {
  /** 특정 과목만 필터링. 미지정 = 전체. */
  subject?: Subject;
  /** 빈 상태 메시지. */
  emptyMessage?: string;
  /** 펼친 상태에서 한 번에 보일 최대 개수. */
  limit?: number;
  /** 헤더 라벨 (collapsible 토글에 표시). */
  headerLabel?: string;
  /** 헤더 우측 강조색 (북마크 아이콘). */
  accent?: string;
  /** 기본 펼침 상태. 기본 false (collapsed). */
  defaultOpen?: boolean;
}

export default function BookmarkedConceptsList({
  subject,
  emptyMessage = '아직 북마크한 문제가 없어요. 학습 화면 우측 상단의 ★ 또는 실전 세트의 ★ 버튼으로 추가해보세요.',
  limit = 12,
  headerLabel = '북마크한 문제',
  accent,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const all = useResolvedBookmarks();
  const filtered = subject
    ? all.filter((b) => b.subject === subject)
    : all;
  const visible = filtered.slice(0, limit);
  const headerAccent = accent ?? (subject ? SUBJECT_ACCENT[subject] : '#67e8f9');

  const handleOpen = (b: (typeof filtered)[number]) => {
    if (typeof window === 'undefined') return;
    if (b.lesson && typeof b.stepIdx === 'number') {
      // lesson 매칭 — LessonScreen 으로 점프, 도착 즉시 question phase 로.
      window.sessionStorage.setItem(
        'questdp.pendingConceptOpen',
        JSON.stringify({
          subject: b.subject,
          chapter: b.chapter,
          topic: b.topic,
          stepIdx: b.stepIdx,
          stepId: b.step?.id ?? '',
          questionId: b.questionId,
          phase: 'question',
        }),
      );
      // 두 가지 경우를 모두 처리:
      //   1) StatsPage 등 다른 라우트에서 클릭 → hash 변경 → App.tsx 의
      //      hashchange → GamePage mount → 초기 useState 가 sessionStorage
      //      소비.
      //   2) PlanetScreen (이미 GamePage 안) 에서 클릭 → hash 동일이라 hashchange
      //      불발 → custom event 로 GamePage 의 listener 가 setScreen.
      window.location.hash = `/game/${b.subject}`;
      window.dispatchEvent(new Event('questdp-open-concept'));
    } else {
      // lesson 매칭 없는 문제 (실전·모의고사 등) → 북마크 페이지에서 보기
      window.location.hash = '/bookmarks';
    }
  };

  return (
    <div>
      {/* Header — collapsible 토글 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="bookmarked-list-body"
        className="w-full flex items-center justify-between gap-2 py-1 -mx-1 px-1 rounded-md hover:bg-cream/5 transition"
      >
        <span className="kr-heading uppercase text-[11px] tracking-widest text-cream/75 inline-flex items-center gap-2">
          <Bookmark
            size={12}
            strokeWidth={2.6}
            fill={headerAccent}
            style={{ color: headerAccent }}
          />
          {headerLabel}
          <span className="text-cream/50 tabular-nums">· {filtered.length}</span>
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2.4}
          className="text-cream/55 transition-transform"
          style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        />
      </button>

      {/* Body — 펼쳤을 때만 노출 */}
      {open ? (
        <div id="bookmarked-list-body" className="mt-3">
          {filtered.length === 0 ? (
            <div
              className="rounded-[14px] px-4 py-5 text-center"
              style={{
                background: 'rgba(239,244,255,0.04)',
                border: '1px dashed rgba(239,244,255,0.18)',
              }}
            >
              <Bookmark
                size={20}
                strokeWidth={2}
                className="mx-auto mb-2 text-cream/45"
              />
              <p className="kr-body text-[12px] text-cream/55 leading-[1.6]">
                {emptyMessage}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {visible.map((b) => {
                const accentBookmark = SUBJECT_ACCENT[b.subject];
                return (
                  <li
                    key={b.questionId}
                    className="rounded-[14px] flex items-center gap-3 px-3.5 py-3 transition group"
                    style={{
                      background: 'rgba(239,244,255,0.04)',
                      border: '1px solid rgba(239,244,255,0.10)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpen(b)}
                      className="flex-1 min-w-0 text-left flex items-center gap-3"
                      aria-label={`${b.title} 문제 풀어보기`}
                    >
                      <Bookmark
                        size={14}
                        strokeWidth={2.4}
                        fill={accentBookmark}
                        style={{ color: accentBookmark, flexShrink: 0 }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="kr-heading uppercase text-[9px] tracking-widest"
                            style={{ color: accentBookmark }}
                          >
                            {SUBJECT_LABEL[b.subject]} · Ch{b.chapter}
                          </span>
                          {b.topic ? (
                            <span
                              className="kr-body text-[10px] truncate"
                              style={{ color: 'rgba(239,244,255,0.5)' }}
                            >
                              {b.topic}
                            </span>
                          ) : null}
                        </div>
                        <p
                          className="kr-body text-[13px] truncate group-hover:text-neon transition"
                          style={{ color: 'rgba(239,244,255,0.92)' }}
                        >
                          {b.title}
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        strokeWidth={2.2}
                        className="text-cream/35 group-hover:text-neon transition shrink-0"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBookmark(b.questionId);
                      }}
                      aria-label="북마크 해제"
                      className="shrink-0 w-7 h-7 rounded-full inline-flex items-center justify-center text-cream/45 hover:text-red-300 hover:bg-red-300/10 transition"
                    >
                      <X size={13} strokeWidth={2.4} />
                    </button>
                  </li>
                );
              })}
              {filtered.length > limit ? (
                <li
                  className="kr-body text-[11px] text-cream/45 text-center mt-1"
                  aria-hidden
                >
                  +{filtered.length - limit}개 더 — #/bookmarks 에서 전체 보기
                </li>
              ) : null}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
