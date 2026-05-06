import { describe, it, expect } from 'vitest';
import {
  ADSP_AREAS,
  SQLD_AREAS,
  getAreas,
  findAreaByChapterId,
  findAreaById,
  validateAreaRatios,
} from './areaConfig';

describe('areaConfig — 5영역 정의', () => {
  describe('ADsP 5영역', () => {
    it('정확히 5개 영역', () => {
      expect(ADSP_AREAS).toHaveLength(5);
    });

    it('비율 합 = 1.0', () => {
      const sum = ADSP_AREAS.reduce((s, a) => s + a.ratio, 0);
      expect(sum).toBeCloseTo(1.0, 3);
    });

    it('영역별 비율: 13/17/17/30/23', () => {
      expect(ADSP_AREAS[0].ratio).toBe(0.13);
      expect(ADSP_AREAS[1].ratio).toBe(0.17);
      expect(ADSP_AREAS[2].ratio).toBe(0.17);
      expect(ADSP_AREAS[3].ratio).toBe(0.3);
      expect(ADSP_AREAS[4].ratio).toBe(0.23);
    });

    it('영역 4 = 통계 (2 topic 병합)', () => {
      const stats = ADSP_AREAS[3];
      expect(stats.chapter_id).toBe('adsp-3-stats');
      expect(stats.topics).toHaveLength(2);
      expect(stats.topics.map((t) => t.topic)).toEqual(['통계 분석', '통계적 가설 검정']);
    });

    it('영역 1 = ch1 전체 (topic null)', () => {
      const area1 = ADSP_AREAS[0];
      expect(area1.topics[0].chapter).toBe(1);
      expect(area1.topics[0].topic).toBeNull();
    });
  });

  describe('SQLD 5영역', () => {
    it('정확히 5개 영역', () => {
      expect(SQLD_AREAS).toHaveLength(5);
    });

    it('비율 합 = 1.0', () => {
      const sum = SQLD_AREAS.reduce((s, a) => s + a.ratio, 0);
      expect(sum).toBeCloseTo(1.0, 3);
    });

    it('비율: 12/12/24/36/16', () => {
      expect(SQLD_AREAS[0].ratio).toBe(0.12);
      expect(SQLD_AREAS[1].ratio).toBe(0.12);
      expect(SQLD_AREAS[2].ratio).toBe(0.24);
      expect(SQLD_AREAS[3].ratio).toBe(0.36);
      expect(SQLD_AREAS[4].ratio).toBe(0.16);
    });

    it('SQL 활용이 가장 큰 비중 (36%)', () => {
      expect(SQLD_AREAS[3].chapter_id).toBe('sqld-2-2');
      expect(SQLD_AREAS[3].display_name).toBe('SQL 활용');
    });
  });

  describe('조회 헬퍼', () => {
    it('getAreas(adsp) → ADSP_AREAS', () => {
      expect(getAreas('adsp')).toBe(ADSP_AREAS);
    });

    it('getAreas(sqld) → SQLD_AREAS', () => {
      expect(getAreas('sqld')).toBe(SQLD_AREAS);
    });

    it('findAreaByChapterId(adsp-3-stats) → 통계 영역', () => {
      const a = findAreaByChapterId('adsp-3-stats');
      expect(a?.display_name).toBe('통계 분석');
      expect(a?.ratio).toBe(0.3);
    });

    it('findAreaById(sqld-area-4) → SQL 활용', () => {
      const a = findAreaById('sqld-area-4');
      expect(a?.chapter_id).toBe('sqld-2-2');
    });

    it('미존재 ID → undefined', () => {
      expect(findAreaByChapterId('xxx-nope')).toBeUndefined();
      expect(findAreaById('nope')).toBeUndefined();
    });
  });

  describe('validateAreaRatios — dev assertion', () => {
    it('ADsP/SQLD 모두 sum = 1', () => {
      const result = validateAreaRatios();
      expect(result.every((r) => r.ok)).toBe(true);
    });
  });
});
