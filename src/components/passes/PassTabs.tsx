/**
 * PassTabs — 회독 차수 선택 탭. PlanetScreen / ZoneScreen 상단에 배치.
 *
 * 동작:
 *   - 1회독 = 항상 unlocked.
 *   - N+1회독 = 직전 회독 stamp 보유 시 unlocked.
 *   - 잠긴 탭 = 자물쇠 + disabled 표시 (클릭 시 안내 토스트는 호출자 책임).
 *
 * 시각:
 *   - 활성 탭 = Tier 색 강조 + glow.
 *   - 진행 중 = 채워진 점 (●), 미진행 = 비어 있는 점 (○).
 *   - 한국어 라벨: "1회독" / "2회독" / "3회독+"
 */

import { Lock } from 'lucide-react';
import type { PassTier } from '@/types/passes';
import { PASS_TIER_VISUAL } from '@/types/passes';

interface PassTab {
  passNumber: number;
  /** 탭 활성·진입 가능. */
  unlocked: boolean;
  /** 진행 중 (sessions 있음). */
  inProgress: boolean;
  /** 완료됨 (stamp 보유). */
  completed: boolean;
  /** 진행률 0~1 (현재 회독 정답률). */
  progress?: number;
}

interface Props {
  tabs: PassTab[];
  currentPass: number;
  onSelect: (passNumber: number) => void;
  /** 잠긴 탭 클릭 시 콜백 (호출자가 토스트 표시). */
  onLockedClick?: (passNumber: number) => void;
}

const TIER_FOR_PASS: Record<number, PassTier> = {
  1: 'bronze',
  2: 'gold',
  3: 'master',
};

function tierForPass(pass: number): PassTier {
  return TIER_FOR_PASS[pass] ?? 'master';
}

export default function PassTabs({
  tabs,
  currentPass,
  onSelect,
  onLockedClick,
}: Props) {
  return (
    <nav
      aria-label="회독 단계 선택"
      className="flex flex-wrap items-center gap-2"
    >
      {tabs.map((t) => {
        const tier = tierForPass(t.passNumber);
        const visual = PASS_TIER_VISUAL[tier];
        const isCurrent = t.passNumber === currentPass;
        const handle = () => {
          if (!t.unlocked) {
            onLockedClick?.(t.passNumber);
            return;
          }
          onSelect(t.passNumber);
        };
        return (
          <button
            key={t.passNumber}
            type="button"
            onClick={handle}
            aria-pressed={isCurrent}
            disabled={!t.unlocked}
            className="kr-num inline-flex items-center gap-2 px-3 py-2 rounded-full text-[11px] uppercase tracking-widest transition active:scale-[0.97] disabled:cursor-not-allowed"
            style={{
              background: isCurrent
                ? `${visual.color}33`
                : t.unlocked
                  ? 'rgba(239,244,255,0.06)'
                  : 'rgba(239,244,255,0.03)',
              border: `1px solid ${
                isCurrent
                  ? visual.color
                  : t.unlocked
                    ? 'rgba(239,244,255,0.18)'
                    : 'rgba(239,244,255,0.08)'
              }`,
              color: isCurrent ? visual.color : t.unlocked ? 'var(--cream)' : 'rgba(239,244,255,0.4)',
              boxShadow: isCurrent ? `0 0 14px ${visual.glow}` : undefined,
            }}
          >
            <span style={{ fontWeight: 600 }}>
              {t.passNumber === 1 ? '1회독' : t.passNumber === 2 ? '2회독' : `${t.passNumber}회독+`}
            </span>
            {!t.unlocked ? (
              <Lock size={11} strokeWidth={2.4} />
            ) : (
              <span className="flex items-center gap-0.5" aria-hidden>
                {/* 진행 점 — 1회독·2회독·3회독 각 도트 */}
                {[1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className="inline-block rounded-full"
                    style={{
                      width: 5,
                      height: 5,
                      background:
                        n < t.passNumber
                          ? visual.color // 이전 회독 = 채움
                          : n === t.passNumber && (t.completed || t.inProgress)
                            ? visual.color
                            : 'rgba(239,244,255,0.25)',
                      opacity:
                        n < t.passNumber || (n === t.passNumber && (t.completed || t.inProgress))
                          ? 1
                          : 0.45,
                    }}
                  />
                ))}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
