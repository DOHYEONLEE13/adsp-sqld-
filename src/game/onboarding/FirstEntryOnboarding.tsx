import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Database,
  LoaderCircle,
  LockKeyhole,
  Monitor,
} from 'lucide-react';
import {
  isSupabaseConfigured,
  signInWithOAuth,
} from '@/lib/supabase';
import { setPendingAuthRedirect } from '@/lib/authGuard';
import { useAuthSession } from '@/lib/auth/sessionStore';
import {
  retryProfileSync,
  setAvatarCharacter,
  setDisplayName,
  useMyProfile,
} from '@/data/profile';
import type { MascotCharacter } from '@/components/mascot/types';
import { navigate } from '@/lib/navigate';

export type FirstEntrySubject = 'adsp' | 'sqld' | 'comhwal';

interface SubjectVisual {
  id: FirstEntrySubject;
  label: string;
  fullLabel: string;
  characterName: string;
  character: MascotCharacter;
  accent: string;
  asset: string;
}

const SUBJECTS: SubjectVisual[] = [
  {
    id: 'comhwal',
    label: '컴활',
    fullLabel: '컴퓨터활용능력',
    characterName: '해리',
    character: 'harry',
    accent: '#A7E96A',
    asset: '/onboarding/harry.webp',
  },
  {
    id: 'adsp',
    label: 'ADsP',
    fullLabel: '데이터분석 준전문가',
    characterName: '토리',
    character: 'tori',
    accent: '#5DAEFF',
    asset: '/onboarding/tori.webp',
  },
  {
    id: 'sqld',
    label: 'SQLD',
    fullLabel: 'SQL 개발자',
    characterName: '셀리',
    character: 'selli',
    accent: '#C084FC',
    asset: '/onboarding/selli.webp',
  },
];

type Step = 'subject' | 'nickname' | 'login';

interface Draft {
  v: 1;
  step: Step;
  subject: FirstEntrySubject;
  nickname: string;
}

interface Props {
  onComplete: (result: {
    subject: FirstEntrySubject;
    nickname: string;
  }) => void;
}

const DRAFT_KEY = 'questdp.onboarding.simple.v1';
const NICKNAME_RE = /^[가-힣A-Za-z0-9]{2,12}$/;
const ONBOARDING_STAGE_HEIGHT = 858;

function loadDraft(): Draft {
  const fallback: Draft = {
    v: 1,
    step: 'subject',
    subject: 'adsp',
    nickname: '',
  };
  if (typeof window === 'undefined') return fallback;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DRAFT_KEY) ?? '') as Draft;
    if (
      parsed?.v === 1 &&
      (parsed.step === 'subject' || parsed.step === 'nickname' || parsed.step === 'login') &&
      SUBJECTS.some((subject) => subject.id === parsed.subject) &&
      typeof parsed.nickname === 'string'
    ) {
      return { ...parsed, nickname: parsed.nickname.slice(0, 12) };
    }
  } catch {
    // 첫 방문 또는 저장소를 사용할 수 없는 환경.
  }
  return fallback;
}

export function clearFirstEntryDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // 저장소를 사용할 수 없어도 완료 흐름은 계속한다.
  }
}

interface FirstEntrySubjectPickerProps {
  initialSubject: FirstEntrySubject;
  onBack: () => void;
  onSelect: (subject: FirstEntrySubject) => void;
}

/** 온보딩 첫 화면을 그대로 재사용하는 과목 변경 전용 화면. */
export function FirstEntrySubjectPicker({
  initialSubject,
  onBack,
  onSelect,
}: FirstEntrySubjectPickerProps) {
  const initialIndex = Math.max(
    0,
    SUBJECTS.findIndex((subject) => subject.id === initialSubject),
  );
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<-1 | 1>(1);
  const [playIntro, setPlayIntro] = useState(true);
  const reduceMotion = !!useReducedMotion();

  useEffect(() => {
    if (!playIntro) return;
    if (reduceMotion) {
      setPlayIntro(false);
      return;
    }

    const timer = window.setTimeout(() => setPlayIntro(false), 1250);
    return () => window.clearTimeout(timer);
  }, [playIntro, reduceMotion]);

  const selectAt = (index: number) => {
    const normalized = (index + SUBJECTS.length) % SUBJECTS.length;
    if (normalized === selectedIndex) return;
    setPlayIntro(false);
    setDirection(
      normalized === (selectedIndex + 1) % SUBJECTS.length ? 1 : -1,
    );
    setSelectedIndex(normalized);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x <= -48) selectAt(selectedIndex + 1);
    if (info.offset.x >= 48) selectAt(selectedIndex - 1);
  };

  return (
    <section className="relative h-[100svh] overflow-hidden bg-[#010828] text-cream isolate">
      <OnboardingBackdrop step="subject" reduceMotion={reduceMotion} />

      <main className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[620px] flex-col px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(22px,env(safe-area-inset-top))] sm:px-8 lg:max-w-[760px] lg:px-10">
        <OnboardingTopBar active={0} reduceMotion={reduceMotion} onBack={onBack} />

        <OnboardingViewportStage>
          <SubjectStep
            selectedIndex={selectedIndex}
            direction={direction}
            playIntro={playIntro}
            onSelect={selectAt}
            onDragEnd={handleDragEnd}
            reduceMotion={reduceMotion}
            onNext={() => onSelect(SUBJECTS[selectedIndex].id)}
          />
        </OnboardingViewportStage>
      </main>
    </section>
  );
}

