# CLAUDE.md — QuestDP 세션 인계 노트

> **이 파일의 역할.** 새 세션의 Claude 가 "어제까지 어디까지 해놨고, 다음에 뭘 이어야 하며, 건드리면 안 되는 규칙이 뭔지" 를 5분 안에 파악하기 위한 살아있는 문서. 구현이 바뀌면 여기도 같이 업데이트.
>
> **읽는 순서.** (1) 프로젝트 한 문장 → (2) 절대 원칙 → (3) 아키텍처 지도 → (4) 이미 끝낸 것 → (5) 앞으로 할 일 → (6) 치트시트.

---

## 1. 프로젝트 한 문장

**QuestDP** 는 한국 **ADsP(데이터분석준전문가)** · **SQLD(SQL 개발자)** 자격증 학습을 **우주 탐험 RPG + 마이크로 러닝 스테퍼** 로 재구성한 모바일·태블릿 웹앱. Vite + React + TS + Tailwind.

핵심 루프:

```
Galaxy(과목) → Planet(챕터) → Zone(토픽 로드맵)
  → Lesson(개념 1 → 예제 1 → 개념 2 → 예제 2 …)  ▶ 개념 학습 흐름
  → Quest(10문 실전 세트) → Result                ▶ 풀이 흐름
```

---

## 2. 절대 원칙 (깨면 안 되는 것)

1. **PDF 원본 복붙 금지**. `C:\Users\이도현\Desktop\ADsP_완벽대비요약노트_260213.pdf` (패스워드 `5069`) 는 참고만. 모든 개념 설명·비유·암기법·표현은 본 앱을 위한 **오리지널 카피**. 저작권 문제.
2. **"아무것도 모르는 사람이 단번에 이해" 를 기준선**으로 둔다. 시험용 암기 요약이 아니라 초보자용 재구성. 비유·단계별 예시·암기법을 깔고 간다.
3. **한 개념 → 한 예제, 즉시 풀이**. 아티클형 긴 강의 금지. LessonStep 단위로 쪼개서 개념 카드 → 인라인 MCQ → 피드백 → 다음 개념.
4. **Zone 노드 = 스키마 토픽**. `SUBJECT_SCHEMAS[subject].chapters[].topics` 가 UI 의 정답지. 기출 JSON 의 세부 토픽 문자열은 `canonicalTopic()` 으로 스키마 토픽에 매핑돼서만 UI 에 노출된다. 이 규칙을 깨면 "레슨 준비 중" 폴백이 다시 살아난다.
5. **룰 기반 AI 만**. LLM API 호출 없음. 약점 점수 = `oddsWrong*0.5 + timeOverrun*0.3 + recency*0.2`.
6. **모바일·태블릿 우선**. 데스크톱은 부차.
7. **한국어 UI 전량**. 영문 용어는 괄호병기.
8. **절대 복붙 파일 금지**: PDF, 교재 스캔, 타사 문제지 원문.

---

## 3. 아키텍처 지도

### 3.1 라우팅

- **해시 라우터** (`src/App.tsx`) — 최상위 4개 루트: `#/`, `#/game`, `#/stats`, `#/bookmarks`
- **게임 내부는 상태 머신** (`src/game/GamePage.tsx` + `src/game/types.ts#GameScreen`)
  - discriminated union: `galaxy | planet | zone | lesson | quest | result`
  - 뒤로가기는 각 화면의 `onBack` prop 이 담당. 브라우저 뒤로가기 연동 X (의도적).

### 3.2 화면 (`src/game/screens/`)

| 파일 | 역할 |
|---|---|
| `GalaxyScreen.tsx` | 과목 선택 + Daily Mission 진입 |
| `PlanetScreen.tsx` | 챕터 로드맵 (3D beveled 노드 + SVG 지그재그 경로) |
| `ZoneScreen.tsx` | 챕터 내 토픽 로드맵 + 5종 플레이 모드 CTA. **토픽 노드는 스키마 토픽뿐.** 노드 클릭 → `lesson` 전환. |
| `LessonScreen.tsx` | 스텝 기반 개념 학습. **sticky 진행바**(챕터 전체 위치 + 챕터 해결 비율 이중 레이어) · 개념 카드 ↔ 퀴즈 뷰 토글 · **이전/다음 스텝** 네비 |
| `QuestScreen.tsx` | 실전 10문 세트 |
| `ResultScreen.tsx` | 결과 요약 + 리플레이/다른 존 |

