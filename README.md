# QuestDP

ADSP · SQLD 게임형 학습 플랫폼.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS
- lucide-react (icons)

## Scripts

```bash
npm install       # 최초 1회
npm run dev       # 개발 서버 (http://localhost:5173)
npm run build     # 타입체크 + 프로덕션 빌드
npm run preview   # 빌드 결과 로컬 프리뷰
npm run typecheck # TS 타입체크만
```

## Structure

```
src/
├── main.tsx, App.tsx
├── pages/
│   └── Landing.tsx
├── components/
│   ├── layout/   (Header, Footer, TextureOverlay)
│   ├── sections/ (Hero, About, GameModes, Pricing, CTA)
│   └── ui/       (SocialIcons, VideoBg, ModeCard)
├── data/
│   ├── site.ts        — 랜딩 카피 / 비디오 URL / 브랜드
│   ├── nav.ts         — 네비/소셜 링크
│   ├── gameModes.ts   — 게임 모드 카드 데이터
│   ├── pricing.ts     — 요금제 플랜 데이터
│   ├── subjects.ts    — ADSP/SQLD 과목 스키마
│   └── questions/     — ★ 문제 JSON 파일 드랍 위치
│       ├── README.md  — 파일 규칙 / 스키마 문서
│       ├── adsp/
│       └── sqld/
├── types/
│   ├── question.ts    — 문제 도메인 타입
│   └── site.ts        — 랜딩 컨텐츠 타입
├── lib/
│   ├── questions.ts   — 문제 로드/필터/셔플
│   └── utils.ts
└── styles/
    └── index.css      — tailwind + liquid-glass
```

## 문제 파일 추가하기

1. `src/data/questions/<subject>/` 에 JSON 파일 추가.
2. `src/types/question.ts` 의 `QuestionBank` shape 을 따름.
3. `import.meta.glob` 이 자동으로 픽업 — 별도 등록 불필요.
4. 상세 규칙은 `src/data/questions/README.md`.

## Design tokens

- 배경: `#010828` (`bg-base`)
- 본문: `#EFF4FF` (`text-cream`)
- 액센트: `#6FFF00` (`text-neon` / `bg-neon`)
- 헤딩 폰트: Anton (라틴) + Noto Sans KR (한글, weight 700)
- 커시브 폰트: Gaegu (한글) / Condiment (라틴)
- Liquid Glass: `.liquid-glass` 유틸 클래스

## Deploy — Cloudflare Pages

이 repo 를 Cloudflare Pages 프로젝트에 연결하면 push 시마다 자동 빌드/배포됩니다.

### 대시보드 설정

- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: (비워두기)
- **Node version**: `20` 이상 (Environment variables 에 `NODE_VERSION = 20` 권장)

### SPA fallback / 보안 헤더

`public/_redirects` 와 `public/_headers` 가 자동으로 `dist/` 에 복사됩니다:

- `_redirects`: `/* → /index.html 200` — 모든 미지 경로를 index 로 넘겨 클라이언트 라우팅에 위임.
- `_headers`: nosniff / DENY frame / Referrer-Policy / Permissions-Policy + `/assets/*` 1년 캐시.

### 로컬에서 배포 빌드 확인

```bash
npm run build     # → dist/ 생성
npm run preview   # → http://localhost:4173 에서 프로덕션 번들 검증
```

## 학습 파트 진행도

MVP 랜딩 + 문제 데이터 로더 + 게임 섹션 엔진 완성:

- **Part A** — Progress 저장소 (localStorage, 문항 통계 + 세션 이력)
- **Part B** — 약점 분석 (attempts / accuracy / timing / recency 복합 점수)
- **Part C** — 학습 대시보드 (`#/stats`) 및 리셋
- **Part D** — Flow/Sampling 분리 (play · learn · test × random · weakness · review) + Daily Mission
- **Part E** — 북마크 & 노트 (`#/bookmarks`)
- **Part F** — XP / 레벨 / Topic Mastery (RPG 레이어)
- **Part G (Tier 1)** — three.js 3D Galaxy: 별밭 + GLB 행성 + 카메라 줌인 + 정답 파티클

## Credits

### 3D Models — CC BY 4.0

Galaxy 화면의 3D 행성 에셋은 [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/) 라이선스입니다.

- **ADSP 행성** — [Stylized Planet](https://sketchfab.com/3d-models/stylized-planet-789725db86f547fc9163b00f302c3e70) by **cmzw** (Sketchfab)
- **SQLD 행성** — [Purple Planet](https://sketchfab.com/3d-models/purple-planet-264eb22207184fc99a5e3b1279a763b8) by **Yo.Ri** (Sketchfab)

두 에셋 모두 원본 그대로 사용되었으며 파일명만 `adsp-planet.glb` / `sqld-planet.glb` 로 변경되었습니다.
