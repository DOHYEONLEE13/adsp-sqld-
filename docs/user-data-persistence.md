# 사용자 데이터 영속성 가드레일

> 다기기 동기화 결함 (2026-04-30) 의 회고 + 재발 방지 원칙 + 신규 기능 체크리스트.
> 이 문서를 어기는 PR 은 리뷰에서 즉시 reject.

---

## 1. 이번 결함의 근본 원인

같은 계정으로 다른 기기에 로그인했을 때:
1. 닉네임이 저장 안 됨
2. 고유 태그가 매번 새로 생성됨
3. 학습 진행 상황이 보이지 않음

### 코드 추적 결과 (Phase 1 진단)

원인은 **하나의 일관된 패턴 결손** 이었다 — "server → client pull" 코드가 진행 상황 영역에만 부재.

| 데이터 영역 | localStorage | server 테이블 | server → local pull |
|---|---|---|---:|
| profile (tag·displayName) | ✓ | profiles | ✓ (재시도 약함) |
| bookmarks | ✓ | bookmarks | **✓** |
| examDates | ✓ | exam_dates | **✓** |
| **progress (sessions+question_stats)** | ✓ | sessions·question_stats | **✗ 결손** |
| activeSubject·lessonXp·lastDailyMissionAt | ✓ | (컬럼 일부 결손) | ✗ 결손 |

`bookmarks.ts` · `examDate.ts` · `profile.ts` 는 `pull...()` 함수 + `init...Sync()` 의 SIGNED_IN handler 패턴이 정확히 갖춰져 있었음. **`storage.ts` (progress) 만 이 패턴 부재**.

`migrate.ts` 도 흐름이 단방향이었다 — server count > 0 면 skip → 다른 기기 로그인 시 server → local 흐름이 한 줄도 없음.

### 왜 이렇게 만들어졌나

추정:
1. 초기 설계가 "localStorage = sole truth" 패턴 (게스트 모드 우선)
2. server sync 는 후행 추가 — bookmarks·examDates 작성 시점엔 양방향이 자연스러웠으나
3. progress 는 게스트 사용자 학습 데이터를 보존하는 게 우선이라 단방향 push 로 시작
4. 다기기 시나리오 테스트가 없어서 발견 지연

---

## 2. 사용자 데이터 처리 원칙 (필수)

### 원칙 1 — 사용자별 영속 데이터는 반드시 서버 DB

| 카테고리 | 예시 | 저장 위치 |
|---|---|---|
| **사용자별 영속** | 닉네임·진도·북마크·결제 이력 | **서버 DB 필수** |
| 클라이언트 캐시 | 마지막 페이지 스크롤·UI 토글 | localStorage OK |
| 세션 임시 | 입력 중인 폼·모달 토글 | sessionStorage OK |

**판별 질문**: "사용자가 다른 기기에서 로그인했을 때 이 값이 그대로 보여야 하나?"
- **YES** → 서버 DB
- **NO** → localStorage / sessionStorage 가능

### 원칙 2 — 클라이언트 저장소는 "캐시 용도로만"

```
┌─ 잘못된 패턴 (이번 결함의 progress) ────────────┐
│  localStorage = sole truth                       │
│  서버에는 push 만, pull 없음                     │
│  → 다른 기기에서 데이터 누락                    │
└─────────────────────────────────────────────────┘

┌─ 올바른 패턴 (bookmarks·examDates) ─────────────┐
│  서버 DB = sole truth                            │
│  localStorage = 빠른 1차 캐시 (network-free 응답)│
│  setter → localStorage 즉시 반영 + server push   │
│  initSync → SIGNED_IN 시 server pull → 캐시 갱신 │
└─────────────────────────────────────────────────┘
```

### 원칙 3 — 클라이언트 생성 ID 는 서버에서 발급, 클라는 조회만

이번 결함의 가장 미묘한 측면 — 고유 태그.

**잘못된 패턴**: 클라이언트가 `generateTag()` 즉시 호출 → localStorage 저장.
- 인증 상태에서도 server 응답 도착 전 임시 태그가 노출.
- 사용자에게 "태그가 매번 다름" 으로 인지됨.

**올바른 패턴**:
- 인증된 상태: 서버 트리거 (`on_auth_user_created`) 가 발급 → 클라는 read-only.
- 게스트 한정: 클라가 임시 태그 발급 OK (어차피 서버에 없음).
- 인증 후 server pull 결과 도착 전: **`pendingServerSync=true` 로 UI 가 skeleton** — 임시 태그 절대 노출 X.