### 3.3 데이터 레이어

| 파일 | 역할 |
|---|---|
| `src/data/subjects.ts` | **스키마 원천**. `SUBJECT_SCHEMAS` — 과목 → 챕터 → 토픽. UI 의 진실. |
| `src/data/lessons.ts` | 스텝 기반 레슨 (10개 토픽 × 39 스텝 for ADsP). `LessonBlock` 6종 · `LessonStep{ id, title, blocks, quizId }` · `getLesson/getLessonsInChapter/getChapterSteps` · `getQuizQuestion` |
| `src/data/topicAlias.ts` | **기출 JSON 의 raw 토픽 → 스키마 토픽 정규화 테이블**. `canonicalTopic(subject, chapter, raw)` 가 유일한 매핑 API. 새 기출 추가 후 노드 카운트가 줄었으면 여기에 빠진 별칭 추가. |
| `src/data/questions/*/**/*.json` | 문제 은행. `import.meta.glob(eager: true)` 로 자동 로드. |
| `src/data/questions/adsp/concept-practice.json` | 39 MCQ — LessonStep.quizId 와 1:1 매칭. |
| `src/data/questions/adsp/past-exams/*.json` | 2024-45 · 2024-46 · 2025-47 · 2026-48 기출. raw 토픽은 세부 출제 포인트 수준. |
| `src/lib/questions.ts` | `ALL_QUESTIONS` 평탄화 + 필터링 유틸. |

### 3.4 게임 로직 (`src/game/`)

| 파일 | 책임 |
|---|---|
| `session.ts` | `isPlayable`, `getPlanets`, `getZones` (스키마 토픽 고정), `createSession`, `createDailyMissionSession`, `reviewPoolSize`, `recordAnswer`, `summarize` |
| `storage.ts` | localStorage 기반 `ProgressStore` (version 1). `applyAnswer`/`recordSessionSummary`/`recordSingleAnswer`/`markDailyMissionStarted`. subscribe/publish 로 `useProgress` 와 연결 |
| `aggregate.ts` | `aggregateSubject/Chapter/Topic` — **Topic 은 canonical 기준** |
| `weakness.ts` | 룰 기반 약점 점수. `topicWeaknesses` 는 canonical 버킷으로 집계. null 매핑 문항은 약점 버킷에서 제외 (챕터 전체 풀에는 살아있음) |
| `bookmarks.ts` + `useBookmarks.ts` | 북마크 저장소 |
| `useProgress.ts` | `useSyncExternalStore` 로 storage 구독 |

### 3.5 기타 중요 관례

- **경로 별칭**: `@/* → src/*`
- **폰트**: 한글 제목 `Noto Sans KR 700` (utility class `kr-heading`), 본문 `kr-body`, 필기체 Condiment + Gaegu (`.cursive`)
- **컬러 토큰**: `--base #010828`, `--cream #EFF4FF`, `--neon #6FFF00`, accent per subject (`adsp: #67e8f9`, `sqld: #c084fc`)
- **3D 버튼 패턴**: `radial-gradient` 하이라이트 + `linear-gradient` 본체 + 레이어드 `box-shadow` (하단 -1px 짙은 그림자 + 외부 glow + inset 2px 하이라이트 + inset -5px 어둠)
- **glass 카드**: `.liquid-glass` (backdrop-filter + gradient border)

---

## 4. 이미 끝낸 것 (2026-04-23 기준)

### 4.1 랜딩 & 과금

- 랜딩 섹션 (Hero / About / GameModes / Pricing / CTA)
- 가격: 월 9,900원 고정

### 4.2 문제 은행

- **ADsP 기출 4회차**: 2024-45, 2024-46, 2025-47, 2026-48
- **ADsP 개념 예제 39개** (`concept-practice.json`) — LessonStep 과 1:1
- **SQLD**: `sample.json` 하나뿐 (1문항). 사실상 비어있음
- 라이프사이클: `restored` / `ai-generated` / `draft` / `curated`. `isPlayable` 가 restored 제외.

### 4.3 게임 코어

- 4-tier 상태 머신 라우팅
- 5종 모드: 전체 랜덤 · 약점 집중 · 오답 복습 · 학습 모드 · 시험 모드
- Daily Mission (약점 7 + 복습 3 + 부족분 랜덤, 10문 고정)
- localStorage 진행 저장 (문항별 stat + 세션 레코드)
- 룰 기반 약점 분석 + Zone 노드 "약점" 뱃지

