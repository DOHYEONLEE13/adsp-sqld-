-- 0027 — purchase_pose RPC 가 total_xp + lesson_xp 합산 검증.
--
-- 배경 (사용자 보고 2026-05-08):
--   "XP 50개 있는데 구매가 안 됨." 진단 결과:
--   client 의 50 XP = lesson step 정답으로 누적된 lesson_xp 50.
--   server 의 total_xp 는 0 (record_session sync 별개 race fix 적용 후 흐름).
--   기존 purchase_pose 는 total_xp 만 검증 → lesson_xp 50 무시 → insufficient_xp.
--
-- 정정:
--   사용자가 보유한 사용 가능 XP = total_xp + lesson_xp 합.
--   기존 0026 의 RPC 가 total_xp 만 봤음 — 마이그 0027 로 합산 검증 + 차감으로 갱신.
--
-- 차감 정책:
--   1) 비용 만큼 lesson_xp 우선 차감 (client UX 와 일치 — lesson 활동 결과)
--   2) 부족분만 total_xp 에서 차감
--   3) 둘 다 합쳐도 부족하면 insufficient_xp

create or replace function public.purchase_pose(p_character_pose text)
returns table (ok boolean, reason text, remaining_xp integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  cost integer := 50;
  current_total integer;
  current_lesson integer;
  current_combined integer;
  lesson_deduct integer;
  total_deduct integer;
  current_poses text[];
  ch text;
  po text;
  known_chars constant text[] := array['tori', 'selli'];
  known_poses constant text[] := array[
    'wave','happy','celebrate','lightbulb','think','idle','sleep','sad'
  ];
begin
  if me is null then
    return query select false, 'unauthenticated', 0; return;
  end if;

  if p_character_pose is null or position('-' in p_character_pose) = 0 then
    return query select false, 'invalid_format', 0; return;
  end if;

  ch := split_part(p_character_pose, '-', 1);
  po := split_part(p_character_pose, '-', 2);

  if ch = '' or po = '' then
    return query select false, 'invalid_format', 0; return;
  end if;

  if ch != all(known_chars) then
    return query select false, 'unknown_character', 0; return;
  end if;
  if po != all(known_poses) then
    return query select false, 'unknown_pose', 0; return;
  end if;

  -- 락 + 합산 XP 계산
  select total_xp, coalesce(lesson_xp, 0), unlocked_poses
    into current_total, current_lesson, current_poses
    from public.profiles
   where id = me
   for update;

  if current_total is null then
    return query select false, 'profile_not_found', 0; return;
  end if;

  current_combined := current_total + current_lesson;

  -- 이미 보유 → idempotent
  if p_character_pose = any(current_poses) then
    return query select true, 'already_owned', current_combined; return;
  end if;

  -- 합산 XP 검증
  if current_combined < cost then
    return query select false, 'insufficient_xp', current_combined; return;
  end if;

  -- 차감 정책: lesson_xp 우선 → 부족분 total_xp
  if current_lesson >= cost then
    lesson_deduct := cost;
    total_deduct := 0;
  else
    lesson_deduct := current_lesson;
    total_deduct := cost - current_lesson;
  end if;

  update public.profiles
     set lesson_xp = current_lesson - lesson_deduct,
         total_xp = current_total - total_deduct,
         unlocked_poses = array_append(unlocked_poses, p_character_pose)
   where id = me;

  return query select true, null::text, current_combined - cost;
end;
$$;

-- 권한 (이미 0026 에서 grant 됐지만 idempotent 재실행)
revoke execute on function public.purchase_pose(text) from public, anon;
grant execute on function public.purchase_pose(text) to authenticated;

-- 검증 쿼리 (수동):
--   select * from purchase_pose('tori-happy');
--   select tag, total_xp, lesson_xp, total_xp+lesson_xp as combined, unlocked_poses
--     from profiles where tag = 'Q-PQQM-T6AC';
