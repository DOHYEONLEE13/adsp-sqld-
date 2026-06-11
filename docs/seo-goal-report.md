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
