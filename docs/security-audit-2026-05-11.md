# 보안 감사 보고서 — QuestDP

**감사 일자**: 2026-05-11
**도구**: `/cso` (gstack Chief Security Officer audit, v2)
**Mode**: Daily (8/10 confidence gate · zero noise)
**Scope**: Full (Phases 0~9, 12~14)
**감사자**: Claude Code (Opus 4.7) + gstack `/cso` 스킬
**원본 데이터**: [.gstack/security-reports/2026-05-11-cso.json](../.gstack/security-reports/2026-05-11-cso.json)

---

## 🎯 한 줄 결론

> **0 CRITICAL · 0 HIGH · 0 MEDIUM** (8/10+ 신뢰도 게이트). 전체 보안 자세 견고함. 9개 후보 중 daily mode 보고 기준 통과 0건. Below-threshold 관찰 2개만 기록.

---

## 📊 감사 범위

### 코드 표면 (Code Surface)
| 항목 | 수치 |
|---|---|
| Stack | Vite + React 18 + TypeScript + Tailwind |
| Framework | React SPA (no SSR) |
| Supabase 호출 | 24+ 위치 (13 파일) |
| Edge Functions | 1 (`toss-confirm`) |
| Admin 페이지 | 1 (`/#/admin`) |
| 외부 통합 | 2 (Supabase, Toss Payments) |

### 인프라 표면 (Infrastructure Surface)
| 항목 | 수치 |
|---|---|
| CI 워크플로우 | 1 (`.github/workflows/ci.yml`) |
| Webhook 수신자 | 1 (`toss-confirm` Edge Function) |
| Container configs | 0 |
| IaC configs | 0 |
| 배포 타겟 | Cloudflare Pages |
| Secret 관리 | Supabase secrets + Cloudflare env vars + `.env.local` |

### Supabase 마이그레이션
- 28개 마이그레이션 (0001~0028) 적용
- RLS 활성화 테이블: profiles, friendships, sessions, question_stats, step_unlocks, bookmarks, exam_dates, redemption_codes, premium_grants, payments, refund_requests, pass_stamps (12+)

---

## 📋 Phase 별 결과

### Phase 0 — Architecture Mental Model
**결과**: ✅ Clean

- **Stack 감지**: Node/TypeScript + Vite + React + Supabase + Toss Payments
- **트러스트 경계**:
  - Browser (untrusted, RLS protects DB)
  - Supabase Edge Functions (trusted, has service role)
  - Toss API (외부 trusted, secret key 사용)
- **데이터 흐름**: Client → Supabase RLS → Edge Function (server-only ops) → Toss

### Phase 1 — Attack Surface Census
**결과**: ✅ Mapped

위 "코드 표면" / "인프라 표면" 표 참조.

### Phase 2 — Secrets Archaeology
**결과**: ✅ Clean

| 검증 항목 | 결과 |
|---|---|
| git history secrets (AKIA, sk_live_, ghp_, xoxb-, JWT) | ✅ 0건 (`.env.example`의 placeholder만) |
| `.env` git 추적 | ✅ `.env.example`만 추적, 실제 `.env` 미추적 |
| `.gitignore` `.env` 룰 | ✅ `.env` + `.env.*` 명시 |
| CI 인라인 비밀 | ✅ 0건 (모두 dummy/secrets context) |

