/**
 * Planet 화면 — 과목의 챕터 리스트.
 * 각 챕터 = 하나의 행성. 문항 수 / 토픽 수를 카드에 표시합니다.
 */

import { ChevronRight, Flame, Globe2 } from 'lucide-react';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import type { Subject } from '@/types/question';
import { getPlanets } from '../session';
import ScreenShell from '../components/ScreenShell';
import ProgressBadge from '../components/ProgressBadge';
import { aggregateChapter } from '../aggregate';
import { useProgress } from '../useProgress';
import { topicWeaknessesInChapter, weaknessLevel } from '../weakness';

interface Props {
  subject: Subject;
  onSelectChapter: (chapter: number) => void;
  onBack: () => void;
}

export default function PlanetScreen({
  subject,
  onSelectChapter,
  onBack,
}: Props) {
  const schema = SUBJECT_SCHEMAS[subject];
  const planets = getPlanets(subject);
  const progress = useProgress();

  return (
    <ScreenShell
      eyebrow="Planet"
      title={schema.title}
      subtitle="탐사할 행성(챕터)을 선택하세요. 각 행성에는 여러 존(토픽)이 있습니다."
      onExit={onBack}
      exitLabel="은하로"
      backgroundImage="/error%20404.gif"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {planets.map((planet) => {
          const disabled = planet.questionCount === 0;
          const weakCount = disabled
            ? 0
            : topicWeaknessesInChapter(subject, planet.chapter, progress).filter(
                (t) => weaknessLevel(t) === 'weak',
              ).length;
          return (
            <button
              key={planet.chapter}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelectChapter(planet.chapter)}
              className="liquid-glass rounded-[24px] p-5 md:p-6 text-left transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="w-10 h-10 rounded-full inline-flex items-center justify-center text-neon"
                    style={{
                      background: 'rgba(111, 255, 0, 0.12)',
                      boxShadow: '0 0 24px -4px rgba(111, 255, 0, 0.35) inset',
                    }}
                  >
                    <Globe2 size={18} strokeWidth={2.2} />
                  </span>
                  <span className="kr-heading text-[11px] uppercase tracking-widest text-cream/60">
                    Chapter {planet.chapter}
                  </span>
                </div>
                {weakCount > 0 ? (
                  <span
                    className="kr-heading inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full"
                    style={{
                      color: '#f87171',
                      background: 'rgba(248, 113, 113, 0.12)',
                    }}
                  >
                    <Flame size={12} strokeWidth={2.6} />
                    약점 {weakCount}
                  </span>
                ) : null}
              </div>

              <h3 className="kr-heading text-[20px] uppercase leading-tight">
                {planet.title}
              </h3>

              <p className="kr-body text-[13px] leading-[1.7] text-cream/70 mt-2">
                토픽 {planet.topics.length}개 · 문항 {planet.questionCount}개
              </p>

              {!disabled ? (
                <ProgressBadge
                  agg={aggregateChapter(subject, planet.chapter, progress)}
                />
              ) : null}

              <div className="mt-5 flex items-center justify-between">
                <span className="kr-heading text-[11px] uppercase tracking-widest text-cream/60">
                  {disabled ? '문항 준비중' : 'Enter Planet'}
                </span>
                <span
                  className="w-10 h-10 rounded-full inline-flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--purple-1), var(--purple-2))',
                    boxShadow:
                      '0 10px 20px -5px rgba(124, 58, 237, 0.55)',
                  }}
                >
                  <ChevronRight
                    width={18}
                    height={18}
                    strokeWidth={2.5}
                    color="#fff"
                  />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </ScreenShell>
  );
}
