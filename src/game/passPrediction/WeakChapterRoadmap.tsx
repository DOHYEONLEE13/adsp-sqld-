/**
 * WeakChapterRoadmap — 약점 단원 로드맵 ("나의 약점" 탭 메인 카드).
 *
 * 사용자 흐름 폴리시:
 *   두 데이터 source 통합:
 *     1) 사용자 명시 약점 (onboarding.weak_chapters) — "✓ 직접 선택" 배지
 *     2) 자동 식별 약점 (questionStats 기반 정답률 낮은 단원) — "📊 학습 결과 기반" 배지
 *   사용자 명시 약점이 자동 식별보다 우선 표시.
 *
 *   각 노드 = PlanetScreen 의 메달리언 톤 (원형 + radial gradient + box shadow).
 *   사용자 명시 약점은 chapter_id 만 있고 정답률 미상 → 정답률 라벨 X.
 *
 *   노드 클릭 → sessionStorage('questdp.pendingZoneOpen') 셋업 후 #/game/{subject}
 *   → ZoneScreen 으로 직진. 학습 탭과 동일한 토픽 트레일/노드 컨텍스트 보존.
 *   ZoneScreen 은 highlightTopic 으로 해당 토픽의 첫 미완료 step 을 펄스 강조.
 *   (사용자 결정 — 방안 A: chapter 단원 단위 진입, 학습 탭과 정보 비대칭 해소.)
 */

import { ChevronRight, Check, BarChart3 } from 'lucide-react';
import type { WeakChapterRanking } from './weakChapterRanker';
import type { Subject } from '@/types/question';
import { getQuestionMeta } from '@/game/forgettingCurve/questionMetaCache';
import { getLessonsInChapter } from '@/data/lessons';
import { CHAPTER_NAMES } from './chapterWeights';

/** 통합 약점 entry — 두 source 공통 형태. */
export interface UnifiedWeakEntry {
  rank: number;
  chapter_id: string;
  chapter_name: string;
  /** 'manual': 사용자 명시 / 'auto': questionStats 기반. */
  source: 'manual' | 'auto';
  /** auto 만 의미 있음. manual 은 null. */
  accuracy: number | null;
  attempt_count: number;
}

interface Props {
  exam: Subject;
  /** 사용자 명시 약점 chapter_id 목록 (onboarding.weak_chapters). */
  manualWeakChapterIds?: readonly string[];
  /** 자동 식별 약점 ranking (questionStats 기반). */
  autoRankings: readonly WeakChapterRanking[];
  /** 미응시 단원 — 데이터 부족 시 안내용. */
  unattemptedCount?: number;
  dDay?: number | null;
}

/**
 * 두 source 병합 — 사용자 명시 우선, 자동 식별 추가 (중복 제거).
 */
function unifyWeakEntries(
  manualIds: readonly string[],
  autoRankings: readonly WeakChapterRanking[],
): UnifiedWeakEntry[] {
  const result: UnifiedWeakEntry[] = [];
  const seen = new Set<string>();

  // 1순위: 사용자 명시 약점 (메타인지 입력)
  for (const chapter_id of manualIds) {
    if (seen.has(chapter_id)) continue;
    seen.add(chapter_id);
    result.push({
      rank: result.length + 1,
      chapter_id,
      chapter_name: CHAPTER_NAMES[chapter_id] ?? chapter_id,
      source: 'manual',
      accuracy: null,
      attempt_count: 0,
    });
  }

  // 2순위: 자동 식별 약점 (questionStats 기반)
  for (const r of autoRankings) {
    if (seen.has(r.chapter_id)) continue;
    seen.add(r.chapter_id);
    result.push({
      rank: result.length + 1,
      chapter_id: r.chapter_id,
      chapter_name: r.chapter_name,
      source: 'auto',
      accuracy: r.accuracy,
      attempt_count: r.attempt_count,
    });
  }

  return result;
}