**증거 예시** ([.env.example:8](.env.example#L8)):
```
# Service role 키 — RLS 우회. 월간 보고서 (npm run report) 등 운영 스크립트 전용.
# .env.local 에 따로 보관 권장 (이 파일은 git 에 들어가지만 .env.local 은 .gitignore 됨).
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
```
→ 명시적 placeholder, 실제 값 X.

### Phase 3 — Dependency Supply Chain
**결과**: ⚠️ 1 below-threshold observation

| 검증 항목 | 결과 |
|---|---|
| `npm audit --omit=dev` | ✅ **0 vulnerabilities** |
| Production deps install scripts | ✅ 0건 (preinstall/postinstall/install 없음) |
| `package-lock.json` 존재 | ✅ 로컬 존재 |
| `package-lock.json` git 추적 | ⚠️ 미추적 (의도적 — Observation O1) |

### Phase 4 — CI/CD Pipeline Security
**결과**: ✅ Clean

[.github/workflows/ci.yml](../.github/workflows/ci.yml):
- ✅ `actions/checkout@v4` — first-party, 버전 핀
- ✅ `actions/setup-node@v4` — first-party, 버전 핀
- ✅ Third-party action 0건
- ✅ Trigger: `push` + `pull_request` (`pull_request_target` 미사용 — 안전)
- ✅ `${{ github.event.* }}` script injection 패턴 0건
- ✅ Build env vars는 dummy 값 (`'sb_publishable_dummy_for_ci_build_only'`)
- ✅ Sanity check grep으로 prod 번들 회귀 방지

### Phase 5 — Infrastructure Shadow Surface
**결과**: ✅ N/A (Docker/IaC 미사용)

- Cloudflare Pages 직배포 — 별도 컨테이너/Terraform 인프라 없음
- 모든 prod 환경설정은 Cloudflare 대시보드 + Supabase Edge Function secrets

### Phase 6 — Webhook & Integration Audit
**결과**: ⚠️ 1 below-threshold observation

[supabase/functions/toss-confirm/index.ts](../supabase/functions/toss-confirm/index.ts) 분석:

**✅ 우수 설계**:
1. JWT 명시 검증 (`sb.auth.getUser(jwt)`) — line 86
2. `productCode` allowlist 검증 — line 105
3. `amount` 서버측 검증 (`PRODUCT_AMOUNTS` dict) — line 108~115 (클라 변조 차단)
4. Toss 응답 이중 확인: `status === 'DONE'` AND `totalAmount === amount` (line 144~157)
5. 멱등 RPC `grant_premium_from_payment` (`ON CONFLICT DO NOTHING`)
6. Service role은 Edge Function 내부에서만 사용 (클라이언트 노출 X)

**⚠️ Minor (Observation O2)**: `Access-Control-Allow-Origin: '*'` — line 39

### Phase 7 — LLM/AI Security
**결과**: ✅ N/A (LLM 미사용)

- 프로젝트 정책 ([CLAUDE.md §2.5](../CLAUDE.md)): "룰 기반 AI 만 — LLM API 호출 없음"
- 약점 점수: `oddsWrong*0.5 + timeOverrun*0.3 + recency*0.2` (결정적, 함수형)
- `eval()`, `dangerouslySetInnerHTML`, `new Function`, `innerHTML =` 패턴 0건

### Phase 9 — OWASP Top 10
**결과**: 8/10 통과, 2/10 minor

| ID | 카테고리 | 상태 | 근거 |
|---|---|---|---|
| **A01** | Broken Access Control | ✅ PASS | RLS 12+ 테이블, [AdminPage.tsx:76-80](../src/pages/AdminPage.tsx#L76) 서버측 `profiles.role` 확인 |
| **A02** | Cryptographic Failures | ✅ PASS | Supabase 자동 (TLS, bcrypt, JWT). 하드코딩 비밀 0 |
| **A03** | Injection | ✅ PASS | Supabase parameterized queries. eval/Function 0 |
| **A04** | Insecure Design | ✅ PASS | Payment 멱등 RPC, amount 서버 검증, allowlist |
| **A05** | Security Misconfig | ⚠️ MINOR | Edge function wildcard CORS (mitigated — Observation O2) |
| **A06** | Vulnerable Components | ✅ PASS | npm audit 0 vulnerabilities |
| **A07** | Auth Failures | ✅ PASS | Supabase Auth + Google OAuth, JWT 자동 만료 |
| **A08** | Integrity Failures | ✅ PASS | CI sanity grep, signed actions, 멱등 RPC |
| **A09** | Logging Failures | ⚠️ MINOR | Auth event 명시 로그 정책 없음 (Supabase 기본 audit log만) |
| **A10** | SSRF | ✅ PASS | Fetch URL 모두 환경변수/상수 (사용자 입력 X) |

**상세 — A01 RLS 정책 예시** ([0012_payments_refund_requests.sql:82-91](../supabase/migrations/0012_payments_refund_requests.sql#L82)):
```sql
-- payments: 본인 read 만. 쓰기는 webhook (service_role) 만.
create policy payments_self_read on public.payments
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy payments_admin_read on public.payments
  for select to authenticated
  using (
    exists (select 1 from public.profiles me
            where me.id = (select auth.uid()) and me.role = 'admin')
  );
```

**상세 — A04 Amount 변조 방지** ([toss-confirm/index.ts:108-115](../supabase/functions/toss-confirm/index.ts#L108)):
```ts
// 변조 방지 — 클라가 보낸 amount 가 서버 expected 와 일치해야
const expected = PRODUCT_AMOUNTS[productCode];
if (amount !== expected) {
  return json(
    { error: `amount mismatch: expected ${expected}, got ${amount}` },
    400,
  );
}
```

---

## 🟡 Below-threshold 관찰 (참고용)

신뢰도 6/10이라 daily mode (8/10 게이트) 보고 X. 알아두실 항목.

### O1 — `package-lock.json` git 미추적

| 항목 | 값 |
|---|---|
| Severity | MEDIUM |
| Confidence | 6/10 |
| Status | DOCUMENTED_INTENTIONAL |
| Phase | 3 (Supply Chain) |
| Category | Supply Chain |
| 위치 | [.gitignore:9](../.gitignore#L9) |

**현재 정책**:
- `package-lock.json` 의도적 git 추적 제외
- 이유: Windows 로컬 → Linux CI/Cloudflare 사이의 esbuild OS-binary 차이로 lock에 누락 → `npm ci` 실패 → 사이트 동결 사고 (2026-04-30)
- 회고: [docs/postmortem-phase3-false-completion.md](postmortem-phase3-false-completion.md)
- 대안: `npm install` 사용 (OS 차이 흡수)

**잔여 위험 (Exploit Scenario)**:
1. 공격자가 transitive dependency (예: `lodash`의 sub-dep)의 새 버전을 supply-chain attack으로 npm publish
2. Cloudflare 다음 빌드에서 `npm install` 시 새 버전 자동 적용
3. lockfile 없어 어느 버전이 prod에 들어갔는지 forensic 어려움
4. 침해 발생 시 root cause 추적 시간 ↑

**Impact**: Detection 시간 ↑. 실제 침해 시 incident response 어려움.

**Recommendation (선택)**:
- 현 정책 유지 (esbuild OS-binary 회피로 의도)
- 보강 옵션:
  - **(a)** Cloudflare 빌드 산출물의 `node_modules` 트리 해시를 매 deployment 기록
  - **(b)** `npm audit signatures` 정기 실행 (npm 9+ 기능, 패키지 서명 검증)
  - **(c)** `socket.dev` 또는 `snyk` 같은 supply chain 모니터 도입
  - **(d)** Renovate / Dependabot으로 dep 변경 자동 감지

---

### O2 — Wildcard CORS on toss-confirm Edge Function

| 항목 | 값 |
|---|---|
| Severity | MEDIUM |
| Confidence | 6/10 |
| Status | MITIGATED |
| Phase | 6 (Webhook & Integration) |
| Category | Integrations |
| 위치 | [supabase/functions/toss-confirm/index.ts:39](../supabase/functions/toss-confirm/index.ts#L39) |

**현재 코드**:
```ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

**Exploit Scenario** (이론):
1. 사용자가 다른 사이트 (예: 피싱 페이지) 방문
2. 그 페이지의 JavaScript가 quest-dp.com 사용자의 JWT가 cookie에 있는 상태로 toss-confirm 호출
3. JWT 없으면 401, 있으면 결제 confirm 시도

**현재 Mitigation (피해 최소화)**:
- ✅ JWT 검증 (line 86) — 인증된 사용자만
- ✅ `amount` 서버 검증 (line 108) — 변조 차단
- ✅ `productCode` allowlist (line 105)
- ✅ 멱등 RPC (`ON CONFLICT DO NOTHING`)
- ✅ Toss 응답 이중 확인 (line 144-157)

**실질 피해**:
- 사용자가 이미 정상 결제 완료한 paymentKey의 재confirm 시도 정도
- 멱등 RPC로 중복 처리 차단되어 무해

**Impact**: 현재 세이프가드로 실질 피해 거의 없음. 다만 wildcard CORS 자체가 baseline 보안 정책 위반.

**Recommendation (선택)**:
```ts
// 변경 전
'Access-Control-Allow-Origin': '*',

// 변경 후
'Access-Control-Allow-Origin': 'https://quest-dp.com',
// 또는 환경별 분기
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? 'https://quest-dp.com';
'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
```

향후 credentialed request (cookies)를 사용하게 되면 `'*'` + `credentials` 동시 사용 불가능 — 어차피 좁혀야 함.

---

## ⚠️ 메타 권고

### M1: `.gstack/`이 `.gitignore`에 없음

이 보고서의 JSON 버전이 `.gstack/security-reports/`에 저장됨. Git에 들어가면 commit history에 보안 보고서가 영구 기록됨 (의도된 동작이 아닐 수 있음).

**조치**:
```bash
echo '.gstack/' >> .gitignore
git add .gitignore
git commit -m "chore: gitignore .gstack/ — local-only security/analytics artifacts"
```

### M2: 더 광범위 검토

이번 감사는 **daily mode** (8/10 confidence gate, zero noise). 더 많은 잠재 이슈를 surface하려면:

```
/cso --comprehensive
```
(2/10 게이트 — TENTATIVE finding 포함)

### M3: 미실행 Phase

이번에 실행 안 한 영역 (별도 감사 시 권장):
- **Phase 8** — Skill supply chain (`.claude/skills/` 없어 N/A)
- **Phase 10** — STRIDE threat model (컴포넌트별 위협 모델링 — 인력 집약적)
- **Phase 11** — Data classification (PII/payment/internal 분류 매핑)

---

## 📈 필터 통계

```
SECURITY FINDINGS PIPELINE
══════════════════════════════════
Candidates scanned:          9
  ↓ Hard exclusions:         5  (DOS / 메모리 / 미하드닝 등 룰)
Confidence gate (8/10):      4 → 2  (2개 통과 못 함)
Active verification:         2 → 0  (verifier 무효 처리)
                          ───────────
Reported (daily mode):       0
Below-threshold documented:  2  (참고용)
```

---

## 🎯 최종 평가

### 강점 (Strengths)
1. **다층 방어 (Defense in Depth)** — RLS (1차) + 클라이언트 가드 (2차) + Edge Function 검증 (3차)
2. **Payment 보안 모범 사례** — Amount 서버 검증, productCode allowlist, 멱등 RPC, JWT 검증, Toss 응답 이중 확인
3. **Secret 관리 깔끔** — Service role은 Edge Function only, 클라 노출 0, .env 적절 gitignore
4. **CI 보안 우수** — first-party actions만 사용, dummy CI env, sanity grep 회귀 방지
5. **OAuth 활용** — 직접 password 관리 X (Google OAuth via Supabase Auth)

### 개선 여지 (Improvements)
1. **Supply chain monitoring** — `package-lock.json` 미추적 보강책 (socket.dev 등) — O1
2. **CORS 좁히기** — Edge function wildcard → 명시 origin — O2
3. **Auth event 로깅** — 명시 정책 수립 (현재 Supabase 기본 audit log만)
4. **`.gstack/` gitignore** — 메타 권고 M1

### 전체 등급

> **A- (양호)** — production 출시 가능 수준. 결제·인증·데이터 분리·RLS 모두 모범 사례 따름. 2개 minor 보완 시 A 등급.

---

## 🚨 면책 조항

이 도구는 전문 보안 감사를 대체하지 않습니다. `/cso`는 일반적 취약점 패턴을 잡는 AI 보조 스캔 — 포괄적 X, 보장 X, 자격을 갖춘 보안 회사 고용 대체 X. LLM은 미묘한 취약점을 놓치고, 복잡한 인증 흐름을 오해하고, false negative를 낼 수 있습니다.

결제·PII·민감 데이터를 다루는 production 시스템에는 전문 침투 테스트 회사를 의뢰하세요. `/cso`는 전문 감사 사이의 baseline 점검 + low-hanging fruit 처리 용도로만 사용하세요.

QuestDP는 결제 + 사용자 PII (이메일, 학습 진도) 처리하므로, **결제 활성 후 1~3개월 내 전문 보안 감사 1회 권장**.

---

**보고서 끝** · 다음 감사 추천 시점: 통신판매업 신고증 발급 + 결제 활성 직후, 또는 1개월 후
