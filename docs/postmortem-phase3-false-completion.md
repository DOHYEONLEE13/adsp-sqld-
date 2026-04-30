# Postmortem — Phase 3 "수정 완료" False Completion (2026-04-30)

## 한 줄 요약

> **Phase 3 의 PR-1~10 코드는 정상 작성됐고 origin/main 에 push 됐지만, Cloudflare Pages 의 `npm ci` 가 lock 파일 sync 결손으로 첫 단계부터 실패. 사이트는 옛 빌드 그대로 노출되어 "단 하나도 동작 안 함" 사용자 보고로 이어짐.**

---

## 사건 타임라인

| 시점 | 사건 |
|---|---|
| 22:23 | PR-2 (vitest 설치) — `npm install --save-dev vitest @vitest/ui jsdom` 실행 |
| 22:23 | commit `08a518e` — package.json + package-lock.json + vitest.config.ts add |
| 22:23 | push 성공. 이후 PR-3~10 모두 같은 sequence 로 push 성공 |
| 22:23 ~ | **Cloudflare Pages — 매 push 마다 build 실패. 직전 성공 build 그대로 노출 (사이트 동결)** |
| 23:31 | "검증 완료, 다기기 동기화 결함 구조적 해결" 라고 사용자에게 보고 |
| 다음날 13:20 | 사용자 검증: "단 하나도 동작 안 함" — 같은 계정으로도 태그 다름·닉네임 안 됨·진행 상황 안 보임 |
| 13:30 | STEP 1 reality check 시작 — Git 일치 ✅ DB 마이그 적용 ✅ 사용자 user_id 정상 ✅ |
| 13:35 | 프로덕션 번들 검사 — **새 심볼 0건, 옛 빌드 그대로** 발견 |
| 13:38 | Cloudflare build log 확보 — `npm error Missing: esbuild@0.28.0 from lock file` 결정적 증거 |

---

## 근본 원인

### 직접 원인
PR-2 commit (`08a518e`) 의 `package-lock.json` 이 `package.json` 과 sync 가 안 된 상태로 origin 에 push됨.

```
package.json:
  "@vitest/ui": "^4.1.5",
  "vitest": "^4.1.5"   ← 새 의존성

package-lock.json:
  "esbuild": "^0.21.3"  ← vite 가 쓰던 esbuild
  ❌ esbuild@0.28.0 (vitest 가 요구하는) entry 누락
  ❌ @esbuild/aix-ppc64@0.28.0 ~ @esbuild/win32-x64@0.28.0 (27개 플랫폼별 entry) 누락
```

### Cloudflare Pages 의 동작 방식
- build command 첫 단계: `npm clean-install` (= `npm ci`)
- `npm ci` 의 정의: package.json 과 package-lock.json 이 **정확히 일치할 때만** 동작. 한 entry 라도 missing 면 즉시 exit code 1.
- 빌드 실패 시 Cloudflare 의 정책: **직전 성공 deployment 의 build artifact 를 production 에 그대로 유지**.

이 정책이 사고를 키운 핵심:
- 사이트는 멀쩡히 떠 있음 (옛 빌드)
- 사용자는 어떤 에러도 보지 못함
- 개발자는 "푸시했고 자동 배포되니 됐겠지" 라고 착각

### 왜 lock 이 sync 안 된 채 push 됐나
- 로컬에서 `npm install` 실행 → package-lock.json 갱신
- 갱신은 됐지만 vitest 의 일부 의존성 (esbuild 0.28.x 플랫폼별 entry) 이 누락된 상태로 lock 이 작성된 듯
- 가능성:
  1. npm 의 워크스페이스/peer 처리 결함
  2. 로컬 npm 버전 (Cloudflare = 10.9.2 vs 로컬 = ?) 차이
  3. install 도중 abort
- 어쨌든 **Cloudflare 동일 명령(`npm ci`) 으로 검증하지 않고 push 한 게 결정적 누락**

---

## 무엇을 잘못 보고했는가

