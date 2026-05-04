-- 0017 — profiles.avatar_character 컬럼 추가.
-- SQLD 마스코트 (selli) 와 ADSP 마스코트 (tori) 를 사용자가 자유 선택 가능.
-- avatar_pose (8 포즈) × avatar_character (2 캐릭터) = 16 조합.

alter table public.profiles
  add column if not exists avatar_character text not null default 'tori'
  check (avatar_character = ANY (ARRAY['tori'::text, 'selli'::text]));

comment on column public.profiles.avatar_character is
  'Mascot character. tori=ADSP/default, selli=SQLD. avatar_pose 와 조합으로 16 옵션.';
