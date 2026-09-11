# 9/14까지 SEO 배치 배포 증거

작성·검증: 2026-09-12 KST. 상태: 공식 블로그 7URL 공개 확인 / 외부 채널 사용자 검수 대기.

## 범위와 날짜

- 편성: 8/31–9/14 총 15패키지. 콘텐츠 9일, QA·공식 발표 미확인 HOLD 6일.
- 작성·일괄 공개는 실제 9/12에 수행했다. 과거 편성일로 공개 시각을 소급하거나 미래 날짜에 운영한 것으로 기록하지 않는다.
- 기존 공식 글 7개를 보강했다. 키워드가 겹치는 날짜는 같은 URL을 참조하며 신규 URL 15개를 만들지 않는다.
- Naver 8편 / Threads 9편 / 인스타툰 6장 프롬프트 9편 / Velog 2편 / Tistory 4편 / LinkedIn 1편.
- 외부 채널 미게시, 이미지 미생성. 9/4·9/11 발표 뉴스는 KDATA 원문 미확인으로 HOLD.

## 5단계 증거

1. Git: 콘텐츠 SHA `dad13352aba87206d086a574a33a71dac8ebc067`, `questdp` 원격의 `main`으로 push 성공. 배포 전용 worktree와 branch를 사용해 사용자 게임 UI·Studio 수정은 제외했다.

```text
dad1335 feat(seo): prepare daily packages through Sep 14 and refresh learning guides
48f7166 fix(ci): lock verified dependencies for reliable blog deployment
c1d9af2 feat(seo): publish Aug 29 beginner computer literacy guide
```

2. Local CI: `npm ci` → `npm run typecheck` → `npm test -- --run` → `npm run build` 모두 성공. 테스트 53파일 / 596개, 정적 페이지 559 / sitemap 262 / noindex 297. 기존 의존성 audit 경고 18개는 별도 이슈이며 임의 audit fix하지 않았다.
3. GitHub CI: [run 34624951513](https://github.com/DOHYEONLEE13/adsp-sqld-/actions/runs/34624951513), `.github/workflows/ci.yml`, `build` job completed/success. head_sha는 위 콘텐츠 SHA와 일치. 재현 설치·타입 검사·테스트·문제은행 검사·production build·sanity 단계 모두 success.
4. Cloudflare Pages: GitHub의 Cloudflare Pages 체크 `completed / success`, 출력 `Deployed successfully`. head_sha 일치. 배포 ID `e20595c3-5ff0-41af-a2cc-dacb264d1cb1`. [배포 상세](https://dash.cloudflare.com/?to=/8b7769a76368e1dde798b0838a70471b/pages/view/adsp-sqld/e20595c3-5ff0-41af-a2cc-dacb264d1cb1).
5. 운영 HTTP 확인: 2026-09-11T17:01:43.512Z. 아래 7URL 모두 HTTP 200, 정확한 canonical, H1 한 개, noindex 없음, 새 본문 및 sitemap-blog.xml 포함. 운영 entry `/assets/index-yCzx2VWY.js`가 참조하는 [blog 번들](https://quest-dp.com/assets/blog-DurlHNmK.js)에서 아래 새 식별자 7개 확인.

| URL | 운영 HTML·번들에서 확인한 새 식별자 |
| --- | --- |
| [ADsP 독학 vs 인강 — 처음이면 어디에 돈을 써야 할까](https://quest-dp.com/blog/adsp-독학-vs-인강/) | 결제 전에 같은 주제로 비교하기 |
| [SQLD 노랭이와 QuestDP — 언제 무엇을 보면 좋을까](https://quest-dp.com/blog/sqld-노랭이-vs-questdp/) | 문제집과 실제 기출 원문은 구분하기 |
| [컴활 기출 복습법 — 많이 푸는 것보다 다시 안 틀리는 법](https://quest-dp.com/blog/comhwal-기출-복습법/) | 오답을 세 가지로 나누면 다음 행동이 달라진다 |
| [ADsP vs SQLD — 어떤 거 먼저 따야 할까](https://quest-dp.com/blog/adsp-vs-sqld-순서/) | 공부를 쉬었다면 전체를 다시 시작해야 할까 |
| [SQLD 공부법 — 처음 시작하는 사람의 4주 독학 플랜](https://quest-dp.com/blog/sqld-공부법/) | 처음 공부할 때 쓸 범위 지도 |
| [ADsP 공부법 — 비전공자가 통계에서 덜 막히는 4주 플랜](https://quest-dp.com/blog/adsp-비전공자-가이드/) | 3과목이 넓게 느껴질 때: 질문으로 찾는 공부 지도 |
| [컴활 1급 2급 차이 — 실기·합격 기준으로 고르는 법](https://quest-dp.com/blog/comhwal-1급-vs-2급/) | 급수를 골랐다면 첫 필기 범위를 열어보세요 |

## 별도 품질 검사

- `node scripts/verify-seo-batch-20260914.mjs` PASS: 15폴더 필수 파일·채널 편수·Naver 본문/백링크·Threads 길이/댓글 링크·6장 구성·전체 프롬프트 일치·실제 작성일·7글 날짜·FAQ·내부 링크·정적 canonical 검사.
- COUNT·JOIN 예제는 메모리 SQLite로 교차 검증하고 PostgreSQL 공식 문서를 대조했다. 평균·중앙값·빈칸/0 예제는 계산과 Microsoft 원문을 대조했다. 실제 PostgreSQL 또는 Excel 실행 검증으로 표현하지 않는다.
- Studio 날짜 선택에서 9/14 원고·6장 설명·전체 프롬프트 표시를 확인했다. 전체 복사 버튼의 성공 메시지는 확인했지만 클립보드 읽기가 빈 값을 반환했으므로 복사된 바이트를 직접 검증했다고 기록하지 않는다.
- SQLD 노랭이 글 로컬 반응형 확인: 390 / 820 / 1280px에서 문서 가로 넘침 없음. 모바일 스크린샷에서 헤더·본문·CTA 확인. 브라우저 viewport를 원래대로 복원했다.
- 인스타툰은 원본 얼굴/몸 이미지의 역할·불변 요소를 분리하고, 새 조건 적용 문제와 오답 이유를 포함했다. AI 생성 티가 전혀 없거나 캐릭터 일관성이 완벽하다고 보장하지 않는다.

## GSC 및 게시 기록

- GSC 요청 실행 안 함. 아래 URL을 URL 검사에 넣고 필요한 페이지에 색인 생성 요청한다.
- `PUBLISHED`는 사이트 공개 확인만 뜻한다. 이번 변경의 재크롤·색인 상태는 UNKNOWN이며 노출·순위·클릭 수치를 만들지 않았다.
- 외부 원고는 PENDING, 이미지는 NOT_GENERATED. 사용자 승인·게시 URL 확보 후에만 published-log에 외부 발행을 추가한다.
- 이 보고서의 증거 SHA는 콘텐츠 배포 커밋이다. 후속 게시 상태 기록 커밋은 콘텐츠 변경 없이 별도로 남긴다.

- https://quest-dp.com/blog/adsp-독학-vs-인강/
- https://quest-dp.com/blog/sqld-노랭이-vs-questdp/
- https://quest-dp.com/blog/comhwal-기출-복습법/
- https://quest-dp.com/blog/adsp-vs-sqld-순서/
- https://quest-dp.com/blog/sqld-공부법/
- https://quest-dp.com/blog/adsp-비전공자-가이드/
- https://quest-dp.com/blog/comhwal-1급-vs-2급/
