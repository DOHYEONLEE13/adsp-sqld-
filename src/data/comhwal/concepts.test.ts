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

describe('COMHWAL concept card structure', () => {
  it('keeps every section at 5 cards or fewer', () => {
    for (const chapter of COMHWAL_CONCEPT_CHAPTERS) {
      for (const section of chapter.sections) {
        expect(
          section.cards.length,
          `${chapter.planetKey}/${section.id} has too many cards`,
        ).toBeLessThanOrEqual(5);
      }
    }
  });

  it('gives every card required fields and 3-5 key points', () => {
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

  it('gives every concept card an immediate question', () => {
    for (const card of listComhwalCards()) {
      expect(card.question, `${card.id} needs an immediate question`).toBeDefined();
      if (!card.question) continue;

      expect(card.question.id).toMatch(/^comhwal-\d-\d{3}-q\d{2}$/);
      expect(card.question.prompt.trim().length).toBeGreaterThan(0);
      expect(card.question.explanation.trim().length).toBeGreaterThan(0);
      expect(card.question.choices).toHaveLength(4);
      expect(card.question.answerIndex).toBeGreaterThanOrEqual(0);
      expect(card.question.answerIndex).toBeLessThan(card.question.choices.length);
      expect(new Set(card.question.choices).size).toBe(card.question.choices.length);

      for (const choice of card.question.choices) {
        expect(choice.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('splits every computer-general 001-059 topic into at least two micro cards', () => {
    for (const topicId of COMPUTER_GENERAL_TOPIC_IDS) {
      expect(
        getComhwalTopicCards('computer-general', topicId).length,
        `topic ${topicId} should be split into multiple ADSP/SQLD-style micro cards`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it('splits Windows 10 features into multiple cards with immediate questions', () => {
    const cards = getComhwalTopicCards('computer-general', '001');

    expect(cards.length).toBeGreaterThanOrEqual(5);
    for (const card of cards) {
      expect(card.question, `${card.id} needs an immediate question`).toBeDefined();
    }
  });

  it('keeps every computer-general dialogue copy short for speech bubbles', () => {
    for (const topicId of COMPUTER_GENERAL_TOPIC_IDS) {
      const cards = getComhwalTopicCards('computer-general', topicId);
      for (const card of cards) {
        expect(
          Array.from(card.title).length,
          `${card.id} title is too long for the ADSP/SQLD-style progress list`,
        ).toBeLessThanOrEqual(28);
      expect(
        Array.from(card.body).length,
        `${card.id} body is too long for the ADSP/SQLD-style dialogue flow`,
        ).toBeLessThanOrEqual(70);
      }
    }
  });

  it('does not leave textbook-style endings in cards or questions', () => {
    for (const card of listComhwalCards()) {
      const searchable = [
        card.title,
        card.body,
        ...card.keyPoints,
        card.examTip ?? '',
        card.question?.prompt ?? '',
        ...(card.question?.choices ?? []),
        card.question?.explanation ?? '',
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