export default function FirstEntryOnboarding({ onComplete }: Props) {
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [playSubjectIntro, setPlaySubjectIntro] = useState(() => draft.step === 'subject');
  const [subjectDirection, setSubjectDirection] = useState<-1 | 1>(1);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authPending, setAuthPending] = useState(false);
  const finishStarted = useRef(false);
  const reduceMotion = !!useReducedMotion();
  const auth = useAuthSession();
  const profile = useMyProfile();

  const selectedIndex = Math.max(
    0,
    SUBJECTS.findIndex((subject) => subject.id === draft.subject),
  );
  const selected = SUBJECTS[selectedIndex];

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // private mode 등에서는 현재 메모리 상태만 사용한다.
    }
  }, [draft]);

  useEffect(() => {
    if (!playSubjectIntro) return;
    if (reduceMotion) {
      setPlaySubjectIntro(false);
      return;
    }

    const timer = window.setTimeout(() => setPlaySubjectIntro(false), 1250);
    return () => window.clearTimeout(timer);
  }, [playSubjectIntro, reduceMotion]);

  const finish = () => {
    if (finishStarted.current) return;
    const nameResult = setDisplayName(draft.nickname);
    const characterResult = setAvatarCharacter(selected.character);
    if (!nameResult.ok || !characterResult.ok) {
      setAuthError('프로필을 저장하지 못했어요. 잠시 후 다시 시도해주세요.');
      return;
    }
    finishStarted.current = true;
    clearFirstEntryDraft();
    onComplete({ subject: draft.subject, nickname: draft.nickname });
  };

  useEffect(() => {
    if (draft.step !== 'login') return;
    if (auth.status !== 'authenticated' || profile.pendingServerSync) return;
    finish();
    // profile 변경으로 인한 재호출은 finishStarted ref 가 막는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.status, draft.step, profile.pendingServerSync]);

  const selectAt = (index: number) => {
    const normalized = (index + SUBJECTS.length) % SUBJECTS.length;
    if (normalized === selectedIndex) return;
    setPlaySubjectIntro(false);
    setSubjectDirection(
      normalized === (selectedIndex + 1) % SUBJECTS.length ? 1 : -1,
    );
    setDraft((current) => ({ ...current, subject: SUBJECTS[normalized].id }));
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x <= -48) selectAt(selectedIndex + 1);
    if (info.offset.x >= 48) selectAt(selectedIndex - 1);
  };

  const handleNicknameNext = () => {
    const nickname = draft.nickname.trim();
    if (!NICKNAME_RE.test(nickname)) {
      setNicknameError('한글, 영문, 숫자로 2~12자 이내로 입력해주세요.');
      return;
    }
    setNicknameError(null);
    setDraft((current) => ({ ...current, nickname, step: 'login' }));
  };

  const handleGoogleLogin = async () => {
    if (authPending) return;
    setAuthPending(true);
    setAuthError(null);
    setPendingAuthRedirect('/onboarding');
    const result = await signInWithOAuth('google');
    if ((result as { error?: unknown }).error) {
      setAuthError('Google 로그인에 실패했어요. 잠시 후 다시 시도해주세요.');
      setAuthPending(false);
    }
  };

  const handleBack = () => {
    setAuthError(null);
    setNicknameError(null);
    setDraft((current) => ({
      ...current,
      step: current.step === 'login' ? 'nickname' : 'subject',
    }));
  };

  const activeStep = draft.step === 'subject' ? 0 : draft.step === 'nickname' ? 1 : 2;

  const handleTopBack = () => {
    if (draft.step === 'subject') {
      navigate('/');
      return;
    }
    handleBack();
  };

  return (
    <section className="relative h-[100svh] overflow-hidden bg-[#010828] text-cream isolate">
      <OnboardingBackdrop step={draft.step} reduceMotion={reduceMotion} />

      <main className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[620px] flex-col px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(22px,env(safe-area-inset-top))] sm:px-8 lg:max-w-[760px] lg:px-10">
        <OnboardingTopBar
          active={activeStep}
          reduceMotion={reduceMotion}
          onBack={handleTopBack}
        />

        <OnboardingViewportStage>
          <LayoutGroup id="first-entry-onboarding">
            <AnimatePresence mode="sync">
              {draft.step === 'subject' ? (
                <SubjectStep
                  key="subject"
                  selectedIndex={selectedIndex}
                  direction={subjectDirection}
                  playIntro={playSubjectIntro}
                  onSelect={selectAt}
                  onDragEnd={handleDragEnd}
                  reduceMotion={reduceMotion}
                  onNext={() => {
                    setPlaySubjectIntro(false);
                    setDraft((current) => ({ ...current, step: 'nickname' }));
                  }}
                  onExistingAccount={() => navigate('/login')}
                />
              ) : draft.step === 'nickname' ? (
                <NicknameStep
                  key="nickname"
                  selected={selected}
                  value={draft.nickname}
                  error={nicknameError}
                  reduceMotion={reduceMotion}
                  onChange={(nickname) => {
                    setNicknameError(null);
                    setDraft((current) => ({ ...current, nickname }));
                  }}
                  onNext={handleNicknameNext}
                />
              ) : (
                <LoginStep
                  key="login"
                  selected={selected}
                  authStatus={auth.status}
                  profilePending={profile.pendingServerSync}
                  syncFailed={profile.syncStatus === 'failed'}
                  pending={authPending}
                  error={authError}
                  reduceMotion={reduceMotion}
                  onGoogleLogin={() => void handleGoogleLogin()}
                  onRetrySync={() => void retryProfileSync()}
                  onGuestContinue={finish}
                />
              )}
            </AnimatePresence>
          </LayoutGroup>
        </OnboardingViewportStage>
      </main>
    </section>
  );
}

