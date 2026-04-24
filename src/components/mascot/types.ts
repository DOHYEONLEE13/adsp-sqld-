/**
 * Ques 마스코트의 8가지 포즈. PR 2 에서 public/mascot/ques-<pose>.png 로 대응.
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
