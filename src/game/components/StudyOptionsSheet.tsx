import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Flame,
  RefreshCcw,
  Repeat2,
  Search,
  Settings2,
  X,
} from 'lucide-react';
import type { Subject } from '@/types/question';
import type {
  ConceptSearchResult,
  ReviewConceptResult,
} from '../conceptSearch';
import {
  getSettingsDrawerOpen,
  subscribeSettingsDrawer,
} from '@/lib/settingsDrawer';
import ConceptSearchField from './ConceptSearchField';
import LiquidMetalOrbButton from './LiquidMetalOrbButton';

interface Props {
  open: boolean;
  accent: string;
  reviewConcepts: ReviewConceptResult[];
  selectedPass: number;
  subject: Subject;
  chapter: number;
  onOpen: () => void;
  onClose: () => void;
  onSelectPass: (pass: number) => void;
  onWeakness: () => void;
  onSelectConcept: (result: ConceptSearchResult) => void;
}

interface StudyOption {
  id: string;
  label: string;
  meta?: string;
  color: string;
  icon: ReactNode;
  selected?: boolean;
  toggleState?: 'learn' | 'review';
  disabled?: boolean;
  onClick: () => void;
}

export default function StudyOptionsSheet({
  open,
  accent,
  reviewConcepts,
  selectedPass,
  subject,
  chapter,
  onOpen,
  onClose,
  onSelectPass,
  onWeakness,
  onSelectConcept,
}: Props) {
  const reduceMotion = useReducedMotion();
  const settingsDrawerOpen = useSyncExternalStore(
    subscribeSettingsDrawer,
    getSettingsDrawerOpen,
    () => false,
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearchOpen(false);
      setReviewOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (settingsDrawerOpen && open) onClose();
  }, [settingsDrawerOpen, open, onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const routeLayer = document.querySelector<HTMLElement>('.questdp-route-layer');
    const previousRouteOverflow = routeLayer?.style.overflow;
    document.body.style.overflow = 'hidden';
    if (routeLayer) routeLayer.style.overflow = 'hidden';

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
      if (routeLayer) routeLayer.style.overflow = previousRouteOverflow ?? '';
    };
  }, [open, onClose]);

  const runAndClose = (callback: () => void) => {
    onClose();
    callback();
  };

  const isReviewPass = selectedPass === 2;
  const reviewAccent = subject === 'adsp' ? '#38bdf8' : '#8b5cf6';
  const wrongQuestionCount = reviewConcepts.reduce(
    (sum, concept) => sum + concept.wrongCount,
    0,
  );
  const passModeOption: StudyOption = {
    id: 'pass-mode',
    label: isReviewPass ? '복습 모드' : '처음 학습',
    meta: isReviewPass
      ? '처음 학습으로 전환'
      : '복습 모드로 전환',
    color: isReviewPass ? reviewAccent : '#f59e0b',
    icon: isReviewPass ? (
      <Repeat2 size={19} strokeWidth={2.4} />
    ) : (
      <BookOpen size={19} strokeWidth={2.4} />
    ),
    selected: true,
    toggleState: isReviewPass ? 'review' : 'learn',
    onClick: () => {
      onSelectPass(isReviewPass ? 1 : 2);
    },
  };

  const options: StudyOption[] = [
    passModeOption,
    {
      id: 'weakness',
      label: '약점 집중',
      color: '#f87171',
      icon: <Flame size={19} strokeWidth={2.35} />,
      onClick: () => runAndClose(onWeakness),
    },
    {
      id: 'review',
      label: '오답 복습',
      meta:
        reviewConcepts.length > 0
          ? `${reviewConcepts.length}개 개념`
          : '오답 없음',
      color: '#a3e635',
      icon: <RefreshCcw size={19} strokeWidth={2.35} />,
      disabled: reviewConcepts.length === 0,
      onClick: () => {
        if (reviewConcepts.length > 0) setReviewOpen(true);
      },
    },
    {
      id: 'search',
      label: '개념 검색',
      meta: '현재 챕터',
      color: accent,
      icon: <Search size={19} strokeWidth={2.4} />,
      onClick: () => setSearchOpen(true),
    },
  ];

  if (typeof document === 'undefined' || settingsDrawerOpen) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {open ? (
          <motion.button
            type="button"
            aria-label="학습 옵션 닫기"
            className="fixed inset-0 z-[120] cursor-default bg-[#010828]/38 backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={onClose}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {open && reviewOpen ? (
          <motion.section
            key="wrong-concepts"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wrong-concepts-title"
            className="fixed inset-x-4 z-[135] ml-auto w-[min(390px,calc(100vw-32px))] overflow-hidden rounded-[24px] border border-white/14 bg-[#071536]/78 text-cream shadow-[0_24px_70px_rgba(1,8,40,0.58),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl md:right-6 md:left-auto"
            style={{
              bottom: 'calc(148px + env(safe-area-inset-bottom))',
              borderColor: `color-mix(in srgb, ${accent} 30%, rgba(255,255,255,0.14))`,
            }}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
              <button
                type="button"
                aria-label="학습 옵션으로 돌아가기"
                onClick={() => setReviewOpen(false)}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.055] text-cream/78 transition hover:bg-white/10 active:scale-95"
              >
                <ArrowLeft size={17} strokeWidth={2.4} />
              </button>
              <div className="min-w-0 flex-1">
                <h2 id="wrong-concepts-title" className="kr-heading text-[15px] text-cream">
                  오답 개념
                </h2>
                <p className="kr-body mt-0.5 text-[10.5px] text-cream/52">
                  최근 오답 {wrongQuestionCount}문제 · 개념을 눌러 다시 보기
                </p>
              </div>
              <span
                className="kr-num inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px]"
                style={{
                  color: '#a3e635',
                  borderColor: 'rgba(163,230,53,0.28)',
                  background: 'rgba(163,230,53,0.08)',
                }}
              >
                {reviewConcepts.length}개
              </span>
            </header>

            <ul className="max-h-[min(48vh,390px)] space-y-2 overflow-y-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {reviewConcepts.map((concept) => (
                <li key={concept.stepId}>
                  <button
                    type="button"
                    onClick={() => runAndClose(() => onSelectConcept(concept))}
                    className="group flex w-full items-center gap-3 rounded-[17px] border border-white/10 bg-white/[0.045] px-3.5 py-3 text-left transition hover:border-white/18 hover:bg-white/[0.075] active:scale-[0.985]"
                  >
                    <span
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border"
                      style={{
                        color: '#a3e635',
                        borderColor: 'rgba(163,230,53,0.26)',
                        background:
                          'radial-gradient(circle at 32% 22%, rgba(255,255,255,0.16), transparent 36%), rgba(163,230,53,0.08)',
                      }}
                    >
                      <RefreshCcw size={17} strokeWidth={2.45} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="kr-heading block truncate text-[13px] text-cream">
                        {concept.title}
                      </span>
                      <span className="kr-body mt-1 flex items-center gap-2 text-[10.5px] text-cream/52">
                        <span className="truncate">{concept.topic}</span>
                        <span className="shrink-0 text-[#a3e635]/80">
                          오답 {concept.wrongCount}회
                        </span>
                      </span>
                    </span>
                    <ChevronRight
                      size={17}
                      strokeWidth={2.35}
                      className="shrink-0 text-cream/38 transition group-hover:translate-x-0.5 group-hover:text-cream/70"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </motion.section>
        ) : open && searchOpen ? (
          <motion.div
            key="concept-search"
            className="fixed inset-x-4 z-[135] ml-auto w-[min(390px,calc(100vw-32px))] md:right-6 md:left-auto"
            style={{ bottom: 'calc(150px + env(safe-area-inset-bottom))' }}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <ConceptSearchField
              subject={subject}
              chapter={chapter}
              accent={accent}
              floating
              autoFocus
              onSelect={(result) => runAndClose(() => onSelectConcept(result))}
            />
          </motion.div>
        ) : open ? (
          <motion.div
            key="study-options"
            role="menu"
            aria-label="학습 옵션"
            className="fixed right-4 z-[135] flex flex-col-reverse gap-2.5 md:right-6"
            style={{ bottom: 'calc(148px + env(safe-area-inset-bottom))' }}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {options.map((option, index) => (
              <motion.div
                key={option.id}
                className="flex items-center justify-end gap-2.5"
                variants={{
                  closed: {
                    opacity: 0,
                    y: reduceMotion ? 0 : 24,
                    scale: reduceMotion ? 1 : 0.72,
                  },
                  open: {
                    opacity: option.disabled ? 0.42 : 1,
                    y: 0,
                    scale: 1,
                  },
                }}
                transition={{
                  duration: reduceMotion ? 0 : 0.28,
                  delay: reduceMotion ? 0 : index * 0.045,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="text-right drop-shadow-[0_2px_8px_rgba(1,8,40,0.95)]">
                  <div className="kr-heading whitespace-nowrap text-[12px] text-cream">
                    {option.label}
                  </div>
                  {option.meta ? (
                    <div className="kr-num mt-0.5 whitespace-nowrap text-[9px] text-cream/52">
                      {option.meta}
                    </div>
                  ) : null}
                </div>
                <LiquidMetalOrbButton
                  role="menuitem"
                  aria-label={`${option.label}${option.meta ? `, ${option.meta}` : ''}`}
                  aria-disabled={option.disabled || undefined}
                  disabled={option.disabled}
                  onClick={option.onClick}
                  accent={option.color}
                  selected={option.selected}
                  className={option.toggleState ? 'liquid-metal-control--toggle' : ''}
                >
                  {option.icon}
                  {option.toggleState ? (
                    <span className="absolute bottom-[6px] left-1/2 h-[5px] w-[20px] -translate-x-1/2 rounded-full bg-white/12">
                      <motion.span
                        className="absolute top-0 size-[5px] rounded-full"
                        style={{ background: option.color }}
                        animate={{ x: option.toggleState === 'review' ? 15 : 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.22 }}
                      />
                    </span>
                  ) : null}
                </LiquidMetalOrbButton>
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <LiquidMetalOrbButton
        onClick={open ? onClose : onOpen}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          open
            ? '학습 옵션 닫기'
            : `학습 옵션 열기, 현재 ${isReviewPass ? '복습 모드' : '처음 학습'}`
        }
        accent={accent}
        selected={open}
        size={54}
        className="fixed right-4 z-[140] md:right-6"
        style={{
          position: 'fixed',
          bottom: 'calc(84px + env(safe-area-inset-bottom))',
        }}
        title="학습 옵션"
      >
        <motion.span
          animate={{ rotate: open && !reduceMotion ? 90 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.24 }}
          className="inline-flex"
          style={{ color: accent }}
        >
          {open ? <X size={21} strokeWidth={2.4} /> : <Settings2 size={21} strokeWidth={2.4} />}
        </motion.span>
      </LiquidMetalOrbButton>
    </>,
    document.body,
  );
}
