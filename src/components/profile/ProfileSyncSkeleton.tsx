/**
 * ProfileSyncSkeleton — 인증 후 server pull 결과 도착 전 노출되는 placeholder.
 *
 * 임시(client-generated) 태그 노출 차단의 UI 가드. tag/displayName 자리에
 * 회색 박스 + 작은 텍스트 ("동기화 중...").
 *
 * syncStatus 'failed' 일 때는 [재시도] 버튼 노출 — retryProfileSync() 호출.
 */

import { retryProfileSync } from '@/data/profile';

interface Props {
  /** skeleton 의 가로 길이 클래스. 기본 w-24. */
  width?: string;
  /** 부모의 텍스트 정렬 / 색상 따라가도록 추가 className. */
  className?: string;
  /** sync 가 'failed' 면 [재시도] 버튼 노출 여부. 기본 true. */
  showRetry?: boolean;
  /** 'failed' 상태인지 — 부모가 useMyProfile().syncStatus 로 판단해 전달. */
  failed?: boolean;
}

export default function ProfileSyncSkeleton({
  width = 'w-24',
  className = '',
  showRetry = true,
  failed = false,
}: Props) {
  if (failed && showRetry) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[12px] text-cream/60 ${className}`}
      >
        <span aria-hidden>⚠️</span>
        <span>동기화 실패</span>
        <button
          type="button"
          onClick={() => void retryProfileSync()}
          className="kr-heading text-[11px] uppercase tracking-widest text-neon hover:opacity-80 underline"
        >
          재시도
        </button>
      </span>
    );
  }
  return (
    <span
      className={`inline-block ${width} h-4 rounded-md bg-white/10 animate-pulse align-middle ${className}`}
      aria-label="동기화 중"
      role="status"
    />
  );
}
