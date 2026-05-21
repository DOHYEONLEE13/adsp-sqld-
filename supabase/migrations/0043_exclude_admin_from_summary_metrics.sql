-- 0043 — Exclude admin QA accounts from summary dashboard metrics.
--
-- 0042 excluded admin accounts from detection lists. This migration applies
-- the same operational-user definition to the top summary metrics as well.

begin;

create or replace function public.admin_learning_activity()
returns table (
  total_users integer,
  premium_users integer,
  today_answered_questions integer,
  today_completed_concepts integer,
  total_answered_questions integer,
  total_completed_concepts integer,
  top_new_question_users jsonb,
  quota_reached_users jsonb,
  coupon_usage_today jsonb,
  rapid_submit_users jsonb
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  is_admin boolean;
  today_date date := (timezone('Asia/Seoul', now()))::date;
  today_start timestamptz := (((timezone('Asia/Seoul', now()))::date)::timestamp at time zone 'Asia/Seoul');
  tomorrow_start timestamptz := ((((timezone('Asia/Seoul', now()))::date + 1)::timestamp) at time zone 'Asia/Seoul');
begin
  if me is null then
    return;
  end if;

  select p.role = 'admin'
    into is_admin
    from public.profiles p
   where p.id = me;

  if not coalesce(is_admin, false) then
    return;
  end if;

  select count(*)::integer
    into total_users
    from public.profiles p
   where coalesce(p.role, 'user') <> 'admin';

  select count(*)::integer
    into premium_users
    from public.profiles p
   where coalesce(p.role, 'user') <> 'admin'
     and p.is_premium
     and (p.premium_until is null or p.premium_until > now());

  select coalesce(sum(s.total), 0)::integer
    into today_answered_questions
    from public.sessions s
    join public.profiles p on p.id = s.user_id
   where s.ended_at >= today_start
     and s.ended_at < tomorrow_start
     and coalesce(p.role, 'user') <> 'admin';

  select coalesce(sum(s.total), 0)::integer
    into total_answered_questions
    from public.sessions s
    join public.profiles p on p.id = s.user_id
   where coalesce(p.role, 'user') <> 'admin';

  select count(*)::integer
    into today_completed_concepts
    from public.xp_awards xa
    join public.profiles p on p.id = xa.user_id
   where xa.source = 'lesson'
     and xa.created_at >= today_start
     and xa.created_at < tomorrow_start
     and coalesce(p.role, 'user') <> 'admin';

  select count(*)::integer
    into total_completed_concepts
    from public.xp_awards xa
    join public.profiles p on p.id = xa.user_id
   where xa.source = 'lesson'
     and coalesce(p.role, 'user') <> 'admin';

  select coalesce(jsonb_agg(item order by sort_new_questions desc, sort_sessions desc), '[]'::jsonb)
    into top_new_question_users
    from (
      select
        sum(coalesce(cardinality(qas.new_question_ids), 0))::integer as sort_new_questions,
        count(*)::integer as sort_sessions,
        jsonb_build_object(
          'userId', p.id,
          'tag', p.tag,
          'displayName', p.display_name,
          'role', p.role,
          'isPremium', p.is_premium,
          'newQuestions', sum(coalesce(cardinality(qas.new_question_ids), 0))::integer,
          'sessions', count(*)::integer
        ) as item
      from public.question_attempt_sessions qas
      join public.profiles p on p.id = qas.user_id
      where qas.started_at >= today_start
        and qas.started_at < tomorrow_start
        and coalesce(p.role, 'user') <> 'admin'
      group by p.id, p.tag, p.display_name, p.role, p.is_premium
      having sum(coalesce(cardinality(qas.new_question_ids), 0)) > 0
      order by sort_new_questions desc, sort_sessions desc, p.created_at asc
      limit 10
    ) ranked;

  select coalesce(jsonb_agg(item order by sort_used desc, sort_tag asc), '[]'::jsonb)
    into quota_reached_users
    from (
      select
        dq.used_count as sort_used,
        p.tag as sort_tag,
        jsonb_build_object(
          'userId', p.id,
          'tag', p.tag,
          'displayName', p.display_name,
          'usedCount', dq.used_count,
          'limitCount', dq.limit_count
        ) as item
      from public.daily_question_quota dq
      join public.profiles p on p.id = dq.user_id
      where dq.quota_date = today_date
        and dq.used_count >= dq.limit_count
        and coalesce(p.role, 'user') <> 'admin'
      order by dq.used_count desc, p.tag asc
      limit 20
    ) reached;

  select coalesce(jsonb_agg(item order by sort_new_questions desc, sort_granted_at desc), '[]'::jsonb)
    into coupon_usage_today
    from (
      select
        coalesce(today_usage.new_questions, 0)::integer as sort_new_questions,
        pg.granted_at as sort_granted_at,
        jsonb_build_object(
          'userId', p.id,
          'tag', p.tag,
          'displayName', p.display_name,
          'code', upper(pg.source_ref),
          'newQuestions', coalesce(today_usage.new_questions, 0)::integer,
          'sessions', coalesce(today_usage.sessions, 0)::integer,
          'grantedAt', pg.granted_at,
          'expiresAt', pg.expires_at
        ) as item
      from public.premium_grants pg
      join public.profiles p on p.id = pg.user_id
      left join lateral (
        select
          sum(coalesce(cardinality(qas.new_question_ids), 0))::integer as new_questions,
          count(*)::integer as sessions
        from public.question_attempt_sessions qas
        where qas.user_id = pg.user_id
          and qas.started_at >= today_start
          and qas.started_at < tomorrow_start
      ) today_usage on true
      where pg.source = 'redemption_code'
        and pg.source_ref is not null
        and pg.revoked_at is null
        and (pg.expires_at is null or pg.expires_at > now())
        and coalesce(p.role, 'user') <> 'admin'
      order by sort_new_questions desc, pg.granted_at desc
      limit 30
    ) coupon_rows;

  select coalesce(jsonb_agg(item order by sort_avg_sec asc, sort_questions desc), '[]'::jsonb)
    into rapid_submit_users
    from (
      select
        sum(s.total)::integer as sort_questions,
        case
          when sum(s.total) > 0
            then round((sum(greatest(s.total_time_ms, 0))::numeric / 1000) / sum(s.total), 1)
          else 999999::numeric
        end as sort_avg_sec,
        jsonb_build_object(
          'userId', p.id,
          'tag', p.tag,
          'displayName', p.display_name,
          'submittedQuestions', sum(s.total)::integer,
          'sessions', count(*)::integer,
          'totalTimeSec', round(sum(greatest(s.total_time_ms, 0))::numeric / 1000, 1),
          'avgSecPerQuestion',
            case
              when sum(s.total) > 0
                then round((sum(greatest(s.total_time_ms, 0))::numeric / 1000) / sum(s.total), 1)
              else null
            end
        ) as item
      from public.sessions s
      join public.profiles p on p.id = s.user_id
      where s.ended_at >= today_start
        and s.ended_at < tomorrow_start
        and s.total > 0
        and coalesce(p.role, 'user') <> 'admin'
      group by p.id, p.tag, p.display_name
      having sum(s.total) >= 5
      order by sort_avg_sec asc, sort_questions desc
      limit 10
    ) rapid_rows;

  return next;
end;
$$;

revoke execute on function public.admin_learning_activity() from public, anon;
grant execute on function public.admin_learning_activity() to authenticated;

commit;
