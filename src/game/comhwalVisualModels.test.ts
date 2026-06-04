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

  it('infers different visual focus targets inside the same spreadsheet topic', () => {
    const cellModel = getComhwalExpansionVisualModel({
      topicId: '060',
      title: '셀은 엑셀의 한 칸',
      body: '행과 열이 만나는 한 칸을 셀이라고 부르고 A1 같은 주소로 찾습니다.',
      keyPoints: ['행은 가로 번호야', '열은 세로 문자야', '셀은 한 칸 주소야'],
    });
    const formulaBarModel = getComhwalExpansionVisualModel({
      topicId: '060',
      title: '수식 입력줄은 진짜 내용을 보여준다',
      body: '화면에서 선택한 셀의 실제 값이나 수식을 수식 입력줄에서 확인합니다.',
      keyPoints: ['이름 상자', '수식 입력줄', '리본'],
    });

    expect(cellModel.pattern).toBe(formulaBarModel.pattern);
    expect(cellModel.focus).toBe('cell');
    expect(cellModel.focusLabel).toBe('셀');
    expect(formulaBarModel.focus).toBe('formula-bar');
    expect(formulaBarModel.focusLabel).toBe('수식 입력줄');
  });

  it('keeps database and query focus more specific than broad lookup or condition words', () => {
    const keyModel = getComhwalExpansionVisualModel({
      topicId: '110',
      title: '기본키와 외래키',
      body: '기본키는 한 행을 대표하고 외래키는 다른 테이블의 기본키를 참조합니다.',
      keyPoints: ['기본키', '외래키', '참조 무결성'],
    });
    const whereModel = getComhwalExpansionVisualModel({
      topicId: '123',
      title: 'WHERE는 조건에 맞는 행만 남긴다',
      body: '조회 질의에서 WHERE는 조건에 맞는 레코드를 고르는 부분입니다.',
      keyPoints: ['SELECT', 'WHERE', '조건'],
    });

    expect(keyModel.focus).toBe('foreign-key');
    expect(whereModel.focus).toBe('where');
  });
});
