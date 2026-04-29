# QuestDP — N회독 시스템 설계 정본

> 작성: 2026-04-29
> 상태: 결정 사항 잠금 완료, P0 (데이터·알고리즘) 구현 진행 중
> 다음 작업 시 이 문서를 정본으로 참고

---

## 배경

문제 풀(pool) 규모 점검 결과 사용자가 하루 70문제 풀 경우 월 2,100문제 소비 → 콘텐츠 빠르게 고갈.
같은 개념의 **더 높은 난이도 변형** 을 회독 차수에 따라 차등 제공 + 회독 자체를 **숙련도 훈장(Tier)** 으로 시각화하는 N회독 시스템 도입.

---

## 결정 사항 (잠금)

| 영역 | 채택안 |
|---|---|
| 1. UI 구성 | **A 탭 전환형 + D Path 색조 변환형** |
| 2. Rank/배지 | **D — Pass Tier 5단계 + 챕터별 Pass Stamp 컬렉션** |
| 3. 친구 리더보드 | **시안 2 — 좌측 Tier 띠 + 진행 점 + 정렬 토글 + sticky 본인 행 + 승급 토스트** |
| 변형 문제 | **새로 작성 (a)** |
| Tier 단어 | **BRONZE → SILVER → GOLD → PLATINUM → MASTER** |
| 챕터 회독 완료 기준 | **75%** |
| 마이그레이션 | **자동 부여 + StatsPage 에 "회독 다시 시작" 옵션 제공** (양쪽 다) |

---

## Tier 정의

| Tier | 단어 | 의미 | 색 (radial glow) | 마스코트 포즈 |
|---|---|---|---|---|
| 1 | **BRONZE** | 1회독 진행 중 | 청동 #b45309 + cyan glow | wave |
| 2 | **SILVER** | 1회독 완료 / 2회독 시작 가능 | 은 #94a3b8 + emerald glow | think |
| 3 | **GOLD** | 2회독 진행 중 | 금 #fbbf24 + amber glow | lightbulb |
| 4 | **PLATINUM** | 2회독 완료 / 3회독+ 시작 가능 | 백금 #67e8f9 + violet glow | celebrate |
| 5 | **MASTER** | 3회독+ 완료 영역 | 마스터 #6FFF00 + neon glow + 입자 | celebrate (특별 애니메이션) |

### 색상 충돌 해결

기존 **토픽 마스터리** 5단계 (Bronze/Silver/Gold/Platinum/Diamond) 와 단어 4개 겹침 → 인지 분리 위해:

- **토픽 마스터리는 "탐사도" 로 metaphor 리네임**:
  - none → **신참 (Cadet)** · 정답률 < 30%
  - bronze → **탐사자 (Scout)** · 30–55%
  - silver → **베테랑 (Veteran)** · 55–75%
  - gold → **달인 (Ace)** · 75–90%
  - platinum → **우주인 (Astro)** · 90% +
  - (기존 5단계 → 새 5단계, "diamond" 였던 끝단계는 "우주인" 으로 흡수)
- 마스터리 시각 위치 = 토픽 카드 내부 작은 칩 (불변)
- Pass Tier 시각 위치 = 화면 상단 sticky 띠 + 프로필 큰 칩 + 친구 카드 좌측 vertical accent

→ 단어 충돌 0, 시각 위치도 명확히 분리.

---

## 영역 1: UI 구성 — A 탭 전환형 + D Path 색조 변환형

### 탭 위치

**PlanetScreen 상단 + ZoneScreen 상단** 양쪽에 sticky 탭:
```
[BRONZE 1회독 ●●●●○]  [SILVER 2회독 ○○○○○]  [3회독+ 🔒]
   진행 중                      가능                   잠김
```

- 진행 중 탭 = 강조 (Tier 색 background + glow)
- 가능 탭 = 회색 + 선명한 단어 (클릭 가능)
- 잠긴 탭 = 더 어두운 회색 + 자물쇠 아이콘 (이전 회독 완료 전엔 진입 X)

### 탭 클릭 동작