### 4.4 개념 학습 (중요 — 최근 대대적 개편)

- **스텝 기반 마이크로 러닝** 으로 전환 완료
- ADsP 시험범위 전면 커버 — **50 스텝 · 50 MCQ**
  - Ch1 (데이터 이해): 12 스텝 — DIKW · SECI · 빅데이터 3V/5V · 데이터 3법 · DIGITAL·CA메라 · **기업 정보 시스템(DBMS·ERP·CRM·SCM·BI)**
  - Ch2 (데이터 분석 기획): 11 스텝 — What×How · KDD/CRISP-DM · 하향식/상향식 · 우선순위 · 거버넌스 5축 · 성숙도 · **데이터 거버넌스 3요소**
  - Ch3 (데이터 분석): 27 스텝 — 데이터 마트 · EDA · 결측·이상값 · **R 문법** · 척도·분포·추정량·CLT · **PCA · MDS** · 가설검정·t검정·회귀·다중공선성·시계열 · 과적합·앙상블·연관분석·군집·평가지표(+**Lift/Gain**) · **로지스틱 회귀 · 의사결정나무 · K-NN · 나이브베이즈 · SVM · 인공신경망/딥러닝**
- 각 스텝: 개념 블록들 → 인라인 MCQ → 즉시 피드백 → 다음
- **챕터 전체 진행바** (현재 위치 + 해결 비율 이중 레이어, sticky)
- **이전/다음 스텝 네비게이션** — 직전 개념/예제로 왕복 가능
- **암기법**: `callout tone: mnemonic` 블록으로 통일 (공표연내, 업데데이트모델평가전, 탐정해타, 도활확최, 원조프, 저잔재현, 선분정독, 추계순불, 불효일충, 지신향, 생고공의 …)

### 4.5 토픽 정규화 (바로 직전 작업)

- **`src/data/topicAlias.ts`** 신설. 기출에 등장하는 80+ 세부 토픽을 스키마 4-대분류로 매핑.
- `getZones` 가 이제 항상 **SCHEMA 토픽 순서** 대로만 노드를 생성 (고정 4개). 미매핑 문항은 챕터 랜덤/약점 풀에는 남되 토픽 집계에서만 제외.
- `createSession`, `reviewPoolSize`, `aggregateTopic`, `topicWeaknesses` 전부 canonical 비교로 일원화.
- "레슨 준비 중" 폴백은 구조적으로 뜰 일 없음 (단, SQLD 는 레슨이 없으므로 여전히 폴백으로 빠짐 — 아래 TODO 참조).

### 4.6 주변 기능

- 북마크 (`#/bookmarks`)
- 통계 페이지 (`#/stats`)

---

## 5. 앞으로 할 일 (우선순위 순)

### 🟥 P0 — 가장 가까운 구멍

1. **SQLD 레슨 0개**. 과목 선택만 해도 풀 수 있는 문항이 `sample.json` 1개뿐이고 레슨도 없음. SQLD 클릭 시 현 UX 가 매우 빈약. 최소 SQL 기본 (SELECT/WHERE/GROUP BY/JOIN) 레슨 3~4개 + 예제 JSON 우선.
2. **ADsP 스텝당 예제 1개 → 2~3개로 확장**. 현재 `concept-practice.json` 이 step 당 1문. 같은 개념을 다른 각도로 물어보는 드릴이 필요.
3. **레슨 완료 축하 화면**. 마지막 스텝 예제까지 맞추면 "챕터 \[N\] 개념 클리어" 피드백 → 바로 실전 세트 유도. 현재는 "실전 세트로 마무리" 버튼이 작아서 임팩트 부족.

### 🟧 P1 — UX 완성도

4. **캐러셀 기반 개념 카드**. 개념 블록이 길어질 때 세로 스크롤 대신 좌우 스와이프. 모바일 몰입 강화.
5. **Zone 노드 "레슨 완료" 표식**. 현재는 "개념" 뱃지가 레슨 존재 여부만 표시. 해당 레슨의 모든 스텝을 풀었으면 금색/체크 상태로.
6. **실전 세트 중 개념 힌트 버튼**. Quest 화면에서 해당 문항이 속한 LessonStep 으로 잠시 다녀올 수 있는 "개념 보기" 링크.
7. **오답 복습 큐의 개념 재노출**. 같은 stat 의 문항을 복습할 때 해당 LessonStep 을 먼저 짧게 상기시키고 재풀이.

