# QuestDP — SEO 전략 (전세계 최고수준 목표)

> **최종 갱신**: 2026-05-07
> **작성 의도**: ADsP·SQLD 한국 검색 시장에서 1년 내 **"ADsP", "SQLD" 단일 키워드 1페이지 진입** + "ADsP 기출", "SQLD 공부법" 등 long-tail 50+ 키워드 1면 점유. Naver(Yeti) · Google(Googlebot) · Daum 동시 최적화.
>
> **기준선** (2026-05-07): Tier 1 + Tier 2 PR4 까지 완료. sitemap 987 URL · JSON-LD Organization/WebSite/Course/FAQPage/Blog/BreadcrumbList · pillar 4종 (curriculum × 2, faq × 2) + blog 4편 + glossary. **현재 organic traffic 측정 인프라 부재** — Tier 0 의 가장 시급한 구멍.

---

## 0. Executive Summary (3줄 요약)

1. **기반은 깔려있다**. robots/sitemap/JSON-LD/canonical/OG/icon/manifest/Naver 인증/FAQ pillar/blog 4편/glossary 모두 존재. SPA 라우트별 `useSeoMeta` 동적 갱신 OK.
2. **세 가지 큰 구멍** — ① **GSC 미등록 + GA4/Plausible 미설치** → 무엇이 먹히는지 모름 ② **SPA prerender 부재** → Yeti(네이버봇) 가 빈 `<div id="root">` 만 보고 색인 실패 가능성 ③ **콘텐츠 부족 — blog 4편 / glossary 50 어휘** → topical authority 부족.
3. **앞으로 90일 우선순위** (P0): GSC + GA4 등록 → prerender (vite-plugin-prerender 또는 SSG) → blog 4 → 20편 + glossary 50 → 200어휘 + 토픽 클러스터 페이지 12 (`/topics/:subject/:chapter/:topic`).

---

## 1. 현재 상태 진단 (2026-05-07 기준)

### 1.1 ✅ 이미 갖춘 것 (= 평균 이상 한국 SaaS)

| 영역 | 항목 | 위치 |
|---|---|---|
| 메타 | title/description/canonical/og/twitter | `index.html` + `useSeoMeta` |
| 구조화 데이터 | Organization, WebSite, Course, FAQPage, Blog, BreadcrumbList, ItemList, DefinedTermSet | `index.html` + 페이지별 |
| 사이트맵 | 987 URL — 정적 16 + lesson 301 + quiz 670 | `public/sitemap.xml` (자동 생성) |
| robots | Allow/Disallow + 봇별 명시 (Googlebot/Yeti) | `public/robots.txt` |
| 검색엔진 인증 | Naver Search Advisor | `<meta name="naver-site-verification">` |
| OG 이미지 | 1423×752, alt 동봉 | `/og/default.png` |
| Favicon | 32/96/192/512 + maskable + apple-touch | `/logo/questdp-mark.png` |
| PWA | manifest.json (standalone) | `public/manifest.json` |
| 콘텐츠 hub | curriculum × 2 / faq × 2 / glossary / blog × 4 | `src/pages/` |
| Korean UX | inLanguage ko-KR, 한글 lang | `index.html` |

### 1.2 ❌ 누락된 것 (= 세계 최고 기준 갭)