1. 사용자가 "2회독" 탭 클릭 → 해당 챕터의 2회독 컨텍스트 진입
2. ZoneScreen path 가 GOLD 색조로 변환 (D 영역)
3. step 진입 시 마스코트 한 줄 인사 + 인라인 collapsible 리마인더
4. step 풀이 = pass_number=2 로 기록 (sessions.pass_number)

### Path 색조 변환 (D)

| 회독 | 색 | 노드 디자인 |
|---|---|---|
| 1회독 | cyan #67e8f9 (현재 디자인 유지) | 기본 + cyan glow |
| 2회독 | amber-gold #fbbf24 | + glow ↑, ring 두꺼움 |
| 3회독+ | neon #6FFF00 | + 입자 효과, 펄스 애니메이션 |

### 개념 리마인더

- **인라인 collapsible 카드** — step 진입 시 카드 위에 접힌 상태로 노출:
  - 1회독: "📖 새로 배우는 개념" — 펼친 상태로 시작
  - 2회독+: "📖 이거 기억나? (펼쳐서 보기)" — 접힌 상태로 시작
- **마스코트 한 줄 인사** (DialogueLesson 의 첫 turn 활용):
  - 1회독: wave + "처음 배우는 거니까 천천히!"
  - 2회독: think + "이거 기억나? 이번엔 한 단계 더!"
  - 3회독+: lightbulb + "거의 마스터! 마지막 변형이야"

---

## 영역 2: Pass Tier + Stamp 컬렉션

### Tier 승급 트리거

| 이벤트 | 조건 | 결과 |
|---|---|---|
| 챕터 회독 N 완료 | 해당 챕터의 모든 토픽이 pass=N 에서 정답률 ≥ **75%** | `pass_stamps` insert |
| 과목 회독 N 완료 | 해당 과목의 모든 챕터가 pass=N stamp 보유 | `profiles.pass_tier` 승급 RPC |
| Tier 강등 | **없음** — 한 번 올라가면 유지 (동기부여↓ 방지) |

### Tier 승급 매트릭스

```
1회독 진행                            → BRONZE
ADSP 또는 SQLD 1회독 완료              → SILVER
ADSP 또는 SQLD 2회독 진행              → GOLD
ADSP 또는 SQLD 2회독 완료              → PLATINUM
ADSP 와 SQLD 모두 3회독+ 진입          → MASTER
```

(정확한 임계값은 2 과목 모두 같은 수준 도달했을 때 vs 더 높은 과목 기준 등 — RPC 안에서 결정)

### Stamp 컬렉션

- 영구 획득 — 각 챕터의 각 회독 단계마다 1개씩
- ADSP 3챕터 × 2회독 시점 + SQLD 2챕터 × 2회독 시점 = **10개 기본 + 3회독+ 보너스**
- StatsPage 에 그리드 형태 — 획득 = 컬러 / 미획득 = 회색 외곽선
- 그리드 행: 과목 · 열: 챕터 · 색: 현재 도달한 회독 차수

### 신규 배지 5종 (`badges.ts` 추가)

| 배지 | 조건 | 아이콘 |
|---|---|---|
| Iron Will | 같은 챕터 3회독 이상 진입 | 🔁 |
| First Pass | 첫 챕터 1회독 완료 (첫 stamp) | 🎯 |
| Stamp Collector | stamp 5개 보유 | 📚 |
| Captain | 한 과목 2회독 완료 (PLATINUM 도달) | 🚀 |
| Master | 두 과목 모두 3회독+ 진입 (MASTER 도달) | ⭐ |

---

## 영역 3: 친구 리더보드 — 시안 2

### 카드 레이아웃

```
[1] | 🚀  닉네임             ⚡ Lv.3 · 🔥 7일             2,400 XP
 ↑    BRONZE · ●●○ (1회독 67%)
티어색
띠
```

- **좌측 vertical accent** = Tier 색 (4px)
- **마스코트 아래 진행 점** ●●○ — 채워진 점 = 해당 회독 완료, 비어 있는 점 = 미진행
- **우측 XP** 그대로 (기존 로직 유지)

