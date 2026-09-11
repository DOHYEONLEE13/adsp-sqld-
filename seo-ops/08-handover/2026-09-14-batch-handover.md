# 9/14까지 패키지 인수인계

작성 2026-09-12. 미래 9/14에 실제 운영을 수행했다는 뜻이 아니다.

## Studio에서 볼 것

날짜별 04-daily-content 폴더 15개를 추가했다. 8/31–9/14 모두 brief·8채널·sources·checklist·review-state를 갖는다. 게시할 원고가 없는 채널은 이유와 재개 조건을 가진 HOLD다.

- Naver: 원고에 실제 경험을 넣으려면 사용자가 사실인 내용만 추가한다. 백링크는 본문의 필요한 위치에 해당 글 주소로 연결.
- Threads: 본문과 첫 댓글 링크를 나눠 복사한다.
- Instagram: 원본 두 장을 첨부하고 11-instagram-image-prompts.md 전체 블록 사용. 이미지 미생성. 얼굴 시안을 먼저 확인하는 선택 절차가 있다.
- Velog: 9/2 COUNT, 9/6 JOIN은 별도 DB 환경에서 실행하는 예제. 앱의 SQL 실행 기능으로 홍보하지 않는다.
- Tistory: 8/31, 9/3, 9/5, 9/7 네 편. Naver 본문 복사본이 아니라 비교 기록·오답·실험·질문 지도.
- LinkedIn: 9/9 운영자 관점의 설계 의도. 이용자 후기나 학습 효과 수치 없음.
- Community: 이번 배치 전부 NO ACTION. 자동 댓글·DM·메일 없음.

## GSC URL 검사 대상

- [ADsP 독학 vs 인강 — 처음이면 어디에 돈을 써야 할까](https://quest-dp.com/blog/adsp-독학-vs-인강/)
- [SQLD 노랭이와 QuestDP — 언제 무엇을 보면 좋을까](https://quest-dp.com/blog/sqld-노랭이-vs-questdp/)
- [컴활 기출 복습법 — 많이 푸는 것보다 다시 안 틀리는 법](https://quest-dp.com/blog/comhwal-기출-복습법/)
- [ADsP vs SQLD — 어떤 거 먼저 따야 할까](https://quest-dp.com/blog/adsp-vs-sqld-순서/)
- [SQLD 공부법 — 처음 시작하는 사람의 4주 독학 플랜](https://quest-dp.com/blog/sqld-공부법/)
- [ADsP 공부법 — 비전공자가 통계에서 덜 막히는 4주 플랜](https://quest-dp.com/blog/adsp-비전공자-가이드/)
- [컴활 1급 2급 차이 — 실기·합격 기준으로 고르는 법](https://quest-dp.com/blog/comhwal-1급-vs-2급/)

별도 새 URL 15개를 만들지 않았다. 같은 페이지를 여러 날짜에서 참조해도 색인 요청은 동일 URL 기준으로 정리한다. 요청용 링크를 제공하는 것과 요청 실행·색인 성공은 다르다. 실제 배포 상태·SHA는 07-reports/2026-09-12-seo-through-0914-publication.md에서 확인한다.

## 다음 운영 우선순위

1. 외부 원고와 생성 이미지의 사용자 검수. 승인된 것만 게시하고 실제 URL을 Studio에 기록.
2. GSC의 해당 URL 검사로 실시간 접근·canonical·최종 크롤을 확인하고 필요한 URL에 요청. 요청시각과 indexed 상태는 따로 기록.
3. KDATA 회차별 공지가 직접 확인된 뒤에만 9/4·9/11 HOLD 재검토. 과거 날짜의 발표 뉴스라면 발행 필요성부터 다시 판단.
4. 사이트맵·내부 링크 반영 이후 검색 성과는 확보한 GSC 기간을 명시해 비교. 데이터가 없으면 상승·하락을 단정하지 않음.
5. 기존 evergreen-backlog.md의 30개 이상 후보 중 실제 GSC 질의·페이지와 맞는 UPDATE부터 선택. 새 글 수를 목표로 하지 않음.

## Git 주의

배포 전용 worktree: C:/Users/이도현/.codex/worktrees/seo-through-20260914, branch codex/seo-through-20260914, remote questdp. 기존 사용자 worktree의 게임 UI·Studio 수정은 배포에 섞지 않았다. main 동기화 없이 기존 사용자 브랜치에서 바로 push하지 말고 원격 차이를 먼저 확인한다. reset/stash로 기존 작업을 지우지 않는다.