| 영역 | 갭 | 영향도 |
|---|---|---|
| **측정** | Google Search Console 미등록 (`<meta name="google-site-verification">` 비어있음) | **Critical** — 무엇이 색인됐는지 모름 |
| **측정** | GA4 / Plausible / Umami 등 analytics 부재 | **Critical** — 어떤 키워드가 트래픽 가져오는지 모름 |
| **측정** | Bing Webmaster Tools 미등록 | High |
| **측정** | Naver 통계 (네이버 애널리틱스) 미등록 | High |
| **렌더링** | Vite SPA — Yeti(네이버봇) JS 렌더링 약함 → `<div id="root"></div>` 만 색인될 위험 | **Critical** for Naver |
| **렌더링** | Google 도 SPA hydration delay 시 첫 패스에 빈 페이지 인식 가능 | High |
| **콘텐츠** | blog 4편만 존재 — topical authority 부족 (목표 20~30편) | High |
| **콘텐츠** | 토픽 클러스터 페이지 (`/topics/:subject/:topic`) 부재 — 305 step 페이지 hub 없음 | High |
| **콘텐츠** | "ADsP 기출문제 다운로드" / "SQLD 후기" / "비전공자 합격" 같은 high-volume long-tail 미커버 | High |
| **E-E-A-T** | 작성자 페이지 (이도현 author bio) 없음 → BlogPosting `author` 필드 비어있음 | Medium |
| **E-E-A-T** | sameAs 링크 부재 (LinkedIn, GitHub, X/Twitter, 네이버 블로그) | Medium |
| **링크 그래프** | 관련 lesson 간 cross-link 자동화 없음 — 수동 `relatedSlugs` 만 | Medium |
| **이미지 SEO** | mascot/logo 이미지 alt 필드 없음, ImageObject schema 부재 | Medium |
| **Core Web Vitals** | Three.js Planet bundle 894KB — LCP 영향 가능 | Medium |
| **속도** | Mux 영상 4종 동시 로드 — LCP/INP 위협 (preconnect 만 있고 lazy-load 점검 필요) | Medium |
| **검색 색인 가속** | IndexNow / Google Indexing API webhook 없음 — 새 페이지 색인 1~2주 대기 | Low (volume 작아서) |
| **백링크** | 외부 링크 빌딩 전략 없음 — 도메인 권위 자연 성장만 의존 | High (장기) |
| **로컬 SEO** | 한국 시장이라 LocalBusiness schema 는 불필요. 단 KDATA 등 신뢰 출처 sameAs 인용은 가능 | Low |

---

## 2. 목표 KPI (Year 1)

| 지표 | 현재 (2026-05) | T+3개월 | T+6개월 | T+12개월 |
|---|---|---|---|---|
| GSC 색인된 URL | 측정불가 | 50+ | 300+ | 800+ |
| 월 organic 세션 (GA4) | 측정불가 | 500 | 5,000 | 30,000 |
| "ADsP" SERP 순위 (Naver) | – | 30위권 | 10위권 | 1면 (1~10) |
| "SQLD" SERP 순위 (Naver) | – | 50위권 | 20위권 | 1면 |
| "ADsP 기출" SERP (Google) | – | 20위권 | 5위권 | **Featured snippet** |
| 블로그 포스트 수 | 4 | 12 | 24 | 40 |
| 평균 LCP (mobile) | 미측정 | <2.5s | <2.0s | <1.5s |
| 백링크 referring domains | 0 | 5 | 20 | 80 |

---

## 3. 전략 — 5개 축

### 축 1 — **측정 인프라** (관측 없으면 최적화 없다)
### 축 2 — **렌더링 / 색인 보장** (봇이 못 읽으면 끝)
### 축 3 — **콘텐츠 깊이 & 토픽 권위** (네이버·구글 둘 다 양 + 깊이 평가)
### 축 4 — **E-E-A-T & 신뢰 신호** (작성자·도메인 권위)
### 축 5 — **속도 & UX** (Core Web Vitals)

---

## 4. Phase 별 액션 플랜

### 🟥 Phase 0 — 측정 인프라 (Week 1~2, **모든 작업의 전제**)

> **이거 안 하면 나머지 다 의미 없음**. 무엇이 효과 있는지 데이터로 검증되어야 우선순위 재조정 가능.

#### A. Google Search Console (Day 1)

1. https://search.google.com/search-console 도메인 속성 추가 (`quest-dp.com`)
2. DNS TXT 또는 HTML meta 인증 — `index.html` 41행 주석 위에 메타 추가:
   ```html
   <meta name="google-site-verification" content="..." />
   ```
3. sitemap 제출: `https://quest-dp.com/sitemap.xml`
4. URL 검사 — 대표 5페이지 (홈, /curriculum/adsp, /curriculum/sqld, /faq/adsp, /blog/adsp-vs-sqld-순서) 색인 요청
5. **이후 매주 월요일** 색인 커버리지 모니터링

#### B. Bing Webmaster Tools (Day 1)

1. https://www.bing.com/webmasters/ 등록
2. GSC 에서 import (Bing 이 GSC 토큰 그대로 인정)
3. sitemap 제출

#### C. GA4 + 이벤트 추적 (Day 1~3)

```html
<!-- index.html <head> 끝부분 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX', { send_page_view: false });  // SPA 수동 처리
</script>
```

