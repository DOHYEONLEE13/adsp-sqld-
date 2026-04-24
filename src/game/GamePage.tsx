/**
 * GamePage — 게임 섹션의 루트.
 * 내부 화면 간 네비게이션은 해시가 아닌 상태 머신으로 처리합니다.
 */

import { useState } from 'react';
import type { Subject } from '@/types/question';
import type { FlowMode, GameScreen, QuestSummary } from './types';
import {
  createDailyMissionSession,
  createMockExamSession,
  createSession,
  isSessionDone,
  recordAnswer,
  summarize,
  type SamplingMode,
} from './session';
import { markDailyMissionStarted, recordSessionSummary } from './storage';
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

interface Props {
  /** 랜딩으로 빠져나가는 훅. 해시에서 `#/` 로 복귀시킵니다. */
  onExitToLanding: () => void;
}

export default function GamePage({ onExitToLanding }: Props) {
  const [screen, setScreen] = useState<GameScreen>({ kind: 'galaxy' });

  /** 일반 세션 시작. */
  const startSession = (
    subject: Subject,
    chapter: number,
    topic: string | null,
    sampling: SamplingMode = 'random',
    flow: FlowMode = 'play',
  ) => {
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
      flowLabelMap[flow] ||
      labelMap[sampling] ||
      undefined;
    const session = createSession({
      subject,
      chapter,
      topic,
      sampling,
      flow,
      label,
    });
    if (!session) return;
    setScreen({ kind: 'quest', session });
  };

  /** Daily Mission 시작. */
  const startDailyMission = (subject: Subject) => {
    const session = createDailyMissionSession(subject);
    if (!session) return;
    markDailyMissionStarted();
    setScreen({ kind: 'quest', session });
  };

  /** 모의고사 — 과목 전체에서 50문항 랜덤 + 시험 모드(타이머·피드백 숨김). */
  const startMockExam = (subject: Subject) => {
    const session = createMockExamSession(subject);
    if (!session) return;
    setScreen({ kind: 'quest', session });
  };

  /** 복습 세션 — SRS due · 오답 · 약점 혼합 15문항. */
  const startReview = (subject: Subject) => {
    const session = createReviewSession(subject, 15);
    if (!session) return;
    setScreen({ kind: 'quest', session });
  };

  // 세션이 끝날 때 딱 한 번 저장소에 반영한 뒤 result 로 전이.
  const finalizeSession = (summary: QuestSummary) => {
    recordSessionSummary(summary);
    setScreen({ kind: 'result', summary });
  };

  switch (screen.kind) {
    case 'galaxy':
      return (
        <GalaxyScreen
          onSelectSubject={(subject) => setScreen({ kind: 'planet', subject })}
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
          onBack={() => setScreen({ kind: 'galaxy' })}
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
            )
          }
          onSelectTopic={(topic) =>
            setScreen({
              kind: 'lesson',
              subject: screen.subject,
              chapter: screen.chapter,
              topic,
            })
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
      return (
        <Cmp
          subject={screen.subject}
          chapter={screen.chapter}
          topic={screen.topic}
          onFinishGoToPractice={() =>
            startSession(
              screen.subject,
              screen.chapter,
              screen.topic,
              'random',
              'play',
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
}
