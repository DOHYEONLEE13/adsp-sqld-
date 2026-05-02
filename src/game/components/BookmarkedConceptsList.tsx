/**
 * BookmarkedConceptsList — 북마크한 개념 카드 리스트.
 *
 * 사용처:
 *   - PlanetScreen (ADsP first 화면) — subject="adsp" 필터로 노출
 *   - StatsPage (프로필) — 전 과목 노출
 *
 * 항목 클릭 → sessionStorage 에 pendingConceptOpen 기록 + #/game/<subject>
 * 진입. GamePage 가 마운트 시점에 읽어 LessonScreen 으로 점프.
 */

import { Bookmark, ChevronRight, X } from 'lucide-react';
import type { Subject } from '@/types/question';
import { useResolvedBookmarks } from '../useConceptBookmarks';
import { removeConceptBookmark } from '../conceptBookmarks';

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
  /** 빈 상태 메시지 (기본: "아직 북마크한 개념이 없어요"). */
  emptyMessage?: string;
  /** 최대 노출 개수 (기본 10). 더 보기 가능. */
  limit?: number;
}

export default function BookmarkedConceptsList({
  subject,
  emptyMessage = '아직 북마크한 개념이 없어요. 학습 화면 우측 상단의 ★ 버튼으로 추가해보세요.',
  limit = 10,
}: Props) {
  const all = useResolvedBookmarks();
  const filtered = subject
    ? all.filter((b) => b.lesson.subject === subject)
    : all;
  const visible = filtered.slice(0, limit);

  const handleOpen = (
    targetSubject: Subject,
    chapter: number,
    topic: string,
    stepIdx: number,
    stepId: string,
  ) => {
    if (typeof window === 'undefined') return;
    // sessionStorage 핸드오프 — GamePage 가 마운트 시 읽고 LessonScreen 으로 jump.
    window.sessionStorage.setItem(
      'questdp.pendingConceptOpen',
      JSON.stringify({ subject: targetSubject, chapter, topic, stepIdx, stepId }),
    );
    window.location.hash = `/game/${targetSubject}`;
  };

  if (filtered.length === 0) {
    return (
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
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {visible.map((b) => {
        const accent = SUBJECT_ACCENT[b.lesson.subject];
        return (
          <li
            key={b.stepId}
            className="rounded-[14px] flex items-center gap-3 px-3.5 py-3 transition group"
            style={{
              background: 'rgba(239,244,255,0.04)',
              border: '1px solid rgba(239,244,255,0.10)',
            }}
          >
            <button
              type="button"
              onClick={() =>
                handleOpen(
                  b.lesson.subject,
                  b.lesson.chapter,
                  b.lesson.topic,
                  b.stepIdx,
                  b.stepId,
                )
              }
              className="flex-1 min-w-0 text-left flex items-center gap-3"
              aria-label={`${b.step.title} 열기`}
            >
              <Bookmark
                size={14}
                strokeWidth={2.4}
                fill={accent}
                style={{ color: accent, flexShrink: 0 }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="kr-heading uppercase text-[9px] tracking-widest"
                    style={{ color: accent }}
                  >
                    {SUBJECT_LABEL[b.lesson.subject]} · Ch{b.lesson.chapter}
                  </span>
                  <span
                    className="kr-body text-[10px] truncate"
                    style={{ color: 'rgba(239,244,255,0.5)' }}
                  >
                    {b.lesson.topic}
                  </span>
                </div>
                <p
                  className="kr-body text-[13px] truncate group-hover:text-neon transition"
                  style={{ color: 'rgba(239,244,255,0.92)' }}
                >
                  {b.step.title}
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
                removeConceptBookmark(b.stepId);
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
          +{filtered.length - limit}개 더 — 프로필에서 전체 보기
        </li>
      ) : null}
    </ul>
  );
}
