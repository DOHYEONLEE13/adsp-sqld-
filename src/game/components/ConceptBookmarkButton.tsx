/**
 * ConceptBookmarkButton — DialogueLesson 상단의 별 토글 (questionId 단위).
 *
 * questionId 가 없는 step (예: review step) 에서는 자동으로 null 반환 → 버튼 숨김.
 */

import { Bookmark } from 'lucide-react';
import { useBookmarks } from '../useBookmarks';
import { toggleBookmark } from '../bookmarks';

export default function ConceptBookmarkButton({
  questionId,
  accent = '#67e8f9',
  size = 'md',
}: {
  /** undefined / 빈 문자열 = 북마크 불가 → 버튼 자동 숨김. */
  questionId?: string;
  accent?: string;
  size?: 'sm' | 'md';
}) {
  const snap = useBookmarks();
  if (!questionId) return null;
  const active = snap.ids.has(questionId);
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(questionId);
  };
  const px = size === 'sm' ? 28 : 36;
  const ip = size === 'sm' ? 14 : 18;
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? '북마크 해제' : '이 문제 북마크'}
      className="inline-flex items-center justify-center rounded-full transition active:scale-[0.92] focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
      style={{
        width: px,
        height: px,
        background: active ? `${accent}26` : 'rgba(239,244,255,0.06)',
        border: active
          ? `1.5px solid ${accent}`
          : '1.5px solid rgba(239,244,255,0.18)',
        color: active ? accent : 'rgba(239,244,255,0.65)',
      }}
    >
      <Bookmark
        size={ip}
        strokeWidth={active ? 2.4 : 2}
        fill={active ? accent : 'none'}
      />
    </button>
  );
}
