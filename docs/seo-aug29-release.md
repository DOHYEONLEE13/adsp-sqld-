# 2026-08-29 편성 공식 블로그 배포 변경

실제 배포 작업일: 2026-09-07 KST. 사용자가 승인한 8월 29일 원고의 commit/push를 명시적으로 요청했다.

- 대상: https://quest-dp.com/blog/comhwal-필기-비전공자-공부법/
- 변경: 급수 선택 → 12회/18회 학습 계획 예시 → 과목별 첫 회독 → 개념·문제·오답 반복 → 실기 연결. 12회/18회는 합격 보장이 아니다.
- 관련 변경: 기출 복습 글의 필러 역링크, RSS 제목·설명, 해당 글의 OG 이미지. OG 생성기는 특정 slug만 생성하고 한국어·가운뎃점 연결 표현이 잘리지 않도록 보완했다.
- 배포 범위 제외: 8월 30일 비교 글 초안, 외부 채널 원고, Instagram 이미지, 진행 중 게임 UI 변경.
- 사전 검증: 별도 worktree에서 기존 로컬 lockfile을 사용한 `npm ci --no-audit --no-fund`, `npm run typecheck`, `npm test`(53 files / 596 tests), `npm run build` 성공. lockfile은 저장소 정책상 추적 제외 상태를 유지했다.
- SEO 산출물: 559 정적 HTML / 262 sitemap URLs / 297 noindex pages. 대상 글은 self-canonical이며 noindex가 없고 새 제목·12회/18회·게임 CTA가 HTML에 포함됐다.
- 후속 검증: push 후 해당 SHA의 GitHub CI build와 Cloudflare Pages 상태, 운영 HTML·번들 반영을 별도로 확인해야 한다. 이 문서는 push 전 변경 기록이며 원격 배포 성공을 미리 주장하지 않는다.
- 색인: 사용자에게 위 canonical URL을 전달한다. GSC 요청·색인 완료는 이 commit만으로 성립하지 않는다.

레슨·문제 원본 및 서버 데이터 변경은 없다.
