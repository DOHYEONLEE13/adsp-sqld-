# QuestDP ROADMAP

> 출시 후 잊지 않기 위한 일감 박스. 우선순위순 정리.
> 각 항목 옆에 (P0/P1/P2/P3) 표시 + 추정 작업량.

---

## 코드베이스 표준 — 외부 store 데이터는 반드시 안전한 hook 사용 (2026-05-07 채택)

### 배경
2026-05-07 인증 시스템 stuck 사고 — 5번의 fix 후에도 새로고침 필요한 증상 잔존. 원인:
profile/energy/passSync/stepUnlocks 의 sync 함수는 안전하게 고쳤지만, **그 데이터를 읽는
4 컴포넌트** (MobileGameNav · ProfileCustomizer · PlanTag · FriendsPage) 가 직접
`useState + useEffect + subscribeXxx` 패턴 사용 → React state race 잔존.

### 표준
**외부 store (profile / energy / passSync / stepUnlocks) 의 데이터를 React 컴포넌트에서
읽을 때는 반드시 다음 hook 만 사용:**

| 데이터 | 안전 hook (사용 ✅) | 금지 패턴 (사용 ❌) |
|---|---|---|
| 내 프로필 | `useMyProfile()` from `@/data/profile` | `useState(getMyProfile()) + useEffect(subscribeProfile)` |
| 에너지 / is_premium | `useEnergy()` from `@/game/energy` | `useState(_state) + useEffect(_listeners.add)` |
| Pass tier / stamps | `usePassSnapshot()` from `@/game/passSync` | 동일 |
| Step 잠금 | `useStepUnlocks()` from `@/game/stepUnlocks` | 동일 |

### 이유
- React 의 `useState + useEffect` 패턴은 first render ↔ listener 부착 사이 race window 존재
- 그 윈도우에서 외부 setState 가 fire 되면 update 영구 미반영 (stale stuck)
- `useSyncExternalStore` (위 hook 들 내부 사용) 는 React 가 자체적으로 race 처리
- concurrent rendering 안전성도 보장

### 코드 리뷰 체크
- 새 컴포넌트 PR 에서 `useState(getMyProfile())`, `useState(_state)` 같은 패턴 발견 시
  즉시 hook 으로 교체 요구
- 새 외부 store 신설 시 처음부터 `useSyncExternalStore` 기반 hook 으로 export
- `subscribeXxx` export 는 hook 외에는 사용 자제 (필요 시 hook 안에서만 internal 사용)

### 회피 케이스
- React 외부 (예: storage.ts 의 메타 push 같은 비-React 코드) 는 `subscribeXxx` 직접 사용 가능
- 1-shot 측정 (mount 시 한 번만 읽고 안 추적) 도 `getXxx()` 직접 사용 가능 — 단 추적 필요 시 hook 으로

---

## 출시 전 P0 (반드시 해야 하는 것)

### Phase 4 Step 6 — Supabase 마이그레이션 일괄 적용 (2~3일, P0)
> 이전엔 Step 5 였으나 Step 5 (합격 예측) 이 합쳐 자리잡음. 마이그레이션은 Step 6 으로 번호 정렬.

Step 1~4 의 localStorage mock 을 운영 DB 로 전환.

- **마이그레이션 0024** (review_items 테이블) 적용 + RLS
- **마이그레이션 0025** (study_plans + study_plan_replans) 적용 + RLS
- 마이그레이션 0026 (onboarding profiles 확장 — persona, background 등)
- **마이그레이션 0027** (cohort_stats — 합격 예측 점수 누적 통계, Step 5 자산)
- 클라이언트 RPC 전환:
  - `onboardingStorage` → Supabase profiles
  - `studyPlanStorage` → Supabase study_plans RPC
  - `reviewItemStorage` → Supabase review_items RPC
  - `lastActive` → profiles.last_active_at
  - `predictionCache` → cohort_stats RPC (재계산 트리거)
- localStorage fallback 유지 (게스트/오프라인)
- 다기기 sync 검증

### Phase 4 Step 6 — sessions 데이터 통합 (1~2일, P0)

- progressTracker 가 mock 이 아닌 실제 sessions 데이터 사용
- 실시간 진도 갱신 검증

### Step 7 — 통합 테스트 + 출시 준비 (3~5일, P0)

지시서 4절 출시 직전 사용자 테스트 시나리오 (PHASE4_STEP4_INSTRUCTIONS.md):

**신규 사용자 풀 플로우:**
1. onboarding 입력 (입문자 비전공)
2. 학습 플랜 확인
3. 첫 lesson 진입 (1 클릭)
4. 학습 진행 (정답/오답 혼합)
5. 다음 날 재진입 → 복습 큐 표시 확인
6. 3일/7일 망각 시점 시뮬레이션
7. 미접속 7일 후 큐 재계산 옵션 확인

**재응시생 풀 플로우:**
1. onboarding (재응시생 진단형)
2. 진단 테스트 진행
3. 약점 단원 학습 시작
4. 변형 문제 회독 검증
5. 합격 예측 점수 변화 추적

