/**
 * GamePage — 게임 섹션의 루트.
 * 내부 화면 간 네비게이션은 해시가 아닌 상태 머신으로 처리합니다.
 */

import { useEffect, useState } from 'react';
import type { Subject } from '@/types/question';
import type { FlowMode, GameScreen, QuestSummary } from './types';
import {
  createDailyMissionSession,
  createMockExamSession,
  createReviewFromIds,
  createSession,
  isSessionDone,
  recordAnswer,
  summarize,
  type SamplingMode,
} from './session';
import {
  clearActiveSubject,
  markDailyMissionStarted,
  recordSessionSummary,
  setActiveSubject,
} from './storage';
import { passNumberFor } from './studyMode';
import GalaxyScreen from './screens/GalaxyScreen';
import PlanetScreen from './screens/PlanetScreen';
import ZoneScreen, { type StartParams } from './screens/ZoneScreen';
import LessonScreen from './screens/LessonScreen';
import DialogueLesson from './lesson/DialogueLesson';
import { getLesson } from '@/data/lessons';
import QuestScreen from './screens/QuestScreen';
import ResultScreen from './screens/ResultScreen';
import ReviewPage from './ReviewPage';
import { createReviewSession } from './review';
import { consumeEnergy } from './energy';
import EnergyBlockModal from './components/EnergyBlockModal';
import { isStepLocked, stepKey, unlockStepOnServer } from './stepUnlocks';
import { useStepUnlocks } from './stepUnlocks';
import { isFinaleStep, isFinaleStepLocked } from './finale';
import { useProgress } from './useProgress';
import { useDevUnlockFlags } from './useDevUnlockFlags';
import { tryRecordPassCompletion } from './passSync';

interface Props {
  /**
   * 딥링크로 진입한 시작 과목. 주어지면 galaxy chooser 를 건너뛰고 바로
   * 해당 과목의 Planet 화면으로 시작. 랜딩의 ADSP/SQLD 카드에서 옴.
   */
  initialSubject?: Subject;
  /** 랜딩으로 빠져나가는 훅. 해시에서 `#/` 로 복귀시킵니다. */
  onExitToLanding: () => void;
}

/**
 * 다른 화면 (StatsPage / PlanetScreen 의 북마크 카드) 에서 점프 요청을 보낸
 * 경우 sessionStorage 에 기록된 deep-link 를 한 번 소비. 마운트 시 GameScreen
 * 초기값을 lesson 으로 덮음.
 */
interface PendingConceptOpen {
  subject: Subject;
  chapter: number;
  topic: string;
  stepIdx: number;
  stepId: string;
}
function consumePendingConceptOpen(): PendingConceptOpen | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem('questdp.pendingConceptOpen');
    if (!raw) return null;
    window.sessionStorage.removeItem('questdp.pendingConceptOpen');
    return JSON.parse(raw) as PendingConceptOpen;
  } catch {
    return null;
  }
}

