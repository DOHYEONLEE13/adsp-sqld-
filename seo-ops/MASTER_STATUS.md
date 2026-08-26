# QuestDP SEO·AEO Master Status

기준일: 2026-08-27 KST
스프린트: 2026-08-24 ~ 2026-09-13
상태: Phase 1 Foundation 완료 · Phase 1.5 Publishing Workflow 운영 중 · Phase 2 일일 패키지 운영

## Phase 1.5 — Publishing Workflow

- [x] Local-only Content Studio와 Daily Package reader 구현
- [x] 날짜 선택, Keyword Brief, SERP, Sources, Internal Links, 관리 CSV 화면 구현
- [x] QuestDP Blog 실제 route 기반 Content / Mobile / Tablet / Desktop Preview 구현
- [x] Naver·Threads·Instagram·Velog·Tistory·LinkedIn·Community Preview 구현
- [x] APPROVED / NEEDS REVISION / HOLD 상태와 review feedback 저장 구현
- [x] 복사 버튼, 외부 게시 URL, Published Log 중복 방지 연결 구현
- [x] API allowlist·loopback 제한·Blog 배포 분리·Production build 제외 구현
- [x] 전체 test / production build / 로컬 브라우저 반응형 QA
- [x] 첫 Daily Package 사용자 검토 상태 반영

2026-08-25 SQLD Daily Package는 QuestDP Blog 배포·색인 요청, Naver·Threads 게시까지 처리됐다. Instagram은 사용자 품질 판정에 따라 게시하지 않았다. 2026-08-26 ADsP Daily Package는 QuestDP Blog를 commit `7decea8`로 배포했고 Naver·Threads도 게시됐다. Instagram은 검토 대기이며 ADsP Search Console 색인 요청 여부는 확인되지 않았다. 2026-08-27은 중복 발행 없이 두 필러의 운영·사이트맵·공개 검색 캐시를 점검하는 QA 패키지로 생성했다.

2026-08-28 ADsP 후속 패키지는 사전 생성했다. 4주 필러·2주 로드맵·독학/인강 비교 글의 내부 링크망에 고립 URL이 없음을 확인했고, 공개 검색에 남은 수정 전 스니펫 때문에 실제 실행일에는 세 URL의 Search Console 재크롤 상태만 점검한다. 모든 신규 게시 채널은 HOLD다.

## Phase 2 — 2026-08-25 SQLD Daily Package

- [x] `SQLD 공부법`의 당일 공개 SERP 패턴과 KDATA 공식 시험 구조·일정 재검증
- [x] 일반 필러 `/blog/sqld-공부법/` 로컬 구현
- [x] 2026-08-25 Daily Package 생성
- [x] Naver·Threads·Instagram 원고 작성
- [x] 사용자 1차 피드백 반영: 초보자 관점 재작성, 4주 배분 교정, 모바일 헤더 정돈, Instagram 실물 PNG 7장 제작
- [x] Velog·Tistory·LinkedIn HOLD 및 Community NO ACTION 근거 기록
- [x] Studio Content / Mobile / Tablet / Desktop 검토
- [x] Typecheck, 53 test files / 596 tests, Production build 검증
- [x] 559 static HTML, sitemap 262 URLs, SEO audit 통과
- [x] QuestDP Blog APPROVED
- [x] Naver 사용자 수정본 PUBLISHED · Published Log 기록
- [x] Threads PUBLISHED · Published Log 기록
- [x] Instagram NEEDS REVISION · 미게시
- [x] QuestDP Blog commit / push / deploy — `136de62`
- [x] 사용자가 색인 요청 등 SEO 등록 완료
- [ ] Instagram 전면 재디자인 및 재검토

## Phase 2 — 2026-08-26 ADsP Daily Package

- [x] Naver `ADsP 비전공자 공부법` 현재 결과 패턴과 기존 QuestDP 노출 신호 확인
- [x] KDATA ADsP 시험 구조·합격 기준·2026 제51회 일정 재검증
- [x] 카니벌라이제이션 방지를 위해 새 URL 대신 `/blog/adsp-비전공자-가이드/` UPDATE 선택
- [x] 공식 블로그를 `1·2과목 1주 → 3과목 2주 → 문제·오답 1주` 초보자 흐름으로 재작성
- [x] Naver·Threads 독립 원고 작성
- [x] Instagram 1080×1080 PNG 7장 생성 및 1차 시각 검수
- [x] Velog·Tistory·LinkedIn HOLD, Community NO ACTION 근거 기록
- [x] Studio Blog 390 / 820 / 1280px에서 가로 넘침 없음·CTA 표시 확인
- [x] Typecheck, 53 test files / 596 tests 통과
- [x] `npm ci`, typecheck, 53 test files / 596 tests, production build 통과
- [x] 정적 HTML 559개, sitemap 262 URL, noindex 297개 SEO audit 통과
- [x] QuestDP Blog APPROVED
- [x] Naver PUBLISHED — https://blog.naver.com/tori_134/224391518505
- [x] Threads PUBLISHED — https://www.threads.com/@korea.certification/post/Dcg6ZYdExgo
- [ ] Instagram 사용자 검토
- [x] QuestDP Blog commit / push / deploy — `7decea8`
- [x] GitHub Actions build와 Cloudflare Pages 성공, 운영 번들 최신 제목·CTA 확인
- [ ] Google Search Console 색인 요청 여부 확인