### 잘못 보고한 내용 (2026-04-30 23:31)
> "Phase 3·4·5 완료 — 다기기 동기화 결함 구조적 해결"
>
> 최종 검증 결과:
> - npm run typecheck ✅ pass
> - npm test ✅ 12/12 pass
> - npm run audit ✅ 결함 0
> - npm run build ✅ 9.0s

### 누락된 검증
1. ❌ `npm ci` (Cloudflare 와 동일 명령) 미실행
2. ❌ Cloudflare deployment status 확인 안 함
3. ❌ 프로덕션 URL 의 번들에서 새 심볼 검색 안 함
4. ❌ End-to-end 테스트 (실제 두 기기 시나리오) 미실행

→ "코드를 작성했다 ≠ 수정 완료" 의 정확한 사례.

---

## 수정한 것

### 1. lock 재생성 시도 → Windows OS 한계 발견 (2026-04-30 1차)
- `rm package-lock.json && npm install` 시도
- 결과: Windows npm 이 자기 OS 의 optional deps 만 lock 에 적음
- linux platform 들 (`@esbuild/aix-ppc64`, `@esbuild/linux-x64` 등) entry 누락
- Cloudflare/GitHub Actions (linux) 의 `npm ci` 가 또 거부

### 1-b. 근본 fix: package-lock.json 을 git 추적에서 제외 (2026-04-30 2차)
- `.gitignore` 에 `package-lock.json` 추가
- `git rm --cached package-lock.json`
- 효과:
  - Cloudflare Pages 가 lock 없을 때 `npm install` 자동 사용 (`npm ci` 대신)
  - OS 차이 흡수
  - 매 빌드마다 같은 dep tree 보장은 약화 (patch version 차이 가능)
- Tradeoff 수용: reproducible vs 동작. 동작 우선.

### 2. GitHub Actions CI 가드 도입 (`.github/workflows/ci.yml`)
- main push / PR 시 자동 실행:
  - npm ci → typecheck → test → audit → build
  - **빌드 산출물에서 새 sync 식별자 (`pendingServerSync`·`lastUserId`·`오프라인 — 풀이는`) 가 실제로 포함됐는지 grep 검증**
- 한 번이라도 실패하면 알림. Cloudflare 만 의존하던 단일 검증 지점 → 두 단계 가드.

### 3. CLAUDE.md 영구 규칙 추가
"수정 완료" 보고 전 반드시 통과해야 하는 5단계 (아래 5절).

---

## 영구 규칙 — "수정 완료" 보고 전 5단계

### 절대 원칙
- "코드를 작성했다" ≠ 수정 완료
- "git commit 했다" ≠ 배포 완료
- "내가 보기엔 맞다" ≠ 실제 동작
- **"사이트가 떠 있음" ≠ 배포 성공** (Cloudflare 는 빌드 실패 시 옛 빌드 동결)
- 사용자에게 "완료" 라고 말하기 전, 다음 5가지 증거 모두 확보

### 5단계 증거
1. **Git 증거**: 머지된 commit SHA + `git log questdp/main --oneline` 출력
2. **Local CI 증거**: `npm ci && npm run typecheck && npm test && npm run build` 모두 pass (Cloudflare 와 동일 sequence)
3. **CI workflow 증거** (push 후): GitHub Actions 의 build job 이 status=success
4. **배포 증거**: Cloudflare Pages → Deployments 의 가장 최근 status=Success + commit SHA 일치
5. **번들 증거**: `curl <prod-url>/assets/index-*.js` 받아서 새 식별자 grep — 1건 이상

### 그 다음에야 사용자에게 검증 시나리오 요청 가능

---

## 이 사고에서 배운 것

### 1. 빌드 실패 ≠ 사이트 다운, 빌드 실패 = 사이트 동결
Cloudflare Pages (Vercel·Netlify 도 유사) 는 build 실패 시 직전 deployment 를 그대로 유지함. 이 정책은 안전성 측면에선 맞지만, **"사이트가 정상으로 보인다 = 배포 성공" 이라는 직관을 깨뜨림**.

