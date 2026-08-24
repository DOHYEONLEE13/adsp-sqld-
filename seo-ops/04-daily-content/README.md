# Daily Content Packages

Phase 1에서는 대량 Daily 원고를 만들지 않는다. Phase 1.5 Content Studio 검증이 끝난 뒤, 실제 당일 SERP와 `published-log.csv`를 다시 확인하고 날짜별 폴더를 만든다. 모든 패키지는 `REVIEW STATUS: PENDING`으로 시작하며 외부 플랫폼에는 자동 게시하지 않는다.

Studio가 자동으로 읽는 원고 파일은 `00-daily-brief.md`부터 `10-review-checklist.md`까지다. 운영자가 검토를 시작하면 같은 폴더에 다음 파일이 자동 생성된다.

- `review-state.json`: UI 상태 복원과 게시 승인 gate에 쓰는 구조화 데이터
- `review-feedback.md`: Codex가 다음 수정 작업에서 먼저 읽는 사람용 피드백

파일명과 필드 형식은 `../CONTENT_STUDIO.md`를 기준으로 한다.