---

## 3. 신규 기능 추가 시 체크리스트

PR 리뷰에서 다음을 모두 체크:

### 데이터 분류
- [ ] 이 데이터는 **사용자별 영속** 인가?
  - YES → 서버 DB 컬럼/테이블 필요. 마이그 SQL 작성.
  - NO → localStorage 가능, 사용자별 분리 X.
- [ ] **다른 기기에서 동일하게** 보여야 하는가?
  - YES → server pull 코드 필수. `bookmarks.ts` 의 `pullBookmarks()` 패턴 차용.
  - NO → 클라 캐시만으로 OK.

### sync 패턴 적용
- [ ] setter 가 호출되면:
  - localStorage 즉시 반영 (UI 반응성)
  - 서버 push (fire-and-forget OK, 다만 race 위험 있으면 inflight tracker 사용)
- [ ] init 함수가 다음을 모두 처리:
  - mount 시 1회 pull
  - `SIGNED_IN` / `INITIAL_SESSION` 이벤트 시 pull
  - `window.online` / `document.visibilitychange` 이벤트 시 pull (네트워크/탭 복귀)
- [ ] 다른 사용자로 로그인 감지 → local clear 후 pull

### 충돌 정책
- [ ] **last-write-wins 가 적합한가?**
  - 사용자 1명·기기 N대 동시 사용 — 보통 OK.
  - 둘이 다른 의도로 동시 변경할 수 있는 데이터면 버전 필드 도입 검토.
- [ ] **XP·점수 같은 누적 값은 max(server, local)** 로 손실 방지.
  - 일반 last-write-wins 면 한쪽이 작은 값으로 덮어쓸 위험.

### 테스트
- [ ] **다기기 시나리오 수동 테스트** 6 케이스 (아래 4 절):
  1. 기기 A 가입·설정·5문 풀이·로그아웃
  2. 기기 B 로그인 → 모든 데이터 보임
  3. 기기 B 추가 풀이 → 기기 A 새로고침 시 반영
  4. 동시 로그인 + 양쪽 변경 → last-write-wins 검증
  5. localStorage 비우고 재로그인 → 데이터 복구
  6. 네트워크 차단 시 적절한 에러 노출
- [ ] **머지 함수가 있다면 단위 테스트**:
  - `progressMerge.test.ts` 가 모범. 순수 함수 + vitest.

---

## 4. 다기기 시나리오 수동 테스트 가이드

### 테스트 환경 준비
- 두 기기 (또는 두 브라우저 / 시크릿 창) 준비
- 같은 OAuth 계정 사용 (Google 또는 Kakao)
- DevTools → Application → Local Storage 로 키 확인 가능

### 시나리오 1 — 기기 A: 회원가입·세팅·풀이

1. 기기 A 에서 사이트 접속
2. 우측 상단 "로그인" → Google OAuth
3. 헤더의 "닉네임 설정" 클릭 → 닉네임 입력 (예: "테스터")
4. ADSP Galaxy 진입 → Ch1 → Topic 1 step 1~5 풀이
5. 결과 화면에서 "오답 전체 북마크" 클릭
6. 우측 상단 메뉴 → 로그아웃

**검증 — 기기 A**:
- 헤더에 "테스터" 표시 (닉네임 보존)
- StatsPage 의 풀이 통계: 5문항 + 정답률
- BookmarksPage 의 북마크 X개

### 시나리오 2 — 기기 B: 동일 계정 로그인

1. 기기 B 에서 사이트 접속 (clean state — localStorage 비어 있음)
2. Google OAuth 로 같은 계정 로그인
3. 로그인 직후 **약 0~3초간 헤더에 skeleton (회색 박스 + pulse)** 노출 — 정상.
4. server pull 완료되면 "테스터" 닉네임 + 진짜 태그 표시.
5. ADSP Galaxy 진입.

**검증 — 기기 B에서 보여야 하는 것**:
- ✓ 헤더 닉네임 = "테스터" (기기 A 와 동일)
- ✓ Friends 페이지 → 본인 카드의 태그 = 기기 A 와 동일 `Q-XXXX-XXXX`
- ✓ ADSP Ch1 진행률 = 기기 A 와 동일
- ✓ StatsPage 풀이 통계 = 기기 A 와 동일
- ✓ BookmarksPage 의 북마크 = 기기 A 와 동일

### 시나리오 3 — 기기 B 추가 풀이 → 기기 A 반영