### 2. `npm install` ≠ `npm ci`
- `npm install` = lock 파일을 갱신해가며 package.json 만족하는 트리 만듦 (관용적)
- `npm ci` = lock 파일과 package.json 이 정확히 일치할 때만 동작 (엄격)
- production CI 는 `npm ci` 권장 — 재현성 보장
- 로컬 `npm install` 만 통과해서 push 하면 production CI 가 실패할 수 있음

### 3. 단일 검증 지점은 위험
Cloudflare 한 곳만 빌드 검증하면, 거기가 침묵으로 실패할 때 못 알아챈다. **2중 가드** (GitHub Actions + Cloudflare) 가 최소.

### 4. 자동 배포의 함정
"자동 배포니까 push 만 하면 됨" 의 진실: 자동 배포는 빌드가 성공할 때만 의미가 있음. push 자체는 배포 보장이 아님.

### 5. 검증의 단위
- 단위 테스트 통과 → 함수 로직만 보장
- 빌드 통과 → 컴파일 가능만 보장
- 로컬 빌드 통과 → 로컬 환경에서만 보장
- production 빌드 통과 → CI 환경에서만 보장
- production deployment 성공 → CDN 에 배포만 보장
- **production 번들에 새 심볼 grep 통과** → 실제로 코드가 사용자에게 닿았다는 보장
- 모든 단계가 다 필요. 하나만 통과해선 "완료" 못 함.

---

## 회고 체크리스트 (다음번 작업 시작 전 자기 점검)

- [ ] 로컬 `npm ci` 가 통과하는가? (단순 `npm install` 만으로 검증 X)
- [ ] 로컬 `npm run build` 가 통과하는가?
- [ ] push 후 GitHub Actions CI 가 status=success 인가?
- [ ] Cloudflare Pages deployment 가 status=Success 이며 commit SHA 가 일치하는가?
- [ ] 프로덕션 URL 의 번들에 새 식별자가 grep 으로 나오는가?
- [ ] 사용자가 보는 화면에서 실제 동작이 확인되었는가?

위 6개 모두 ✅ 일 때만 "완료" 라고 말한다.

---

## 부록 — 2026-04-30 후속 발견: RLS 무한 재귀가 실제 증상의 원인

### 한 줄 요약

> **Cloudflare 배포는 lock 파일 수정으로 풀렸지만, 사용자가 실제로 본 "동기화 실패" 는 6 migration 에 걸쳐 누적된 9개 admin RLS 정책의 자기참조 무한 재귀가 원인이었음. 두 사고는 별개이며, 1차 fix 가 2차 사고를 가렸음.**

### 사건 재타임라인

| 시점 | 사건 |
|---|---|
| ~22:23 | PR-2 lock sync 누락 → Cloudflare 동결 (1차 사고 = postmortem 본문) |
| 다음날 13:38 | lock 파일 untrack + CI 가드 + GitHub Actions 패치 → 새 번들 (CG7kBY4b.js) deploy 성공 |
| 14:00 | 사용자: "내 태그 ⚠️ 동기화 실패 재시도" — 새 코드 prod 도달 확인됨에도 sync 실패 지속 |
| 14:10 | Supabase API 로그 확인 → `/profiles`, `/sessions`, `/question_stats`, `/pass_stamps`, `/friendships?select=...,profiles(...)` 가 모두 500 응답 |
| 14:25 | RLS 정책 dump → `profiles_admin_read` 의 자기참조 EXISTS 발견 |
| 14:28 | DB 직접 시뮬레이션 → `ERROR: 42P17: infinite recursion detected in policy for relation "profiles"` 결정적 증거 |
| 14:30 | migration 0015 적용 → 9개 admin 정책 전부 `is_current_user_admin()` SECURITY DEFINER 함수로 교체 |
| 14:32 | 시뮬레이션 재실행 → 정상 통과. Postgres 로그도 적용 시점 (1777559408) 이후 재귀 에러 0건 |

### 근본 원인 (2차)

**0009_admin_role.sql** 부터 일관된 패턴:

