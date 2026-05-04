/**
 * 마스코트의 8가지 포즈. public/mascot/<character>-<pose>.png 로 대응.
 * 새 포즈를 추가할 때는 (1) 이 타입 확장 → (2) POSE_SRC 테이블 갱신 순서로.
 */
export type QuesPose =
  | 'idle'
  | 'happy'
  | 'sad'
  | 'celebrate'
  | 'sleep'
  | 'wave'
  | 'think'
  | 'lightbulb';

/**
 * 마스코트 캐릭터 종류.
 * - `tori`: ADSP 기본 — 시안 액센트, 우주비행사 (`ques-*.png` 파일)
 * - `selli`: SQLD 전용 — 동일 우주비행사 스타일, SQL 친화 표정 (`selli-*.png`)
 *
 * subject 가 아직 정해지지 않은 컨텍스트 (랜딩, 게임 외부) 에서는 `tori` 가
 * 기본. subject-aware 컨텍스트 (lesson / planet / zone / chooser greeting) 는
 * adsp→tori, sqld→selli 로 자동 라우팅.
 */
export type MascotCharacter = 'tori' | 'selli';

/** 기본 캐릭터 — 미지정 시 사용. */
export const DEFAULT_CHARACTER: MascotCharacter = 'tori';

/**
 * subject (adsp / sqld) → 마스코트 캐릭터 매핑.
 * 학습/계획/존/lesson 화면 등 subject-aware 컨텍스트에서 사용.
 */
export function characterForSubject(subject: 'adsp' | 'sqld'): MascotCharacter {
  return subject === 'sqld' ? 'selli' : 'tori';
}