1. 기기 B 에서 ADSP Ch1 추가 step 5 문 풀이
2. 기기 A 에서 새로고침 (또는 탭 다시 가시화)
3. 기기 A 의 진행률·풀이 통계가 5+5 = 10문으로 갱신

**검증**: visibilitychange 이벤트로 자동 pull 동작.

### 시나리오 4 — 동시 로그인 충돌

1. 기기 A 와 B 동시 로그인 상태
2. 기기 A 에서 닉네임을 "Foo" 로 변경
3. 5초 안에 기기 B 에서 닉네임을 "Bar" 로 변경
4. 1분 후 양쪽 새로고침

**검증**: last-write-wins → "Bar" 표시 (기기 B의 변경이 더 늦었으므로).

### 시나리오 5 — localStorage 비우고 재로그인

1. 기기 B 에서 DevTools → Application → Local Storage → 모두 삭제
2. 페이지 새로고침
3. 자동으로 게스트 모드 (또는 로그인 페이지)
4. 다시 로그인

**검증**: 모든 데이터 (닉네임·태그·진행 상황·북마크) 복구. 임시 태그 절대 노출 X.

### 시나리오 6 — 네트워크 차단

1. DevTools → Network 탭 → "Offline" 체크
2. 페이지 새로고침
3. **헤더 아래 sticky banner**: "오프라인 — 풀이는 계속 가능…" 노출
4. 학습 진행은 가능 (localStorage 에 즉시 반영)
5. Network 다시 "Online" 체크
6. Banner 자동 사라짐 + outbox 큐 자동 flush + pull 재시도

**검증**: 풀이 차단 X, banner 명확 노출, 복구 시 자동 정상화.

---

## 5. 핵심 파일 지도 (인계용)

신규 sync 추가 시 참고:

```
src/
├── data/
│   ├── profile.ts               — 양방향 sync 정석. 5회 retry + pendingServerSync 가드.
│   ├── friends.ts               — Realtime 채널 구독 모범
│   └── reminders.ts             — 정적 데이터 (sync 무관)
├── game/
│   ├── storage.ts               — ProgressStore. setter 들이 server push 후크
│   ├── progressSync.ts          — server → local pull + inflight tracker
│   ├── progressMerge.ts         — 순수 머지 함수
│   ├── progressMerge.test.ts    — 12개 회귀 테스트
│   ├── progressMetaSync.ts      — profiles meta 컬럼 push
│   ├── sessionSync.ts           — outbox + RPC push (idempotent)
│   ├── questionStatSync.ts      — question_stats upsert
│   ├── bookmarks.ts             — bookmarks 양방향 sync (push + pull)
│   └── examDate.ts              — exam_dates 양방향 sync
├── lib/
│   ├── supabase.ts              — 클라이언트 + signOut + onAuthStateChange
│   └── migrate.ts               — localStorage → server 일회 마이그레이션
└── components/
    ├── profile/ProfileSyncSkeleton.tsx — pendingServerSync UI
    └── sync/
        ├── OfflineBanner.tsx          — 오프라인 1줄 알림
        └── useOnlineStatus.ts         — navigator.onLine 훅
```

---

## 6. 마이그레이션 이력

| # | 마이그 | 변경 |
|---|---|---|
| 0014 | `lesson_xp` 컬럼 | profiles.lesson_xp 추가 — ProgressStore.lessonXp 양방향 sync 위함 |

향후 destructive 마이그 (컬럼 삭제·타입 변경) 는 PR 에서 명시 + 사용자 승인 필수.

---

## 7. 회고 — 같은 결함 재발 방지를 위해

1. **패턴 일관성** — sync 영역 추가 시 `bookmarks.ts` 또는 `examDate.ts` 의 패턴을 그대로 베끼고, pull/init 함수 한 쌍 작성을 잊지 않는다.
2. **다기기 테스트가 항상 마지막 검증** — typecheck + test + smoke 만으로는 이 결함을 잡지 못함. 6 시나리오 수동 검증을 PR 가드로.
3. **임시 ID 클라 발급은 위험** — 인증된 상태에선 server 가 sole authority. UI 는 server 응답 도착까지 placeholder.
4. **단방향 sync 는 false sense of security** — push 만 있으면 데이터가 server 에 잘 쌓이는 듯 보이지만 다른 기기는 못 본다.

---

마지막 갱신: 2026-04-30 · 다기기 동기화 결함 수정 시 작성.
