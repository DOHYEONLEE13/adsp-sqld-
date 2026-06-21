# QuestDP

ADSP, SQLD, 컴퓨터활용능력(컴활) 자격증 학습을 게임형 UX로 재구성한 모바일 우선 학습 서비스입니다.

사용자는 과목을 선택한 뒤 챕터와 토픽 로드맵을 따라 개념을 학습하고, 바로 관련 문제를 풀며 이해도를 확인합니다. 틀린 문제와 약한 토픽은 복습 흐름으로 다시 연결되어, 단순 CBT가 아니라 개인별 학습 루프가 이어지도록 설계했습니다.

## 프로젝트 개요

| 항목 | 내용 |
| --- | --- |
| 서비스명 | QuestDP |
| 목적 | ADSP, SQLD, 컴활 자격증 학습을 게임형 로드맵과 문제풀이로 제공 |
| 주요 사용자 | 자격증을 처음 준비하는 학습자, 짧은 시간에 반복 학습이 필요한 사용자 |
| 핵심 경험 | 과목 선택 -> 개념 학습 -> 문제풀이 -> 결과 확인 -> 약점 복습 |
| 배포 | Cloudflare Pages, Google Play TWA 대응 |
| 데이터 | 로컬 JSON/TypeScript 학습 데이터 + Supabase PostgreSQL |

## 주요 기능

- 과목별 학습 로드맵: ADSP, SQLD, 컴활 과목을 챕터와 토픽 단위로 탐색합니다.
- 개념 카드 학습: 어려운 시험 개념을 짧은 설명, 예시, 핵심 포인트로 쪼개 제공합니다.
- 즉시 문제풀이: 개념을 읽은 직후 관련 문제를 풀어 이해도를 확인합니다.
- 복습 노드: 파트별 복습 흐름을 별도 노드로 구성해 학습자가 큰 단원을 다시 정리할 수 있게 했습니다.
- 오답/약점 분석: 풀이 기록을 기반으로 약한 토픽을 계산하고 복습 큐에 반영합니다.
- 에너지/프리미엄 구조: 무료 사용자는 에너지 기반으로 학습하고, 프리미엄 사용자는 제한 없이 진행합니다.
- 로그인/진도 저장: Supabase Auth와 PostgreSQL을 활용해 사용자 진행 상태를 관리합니다.
- SEO 정적 페이지: Google/Naver 검색 노출을 위해 커리큘럼, 블로그, FAQ, 토픽 페이지를 정적 HTML로 생성합니다.
- PWA/TWA: 웹앱을 설치형 앱처럼 사용할 수 있도록 manifest와 Android TWA 패키징을 구성했습니다.

## 기술 스택

### 프론트엔드

| 구분 | 사용 기술 |
| --- | --- |
| OS | Windows 개발 환경 |
| 언어 | TypeScript, JavaScript, HTML, CSS |
| 라이브러리 | React, React DOM, Framer Motion, Lucide React, HLS.js |
| 프레임워크/도구 | Vite, Tailwind CSS, PostCSS, Autoprefixer |
| 기술 | 반응형 웹, 모바일 우선 UI, Hash Routing, PWA, TWA, localStorage 상태 관리, SEO 메타 관리, 정적 페이지 생성 |

### 백엔드

| 구분 | 사용 기술 |
| --- | --- |
| 기술 | 사용자 인증, 학습 기록 저장, 결제 검증, 구독 상태 관리, 쿠폰/프로모션, RLS 기반 권한 제어 |
| OS | Windows 개발 환경, Linux 기반 서버리스 배포 환경 |
| 언어 | TypeScript, SQL |
| 라이브러리 | Supabase JS, Toss Payments SDK |
| 프레임워크/플랫폼 | Supabase Auth, Supabase Edge Functions, Cloudflare Pages |
| DB | Supabase PostgreSQL |

### 개선 및 버그수정

