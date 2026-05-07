/**
 * PurchaseConfirmModal — 50 XP 등 자원 차감 구매 확인 모달.
 *
 * 시스템 window.confirm 대체. 앱 톤 (다크 + 네온) 일치 디자인.
 *
 * 사용 패턴:
 *   const [open, setOpen] = useState(false);
 *   <PurchaseConfirmModal
 *     open={open}
 *     title="표정 잠금해제"
 *     description={...}
 *     itemName="행복"
 *     itemSubtitle="토리 (ADSP)"
 *     itemPreview={<Ques pose="happy" character="tori" />}
 *     cost={50}
 *     currentXp={profile.totalXp}
 *     onConfirm={async () => { await purchase(); setOpen(false); }}
 *     onCancel={() => setOpen(false)}
 *   />
 *
 * 접근성:
 *   - role=dialog + aria-modal
 *   - ESC 키로 닫기
 *   - Backdrop 클릭으로 닫기
 *   - focus trap (간단 — 첫 진입 시 [확인] 버튼 focus)
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { Coins, X } from 'lucide-react';

interface Props {
  open: boolean;
  /** 헤더 제목. */
  title: string;
  /** 본문 설명 (1~2 문장). */
  description: string;
  /** 구매 대상 이름 (예: "행복"). */
  itemName: string;
  /** 구매 대상 부제 (예: "토리 (ADSP)"). 선택. */
  itemSubtitle?: string;
  /** 구매 대상 미리보기 (이미지/Ques 등). 선택. */
  itemPreview?: ReactNode;
  /** 비용 (XP). */
  cost: number;
  /** 현재 사용자 XP. */
  currentXp: number;
  /** [확인] 클릭 시 호출. async 가능. */
  onConfirm: () => void | Promise<void>;
  /** 닫기 (취소 / ESC / backdrop). */
  onCancel: () => void;
  /** 진행 중 (RPC 응답 대기) 표시 — 버튼 disabled. */
  busy?: boolean;
}

export default function PurchaseConfirmModal({
  open,
  title,
  description,
  itemName,
  itemSubtitle,
  itemPreview,
  cost,
  currentXp,
  onConfirm,
  onCancel,
  busy = false,
}: Props) {
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

  // ESC 닫기 + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // 첫 마운트 시 확인 버튼 focus
    confirmBtnRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  const insufficient = currentXp < cost;
  const remaining = currentXp - cost;

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        onClick={() => !busy && onCancel()}
        aria-label="모달 닫기"
        className="fixed inset-0 z-[80] cursor-default"
        style={{
          background: 'rgba(1,8,40,0.78)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-modal-title"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[81] w-[92vw] max-w-[420px]"
        style={{
          background:
            'linear-gradient(180deg, rgba(20,32,46,0.98) 0%, rgba(14,24,36,0.98) 100%)',
          border: '1px solid rgba(111,255,0,0.30)',
          borderRadius: '20px',
          boxShadow:
            '0 20px 60px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(111,255,0,0.08) inset',
          padding: '20px 22px',
        }}
      >
        {/* 닫기 버튼 (우상단) */}
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          aria-label="닫기"
          className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full text-cream/60 hover:text-cream hover:bg-white/10 transition disabled:opacity-40"
        >
          <X size={16} strokeWidth={2.4} />
        </button>

        {/* 헤더 */}
        <div className="mb-4">
          <div
            className="kr-num text-[10px] uppercase tracking-widest mb-1.5 inline-flex items-center gap-1.5"
            style={{ color: '#FFB020' }}
          >
            <Coins size={11} strokeWidth={2.6} />
            잠금해제 구매
          </div>
          <h2
            id="purchase-modal-title"
            className="kr-heading text-[18px] md:text-[20px] text-cream"
          >
            {title}
          </h2>
        </div>

        {/* 미리보기 카드 */}
        {itemPreview ? (
          <div
            className="mb-4 flex items-center gap-3 px-3 py-3 rounded-[14px]"
            style={{
              background: 'rgba(111,255,0,0.06)',
              border: '1px solid rgba(111,255,0,0.20)',
            }}
          >
            <div className="shrink-0 w-14 h-14 inline-flex items-center justify-center">
              {itemPreview}
            </div>
            <div className="flex-1 min-w-0">
              <div className="kr-heading text-[14px] text-cream truncate">
                {itemName}
              </div>
              {itemSubtitle ? (
                <div className="kr-body text-[11.5px] text-cream/55 mt-0.5 truncate">
                  {itemSubtitle}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* 본문 설명 */}
        <p className="kr-body text-[12.5px] text-cream/75 leading-[1.55] mb-4">
          {description}
        </p>

        {/* XP 내역 */}
        <div
          className="rounded-[12px] p-3 mb-5"
          style={{
            background: 'rgba(239,244,255,0.04)',
            border: '1px solid rgba(239,244,255,0.10)',
          }}
        >
          <div className="flex items-center justify-between text-[12px] mb-1.5">
            <span className="kr-body text-cream/65">현재 XP</span>
            <span className="kr-num tabular-nums text-cream/95 font-semibold">
              {currentXp.toLocaleString('ko-KR')}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px] mb-1.5">
            <span className="kr-body text-cream/65">차감</span>
            <span
              className="kr-num tabular-nums font-semibold"
              style={{ color: '#FFB020' }}
            >
              − {cost.toLocaleString('ko-KR')}
            </span>
          </div>
          <div
            className="h-px my-2"
            style={{ background: 'rgba(239,244,255,0.10)' }}
          />
          <div className="flex items-center justify-between text-[13px]">
            <span className="kr-body text-cream/85 font-semibold">
              잠금해제 후
            </span>
            <span
              className="kr-num tabular-nums font-bold"
              style={{
                color: insufficient ? '#fca5a5' : '#6FFF00',
              }}
            >
              {remaining.toLocaleString('ko-KR')} XP
            </span>
          </div>
        </div>

        {insufficient ? (
          <p
            className="kr-body text-[11.5px] mb-4 leading-[1.5]"
            style={{ color: '#fca5a5' }}
          >
            ⚠️ XP {(cost - currentXp).toLocaleString('ko-KR')}개 부족 — 학습으로
            더 모으면 잠금해제할 수 있어요.
          </p>
        ) : null}

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="kr-num flex-1 px-4 py-3 rounded-full transition active:scale-95 disabled:opacity-40"
            style={{
              background: 'rgba(239,244,255,0.06)',
              color: 'rgba(239,244,255,0.85)',
              border: '1px solid rgba(239,244,255,0.18)',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            취소
          </button>
          <button
            type="button"
            ref={confirmBtnRef}
            onClick={() => void onConfirm()}
            disabled={busy || insufficient}
            className="kr-num flex-1 px-4 py-3 rounded-full transition active:scale-95 disabled:opacity-40"
            style={{
              background: insufficient
                ? 'rgba(252,165,165,0.15)'
                : '#6FFF00',
              color: insufficient ? '#fca5a5' : '#010828',
              fontSize: 13,
              fontWeight: 700,
              boxShadow: insufficient
                ? 'none'
                : '0 6px 18px -4px rgba(111,255,0,0.45)',
            }}
          >
            {busy ? '잠금해제 중…' : insufficient ? 'XP 부족' : `${cost} XP 사용`}
          </button>
        </div>
      </div>
    </>
  );
}
