# QuestDP SEO Wave 1 Report

## Start Gate

```text
git status --short --branch
## questdp-main...questdp/main [ahead 1]
```

판정: 작업 트리는 클린. `ahead 1`은 로컬 커밋이 원격보다 앞선 상태이며, 이번 배치의 중단 조건인 미커밋 변경은 없음.

금지 파일 처리: `.codex/`, `planet-preview.html`, `qa-*.png`, `question-bank/`는 커밋 대상에서 제외. `git add -A` 사용 금지.

## Baseline Build

```text
npm.cmd run build

sitemap generated: total 555 URLs (core 17, blog 13, lessons 373, topics 152, quiz 0)
static route HTML generated: 555 pages (core 18, blog 12, lessons 373, topics 152, quiz 0)
seo audit passed: 555 static pages, 555 submitted URLs, quiz 0
```

판정: 편집 전 기준선 빌드 통과.

## Mission A: Lesson Index Strategy

### 변경 파일

- `scripts/seo-route-manifest.mjs`
- `scripts/generate-sitemap.mjs`
- `scripts/generate-static-route-html.mjs`
- `scripts/seo-audit.mjs`
- `src/data/gameModes.ts`
- `docs/seo-goal-report.md`

### 핵심 Diff 요약

- `/lesson/<stepId>` SEO 라우트에 `indexable` 플래그를 추가.
- ADsP 40개, SQLD 40개, 총 80개만 indexable lesson으로 선정.
- `sitemap-lessons.xml`은 indexable lesson만 포함하도록 변경.
- noindex lesson은 정적 HTML을 유지하면서 `<meta name="robots" content="noindex" />`를 출력. canonical은 self 유지.
- `seo-audit`를 확장해 sitemap 검사는 indexable manifest만 대상으로 보고, noindex manifest 라우트는 파일 존재와 robots noindex meta를 별도로 검증.
- lesson meta description은 dialogue 첫 줄이 아니라 `blocks`의 `intro` 본문을 우선 사용.
- 전체 테스트가 기존 카피 숫자 불일치로 실패해 `src/data/gameModes.ts`의 ADsP/SQLD step 표시를 실제 카운트와 맞춤: ADsP 261, SQLD 126.

### 선정 기준

- 독립적으로 검색될 가능성이 있는 개념어 중심: DIKW, SECI, DW, OLAP, CRISP-DM, KDD, EDA, PCA, 가설검정, 앙상블, 정규화, 함수적 종속, JOIN, 윈도우 함수 등.
- 복습 step, 지나치게 세분화된 하위 예시는 제외.
- ADsP와 SQLD를 40개씩 균형 배분.

### 화이트리스트 표

