# Technical SEO Audit

감사일: 2026-08-24 KST

## 우선순위 요약

| 우선순위 | 문제 | 증거 | 조치 상태 |
|---|---|---|---|
| CRITICAL | 없음 | sitemap 261개 전수 검사에서 200/canonical/indexability 정상 | 해당 없음 |
| HIGH | 블로그 index 정적/React title·H1 불일치 | raw와 hydration 뒤 DOM 비교 | 로컬 수정, 미배포 |
| HIGH | 내부 링크 1,637건이 slash 없는 URL로 308 발생 | 정적 HTML 링크 crawl | generator 정규화+audit 추가, 미배포 |
| HIGH | 블로그 시험 사실·합격 보장성 표현 | 6편 source audit | 공식 구조·조건형 표현으로 로컬 수정, 미배포 |
| MEDIUM | 79개 indexable lesson의 정적 본문이 짧음 | visible text 중앙값 약 357자 | whitelist 유지, 대표 개념만 단계적 강화 |
| MEDIUM | 색인 허용 페이지가 noindex lesson으로 다수 링크 | manifest 전체 링크 그래프 | UX 링크와 색인 정책 분리 검토 |
| MEDIUM | 과거 `/quiz/*` snippet 잔여 | 공개 site search | 현재 404/noindex/sitemap 제외 유지; GSC 가능 시 확인 |
| LOW | `www` host 미응답 | 직접 fetch 실패 | apex canonical 유지, DNS redirect 선택 검토 |
| LOW | `llms.txt` 404 | 직접 fetch | 필수 아님; AEO 문서가 성숙한 뒤 재검토 |

## 체크리스트

| 항목 | Production 상태 | 판정 |
|---|---|---|
| HTTPS | HTTP→HTTPS 301 | PASS |
| robots.txt | 200, public crawl 허용, 비공개 경로 차단 | PASS |
| sitemap | index + 4개 child, 261 unique URLs | PASS |
| canonical | sitemap 전수 일치 | PASS |
| noindex | sitemap 혼입 0 | PASS |
| status code | sitemap 261/261 200 | PASS |
| 404 | unknown URL true 404 + noindex | PASS |
| redirect chain | 대표 HTTP/slash 검사에서 chain 없음 | PASS |
| trailing slash | canonical은 일관, 내부 링크가 308 유발 | HIGH/FIXED LOCAL |
| title/H1 | 누락 0, blog index hydration mismatch | HIGH/FIXED LOCAL |
| meta description | sitemap page에 존재 | PASS |
| OG/Twitter | 대표 페이지 및 OG 이미지 확인 | PASS |
| structured data | 파싱 가능; 화면과 주요 필드 일치 | PASS |
| breadcrumb | BlogPosting 페이지에 BreadcrumbList | PASS |
| image alt | 모바일 대표 페이지 누락 0 | PASS |
| mobile layout | 대표 3페이지 overflow 0 | PASS |
| JS rendering | 정적 first-fetch 본문 존재 | PASS |
| Core Web Vitals | public API 429 | UNAVAILABLE |
| orphan blog | 12편 모두 index/related에서 발견 가능 | PASS |
| pagination | 12편 단일 index, 현재 불필요 | N/A |

## 수정 안전장치

`scripts/seo-audit.mjs`에 생성 HTML의 내부 `<a href>`가 canonical trailing slash를 생략하면 build를 실패시키는 검사를 추가했다. query/hash는 유지하고 파일 확장자 URL은 변경하지 않는다.

## 배포 전 검증 조건

1. `npm ci`
2. `npm run typecheck`
3. `npm test`
4. `npm run build`
5. `dist`에서 noncanonical internal anchor 0, sitemap 261, quiz 0 재확인