/** 남은 화면 안에 세 단계의 기준 무대를 같은 비율로 맞춘다. */
function OnboardingViewportStage({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ width: 372, scale: 1 });

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const sync = () => {
      const availableWidth = host.clientWidth;
      const availableHeight = host.clientHeight;
      const baseWidth = availableWidth >= 640 ? 680 : availableWidth >= 500 ? 556 : 372;
      const nextScale = Math.min(
        1,
        availableWidth / baseWidth,
        availableHeight / ONBOARDING_STAGE_HEIGHT,
      );
      setLayout({ width: baseWidth, scale: Math.max(0.56, nextScale) });
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      data-testid="onboarding-viewport-stage"
      className="relative flex min-h-0 flex-1 justify-center overflow-visible"
    >
      <div
        className="relative shrink-0"
        style={{
          width: layout.width * layout.scale,
          height: ONBOARDING_STAGE_HEIGHT * layout.scale,
        }}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: layout.width,
            height: ONBOARDING_STAGE_HEIGHT,
            transform: `scale(${layout.scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SubjectStep({
  selectedIndex,
  direction,
  playIntro,
  onSelect,
  onDragEnd,
  reduceMotion,
  onNext,
  onExistingAccount,
}: {
  selectedIndex: number;
  direction: -1 | 1;
  playIntro: boolean;
  onSelect: (index: number) => void;
  onDragEnd: (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  reduceMotion: boolean;
  onNext: () => void;
  onExistingAccount?: () => void;
}) {
  const selected = SUBJECTS[selectedIndex];
  const leftIndex = (selectedIndex - 1 + SUBJECTS.length) % SUBJECTS.length;
  const rightIndex = (selectedIndex + 1) % SUBJECTS.length;

  return (
    <motion.div
      data-testid="onboarding-subject-step"
      className="absolute inset-0 flex flex-col"
      initial={reduceMotion || !playIntro ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <motion.header
        data-testid="onboarding-subject-heading"
        className="mt-2 text-center sm:mt-5 lg:mt-7"
        initial={
          reduceMotion || !playIntro
            ? false
            : { opacity: 0, y: -14, filter: 'blur(7px)' }
        }
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.52, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="kr-heading text-[32px] leading-[1.2] text-white sm:text-[40px] lg:text-[44px]">
          공부할 자격증을
          <br />
          <span style={{ color: selected.accent }}>선택해주세요</span>
        </h1>
      </motion.header>

      <motion.div
        className="relative mt-[56px] h-[400px] flex-none touch-pan-y [perspective:1100px] sm:mt-[60px] sm:h-[410px] lg:mt-[62px] lg:h-[430px]"
        onPanEnd={onDragEnd}
      >
        {SUBJECTS.map((subject, index) => (
          <OrbitSubjectItem
            key={subject.id}
            subject={subject}
            index={index}
            selectedIndex={selectedIndex}
            direction={direction}
            playIntro={playIntro}
            reduceMotion={reduceMotion}
          />
        ))}
        <button
          type="button"
          onClick={() => onSelect(leftIndex)}
          className="absolute bottom-3 left-0 z-30 h-[280px] w-[36%]"
          aria-label={`${SUBJECTS[leftIndex].label} 선택`}
        />
        <button
          type="button"
          onClick={() => onSelect(rightIndex)}
          className="absolute bottom-3 right-0 z-30 h-[280px] w-[36%]"
          aria-label={`${SUBJECTS[rightIndex].label} 선택`}
        />
      </motion.div>

      <motion.div
        data-testid="onboarding-swipe-controls"
        className="-mt-7 flex h-10 items-center justify-center gap-5 sm:gap-6"
        initial={reduceMotion || !playIntro ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          type="button"
          onClick={() => onSelect(leftIndex)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#7892c8]/55 bg-[#0b1f4a]/36 text-cream/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md transition active:scale-95"
          aria-label={`이전 자격증, ${SUBJECTS[leftIndex].label}`}
        >
          <ChevronLeft size={24} strokeWidth={2.4} aria-hidden />
        </button>
        <p className="kr-body whitespace-nowrap text-[13px] text-cream/65 sm:text-[14px]">
          좌우로 스와이프하여 선택하세요
        </p>
        <button
          type="button"
          onClick={() => onSelect(rightIndex)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#7892c8]/55 bg-[#0b1f4a]/36 text-cream/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md transition active:scale-95"
          aria-label={`다음 자격증, ${SUBJECTS[rightIndex].label}`}
        >
          <ChevronRight size={24} strokeWidth={2.4} aria-hidden />
        </button>
      </motion.div>

      <motion.div
        className="mt-1 flex justify-center gap-2"
        aria-label="자격증 선택 위치"
        initial={reduceMotion || !playIntro ? false : { opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.36, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {SUBJECTS.map((subject, index) => (
          <button
            key={subject.id}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={subject.label}
            aria-current={index === selectedIndex ? 'true' : undefined}
            className="h-2.5 w-2.5 rounded-full transition-colors"
            style={{
              background: index === selectedIndex ? selected.accent : 'rgba(239,244,255,0.18)',
            }}
          />
        ))}
      </motion.div>

      <motion.img
        src="/onboarding/subject-banner-display.webp"
        alt="어떤 자격증이든 QuestDP와 함께 더 쉽게 준비할 수 있어요."
        width={1000}
        height={207}
        className="mx-auto mt-4 w-full max-w-[360px] object-contain"
        data-testid="onboarding-subject-banner"
        initial={reduceMotion || !playIntro ? false : { opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.48, delay: 0.86, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        data-testid="onboarding-primary-action"
        className="mx-auto w-full max-w-[384px]"
        initial={reduceMotion || !playIntro ? false : { opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.96, ease: [0.22, 1, 0.36, 1] }}
      >
        <PrimaryButton accent={selected.accent} onClick={onNext} testId="onboarding-subject-next">
          선택 완료
        </PrimaryButton>
      </motion.div>
      {onExistingAccount ? (
        <motion.button
          data-testid="onboarding-existing-account"
          type="button"
          onClick={onExistingAccount}
          className="mx-auto mt-4 pb-1 kr-body text-[13px] text-cream/66 underline decoration-cream/35 underline-offset-4 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          initial={reduceMotion || !playIntro ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.06, ease: 'easeOut' }}
        >
          이미 계정이 있어요
        </motion.button>
      ) : null}
    </motion.div>
  );
}

function carouselOffset(index: number, selectedIndex: number): -1 | 0 | 1 {
  const raw = index - selectedIndex;
  if (raw === 0) return 0;
  if (raw === 1 || raw === -2) return 1;
  return -1;
}

const ORBIT_X = {
  '-1': 'calc(-50% - 56%)',
  '0': '-50%',
  '1': 'calc(-50% + 56%)',
} as const;

function orbitY(offset: -1 | 0 | 1): number {
  return offset === 0 ? 0 : -66;
}

function orbitZ(offset: -1 | 0 | 1): number {
  return offset === 0 ? 40 : -60;
}

function OrbitSubjectItem({
  subject,
  index,
  selectedIndex,
  direction,
  playIntro,
  reduceMotion,
}: {
  subject: SubjectVisual;
  index: number;
  selectedIndex: number;
  direction: -1 | 1;
  playIntro: boolean;
  reduceMotion: boolean;
}) {
  const offset = carouselOffset(index, selectedIndex);
  const previousSelected = (selectedIndex - direction + SUBJECTS.length) % SUBJECTS.length;
  const previousOffset = carouselOffset(index, previousSelected);
  const wrapsBehind = Math.abs(previousOffset - offset) === 2;
  const selected = offset === 0;
  const introDelay = selected ? 0.22 : offset < 0 ? 0.36 : 0.46;
  const target = {
    x: ORBIT_X[String(offset) as keyof typeof ORBIT_X],
    y: orbitY(offset),
    z: orbitZ(offset),
    scale: 1,
    opacity: selected ? 1 : 0.95,
    rotateX: 0,
    rotateY: 0,
    filter: selected ? 'brightness(1)' : 'brightness(0.94) saturate(0.97)',
  };
  const orbitBehind = {
    x: [
      ORBIT_X[String(previousOffset) as keyof typeof ORBIT_X],
      '-50%',
      '-50%',
      ORBIT_X[String(offset) as keyof typeof ORBIT_X],
    ],
    y: [-66, -82, -82, -66],
    z: [-60, -380, -380, -60],
    scale: [1, 0.7, 0.7, 1],
    opacity: [0.95, 0, 0, 0.95],
    rotateX: [0, 4, 4, 0],
    rotateY: [0, direction * 8, direction * -8, 0],
    filter: [
      'brightness(0.94) saturate(0.97)',
      'brightness(0.52) saturate(0.74)',
      'brightness(0.52) saturate(0.74)',
      'brightness(0.94) saturate(0.97)',
    ],
  };

  return (
    <motion.div
      data-subject-id={subject.id}
      data-subject-slot={offset === 0 ? 'center' : offset < 0 ? 'left' : 'right'}
      className="pointer-events-none absolute bottom-0 left-1/2 flex h-[380px] w-[330px] flex-col items-center justify-end [transform-origin:center_bottom] [transform-style:preserve-3d] [backface-visibility:hidden] sm:h-[400px] sm:w-[365px] lg:h-[420px] lg:w-[390px]"
      initial={
        reduceMotion || !playIntro
          ? false
          : {
              x: ORBIT_X[String(offset) as keyof typeof ORBIT_X],
              y: orbitY(offset),
              z: orbitZ(offset),
              scale: 1,
              opacity: selected ? 1 : 0.95,
              rotateX: 0,
              rotateY: 0,
              filter: selected
                ? 'brightness(1)'
                : 'brightness(0.94) saturate(0.97)',
            }
      }
      animate={wrapsBehind && !reduceMotion ? orbitBehind : target}
      transition={
        reduceMotion
          ? { duration: 0 }
          : wrapsBehind
            ? { duration: 0.5, times: [0, 0.28, 0.62, 1], ease: [0.4, 0, 0.2, 1] }
            : { type: 'spring', stiffness: 210, damping: 26, mass: 0.9 }
      }
      style={{ zIndex: selected ? 20 : wrapsBehind ? 5 : 10 }}
      aria-hidden={!selected}
    >
      <motion.div
        data-testid={selected ? 'onboarding-selected-bubble' : undefined}
        className="absolute left-1/2 z-10"
        initial={
          reduceMotion || !playIntro
            ? false
            : {
                top: selected ? -42 : 42,
                x: '-50%',
                opacity: 0,
                y: -10,
                scale: 0.94,
              }
        }
        animate={{ top: selected ? -42 : 42, x: '-50%', opacity: 1, y: 0, scale: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : playIntro
              ? { duration: 0.42, delay: introDelay + 0.14, ease: [0.22, 1, 0.36, 1] }
              : { type: 'spring', stiffness: 210, damping: 26, mass: 0.9 }
        }
      >
        <SubjectBubble subject={subject} prominent={selected} />
      </motion.div>
      <motion.img
        data-testid={selected ? 'onboarding-selected-character' : undefined}
        layoutId={selected ? `onboarding-character-${subject.id}` : undefined}
        src={subject.asset}
        alt={`${subject.characterName} 캐릭터`}
        width={1312}
        height={1209}
        draggable={false}
        decoding="async"
        fetchPriority={selected ? 'high' : 'auto'}
        className="absolute bottom-0 h-[326px] w-full origin-bottom object-contain sm:h-[348px] lg:h-[365px]"
        initial={
          reduceMotion || !playIntro
            ? false
            : {
                opacity: 0,
                y: selected ? 26 : 34,
                scale: selected ? 0.96 : 0.78,
                filter: 'brightness(0.72) saturate(0.85) blur(4px)',
              }
        }
        animate={{
          opacity: 1,
          y: selected ? -8 : 8,
          scale: selected ? 1.08 : 0.86,
          filter: 'brightness(1) saturate(1) blur(0px)',
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : playIntro
              ? {
                  type: 'spring',
                  stiffness: selected ? 125 : 145,
                  damping: selected ? 20 : 22,
                  mass: selected ? 1.05 : 0.92,
                  delay: introDelay,
                }
              : { type: 'spring', stiffness: 190, damping: 23, mass: 0.9 }
        }
      />
    </motion.div>
  );
}

function SubjectBubble({
  subject,
  prominent = false,
}: {
  subject: SubjectVisual;
  prominent?: boolean;
}) {
  return (
    <div
      className={`relative shrink-0 text-center backdrop-blur-xl ${
        prominent
          ? 'min-w-[152px] rounded-[22px] px-4 py-2.5'
          : 'w-[128px] rounded-[20px] px-3 py-2.5'
      }`}
      style={{
        background: prominent
          ? `linear-gradient(145deg, rgba(255,255,255,0.16) 0%, color-mix(in srgb, ${subject.accent} 14%, transparent) 42%, rgba(3,15,49,0.48) 100%)`
          : 'linear-gradient(145deg, rgba(255,255,255,0.11) 0%, rgba(88,128,205,0.1) 42%, rgba(3,15,49,0.42) 100%)',
        border: `1px solid ${prominent ? `${subject.accent}b8` : 'rgba(183,205,255,0.3)'}`,
        boxShadow: prominent
          ? `0 12px 34px rgba(0,7,35,0.34), 0 0 24px ${subject.accent}30, inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(255,255,255,0.06)`
          : '0 10px 28px rgba(0,7,35,0.26), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(255,255,255,0.05)',
        backdropFilter: 'blur(18px) saturate(145%)',
        WebkitBackdropFilter: 'blur(18px) saturate(145%)',
      }}
    >
      <div
        className={`flex items-center justify-center text-cream/70 ${
          prominent ? 'gap-1.5' : 'gap-1'
        }`}
      >
        {subject.id === 'adsp' ? (
          <BarChart3 size={prominent ? 13 : 10} aria-hidden />
        ) : subject.id === 'sqld' ? (
          <Database size={prominent ? 13 : 10} aria-hidden />
        ) : (
          <Monitor size={prominent ? 13 : 10} aria-hidden />
        )}
        <span className={`kr-body ${prominent ? 'text-[11px]' : 'text-[9px]'}`}>
          {subject.fullLabel}
        </span>
      </div>
      <div className={`kr-heading text-white ${prominent ? 'mt-0.5 text-[24px]' : 'mt-0.5 text-[17px]'}`}>
        {subject.label}
      </div>
      <span
        className="absolute -bottom-[6px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45"
        style={{
          background: prominent
            ? `color-mix(in srgb, ${subject.accent} 10%, rgba(5,18,53,0.72))`
            : 'rgba(18,35,76,0.68)',
          borderBottom: `1px solid ${prominent ? `${subject.accent}b8` : 'rgba(183,205,255,0.3)'}`,
          borderRight: `1px solid ${prominent ? `${subject.accent}b8` : 'rgba(183,205,255,0.3)'}`,
          backdropFilter: 'blur(18px) saturate(145%)',
          WebkitBackdropFilter: 'blur(18px) saturate(145%)',
        }}
        aria-hidden
      />
    </div>
  );
}

function NicknameStep({
  selected,
  value,
  error,
  reduceMotion,
  onChange,
  onNext,
}: {
  selected: SubjectVisual;
  value: string;
  error: string | null;
  reduceMotion: boolean;
  onChange: (value: string) => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      data-testid="onboarding-nickname-step"
      className="absolute inset-0 flex flex-col"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
    >
      <header data-testid="onboarding-nickname-heading" className="mt-5 text-center sm:mt-7">
        <h1 className="kr-heading text-[32px] leading-[1.2] text-white sm:text-[38px]">
          탐험가의 <span style={{ color: selected.accent }}>이름</span>을
          <br />
          지어주세요
        </h1>
        <p className="kr-body mt-3 text-[13px] leading-[1.6] text-cream/72 sm:text-[14px]">
          닉네임은 나중에 프로필에서 바꿀 수 있어요.
        </p>
      </header>

      <motion.div
        className="mt-1 flex h-[390px] flex-none items-center justify-center sm:h-[420px]"
        initial={false}
      >
        <motion.img
          data-testid="onboarding-nickname-character"
          layoutId={`onboarding-character-${selected.id}`}
          src={selected.asset}
          alt={`${selected.characterName} 캐릭터`}
          width={1312}
          height={1209}
          className="h-[330px] w-full max-w-[430px] object-contain sm:h-[372px]"
          transition={{ type: 'spring', stiffness: 190, damping: 23, mass: 0.92 }}
        />
      </motion.div>

      <form
        data-testid="onboarding-nickname-form"
        className="mt-2"
        onSubmit={(event) => {
          event.preventDefault();
          onNext();
        }}
      >
        <label htmlFor="onboarding-nickname" className="sr-only">
          닉네임
        </label>
        <div
          className="relative overflow-hidden rounded-[18px]"
          style={{
            background: 'rgba(4,16,54,0.72)',
            border: `1.5px solid ${error ? '#FB7185' : selected.accent}`,
            boxShadow: `0 0 24px ${error ? 'rgba(251,113,133,0.14)' : `${selected.accent}18`}`,
          }}
        >
          <input
            id="onboarding-nickname"
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value.slice(0, 12))}
            placeholder="닉네임을 입력하세요"
            maxLength={12}
            autoComplete="nickname"
            spellCheck={false}
            className="h-[72px] w-full bg-transparent px-5 pr-20 kr-heading text-[17px] text-white outline-none placeholder:text-cream/42"
          />
          <span className="kr-num absolute right-5 top-1/2 -translate-y-1/2 text-[12px] text-cream/45">
            {value.trim().length} / 12
          </span>
        </div>
        <div className="min-h-[38px] px-1 pt-2">
          {error ? (
            <p className="kr-body text-[12px] text-rose-300" role="alert">
              {error}
            </p>
          ) : (
            <p className="kr-body text-[12px] text-cream/50">
              2~12자, 한글·영문·숫자 사용 가능
            </p>
          )}
        </div>
        <PrimaryButton
          accent={selected.accent}
          type="submit"
          disabled={value.trim().length < 2}
          testId="onboarding-nickname-next"
        >
          시작하기
        </PrimaryButton>
      </form>
    </motion.div>
  );
}

function LoginStep({
  selected,
  authStatus,
  profilePending,
  syncFailed,
  pending,
  error,
  reduceMotion,
  onGoogleLogin,
  onRetrySync,
  onGuestContinue,
}: {
  selected: SubjectVisual;
  authStatus: 'checking' | 'authenticated' | 'unauthenticated';
  profilePending: boolean;
  syncFailed: boolean;
  pending: boolean;
  error: string | null;
  reduceMotion: boolean;
  onGoogleLogin: () => void;
  onRetrySync: () => void;
  onGuestContinue: () => void;
}) {
  const configured = isSupabaseConfigured();
  const waitingForProfile = authStatus === 'authenticated' && profilePending;

  return (
    <motion.div
      data-testid="onboarding-login-step"
      className="absolute inset-0 flex flex-col justify-end"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.34, ease: 'easeOut' }}
    >
      <h1 className="sr-only">Google 계정으로 탐험 기록 연결하기</h1>
      <div
        data-testid="onboarding-login-actions"
        className="relative z-10 mx-auto mb-32 mt-auto w-full sm:mb-36"
      >
        {configured ? (
          <button
            data-testid="onboarding-google-login"
            type="button"
            onClick={onGoogleLogin}
            disabled={pending || authStatus === 'checking' || authStatus === 'authenticated'}
            className="mx-auto flex h-[60px] w-[80%] max-w-[320px] items-center justify-center gap-3 rounded-[22px] bg-white px-5 text-[#102044] shadow-[0_14px_36px_rgba(0,0,0,0.28)] transition active:scale-[0.985] disabled:cursor-wait disabled:opacity-75 sm:h-[66px]"
          >
            {pending || authStatus === 'checking' || waitingForProfile ? (
              <LoaderCircle size={22} className="animate-spin" />
            ) : (
              <GoogleLogo />
            )}
            <span className="kr-heading text-[17px]">
              {waitingForProfile
                ? '프로필 연결 중'
                : authStatus === 'authenticated'
                  ? '로그인 완료'
                  : 'Google로 로그인'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onGuestContinue}
            className="mx-auto flex h-[60px] w-[80%] max-w-[320px] items-center justify-center gap-2 rounded-[22px] px-5 kr-heading text-[17px] text-white transition active:scale-[0.985]"
            style={{
              background: `linear-gradient(135deg, ${selected.accent}, color-mix(in srgb, ${selected.accent} 58%, #173ad6))`,
              boxShadow: `0 14px 36px ${selected.accent}3d`,
            }}
          >
            이 기기에서 시작하기
            <ArrowRight size={19} />
          </button>
        )}

        {syncFailed ? (
          <button
            type="button"
            onClick={onRetrySync}
            className="mt-3 w-full text-center kr-body text-[12px] text-rose-200 underline underline-offset-4"
          >
            프로필 연결 다시 시도
          </button>
        ) : null}
        {error ? (
          <p className="mt-3 text-center kr-body text-[12px] text-rose-300" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-center gap-2 text-cream/52">
          <LockKeyhole size={14} aria-hidden />
          <p className="kr-body text-[12px]">로그인하면 모든 기록이 안전하게 보호돼요.</p>
        </div>

      </div>
    </motion.div>
  );
}