`src/lib/analytics.ts` 신설:
```ts
export function trackPageview(path: string) {
  if (typeof gtag !== 'function') return;
  gtag('event', 'page_view', { page_path: path, page_title: document.title });
}
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof gtag !== 'function') return;
  gtag('event', name, params);
}
```

라우트 변경 hook (App.tsx) 에서 `trackPageview(window.location.hash)` 호출. 핵심 이벤트 정의:
- `lesson_start`, `lesson_complete`, `quiz_attempt`, `quiz_correct`, `signup_complete`, `purchase_premium`, `share_click`

#### D. Naver Search Advisor 통계 (Day 2)

이미 인증 메타 있음 (`naver-site-verification`). Search Advisor → "수집 통계" / "검색 통계" / "RSS 제출" 활성. RSS feed 신설 필요 (블로그 갱신 알림).

#### E. Plausible / Umami 백업 analytics (Optional, Day 3)

GA4 가 Korean PII 동의 + GDPR 처리 부담스러우면 Plausible/Umami 같은 cookieless 도구 병행. 1차는 GA4 만으로 충분.

---

### 🟧 Phase 1 — 렌더링 & 색인 보장 (Week 3~4, **Yeti 대응**)

#### F. SPA Prerender 도입 (가장 큰 구멍)

**문제**: Vite + React SPA → 첫 응답 HTML 은 `<div id="root"></div>` 비어있음. Googlebot 은 2-pass rendering 으로 JS 실행 후 색인하지만, **Yeti(네이버봇)는 JS 렌더링이 매우 제한적** — 한국 시장 1순위인데 색인 누락 위험.

**해결책 — vite-plugin-prerender** 또는 **react-snap** 도입:

`vite.config.ts` 에 prerender 플러그인 추가:
```ts
import prerender from '@prerenderer/rollup-plugin';

plugins: [
  // ... 기존 플러그인
  process.env.NODE_ENV === 'production' &&
    prerender({
      routes: PRERENDER_ROUTES,  // 아래
      renderer: '@prerenderer/renderer-puppeteer',
      rendererOptions: { renderAfterTime: 3000 },
    }),
]
```

**prerender 대상 라우트** (~50개로 시작):
- `/`, `/about`, `/pricing`, `/privacy`, `/terms`, `/refund` (정적 6)
- `/curriculum/adsp`, `/curriculum/sqld`
- `/faq/adsp`, `/faq/sqld`
- `/glossary`
- `/blog`, `/blog/:slug` × 4 (전체 BlogPost)
- `/lesson/:stepId` × 30 (가장 많이 검색될 stepId 만 — Phase 2 에 확장)

**검증**:
1. 빌드 후 `dist/` 안 정적 HTML 파일에 `<title>`, `<meta>`, 본문 문자열 포함 확인
2. `curl -A "Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)" https://quest-dp.com/curriculum/adsp` → HTML 본문 보임 확인
3. GSC URL 검사 → "Googlebot 으로 페이지 가져오기" 렌더링 결과에 콘텐츠 표시

**대안** — vite SSG: `vite-plugin-ssg` 또는 Astro 마이그레이션. 현 시점엔 너무 큰 변경. prerender 가 ROI 최고.

#### G. 라우트 히스토리 모드 전환 검토 (P2 Strategic)

현재 hash router (`#/curriculum/adsp`). hash 는 검색엔진 색인에 불리 — 표준은 path-based.

```
현재: https://quest-dp.com/#/curriculum/adsp
목표: https://quest-dp.com/curriculum/adsp
```

이미 sitemap 의 URL 은 path-based (`/curriculum/adsp`) 이므로 **반쪽** 작동 중. App.tsx 의 router 를 hash → history mode 로 전환 + Cloudflare Pages SPA fallback (`_redirects` 의 `/* /index.html 200`) 점검.

`public/_redirects` 갱신 필요 — 이미 있는지 확인.

---

### 🟨 Phase 2 — 콘텐츠 깊이 & 토픽 권위 (Week 5~12, **장기 가치 핵심**)

#### H. 토픽 클러스터 페이지 — `/topics/:subject/:chapter/:topic`

현 sitemap 에 lesson step 301개는 indexable 이지만 **개별 step 만으론 키워드 깊이 부족**. step 들 위에 한 단계 묶는 hub 페이지 필요.

```
/topics/adsp/1/dikw           ← lesson step 5개 + glossary 1 + faq 2 + blog 1
/topics/adsp/1/seci
/topics/adsp/2/crisp-dm
...
/topics/sqld/2/window-function
```

