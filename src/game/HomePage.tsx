/**
 * HomePage — 스크롤 연동 히어로를 가진 홈 화면.
 *
 * 히어로: D-day 숫자를 배경에 깔고 그 앞에 로켓. 스크롤을 내리면 로켓이
 * 우상단으로 날아오르며 축소되고, D-day 숫자는 사라진다. "시험이 다가올수록
 * 발사에 가까워진다" 는 은유를 스크롤 제스처에 붙인 것.
 *
 * 히어로 높이는 100vh 가 아니라 72vh — 다음 카드가 화면 하단에 살짝 걸치게 해서
 * (a) 스크롤 가능하다는 신호를 주고 (b) 매 방문마다 스크롤해야 학습을 시작할 수
 * 있는 마찰을 없앤다. 첫인상은 강렬해도 21 번째 방문에선 장애물이 되기 때문.
 *
 * 접근성: prefers-reduced-motion 이면 모든 스크롤 변환을 끄고 정적 배치로 떨어진다.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  BarChart3,
  Star,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { MobileBottomNav, MobileTopBar } from './components/MobileGameNav';
import PageAmbientBg from './components/PageAmbientBg';
import { useProgress } from './useProgress';
import { computePlayerStats } from './rpg';
import { useMyProfile } from '@/data/profile';
import { getExamDate, daysUntil, getUpcomingPresets } from './examDate';
import {
  readLastLearnHash,
  getLastLearnContext,
  CORE_SUBJECT_ACCENT,
} from './learningContext';
import type { Subject } from '@/types/question';
import { getFullChapterAccuracies } from './passPrediction/chapterWeights';
import { rankWeakChapters } from './passPrediction/weakChapterRanker';
import { resolveLessonTarget } from './passPrediction/WeakChapterRoadmap';

// WebP. 원본 PNG 는 1.4MB 라 첫 화면 최대 요소가 모바일 데이터에서 늦게 떴다.
// 재생성: node scripts/convert-to-webp.mjs <원본> public/hero/rocket.webp
const ROCKET_SRC = '/hero/rocket.webp';

/** hex accent 를 rgba 로 — 배경·테두리 틴트에 사용. */
function tint(hex: string, alpha: number): string {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!m) return `rgba(139,123,247,${alpha})`;
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => parseInt(h, 16));
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function HomePage() {
  const progress = useProgress();
  const profile = useMyProfile();
  const stats = computePlayerStats(progress);
  const reduceMotion = useReducedMotion();

  // 과목 톤 — ADSP 청록 / SQLD 보라 / 컴활 연두. 확장 과목까지 한 번에 잡히도록
  // 상단바와 동일하게 learningContext 를 경유한다.
  const fallbackSubject: Subject = progress.activeSubject ?? 'adsp';
  const learnCtx = getLastLearnContext(fallbackSubject);
  const accent = learnCtx?.accent ?? CORE_SUBJECT_ACCENT[fallbackSubject];
  const subjectLabel = learnCtx?.label ?? fallbackSubject.toUpperCase();

  // 색·라벨과 시험일이 서로 다른 과목을 가리키면 안 된다 (제목은 SQLD 인데
  // 날짜는 ADSP 것이 뜨는 문제). 시험 정보는 항상 이 subject 하나만 따른다.
  const subject: Subject =
    learnCtx?.kind === 'core' ? learnCtx.subject : fallbackSubject;

  // 확장 과목(컴활)은 EXAM_PRESETS 에 회차가 없어 D-day 를 만들 수 없다.
  // 코어 과목 날짜를 대신 보여주면 라벨과 어긋나므로 아예 감춘다.
  // 약점 단원 TOP 4 — /weakness 화면과 같은 계산기를 그대로 쓴다.
  // 확장 과목은 챕터 가중치 테이블이 없어 이 계산이 성립하지 않으므로 건너뛴다.
  const isExpansion = learnCtx?.kind === 'expansion';
  const weakChapters = useMemo(
    () =>
      isExpansion
        ? []
        : rankWeakChapters(
            getFullChapterAccuracies(progress.questionStats, subject),
            4,
          ),
    [isExpansion, progress.questionStats, subject],
  );

  const openWeakChapter = (chapterId: string) => {
    const target = resolveLessonTarget(subject, chapterId);
    if (target) {
      try {
        window.sessionStorage.setItem(
          'questdp.pendingZoneOpen',
          JSON.stringify({
            subject,
            chapter: target.chapter,
            highlightTopic: target.topic,
          }),
        );
      } catch {
        /* quota — 단원 강조 없이 학습 탭으로만 이동 */
      }
    }
    window.location.hash = `/game/${subject}`;
  };

  const examYmd = isExpansion ? undefined : getExamDate(subject);
  const dDay = isExpansion ? null : daysUntil(examYmd);
  const nextPreset = isExpansion ? null : getUpcomingPresets(subject)[0] ?? null;

  // 뷰포트 크기 — 스크롤 변환 거리 계산에 필요.
  const [vp, setVp] = useState({ w: 390, h: 844 });
  useEffect(() => {
    const sync = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  // 히어로를 넉넉하게 잡아 D-day 와 로켓이 서로 숨 쉴 자리를 준다.
  // 100vh 로 꽉 채우지 않는 건, 아래 카드가 살짝 걸쳐 보여야 "더 있다" 는
  // 신호가 되고 매 방문마다 스크롤해야 하는 마찰이 없기 때문.
  // 0.78 은 임의값이 아니다 — 남는 22% 에서 하단 네비(약 70px)를 빼면 헤드라인
  // 두 줄이 잘리지 않고 들어간다. iPhone SE 같은 짧은 화면 기준으로 잡은 값이라
  // 이보다 키우면 "한 발 더" 가 네비에 물린다.
  const heroH = vp.h * 0.78;

  // 스크롤 0 → 히어로 80% 지점에서 변환 완료. clamp 로 그 이후엔 고정.
  const { scrollY } = useScroll();
  const p = useTransform(scrollY, [0, heroH * 0.8], [0, 1], { clamp: true });

  // 로켓: 히어로 중앙 → 우상단으로 날아올라 그 자리에 고정.
  // 스크롤해도 계속 보여야 하므로 fixed 로 띄우고 transform 만 준다
  // (translate/scale 은 컴포지터에서 처리돼 스크롤 중에도 프레임이 안 떨어짐).
  // 래퍼는 fixed inset-0 + flex center 라 기준점이 "뷰포트 중앙" 이다.
  // 거기서 히어로 중앙까지 끌어올린 값이 시작 위치.
  // heroH * 0.11 만큼 더 내려서 D-day 숫자가 로켓 위로 드러나게 한다.
  const rocketStartY = heroH / 2 - vp.h / 2 + heroH * 0.11;
  // 도착 위치 — 헤드라인과 같은 띠의 오른쪽. 헤드라인은 왼쪽 정렬이라 가로로
  // 겹치지 않고, 시안처럼 문구 옆에 로켓이 서 있는 구도가 된다.
  // 더 내리면 아래 카드를 덮고, 더 키워도 카드를 덮는다.
  const rocketEndY = 122 - vp.h / 2;
  const rocketX = useTransform(p, [0, 1], [0, vp.w * 0.29]);
  const rocketY = useTransform(p, [0, 1], [rocketStartY, rocketEndY]);
  const rocketScale = useTransform(p, [0, 1], [1, 0.3]);
  const rocketRotate = useTransform(p, [0, 1], [0, 14]);
  // 비행이 끝난 뒤 더 내리면 사라진다. 계속 고정해두면 카드 위에 붕 뜬 채로
  // 남아 자리를 못 찾은 것처럼 보인다 — 히어로가 로켓의 무대고, 본문에 들어서면
  // 역할이 끝난 것으로 본다.
  // 페이드는 스크롤 픽셀이 아니라 비행 진행도(p)에 묶는다. 픽셀로 잡으면 남은
  // 스크롤 거리가 콘텐츠 길이에 따라 달라져, 짧은 사용자에게는 페이드가 끝나기
  // 전에 스크롤이 끝나고 반투명 로켓이 카드 위에 걸린 채 남는다 (실측 0.3).
  // 비행 막바지에 사라지므로, 헤드라인 옆에 서는 순간은 지나가듯 남는다.
  const rocketFade = useTransform(p, [0.88, 1], [1, 0]);

  // D-day 숫자와 안내 문구는 로켓보다 빨리 사라진다.
  const ddayOpacity = useTransform(p, [0, 0.5], [1, 0]);
  const hintOpacity = useTransform(p, [0, 0.25], [1, 0]);

  // 모션을 끈 사용자에게는 변환 없이 히어로 중앙에 고정된 로켓만 보인다.
  const rocketStyle = reduceMotion
    ? { x: 0, y: rocketStartY, scale: 1, rotate: 0 }
    : {
        x: rocketX,
        y: rocketY,
        scale: rocketScale,
        rotate: rocketRotate,
        opacity: rocketFade,
      };
  const ddayStyle = reduceMotion ? { opacity: 1 } : { opacity: ddayOpacity };
  const hintStyle = reduceMotion ? { opacity: 1 } : { opacity: hintOpacity };

  /*
   * 진입 연출 — 위에서부터 순서대로 자리를 잡는다.
   *   0.10s 시험명 → 0.28s D-day → 0.42s 로켓(아래에서 떠오름) → 1.15s 스크롤 안내
   * ease 는 [0.16,1,0.3,1] (expo-out) — 처음 빠르게 나왔다가 길게 감속해서
   * 스프링 특유의 통통거림 없이 묵직하게 안착한다.
   */
  const EASE_OUT = [0.16, 1, 0.3, 1] as const;
  const enter = (delay: number, y = 10) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.85, ease: EASE_OUT },
        };

  const displayName =
    !profile.displayName || profile.displayName === profile.tag
      ? '탐험가'
      : profile.displayName;

  return (
    <section className="relative min-h-screen text-cream isolate overflow-x-hidden">
      <PageAmbientBg />
      <MobileTopBar subject={subject} />

      {/* ─── 히어로 ────────────────────────────────────────────────────── */}
      <div
        className="relative flex flex-col items-center justify-center px-6"
        style={{ height: heroH, paddingTop: 56 }}
      >
        {/* 시험명 + 날짜 — 로켓과 겹치지 않게 히어로 상단에 고정 */}
        <motion.div
          {...enter(0.1)}
          style={ddayStyle}
          className="absolute inset-x-0 top-[92px] z-30 text-center"
        >
          <div className="kr-heading text-[15px] font-bold" style={{ color: accent }}>
            {subjectLabel} 정기시험
          </div>
          <div className="kr-num mt-1 text-[17px] text-cream/85">
            {examYmd ?? nextPreset?.display ?? '시험일을 설정해 주세요'}
          </div>
        </motion.div>

        {/* D-day 숫자 — 로켓 뒤 레이어 */}
        {/* 로켓보다 위로 올려서 숫자가 가려지지 않게 한다. */}
        <motion.div
          aria-hidden
          style={{ ...ddayStyle, y: -Math.round(heroH * 0.15) }}
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
        >
          {/*
            바깥 div 는 스크롤 opacity·정렬 오프셋을 이미 style 로 물고 있으므로,
            진입 연출은 이 안쪽 레이어에서 따로 준다 (같은 요소에 style 과
            animate 로 같은 속성을 주면 style 이 이겨서 애니메이션이 죽는다).
          */}
          <motion.span
            {...(reduceMotion
              ? {}
              : {
                  initial: { opacity: 0, scale: 0.92 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { delay: 0.28, duration: 1.05, ease: EASE_OUT },
                })}
            className="kr-heading gradient-text select-none leading-none"
            style={{
              fontSize: Math.min(vp.w * 0.42, 190),
              fontWeight: 800,
              letterSpacing: '-0.04em',
              backgroundImage: `linear-gradient(180deg, ${tint(accent, 0.95)} 0%, ${tint(
                accent,
                0.5,
              )} 58%, ${tint(accent, 0.2)} 100%)`,
              opacity: 0.92,
            }}
          >
            {dDay !== null && dDay >= 0 ? `D-${dDay}` : 'D-?'}
          </motion.span>
        </motion.div>

        {/*
          로켓 — fixed. 히어로 세로 중앙에 놓고 transform 으로만 이동시킨다.
          z-20 은 상단바(z-30)보다 아래 — 날아오른 뒤 상단바를 가리지 않게.
        */}
        <motion.div
          style={rocketStyle}
          className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center"
        >
          {/* 진입: 아래에서 떠오르며 등장 */}
          <motion.div
            {...(reduceMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 64, scale: 0.88 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                  transition: { delay: 0.42, duration: 1.2, ease: EASE_OUT },
                })}
          >
            {/* 정착 후 계속되는 미세한 부유 — 우주에 떠 있는 느낌 */}
            <motion.div
              {...(reduceMotion
                ? {}
                : {
                    animate: { y: [0, -9, 0] },
                    transition: {
                      delay: 1.6,
                      duration: 5.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  })}
            >
              <Rocket size={Math.min(vp.w * 0.82, 350)} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 스크롤 안내 — 가장 마지막에 등장. 화살표만 계속 내려가라고 신호한다. */}
        <motion.div
          {...enter(1.15, 6)}
          style={hintStyle}
          className="absolute inset-x-0 bottom-5 z-20 flex flex-col items-center gap-1"
        >
          <span className="kr-body text-[12px] text-cream/50">스크롤하여 시작하기</span>
          <motion.span
            {...(reduceMotion
              ? {}
              : {
                  animate: { y: [0, 5, 0] },
                  transition: {
                    delay: 2,
                    duration: 1.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                })}
          >
            <ChevronDown size={18} className="text-cream/40" />
          </motion.span>
        </motion.div>
      </div>

      {/* ─── 카드 스택 ─────────────────────────────────────────────────── */}
      {/*
        min-h-screen 이 없으면 스크롤 끝에서 "뷰포트 높이 − 카드 높이" 만큼
        위쪽에 구멍이 뚫린다 (카드가 한 화면을 못 채우므로). 그 구멍에 로켓만
        떠 있어 화면이 깨져 보였다. 최소 한 화면을 차지하게 해서, 스크롤 끝에는
        헤드라인이 로켓 옆에 오고 남는 여백은 마지막 카드 아래로 간다.
        약점 목록이 들어오면 콘텐츠가 늘어 이 min-height 는 자연히 무의미해진다.
      */}
      <div
        className="relative z-10 mx-auto w-full max-w-[560px] px-4 pb-24"
        style={{ minHeight: vp.h - 56 }}
      >
        {/*
          로켓 왼쪽에 서는 띠. D-day 는 히어로에만 둔다 — 여기까지 숫자를 넣으면
          스크롤 도중 한 화면에 D-day 가 두 번 잡힌다. 카드 테두리도 두르지
          않는다. 로켓과 나란히 서는 자리라 chrome 이 생기면 서로 시선을 뺏는다.
        */}
        <Reveal>
          <div className="pt-2 pb-1">
            {/*
              스트릭은 계속 오게 만드는 장치라 남기되, "연속 학습 N일째" 가
              카드 한 장을 차지할 정보는 아니라 인사말 뒤에 붙였다. 화면 맨 아래
              흐린 한 줄로 두면 사실상 아무도 보지 않는다.
            */}
            <div className="kr-body text-[13px] text-cream/55">
              안녕하세요, {displayName}님
              {stats.streakDays > 0 ? (
                <span style={{ color: tint(accent, 0.85) }}>
                  {' · '}연속 {stats.streakDays}일
                </span>
              ) : null}
            </div>
            <div className="kr-heading mt-1 text-[27px] leading-[1.25] text-cream">
              오늘도 합격에
            </div>
            <div
              className="kr-heading text-[27px] leading-[1.25]"
              style={{ color: accent }}
            >
              한 발 더
            </div>
            {dDay === null ? (
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '/stats';
                }}
                className="kr-heading mt-3 rounded-[12px] px-4 py-2 text-[13px] transition active:scale-[0.98]"
                style={{ background: 'var(--cta-primary)', color: 'var(--base)' }}
              >
                시험일 설정하기
              </button>
            ) : null}
          </div>
        </Reveal>

        <Reveal>
          <Card>
            <div className="kr-heading text-[14px] text-cream">오늘의 학습</div>
            <button
              type="button"
              onClick={() => {
                window.location.hash = readLastLearnHash();
              }}
              className="mt-3 flex w-full items-center gap-3 text-left transition active:scale-[0.99]"
            >
              <span
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]"
                style={{ background: tint(accent, 0.16) }}
              >
                <BookOpen size={22} style={{ color: accent }} />
              </span>
              <span className="kr-heading min-w-0 flex-1 truncate text-[15px] text-cream">
                {subjectLabel} 이어하기
              </span>
              <ChevronRight
                size={20}
                strokeWidth={2.4}
                className="shrink-0"
                style={{ color: tint(accent, 0.75) }}
              />
            </button>
          </Card>
        </Reveal>

        {/*
          약점 단원. 기존 /weakness 화면은 5 행이 전부 같은 크기라 무엇부터
          해야 할지 안 보였다. 여기서는 1 순위만 크게 두고 나머지는 눌러서
          접근만 되게 낮춘다.
        */}
        {weakChapters.length > 0 ? (
          <Reveal>
            <div className="mb-2 mt-5 flex items-baseline justify-between">
              <span className="kr-heading text-[14px] text-cream">약점 단원</span>
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '/weakness';
                }}
                className="kr-body text-[12px] text-cream/50 transition active:scale-95"
              >
                전체 보기
              </button>
            </div>

            <button
              type="button"
              onClick={() => openWeakChapter(weakChapters[0].chapter_id)}
              className="liquid-glass w-full rounded-[18px] px-4 py-4 text-left transition active:scale-[0.99]"
              style={{ border: `1px solid ${tint(accent, 0.28)}` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="kr-heading inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px]"
                  style={{ background: tint(accent, 0.18), color: accent }}
                >
                  1
                </span>
                <span className="kr-heading min-w-0 flex-1 truncate text-[16px] text-cream">
                  {weakChapters[0].chapter_name}
                </span>
                <ChevronRight
                  size={20}
                  strokeWidth={2.4}
                  className="shrink-0"
                  style={{ color: tint(accent, 0.75) }}
                />
              </div>
              <div className="mt-3 flex items-center gap-2.5">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.round(weakChapters[0].accuracy * 100)}%`,
                      background: accent,
                    }}
                  />
                </span>
                <span className="kr-num shrink-0 text-[12px] text-cream/60">
                  {Math.round(weakChapters[0].accuracy * 100)}%
                </span>
              </div>
            </button>

            {weakChapters.slice(1).map((w) => (
              <button
                key={w.chapter_id}
                type="button"
                onClick={() => openWeakChapter(w.chapter_id)}
                className="mt-2 flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-left transition active:scale-[0.99]"
                style={{ background: 'rgba(255,255,255,0.035)' }}
              >
                <span className="kr-num w-4 shrink-0 text-[12px] text-cream/40">
                  {w.rank}
                </span>
                <span className="kr-body min-w-0 flex-1 truncate text-[13.5px] text-cream/85">
                  {w.chapter_name}
                </span>
                <span className="kr-num shrink-0 text-[12px] text-cream/50">
                  {Math.round(w.accuracy * 100)}%
                </span>
              </button>
            ))}
          </Reveal>
        ) : null}

        <Reveal>
          <div className="kr-heading mb-2 mt-5 text-[14px] text-cream">빠른 메뉴</div>
          {/*
            3 칸인 이유. '기출문제' 는 실제로는 학습 탭 첫 화면으로만 가서 다른
            버튼과 구분이 안 됐고, '약점분석' 은 바로 위 약점 단원 목록과 같은
            일을 한다. 눌러도 기대한 곳에 못 가는 칸을 남겨두느니 뺐다.
          */}
          <div className="grid grid-cols-3 gap-2.5">
            <QuickItem
              icon={<BookOpen size={20} style={{ color: '#A78BFA' }} />}
              label="오답노트"
              onClick={() => {
                try {
                  window.sessionStorage.setItem('questdp.pendingReviewOpen', '1');
                } catch {
                  /* storage 불가 — 학습 화면으로만 이동 */
                }
                window.location.hash = '/game';
              }}
            />
            <QuickItem
              icon={<Star size={20} style={{ color: '#FBBF24' }} />}
              label="즐겨찾기"
              onClick={() => {
                window.location.hash = '/bookmarks';
              }}
            />
            <QuickItem
              icon={<BarChart3 size={20} style={{ color: '#4ADE80' }} />}
              label="통계"
              onClick={() => {
                window.location.hash = '/stats';
              }}
            />
          </div>
        </Reveal>

      </div>

      <MobileBottomNav active="learn" />
    </section>
  );
}

/**
 * 로켓 — public/hero/rocket.png. 파일이 아직 없으면 같은 자리를 채우는
 * 그라디언트 도형으로 대체해서 레이아웃 검토를 막지 않는다.
 */
function Rocket({ size }: { size: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-hidden
        style={{
          width: size * 0.34,
          height: size,
          opacity: 0.82,
          borderRadius: '50% 50% 38% 38%',
          background:
            'linear-gradient(160deg, #3A3A52 0%, #1B1B32 45%, #101024 100%)',
          boxShadow:
            '0 0 60px rgba(123,108,246,0.35), inset 0 8px 20px rgba(255,255,255,0.10)',
        }}
      />
    );
  }

  return (
    <img
      src={ROCKET_SRC}
      alt=""
      aria-hidden
      onError={() => setFailed(true)}
      style={{ width: size, height: 'auto' }}
      draggable={false}
    />
  );
}

/** 스크롤해서 보이면 아래에서 떠오르는 등장. */
function Reveal({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
    >
      {children}
    </motion.div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="liquid-glass mt-3 rounded-[18px] px-4 py-4">{children}</div>
  );
}

function QuickItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="liquid-glass flex flex-col items-center gap-2 rounded-[16px] px-1 py-3.5 transition active:scale-95"
    >
      {icon}
      <span className="kr-body text-[11.5px] text-cream/80">{label}</span>
    </button>
  );
}
