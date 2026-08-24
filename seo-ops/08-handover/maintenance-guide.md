# QuestDP SEO Maintenance Guide

## 매번 시작할 때

1. `seo-ops/MASTER_STATUS.md`를 읽는다.
2. `07-reports/published-log.csv`에서 이미 게시한 주제와 URL을 확인한다.
3. `01-keywords/keyword-database.csv`와 `02-topic-clusters/cannibalization-map.md`를 확인한다.
4. 실제 Google/Naver SERP를 다시 보고 CREATE / UPDATE / HOLD를 결정한다.
5. 시험 사실은 공식 기관 페이지에서 다시 확인한다.

## Search Console 접근이 생기면

- 최근 28일과 이전 28일을 비교한다.
- Query와 Page를 함께 본다.
- impressions가 높고 position 5~20인데 CTR이 낮은 기존 URL을 먼저 찾는다.
- 신규 페이지보다 title·opening answer·본문 gap·내부링크 UPDATE를 먼저 검토한다.
- `/quiz/*` 과거 URL이 남아 있는지 Page indexing에서 확인한다. 현재 404/noindex 상태를 바꾸지 않는다.
- 숫자는 export 또는 화면에서 확인한 값만 기록한다.

## 절대 함부로 바꾸지 않을 URL

- 기존 `/blog/{slug}/` 12개
- indexable `/lesson/*`, `/topic/*`의 canonical
- `/curriculum/adsp/`, `/curriculum/sqld/`, `/curriculum/comhwal/`
- `/faq/adsp/`, `/faq/sqld/`, `/faq/comhwal/`

변경이 불가피하면 old/new/reason/301/internal links/sitemap을 먼저 문서화한다.

## 시험 시즌 운영

- D-30: 공부법, 독학, 기간, 교재.
- D-14: 2주 순서, 기출 활용, 오답 복습.
- D-7: 압축 플랜, 과락 취약 구간.
- D-1: 시간, 준비물, 입실 유의사항.
- 시험 직후: 공식 점수 공개·결과 확인만. 실제 데이터 없는 난이도·후기·복원 생성 금지.
- 컴활은 상시시험이므로 사용자가 접수한 시험일을 기준으로 안내한다.

## 공식 출처

- KDATA 일정: `https://www.dataq.or.kr/www/accept/schedule.do`
- ADsP 안내: `https://www.dataq.or.kr/www/sub/a_06.do`
- SQLD 안내: `https://www.dataq.or.kr/www/sub/a_04.do`
- 대한상공회의소: `https://license.korcham.net/co/examguide.do?cd=0103&mm=21`

## 콘텐츠 업데이트 체크

- 검색 질문에 첫 문단에서 답하는가?
- 공식 숫자와 날짜에 출처·기준일이 있는가?
- 합격률, 점수, 기간, 학습효과를 만들어내지 않았는가?
- 기존 페이지와 intent가 겹치지 않는가?
- pillar↔cluster 양방향 링크가 있는가?
- QuestDP를 빼도 유용한 글인가?
- Article/FAQ schema가 실제 화면과 같은가?
- 수정 포스트의 `updatedAt`이 실제 검수일인가?

## 빌드·배포 전

```text
npm ci
npm run typecheck
npm test
npm run build
```

그 뒤 sitemap URL 수, canonical, noindex, 정적 H1, noncanonical anchor 0을 확인한다. 배포 완료라고 말하려면 AGENTS.md의 Git·Local CI·CI workflow·Cloudflare SHA·production bundle 확인 5단계를 모두 충족해야 한다.

## 수동 작업과 자동 유지

자동 유지:

- blog 데이터에서 sitemap/RSS/정적 HTML 재생성
- manifest↔sitemap/noindex/quiz leak audit
- canonical trailing slash anchor audit

수동 유지:

- 시험 일정과 정책 검수
- SERP/GSC opportunity 판단
- 외부 플랫폼 게시
- 실제 게시 URL·성과 기록
- outreach 승인과 발송
