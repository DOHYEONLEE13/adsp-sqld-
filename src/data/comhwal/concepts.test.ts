import { describe, expect, it } from 'vitest';
import {
  COMHWAL_CONCEPT_CHAPTERS,
  getComhwalTopicCards,
  listComhwalCards,
} from './concepts';

const COMPUTER_GENERAL_TOPIC_IDS = Array.from({ length: 59 }, (_, i) =>
  String(i + 1).padStart(3, '0'),
);
const SPREADSHEET_GENERAL_TOPIC_IDS = Array.from({ length: 47 }, (_, i) =>
  String(i + 60).padStart(3, '0'),
);
const DATABASE_GENERAL_TOPIC_IDS = Array.from({ length: 46 }, (_, i) =>
  String(i + 107).padStart(3, '0'),
);

const COMHWAL_PLANET_TOPIC_IDS = [
  {
    planetKey: 'computer-general',
    topicIds: COMPUTER_GENERAL_TOPIC_IDS,
  },
  {
    planetKey: 'spreadsheet-general',
    topicIds: SPREADSHEET_GENERAL_TOPIC_IDS,
  },
  {
    planetKey: 'database-general',
    topicIds: DATABASE_GENERAL_TOPIC_IDS,
  },
];

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

  it('uses checkpoint questions after short dialogue groups', () => {
    for (const { planetKey, topicIds } of COMHWAL_PLANET_TOPIC_IDS) {
      for (const topicId of topicIds) {
        const cards = getComhwalTopicCards(planetKey, topicId);
        const questionCards = cards.filter((card) => card.question);

        expect(
          questionCards.length,
          `${planetKey}/${topicId} needs at least one checkpoint question`,
        ).toBeGreaterThanOrEqual(1);

        if (cards.length > 1) {
          expect(
            cards[0].question,
            `${planetKey}/${topicId} should not ask a question after the first speech bubble`,
          ).toBeUndefined();
        }
      }
    }

    for (const card of listComhwalCards()) {
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
    for (const { planetKey, topicIds } of COMHWAL_PLANET_TOPIC_IDS) {
      for (const topicId of topicIds) {
        expect(
          getComhwalTopicCards(planetKey, topicId).length,
          `${planetKey}/${topicId} should be split into multiple ADSP/SQLD-style micro cards`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('splits Windows 10 features into dialogue groups before questions', () => {
    const cards = getComhwalTopicCards('computer-general', '001');
    const questionIndexes = cards
      .map((card, index) => (card.question ? index : -1))
      .filter((index) => index >= 0);

    expect(cards.length).toBeGreaterThanOrEqual(5);
    expect(cards[0].question).toBeUndefined();
    expect(cards[1].question).toBeUndefined();
    expect(questionIndexes).toEqual([2, 4, 6, 8]);
  });

  it('reinforces every other topic with a short setup bubble before each question', () => {
    for (const { planetKey, topicIds } of COMHWAL_PLANET_TOPIC_IDS) {
      for (const topicId of topicIds.filter((id) => id !== '001')) {
        const cards = getComhwalTopicCards(planetKey, topicId);
        const questionIndexes = cards
          .map((card, index) => (card.question ? index : -1))
          .filter((index) => index >= 0);

        expect(
          cards.length,
          `${planetKey}/${topicId} should not stay as a thin one-card summary`,
        ).toBeGreaterThanOrEqual(4);
        expect(
          questionIndexes.length,
          `${planetKey}/${topicId} needs repeated checkpoint questions`,
        ).toBeGreaterThanOrEqual(2);

        for (const index of questionIndexes) {
          expect(index, `${planetKey}/${topicId} asks too early`).toBeGreaterThan(0);
          expect(
            cards[index - 1].question,
            `${planetKey}/${topicId} needs a setup bubble right before the checkpoint`,
          ).toBeUndefined();
        }
      }
    }
  });

  it('keeps every dialogue copy short for speech bubbles', () => {
    for (const { planetKey, topicIds } of COMHWAL_PLANET_TOPIC_IDS) {
      for (const topicId of topicIds) {
        const cards = getComhwalTopicCards(planetKey, topicId);
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