**페이지 구성**:
- H1: "DIKW 피라미드 — ADsP 핵심 개념 완벽 정리"
- 짧은 정의 (200자) — schema.org `DefinedTerm`
- 관련 step 5~10개 카드 그리드 — schema.org `ItemList`
- "이 토픽이 자주 묻는 질문" — schema.org `FAQPage`
- 관련 기출문제 3~5개 — schema.org `Quiz`
- 관련 글 (`relatedBlogSlugs`) — schema.org `Article` cross-link

**자동 생성**: `src/data/subjects.ts` 의 토픽 × 챕터 → 약 30 페이지 (ADsP 12 + SQLD 18). `src/lib/topicHub.ts` 신설, generate-sitemap.mjs 가 자동 추가.

**효과**: 305 step + 30 hub + 4 blog 가 internal link 그래프로 묶임 → "DIKW 뜻", "정규화 BCNF", "윈도우 함수 ROW_NUMBER" 같은 long-tail 키워드 50+ 개 자동 진입.

#### I. Blog 6 → 24편 (12주, 주 1.5편)

현재 코너스톤 4편. 다음 20편 시리즈:

**시리즈 A: 출제범위 deep-dive (8편)**
- ADsP 1과목 데이터 이해 — 출제 패턴 분석
- ADsP 2과목 분석 기획 — 자주 헷갈리는 8가지
- ADsP 3과목 데이터 분석 — R 코드 vs 개념 비중
- SQLD 1과목 모델링 — 정규화 단계별 함정
- SQLD 2과목 SQL 기본 — 실수하기 쉬운 NULL 처리
- SQLD 2과목 SQL 활용 — 윈도우 함수 30분 마스터
- SQLD 2과목 관리 구문 — TCL 시험 출제 빈도
- SQLD 3과목 — 출제 비중과 우선순위

**시리즈 B: 합격 후기/케이스 가이드 (6편)** — 실제 후기 없으니 "비전공자 ADsP 30일 가이드" 같은 honest framing
- 비전공자 ADsP 30일 학습 일정 (주별 상세)
- 직장인 ADsP 평일 1시간 / 주말 4시간 플랜
- 대학생 ADsP + SQLD 동시 준비 플랜
- 2주 벼락치기 ADsP — 위험성과 합격 가능 영역
- ADsP 떨어졌을 때 — 다음 회차까지 90일 재정비
- SQLD 노랭이 책 + QuestDP 병행 학습법

**시리즈 C: 비교/대안 (6편)**
- ADsP vs ADP — 한 단계 위 자격증 가는 길
- SQLD vs SQLP — 두 자격증 차이와 진로
- KDATA 자격증 5종 — ADsP/SQLD/DAsP/DAP/빅분기 한눈에
- 데이터분석 자격증 vs 실무 — 채용 우대 가산점
- ADsP 합격 → 다음 자격증 추천 (ADP / 빅분기 / SQLP)
- 데이터 직군 신입 — 자격증 패키지 추천

**시리즈 D: 도구/리소스 (4편)** — 검색 의도 informational
- ADsP R 기초 — 시험에 나오는 명령어 30개
- SQLD ORA 함수 시험에 나오는 12개
- ADsP 통계 공식 시험 출제 빈도 표
- SQLD 정규형 한 페이지 요약 (다운로드 가능 png)

각 포스트: **2,500~4,000자** + 내부 링크 5~10개 + FAQ 5문 + 관련 글 3개 + Schema.org `BlogPosting` + `FAQPage` + `BreadcrumbList`.

#### J. Glossary 50 → 200 어휘

기존 50 → 추가 150:
- ADsP 통계: t검정/F검정/카이제곱/Cohen kappa 등 30
- ADsP 머신러닝: 6대 모델 세부 용어 + 평가지표 30
- SQLD 모델링: 정규형/이상현상/관계 종류 30
- SQLD SQL: 함수/연산자/제약조건 30
- 공통: 데이터 처리/거버넌스/AI 일반 30

각 용어 별 단일 페이지 (`/glossary/:slug`) — 현재는 단일 인덱스만. 페이지 분리 시 `DefinedTerm` schema 단일 entry 로 page weight 집중.

#### K. "/study-plan" / "/exam-schedule" 자동 갱신 페이지 (P2)

