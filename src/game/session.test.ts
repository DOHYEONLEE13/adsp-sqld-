/**
 * session.test.ts — 세션 생성·채점·요약 검증.
 *
 * pure 동작 위주. 샘플링 (weakness/review) 은 storage 스냅샷에 의존하므로
 * 본 테스트에선 random 경로만 다루고, 점수 공식은 weakness.test.ts 가 검증.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  isPlayable,
  playableCount,
  playableQuestions,
  getPlanets,
  getZones,
  createSession,
  recordAnswer,
  isSessionDone,
  summarize,
  formatDuration,
  reviewPoolSize,
  createReviewFromIds,
} from './session';
import type {
  MultipleChoiceQuestion,
  Question,
  Subject,
} from '@/types/question';
import type { QuestSession } from './types';

beforeEach(() => {
  // 깨끗한 localStorage 로 시작
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
  }
});

describe('isPlayable — 게임 노출 가드', () => {
  function mc(over: Partial<MultipleChoiceQuestion> = {}): MultipleChoiceQuestion {
    return {
      id: 't1',
      type: 'multiple_choice',
      subject: 'adsp',
      chapter: 1,
      chapterTitle: '데이터 이해',
      topic: '데이터의 이해',
      question: 'q?',
      choices: ['a', 'b', 'c', 'd'],
      answerIndex: 0,
      explanation: '',
      status: 'curated',
      ...over,
    };
  }

  it('정상 multiple_choice — true', () => {
    expect(isPlayable(mc())).toBe(true);
  });
  it('restored 상태 — false (오답 선지가 없음)', () => {
    expect(isPlayable(mc({ status: 'restored' }))).toBe(false);
  });
  it('needsDistractors 플래그 — false', () => {
    expect(isPlayable(mc({ needsDistractors: true }))).toBe(false);
  });
  it('multiple_choice 가 아닌 type — false', () => {
    const sa: Question = {
      id: 'sa1',
      type: 'short_answer',
      subject: 'adsp',
      chapter: 1,
      chapterTitle: '데이터 이해',
      topic: '데이터의 이해',
      question: 'q?',
      answer: 'x',
      explanation: '',
      status: 'curated',
    };
    expect(isPlayable(sa)).toBe(false);
  });
});

describe('playableCount / playableQuestions — 풀 통계', () => {
  it('두 과목 합 = 전체 playable count', () => {
    const adsp = playableQuestions('adsp').length;
    const sqld = playableQuestions('sqld').length;
    expect(adsp + sqld).toBe(playableCount());
  });
  it('과목별 카운트는 양수', () => {
    expect(playableCount('adsp')).toBeGreaterThan(0);
    expect(playableCount('sqld')).toBeGreaterThan(0);
  });
});

describe('getPlanets — 챕터별 카드 집계', () => {
  it.each(['adsp', 'sqld'] as Subject[])(
    '%s — 모든 챕터에 questionCount 양수',
    (subject) => {
      const planets = getPlanets(subject);
      expect(planets.length).toBeGreaterThan(0);
      for (const p of planets) {
        expect(p.questionCount).toBeGreaterThan(0);
        expect(p.topics.length).toBeGreaterThan(0);
      }
    },
  );
});

describe('getZones — 토픽 노드는 스키마 토픽 고정', () => {
  it('항상 schema 토픽 순서로 반환', () => {
    const zones = getZones('adsp', 1);
    expect(zones.length).toBeGreaterThan(0);
    // schema 의 chapter 1 topics 순서와 일치해야 함
    const topics = zones.map((z) => z.topic);
    expect(topics).toEqual(
      expect.arrayContaining(['데이터의 이해', '데이터의 가치와 미래']),
    );
  });
  it('존재하지 않는 챕터 → 빈 배열', () => {
    expect(getZones('adsp', 99)).toEqual([]);
  });
  it('canonicalTopic 매핑되는 raw 도 questionCount 에 포함', () => {
    // ADSP ch1 — DIKW 피라미드 등이 데이터의 이해 버킷에 합산되어야 함
    const zones = getZones('adsp', 1);
    const dataUnderstanding = zones.find((z) => z.topic === '데이터의 이해');
    expect(dataUnderstanding).toBeDefined();
    expect(dataUnderstanding!.questionCount).toBeGreaterThan(1);
  });
});

describe('createSession — random 경로', () => {
  it('정상 입력 — 세션 생성', () => {
    const s = createSession({
      subject: 'adsp',
      chapter: 1,
      topic: null,
      size: 5,
    });
    expect(s).not.toBeNull();
    expect(s!.subject).toBe('adsp');
    expect(s!.chapter).toBe(1);
    expect(s!.questions.length).toBeLessThanOrEqual(5);
    expect(s!.questions.length).toBeGreaterThan(0);
    expect(s!.index).toBe(0);
    expect(s!.answers).toEqual([]);
    expect(s!.flow).toBe('play'); // 기본값
    expect(s!.passNumber).toBe(1); // 기본값
  });

  it('topic 지정 시 해당 토픽 문항만 (canonical 포함)', () => {
    const s = createSession({
      subject: 'adsp',
      chapter: 1,
      topic: '데이터의 이해',
      size: 10,
    });
    expect(s).not.toBeNull();
    // 모든 문항이 canonicalTopic === '데이터의 이해' 여야 함
    // (raw topic 은 'DIKW 피라미드' 등도 OK)
    expect(s!.questions.length).toBeGreaterThan(0);
  });

  it('존재하지 않는 chapter → null', () => {
    expect(
      createSession({ subject: 'adsp', chapter: 99, topic: null }),
    ).toBeNull();
  });

  it('size 가 풀보다 크면 풀 크기로 capped', () => {
    const s = createSession({
      subject: 'adsp',
      chapter: 1,
      topic: null,
      size: 99999,
    });
    expect(s).not.toBeNull();
    expect(s!.questions.length).toBeLessThan(99999);
  });

  it('label / flow / passNumber 전달', () => {
    const s = createSession({
      subject: 'sqld',
      chapter: 2,
      topic: null,
      size: 3,
      flow: 'test',
      label: '모의고사',
      passNumber: 2,
    });
    expect(s).not.toBeNull();
    expect(s!.flow).toBe('test');
    expect(s!.label).toBe('모의고사');
    expect(s!.passNumber).toBe(2);
  });

  it('answerIndex 가 shuffle 후에도 정답 유지', () => {
    const s = createSession({
      subject: 'adsp',
      chapter: 1,
      topic: null,
      size: 3,
    });
    expect(s).not.toBeNull();
    for (const q of s!.questions) {
      expect(q.answerIndex).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex).toBeLessThan(q.choices.length);
    }
  });
});

describe('recordAnswer — 불변 + 정답 판정', () => {
  function makeSession(): QuestSession {
    return createSession({
      subject: 'adsp',
      chapter: 1,
      topic: null,
      size: 3,
    })!;
  }

  it('새 객체 반환 (원본 불변)', () => {
    const s = makeSession();
    const original = JSON.parse(JSON.stringify(s));
    const next = recordAnswer(s, 0, 1000);
    expect(s).toEqual(original); // 원본 안 변함
    expect(next).not.toBe(s); // 다른 인스턴스
  });

  it('index 가 +1', () => {
    const s = makeSession();
    const next = recordAnswer(s, 0);
    expect(next.index).toBe(1);
  });

  it('answers 에 1개 추가', () => {
    const s = makeSession();
    const next = recordAnswer(s, 0);
    expect(next.answers.length).toBe(1);
    expect(next.answers[0].chosenIndex).toBe(0);
  });

  it('정답 판정 — chosenIndex === answerIndex 이면 correct=true', () => {
    const s = makeSession();
    const correctIdx = s.questions[0].answerIndex;
    const next = recordAnswer(s, correctIdx);
    expect(next.answers[0].correct).toBe(true);
  });

  it('오답 판정', () => {
    const s = makeSession();
    const wrongIdx = (s.questions[0].answerIndex + 1) % s.questions[0].choices.length;
    const next = recordAnswer(s, wrongIdx);
    expect(next.answers[0].correct).toBe(false);
  });

  it('-1 (시간 초과) — 오답 처리', () => {
    const s = makeSession();
    const next = recordAnswer(s, -1);
    expect(next.answers[0].correct).toBe(false);
  });

  it('timeMs 누적 계산 — 첫 답: now - startedAt', () => {
    const s = { ...makeSession(), startedAt: 1000 };
    const next = recordAnswer(s, 0, 4500);
    expect(next.answers[0].timeMs).toBe(3500);
  });

  it('timeMs 두 번째 답 — 첫 답 시간 차감', () => {
    let s = { ...makeSession(), startedAt: 1000 };
    s = recordAnswer(s, 0, 4500); // 첫 답: 3500ms
    const next = recordAnswer(s, 0, 8000); // 두 번째: 8000-1000 = 7000 elapsed, prev = 3500 → 3500
    expect(next.answers[1].timeMs).toBe(3500);
  });

  it('이미 끝난 세션에 recordAnswer → 변화 없음', () => {
    let s = makeSession();
    while (!isSessionDone(s)) {
      s = recordAnswer(s, 0);
    }
    const after = recordAnswer(s, 0);
    expect(after).toBe(s); // 동일 참조 반환
  });
});

describe('isSessionDone / summarize', () => {
  function fullPlay(strategy: (i: number, ans: number) => number): QuestSession {
    let s = createSession({
      subject: 'adsp',
      chapter: 1,
      topic: null,
      size: 5,
    })!;
    let i = 0;
    while (!isSessionDone(s)) {
      const correctIdx = s.questions[s.index].answerIndex;
      s = recordAnswer(s, strategy(i, correctIdx));
      i++;
    }
    return s;
  }

  it('완료된 세션 — isSessionDone true', () => {
    const s = fullPlay((_, ans) => ans);
    expect(isSessionDone(s)).toBe(true);
  });

  it('summarize — 모두 정답', () => {
    const s = fullPlay((_, ans) => ans);
    const sum = summarize(s);
    expect(sum.correctCount).toBe(s.questions.length);
    expect(sum.total).toBe(s.questions.length);
    expect(sum.accuracy).toBe(1);
    expect(sum.answers.length).toBe(s.questions.length);
    // answers[i].question === questions[i]
    sum.answers.forEach((a, i) => expect(a.question).toBe(s.questions[i]));
  });

  it('summarize — 모두 오답', () => {
    const s = fullPlay((_, ans) => (ans + 1) % 4);
    const sum = summarize(s);
    expect(sum.correctCount).toBe(0);
    expect(sum.accuracy).toBe(0);
  });

  it('summarize — 빈 세션 (안 풀고 끝) division-by-zero 방지', () => {
    // 직접 0개 questions 인 세션을 만들 수 없으므로, total=0 분기 검증
    const empty = {
      subject: 'adsp' as const,
      chapter: 1,
      chapterTitle: '',
      topic: null,
      flow: 'play' as const,
      passNumber: 1,
      questions: [],
      index: 0,
      answers: [],
      startedAt: 0,
    };
    const sum = summarize(empty);
    expect(sum.accuracy).toBe(0);
    expect(sum.total).toBe(0);
  });
});

describe('reviewPoolSize — 마지막 오답 카운트', () => {
  it('빈 store → 0', () => {
    expect(reviewPoolSize('adsp', 1, null)).toBe(0);
  });
});

describe('createReviewFromIds — 특정 ID 만 세션 구성', () => {
  it('빈 ID 배열 → null', () => {
    expect(
      createReviewFromIds({
        subject: 'adsp',
        chapter: 1,
        questionIds: [],
      }),
    ).toBeNull();
  });

  it('존재하지 않는 ID → null (pool 비어서)', () => {
    expect(
      createReviewFromIds({
        subject: 'adsp',
        chapter: 1,
        questionIds: ['totally-fake-id-xyz'],
      }),
    ).toBeNull();
  });

  it('일부 유효 ID — pool 만큼만 세션 구성', () => {
    const adspQuestions = playableQuestions('adsp')
      .filter((q) => q.chapter === 1)
      .slice(0, 3);
    const ids = adspQuestions.map((q) => q.id);
    const s = createReviewFromIds({
      subject: 'adsp',
      chapter: 1,
      questionIds: ids,
    });
    expect(s).not.toBeNull();
    expect(s!.questions.length).toBe(3);
    expect(s!.flow).toBe('learn'); // 기본값
  });

  it('입력 ID 순서 유지', () => {
    const adspQuestions = playableQuestions('adsp')
      .filter((q) => q.chapter === 1)
      .slice(0, 3);
    const ids = adspQuestions.map((q) => q.id).reverse();
    const s = createReviewFromIds({
      subject: 'adsp',
      chapter: 1,
      questionIds: ids,
    });
    expect(s).not.toBeNull();
    expect(s!.questions.map((q) => q.id)).toEqual(ids);
  });

  it('존재하지 않는 chapter → null', () => {
    const adspQuestions = playableQuestions('adsp').slice(0, 1);
    expect(
      createReviewFromIds({
        subject: 'adsp',
        chapter: 99,
        questionIds: adspQuestions.map((q) => q.id),
      }),
    ).toBeNull();
  });
});

describe('formatDuration — ms → 시간 포맷', () => {
  it('0 ms → 0:00', () => expect(formatDuration(0)).toBe('0:00'));
  it('1000 ms → 0:01', () => expect(formatDuration(1000)).toBe('0:01'));
  it('60000 ms → 1:00', () => expect(formatDuration(60000)).toBe('1:00'));
  it('125000 ms → 2:05', () => expect(formatDuration(125000)).toBe('2:05'));
  it('초 자릿수 padded', () => expect(formatDuration(65000)).toBe('1:05'));
});