### 🟨 P2 — 콘텐츠 확장

8. 기출 회차 추가 인제스트 시 `topicAlias.ts` 에 별칭 누락 체크 스크립트. 현재는 수동. 빌드 타임에 "매핑되지 않은 raw 토픽" 을 경고로 띄우는 dev assertion 이 이상적.
9. ADsP 다른 회차 (2023 이전 등) 추가.
10. 단답/빈칸 문제 유형 지원 (현재 MCQ 만 `isPlayable`).

### 🟦 P3 — 메타/인프라

11. 번들 분할 — 현재 `Planet-*.js` 894KB 경고 (three.js). 라우트 기반 dynamic import 로 쪼개기.
12. PWA 화 — Daily Mission 홈 화면 아이콘.
13. `.claude/session-handoff.json` 내용은 2026-04-18 기준이라 낡음. 이 CLAUDE.md 가 대체하므로 점진적으로 폐기.

### 🟪 P0 — Supabase 연동 (친구 경쟁 실시간 진행상황)

**현재 상태 (2026-04-27)**: 친구 시스템은 **localStorage 만 쓰는 미리보기**. UI 와 데이터 모양은 다 깔려있어 서버만 붙이면 즉시 작동.

#### 14. 데이터 모델 (Postgres)

```sql
-- 개인 프로필
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  tag text not null unique,                                -- Q-XXXX-XXXX
  display_name text not null default '',
  avatar_pose text not null default 'wave'                 -- Ques 8 포즈 enum
    check (avatar_pose in
      ('idle','happy','sad','celebrate','sleep','wave','think','lightbulb')),
  total_xp integer not null default 0,
  level integer not null default 1,
  streak_days integer not null default 0,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_tag_idx on profiles(tag);

-- 친구 관계 (단방향 — A 가 B 를 추가했다고 B 가 A 를 자동 추가하진 않음)
create table friendships (
  user_id uuid references profiles on delete cascade,
  friend_id uuid references profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);

-- RLS
alter table profiles enable row level security;
alter table friendships enable row level security;

create policy profiles_read_self on profiles for select using (id = auth.uid());
create policy profiles_read_friends on profiles for select using (
  id in (select friend_id from friendships where user_id = auth.uid())
);
create policy profiles_update_self on profiles for update using (id = auth.uid());
create policy friendships_read_self on friendships for select using (user_id = auth.uid());
create policy friendships_insert_self on friendships for insert with check (user_id = auth.uid());
create policy friendships_delete_self on friendships for delete using (user_id = auth.uid());
```

#### 15. 클라이언트 교체 포인트 (구조는 이미 갖춤)

| 현재 (localStorage) | 교체 후 (Supabase) |
|---|---|
| `src/data/profile.ts` `getMyProfile()` | `select * from profiles where id = auth.uid()` (없으면 insert + tag 생성 RPC) |
| `src/data/profile.ts` `setDisplayName(n)` | `update profiles set display_name = n where id = auth.uid()` |
| `src/data/profile.ts` `setAvatarPose(p)` | `update profiles set avatar_pose = p where id = auth.uid()` |
| `src/data/friends.ts` `listFriends()` | `select profiles.* from friendships join profiles on friend_id = profiles.id where user_id = auth.uid() order by total_xp desc` (avatar_pose 포함) |
| `src/data/friends.ts` `addFriend(tag, myTag)` | RPC `add_friend_by_tag(target_tag text)` — 태그 → friend_id 변환 + insert |
| `src/data/friends.ts` `removeFriend(tag)` | `delete from friendships where user_id = auth.uid() and friend_id = (select id from profiles where tag = $1)` |
| `subscribeFriends(cb)` | `supabase.channel('public:profiles').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, cb)` — 친구가 avatar_pose 바꾸면 즉시 리더보드 반영 |

**아바타 동기화 검증**: `FriendEntry.avatarPose` 가 이미 데이터 모델에 들어가 있고 `Leaderboard` 가 그 값으로 `<Ques>` 를 렌더하므로, Supabase 응답 형태만 `{ tag, display_name, avatar_pose, total_xp, level, streak_days, last_seen_at }` 로 매핑되면 UI 변경 없음. realtime UPDATE 이벤트가 들어올 때 `setFriends(...)` 만 다시 호출하면 친구의 표정 변화도 즉시 화면에 반영.