| 구분 | 사용 기술 |
| --- | --- |
| 기술 | UI 회귀 수정, 모바일 레이아웃 개선, 타입 오류 수정, Cloudflare 배포 대응, SEO 오류 개선, 학습 흐름 버그 수정 |
| OS | Windows |
| 언어 | TypeScript, JavaScript, SQL |
| 라이브러리 | Vitest, Playwright |
| 프레임워크/도구 | Vite, React, Git, GitHub |
| DB | Supabase PostgreSQL, localStorage |

### 데이터 엔지니어링

| 구분 | 사용 기술 |
| --- | --- |
| 기술 | 문제은행 구조화, 개념 데이터 정규화, 토픽 alias 매핑, sitemap 자동 생성, 정적 SEO HTML 생성, OG 이미지 생성 |
| OS | Windows |
| 언어 | TypeScript, JavaScript, SQL, JSON, YAML |
| 라이브러리 | Node.js 파일 시스템 API, Supabase JS, ExcelJS, docx |
| 프레임워크/도구 | Vite, Supabase, Node.js 스크립트 |
| DB | Supabase PostgreSQL, JSON 기반 로컬 문제 데이터 |

### 데이터 분석

| 구분 | 사용 기술 |
| --- | --- |
| 기술 | 학습 진도 분석, 오답 분석, 약점 점수 계산, 복습 큐 관리, 풀이 기록 통계, 검색 유입 분석 |
| OS | Windows |
| 언어 | TypeScript, SQL |
| 라이브러리 | Supabase JS, GA4 |
| 프레임워크/도구 | Supabase, React |
| DB | Supabase PostgreSQL, localStorage |

## 서비스 구조

```text
Landing / SEO Pages
  -> Game Entry
    -> Galaxy: 과목 선택
      -> Planet: 챕터 선택
        -> Zone / Roadmap: 토픽 및 복습 노드 선택
          -> Lesson: 개념 카드 + 즉시 확인 문제
          -> Quest: 실전 문제풀이
          -> Result: 결과 확인 + 오답/약점 반영
```

## 프론트엔드 구현 포인트

- Vite와 React 18 기반 SPA로 빠른 개발 환경을 구성했습니다.
- TypeScript로 문제 데이터, 학습 세션, 진행도, 결제 상태 타입을 관리했습니다.
- Tailwind CSS와 커스텀 CSS 토큰으로 우주 테마, glass UI, 모바일 중심 레이아웃을 구현했습니다.
- Framer Motion을 사용해 모달, 전환, 로드맵 UI에 자연스러운 인터랙션을 적용했습니다.
- Lucide React 아이콘을 버튼, 네비게이션, 상태 표시 UI에 활용했습니다.
- HLS.js를 사용해 랜딩/앱 배경 영상 로딩을 처리했습니다.
- localStorage 기반 진행도와 서버 동기화 흐름을 함께 두어 게스트/로그인 사용자를 모두 지원했습니다.

## 백엔드 및 인증 구조

- Supabase Auth로 로그인과 사용자 세션을 처리합니다.
- PostgreSQL 테이블과 RLS 정책으로 사용자별 학습 기록, 프로필, 결제 상태 접근을 제한합니다.
- Supabase RPC로 에너지 차감, 학습 결과 제출, 프리미엄 상태 확인 같은 동작을 서버에서 원자적으로 처리합니다.
- Supabase Edge Functions로 Toss Payments 및 Google Play Billing 검증 흐름을 분리했습니다.
- 쿠폰/프로모션 코드는 DB 기반으로 관리해 오픈 베타나 이벤트 기간에 프리미엄 권한을 부여할 수 있게 했습니다.

## 학습 데이터와 문제은행

- ADSP, SQLD, 컴활 개념과 문제를 과목, 챕터, 토픽 단위로 구조화했습니다.
- 기출/개념 문제는 JSON과 TypeScript 데이터로 관리하고, 앱에서는 공통 loader를 통해 불러옵니다.
- `topicAlias` 계층으로 문제의 raw topic을 앱의 표준 토픽 스키마에 매핑합니다.
- Lesson 데이터는 개념 카드, 예시, 확인 문제 ID를 연결해 “개념 -> 문제 -> 피드백” 흐름을 만듭니다.
- 복습 노드는 큰 파트를 다시 정리하는 별도 흐름으로 구성해 사용자가 단원 전체를 회고할 수 있게 했습니다.

