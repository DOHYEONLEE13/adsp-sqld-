/**
 * ThemePicker — 프로필(StatsPage) 의 ambient 배경 테마 선택 카드.
 *
 * UX:
 *   - 현재 적용된 테마 = 좌측에 ✓ 체크 + 강조 보더 (네온)
 *   - 그리드: 카드 (썸네일 + 라벨), 탭 하면 임시 선택 (draft).
 *   - 하단 [적용] 버튼 — draft 가 현재와 다를 때만 활성. 클릭 시 즉시 setCurrentThemeId →
 *     GlobalAmbientBg 가 self-update.
 *   - 변경 후 1.5s "적용 완료" toast (인라인 메시지) 표시.
 *
 * 추후 사용자 추가 테마 (image kind) 가 themes.ts THEMES 배열에 들어가면 자동으로 카드 노출.
 */

import { useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { THEMES, type Theme } from '../theme/themes';
import { getCurrentThemeId, setCurrentThemeId } from '../theme/themeStorage';
import { useTheme } from '../theme/useTheme';

export default function ThemePicker() {
  const current = useTheme();
  const [draft, setDraft] = useState<string>(() => getCurrentThemeId());
  const [appliedAt, setAppliedAt] = useState<number | null>(null);
  const dirty = draft !== current.id;

  const handleApply = () => {
    setCurrentThemeId(draft);
    setAppliedAt(Date.now());
    window.setTimeout(() => setAppliedAt(null), 1500);
  };

  return (
    <section
      className="liquid-glass rounded-[20px] px-4 py-4 md:px-5 md:py-5"
      aria-label="배경 테마 선택"
    >
      <div className="flex items-center gap-2 mb-3">
        <Palette
          size={14}
          strokeWidth={2.4}
          style={{ color: 'var(--neon)' }}
        />
        <h3 className="kr-heading uppercase text-[11px] tracking-widest text-cream/85">
          배경 테마
        </h3>
        <span className="kr-num text-[10px] uppercase tracking-widest text-cream/45 ml-auto">
          {THEMES.length} 개
        </span>
      </div>

      <p className="kr-body text-[11.5px] text-cream/55 leading-[1.55] mb-3">
        게임 전 화면의 배경. 선택 후 [적용] 을 눌러야 반영돼요.
      </p>

      {/* 카드 그리드 — 모바일 2열, md 이상 3열 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        {THEMES.map((t) => (
          <ThemeCard
            key={t.id}
            theme={t}
            selected={draft === t.id}
            applied={current.id === t.id}
            onSelect={() => setDraft(t.id)}
          />
        ))}
      </div>

      {/* 적용 버튼 + 토스트 */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleApply}
          disabled={!dirty}
          className="kr-num text-[12.5px] font-medium px-5 py-2.5 rounded-full inline-flex items-center justify-center gap-1.5 transition active:scale-[0.97] disabled:cursor-not-allowed"
          style={{
            background: dirty ? 'var(--neon)' : 'rgba(239,244,255,0.06)',
            color: dirty ? '#0a1f00' : 'rgba(239,244,255,0.4)',
            border: dirty ? 'none' : '1px solid rgba(239,244,255,0.1)',
            boxShadow: dirty ? '0 6px 18px -4px rgba(111,255,0,0.55)' : 'none',
          }}
        >
          <Check size={13} strokeWidth={2.6} />
          {dirty ? '적용' : '적용됨'}
        </button>
        {appliedAt ? (
          <span
            className="kr-body text-[11.5px]"
            style={{ color: 'var(--neon)' }}
          >
            ✓ 새 배경이 적용됐어요
          </span>
        ) : null}
      </div>
    </section>
  );
}

// ─── Theme Card ─────────────────────────────────────────────────────

interface ThemeCardProps {
  theme: Theme;
  /** 사용자가 현재 카드 선택 (draft) 했는지. */
  selected: boolean;
  /** 실제 적용 중인 테마인지 (storage 기준). */
  applied: boolean;
  onSelect: () => void;
}

function ThemeCard({ theme, selected, applied, onSelect }: ThemeCardProps) {
  // CSS preview 는 실제 적용될 background와 size/repeat 도 그대로 미러 (carousel 안 깨짐).
  const previewStyle =
    theme.preview.kind === 'image'
      ? {
          backgroundImage: `url(${theme.preview.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : theme.kind === 'css'
        ? {
            backgroundImage: theme.preview.background,
            backgroundSize: theme.backgroundSize,
            backgroundRepeat: theme.backgroundRepeat,
            backgroundColor: theme.backgroundColor,
            backgroundPosition: theme.backgroundPosition,
          }
        : {
            backgroundImage: theme.preview.background,
            backgroundColor: '#02050f',
          };

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${theme.label}${applied ? ' (적용 중)' : ''}${selected && !applied ? ' (선택됨)' : ''}`}
      className="relative aspect-[4/3] rounded-2xl overflow-hidden transition active:scale-[0.98]"
      style={{
        border: selected
          ? '2px solid var(--neon)'
          : '1.5px solid rgba(239,244,255,0.14)',
        boxShadow: selected
          ? '0 0 0 1px rgba(111,255,0,0.3), 0 6px 18px -10px rgba(111,255,0,0.5)'
          : '0 2px 8px -4px rgba(0,0,0,0.4)',
      }}
    >
      {/* 썸네일 */}
      <div className="absolute inset-0" style={previewStyle} aria-hidden />
      {/* 어두운 그라디언트 — 라벨 가독성 */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.65) 100%)',
        }}
        aria-hidden
      />
      {/* 라벨 */}
      <span
        className="absolute left-2.5 bottom-2 kr-body text-[12px] font-medium"
        style={{
          color: 'var(--cream)',
          textShadow: '0 1px 3px rgba(0,0,0,0.7)',
        }}
      >
        {theme.label}
      </span>
      {/* 적용 중 배지 */}
      {applied ? (
        <span
          className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full kr-num text-[9.5px]"
          style={{
            background: 'rgba(111,255,0,0.18)',
            border: '1px solid rgba(111,255,0,0.55)',
            color: 'var(--neon)',
            letterSpacing: '0.05em',
          }}
        >
          <Check size={9} strokeWidth={2.8} />
          적용 중
        </span>
      ) : null}
      {/* 선택 (draft) 체크 — applied 가 아닐 때만 */}
      {selected && !applied ? (
        <span
          className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full"
          style={{
            background: 'var(--neon)',
            color: '#0a1f00',
          }}
          aria-hidden
        >
          <Check size={13} strokeWidth={3} />
        </span>
      ) : null}
    </button>
  );
}
