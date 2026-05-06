import { describe, it, expect } from 'vitest';
import {
  generateMessage,
  generateInsufficientDataMessage,
  generateSimulationMessage,
} from './messageGenerator';

describe('messageGenerator', () => {
  describe('generateMessage — beginner', () => {
    it('score < 40 → "차근차근" 메시지', () => {
      const m = generateMessage(30, false, 'beginner', 60);
      expect(m).toContain('D-60');
      expect(m).toContain('차근차근');
    });

    it('score 40~59 → "합격선까지 N점" 메시지', () => {
      const m = generateMessage(50, false, 'beginner', 30);
      expect(m).toContain('10점'); // 60 - 50
      expect(m).toContain('약점 단원');
    });

    it('score >= 60 → "합격 가능성 높아"', () => {
      const m = generateMessage(70, true, 'beginner', 30);
      expect(m).toContain('합격 가능성');
      expect(m).toContain('꾸준히');
    });
  });

  describe('generateMessage — reviewer', () => {
    it('not pass → "불합격 가능성"', () => {
      const m = generateMessage(45, false, 'reviewer', 14);
      expect(m).toContain('45점');
      expect(m).toContain('불합격');
      expect(m).toContain('학습 탭');
    });

    it('is pass → "합격 가능성"', () => {
      const m = generateMessage(75, true, 'reviewer', 14);
      expect(m).toContain('75점');
      expect(m).toContain('합격 가능성');
      expect(m).toContain('안전권');
    });
  });

  describe('데이터 부족', () => {
    it('score=null → "데이터 부족"', () => {
      const m = generateMessage(null, false, 'beginner', 30);
      expect(m).toContain('데이터');
      expect(m).toContain('부족');
    });

    it('reviewer score=null 도 동일 처리', () => {
      const m = generateMessage(null, false, 'reviewer', 14);
      expect(m).toContain('부족');
    });
  });

  describe('D-day edge cases', () => {
    it('d_day null → "시험 직전" 표현', () => {
      const m = generateMessage(30, false, 'beginner', null);
      expect(m).toContain('시험 직전');
    });

    it('d_day 0 또는 음수 → "시험 직전"', () => {
      const m = generateMessage(30, false, 'beginner', 0);
      expect(m).toContain('시험 직전');
      const m2 = generateMessage(30, false, 'beginner', -3);
      expect(m2).toContain('시험 직전');
    });
  });

  describe('unknown persona — beginner 처리', () => {
    it('unknown + score 30 → 차근차근', () => {
      const m = generateMessage(30, false, 'unknown', 30);
      expect(m).toContain('차근차근');
    });
  });

  describe('generateInsufficientDataMessage', () => {
    it('충분 시 — "곧 정확한 예측"', () => {
      const m = generateInsufficientDataMessage(8, 8);
      expect(m).toContain('학습한 단원');
    });

    it('부족 시 — "N개 더 필요"', () => {
      const m = generateInsufficientDataMessage(2, 8);
      expect(m).toContain('2개');
      expect(m).toMatch(/(\d+)개 더 필요/);
    });
  });

  describe('generateSimulationMessage', () => {
    it('delta 0 — "변화 없음"', () => {
      expect(generateSimulationMessage(0, false, false)).toContain('변화 없음');
    });

    it('not pass → pass — "합격선 통과"', () => {
      const m = generateSimulationMessage(8, true, false);
      expect(m).toContain('+8점');
      expect(m).toContain('합격선 통과');
    });

    it('이미 pass + 더 상승 — "안전권 진입"', () => {
      const m = generateSimulationMessage(5, true, true);
      expect(m).toContain('안전권');
    });

    it('not pass + delta > 0 - 합격 못 함', () => {
      const m = generateSimulationMessage(3, false, false);
      expect(m).toContain('+3점');
      expect(m).toContain('힘내자');
    });
  });
});