**게스트 플로우:**
1. onboarding 미진행
2. 게임 화면 진입
3. OnboardingPromptBanner 동작 확인
4. legacy chooser 동작 확인
5. 기존 review.ts (수동 복습) 작동 확인

이 테스트 안 하고 출시하면 사용자 사고 발생 가능성 ↑.

### Tier 0 SEO (1~2일, P0)

`docs/seo-strategy.md` 또는 plan 파일 참조.

- robots.txt + sitemap.xml + 페이지별 meta
- JSON-LD (Organization + WebSite)
- OG 이미지 1200×630
- 네이버 Search Advisor + Google Search Console 등록

### 결제 시스템 (3~5일, P0)

PHASE4 Step 6 — Toss Payments 통합. Premium 가격 모델.

### Cloudflare 캐시 정책 강화 (1일, P0) — 2026-05-07 약점 탭 사고에서 발견

**배경**: 2026-05-07 production 약점 탭 ErrorBoundary 트리거. 콘솔 에러:
```
TypeError: Failed to fetch dynamically imported module:
https://quest-dp.com/assets/ProgressDashboard-B0Ar17zR.js
```
원인은 코드 결함 아님 — **Cloudflare 캐시 mismatch**. 사용자 브라우저가 옛 `index.html` 받음 → 그 안의 chunk hash 가 새 배포에선 존재 안 해 404. 출시 후 GitHub push 마다 같은 사고 재발 가능성 ↑.

**작업 항목**:

- [ ] **`index.html` 캐시 정책 — `Cache-Control: no-cache, must-revalidate`**
  - `public/_headers` 의 `/index.html` 룰 추가 (현재는 `/*` 통합 룰만 있어 정적 자산과 같이 캐시됨)
  - 매 요청 시 ETag 검증 → 새 빌드면 즉시 새 index.html 받음
- [ ] **정적 자산 — `Cache-Control: public, max-age=31536000, immutable`**
  - 이미 `public/_headers` 에 `/assets/*` 룰 있음 — 검증만
  - Vite 가 hash 붙이므로 immutable 안전
- [ ] **chunk 404 자동 복구** (P1, 신중) — `vite-plugin-pwa` 의 auto-reload 또는 직접 보호 코드
  ```ts
  // App.tsx 최상단
  window.addEventListener('vite:preloadError', () => {
    if (!sessionStorage.getItem('questdp.reloaded')) {
      sessionStorage.setItem('questdp.reloaded', '1');
      window.location.reload();
    }
  });
  ```
  - 무한 reload 방지 위해 sessionStorage flag — 첫 실패 1번만 자동 reload
  - 방안 P (별개 작업) 와 충돌 가능 — 출시 직전 신중 검토

**검증**:
1. 배포 직후 새 chunk hash 확인
2. 강제 새로고침 (`Ctrl+Shift+R`) 없이 일반 새로고침으로 새 빌드 도달하는지
3. DevTools Network 탭 — `index.html` 응답에 `Cache-Control: no-cache` 헤더 확인

**왜 P0 인가**: 출시 후 매 deploy 마다 일부 사용자 (옛 index.html 캐시 보유) 가 404 ErrorBoundary 경험. 첫인상 손상 + 신뢰 하락. 30분 작업으로 영구 해결.

---

## 출시 후 우선순위 작업

### SEO 5축 90일 플랜 — 출시 후 안정화 (1~3개월) 후 진입 (P1)

**현재 상태 (2026-05-07)**: 출시 전 Tier 0 SEO (위 P0 항목 — robots/sitemap/meta/JSON-LD/검색 콘솔 등록) 만 마무리. 그 외 모든 SEO 활동은 **출시 + 1~3개월 안정화 후** 진입.

이유:
- 사용자 데이터·결제 시스템·인증 race fix 등 출시 직전 작업이 SEO 보다 우선
- SEO 는 누적 가치 자산 — 6~12개월 단위 효과. 안정화 끝난 후 시작해도 KPI 영향 없음
- 콘텐츠 (blog 24편 / topic hub 30 / glossary 200) 양산은 운영 동력 분산

**참조 문서**: `docs/seo-strategy.md` — 5축 90일 플랜 (측정 인프라 / SPA prerender / 콘텐츠 / E-E-A-T / 속도)

**진입 트리거**:
- Phase 4 Step 6 (결제 / Supabase 마이그레이션) 완료
- Phase 4 Step 7 (출시 준비 통합 테스트) 통과
- 출시 후 2~4주 incident free 운영 확인

진입 후 첫 작업: Phase 0 (GSC + GA4 등록) — 1주 내. 이후 docs/seo-strategy.md 의 90일 플랜 그대로 실행.

### 콘텐츠 보강 (P1)

#### variant_group 보강 — 망각 곡선 변형 문제 정확도 ↑

현재 커버리지 (Phase 4 Step 4 Discovery 측정):