- `/exam-schedule/adsp` — KDATA 공식 시험 일정 + D-day 카운터 — 매년 업데이트, evergreen 검색 매력
- `/study-plan/adsp/:weeks` — 1~12주 일정 동적 생성

이런 utility 페이지가 backlinks 많이 받음 (다른 블로거가 인용).

---

### 🟦 Phase 3 — E-E-A-T & 신뢰 신호 (Week 8~12, 콘텐츠와 병행)

#### L. 작성자 페이지 + Person Schema

`src/pages/AuthorPage.tsx` 신설 — `/author/dohyeon`:
- 이도현 사진 + 한 줄 소개
- 데이터 자격증 보유 (ADsP 합격? — 사실 정확성 1순위, 거짓 X)
- 운영 동기 / 현재 사업자 정보 (퀘스트디피, 604-48-01123)
- LinkedIn, GitHub, X/Twitter 링크

JSON-LD `Person`:
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "이도현",
  "jobTitle": "QuestDP 대표 / 데이터 자격증 학습 콘텐츠 큐레이터",
  "url": "https://quest-dp.com/author/dohyeon",
  "sameAs": [
    "https://www.linkedin.com/in/...",
    "https://github.com/..."
  ]
}
```

모든 BlogPosting 의 `author` 필드 → 이 Person URL 참조.

#### M. Organization Schema 강화 — `sameAs`

`index.html` 의 Organization JSON-LD 에 추가:
```json
"sameAs": [
  "https://www.linkedin.com/company/questdp",
  "https://blog.naver.com/questdp",
  "https://www.youtube.com/@questdp",
  "https://www.instagram.com/questdp/"
]
```

→ Knowledge Panel 발생 시 한 번에 클러스터.

#### N. 외부 신호 — 백링크 빌딩 (P1, 장기)

**Tier 1 — 즉시 (Week 5~8)**:
- 네이버 블로그 / 티스토리 — QuestDP 공식 블로그 개설, 본 사이트로 백링크 (자기 인용은 제한적이지만 citation 효과)
- 다음 카페 / 네이버 카페 — "ADsP 합격" 카페 가입 후 무료 학습 도구 소개
- 디스콰이엇 / 잡플래닛 / 사람인 커뮤니티 — 신규 SaaS 소개

**Tier 2 — 콘텐츠 마케팅 (Week 8~24)**:
- ADsP/SQLD 학원 블로그 가이드 글에 "QuestDP 무료 학습 추천" 인용 유도 (게스트 포스트)
- 유튜브 — "ADsP 30일 합격" 시리즈 4편 + 영상 설명에 사이트 링크
- GitHub README — `awesome-korean-cert` 같은 큐레이션 리포에 PR

**Tier 3 — PR / 매체 (Week 12~52)**:
- 스타트업 미디어 (벤처스퀘어, 플래텀, 아웃스탠딩) "1인 SaaS" 케이스 스토리
- 기술 블로그 (요즘IT, 마키터스) 인터뷰 / 게스트 포스트
- 한국데이터산업진흥원 (KDATA) 협력 학습 도구 등재 가능성 타진

**도메인 권위 측정**: Ahrefs 무료 계정 또는 Moz Domain Authority 분기별 체크.

---

### 🟪 Phase 4 — 속도 & Core Web Vitals (Week 4~8, 병행)

#### O. LCP 단축

CLAUDE.md 에 명시된 "번들 분할" 작업 가속 — `Planet-*.js` 894KB three.js 가 Landing 의 LCP 직접 영향 안 주지만, /game 진입 후 navigate 시 cumulative impact.

- Three.js → route-based dynamic import (`React.lazy`)
- Hero Mux video — `loading="lazy"` 점검, autoplay 모바일 데이터 saver 대응
- Hero 첫 프레임 — `<img loading="eager" fetchpriority="high">` (이미 OG image 에 적용됨, hero video poster 점검)
- Above-the-fold 폰트 — `Noto Sans KR 700` `font-display: swap` 필수

#### P. INP / CLS 점검

- 폰트 swap 시 CLS 발생 가능 → `size-adjust` CSS descriptor 또는 `next/font` 같은 self-hosting
- 모바일 게임 nav 의 sticky bar 가 콘텐츠 layout shift 일으키지 않는지 점검
- React 18 concurrent rendering 활용 — `useTransition` 으로 lesson 전환 INP 단축

#### Q. 이미지 최적화

- mascot 8종 PNG → AVIF/WebP `<picture>` srcset 병행
- OG 이미지 (1423×752) → 1200×630 표준 사이즈 추가본 (Twitter 일부 클라이언트 호환성)
- 모든 `<img>` 에 `width`/`height` 속성 (CLS 방지)
- 새 컴포넌트는 항상 `loading="lazy"` 기본

---

### 🟩 Phase 5 — 색인 가속 & 운영 자동화 (Week 12~)

#### R. IndexNow + Google Indexing API

새 블로그/토픽 페이지 배포 시 즉시 색인 알림:

```ts
// scripts/notify-search-engines.mjs
async function pingIndexNow(urls) {
  await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: 'quest-dp.com',
      key: process.env.INDEXNOW_KEY,
      urlList: urls,
    }),
  });
}
```

GitHub Actions 의 deploy 후 step 추가. Bing/Yandex/Naver(현 시점 IndexNow 비참여) 중 Bing/Yandex 즉시 효과.

Google Indexing API 는 **JobPosting/BroadcastEvent** 만 공식 지원 — 일반 페이지엔 부정확. 대신 GSC URL 검사 API 활용.

#### S. RSS Feed (Naver Search Advisor 활용)

`public/rss.xml` 자동 생성 — 블로그 신글만 (BlogPost 배열 → atom 또는 rss 2.0). Naver Search Advisor 에 RSS 등록 시 색인 빈도 ↑.

#### T. 모니터링 대시보드

월 1회 점검 (또는 자동 리포트):

| 항목 | 도구 | 주기 |
|---|---|---|
| 색인 커버리지 | GSC | 주간 |
| 키워드 순위 (top 30) | GSC + 수동 spreadsheet | 주간 |
| Core Web Vitals | PageSpeed Insights + GSC CWV 보고서 | 월간 |
| 백링크 | Ahrefs free / Google Search Console | 월간 |
| organic 세션 | GA4 | 일간 trend, 주간 review |
| 결제 전환율 (organic source) | GA4 funnel | 주간 |

`scripts/seo-weekly.mjs` — GSC API + GA4 API → CSV → 자동 Slack/이메일.

---

## 5. 키워드 우선순위 (50개)

> 검색 의도 (intent) × 난이도 × 우리 자산 fit 로 점수화. 정확한 volume 은 GSC 등록 후 1개월 데이터로 재정렬.

### 🥇 Primary (목표 1면, 6개월 내)

| 키워드 | 추정 월간 검색량 (Naver) | 난이도 | 현재 자산 | 추가 필요 |
|---|---|---|---|---|
| ADsP | 30,000+ | 매우 어려움 | / + /curriculum/adsp | 도메인 권위 ↑ + 백링크 |
| SQLD | 50,000+ | 매우 어려움 | / + /curriculum/sqld | 동상 |
| ADsP 기출 | 10,000+ | 어려움 | /quiz/* | 회차별 hub 페이지 |
| SQLD 기출 | 15,000+ | 어려움 | /quiz/* | 동상 |
| ADsP 합격 | 5,000+ | 중간 | blog 1편 | "합격 가이드" 시리즈 |
| SQLD 합격 | 8,000+ | 중간 | blog 1편 | 동상 |

### 🥈 Secondary (Long-tail high-intent, 3개월 내 1면)

| 키워드 | volume | 난이도 | 자산 |
|---|---|---|---|
| ADsP 비전공자 | 2,500 | 쉬움 | blog "비전공자 가이드" 보강 |
| ADsP 2주 합격 | 1,500 | 쉬움 | blog "2주 로드맵" 있음 |
| ADsP 합격기 | 3,000 | 중간 | (UGC 부재) — "honest 가이드" 톤 |
| SQLD 노랭이 | 5,000 | 쉬움 | blog "노랭이 vs QuestDP" 있음 |
| SQLD 30일 | 1,200 | 쉬움 | 신규 blog 필요 |
| ADsP vs SQLD | 3,500 | 쉬움 | blog 있음 — H1·title 강화 |
| 데이터분석 자격증 | 4,000 | 어려움 | 신규 비교글 필요 |
| ADsP 시험일정 | 2,000 | 쉬움 | /exam-schedule 신설 |
| ADsP 합격 후기 | 1,800 | 중간 | (실제 후기 누적까지 보류) |
| SQLD 후기 | 2,200 | 중간 | 동상 |

### 🥉 Tail (정의/개념형 — 토픽 hub & glossary)

DIKW 뜻, SECI 모델, OLTP OLAP 차이, KDD CRISP-DM, 정규화 BCNF, 함수종속, 윈도우 함수, JOIN 종류, ROW_NUMBER, RANK, GROUP BY ROLLUP, MERGE INTO, 트랜잭션 ACID, 인공신경망 ADsP, 의사결정나무, K-means, ROC AUC, 다중공선성, 시계열 분해, 베이즈 정리, t검정, 카이제곱 검정, 분산분석, …

→ **glossary 200어휘 + 토픽 hub 30 페이지** 가 이 부분 자동 커버.

---

## 6. 경쟁사 분석

### 6.1 한국 ADsP/SQLD 검색 시장 주요 경쟁자

| 사이트 | 강점 | 약점 | QuestDP 차별화 |
|---|---|---|---|
| 데이터에듀 (dataedu.kr) | 학원 권위, 강사 인지도 | 정적 콘텐츠 위주, 게이미피케이션 X | RPG 학습 경험 |
| 와이즈프리(wisefree.kr) | 무료 기출 풀 | UI 구식, 모바일 약함 | 모바일 우선 |
| 이패스코리아 / 에듀윌 | 종합 자격증 권위, 백링크 다수 | 가격 비쌈, ADsP/SQLD 전문 X | 단일 도메인 전문성 |
| 노랭이 (책) | 시중 1위 교재 | 책이라 검색 약함 (도서 키워드만) | 디지털 SaaS, 변형 문제 |
| YouTube (튜더 채널) | 무료 영상 강력 | 사이트 권위 X | 인터랙티브 + 진도 추적 |
| 브런치 / 티스토리 합격기 | 후기 콘텐츠 산재 | UGC 정확도 들쭉날쭉 | 정확한 출제범위 매핑 |

### 6.2 경쟁사 키워드 갭 (예상)

GSC + Ahrefs 등록 후 정확 측정. 가설:
- 데이터에듀: "ADsP 강의" / "SQLD 강의" 점유 — 우리는 강의 아닌 콘텐츠로 우회
- 와이즈프리: "ADsP 기출" 점유 — 우리는 "기출 + 변형 + 약점 분석" 차별화
- 노랭이 책: 도서 키워드 — 우리는 "노랭이 vs 디지털" 비교글로 우회 진입

---

## 7. 90일 우선순위 액션 (실행 가능 단위)

### Week 1 (Phase 0 — 측정)

- [ ] **D1**: GSC 도메인 등록 + 인증 메타 → `index.html` 추가
- [ ] **D1**: Bing Webmaster Tools 등록 (GSC import)
- [ ] **D2**: GA4 속성 생성 + tag → `index.html` + `src/lib/analytics.ts`
- [ ] **D2**: SPA 라우트 변경시 page_view 이벤트 발사 (`useEffect` in App.tsx)
- [ ] **D3**: Naver Search Advisor 자세 점검 — RSS feed 등록 가능성
- [ ] **D5**: GSC sitemap 제출 + 5 페이지 색인 요청 + 첫 baseline 스냅샷 캡처

### Week 2~3 (Phase 1 — 렌더링)

- [ ] **W2**: vite-plugin-prerender 도입 + 빌드에 통합
- [ ] **W2**: 정적 HTML 출력 검증 (Yeti UA 헤더로 curl 테스트)
- [ ] **W3**: hash router → history mode 전환 검토 (큰 변경 — 별도 PR + Cloudflare _redirects 검증)

### Week 4~6 (Phase 4 — 속도)

- [ ] **W4**: PageSpeed Insights baseline 측정 (4 핵심 페이지 모바일/데스크톱)
- [ ] **W5**: Three.js dynamic import 분할
- [ ] **W6**: 이미지 AVIF/WebP 추가, mascot alt 채우기, font-display 점검

### Week 5~12 (Phase 2 — 콘텐츠, 병행)

- [ ] **W5**: 토픽 hub 페이지 라우트 + 자동 생성 — ADsP 12개 PR
- [ ] **W7**: 토픽 hub — SQLD 18개 PR
- [ ] **W6~12**: blog 신규 20편 (주 1.5편 페이스)
- [ ] **W8~12**: glossary 50 → 200 어휘 + 단일 페이지 분리

### Week 8~12 (Phase 3 — E-E-A-T)

- [ ] **W8**: AuthorPage + Person schema + BlogPost author 갱신
- [ ] **W9**: Organization sameAs 강화 (LinkedIn / 네이버 블로그 개설 후)
- [ ] **W9~16**: 백링크 빌딩 (네이버 블로그 운영 + 카페 활동 + 게스트 포스트)

### Week 12+ (Phase 5 — 운영 루프)

- [ ] IndexNow 자동 ping (deploy hook)
- [ ] RSS feed 자동 생성
- [ ] `scripts/seo-weekly.mjs` — GSC + GA4 API 주간 리포트

---

## 8. 의사결정 노트

### 왜 prerender 가 SSG/Astro 마이그레이션 보다 우선인가
SPA 코어 (게임 라우트) 는 hydration 필요 — Astro 마이그레이션은 게임 부분 리팩토링 부담. prerender 는 정적 페이지만 빌드시 HTML 추출, 게임은 그대로 SPA. ROI 가장 높음.

### 왜 백링크가 P1 인데 Phase 3 인가
도메인 신뢰는 6~12개월 단위로 누적. **콘텐츠 자산 (blog 24편 + topic hub 30 + glossary 200)** 이 먼저 있어야 누가 인용할 가치가 생김. 자산 → 백링크 순서.

### 왜 "후기/합격기" 콘텐츠는 보류인가
실제 사용자 후기 누적 전 가짜 후기 작성은 **CLAUDE.md "거짓 작성 금지"** 위반 + 구글 spam policy 위반. 사용자 100명+ 누적 후 실 후기 노출. 현 시점엔 "정직한 30일 가이드 / 학습법" 톤으로 우회.

### 왜 GSC API 자동화가 P5 인가
사람 손으로 1개월 GSC 모니터링 한 후 패턴 익숙해지면 자동화. 너무 일찍 자동화하면 무엇을 추적할지 잘못 정의.

---

## 9. 위험 / 함정

1. **Naver Yeti 의 변동성** — 알고리즘 비공개. 색인 누락 시 Search Advisor "수집 요청" 수동 제출 매주.
2. **prerender 의 hydration mismatch** — React 18 hydration 엄격. mismatch 시 콘솔 에러 + 사용자 깜빡임. 빌드 후 staging 에서 5분 클릭 테스트 필수.
3. **AI 생성 콘텐츠 식별 — Google March 2024 update** — 본 사이트는 1인 운영이라 AI 활용 정도가 SEO 페널티 트리거 가능. **모든 blog/glossary 본문은 직접 작성 또는 AI 보조 후 인간 감수**. 자동 양산 ❌.
4. **중복 콘텐츠** — 305 lesson step + 토픽 hub + curriculum + faq 가 같은 토픽을 다루므로 canonical 정확히 분리 필요. step 페이지는 quiz/conceptcard 내용, hub 는 큐레이션/cross-link, curriculum 은 전체 목차. 각자 unique value 유지.
5. **Cloudflare Pages 의 build cache** — `_redirects` 변경 시 invalidation 안 되면 hash router → history 전환이 404 일으킴. 첫 deploy 후 5개 라우트 manual 확인.

---

## 10. Single Source of Truth

이 문서가 SEO 의사결정 single source. 변경 시 반드시 갱신.
- 신규 작업 PR 시 이 문서 updated date + 영향받은 섹션 주석에 명시
- 분기별 (3개월) 검토 — KPI 실적 + 다음 분기 우선순위 재조정

**다음 검토일**: 2026-08-07 (Phase 0~2 결과 평가 + Phase 5 자동화 시작)

---

> **TL;DR for 다음 세션의 Claude**:
> 1. Phase 0 (GSC + GA4) 안 끝나면 다른 거 하지 마라 — 측정 없으면 우선순위 재조정 못 함.
> 2. Phase 1 prerender 가 한국 시장 (Naver) 최대 리스크.
> 3. Phase 2 콘텐츠는 양 보다 깊이. blog 24편이 한 번에 안 나와도 OK — 주 1.5편 꾸준히.
> 4. AI 양산 ❌ — Google penalty. 인간 감수 필수.
> 5. KPI 는 GSC 데이터 들어온 후 W4 부터 재정렬.
