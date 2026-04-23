/**
 * Zone 화면 — 챕터 안의 토픽 리스트.
 * 상단에 5종 모드 CTA:
 *   - 전체 랜덤 믹스 (sampling=random, flow=play)
 *   - 약점 집중 공략 (sampling=weakness, flow=play)
 *   - 오답 복습      (sampling=review, flow=play)
 *   - 학습 모드      (sampling=random, flow=learn) — 해설 먼저
 *   - 시험 모드      (sampling=random, flow=test)  — 타이머
 */

import {
  BookOpen,
  ChevronRight,
  Clock,
  Flame,
  RefreshCcw,
  Shuffle,
  Target,
} from 'lucide-react';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import type { Subject } from '@/types/question';
import type { FlowMode } from '../types';
import { getZones, reviewPoolSize, type SamplingMode } from '../session';
import ScreenShell from '../components/ScreenShell';
import ProgressBadge from '../components/ProgressBadge';
import WeaknessBadge from '../components/WeaknessBadge';
import MasteryBadge from '../components/MasteryBadge';
import { aggregateTopic } from '../aggregate';
import { useProgress } from '../useProgress';
import { topicWeaknessOf } from '../weakness';
import { masteryFromAggregate } from '../rpg';

export interface StartParams {
  topic: string | null;
  sampling: SamplingMode;
  flow: FlowMode;
}

interface Props {
  subject: Subject;
  chapter: number;
  onStart: (params: StartParams) => void;
  onBack: () => void;
}

export default function ZoneScreen({
  subject,
  chapter,
  onStart,
  onBack,
}: Props) {
  const schema = SUBJECT_SCHEMAS[subject];
  const chapterMeta = schema.chapters.find((c) => c.chapter === chapter);
  const zones = getZones(subject, chapter);
  const total = zones.reduce((sum, z) => sum + z.questionCount, 0);
  const progress = useProgress();
  const reviewCount = reviewPoolSize(subject, chapter, null);

  return (
    <ScreenShell
      eyebrow="Zone"
      title={chapterMeta?.title ?? `Chapter ${chapter}`}
      subtitle="공략할 모드와 토픽을 선택하세요."
      onExit={onBack}
      exitLabel="행성으로"
    >
      {/* 모드 CTA */}
      {total > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <ModeCta
            icon={<Shuffle size={18} strokeWidth={2.4} />}
            title="전체 랜덤 믹스"
            subtitle={`챕터 전 토픽 · 풀 ${total}개`}
            onClick={() =>
              onStart({ topic: null, sampling: 'random', flow: 'play' })
            }
            accent="purple"
          />
          <ModeCta
            icon={<Flame size={18} strokeWidth={2.4} />}
            title="약점 집중 공략"
            subtitle="틀렸거나 오래된 문항 우선"
            onClick={() =>
              onStart({ topic: null, sampling: 'weakness', flow: 'play' })
            }
            accent="red"
          />
          <ModeCta
            icon={<RefreshCcw size={18} strokeWidth={2.4} />}
            title="오답 복습"
            subtitle={
              reviewCount > 0 ? `복습 가능 ${reviewCount}개` : '오답 없음'
            }
            onClick={() =>
              reviewCount > 0 &&
              onStart({ topic: null, sampling: 'review', flow: 'play' })
            }
            disabled={reviewCount === 0}
            accent="neon"
          />
          <ModeCta
            icon={<BookOpen size={18} strokeWidth={2.4} />}
            title="학습 모드"
            subtitle="해설부터 읽고 풀기"
            onClick={() =>
              onStart({ topic: null, sampling: 'random', flow: 'learn' })
            }
            accent="cyan"
          />
          <ModeCta
            icon={<Clock size={18} strokeWidth={2.4} />}
            title="시험 모드"
            subtitle="타이머 · 일괄 채점"
            onClick={() =>
              onStart({ topic: null, sampling: 'random', flow: 'test' })
            }
            accent="amber"
          />
        </div>
      ) : null}

      {/* 토픽 카드 */}
      <h2 className="kr-heading text-[13px] uppercase tracking-widest text-cream/70 mb-4">
        토픽별 집중
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {zones.length === 0 ? (
          <div className="md:col-span-2 liquid-glass rounded-[24px] p-8 text-center kr-body text-cream/70">
            아직 이 행성에 플레이 가능한 문항이 없습니다.
          </div>
        ) : (
          zones.map((zone) => {
            const weakness = topicWeaknessOf(subject, chapter, zone.topic, progress);
            const agg = aggregateTopic(subject, chapter, zone.topic, progress);
            const mastery = masteryFromAggregate(agg);
            return (
              <button
                key={zone.topic}
                type="button"
                onClick={() =>
                  onStart({
                    topic: zone.topic,
                    sampling: 'random',
                    flow: 'play',
                  })
                }
                className="liquid-glass rounded-[24px] p-5 md:p-6 text-left transition hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span
                      className="w-10 h-10 rounded-full inline-flex items-center justify-center text-neon shrink-0 mt-0.5"
                      style={{ background: 'rgba(111, 255, 0, 0.10)' }}
                    >
                      <Target size={16} strokeWidth={2.4} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="kr-heading text-[16px] uppercase leading-tight flex-1">
                          {zone.topic}
                        </h3>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {weakness ? <WeaknessBadge weakness={weakness} /> : null}
                          <MasteryBadge info={mastery} compact />
                        </div>
                      </div>
                      <p className="kr-body text-[12px] leading-[1.7] text-cream/70 mt-1">
                        문항 {zone.questionCount}개
                      </p>
                      <ProgressBadge agg={agg} />
                    </div>
                  </div>
                  <span
                    className="w-9 h-9 rounded-full inline-flex items-center justify-center shrink-0"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--purple-1), var(--purple-2))',
                    }}
                  >
                    <ChevronRight
                      width={16}
                      height={16}
                      strokeWidth={2.5}
                      color="#fff"
                    />
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </ScreenShell>
  );
}

interface ModeCtaProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  disabled?: boolean;
  accent: 'purple' | 'red' | 'neon' | 'cyan' | 'amber';
}

function ModeCta({ icon, title, subtitle, onClick, disabled, accent }: ModeCtaProps) {
  const accentColor = {
    purple: 'rgba(124, 58, 237, 0.12)',
    red: 'rgba(248, 113, 113, 0.12)',
    neon: 'rgba(111, 255, 0, 0.12)',
    cyan: 'rgba(103, 232, 249, 0.12)',
    amber: 'rgba(251, 191, 36, 0.12)',
  }[accent];
  const iconColor = {
    purple: '#a78bfa',
    red: '#f87171',
    neon: '#6FFF00',
    cyan: '#67e8f9',
    amber: '#fbbf24',
  }[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="liquid-glass rounded-[20px] p-4 md:p-5 text-left transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <div className="flex items-center gap-3">
        <span
          className="w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0"
          style={{ background: accentColor, color: iconColor }}
        >
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="kr-heading text-[14px] uppercase leading-tight">
            {title}
          </h3>
          <p className="kr-body text-[11px] leading-[1.5] text-cream/70 mt-1 truncate">
            {subtitle}
          </p>
        </div>
      </div>
    </button>
  );
}