| 시험 | 챕터 | 커버리지 |
|---|---|---|
| ADsP | ch1 (데이터의 이해) | 14.7% |
| ADsP | ch2 (가치와 미래) | 20.5% |
| ADsP | ch3 (사이언스) | 40% |
| ADsP | 2과목 ch1, ch2 | **0%** |
| ADsP | 3과목 전체 | **0%** |
| SQLD | 전체 chapter | **0%** |

작업 항목:
- [ ] **SQLD 전체 variant_group 보강** (P1) — 5 chapter × 평균 50문항
- [ ] **ADsP 2과목 ch1, ch2 variant_group 보강** (P1)
- [ ] **ADsP 3과목 ch1~ch3 variant_group 보강** (P1)
- [ ] **`variant_group_helper.mjs` 자동 생성 스크립트** (P2) — 같은 chapter 내 유사 문항 클러스터링

영향 — 사용자가 같은 문제 반복 풀이 = 단순 암기. variant_group 매핑되면 다른 표현/맥락의 같은 개념 출제 → 진짜 이해 검증.

현재 fallback: 매핑 없으면 같은 문제 + 선지 순서 셔플 (정답 위치 변경). 단순 암기는 방지하지만 변형 문제만큼은 아님.

### 두 복습 시스템 통합 검토 (P2)

Phase 4 Step 4 결정: 기존 `#/review` 허브 (수동) + 신규 SM-2 (자동) 공존.

**v1.1 검토 사항:**
- [ ] 두 시스템 사용 빈도 비교 (사용자 데이터 누적 후, 출시 후 1~2개월)
- [ ] 한쪽 사용 빈도 매우 낮으면 통합 검토
- [ ] 사용자 피드백으로 통합 vs 유지 결정
- [ ] 통합 결정 시: SM-2 가 review.ts 의 buildReviewMix 패턴을 흡수 (wrong/weak/fresh 혼합)

### 망각 곡선 v1.1 (P2)

- [ ] **push 알림** — FCM 또는 OneSignal 통합. 미접속 1일/3일 알림 외부 채널.
- [ ] **적응형 복습 시점** — 사용자별 망각 패턴 학습. 정답률 높은 사용자는 30 → 60 → 90 추가 progression.
- [ ] **복습 통계 시각화** — 월별 mastered 항목 수, 평균 ease_factor 추이.
- [ ] **변형 문제 우선 출제** — 같은 question_id 가 아닌 variant_group 의 다른 문항.

### Step 3 잔여 폴리시 (P2)

Phase 4 Step 3 작업 후 보류된 폴리시:

- [x] **C-3 — 합격 가능성 카드 강화** ✅ Step 5 에서 자연 흡수 (PredictionScoreCard 의 출제 비중 미니바)
- [ ] **C-4 — GalaxyScreen "오늘 권장 학습" 동적 배지**
  - 진도 속도 기반 권장 분 표시
- [ ] **D-3 — 모의고사 시점 맥락화**
  - D-3 review_buffer 진입 시 모의고사 prominent 추천
- [ ] **D-4 — 재응시생 weak 시각화**
  - PlanetScreen chapter 노드의 약점 강조

### 콘텐츠 추가 (P2)

- [ ] **ADsP 다른 회차 추가** — 2023, 2022 기출
- [ ] **단답/빈칸 문제 유형 지원** — 현재 MCQ 만 isPlayable
- [ ] **lesson estimated_minutes yaml 채움** — 현재 13개 중 2개만 실측치

---

## 인프라 / 메타 (P3)

- [ ] 번들 분할 — `lessons-*.js` 691KB → route 기반 dynamic import
- [ ] PWA 화 — Daily Mission 홈 화면 아이콘
- [ ] `.claude/session-handoff.json` 폐기 (CLAUDE.md 가 대체)
- [ ] Storybook 도입 (UI 컴포넌트 카탈로그)

---

## 출시 후 모니터링 (정기)

- [ ] Search Console 주간 모니터링 (인기 검색어, CTR)
- [ ] Core Web Vitals 측정 (LCP, INP, CLS)
- [ ] 결제 전환율 추적 (free → premium)
- [ ] 사용자 이탈률 분석 (어느 단계에서 이탈?)

---

### 합격 예측 v1.1 (P2)

Phase 4 Step 5 의 v1.1 영역 — 사용자 데이터 100명+ 누적 후:

- [ ] **점수 변화 그래프** — 시간 흐름 (7d/30d/all)
- [ ] **합격자 비교** — 합격자 데이터 30명+ 누적 시 평균 점수 비교
- [ ] **응시생 비교** — 사용자 100명+ 시 "상위 X%"
- [ ] **attempt history 정확 시간 가중** — 현재 단순화 (questionStats 누적). v1.1: 시도 단위 history 별도 저장 → 최근 50문항 weight 0.5/0.3/0.2

---

**작성일**: 2026-05-08 → 2026-05-09 갱신 (Step 5 완료)
**다음 갱신**: 출시 후 1개월차 사용자 데이터 기반 우선순위 재정렬.