function OnboardingBackdrop({
  step,
  reduceMotion,
}: {
  step: Step;
  reduceMotion: boolean;
}) {
  const isLogin = step === 'login';
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <AnimatePresence>
        <motion.img
          key={isLogin ? 'login-scene' : 'space-background'}
          src={
            isLogin
              ? '/onboarding/login-scene.webp'
              : '/onboarding/space-background-user.webp'
          }
          alt=""
          initial={reduceMotion ? false : { opacity: 0, scale: 1.035 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      </AnimatePresence>
      {isLogin ? (
        <div
          className="absolute inset-x-0 bottom-0 h-[43%]"
          style={{
            background:
              'linear-gradient(180deg, rgba(1,8,40,0) 0%, rgba(1,8,40,0.97) 34%, #010828 58%, #010828 100%)',
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(1,8,40,0.16) 0%, rgba(1,8,40,0.28) 42%, rgba(1,8,40,0.72) 100%)',
          }}
        />
      )}
    </div>
  );
}

function OnboardingTopBar({
  active,
  reduceMotion,
  onBack,
}: {
  active: number;
  reduceMotion: boolean;
  onBack: () => void;
}) {
  return (
    <motion.div
      className="relative z-30 flex h-10 shrink-0 items-center justify-center"
      initial={reduceMotion ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.44, delay: 0.02, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        type="button"
        onClick={onBack}
        className="absolute left-0 inline-flex h-10 items-center gap-1 text-cream/90 transition active:scale-95"
        aria-label="이전 화면"
        initial={reduceMotion ? false : { opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
      >
        <ArrowLeft size={20} />
        <span className="kr-body text-[14px]">뒤로</span>
      </motion.button>
      <div
        className="flex h-2.5 items-center justify-center gap-2"
        role="progressbar"
        aria-label="온보딩 진행 단계"
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuenow={active + 1}
      >
        {[0, 1, 2].map((index) => {
          const isActive = index === active;
          return (
            <motion.span
            key={index}
            data-testid={isActive ? 'onboarding-progress-light' : undefined}
            className="block h-2.5 rounded-full"
            initial={false}
            animate={{
              width: isActive ? 28 : 10,
              background: isActive ? '#5DAEFF' : 'rgba(239,244,255,0.18)',
            }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 260, damping: 25, mass: 0.72 }
            }
          />
          );
        })}
      </div>
    </motion.div>
  );
}

function PrimaryButton({
  accent,
  children,
  onClick,
  type = 'button',
  disabled = false,
  testId,
}: {
  accent: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  testId?: string;
}) {
  return (
    <button
      data-testid={testId}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="mt-5 inline-flex h-[64px] w-full items-center justify-center gap-2 rounded-[22px] px-5 kr-heading text-[18px] text-white transition active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 82%, white) 0%, ${accent} 46%, color-mix(in srgb, ${accent} 58%, #173ad6) 100%)`,
        boxShadow: `0 14px 38px ${accent}59, inset 0 1px 0 rgba(255,255,255,0.48), inset 0 -3px 8px rgba(10,24,78,0.24)`,
      }}
    >
      {children}
      <ArrowRight size={20} strokeWidth={2.6} />
    </button>
  );
}

function GoogleLogo() {
  return (
    <svg width="23" height="23" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}