| # | 과목 | 경로 | 제목 | 토픽 |
|---:|---|---|---|---|
| 1 | ADSP | /lesson/adsp-1-1-s1 | DIKW 피라미드 개요 | 데이터의 이해 |
| 2 | ADSP | /lesson/adsp-1-1-s3-seci | SECI 4단계 | 데이터의 이해 |
| 3 | ADSP | /lesson/adsp-1-1-s4-dm | DM (Data Mart) | 데이터의 이해 |
| 4 | ADSP | /lesson/adsp-1-1-s4-dw | DW (Data Warehouse) | 데이터의 이해 |
| 5 | ADSP | /lesson/adsp-1-1-s4-lake | Data Lake | 데이터의 이해 |
| 6 | ADSP | /lesson/adsp-1-1-s4-olap | OLAP | 데이터의 이해 |
| 7 | ADSP | /lesson/adsp-1-1-s4-oltp | OLTP | 데이터의 이해 |
| 8 | ADSP | /lesson/adsp-1-1-s5-crm | ③ CRM | 데이터의 이해 |
| 9 | ADSP | /lesson/adsp-1-1-s5-dbms | ① DBMS | 데이터의 이해 |
| 10 | ADSP | /lesson/adsp-1-1-s5-erp | ② ERP | 데이터의 이해 |
| 11 | ADSP | /lesson/adsp-1-1-s5-scm | ④ SCM | 데이터의 이해 |
| 12 | ADSP | /lesson/adsp-1-2-s1-3v | 빅데이터 3V | 데이터의 가치와 미래 |
| 13 | ADSP | /lesson/adsp-1-2-s3 | 데이터 3법 개요 | 데이터의 가치와 미래 |
| 14 | ADSP | /lesson/adsp-2-1-s1 | 분석 4유형 (개요) | 데이터 분석 기획의 이해 |
| 15 | ADSP | /lesson/adsp-2-1-s2-crisp | CRISP-DM 6단계 | 데이터 분석 기획의 이해 |
| 16 | ADSP | /lesson/adsp-2-1-s2-kdd | KDD 5단계 | 데이터 분석 기획의 이해 |
| 17 | ADSP | /lesson/adsp-2-1-s3 | 하향식 접근 개요 | 데이터 분석 기획의 이해 |
| 18 | ADSP | /lesson/adsp-2-1-s4-agile | 방법론 ④ Agile | 데이터 분석 기획의 이해 |
| 19 | ADSP | /lesson/adsp-2-1-s4-waterfall | 방법론 ① Waterfall | 데이터 분석 기획의 이해 |
| 20 | ADSP | /lesson/adsp-2-2-s1 | 과제 우선순위 (개요) | 분석 마스터플랜 |
| 21 | ADSP | /lesson/adsp-2-2-s2 | 분석 거버넌스 개요 | 분석 마스터플랜 |
| 22 | ADSP | /lesson/adsp-2-2-s3 | 분석 성숙도 개요 | 분석 마스터플랜 |
| 23 | ADSP | /lesson/adsp-2-2-s4 | 데이터 거버넌스 개요 | 분석 마스터플랜 |
| 24 | ADSP | /lesson/adsp-2-3-s4 | 분석 과제 정의서 | 분석 과제 발굴 |
| 25 | ADSP | /lesson/adsp-2-3-s5 | 분석 준비도 개요 | 분석 과제 발굴 |
| 26 | ADSP | /lesson/adsp-3-1-s2 | EDA 개요 | R 기초와 데이터 마트 |
| 27 | ADSP | /lesson/adsp-3-1-s3 | 결측값 처리 개요 | R 기초와 데이터 마트 |
| 28 | ADSP | /lesson/adsp-3-1-s4 | 이상값 탐지 개요 | R 기초와 데이터 마트 |
| 29 | ADSP | /lesson/adsp-3-2-s4 | 중심극한정리 (CLT) | 통계 분석 |
| 30 | ADSP | /lesson/adsp-3-2-s5 | 주성분 분석 (PCA) | 통계 분석 |
| 31 | ADSP | /lesson/adsp-3-2-s6 | 다차원척도화 (MDS) | 통계 분석 |
| 32 | ADSP | /lesson/adsp-3-3-s1 | 가설검정 5용어 개요 | 통계적 가설 검정 |
| 33 | ADSP | /lesson/adsp-3-3-s2 | t검정 3종 개요 | 통계적 가설 검정 |
| 34 | ADSP | /lesson/adsp-3-3-s4 | 다중공선성 · 변수 선택 | 통계적 가설 검정 |
| 35 | ADSP | /lesson/adsp-3-3-s5 | 시계열 4성분 개요 | 통계적 가설 검정 |
| 36 | ADSP | /lesson/adsp-3-4-s1 | 과적합 / 데이터 분할 | 정형 데이터 마이닝 |
| 37 | ADSP | /lesson/adsp-3-4-s2 | 앙상블 개요 | 정형 데이터 마이닝 |
| 38 | ADSP | /lesson/adsp-3-4-s3 | 연관분석 개요 | 정형 데이터 마이닝 |
| 39 | ADSP | /lesson/adsp-3-4-s4 | 군집 개요 | 정형 데이터 마이닝 |
| 40 | ADSP | /lesson/adsp-3-4-s5 | 평가지표 ① 오분류표 개요 | 정형 데이터 마이닝 |
| 41 | SQLD | /lesson/sqld-1-1-s1 | 데이터 모델링이란 | 데이터 모델링의 이해 |
| 42 | SQLD | /lesson/sqld-1-1-s10 | 키 5종 | 데이터 모델링의 이해 |
| 43 | SQLD | /lesson/sqld-1-1-s2 | 모델링 단계 | 데이터 모델링의 이해 |
| 44 | SQLD | /lesson/sqld-1-1-s3 | ANSI/SPARC 3-스키마 + 데이터 독립성 | 데이터 모델링의 이해 |
| 45 | SQLD | /lesson/sqld-1-1-s3d | 데이터 독립성 | 데이터 모델링의 이해 |
| 46 | SQLD | /lesson/sqld-1-1-s4 | 엔터티란 무엇인가 | 데이터 모델링의 이해 |
| 47 | SQLD | /lesson/sqld-1-1-s4-req | 엔터티 5요건 | 데이터 모델링의 이해 |
| 48 | SQLD | /lesson/sqld-1-1-s5-kind | 유형·개념·사건 엔터티 | 데이터 모델링의 이해 |
| 49 | SQLD | /lesson/sqld-1-1-s5-time | 기본·중심·행위 엔터티 | 데이터 모델링의 이해 |
| 50 | SQLD | /lesson/sqld-1-1-s6 | 속성이란 무엇인가 | 데이터 모델링의 이해 |
| 51 | SQLD | /lesson/sqld-1-1-s7 | 관계란 무엇인가 | 데이터 모델링의 이해 |
| 52 | SQLD | /lesson/sqld-1-1-s7-cardinality | 차수와 선택사양 | 데이터 모델링의 이해 |
| 53 | SQLD | /lesson/sqld-1-1-s7-erd-order | ERD 작성 순서 | 데이터 모델링의 이해 |
| 54 | SQLD | /lesson/sqld-1-1-s8 | 식별자란 무엇인가 | 데이터 모델링의 이해 |
| 55 | SQLD | /lesson/sqld-1-1-s8-main | 주식별자 4요건 | 데이터 모델링의 이해 |
| 56 | SQLD | /lesson/sqld-1-1-s9 | 식별자 관계 | 데이터 모델링의 이해 |
| 57 | SQLD | /lesson/sqld-1-2-s1 | 정규화가 필요한 이유 | 데이터 모델과 성능 |
| 58 | SQLD | /lesson/sqld-1-2-s2 | 함수적 종속이란 | 데이터 모델과 성능 |
| 59 | SQLD | /lesson/sqld-1-2-s3 | 정규형 순서 | 데이터 모델과 성능 |
| 60 | SQLD | /lesson/sqld-1-2-s3-bcnf | BCNF | 데이터 모델과 성능 |
| 61 | SQLD | /lesson/sqld-1-2-s4 | 반정규화란 | 데이터 모델과 성능 |
| 62 | SQLD | /lesson/sqld-1-2-s6 | 트랜잭션이란 | 데이터 모델과 성능 |
| 63 | SQLD | /lesson/sqld-1-2-s6-acid | ACID 4특성 | 데이터 모델과 성능 |
| 64 | SQLD | /lesson/sqld-1-2-s7 | NULL이란 | 데이터 모델과 성능 |
| 65 | SQLD | /lesson/sqld-1-2-s8 | 본질식별자 vs 인조식별자 | 데이터 모델과 성능 |
| 66 | SQLD | /lesson/sqld-2-1-s10 | WHERE 절 | SQL 기본 |
| 67 | SQLD | /lesson/sqld-2-1-s11 | GROUP BY · HAVING | SQL 기본 |
| 68 | SQLD | /lesson/sqld-2-1-s12 | ORDER BY | SQL 기본 |
| 69 | SQLD | /lesson/sqld-2-1-s2 | 관계대수 | SQL 기본 |
| 70 | SQLD | /lesson/sqld-2-1-s3 | SELECT 실행 순서 | SQL 기본 |
| 71 | SQLD | /lesson/sqld-2-1-s7 | 집계 함수 | SQL 기본 |
| 72 | SQLD | /lesson/sqld-2-1-s9 | CASE와 DECODE | SQL 기본 |
| 73 | SQLD | /lesson/sqld-2-2-s1 | JOIN 4종 | SQL 활용 |
| 74 | SQLD | /lesson/sqld-2-2-s10 | 행 간 참조 함수 | SQL 활용 |
| 75 | SQLD | /lesson/sqld-2-2-s3 | CROSS와 SELF JOIN | SQL 활용 |
| 76 | SQLD | /lesson/sqld-2-2-s4 | 서브쿼리 반환 형태 | SQL 활용 |
| 77 | SQLD | /lesson/sqld-2-2-s6 | 집합 연산자 | SQL 활용 |
| 78 | SQLD | /lesson/sqld-2-2-s7 | ROLLUP | SQL 활용 |
| 79 | SQLD | /lesson/sqld-2-2-s8 | 윈도우 함수 | SQL 활용 |
| 80 | SQLD | /lesson/sqld-2-3-s5-ddl | DDL | 관리 구문 |

