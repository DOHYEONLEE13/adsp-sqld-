# Repository Audit

감사일: 2026-08-24 KST

## Git / Worktree

- root: `C:\Users\이도현\Desktop\.claude\worktrees\hardcore-shamir-47f5ab`
- branch: `questdp-main`
- HEAD: `2fb3a3dfcc5332f7de184592a901096f5b0302ff`
- upstream: `questdp/main`, 감사 시점에 같은 SHA
- 형태: Git worktree. 별도의 main worktree와 여러 작업 worktree가 존재한다.
- 기존 tracked 변경: `CLAUDE.md`, `src/components/passes/PassTabs.tsx`, `src/game/screens/PlanetScreen.tsx`
- 기존 untracked 자산: `docs/portfolio/`, 나무위키 문서, portfolio 스크립트/출력, `playwright-report/`, `supabase/.temp/` 등
- 보호 조치: 위 기존 변경은 수정·삭제·reset하지 않았다.

## 기술 구성

| 항목 | 확인 결과 |
|---|---|
| Framework | Vite 5 + React 18 + TypeScript + Tailwind |
| Package manager | npm, `package-lock.json` |
| Build | `tsc -b`, Vite build, sitemap 생성, 정적 route HTML 생성, SEO audit |
| Test | Vitest + Playwright E2E |
| Routing | `src/App.tsx`의 path route + 게임 내부 hash/state-machine 혼합 |
| Blog source | `src/data/seo/blog.ts`의 TypeScript 데이터 12편 |
| Blog UI | `src/pages/BlogIndexPage.tsx`, `src/pages/BlogPostPage.tsx` |
| SEO runtime | `src/lib/seo.ts`의 meta/canonical/JSON-LD 갱신 |
| SEO manifest | `scripts/seo-route-manifest.mjs` |
| Sitemap/RSS | `scripts/generate-sitemap.mjs` |
| First-fetch HTML | `scripts/generate-static-route-html.mjs` |
| Build guard | `scripts/seo-audit.mjs` |
| Robots | `public/robots.txt` |
| Redirects/headers | `public/_redirects`, `public/_headers` |

## Route Manifest

- 생성 route 총 558개: core 21, blog 12, lessons 373, topics 152.
- indexable 261개: core sitemap 17, blog index+글 13, lessons 79, topics 152.
- noindex 297개: 대표적으로 품질 기준을 넘지 못한 lesson과 TODO 시험 일정 페이지.
- `/quiz/*`: sitemap 0, 정적 생성 0, rewrite 제외. 현재 의도적으로 404.

## SEO 구현 평가

- 강점: sitemap split, canonical, noindex whitelist, 정적 first-fetch 본문, Article/FAQ/Breadcrumb/Organization 구조화 데이터, RSS, 실제 404, OG 이미지, 빌드 실패형 audit.
- 보호 장치: indexable manifest URL과 sitemap의 양방향 일치, noindex 검사, quiz leak 검사, glossary/홈 최소 본문 검사.
- 발견된 차이: `/blog/`의 정적 title/H1과 React 렌더링 값이 달랐다. 로컬 코드에서 정적 기준으로 통일했다.
- 발견된 crawl 비용: 정적 snapshot 내부 경로 1,637건이 canonical trailing slash를 생략해 Production에서 308을 거쳤다. 로컬 generator와 audit를 수정했다.

## 배포 구조

- 정적 산출물에 `_redirects`, `_headers`, route별 `index.html`을 생성하는 Cloudflare Pages 계열 구조다.
- 이번 작업은 repository 로컬 변경만 수행한다. push와 production deploy는 승인 전 수행하지 않는다.