## SEO / AEO / GEO 대응

- sitemap 자동 생성 스크립트로 core, blog, lesson, topic sitemap을 관리합니다.
- 정적 HTML 생성 스크립트로 SPA의 주요 라우트를 검색엔진이 읽기 쉬운 문서로 보강합니다.
- FAQ, 블로그, 커리큘럼, 토픽 페이지를 검색 의도별로 분리했습니다.
- robots.txt, manifest, Open Graph 이미지, 구조화 데이터 전략을 함께 관리합니다.
- Google/Naver 검색뿐 아니라 AI 검색 답변에 인용되기 쉬운 문장 구조와 콘텐츠 블록을 고려했습니다.

## Android / Google Play 대응

- `apps/android/twa`에 Trusted Web Activity 패키징 구성을 두었습니다.
- `public/manifest.json`, `public/app.webmanifest`, 앱 아이콘, splash asset을 관리합니다.
- Google Play Billing 확인용 Supabase Edge Function을 분리해 앱 내 결제 검증 흐름을 준비했습니다.

## 품질 관리

| 목적 | 명령어 |
| --- | --- |
| 개발 서버 | `npm run dev` |
| 타입 검사 | `npm run typecheck` |
| 테스트 | `npm run test` |
| E2E 테스트 | `npm run e2e` |
| 문제은행 검증 | `npm run audit` |
| sitemap 생성 | `npm run sitemap` |
| 프로덕션 빌드 | `npm run build` |
| 빌드 결과 확인 | `npm run preview` |

## 프로젝트에서 맡은 작업 범위

- 기획: 자격증 학습 플로우, 게임형 학습 루프, 무료/프리미엄 정책, 검색 전략 설계
- 디자인: 모바일 우선 UI, 우주 테마, 로드맵, 모달, 결제/프리미엄 화면 개선
- 프론트엔드: React/TypeScript 기반 SPA, 학습 화면, 문제풀이, 복습, 통계, 상태 관리 구현
- 백엔드: Supabase 인증, DB 스키마, RLS, RPC, Edge Functions, 결제 검증 연동
- 데이터 엔지니어링: 문제은행 구조화, 개념 데이터 모델링, 토픽 정규화, sitemap/정적 페이지 자동화
- 데이터 분석: 약점 점수, 오답 복습, 학습 통계, 검색/SEO 성과 분석 기반 구조 개선
- 개선/버그수정: 모바일 UX 회귀, 학습 위치 유지, 컴활 흐름 정합성, Cloudflare 배포 이슈 대응

## 로컬 실행

```bash
npm install
npm run dev
```

개발 서버는 기본적으로 `http://localhost:5173`에서 실행됩니다.

## 환경 변수

`.env.example`을 복사해 `.env` 또는 `.env.development.local`에 값을 채웁니다.

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_TOSS_CLIENT_KEY=
VITE_TEST_LOGIN_EMAIL=
VITE_TEST_LOGIN_PASSWORD=
```

실제 비밀번호, service role key, Toss secret key 같은 비밀값은 Git에 커밋하지 않습니다.

## 배포

- Cloudflare Pages에서 `main` 브랜치를 Production 배포 브랜치로 사용합니다.
- 빌드 명령어는 `npm run build`, 출력 디렉터리는 `dist`입니다.
- `public/_redirects`, `public/_headers`로 SPA fallback과 보안 헤더를 관리합니다.

## 포트폴리오 요약

QuestDP는 콘텐츠 기획, UI/UX, 프론트엔드, 백엔드, 데이터 구조화, SEO, 앱 패키징까지 하나의 흐름으로 구현한 실서비스형 프로젝트입니다. 단순 화면 구현을 넘어 학습 데이터 모델, 사용자 진행도, 오답/약점 분석, 결제/구독 상태, 검색 노출 전략까지 포함해 서비스 운영에 필요한 전반적인 구조를 설계하고 구현했습니다.
