-- 0025 — 프로필 캐릭터 unlock 시스템 + XP 구매.
--
-- 배경 (사용자 요청 2026-05-08):
--   "프로필 캐릭터 프로필 적용 부분 XP로 구매 가능하게 구현. 한개당 xp50개.
--    기본 무료 제공 프로필 캐릭터 기본 한개는 각각 sqld 셀리와 adsp 토리 한개씩 제공."
--
-- 정책:
--   - 신규 사용자 default = ['tori']
--   - 기존 사용자 backfill = ['tori', 'selli'] (현재 둘 다 사용 가능 보호)
--   - 추가 캐릭터 = 50 XP / 1개
--
-- 향후 캐릭터 추가 시:
--   1) public/mascot/<character>-<pose>.png 8 포즈 추가
--   2) src/components/mascot/types.ts MascotCharacter 타입 확장
--   3) purchase_character RPC 의 known character 화이트리스트 update (또는 클라 검증만)
--
-- 두 RPC + 1 컬럼 + backfill.

begin;

-- ── 1. profiles.unlocked_characters 컬럼 ──────────────────────────────────
alter table public.profiles
  add column if not exists unlocked_characters text[] not null
    default array['tori']::text[];

-- 기존 사용자 backfill — 현재 두 캐릭터 모두 사용 중인 사용자 보호.
-- 즉시 적용 시 신규 default 만 적용되어 기존 사용자 셀리 못 쓰는 상황 방지.
update public.profiles
   set unlocked_characters = array['tori', 'selli']::text[]
 where unlocked_characters is null
    or array_length(unlocked_characters, 1) is null
    or unlocked_characters = array[]::text[];

-- realtime publication 추가 (다기기 sync 위해)
-- (이미 profiles 테이블 자체가 publication 에 있으면 noop)

-- ── 2. on_auth_user_created trigger 와 호환 ───────────────────────────────
-- 0003 의 트리거가 profiles row 를 insert 할 때 default 값이 자동 적용되므로
-- 트리거 자체 변경 없음. 신규 사용자는 자동으로 ['tori'] 만 보유.

-- ── 3. RPC: purchase_character — XP 차감 + 캐릭터 unlock ──────────────────
--
-- atomic transaction (BEGIN/COMMIT). 모든 검증을 하나의 update 안에서 처리.
-- idempotent — 이미 보유 캐릭터 재구매 시 ok=true reason='already_owned' 반환,
--             XP 차감 없음.
--
-- 반환:
--   ok            - 성공 여부
--   reason        - ok=false 시 원인 / ok=true 시 'already_owned' 가능
--   remaining_xp  - 차감 후 잔액 (already_owned 경우 변화 없음)

create or replace function public.purchase_character(p_character text)
returns table (ok boolean, reason text, remaining_xp integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  cost integer := 50;
  current_xp integer;
  current_chars text[];
  known_chars constant text[] := array['tori', 'selli'];
begin
  -- 권한 검증
  if me is null then
    return query select false, 'unauthenticated', 0; return;
  end if;

  -- 입력 검증 — 알려진 캐릭터만 (oddball 입력 차단)
  -- 향후 새 캐릭터 추가 시 known_chars 화이트리스트 갱신 필요.
  if p_character is null or p_character != all(known_chars) then
    return query select false, 'unknown_character', 0; return;
  end if;

  -- 현재 상태 락
  select total_xp, unlocked_characters
    into current_xp, current_chars
    from public.profiles
   where id = me
   for update;

  if current_xp is null then
    return query select false, 'profile_not_found', 0; return;
  end if;

  -- 이미 보유 → idempotent
  if p_character = any(current_chars) then
    return query select true, 'already_owned', current_xp; return;
  end if;

  -- XP 검증
  if current_xp < cost then
    return query select false, 'insufficient_xp', current_xp; return;
  end if;

  -- 차감 + unlock
  update public.profiles
     set total_xp = total_xp - cost,
         unlocked_characters = array_append(unlocked_characters, p_character)
   where id = me;

  return query select true, null::text, current_xp - cost;
end;
$$;

revoke execute on function public.purchase_character(text) from public, anon;
grant execute on function public.purchase_character(text) to authenticated;

commit;

-- ── 검증 쿼리 (수동 실행) ───────────────────────────────────────────────
--
-- 1) 백필 결과 확인:
--    select id, total_xp, unlocked_characters from profiles limit 5;
--    → 모두 ['tori', 'selli'] 보유
--
-- 2) RPC 동작 검증 (테스트 계정):
--    select * from purchase_character('selli');
--    → 이미 보유 시: ok=true, reason='already_owned', remaining_xp=현재값
--
-- 3) 컬럼에서 selli 제거 후 구매 시도 (admin 만 가능):
--    update profiles set unlocked_characters = array['tori']
--     where tag = 'Q-XXXX-XXXX';
--    select * from purchase_character('selli');
--    → XP >= 50: ok=true, remaining_xp=총XP-50
--    → XP < 50: ok=false, reason='insufficient_xp'
--
-- 4) 알려지지 않은 캐릭터:
--    select * from purchase_character('unknown');
--    → ok=false, reason='unknown_character'