export default function GamePage({ initialSubject, onExitToLanding }: Props) {
  const [screen, setScreen] = useState<GameScreen>(() => {
    const pending = consumePendingConceptOpen();
    if (pending && pending.subject === initialSubject) {
      return {
        kind: 'lesson',
        subject: pending.subject,
        chapter: pending.chapter,
        topic: pending.topic,
        stepIdx: pending.stepIdx,
        passNumber: 1,
      };
    }
    return initialSubject
      ? { kind: 'planet', subject: initialSubject }
      : { kind: 'galaxy' };
  });
  const [energyBlock, setEnergyBlock] = useState<{ retryAfterSec: number } | null>(
    null,
  );
  const [lockToast, setLockToast] = useState<string | null>(null);
  const stepLockSnap = useStepUnlocks();
  const progress = useProgress();
  // dev unlock 토글 변경 시 즉시 재렌더 — onSelectStep 의 잠금 검사에 즉시 반영.
  // 반환값은 사용하지 않고 단지 hook 구독으로 hook 변화 시 컴포넌트 재렌더만 유도.
  useDevUnlockFlags();

  /**
   * 에너지 1 차감 후 callback. 게스트·프리미엄·env 미설정 = 무조건 진행.
   * 무료 인증 사용자가 0 일 때만 차단 모달.
   */
  const gateEnergy = async (proceed: () => void) => {
    const result = await consumeEnergy(1);
    if (result.ok) {
      proceed();
    } else {
      setEnergyBlock({ retryAfterSec: result.retryAfterSec });
    }
  };

  // initialSubject 가 있으면 그 과목을 active 로 영속화 — 다음 #/game 진입 시
  // 자동 redirect 되도록. 마운트 시 한 번 (idempotent).
  useEffect(() => {
    if (initialSubject) setActiveSubject(initialSubject);
  }, [initialSubject]);

  /** 과목을 active 로 잠그고 planet 으로 전환 (chooser 에서 호출). */
  const goToPlanet = (subject: Subject) => {
    setActiveSubject(subject);
    setScreen({ kind: 'planet', subject });
  };

  /** 일반 세션 시작. ⚡ 1 소모. */
  const startSession = (
    subject: Subject,
    chapter: number,
    topic: string | null,
    sampling: SamplingMode = 'random',
    flow: FlowMode = 'play',
    size?: number,
    explicitLabel?: string,
    /**
     * 명시 안 하면 사용자의 학습 모드 (studyMode) 기반 자동 결정:
     *   - 'review' (복습용) → 2 (변형 문제 우선)
     *   - 그 외 / 미설정     → 1
     * 호출측이 명시적으로 회독 차수를 지정하면 그대로 사용.
     */
    passNumber: number = passNumberFor(subject),
  ) => {
    void gateEnergy(() => {
      const labelMap: Record<string, string> = {
        weakness: '약점 집중',
        review: '오답 복습',
      };
      const flowLabelMap: Record<FlowMode, string> = {
        play: '',
        learn: '학습 모드',
        test: '시험 모드',
      };
      const label =
        explicitLabel ||
        flowLabelMap[flow] ||
        labelMap[sampling] ||
        undefined;
      const session = createSession({
        subject,
        chapter,
        topic,
        sampling,
        flow,
        size,
        label,
        passNumber,
      });
      if (!session) return;
      setScreen({ kind: 'quest', session });
    });
  };

  /** Daily Mission 시작. ⚡ 1 소모. */
  const startDailyMission = (subject: Subject) => {
    void gateEnergy(() => {
      const session = createDailyMissionSession(subject);
      if (!session) return;
      markDailyMissionStarted();
      setScreen({ kind: 'quest', session });
    });
  };

  /** 모의고사 — 과목 전체에서 50문항 랜덤 + 시험 모드. ⚡ 1 소모. */
  const startMockExam = (subject: Subject) => {
    void gateEnergy(() => {
      const session = createMockExamSession(subject);
      if (!session) return;
      setScreen({ kind: 'quest', session });
    });
  };

  /** 복습 세션 — SRS due · 오답 · 약점 혼합 15문항. ⚡ 1 소모. */
  const startReview = (subject: Subject) => {
    void gateEnergy(() => {
      const session = createReviewSession(subject, 15);
      if (!session) return;
      setScreen({ kind: 'quest', session });
    });
  };

  /** 모의고사 오답 복습 — 특정 문항 ID 만으로 학습 모드 세션. ⚡ 1 소모. */
  const startReviewFromIds = (
    subject: Subject,
    chapter: number,
    questionIds: string[],
    label: string,
  ) => {
    void gateEnergy(() => {
      const session = createReviewFromIds({
        subject,
        chapter,
        questionIds,
        flow: 'learn',
        label,
      });
      if (!session) return;
      setScreen({ kind: 'quest', session });
    });
  };

  // 세션이 끝날 때 딱 한 번 저장소에 반영한 뒤 result 로 전이.
  // 추가: pass 시스템 — 챕터 단위 75% 도달했는지 서버에 검사 요청 (fire-and-forget).
  //      서버가 stamp 발급하면 channel 으로 자동 반영. 미인증·미적용 환경 = no-op.
  const finalizeSession = (summary: QuestSummary) => {
    recordSessionSummary(summary);
    void tryRecordPassCompletion(
      summary.subject,
      summary.chapter,
      summary.passNumber ?? 1,
    );
    setScreen({ kind: 'result', summary });
  };

  const renderScreen = () => {
    switch (screen.kind) {
    case 'galaxy':
      return (
        <GalaxyScreen
          onSelectSubject={goToPlanet}
          onStartDailyMission={startDailyMission}
          onStartMockExam={startMockExam}
          onOpenReview={() => setScreen({ kind: 'review' })}
          onExit={onExitToLanding}
        />
      );

    case 'review':
      return (
        <ReviewPage
          onStartSession={startReview}
          onExit={() => setScreen({ kind: 'galaxy' })}
        />
      );

    case 'planet':
      return (
        <PlanetScreen
          subject={screen.subject}
          onSelectChapter={(chapter) =>
            setScreen({ kind: 'zone', subject: screen.subject, chapter })
          }
          onBack={() => {
            // "다른 과목" 의미 — activeSubject 해제해서 chooser 가 다시 노출되게.
            // 새로고침 시에도 chooser 로 떨어지도록 URL 도 정리.
            clearActiveSubject();
            if (/^#\/game\/(adsp|sqld)/.test(window.location.hash)) {
              window.location.hash = '/game';
            } else {
              setScreen({ kind: 'galaxy' });
            }
          }}
        />
      );

    case 'zone':
      return (
        <ZoneScreen
          subject={screen.subject}
          chapter={screen.chapter}
          onStart={(p: StartParams) =>
            startSession(
              screen.subject,
              screen.chapter,
              p.topic,
              p.sampling,
              p.flow,
              p.size,
              p.label,
              p.passNumber,
            )
          }
          onSelectStep={(topic, stepIdx, passNumber) => {
            // lessonId 는 lesson lookup 으로. 잠금 검사 + 다음 step 자동 해금.
            const lesson = getLesson(screen.subject, screen.chapter, topic);
            const lessonId = lesson?.id ?? `${screen.subject}-${screen.chapter}`;
            const targetStep = lesson?.steps[stepIdx];
            // finale step 은 절대 잠금 (subject 완주 + admin 검수 모드만 우회).
            if (
              targetStep &&
              isFinaleStep(targetStep) &&
              isFinaleStepLocked(progress, targetStep)
            ) {
              setLockToast(
                '모든 step 클리어 후 열려요. 마무리는 끝까지 와야 보이는 한 마디!',
              );
              window.setTimeout(() => setLockToast(null), 2800);
              return;
            }
            if (isStepLocked(stepLockSnap, lessonId, stepIdx)) {
              setLockToast('앞 단계를 먼저 풀이하면 자동 해금돼요.');
              window.setTimeout(() => setLockToast(null), 2400);
              return;
            }
            // 진입한 step 의 다음 step 을 자동 해금 (서버 RPC, fire-and-forget)
            if (lesson && stepIdx + 1 < lesson.steps.length) {
              void unlockStepOnServer(stepKey(lessonId, stepIdx + 1));
            }
            setScreen({
              kind: 'lesson',
              subject: screen.subject,
              chapter: screen.chapter,
              topic,
              stepIdx,
              passNumber,
            });
          }}
          onReviewIds={(p) =>
            startReviewFromIds(
              screen.subject,
              screen.chapter,
              p.questionIds,
              p.label,
            )
          }
          onBack={() =>
            setScreen({ kind: 'planet', subject: screen.subject })
          }
        />
      );

    case 'lesson': {
      // 첫 스텝에 dialogue 가 있으면 듀오링고식 대화 레슨, 아니면 기존 LessonScreen.
      // PR 5b 에서 챕터 1 앞부분부터 점진적으로 dialogue[] 채워넣음.
      const _lesson = getLesson(screen.subject, screen.chapter, screen.topic);
      const useDialogue = !!_lesson?.steps[0]?.dialogue?.length;
      const Cmp = useDialogue ? DialogueLesson : LessonScreen;
      const initialStepIdx = screen.stepIdx;
      return (
        <Cmp
          subject={screen.subject}
          chapter={screen.chapter}
          topic={screen.topic}
          initialStepIdx={initialStepIdx}
          passNumber={screen.passNumber ?? 1}
          onFinishGoToPractice={() =>
            startSession(
              screen.subject,
              screen.chapter,
              screen.topic,
              'random',
              'play',
              undefined,
              undefined,
              screen.passNumber ?? 1,
            )
          }
          onBack={() =>
            setScreen({
              kind: 'zone',
              subject: screen.subject,
              chapter: screen.chapter,
            })
          }
        />
      );
    }

    case 'quest':
      return (
        <QuestScreen
          session={screen.session}
          onAnswer={(chosen) => {
            const next = recordAnswer(screen.session, chosen);
            if (isSessionDone(next)) {
              finalizeSession(summarize(next));
            } else {
              setScreen({ kind: 'quest', session: next });
            }
          }}
          onFinish={() => finalizeSession(summarize(screen.session))}
          onAbort={() => {
            // 세션 중단 — 진행 이력을 버리고 해당 챕터의 Zone 화면으로 복귀
            // (Daily Mission 처럼 chapter 가 대표값인 경우에도 유효한 행성이 됨).
            setScreen({
              kind: 'zone',
              subject: screen.session.subject,
              chapter: screen.session.chapter,
            });
          }}
        />
      );

    case 'result':
      return (
        <ResultScreen
          summary={screen.summary}
          onReplay={() =>
            startSession(
              screen.summary.subject,
              screen.summary.chapter,
              screen.summary.topic,
            )
          }
          onPickAnotherZone={() =>
            setScreen({
              kind: 'zone',
              subject: screen.summary.subject,
              chapter: screen.summary.chapter,
            })
          }
          onBackToGalaxy={() => setScreen({ kind: 'galaxy' })}
        />
      );
    }
  };

  return (
    <>
      {renderScreen()}
      {energyBlock ? (
        <EnergyBlockModal
          retryAfterSec={energyBlock.retryAfterSec}
          onClose={() => setEnergyBlock(null)}
        />
      ) : null}
      {lockToast ? (
        <div
          role="status"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-full kr-num text-[12px] pointer-events-none"
          style={{
            background: 'rgba(20,32,46,0.96)',
            color: 'var(--cream)',
            border: '1px solid rgba(167,139,250,0.5)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
          }}
        >
          🔒 {lockToast}
        </div>
      ) : null}
    </>
  );
}