export default function WeakChapterRoadmap({
  exam,
  manualWeakChapterIds = [],
  autoRankings,
  unattemptedCount = 0,
  dDay = null,
}: Props) {
  const entries = unifyWeakEntries(manualWeakChapterIds, autoRankings);

  if (entries.length === 0) {
    return (
      <div className="liquid-glass rounded-[18px] px-5 py-5 text-center">
        <div
          className="kr-num text-[10.5px] uppercase tracking-widest mb-2"
          style={{ color: 'rgba(239,244,255,0.5)' }}
        >
          나의 약점
        </div>
        <p className="kr-body text-[13px] text-cream/65 leading-[1.55]">
          {unattemptedCount > 0
            ? '몇 문제 더 풀면 약점이 더 정확해져요. 학습 탭에서 다양한 단원을 풀어보세요.'
            : '아직 약점 단원이 없어요. 모든 단원이 골고루 잘 풀리고 있어요!'}
        </p>
      </div>
    );
  }

  const handleNodeClick = (entry: UnifiedWeakEntry) => {
    if (typeof window === 'undefined') return;
    const target = resolveLessonTarget(exam, entry.chapter_id);
    if (!target) {
      // 매핑 실패 — 학습 탭 chooser fallback
      window.location.hash = `/game/${exam}`;
      return;
    }
    try {
      // 방안 A: ZoneScreen 으로 직진 (chapter 단원 단위) — 학습 탭과 동일한 컨텍스트.
      // highlightTopic 으로 해당 토픽 첫 미완료 step 을 펄스 강조.
      window.sessionStorage.setItem(
        'questdp.pendingZoneOpen',
        JSON.stringify({
          subject: exam,
          chapter: target.chapter,
          highlightTopic: target.topic,
        }),
      );
    } catch {
      /* quota — silent fail */
    }
    window.location.hash = `/game/${exam}`;
  };

  const manualCount = entries.filter((e) => e.source === 'manual').length;
  const autoCount = entries.filter((e) => e.source === 'auto').length;

  return (
    <div className="liquid-glass rounded-[18px] px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div
            className="kr-num text-[10.5px] uppercase tracking-widest mb-0.5"
            style={{ color: 'rgba(239,244,255,0.58)' }}
          >
            나의 약점
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {dDay !== null && dDay > 0 ? (
            <span
              className="kr-heading text-[11px] tabular-nums px-2.5 py-1 rounded-full"
              aria-label={`시험까지 D-${dDay}`}
              style={{
                color: 'rgba(239,244,255,0.78)',
                background: 'rgba(239,244,255,0.07)',
                border: '1px solid rgba(239,244,255,0.10)',
              }}
            >
              D-{dDay}
            </span>
          ) : null}
          {manualCount > 0 ? (
            <span
              className="kr-num text-[10px] uppercase tracking-widest px-2 py-1 rounded-full"
              style={{
                color: 'rgba(239,244,255,0.68)',
                background: 'rgba(239,244,255,0.055)',
                border: '1px solid rgba(239,244,255,0.10)',
              }}
            >
              직접 {manualCount}
            </span>
          ) : null}
          {autoCount > 0 ? (
            <span
              className="kr-num text-[10px] uppercase tracking-widest px-2 py-1 rounded-full"
              style={{
                color: 'rgba(239,244,255,0.68)',
                background: 'rgba(239,244,255,0.055)',
                border: '1px solid rgba(239,244,255,0.10)',
              }}
            >
              자동 발견 {autoCount}
            </span>
          ) : null}
        </div>
      </div>

      {/* 노드 + connector — 세로 배치 */}
      <ol className="relative list-none p-0 m-0 pl-1">
        {entries.map((e, i) => {
          const isLast = i === entries.length - 1;
          const accuracyForVisual = e.accuracy ?? 0.5; // manual 은 노드 색을 중간 톤으로
          const ariaParts = [
            `${e.chapter_name} 학습 시작`,
            e.source === 'manual'
              ? '직접 선택한 약점'
              : `학습 결과 기반 — 정답률 ${Math.round((e.accuracy ?? 0) * 100)}%`,
          ];
          return (
            <li key={e.chapter_id} className="relative pb-4 last:pb-0">
              <button
                type="button"
                onClick={() => handleNodeClick(e)}
                aria-label={ariaParts.join(' — ')}
                className="w-full flex items-center gap-3 p-1 rounded-xl text-left transition hover:bg-white/5 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-neon"
              >
                {/* 노드 */}
                <span
                  className="relative shrink-0 w-12 h-12 rounded-full inline-flex items-center justify-center transition-transform duration-150"
                  style={{
                    background: nodeBackground(accuracyForVisual),
                    boxShadow: nodeShadow(accuracyForVisual),
                    border: '1px solid var(--game-node-border)',
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-1 rounded-full pointer-events-none"
                    style={{
                      border: '1px solid rgba(255,255,255,0.22)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -2px 6px rgba(0,0,0,0.18)',
                    }}
                  />
                  <span
                    className="kr-num leading-none relative"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--game-node-text)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.55)',
                    }}
                  >
                    {e.rank}
                  </span>
                </span>

                {/* 라벨 */}
                <span className="flex-1 min-w-0 block">
                  <span className="flex items-center justify-between gap-2 mb-1">
                    <span className="kr-heading text-[14px] text-cream/95 truncate">
                      {e.chapter_name}
                    </span>
                    <ChevronRight
                      size={14}
                      strokeWidth={2.4}
                      style={{ color: 'rgba(239,244,255,0.4)', flexShrink: 0 }}
                    />
                  </span>
                  {/* 배지 — source 별 다르게 표시 */}
                  <span className="flex items-center gap-1.5 kr-num text-[11px] tabular-nums">
                    {e.source === 'manual' ? (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                        style={{
                          background: 'var(--game-pill-bg)',
                          color: 'rgba(239,244,255,0.64)',
                          border: '1px solid var(--game-pill-border)',
                        }}
                      >
                        <Check size={10} strokeWidth={2.8} aria-hidden />
                        <span style={{ fontSize: 10 }}>직접</span>
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                        style={{
                          background: 'var(--game-pill-bg)',
                          color: 'rgba(239,244,255,0.64)',
                          border: '1px solid var(--game-pill-border)',
                        }}
                      >
                        <BarChart3 size={10} strokeWidth={2.4} aria-hidden />
                        <span style={{ fontSize: 10 }}>자동</span>
                      </span>
                    )}
                    {e.source === 'auto' && e.accuracy !== null && (
                      <span
                        className="px-1.5 py-0.5 rounded-full"
                        style={{
                          color: 'rgba(239,244,255,0.68)',
                          background: 'var(--game-pill-bg)',
                          border: '1px solid rgba(111,255,232,0.16)',
                        }}
                      >
                        {Math.round(e.accuracy * 100)}% · {e.attempt_count}Q
                      </span>
                    )}
                  </span>
                </span>
              </button>

              {/* connector — 마지막 노드 아니면 노드 아래로 점선 */}
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute"
                  style={{
                    left: 24, // 노드 중앙
                    top: 48 + 2,
                    width: 2,
                    bottom: 8,
                    background:
                      'linear-gradient(180deg, rgba(239,244,255,0.18), rgba(239,244,255,0.06))',
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>

      {unattemptedCount > 0 && (
        <div
          className="kr-num text-[10.5px] mt-3 uppercase tracking-widest px-3 py-2 rounded-full inline-flex items-center gap-2"
          style={{
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(239,244,255,0.55)',
            border: '1px solid rgba(239,244,255,0.08)',
          }}
        >
          <span>미응시</span>
          <span>{unattemptedCount}</span>
        </div>
      )}
    </div>
  );
}

// ─── 헬퍼 ─────────────────────────────────────────────────────────

/** 정답률 → 노드 배경 (radial gradient). 낮을수록 빨강. */
function nodeBackground(accuracy: number): string {
  if (accuracy < 0.4) return 'var(--game-node-bg-strong)';
  return 'var(--game-node-bg)';
}

function nodeShadow(accuracy: number): string {
  if (accuracy < 0.4) return 'var(--game-node-shadow-strong)';
  return 'var(--game-node-shadow)';
}


/**
 * chapter_id → 운영 lesson 의 (subject, chapter, topic) 분해.
 *
 * 매핑 규칙:
 *   1) chapter_id 패턴 `{exam}-{N}-{M|stats}` 에서 chapter 번호 N 추출
 *   2) CHAPTER_NAMES[chapter_id] 가 의미하는 canonical 토픽명 lookup
 *   3) 해당 chapter 의 lessons 에서 토픽명 매칭 (정확 일치 → 부분 일치 → 첫 lesson)
 *
 * 왜 단순 index 사용 안 하는가:
 *   chapter_id 의 `-M` 는 1-based lesson index 가 아닌 "출제 분류" 카테고리.
 *   예) `adsp-3-3` (정형 데이터 마이닝) 는 실제로 chapter 3 의 lesson[3] 이고,
 *       lesson[2] 는 `adsp-3-2` 분류의 "통계적 가설 검정" — index 추정이 깨짐.
 */
function resolveLessonTarget(
  exam: Subject,
  chapterId: string,
): { chapter: number; topic: string } | null {
  const m = /^(adsp|sqld)-(\d+)(?:-(?:\d+|stats))?$/.exec(chapterId);
  if (!m) return null;
  const chapterNum = Number(m[2]);
  const lessons = getLessonsInChapter(exam, chapterNum);
  if (lessons.length === 0) return null;

  // CHAPTER_NAMES 가 의미하는 canonical 토픽명 — 사용자가 클릭한 노드의 라벨과 동일.
  const wantedName = CHAPTER_NAMES[chapterId];
  if (wantedName) {
    // 1) 정확 일치
    const exact = lessons.find((l) => l.topic === wantedName);
    if (exact) return { chapter: chapterNum, topic: exact.topic };
    // 2) 부분 일치 — CHAPTER_NAMES 가 약어인 경우 (예: "가치 창조 데이터 사이언스" vs
    //    실제 lesson "가치 창조를 위한 데이터 사이언스") 보호.
    const partial = lessons.find(
      (l) => l.topic.includes(wantedName) || wantedName.includes(l.topic),
    );
    if (partial) return { chapter: chapterNum, topic: partial.topic };
  }
  // 3) 매핑 실패 — chapter 의 첫 lesson 으로 fallback (chapter 단위 진입은 보장).
  return { chapter: chapterNum, topic: lessons[0].topic };
}

// 함수 사용 — getQuestionMeta 는 정확한 topic 추정 미사용 (CHAPTER_NAMES 매칭으로 충분).
// 향후 정확도 필요 시 metaMap 의 representative question 사용 가능.
void getQuestionMeta;
