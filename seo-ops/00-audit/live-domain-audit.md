# Live Domain Audit

감사일: 2026-08-24 KST
기준: Production 결과가 repository 추정보다 우선

## 전수 검사 결과

- `sitemap.xml`과 하위 sitemap 4개에서 261개 URL 확인.
- 261/261 HTTP 200, fetch error 0.
- sitemap URL의 canonical 누락/불일치 0.
- sitemap URL의 noindex 혼입 0.
- title·H1 누락 0.
- 구조화 데이터는 검사 대상 페이지에서 JSON 파싱 가능.
- sitemap 구성: core 17, blog 13, lessons 79, topics 152, quiz 0.

## 대표 페이지와 모바일

375×844 viewport에서 홈, 블로그 인덱스, 대표 블로그 글을 실제 렌더링했다.

- 수평 overflow: 0
- 대표 페이지의 alt 없는 이미지: 0
- 블로그 인덱스: 글 링크 12개, H1 1개
- 대표 글: H2 10개, FAQ 4개, console error/warning 0
- React hydration 뒤 canonical은 정적 canonical과 동일

## HTTP / URL 정책

- `http://quest-dp.com/` → HTTPS 301.
- slash 없는 `/blog` → `/blog/` 308.
- 임의 unknown path → 실제 404 + noindex + 안내형 404 화면.
- `www.quest-dp.com`은 접속되지 않았다. apex가 canonical이므로 중복은 없지만 브랜드 오타 유입 관점에서 보완 후보.
- `llms.txt`는 404. 현재 필수 표준은 아니므로 LOW.

## Repository ↔ Production 차이

1. `/blog/` raw HTML은 `ADsP·SQLD·컴활 공부법 블로그`, React hydration 뒤에는 `QuestDP 블로그`로 바뀌었다. HIGH. 로컬 수정 완료, 미배포.
2. 정적 snapshot 내부 링크가 slash 없는 경로를 사용해 1,637개 링크 인스턴스가 308을 거쳤다. HIGH. 로컬 수정 완료, 미배포.
3. sitemap URL 수와 구성은 repository manifest와 Production이 일치한다.

## 색인 잔여

공개 검색 결과에서 과거 `/quiz/*` URL의 문제·선택지 snippet이 일부 확인됐다. 현재 해당 URL은 404+noindex이며 sitemap에도 없다. 현재 중복 페이지가 아니라 과거 색인 잔여다. GSC 로그인 데이터가 없어 removal 요청은 수행하지 않았다.

## Search Console / 성능 데이터

- Google Search Console: `DATA SOURCE: UNAVAILABLE` — 인앱 브라우저는 미로그인, 기존 Chrome 연결도 사용할 수 없었다.
- Google 직접 rank: `DATA SOURCE: UNAVAILABLE` — unusual traffic 확인 화면으로 자동 순위 수집 불가.
- PageSpeed Insights API: `DATA SOURCE: UNAVAILABLE` — 429 quota.
- 따라서 clicks, impressions, CTR, average position, CWV 수치는 생성하지 않았다.

## 공개 검색 결과 관찰

- Naver `QuestDP`: 공식 사이트와 Google Play 결과 확인.
- Naver `퀘스트디피`: 앱 결과가 먼저 보이고 공식 사이트·가격 페이지도 확인.
- Naver `SQLD 공부법`: QuestDP 미확인. 블로그·카페·Velog와 AI 브리핑이 강함.
- Naver `ADsP 공부법`: QuestDP 비전공자 가이드가 결과 소스에서 확인됨.
- Naver `컴활 필기 공부법`: QuestDP 미확인. 광고·AI 브리핑·블로그·카페·커뮤니티가 강함.
- 공개 Google 계열 결과에서 브랜드명 `QuestDP`는 “Quest Data Protection”과 이름 충돌이 있어 사이트 소개·브랜드 엔터티 일관성이 중요하다.

## 공식 일정 기준

- ADsP 제50회: 2026-08-08 시험, 08-28 결과 발표.
- ADsP 제51회: 09-28~10-02 접수, 10-31 시험, 11-20 결과.
- SQLD 제62회: 2026-08-22 시험, 09-04~08 사전점수 공개/재검토, 09-11 결과.
- SQLD 제63회: 10-12~16 접수, 11-14 시험, 12-04 결과.
- 컴퓨터활용능력: 상시시험이며 시험장별 접수 가능일이 달라 전국 단일 D-day를 만들지 않는다.

출처: [KDATA 시험 일정](https://www.dataq.or.kr/www/accept/schedule.do), [대한상공회의소 종목 안내](https://license.korcham.net/co/examguide.do?cd=0103&mm=21)