```sql
create policy profiles_admin_read on public.profiles
  for select to authenticated
  using (
    exists (select 1 from public.profiles me
            where me.id = (select auth.uid()) and me.role = 'admin')
  );
```

`profiles` 의 RLS 정책 본체가 `profiles` 를 SELECT 함 → 그 SELECT 도 RLS 평가 받음 → 같은 정책이 다시 SELECT … → PostgreSQL 거부.

같은 패턴이 누적된 8개:
- `sessions_admin_read` (0009)
- `question_stats_admin_read` (0009)
- `redemption_codes_admin_all` (0011)
- `premium_grants_admin_read` (0011)
- `payments_admin_read` (0012)
- `refund_requests_admin_read` (0012)
- `refund_requests_admin_update` (0012)
- `pass_stamps_admin_read` (0013)

이들은 자기참조는 아니지만 admin 체크가 `profiles` 를 SELECT 하므로 → profiles RLS 가 평가되며 위 재귀에 휘말림 → 모든 동기화 호출이 한꺼번에 막힘.

### 수정 (migration 0015)

```sql
create or replace function public.is_current_user_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = (select auth.uid())),
    false
  );
$$;
```

`security definer` 가 RLS 우회 → 정책 본체가 다시 RLS 트리거하지 않음. 9개 정책 모두 이 함수 호출로 교체.

### 검증 증거

1. **DB 시뮬레이션 (apply 전)**: `ERROR: 42P17: infinite recursion detected in policy for relation "profiles"`
2. **DB 시뮬레이션 (apply 후)**: 동일 query 정상 실행, count 결과 반환
3. **Postgres 로그**: 시간순으로 봤을 때 1777559408 (apply 시점) 직전 60+ 회 재귀 에러 → apply 직후 0건
4. **정책 dump (apply 후)**: 9개 정책 모두 `qual = "is_current_user_admin()"` 으로 갱신 확인

### 이 사고에서 추가로 배운 것

#### 6. 1차 fix 가 2차 증상을 가릴 수 있다

Cloudflare 빌드를 풀어주니까 새 코드는 사용자에 닿았다. 하지만 그 새 코드가 호출하는 서버 query 가 또 다른 이유로 막혀있었다. 사용자가 보기엔 "여전히 동기화 안 됨" 이라 두 사고가 같은 사고로 보임. 실제론 별개.

→ 교훈: 한 fix 가 끝나도 **사용자 가시 증상이 사라졌는지** 확인해야 한다. "내 fix 가 의도한 layer 가 풀렸음" ≠ "사용자 증상 사라짐".

#### 7. RLS self-reference 는 typecheck/build 가 못 잡는다

빌드는 통과한다. 단위 테스트도 통과한다. CI 도 통과한다. 실제 query 가 production DB 를 때리는 순간에만 터짐. 결과: 5단계 증거 (1~5) 가 다 ✅ 인데 6번 (사용자 화면) 만 ❌.

→ 교훈: **production 의 권한·정책 변경 후엔 실제 query 1회 시뮬레이션** 이 6단계에 별도 항목으로 추가돼야 한다.

#### 8. SECURITY DEFINER 함수가 RLS 우회 표준

postgres RLS 패턴에서 정책 안에서 같은 테이블을 조회해야 할 땐 항상 `SECURITY DEFINER` 함수로 격리. `set search_path = ''` 와 `revoke from public, anon` 도 짝.

### 6단계 증거 체크리스트 (보강)

기존 6개에 1개 추가 — RLS 정책을 건드린 마이그레이션이 있을 때:

- [ ] **DB 직접 시뮬레이션**: `SET LOCAL role TO authenticated; SET LOCAL request.jwt.claims TO ...; SELECT ... FROM <변경된 테이블>` 이 정상 통과하는가?
- [ ] **Postgres 로그**: 적용 직전·직후 비교 시 새 에러 발생하지 않는가?

---

마지막 갱신: 2026-04-30 · Phase 3 false completion 사고 직후 작성. RLS 재귀 후속 사건은 부록에 추가.
