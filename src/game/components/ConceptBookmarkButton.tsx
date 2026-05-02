/**
 * ConceptBookmarkButton — DialogueLesson 상단의 별 토글.
 *
 * 클릭 시 step.id 의 북마크 ON/OFF. 별이 채워지면 등록, 비어있으면 미등록.
 */

import { Bookmark } from 'lucide-react';
import { useConceptBookmarks } from '../useConceptBookmarks';
import { toggleConceptBookmark } from '../conceptBookmarks';

export default function ConceptBookmarkButton({
  stepId,
  accent = '#67e8f9',
  size = 'md',
}: {
  stepId: string;
  accent?: string;
  size?: 'sm' | 'md';
}) {
  const snap = useConceptBookmarks();
  const active = snap.ids.has(stepId);
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleConceptBookmark(stepId);
  };
  const px = size === 'sm' ? 28 : 36;
  const ip = size === 'sm' ? 14 : 18;
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? '북마크 해제' : '이 개념 북마크'}
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
