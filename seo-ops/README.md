# QuestDP SEO·AEO 운영 디렉터리

이 디렉터리는 2026-08-24부터 2026-09-13까지의 SEO·AEO 스프린트에 사용하는 단일 운영 기록입니다. 공식 블로그가 원문 지식 허브이며, 외부 채널에는 동일 원문을 복제하지 않습니다.

## 작업 순서

1. `MASTER_STATUS.md`와 `07-reports/published-log.csv`를 먼저 확인한다.
2. 키워드는 `01-keywords/keyword-database.csv`에서 수요 근거와 기존 URL을 확인한다.
3. `02-topic-clusters/cannibalization-map.md`에서 CREATE / UPDATE / HOLD를 결정한다.
4. 게시 전날 `04-daily-content/YYYY-MM-DD/`에 플랫폼별 원고를 만들고 `REVIEW STATUS: PENDING`으로 둔다.
5. `npm run seo:studio`로 로컬 Content Studio를 열어 본문·실제 Blog 디자인·플랫폼 Preview를 검토한다.
6. Studio에서 APPROVED / NEEDS REVISION / HOLD를 저장한다. 외부 발행물은 APPROVED 상태에서만 게시 URL을 기록한다.
7. 실제 게시·색인·성과만 `published-log.csv`와 `serp-tracking.csv`에 기록한다.

상세 사용법과 Daily Package 필드 규약은 `CONTENT_STUDIO.md`를 따른다.

## 데이터 원칙

- 검색량 숫자를 확인할 수 없으면 VERY HIGH / HIGH / MEDIUM / LOW / UNKNOWN만 쓴다.
- GSC, 순위, 합격률, 이용자 통계를 추측하지 않는다.
- 시험 일정·문항 수·합격 기준은 KDATA 또는 대한상공회의소 공식 안내를 확인한다.
- 기존 색인 URL의 slug를 바꾸지 않는다.
- 배포·push·외부 게시는 사용자 승인 전 수행하지 않는다.

## 현재 기준

- 감사 기준일: 2026-08-24 KST
- Repository HEAD: `2fb3a3dfcc5332f7de184592a901096f5b0302ff`
- Production 기준 URL: `https://quest-dp.com/`
- GSC: `DATA SOURCE: UNAVAILABLE`
- Google 직접 순위: 자동화 트래픽 차단으로 `UNAVAILABLE`; 공개 SERP 신호와 Naver 결과만 정성적으로 사용