검증 기록 (2026-08-24 KST): `npm ci`, `npm run typecheck`, 53 test files / 595 tests, Production build와 558개 정적 HTML SEO audit 통과. 임시 Daily Package로 실제 Blog iframe 390 / 820 / 1280px, Naver·Threads·Instagram·Tistory·LinkedIn, 복사, review feedback 저장을 확인한 뒤 임시 패키지는 제거했다. Production `dist`에는 Studio 문자열·chunk·정적 route·rewrite·sitemap 항목이 0건이다.

## 완료된 기반 조사

- [x] Git / repository / worktree 감사
- [x] 코드·라우팅·메타데이터·sitemap 생성 구조 감사
- [x] 블로그 12편 inventory와 content audit
- [x] Production sitemap 261 URL 전수 HTTP·canonical·robots·H1 검사
- [x] 모바일 홈·블로그·글 렌더링 점검
- [x] 공개 Google 신호와 Naver SERP·자동완성 조사
- [x] KDATA·대한상공회의소 2026 일정 확인
- [x] 키워드 DB 초안, 클러스터, 카니벌라이제이션, 내부링크 지도
- [x] 2026-08-24~09-13 캘린더 초안

## Phase 2 — 2026-08-27 Post-publish QA Daily Package

- [x] SQLD·ADsP 공식 글 HTTP 200 확인
- [x] 두 필러의 `sitemap-blog.xml` 포함 확인
- [x] ADsP 최신 제목·게임 CTA 운영 번들 반영 확인
- [x] commit `7decea8` GitHub Actions·Cloudflare Pages 성공 확인
- [x] 공개 검색의 ADsP 이전 스니펫 잔존을 재크롤 대기로 기록
- [x] Naver·Threads 게시 URL과 QuestDP 발행 기록 정리
- [x] 새 글·소셜 복제 없이 전 채널 HOLD 패키지 생성
- [ ] ADsP Search Console URL 검사 또는 색인 요청 여부 확인

## Phase 2 — 2026-08-28 ADsP Internal Link QA Daily Package

- [x] 8월 28일 실행용 Daily Package 사전 생성
- [x] 4주 필러·2주 로드맵·독학/인강 비교 운영 본문 기준선 확인
- [x] 세 글의 본문 링크·`relatedSlugs`·이어 읽기 카드 구조 감사
- [x] 고립 URL 없음 확인
- [x] 공개 검색의 수정 전 스니펫 잔존 기록
- [x] 신규 QuestDP·Naver·Threads·Instagram 발행 HOLD
- [ ] 8월 28일 실제 HTTP·canonical 재확인
- [ ] Search Console에서 세 URL 최신 크롤·색인 상태 확인

## 현재 핵심 진단

1. Production sitemap 261개 URL은 모두 200이고 canonical·H1·robots가 일치한다.
2. `/quiz/*`는 sitemap에서 빠졌고 현재 404+noindex지만 검색 결과에 과거 snippet 잔여가 보인다. GSC 제거 요청은 로그인 데이터가 없어 수행하지 않았다.
3. 일반 `SQLD 공부법`과 `컴활 필기 공부법`에서 QuestDP의 검색 존재감이 약하다. 신규 대량 글보다 기존 글 강화와 SQLD 일반 pillar 1개가 우선이다.
4. Naver는 공부법 질의에서 블로그·카페·Velog가 강하다. 브랜드 질의는 공식 사이트와 앱이 확인된다.
5. 79개 색인 lesson의 정적 본문은 대체로 짧다. 전체 373개를 색인시키지 말고 현재 whitelist를 유지하면서 대표 개념만 강화한다.

## 데이터 가용성

| 데이터 | 상태 | 처리 |
|---|---|---|
| Repository / Production | AVAILABLE | 직접 검사 |
| Naver SERP / 자동완성 | AVAILABLE | 2026-08-24 직접 검사 |
| Google 공개 검색 결과 | PARTIAL | 공개 검색 결과 참고 |
| Google 직접 순위 | UNAVAILABLE | unusual traffic 차단; 추측 금지 |
| Google Search Console | UNAVAILABLE | 로그인 세션 없음 |
| PageSpeed Insights API | UNAVAILABLE | 429 quota; 수치 미기록 |

## 다음 작업

1. 8월 26일 ADsP Instagram 7장 승인 또는 보류 결정
2. 8월 28일 ADsP 세 URL의 HTTP·canonical·Search Console 상태 확인
3. 필요한 ADsP URL만 색인 요청하고 Published Log 갱신
4. 8월 29일 `컴활 필기 공부법` 기존 필러 업데이트 패키지 생성

2026-08-25 SQLD 패키지는 사용자 피드백에 따라 Blog·Naver·Threads를 `아답터 강의 → 당일·다음 날 QuestDP 복습 → 같은 범위 노랭이` 흐름으로 재작성했고, 4주는 `1과목 1주 → 2과목 2주 → 노랭이 2회독 1주`로 다시 배분했다. Blog는 통과·배포됐고 Naver·Threads도 게시됐다. Instagram은 최종 품질 문제로 게시하지 않았다.
