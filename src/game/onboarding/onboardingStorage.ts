/**
 * Onboarding 영속성 — Phase 4 Step 2 mock 단계.
 *
 * 정책:
 *   - 마이그레이션 미적용 단계 — Supabase profiles.persona 미사용.
 *   - localStorage 에 OnboardingResult JSON 저장.
 *   - 완료 여부 플래그로 신규 사용자 vs 기존 사용자 구분.
 *
 * 마이그레이션 적용 후 (Phase 4 Step 5/6):
 *   - profiles.persona !== 'unknown' → 완료
 *   - localStorage 는 cache 역할만
 */

import type { Persona, UserBackground, StudyStyle } from '@/types/learning';
import type { Subject } from '@/types/question';

type ExamSubject = Extract<Subject, 'adsp' | 'sqld'>;

const STORAGE_KEY = 'questdp_onboarding_v4';
const SKIPPED_KEY = 'questdp_onboarding_skipped_v4';

/**
 * 저장 형식. OnboardingScreen 의 onComplete 결과와 1:1.
 * Date 객체는 ISO string 으로 직렬화.
 */
export interface OnboardingResult {
  persona: Persona;
  background: UserBackground;
  exams: ExamSubject[];
  exam_dates: { [exam in ExamSubject]?: string }; // ISO date
  daily_minutes: number;
  study_style: StudyStyle;
  weak_chapters?: string[];
  completed_at: string; // ISO timestamp
  version: 1;
}

/** 저장 입력 — exam_dates 는 Date 또는 string 모두 수용. */
export interface SaveOnboardingInput {
  persona: Persona;
  background: UserBackground;
  exams: ExamSubject[];
  exam_dates: { [exam in ExamSubject]?: Date | string };
  daily_minutes: number;
  study_style: StudyStyle;
  weak_chapters?: string[];
}

/** 저장. */
export function saveOnboardingResult(result: SaveOnboardingInput): void {
  if (typeof window === 'undefined') return;
  const payload: OnboardingResult = {
    persona: result.persona,
    background: result.background,
    exams: result.exams,
    exam_dates: serializeDates(result.exam_dates),
    daily_minutes: result.daily_minutes,
    study_style: result.study_style,
    weak_chapters: result.weak_chapters,
    completed_at: new Date().toISOString(),
    version: 1,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage 차단 환경 — silent fail (mock 단계)
  }
}

/** 조회. */
export function loadOnboardingResult(): OnboardingResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingResult;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * 신규 사용자 여부.
 * mock: localStorage 에 result 가 없으면 신규.
 * 실제 운영 (마이그레이션 적용 후): profiles.persona === 'unknown' → 신규.
 */
export function needsOnboarding(): boolean {
  return loadOnboardingResult() === null;
}

/** 초기화 (테스트 또는 사용자 reset). result + legacy skipped flag 모두 제거. */
export function clearOnboardingResult(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(SKIPPED_KEY);
  } catch {
    // silent fail
  }
}

/** Date → ISO string 변환. */
function serializeDates(dates: { [exam in ExamSubject]?: Date | string }): {
  [exam in ExamSubject]?: string;
} {
  const result: { [exam in ExamSubject]?: string } = {};
  for (const [k, v] of Object.entries(dates)) {
    if (!v) continue;
    if (typeof v === 'string') {
      result[k as ExamSubject] = v;
    } else if (v instanceof Date) {
      result[k as ExamSubject] = v.toISOString();
    }
  }
  return result;
}

/** 저장된 result 의 Date 필드 deserialize. */
export function deserializeDates(
  dates: { [exam in ExamSubject]?: string },
): { [exam in ExamSubject]?: Date } {
  const result: { [exam in ExamSubject]?: Date } = {};
  for (const [k, v] of Object.entries(dates)) {
    if (!v) continue;
    result[k as ExamSubject] = new Date(v);
  }
  return result;
}