### 정렬 토글 (헤더 우측)

| 정렬 옵션 | 우선순위 | 기본값 |
|---|---|---|
| **Tier 순** (기본) | tier 단계 → 진행률 → XP | ✓ |
| XP 순 | total_xp 내림차순 | |
| 정답률 순 | 현재 회독 정답률 | |
| 활동 순 | last_seen_at 내림차순 | |

### 본인 위치

- **항상 sticky 본인 행** 화면 상단에 고정 — 정렬과 무관
- 친구들은 그 아래 정렬 결과 그대로

### Tier 승급 알림

| 트리거 | UI | 제한 |
|---|---|---|
| 친구 Tier 승급 | 화면 상단 토스트 4초 — "🚀 [닉네임] 친구가 GOLD 으로 승급!" | 같은 친구 24h 내 1회 |
| 친구 챕터 stamp 획득 | (옵션) 작은 배너 | 사용자 토글 — "Tier 만 / 모두 / 끄기" 3단계 |

---

## 데이터 모델 (마이그 0013)

```sql
-- 1) profiles 확장
alter table profiles
  add column pass_tier text not null default 'bronze'
    check (pass_tier in ('bronze','silver','gold','platinum','master')),
  add column pass_tier_updated_at timestamptz;

-- 2) question_stats 확장
alter table question_stats
  add column pass_number integer not null default 1 check (pass_number >= 1),
  add column pass_marks jsonb not null default '[]'::jsonb;
  -- pass_marks = [{pass:1, correct:true, at:'2026-05-01T...'}, ...]

-- 3) sessions 확장
alter table sessions
  add column pass_number integer not null default 1 check (pass_number >= 1);

-- 4) 신규 — pass_stamps (영구 획득 이력)
create table pass_stamps (
  user_id uuid not null references profiles on delete cascade,
  subject text not null check (subject in ('adsp','sqld')),
  chapter integer not null,
  pass_number integer not null check (pass_number >= 1),
  achieved_at timestamptz not null default now(),
  primary key (user_id, subject, chapter, pass_number)
);

create index pass_stamps_user_idx on pass_stamps(user_id, achieved_at desc);
```

### RLS

```sql
alter table pass_stamps enable row level security;

-- 본인 read
create policy pass_stamps_self_read on pass_stamps
  for select to authenticated
  using (user_id = (select auth.uid()));

-- 친구 read (마스터리 같이 친구 리더보드 노출)
create policy pass_stamps_friends_read on pass_stamps
  for select to authenticated
  using (user_id in (select friend_id from friendships where user_id = (select auth.uid())));

-- INSERT 는 RPC (SECURITY DEFINER) 만
```

### RPC 시그니처

```sql
-- 챕터 회독 완료 트리거 — sessions 종료 시 호출
create function check_pass_completion(p_subject text, p_chapter int, p_pass int) ...
  -- 챕터 정답률 ≥ 75% 면 stamp insert + tier 재계산

-- Tier 재계산 — stamp 변동 시 호출
create function recompute_pass_tier() ...
  -- profiles.pass_tier 갱신 + Realtime 알림

-- 회독 다시 시작 (마이그레이션 reset 옵션)
create function reset_pass_progress() ...
  -- pass_number = 1, pass_marks = [], pass_stamps 삭제, tier = 'bronze'
```

---

## 마이그레이션 — 기존 사용자

### 자동 부여 (default)

```sql
-- 1) 기존 question_stats / sessions 의 pass_number 를 1로 설정 (마이그 0013 default 가 처리)

-- 2) 챕터별 정답률 ≥ 75% 인 곳을 1회독 stamp 자동 부여
insert into pass_stamps (user_id, subject, chapter, pass_number)
select s.user_id, s.subject, s.chapter, 1
from (
  select user_id, subject, chapter,
         sum(correct_count)::float / nullif(sum(total), 0) as accuracy
  from sessions
  where pass_number = 1
  group by user_id, subject, chapter
) s
where accuracy >= 0.75
on conflict do nothing;

-- 3) Tier 재계산 — 모든 사용자 일괄
update profiles p
set pass_tier = case
  -- 두 과목 모두 2회독 완료 stamp 보유 (현재 마이그 시점엔 X — 1회독 stamp 만 가능)
  -- 1회독 완료 stamp 보유한 사용자는 SILVER
  when exists (select 1 from pass_stamps where user_id = p.id and pass_number = 1) then 'silver'
  else 'bronze'
end;
```

