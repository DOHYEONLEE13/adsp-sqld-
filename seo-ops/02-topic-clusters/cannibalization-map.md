# Cannibalization Map

기준일: 2026-08-24 KST

| Query / intent | 기존 URL | 판정 | 이유 / 보호 규칙 |
|---|---|---|---|
| ADsP 공부법 | `/blog/adsp-비전공자-가이드/` | UPDATE EXISTING | 가장 깊고 이미 Naver 노출 신호가 있어 2026-08-26 초보자 4주 필러로 로컬 보강 |
| ADSP 공부법 | 위와 동일 | HOLD NEW URL | 대소문자 variant일 뿐 intent 동일 |
| ADsP 비전공자 | 위와 동일 | UPDATE EXISTING | exact intent |
| ADsP 3과목 공부법 | 위와 동일 | INCLUDE FIRST | 별도 페이지는 기존 본문이 과도하게 넓어진 뒤 재평가 |
| ADsP 2주 | `/blog/adsp-2주-합격-로드맵/` | UPDATE EXISTING | D-14 intent 독립, URL 보호 |
| ADsP 독학 / 인강 | `/blog/adsp-독학-vs-인강/` | UPDATE EXISTING | commercial comparison intent 독립 |
| ADsP vs SQLD | `/blog/adsp-vs-sqld-순서/` | UPDATE EXISTING | comparison intent 독립 |
| SQLD 공부법 | `/blog/sqld-공부법/` (2026-08-25 발행) | PROTECT / UPDATE EXISTING | general intent 필러로 배포 완료. 7일/노랭이 페이지는 급박성·교재 intent로 분리 |
| SQLD 독학 / 비전공자 | `/blog/sqld-공부법/` | MERGE INTO ONE | 검색자의 단계와 답이 겹쳐 2개를 만들면 경쟁 가능성 높음 |
| SQLD 공부기간 | `/blog/sqld-공부법/` + 7일 글 | INCLUDE / ROUTE BY URGENCY | general 기간은 pillar, D-7은 기존 7일 URL |
| SQLD 1주 | `/blog/sqld-7일-압축-로드맵/` | UPDATE EXISTING | exact urgent intent |
| SQLD 2주 / 3주 | `/blog/sqld-공부법/` | HOLD NEW URL | 주차별 thin variants 금지 |
| SQLD 노랭이 | `/blog/sqld-노랭이-vs-questdp/` | UPDATE EXISTING | 교재 비교 intent 독립 |
| SQLD 기출 | curriculum + 노랭이 글 | UPDATE / LINK | 새 PDF 페이지는 법적·품질 위험 |
| 컴활 필기 공부법 | `/blog/comhwal-필기-비전공자-공부법/` | UPDATE EXISTING | general 공부법으로 확장 가능한 기존 자산 |
| 컴활 공부법 | 위와 동일 | HOLD NEW URL | 제품 범위를 필기로 명확히 하면 same intent |
| 컴활 1급 vs 2급 | `/blog/comhwal-1급-vs-2급/` | UPDATE EXISTING | comparison intent 독립 |
| 컴활 7일 | `/blog/comhwal-7일-필기-플랜/` | UPDATE EXISTING | urgent intent 독립 |
| 컴활 기출 | `/blog/comhwal-기출-복습법/` | UPDATE EXISTING | practice intent 독립 |
| 컴활 실기 공부법 | `/blog/comhwal-필기에서-실기-전환법/` | HOLD | 현재 product scope와 맞지 않음; transition만 유지 |
| ADsP/SQLD/컴활 시험시간·과락 | 각 `/faq/{subject}/` | UPDATE FAQ | 질문별 개별 thin page 금지 |
| 시험일정 2026 | 각 `/exams/{subject}/` | FILL THEN INDEX | 현재 TODO/noindex. 공식 데이터 완비 전 sitemap 금지 |
| 자격증 공부 앱 | `/` + `/about/` | UPDATE EXISTING | 별도 product doorway 불필요 |

## 기존 12개 블로그 URL 보호

- slug 변경·merge 삭제 계획 없음.
- title 수정 시 primary intent를 유지한다.
- 합치기가 필요해져도 먼저 기존 URL 중 강한 쪽을 정하고 301·내부링크·sitemap 영향까지 기록한다.
