import { describe, expect, it } from 'vitest';
import {
  COMHWAL_CONCEPT_CHAPTERS,
  getComhwalTopicCards,
  listComhwalCards,
} from './concepts';

const COMPUTER_GENERAL_TOPIC_IDS = Array.from({ length: 59 }, (_, i) =>
  String(i + 1).padStart(3, '0'),
);

const FORBIDDEN_TEXT_PATTERNS = [
  '입니다',
  '합니다',
  '이다',
  '다음과 같이',
];

describe('컴활 개념 카드 구조', () => {
  it('모든 섹션은 최대 5개 카드까지만 가진다', () => {
    for (const chapter of COMHWAL_CONCEPT_CHAPTERS) {
      for (const section of chapter.sections) {
        expect(
          section.cards.length,
          `${chapter.planetKey}/${section.id} has too many cards`,
        ).toBeLessThanOrEqual(5);
      }
    }
  });

  it('모든 카드는 필수 필드와 3~5개 keyPoints를 가진다', () => {
    for (const card of listComhwalCards()) {
      expect(card.id).toMatch(/^comhwal-\d-\d{3}-c\d{2}$/);
      expect(card.topicId).toMatch(/^\d{3}$/);
      expect(card.title.trim().length).toBeGreaterThan(0);
      expect(card.body.trim().length).toBeGreaterThan(0);
      expect(card.keyPoints.length).toBeGreaterThanOrEqual(3);
      expect(card.keyPoints.length).toBeLessThanOrEqual(5);
      expect(card.examTip === null || card.examTip.trim().length > 0).toBe(true);
    }
  });

  it('1과목 컴퓨터 일반 001~059 목차가 모두 카드와 연결된다', () => {
    for (const topicId of COMPUTER_GENERAL_TOPIC_IDS) {
      expect(
        getComhwalTopicCards('computer-general', topicId).length,
        `missing concept card for topic ${topicId}`,
      ).toBeGreaterThan(0);
    }
  });

  it('카드 본문과 팁에 교재식 종결 표현이 남아 있지 않다', () => {
    for (const card of listComhwalCards()) {
      const searchable = [
        card.title,
        card.body,
        ...card.keyPoints,
        card.examTip ?? '',
      ].join('\n');
      for (const pattern of FORBIDDEN_TEXT_PATTERNS) {
        expect(
          searchable.includes(pattern),
          `${card.id} contains forbidden tone: ${pattern}`,
        ).toBe(false);
      }
    }
  });
});
