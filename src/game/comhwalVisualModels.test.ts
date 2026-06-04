import { describe, expect, it } from 'vitest';
import {
  COMHWAL_DATABASE_VISUAL_TOPIC_IDS,
  COMHWAL_SPREADSHEET_VISUAL_TOPIC_IDS,
  COMHWAL_TOPIC_VISUAL_PROFILES,
  getComhwalExpansionVisualModel,
} from './comhwalVisualModels';
import {
  DATABASE_GENERAL_TOPICS,
  SPREADSHEET_GENERAL_TOPICS,
} from '@/data/comhwal/expansionConcepts';

describe('COMHWAL visual profiles', () => {
  it('covers every spreadsheet-general topic', () => {
    const expectedIds = SPREADSHEET_GENERAL_TOPICS.map((topic) => topic.id);

    expect(COMHWAL_SPREADSHEET_VISUAL_TOPIC_IDS).toEqual(expectedIds);
  });

  it('covers every database-general topic', () => {
    const expectedIds = DATABASE_GENERAL_TOPICS.map((topic) => topic.id);

    expect(COMHWAL_DATABASE_VISUAL_TOPIC_IDS).toEqual(expectedIds);
  });

  it('uses a distinct diagram pattern per topic instead of broad range reuse', () => {
    const patterns = Object.values(COMHWAL_TOPIC_VISUAL_PROFILES).map(
      (profile) => profile.pattern,
    );

    expect(new Set(patterns).size).toBe(patterns.length);
  });

  it('builds card-specific models while keeping the topic-specific pattern', () => {
    const model = getComhwalExpansionVisualModel({
      topicId: '096',
      title: '피벗 테이블',
      body: '원본 자료를 행과 열로 다시 배치해 요약하는 표입니다.',
      keyPoints: ['필드 배치', '요약', '필터'],
    });

    expect(model.pattern).toBe('analysis-pivot-cross');
    expect(model.title).toBe('피벗 테이블');
    expect(model.chips).toEqual(['필드 배치', '요약', '필터']);
  });
});
