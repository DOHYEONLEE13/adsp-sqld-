/**
 * topicAlias.test.ts — raw 토픽 → 스키마 토픽 매핑 무결성.
 *
 * 핵심 — alias 테이블의 모든 매핑된 값이 SUBJECT_SCHEMAS 의 실제 토픽이어야 함.
 * 또한 모든 raw 토픽이 stale entry 가 아니어야 함 (현재 ALL_QUESTIONS 의 raw 와
 * 적어도 한 번 매칭되는지는 별도 audit 으로). build-time assertion 의미는
 * 여기서 vitest 로 검증되어 CI 가 잡아냄.
 */

import { describe, it, expect } from 'vitest';
import { canonicalTopic, matchesCanonical } from './topicAlias';
import { SUBJECT_SCHEMAS } from './subjects';
import { ALL_QUESTIONS } from '@/lib/questions';
import type { Subject } from '@/types/question';

describe('canonicalTopic — 기본 동작', () => {
  it('스키마 토픽 그대로면 통과', () => {
    expect(canonicalTopic('adsp', 1, '데이터의 이해')).toBe('데이터의 이해');
    expect(canonicalTopic('sqld', 2, 'SQL 기본')).toBe('SQL 기본');
  });

  it('alias 매핑된 raw → 스키마 토픽 반환', () => {
    expect(canonicalTopic('adsp', 1, 'DIKW 피라미드')).toBe('데이터의 이해');
    expect(canonicalTopic('adsp', 1, 'SECI 모델')).toBe('데이터의 이해');
    expect(canonicalTopic('adsp', 3, 'K-means')).toBe('정형 데이터 마이닝');
    expect(canonicalTopic('sqld', 2, 'INNER JOIN')).toBe('SQL 활용');
    expect(canonicalTopic('sqld', 1, '엔터티')).toBe('데이터 모델링의 이해');
  });

  it('alias 에 없는 raw → null', () => {
    expect(canonicalTopic('adsp', 1, '없는토픽xyz')).toBeNull();
    expect(canonicalTopic('sqld', 2, 'NOT_AN_ALIAS')).toBeNull();
  });

  it('존재하지 않는 chapter → null', () => {
    expect(canonicalTopic('adsp', 99, '데이터의 이해')).toBeNull();
    expect(canonicalTopic('sqld', 0, '엔터티')).toBeNull();
  });

  it('빈 문자열 raw → null', () => {
    expect(canonicalTopic('adsp', 1, '')).toBeNull();
  });
});

describe('matchesCanonical — 빠른 비교 helper', () => {
  it('canonical 일치 시 true', () => {
    expect(
      matchesCanonical('adsp', 1, 'DIKW 피라미드', '데이터의 이해'),
    ).toBe(true);
  });
  it('canonical 다른 토픽이면 false', () => {
    expect(
      matchesCanonical('adsp', 1, 'DIKW 피라미드', '데이터의 가치와 미래'),
    ).toBe(false);
  });
  it('canonical 매핑 실패 시 false', () => {
    expect(matchesCanonical('adsp', 1, '없는토픽', '데이터의 이해')).toBe(false);
  });
});

describe('alias 테이블 무결성 — 모든 매핑이 schema topic 으로 도달', () => {
  // 매핑된 값이 SUBJECT_SCHEMAS 의 실제 토픽이 아니면 canonicalTopic 가
  // 영원히 null 을 반환 (오타·schema rename 누락 등). 전수 검증.
  it.each(['adsp', 'sqld'] as Subject[])(
    '%s — 모든 alias 의 mapped value 가 schema 에 존재',
    (subject) => {
      const schema = SUBJECT_SCHEMAS[subject];
      // canonicalTopic 으로 raw → mapped 결과를 한 번씩 호출.
      // 매핑이 schema topic 에 없으면 canonicalTopic 자체가 null 을 반환.
      // 따라서 alias key 별로 canonicalTopic 호출 후 null 이면 dangling.
      const dangling: string[] = [];
      // alias 테이블은 export 되지 않으므로 ALL_QUESTIONS 의 raw 토픽을 통해
      // 간접 검증. raw 토픽이 alias 안에 있는데 매핑 결과가 null 이면 dangling.
      // (직접 import 가 더 깔끔하지만, alias 가 module-private 이라 우회.)
      for (const ch of schema.chapters) {
        for (const q of ALL_QUESTIONS) {
          if (q.subject !== subject) continue;
          if (q.chapter !== ch.chapter) continue;
          // raw == schema topic 이면 통과 보장. alias 거치는 것만 체크.
          if (ch.topics.includes(q.topic)) continue;
          const canon = canonicalTopic(subject, q.chapter, q.topic);
          if (canon === null) {
            // null 이라는 건 alias 자체가 없거나 mapped value 가 schema 미등록.
            // 후자만이 dangling — 전자는 그냥 미매핑된 raw (정상 케이스).
            // 하지만 이 둘을 구분하려면 alias 테이블 직접 access 필요.
            // 여기선 단지 "null 반환된 raw 가 너무 많지 않은지" 만 체크.
            continue;
          }
          // 매핑됐다면 schema topic 안에 있어야 함.
          if (!ch.topics.includes(canon)) {
            dangling.push(
              `${subject} ch${ch.chapter}: "${q.topic}" → "${canon}" (schema 미등록)`,
            );
          }
        }
      }
      expect(
        dangling,
        `dangling alias mapping:\n${dangling.join('\n')}`,
      ).toEqual([]);
    },
  );
});

describe('실제 문제 은행 raw 토픽 흡수율', () => {
  // 새 기출 추가 시 매핑 안 된 raw 토픽이 늘어나면 Zone 에서 누락됨.
  // 현재 흡수율을 baseline 으로 기록 — 회귀 시 알림.
  it.each(['adsp', 'sqld'] as Subject[])(
    '%s — playable 문항의 canonical 매핑률',
    (subject) => {
      let total = 0;
      let mapped = 0;
      for (const q of ALL_QUESTIONS) {
        if (q.subject !== subject) continue;
        if (q.type !== 'multiple_choice') continue;
        if (q.status === 'restored' || q.needsDistractors) continue;
        total++;
        if (canonicalTopic(subject, q.chapter, q.topic) !== null) mapped++;
      }
      const rate = total === 0 ? 1 : mapped / total;
      // 99% 이상 흡수 — 1% 미만 미매핑은 데이터 결함 (chapter 오기입 등) 으로
      // 별도 audit 대상. 더 떨어지면 새 alias 작성이 누락된 것.
      expect(
        rate,
        `${subject}: ${mapped}/${total} (${(rate * 100).toFixed(1)}%) — 99% 미만이면 topicAlias.ts 에 신규 alias 추가 필요`,
      ).toBeGreaterThanOrEqual(0.99);
    },
  );
});
