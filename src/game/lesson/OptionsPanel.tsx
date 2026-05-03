/**
 * OptionsPanel — 객관식 4지선다 카드 그리드.
 *
 * 상태:
 *   idle      : 선택 전 (hover 가능)
 *   selected  : 유저가 골랐으나 아직 채점 전 — 파란 테두리
 *   correct   : 정답 (채점 후) — 초록 바디
 *   wrong     : 선택했으나 오답 — 빨간 바디
 *   revealed  : 선택 안 했지만 정답이었던 것 (오답 시 표시용) — 초록 테두리
 */

type State = 'idle' | 'selected' | 'correct' | 'wrong' | 'revealed';

interface Props {
  choices: string[];
  /** 유저가 선택한 인덱스 (아직 채점 안 됨). */
  chosen: number | null;
  /** 정답 인덱스. 채점 후에만 highlight 목적으로 사용. */
  correctIndex: number | null;
  /** 채점 완료 여부. */
  graded: boolean;
  onChoose: (idx: number) => void;
}

export default function OptionsPanel({
  choices,
  chosen,
  correctIndex,
  graded,
  onChoose,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
      {choices.map((choice, idx) => {
        const state: State = !graded
          ? idx === chosen
            ? 'selected'
            : 'idle'
          : idx === correctIndex
            ? 'correct'
            : idx === chosen
              ? 'wrong'
              : correctIndex === idx
                ? 'revealed'
                : 'idle';
        return (
          <button
            key={idx}
            type="button"
            onClick={() => !graded && onChoose(idx)}
            disabled={graded}
            className="text-left rounded-2xl px-4 py-4 md:px-5 md:py-5 lg:px-6 lg:py-6 kr-body text-[14px] md:text-[15px] lg:text-[17px] xl:text-[18px] leading-[1.55] transition-transform active:scale-[0.98] disabled:cursor-default"
            style={styleFor(state)}
          >
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 align-middle kr-heading text-[11px]"
              style={{
                background: badgeBg(state),
                color: badgeFg(state),
              }}
            >
              {['A', 'B', 'C', 'D'][idx]}
            </span>
            <span style={{ color: textFg(state) }}>{choice}</span>
          </button>
        );
      })}
    </div>
  );
}

function styleFor(state: State): React.CSSProperties {
  const base: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    border: '2px solid rgba(255,255,255,0.1)',
    boxShadow: '0 2px 0 rgba(0,0,0,0.4)',
  };
  switch (state) {
    case 'selected':
      return {
        ...base,
        background: 'rgba(103,232,249,0.08)',
        border: '2px solid var(--subject-accent)',
        boxShadow: '0 2px 0 rgba(0,0,0,0.4), 0 0 0 4px color-mix(in srgb, var(--subject-accent) 15%, transparent)',
      };
    case 'correct':
      return {
        ...base,
        background: 'rgba(111,255,0,0.12)',
        border: '2px solid #6FFF00',
      };
    case 'wrong':
      return {
        ...base,
        background: 'rgba(248,113,113,0.12)',
        border: '2px solid #f87171',
      };
    case 'revealed':
      return {
        ...base,
        border: '2px dashed #6FFF00',
      };
    default:
      return base;
  }
}

function badgeBg(state: State) {
  if (state === 'selected') return 'var(--subject-accent)';
  if (state === 'correct') return '#6FFF00';
  if (state === 'wrong') return '#f87171';
  if (state === 'revealed') return 'rgba(111,255,0,0.2)';
  return 'rgba(255,255,255,0.08)';
}

function badgeFg(state: State) {
  if (state === 'selected' || state === 'correct' || state === 'wrong') return '#010828';
  return '#EFF4FF';
}

function textFg(state: State): string {
  if (state === 'correct') return '#EFF4FF';
  if (state === 'wrong') return 'rgba(255,255,255,0.75)';
  return 'var(--cream)';
}