### 검증 출력

```text
node manifest count check
lessons 373
indexable 80
noindex 293
adsp indexable 40
sqld indexable 40
```

```text
npm.cmd run typecheck
> questdp@0.1.0 typecheck
> tsc --noEmit
```

```text
npm.cmd test -- --run

RUN  v4.1.5 C:/Users/이도현/Desktop/.claude/worktrees/hardcore-shamir-47f5ab
Test Files  38 passed (38)
Tests  534 passed (534)
```

참고: sandbox 내부 첫 테스트는 Vitest config 로딩 중 `spawn EPERM`으로 실패. 같은 명령을 승인된 unsandboxed 실행으로 재시도했고, 코드 테스트는 통과.

```text
npm.cmd run build

sitemap generated: total 262 URLs (core 17, blog 13, lessons 80, topics 152, quiz 0)
static route HTML generated: 555 pages (core 18, blog 12, lessons 373, topics 152, quiz 0)
seo audit passed: 555 static pages, 262 submitted URLs, 293 noindex pages, quiz 0
```

요청된 grep 명령은 이 Windows PowerShell 환경에 `grep` 실행 파일이 없어 실패:

```text
grep : The term 'grep' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

PowerShell 등가 검증:

```text
(Select-String -Path dist/sitemap-lessons.xml -Pattern '<loc>' -AllMatches).Matches.Count
80

(Get-ChildItem -Path dist/lesson -Recurse -Filter index.html | Select-String -Pattern 'name="robots" content="noindex"' -List | Measure-Object).Count
293

Get-ChildItem -Path dist/lesson -Recurse -Filter index.html | Where-Object { -not (Select-String -Path $_.FullName -Pattern 'noindex' -Quiet) } | Select-Object -First 10 -ExpandProperty FullName
C:\Users\이도현\Desktop\.claude\worktrees\hardcore-shamir-47f5ab\dist\lesson\adsp-1-1-s1\index.html
C:\Users\이도현\Desktop\.claude\worktrees\hardcore-shamir-47f5ab\dist\lesson\adsp-1-1-s3-seci\index.html
C:\Users\이도현\Desktop\.claude\worktrees\hardcore-shamir-47f5ab\dist\lesson\adsp-1-1-s4-dm\index.html
C:\Users\이도현\Desktop\.claude\worktrees\hardcore-shamir-47f5ab\dist\lesson\adsp-1-1-s4-dw\index.html
C:\Users\이도현\Desktop\.claude\worktrees\hardcore-shamir-47f5ab\dist\lesson\adsp-1-1-s4-lake\index.html
C:\Users\이도현\Desktop\.claude\worktrees\hardcore-shamir-47f5ab\dist\lesson\adsp-1-1-s4-olap\index.html
C:\Users\이도현\Desktop\.claude\worktrees\hardcore-shamir-47f5ab\dist\lesson\adsp-1-1-s4-oltp\index.html
C:\Users\이도현\Desktop\.claude\worktrees\hardcore-shamir-47f5ab\dist\lesson\adsp-1-1-s5-crm\index.html
C:\Users\이도현\Desktop\.claude\worktrees\hardcore-shamir-47f5ab\dist\lesson\adsp-1-1-s5-dbms\index.html
C:\Users\이도현\Desktop\.claude\worktrees\hardcore-shamir-47f5ab\dist\lesson\adsp-1-1-s5-erp\index.html

