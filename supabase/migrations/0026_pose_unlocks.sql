-- 0026 — 포즈 단위 unlock 시스템 + XP 구매 (캐릭터 잠금 폐기 → 포즈 잠금).
--
-- 배경 (사용자 요청 2026-05-08):
--   "토리의 첫번 째 포즈와 셀리의 첫번 째 포즈만 처음에 잠금 해제 되어있고
--    그 나머지 토리와 셀리의 이모지는 50 XP 로 구매할 수 있게 만들고 싶어."
--
-- 정책:
--   - 신규 사용자 default = ['tori-wave', 'selli-wave'] (각 캐릭터 첫 포즈만)
--   - 추가 포즈 = 50 XP / 1개 (purchase_pose RPC)
--   - 캐릭터 자체는 둘 다 free (마이그 0025 의 캐릭터 잠금 폐기)
--
-- 0025 와 관계:
--   0025 의 unlocked_characters 컬럼은 backward-compat 보존 — 항상 ['tori', 'selli'].
--   0025 의 purchase_character RPC 는 그대로 두되 사용 안 함 (drop 도 가능 but 보존).

begin;

-- ── 1. profiles.unlocked_poses 컬럼 ────────────────────────────────────────
alter table public.profiles
  add column if not exists unlocked_poses text[] not null
    default array['tori-wave', 'selli-wave']::text[];

-- ── 2. unlocked_characters 백필 — 항상 둘 다 (캐릭터 잠금 폐기) ──────────
update public.profiles
   set unlocked_characters = array['tori', 'selli']::text[]
 where not (unlocked_characters @> array['tori', 'selli']::text[]);

-- ── 3. unlocked_poses backfill ────────────────────────────────────────────
-- 사용자 의도: "처음에 [첫 포즈만] 잠금 해제, 나머지 50 XP" — 모든 사용자 동일 적용.
-- 신규 default 와 같이 ['tori-wave', 'selli-wave'] 만 보유로 reset.
-- 단 사용자가 현재 사용 중인 포즈 (avatar_pose) 가 wave 외 라면 그 포즈도 추가
-- 보존 — 갑자기 사용 중인 포즈 잠겨서 사용자 혼란 방지.
update public.profiles
   set unlocked_poses = (
     select array_agg(distinct p) from unnest(
       array['tori-wave', 'selli-wave']::text[]
       || array[avatar_character || '-' || avatar_pose]::text[]
     ) as p
   )
 where unlocked_poses is null
    or array_length(unlocked_poses, 1) is null
    or unlocked_poses = array[]::text[]
    or not (unlocked_poses @> array['tori-wave', 'selli-wave']::text[]);

-- ── 4. RPC: purchase_pose ─────────────────────────────────────────────────
--
-- 입력: 'tori-happy', 'selli-celebrate' 등 형식 (`<character>-<pose>`).
-- 검증: known character + known pose 화이트리스트.
-- atomic: for update + 차감 + array_append.
-- idempotent: 이미 보유 → ok=true reason='already_owned', XP 변화 0.

create or replace function public.purchase_pose(p_character_pose text)
returns table (ok boolean, reason text, remaining_xp integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  cost integer := 50;
  current_xp integer;
  current_poses text[];
  parts text[];
  ch text;
  po text;
  known_chars constant text[] := array['tori', 'selli'];
  known_poses constant text[] := array[
    'wave','happy','celebrate','lightbulb','think','idle','sleep','sad'
  ];
begin
  -- 권한 검증
  if me is null then
    return query select false, 'unauthenticated', 0; return;
  end if;

  -- 입력 형식 검증 — 'character-pose' (단순 split — split_part 활용)
  if p_character_pose is null or position('-' in p_character_pose) = 0 then
    return query select false, 'invalid_format', 0; return;
  end if;

  ch := split_part(p_character_pose, '-', 1);
  po := split_part(p_character_pose, '-', 2);

  if ch = '' or po = '' then
    return query select false, 'invalid_format', 0; return;
  end if;

  -- 화이트리스트 검증
  if ch != all(known_chars) then
    return query select false, 'unknown_character', 0; return;
  end if;
  if po != all(known_poses) then
    return query select false, 'unknown_pose', 0; return;
  end if;

  -- 현재 상태 락
  select total_xp, unlocked_poses
    into current_xp, current_poses
    from public.profiles
   where id = me
   for update;

  if current_xp is null then
    return query select false, 'profile_not_found', 0; return;
  end if;

  -- 이미 보유 → idempotent
  if p_character_pose = any(current_poses) then
    return query select true, 'already_owned', current_xp; return;
  end if;

  -- XP 검증
  if current_xp < cost then
    return query select false, 'insufficient_xp', current_xp; return;
  end if;

  -- 차감 + unlock
  update public.profiles
     set total_xp = total_xp - cost,
         unlocked_poses = array_append(unlocked_poses, p_character_pose)
   where id = me;

  -- parts 변수 사용 안 함 (위 split_part 만 사용) — strict 모드 회피용 plpgsql noop
  parts := array[ch, po];
  perform 1 where parts is not null;  -- silence unused warning

  return query select true, null::text, current_xp - cost;
end;
$$;

revoke execute on function public.purchase_pose(text) from public, anon;
grant execute on function public.purchase_pose(text) to authenticated;

commit;

-- ── 검증 쿼리 (수동) ───────────────────────────────────────────────────
-- 1) 컬럼 + default 확인
--    select column_name, data_type, column_default from information_schema.columns
--     where table_schema='public' and table_name='profiles' and column_name='unlocked_poses';
--
-- 2) backfill 결과
--    select tag, avatar_character, avatar_pose, unlocked_poses from profiles;
--    → 모든 사용자가 ['tori-wave', 'selli-wave'] + 현재 사용 중 포즈
--
-- 3) 구매 RPC 동작
--    select * from purchase_pose('tori-happy');
--    → ok=true, remaining_xp=차감 후
--    select * from purchase_pose('tori-happy');
--    → ok=true, reason='already_owned' (멱등)