#### 16. 서버에서 갱신할 컬럼 — 어디서 쓰는지

`profiles.total_xp / level / streak_days / last_seen_at` 는 클라이언트가 세션 종료 시 RPC `bump_progress(xp_delta int, streak int)` 로 푸시. 친구 화면이 realtime 구독하고 있으면 자동 라이브 갱신.

#### 17. 마이그레이션 순서

1. `auth` 만 먼저 도입 (이메일 magic link).
2. profile 자동 생성 trigger — auth.users insert 시 profile row + 고유 tag 생성.
3. 클라이언트 fallback — Supabase 응답 실패 시 localStorage 로 그레이스풀 다운그레이드.
4. UI 의 "현재는 로컬 미리보기" 안내 문구 제거 (`src/game/FriendsPage.tsx` 하단).

### ⚡ P0 — 에너지(번개) 시스템 + 무료/유료 게이트

**현재 상태**: UI 상의 ⚡ 아이콘은 단순히 `playerStats.level` 을 보여주는 placeholder. 실제 에너지 소모/회복 로직 X. 로드맵 잠금 X. 결제 X.

**의도된 동작 (랜딩 Pricing 카피와 일치)**:

| 정책 | 무료 | 프리미엄 |
|---|---|---|
| ⚡ 보유 한도 | 5 | ∞ |
| ⚡ 소모 시점 | 개념 step 풀이 / 모의고사 진입 / 오답 복습 = 1회 | 무관 |
| ⚡ 회복 | 30분당 1회 (최대 5) | 즉시 5/5 항상 |
| 로드맵 | 순차 잠금 — 앞 step 클리어해야 다음 해금 | 자유 — 어떤 챕터·스텝도 즉시 |
| 챕터 모의고사 1·2·3·Final | 슬롯당 1회 무료 시도 후 ⚡ 소모 | 무제한 재시도 |

#### 18. Postgres 스키마 (에너지)

```sql
-- 사용자별 에너지 상태 — 2-컬럼만 있어도 lazy regen 계산 가능
alter table profiles add column if not exists energy_count integer not null default 5;
alter table profiles add column if not exists energy_updated_at timestamptz not null default now();
alter table profiles add column if not exists is_premium boolean not null default false;
alter table profiles add column if not exists premium_until timestamptz;

-- 잠금 해제 상태 — step 단위 ("subject-chapter-topic-stepIdx" 키)
create table step_unlocks (
  user_id uuid references profiles on delete cascade,
  step_key text not null,                          -- "adsp-1-데이터의 이해-2"
  unlocked_at timestamptz not null default now(),
  primary key (user_id, step_key)
);
```

#### 19. RPC — `consume_energy(amount int default 1)`

서버에서 atomic 처리. 트랜잭션 안에서:

```sql
-- 의사 코드
1. select energy_count, energy_updated_at, is_premium from profiles where id = auth.uid() for update
2. is_premium 이면 곧장 ok 반환 (소모 없음)
3. lazy regen: 마지막 갱신부터 30분당 +1 (최대 5) 계산해 energy_count 갱신
4. if energy_count < amount → return { ok: false, retryAfterSec: ... }
5. update profiles set energy_count = energy_count - amount, energy_updated_at = now()
6. return { ok: true, remaining, retryAfterSec: 0 }
```

#### 20. 로드맵 잠금 RPC — `unlock_next_step(prev_step_key)`

세션 종료 시 (정답률 ≥ 60% 같은 기준 충족) 다음 스텝 키를 계산해 step_unlocks 에 insert. 프리미엄은 모든 step 을 미리 unlock 처리하거나, 클라이언트가 is_premium 이면 잠금 무시.

#### 21. 클라이언트 통합 포인트 (현재 코드)

| 호출 시점 | 추가 작업 |
|---|---|
| `LessonScreen` / `DialogueLesson` 진입 시 | RPC `consume_energy(1)` — false 면 차단 모달 |
| `ZoneScreen` 모의고사 슬롯 클릭 | RPC `consume_energy(1)` (슬롯당 첫 시도면 free, 재시도면 ⚡ 소모 — 정책 결정 필요) |
| 세션 종료 후 | RPC `unlock_next_step(currentStepKey)` |
| `MobileTopBar` ⚡ 아이콘 표시 | 무료: `energy_count`, 프리미엄: ∞ 아이콘 표시. realtime 구독으로 30분마다 자동 갱신 |
| Zone step 노드 렌더 | unlocked 여부에 따라 disabled / lock 아이콘 |