### 사용자 옵션 — "회독 다시 시작"

- StatsPage 의 Pass 컬렉션 섹션 하단에 작은 ghost 버튼: **"회독 다시 시작 (진행도 초기화)"**
- 2단계 confirm — 실수 방지
- RPC `reset_pass_progress` 호출 → pass_number=1, stamps 삭제, tier=bronze
- **XP/Level/Streak/Bookmarks 는 보존** (학습 누적은 유지, 회독만 리셋)

---

## 구현 순서 (분리)

### P0 — 데이터·알고리즘 (이번 스텝)

1. ✅ docs/n-pass-design.md 작성
2. supabase/migrations/0013_n_pass_system.sql — 스키마 + RLS + RPC + 마이그
3. src/game/passes.ts — 챕터 완료 판정 + Tier 계산 + sampling 분기 헬퍼
4. src/types/passes.ts — PassTier·PassStamp 타입
5. typecheck + commit + push

### P1 — UI 컴포넌트 (다음 스텝)

6. src/components/passes/PassTierBadge.tsx — 다용도 칩
7. src/components/passes/PassTabs.tsx — 회독 탭 (PlanetScreen 상단)
8. ZoneScreen path 색조 변환 — pass_number 에 따라 Tier 색 적용
9. DialogueLesson 첫 turn 마스코트 인사 분기 (회독별)
10. step 진입 시 인라인 collapsible 리마인더 카드
11. createSession 에 sampling 'pass-N' 추가 (특정 회독만)

### P2 — 통계·리더보드

12. StatsPage 에 Pass 컬렉션 그리드 + Tier 카드
13. FriendsPage 카드 확장 — Tier 띠 + 진행 점 + 정렬 토글 + sticky 본인
14. 마이그레이션 SQL 실행 (production)
15. "회독 다시 시작" 버튼 + reset RPC

### P3 — Realtime + 콘텐츠

16. 친구 Tier 승급 토스트 (Realtime 구독)
17. 신규 배지 5종 (badges.ts 추가)
18. **변형 문제 풀 작성** — 가장 큰 콘텐츠 작업 (a 옵션 = 새로 작성)

---

## 검증 절차

### P0 검증

- migration 0013 실행 후 모든 기존 사용자의 question_stats/sessions/profiles 가 default 값으로 채워짐
- src/game/passes.ts 의 `chapterPassProgress(subject, chapter, pass)` 가 75% 임계 정확히 적용
- typecheck + smoke 14/14 통과

### 출시 전 종합 검증

- 신규 가입자 → BRONZE Tier · 1회독 진행
- 챕터 1 100% 정답 → 2회독 unlock + stamp insert + tier 변경 시 토스트
- 친구 1 명 추가 → 친구 Tier 승급 시 알림 도착
- 회독 다시 시작 → 진행도 0, XP/Level 보존

---

## Risks

| 위험 | 완화책 |
|---|---|
| 변형 문제 작성이 너무 큰 작업 | Chapter 별 점진 출시. 일단 ADSP Ch1 만 시작, 사용자 반응 보고 확장 |
| Tier 승급 race condition | RPC 안에서 `for update` lock. atomic 처리 |
| 기존 사용자 진도 손실 우려 | "회독 다시 시작" = optional + XP/Level 보존 명시 |
| 색상 단어 충돌 (BRONZE/GOLD 등) | 토픽 마스터리를 "탐사도" 로 리네임 (Cadet/Scout/Veteran/Ace/Astro) |
| 친구 알림 피로 | 사용자 옵션 — "Tier 만 / 모두 / 끄기" 3단계 |