Select-String -Path dist/lesson/adsp-1-1-s1-data/index.html -Pattern '<link rel="canonical"|<meta name="robots"'
dist\lesson\adsp-1-1-s1-data\index.html:56:    <link rel="canonical" href="https://quest-dp.com/lesson/adsp-1-1-s1-data/" />
dist\lesson\adsp-1-1-s1-data\index.html:141:      <meta name="robots" content="noindex" />
```

### 의뢰인 결정 대기

- 위 80개 화이트리스트에서 빼거나 추가할 레슨이 있으면 다음 배치 전에 조정 가능.
- 현재 실제 SEO lesson 정적 페이지 수는 373개. 사용자가 처음 제시한 372개와 1개 차이가 있으나, 기준선 빌드와 manifest는 373개로 확인됨.

## Mission B: Soft 404 Redirect Cleanup

### 변경 파일

- `src/App.tsx`
- `public/_redirects`
- `public/404.html`
- `docs/seo-goal-report.md`

### 기능해야 하는 Path Entry 목록

정적 HTML 파일은 없지만 앱 화면으로 직접 진입해야 하는 경로:

| 구분 | 경로 |
|---|---|
| 앱 셸 | `/app`, `/app/` |
| 인증/관리 | `/login`, `/redeem`, `/refund-request`, `/payment/callback`, `/admin` |
| 온보딩/플랜 | `/onboarding`, `/study-plan` |
| 학습 앱 탭 | `/weakness`, `/progress`, `/quests`, `/friends`, `/stats`, `/settings`, `/bookmarks` |
| 게임 path 진입 | `/game`, `/game/`, `/game/adsp`, `/game/sqld`, `/game/comhwal`, `/game/*` |

정적 HTML이 이미 생성되는 SEO 경로는 기존 rewrite 유지: `/study-method`, `/pricing`, `/contact`, `/about`, `/privacy`, `/terms`, `/refund`, `/glossary`, `/blog`, `/lesson/*`, `/curriculum/*`, `/faq/*`, `/topics/comhwal/...`.

해시 라우팅 영향: `/#/game`은 서버 요청 경로가 `/`이므로 catch-all 제거 영향을 받지 않음.

### 핵심 Diff 요약

- `public/_redirects`의 마지막 `/* /index.html 200` 제거.
- 실제 앱 화면으로 열려야 하는 SPA path entry만 명시 200 rewrite로 추가.
- `src/App.tsx`가 `/login`, `/redeem`, `/refund-request`, `/payment/callback`, `/admin`, `/game/...` 등 path entry를 직접 라우팅하도록 보강.
- 루트에 `public/404.html` 추가. JS 없는 브랜드 404이며 `robots noindex`, 홈/커리큘럼/블로그 링크 포함.

### 검증 출력

```text
npm.cmd run typecheck
> questdp@0.1.0 typecheck
> tsc --noEmit
```

```text
npm.cmd test -- --run

RUN  v4.1.5 C:/Users/이도현/Desktop/.claude/worktrees/hardcore-shamir-47f5ab
Test Files  38 passed (38)
Tests  534 passed (534)
```

```text
npm.cmd run build

sitemap generated: total 262 URLs (core 17, blog 13, lessons 80, topics 152, quiz 0)
static route HTML generated: 555 pages (core 18, blog 12, lessons 373, topics 152, quiz 0)
seo audit passed: 555 static pages, 262 submitted URLs, 293 noindex pages, quiz 0
```

```text
if (Test-Path node_modules/.bin/wrangler.cmd) { 'local wrangler present' } else { 'local wrangler missing' }
local wrangler missing

Get-Command wrangler -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
<no output, exit 1>

Get-ChildItem dist -Filter 404.html | Select-Object -ExpandProperty FullName
C:\Users\이도현\Desktop\.claude\worktrees\hardcore-shamir-47f5ab\dist\404.html
```

```text
Select-String -Path dist/_redirects -Pattern '^/login|^/game|^/curriculum/adsp|/\*'
dist\_redirects:15:/login              /index.html                    200
dist\_redirects:16:/login/             /index.html                    200
dist\_redirects:43:/game               /index.html                    200
dist\_redirects:44:/game/              /index.html                    200
dist\_redirects:45:/game/*             /index.html                    200
dist\_redirects:67:/blog/*              /blog/:splat/index.html         200
dist\_redirects:68:/lesson/*            /lesson/:splat/index.html       200
dist\_redirects:69:/curriculum/adsp     /curriculum/adsp/index.html     200
dist\_redirects:70:/curriculum/adsp/    /curriculum/adsp/index.html     200
dist\_redirects:85:/topics/comhwal/computer-general/*  /topics/comhwal/computer-general/:splat/index.html  200
```

Wrangler 검증 상태: 로컬 설치와 전역 명령이 모두 없어 `npx wrangler pages dev dist` 기반 HTTP 상태 검증은 수행하지 못함. 네트워크 제한 상태에서 신규 설치를 시도하지 않음.

### 배포 후 Curl 체크리스트

```bash
curl -I https://quest-dp.com/__definitely-missing-seo-test__
# 기대: HTTP/2 404

curl -I https://quest-dp.com/login
# 기대: HTTP/2 200

curl -I https://quest-dp.com/curriculum/adsp
# 기대: HTTP/2 200

curl -I https://quest-dp.com/#/game
# 기대: HTTP/2 200, 해시 라우팅은 서버에 fragment가 전달되지 않으므로 루트 응답 확인
```

### 의뢰인 결정 대기

- `/quiz/*`는 sitemap 0건 정책과 soft 404 최소화를 우선해 명시 rewrite에 넣지 않음. valid quiz URL을 직접 공유해야 한다면 별도 noindex 전략으로 다시 열어야 함.

## Mission C: WebSite alternateName Cleanup

### 변경 파일

- `index.html`
- `docs/seo-goal-report.md`

### 핵심 Diff 요약

- WebSite JSON-LD의 `alternateName`에서 키워드 나열을 제거.
- 브랜드 별칭만 남김: `["퀘스트디피"]`.
- Organization JSON-LD의 `alternateName: "퀘스트디피"`는 기존 그대로 유지.

### 검증 출력

```text
Select-String -Path index.html -Pattern '"@type": "WebSite"|"alternateName"' -Context 0,4
index.html:83:        "alternateName": "퀘스트디피",
index.html:106:        "@type": "WebSite",
index.html:108:        "alternateName": ["퀘스트디피"],
```

```text
npm.cmd run typecheck
> questdp@0.1.0 typecheck
> tsc --noEmit
```

```text
npm.cmd test -- --run

RUN  v4.1.5 C:/Users/이도현/Desktop/.claude/worktrees/hardcore-shamir-47f5ab
Test Files  38 passed (38)
Tests  534 passed (534)
```

```text
npm.cmd run build

sitemap generated: total 262 URLs (core 17, blog 13, lessons 80, topics 152, quiz 0)
static route HTML generated: 555 pages (core 18, blog 12, lessons 373, topics 152, quiz 0)
seo audit passed: 555 static pages, 262 submitted URLs, 293 noindex pages, quiz 0
```

### 의뢰인 결정 대기

- 없음.

## WAVE 1 검수 결과 반영

검수자 결정 사항:

- 블로그 작성자 표기는 `QuestDP 운영팀`으로 유지한다. 실명 전환 TODO는 닫음.
- 작성자 약력·보유 자격 공개는 보류한다. About의 현재 서술처럼 실재 프로세스 기반 정보만 유지.
- `reviewedAt` 기본값은 `2026-06-12` 일괄 기준으로 유지한다. 실제 재검수가 일어난 포스트만 개별 값을 갱신한다.
- `/quiz/*`는 현행 유지: sitemap 0건, rewrite 제외, 404.

## Mission A2: Lesson Whitelist Follow-up

### 변경 파일

- `scripts/seo-route-manifest.mjs`
- `src/data/seo/blog.ts`
- `docs/seo-goal-report.md`

### 핵심 결정과 이유

- `/lesson/sqld-1-1-s3d`(데이터 독립성)를 indexable whitelist에서 제외.
- 사유: `/lesson/sqld-1-1-s3`가 ANSI/SPARC 3-스키마와 데이터 독립성을 함께 다루고 있어 검색 표면이 중복됨. 내부 카니벌라이제이션을 피하기 위해 더 넓은 개념 페이지만 유지.
- 블로그 작성자 TODO 주석을 닫고, `reviewedAt` 운영 규칙을 코드 주석으로 남김.

### 검증 출력

```text
node -e "import('./scripts/seo-route-manifest.mjs').then(m=>{const manifest=m.getSeoRouteManifest(); const lessons=manifest.lessons; console.log('lessons', lessons.length); console.log('indexable', lessons.filter(r=>r.indexable!==false).length); console.log('noindex', lessons.filter(r=>r.indexable===false).length); console.log('sqld-1-1-s3d indexable', lessons.find(r=>r.path==='/lesson/sqld-1-1-s3d')?.indexable !== false);})"
lessons 373
indexable 79
noindex 294
sqld-1-1-s3d indexable false
```

```text
npm.cmd run typecheck
> questdp@0.1.0 typecheck
> tsc --noEmit
```

```text
npm.cmd test -- --run

RUN  v4.1.5 C:/Users/이도현/Desktop/.claude/worktrees/hardcore-shamir-47f5ab
Test Files  38 passed (38)
Tests  534 passed (534)
```

```text
npm.cmd run build

sitemap generated: total 261 URLs (core 17, blog 13, lessons 79, topics 152, quiz 0)
static route HTML generated: 555 pages (core 18, blog 12, lessons 373, topics 152, quiz 0)
seo audit passed: 555 static pages, 261 submitted URLs, 294 noindex pages, quiz 0
```

```text
(Select-String -Path dist\sitemap-lessons.xml -Pattern '<loc>' -AllMatches).Matches.Count
79

(Get-ChildItem -Path dist\lesson -Recurse -Filter index.html | Select-String -Pattern 'name="robots" content="noindex"' -List | Measure-Object).Count
294

Select-String -Path dist\lesson\sqld-1-1-s3d\index.html -Pattern 'name="robots" content="noindex"|<link rel="canonical"'
dist\lesson\sqld-1-1-s3d\index.html:56:    <link rel="canonical" href="https://quest-dp.com/lesson/sqld-1-1-s3d/" />
dist\lesson\sqld-1-1-s3d\index.html:142:      <meta name="robots" content="noindex" />
```

### 사람 결정 대기

- 없음.

## Mission F: Curriculum Exam Facts

### 변경 파일

- `src/pages/CurriculumPage.tsx`
- `scripts/seo-route-manifest.mjs`
- `docs/seo-goal-report.md`

### 핵심 결정과 이유

- 커리큘럼 3종 및 컴활 세부 커리큘럼에 `시험 사실` 섹션을 확장.
- 포함 항목: 주관처, 시험 방식, 과목 구성, 문항 수와 시간, 합격 기준, 시험 범위, 응시 자격.
- 일정·응시료는 직접 숫자로 기재하지 않고 공식 안내 링크로만 처리.
- ADsP·SQLD 문항 유형은 단정하지 않고 `총 50문항 · 90분`으로 보수 표기. 컴활 필기 문항 수와 시간은 대한상공회의소 안내 기준으로 유지.
- 공식 링크:
  - ADsP: `https://www.dataq.or.kr/www/sub/a_06.do`
  - SQLD: `https://www.dataq.or.kr/www/sub/a_04.do`
  - 컴활: `https://license.korcham.net/co/examguide.do?cd=0103&mm=21`
- 같은 시험 질문이 더 필요한 사용자는 `/faq/adsp`, `/faq/sqld`, `/faq/comhwal`로 이어지도록 기존 FAQ 링크를 유지.

### 검증 출력

```text
npm.cmd run typecheck
> questdp@0.1.0 typecheck
> tsc --noEmit
```

```text
npm.cmd test -- --run

RUN  v4.1.5 C:/Users/이도현/Desktop/.claude/worktrees/hardcore-shamir-47f5ab
Test Files  38 passed (38)
Tests  534 passed (534)
```

```text
npm.cmd run build

sitemap generated: total 261 URLs (core 17, blog 13, lessons 79, topics 152, quiz 0)
static route HTML generated: 555 pages (core 18, blog 12, lessons 373, topics 152, quiz 0)
seo audit passed: 555 static pages, 261 submitted URLs, 294 noindex pages, quiz 0
```

```text
Select-String -Path dist\curriculum\adsp\index.html -Pattern '시험 사실|시험 방식|과목 구성|응시 자격|공식 일정'
dist\curriculum\adsp\index.html:186:<h2>데이터분석준전문가(ADsP) 시험 사실</h2>
dist\curriculum\adsp\index.html:189:<dt>시험 방식</dt><dd>필기시험</dd>
dist\curriculum\adsp\index.html:190:<dt>과목 구성</dt><dd>데이터 이해 · 데이터분석 기획 · 데이터분석</dd>
dist\curriculum\adsp\index.html:194:<dt>응시 자격</dt><dd>제한 없음</dd>
dist\curriculum\adsp\index.html:197:<p>시험 일정과 응시료는 회차별로 바뀔 수 있어 KDATA 공식 안내에서 확인하세요. <a href="https://www.dataq.or.kr/www/sub/a_06.do">공식 일정·응시료 확인</a></p>

Select-String -Path dist\curriculum\sqld\index.html -Pattern '시험 사실|데이터 모델링의 이해 · SQL 기본 및 활용|응시 자격|dataq\.or\.kr'
dist\curriculum\sqld\index.html:186:<h2>SQL 개발자(SQLD) 시험 사실</h2>
dist\curriculum\sqld\index.html:190:<dt>과목 구성</dt><dd>데이터 모델링의 이해 · SQL 기본 및 활용</dd>
dist\curriculum\sqld\index.html:194:<dt>응시 자격</dt><dd>제한 없음</dd>
dist\curriculum\sqld\index.html:197:<p>시험 일정과 응시료는 회차별로 바뀔 수 있어 KDATA 공식 안내에서 확인하세요. <a href="https://www.dataq.or.kr/www/sub/a_04.do">공식 일정·응시료 확인</a></p>

Select-String -Path dist\curriculum\comhwal\index.html -Pattern '시험 사실|1급 3과목 · 2급 2과목|응시 자격|license\.korcham\.net'
dist\curriculum\comhwal\index.html:186:<h2>컴퓨터활용능력 필기 시험 사실</h2>
dist\curriculum\comhwal\index.html:190:<dt>과목 구성</dt><dd>1급 3과목 · 2급 2과목</dd>
dist\curriculum\comhwal\index.html:194:<dt>응시 자격</dt><dd>제한 없음</dd>
dist\curriculum\comhwal\index.html:197:<p>상시시험 일정과 응시료는 지역·접수 시점에 따라 달라질 수 있어 대한상공회의소 공식 안내에서 확인하세요. <a href="https://license.korcham.net/co/examguide.do?cd=0103&amp;mm=21">공식 일정·응시료 확인</a></p>
```

### 사람 결정 대기

- 없음. 일정·응시료처럼 바뀌는 값은 공식 링크 확인으로 처리.

## Mission G: Home Fact Block

### 변경 파일

- `src/pages/Landing.tsx`
- `scripts/generate-static-route-html.mjs`
- `scripts/seo-route-manifest.mjs`
- `scripts/seo-audit.mjs`
- `docs/seo-goal-report.md`

### 핵심 결정과 이유

- 홈 hero 바로 아래에 `QuestDP 는 무엇인가` 팩트 블록을 추가.
- 문장은 서비스 정의, 대상 자격증, 실제 학습 흐름만 짧게 설명하고 과장 표현을 넣지 않음.
- ADsP·SQLD·컴활 커리큘럼 허브 링크를 같은 블록 안에 배치.
- 정적 홈 fallback에도 같은 팩트 블록과 허브 링크를 추가.
- `seo-audit`가 홈 fallback 본문을 1,000자 이상(코드포인트 기준, 바이트 아님)으로 검사하도록 확장.

### 검증 출력

```text
npm.cmd run typecheck
> questdp@0.1.0 typecheck
> tsc --noEmit
```

```text
npm.cmd test -- --run

RUN  v4.1.5 C:/Users/이도현/Desktop/.claude/worktrees/hardcore-shamir-47f5ab
Test Files  38 passed (38)
Tests  534 passed (534)
```

```text
npm.cmd run build

sitemap generated: total 261 URLs (core 17, blog 13, lessons 79, topics 152, quiz 0)
static route HTML generated: 555 pages (core 18, blog 12, lessons 373, topics 152, quiz 0)
seo audit passed: 555 static pages, 261 submitted URLs, 294 noindex pages, quiz 0
```

```text
node home visible text count
1108

Select-String -Path dist\index.html -Pattern 'QuestDP 는 무엇인가|ADsP 커리큘럼|SQLD 커리큘럼|컴활 커리큘럼|data-seo-home-fallback="true"'
dist\index.html:182:      <main class="qdp-home-fallback" data-seo-home-fallback="true">
dist\index.html:211:              <h2 id="qdp-home-fact-title">QuestDP 는 무엇인가</h2>
dist\index.html:215:              <a href="/curriculum/adsp">ADsP 커리큘럼</a>
dist\index.html:216:              <a href="/curriculum/sqld">SQLD 커리큘럼</a>
dist\index.html:217:              <a href="/curriculum/comhwal">컴활 커리큘럼</a>
```

### 사람 결정 대기

- 없음.

## WAVE 1 검수 요청

### 로컬 커밋

```text
HEAD seo(E): add blog rss feed
ed1dc69 seo(D): add content review trust signals
e8835df seo(C): simplify website alternate name
74dab78 seo(B): remove catch-all soft 404 fallback
9cee757 seo(A): redesign lesson index strategy
```

### 최종 검증 상태

- 마지막 전체 검증은 Mission E에서 수행.
- `npm.cmd run typecheck` 통과.
- `npm.cmd test -- --run` 통과: 38 files / 534 tests.
- `npm.cmd run build` 통과: `seo audit passed: 555 static pages, 262 submitted URLs, 293 noindex pages, quiz 0`.
- push는 실행하지 않음.
- WAVE 2는 시작하지 않음.

### 사람 결정 대기 요약

| 항목 | 결정 필요 |
| --- | --- |
| Mission A | 80개 lesson 색인 whitelist 중 제외할 항목이 있는지 검수 필요 |
| Mission B | `/quiz/*`를 path 진입형으로 열어야 하는지, 아니면 현재처럼 sitemap 0건·rewrite 제외를 유지할지 결정 필요 |
| Mission D | 블로그 작성자 표기: `QuestDP 운영팀` 유지 또는 실명 전환 |
| Mission D | 작성자 약력 한 줄, 보유 자격·실무 경력 공개 가능 여부 |
| Mission D | `reviewedAt`을 일괄 검수일로 둘지, 포스트별 실제 검수일로 관리할지 결정 필요 |

검수 시작점 커밋 해시: `b2ed46c`.

## Mission D: About / E-E-A-T Signals

### 변경 파일

- `src/data/legal.ts`
- `src/data/seo/blog.ts`
- `src/pages/BlogPostPage.tsx`
- `src/pages/CurriculumPage.tsx`
- `scripts/seo-route-manifest.mjs`
- `docs/seo-goal-report.md`

### 핵심 Diff 요약

- About 페이지에 `콘텐츠는 이렇게 만들고 검수합니다` 섹션을 추가.
- 검수 근거는 실제 운영 프로세스만 사용:
  - `scripts/validate-questions.mjs`의 M1~M6 기계 검증.
  - 엑셀 계산형 문항은 필요 시 Excel COM Evaluate 재검산.
  - 수정 이력은 `docs/content-edit-log.md`로 관리.
  - 시험 범위 기준은 ADSP·SQLD=KDATA, 컴활=대한상공회의소 자격평가사업단.
- 블로그 데이터에 `author`, `reviewedAt` 필드를 추가하고 기본값을 `QuestDP 운영팀`, `2026-06-12`로 연결.
- Blog Article JSON-LD의 `author`, `dateModified`와 화면 노출 메타를 실제 필드에 연결.
- 커리큘럼 3종 및 컴활 세부 커리큘럼 하단에 출제기준·최종 검수일 한 줄을 노출.
- 정적 HTML 스냅샷에도 About 본문, 블로그 작성·검수 메타, 커리큘럼 검수 문구가 포함되도록 manifest 생성 로직을 보강.

### 검증 출력

```text
node -e "import('./scripts/seo-route-manifest.mjs').then(m=>{const manifest=m.buildSeoRouteManifest(); console.log({core:manifest.core.length,blog:manifest.blog.length,lessons:manifest.lessons.length,topics:manifest.topics.length,total:m.flattenSeoRoutes(manifest).length}); console.log(manifest.blog[0].author, manifest.blog[0].reviewedAt);})"
{
  core: 18,
  blog: 12,
  lessons: 373,
  topics: 152,
  total: 555
}
QuestDP 운영팀 2026-06-12
```

```text
Select-String -Path src/data/legal.ts -Pattern '콘텐츠는 이렇게|M1~M6|Excel COM Evaluate'
src\data\legal.ts:97:    heading: '콘텐츠는 이렇게 만들고 검수합니다',
src\data\legal.ts:100:        '문제은행은 scripts/validate-questions.mjs의 M1~M6 규칙으로 JSON 구조, 정답 인덱스, 선택지 중복, 정답 단서, 해설 부족, ID 중복을 기계 검증합니다.',
src\data\legal.ts:101:        '엑셀 함수·계산형 문항은 필요 시 Excel COM Evaluate로 재계산해 값이 맞는지 확인하고, 수정 이력은 docs/content-edit-log.md에 남깁니다.',
```

```text
Select-String -Path src/pages/CurriculumPage.tsx -Pattern 'CURRICULUM_REVIEW|최종 검수'
src\pages\CurriculumPage.tsx:24:const CURRICULUM_REVIEW: Record<string, { basis: string; reviewedAt: string }> = {
src\pages\CurriculumPage.tsx:537:              이 페이지는 {review.basis} 기준, 최종 검수 {review.reviewedAt}
```

```text
npm.cmd run typecheck
> questdp@0.1.0 typecheck
> tsc --noEmit
```

```text
npm.cmd test -- --run

RUN  v4.1.5 C:/Users/이도현/Desktop/.claude/worktrees/hardcore-shamir-47f5ab
Test Files  38 passed (38)
Tests  534 passed (534)
```

```text
npm.cmd run build

sitemap generated: total 262 URLs (core 17, blog 13, lessons 80, topics 152, quiz 0)
static route HTML generated: 555 pages (core 18, blog 12, lessons 373, topics 152, quiz 0)
seo audit passed: 555 static pages, 262 submitted URLs, 293 noindex pages, quiz 0
```

```text
Select-String -Path dist/about/index.html -Pattern '콘텐츠는 이렇게|M1~M6|Excel COM Evaluate'
dist\about\index.html:1:...콘텐츠는 이렇게 만들고 검수합니다...M1~M6...Excel COM Evaluate...

Select-String -Path dist/blog/comhwal-1급-vs-2급/index.html -Pattern 'dateModified|QuestDP 운영팀|작성 2026-06-04'
dist\blog\comhwal-1급-vs-2급\index.html:1:...dateModified":"2026-06-12"...QuestDP 운영팀...작성 2026-06-04 · 검수 2026-06-12...

Select-String -Path dist/curriculum/adsp/index.html -Pattern 'KDATA 데이터자격검정 시험범위 기준, 최종 검수'
dist\curriculum\adsp\index.html:1:...2026년 KDATA 데이터자격검정 시험범위 기준, 최종 검수 2026-06-12...

Select-String -Path dist/curriculum/comhwal/index.html -Pattern '대한상공회의소 자격평가사업단 안내 기준, 최종 검수'
dist\curriculum\comhwal\index.html:1:...2026년 대한상공회의소 자격평가사업단 안내 기준, 최종 검수 2026-06-12...
```

### 의뢰인 질문 목록

- 블로그/Article 작성자 표기를 `QuestDP 운영팀`으로 유지할지, 운영자 실명으로 바꿀지 결정 필요.
- 작성자 약력 한 줄을 공개할 수 있는지 확인 필요.
- 운영자 또는 검수자의 보유 자격·실무 경력을 공개할 수 있는지 확인 필요.
- `reviewedAt`을 이번 일괄 검수일로 유지할지, 포스트별 실제 검수 완료일로 별도 관리할지 결정 필요.

## Mission E: RSS Feed

### 변경 파일

- `scripts/generate-sitemap.mjs`
- `scripts/seo-audit.mjs`
- `index.html`
- `public/rss.xml`
- `docs/seo-goal-report.md`

### 핵심 Diff 요약

- sitemap 생성 스크립트가 같은 SEO route manifest의 블로그 12편으로 `public/rss.xml`을 생성하도록 추가.
- RSS는 RSS 2.0 형식이며, 전문 복제가 아니라 제목·요약·링크·permalink guid만 포함.
- `index.html` head에 `<link rel="alternate" type="application/rss+xml" ...>` 추가.
- `seo-audit.mjs`가 빌드 산출물 `dist/rss.xml` 존재, RSS 2.0 형식, item 12개를 검증하도록 확장.

### 검증 출력

```text
npm.cmd run typecheck
> questdp@0.1.0 typecheck
> tsc --noEmit
```

```text
npm.cmd test -- --run

RUN  v4.1.5 C:/Users/이도현/Desktop/.claude/worktrees/hardcore-shamir-47f5ab
Test Files  38 passed (38)
Tests  534 passed (534)
```

```text
npm.cmd run build

sitemap generated: total 262 URLs (core 17, blog 13, lessons 80, topics 152, quiz 0)
static route HTML generated: 555 pages (core 18, blog 12, lessons 373, topics 152, quiz 0)
seo audit passed: 555 static pages, 262 submitted URLs, 293 noindex pages, quiz 0
```

```text
(Select-String -Path dist\rss.xml -Pattern '<item>' -AllMatches).Matches.Count
12

Select-String -Path dist\rss.xml -Pattern '<rss version="2.0">|<title>QuestDP 공부법 블로그</title>'
dist\rss.xml:2:<rss version="2.0">
dist\rss.xml:4:    <title>QuestDP 공부법 블로그</title>

Select-String -Path dist\index.html -Pattern 'application/rss\+xml|/rss.xml'
dist\index.html:124:    <link rel="alternate" type="application/rss+xml" title="QuestDP 공부법 RSS" href="/rss.xml" />
```

### 의뢰인 결정 대기

- 없음.