#### 22. 결제 게이트

- Stripe (또는 Toss Payments) 구독 → webhook → `update profiles set is_premium = true, premium_until = period_end`
- 만료 시 cron job 또는 lazy check (`is_premium and premium_until < now()` 면 false 로 회수)
- 클라이언트 `useProfile()` 가 `is_premium` 내려주고 모든 게이트 분기 사용

#### 23. UI 안내 문구

- 차단 모달: "⚡ 0개 — 다음 충전까지 N분, 또는 프리미엄으로 전환"
- 잠금 step 클릭 시: "앞 단계를 먼저 클리어하세요 (또는 프리미엄으로 자유 진행)"

---

## 6. 자주 쓰는 파일 치트시트

### 개념 / 레슨 수정할 때

- 개념 카드 추가/수정 → `src/data/lessons.ts`
- 개념 예제 추가/수정 → `src/data/questions/adsp/concept-practice.json` (id 규칙: `adsp-<ch>-<topic>-cp-<nn>`)
- LessonStep 과 예제의 `quizId` 는 반드시 1:1

### Zone 에 새 노드가 안 보일 때

1. 해당 문항의 `q.chapter` 가 맞는지 (기출 JSON 의 chapter 필드 오기입 자주)
2. `canonicalTopic(subject, chapter, q.topic)` 이 null 이면 `src/data/topicAlias.ts` 에 별칭 추가
3. 그래도 안 보이면 `getZones` 가 `chapterMeta.topics` 를 그대로 내보내는지 확인

### 새 토픽 추가할 때

1. `src/data/subjects.ts` 의 `topics` 에 추가 (스키마 원천)
2. `src/data/lessons.ts` 에 Lesson 작성
3. `src/data/questions/<subject>/concept-practice.json` 에 예제 추가 (quizId 매칭)
4. `src/data/topicAlias.ts` 는 raw → 새 토픽 매핑 있으면 추가

### 명령어

```bash
npm run dev        # Vite dev (port 5173)
npm run build      # tsc -b && vite build
npm run preview    # 프리뷰 (port 4173)
npm run typecheck  # tsc --noEmit
```

### 흔한 함정

- `q.topic === targetTopic` 로 직접 비교하면 기출 문항이 매칭 안 됨. **반드시** `canonicalTopic()` 경유.
- `createSession` 에서 topic=null 은 "챕터 전체 랜덤" 의미.
- `recordAnswer` 는 세션 불변 — 항상 새 객체를 돌려주고 호출측이 `setScreen` 으로 교체해야 함.
- PDF 텍스트는 `pdf_extracted.txt` / `pdf_full.txt` 에 추출돼 있지만 **그대로 문자열을 UI 에 쓰면 안 됨** (저작권).

---

## 7. 메타

- 현재 워크트리: `C:\Users\이도현\Desktop\.claude\worktrees\hardcore-shamir-47f5ab`
- 사용자 이메일: dohyeonlee13@gmail.com
- 마지막 대규모 변경: 2026-04-23
  - 스텝 기반 레슨 체계 전면 개편
  - LessonScreen 재작성 (sticky 진행바 + 이전/다음 네비)
  - 토픽 정규화 레이어 (`topicAlias.ts`) 도입
- **세션 이어받을 때**: 이 문서 먼저 → `src/game/GamePage.tsx` → `src/data/lessons.ts` → `src/data/topicAlias.ts` 순으로 훑으면 30분 안에 손 들어간다.

---

## 8. 사이드 토픽 — 보류 중

### 사업화 / 결제 / 세무 (보류)

- 2026-04-27 결정: **결제·사업자등록 보류**, 배포 + 콘텐츠 우선
- 사용자가 "사업자 / 결제 / 토스 / 세금 / 부가세 / 종소세" 관련 질문을 다시 꺼내면
  → **`docs/business-setup-roadmap.md`** 부터 펼치기. 그 문서에 모든 단계·서류·업종 코드·세금 캘린더 정리되어 있음
- 자동화 산출물: **`scripts/monthly-report.mjs`** + `npm run report` — Supabase 데이터 → Excel 7-시트 보고서. service_role 키만 `.env.local` 에 추가하면 바로 동작
