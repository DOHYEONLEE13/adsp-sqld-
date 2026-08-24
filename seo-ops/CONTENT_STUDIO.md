# QuestDP Content Studio 운영 가이드

QuestDP Content Studio는 `seo-ops/04-daily-content/YYYY-MM-DD/`를 파일 탐색기 없이 검토하는 Phase 1.5 로컬 도구다. 외부 플랫폼에 게시하지 않고, QuestDP Blog를 배포하지도 않는다.

## 실행

```bash
npm run seo:studio
```

브라우저가 열리지 않으면 `http://localhost:5173/seo-studio`로 접속한다. Studio UI와 파일 API는 Vite 개발 서버에서만 활성화된다. Production 빌드에는 Studio chunk, draft reader, write API, 날짜별 Daily Package가 포함되지 않는다.

## 읽는 위치

Studio는 다음 이름의 날짜 폴더만 탐색한다.

```text
seo-ops/04-daily-content/YYYY-MM-DD/
```

지원 파일:

```text
00-daily-brief.md
01-questdp-blog.md
02-naver-blog.md
03-threads.md
04-instagram.md
05-velog.md
06-tistory.md
07-linkedin.md
08-community-opportunities.md
09-sources.md
10-review-checklist.md
```

대문자 라벨과 콜론으로 필드를 구분한다. `BODY:`, `PRIMARY POST:`, `SLIDE 1:`처럼 라벨 다음 줄부터 다음 라벨 직전까지 여러 줄을 한 필드로 읽는다.

## Quality Score 필드

플랫폼 카드에서 점수를 보이려면 해당 플랫폼 파일에 아래 둘 중 하나를 넣는다.

```text
QUALITY SCORE: 94 / 100
```

또는 다음 7개 항목을 모두 넣는다. Studio가 합계를 계산한다.

```text
SEARCH INTENT MATCH: 19 / 20
INFORMATION QUALITY: 18 / 20
ORIGINAL VALUE: 14 / 15
SEARCH DEMAND: 15 / 15
READABILITY: 9 / 10
QUESTDP RELEVANCE: 10 / 10
PLATFORM FIT: 9 / 10
```

80점 미만이면 `NOT READY TO PUBLISH` 경고가 나타난다. 점수는 운영자 판단을 대체하지 않는다.

## QuestDP Blog Preview 연결

`01-questdp-blog.md`의 `TARGET URL:`이 `/blog/<slug>/`를 가리켜야 한다. Studio는 이 slug를 `src/data/seo/blog.ts`의 실제 글과 연결한다.

- Content Mode: 메타데이터, 전체 block, Sources, Internal Links, CTA를 검수한다.
- Real Preview: 현재 QuestDP Blog route를 iframe으로 직접 렌더링한다.
- Mobile / Tablet / Desktop: 각각 390px / 820px / 1280px viewport로 같은 실제 컴포넌트를 확인한다.

CREATE 원고인데 repository에 글이 아직 구현되지 않았다면 Real Preview는 오류를 표시한다. Daily 파일의 Markdown만으로 가짜 Blog Preview를 만들지 않는다.

## 검토 상태와 저장 파일

모든 원고의 초기 검토 상태는 PENDING이다. 원고 자체가 `STATUS: HOLD`이면 HOLD로 시작한다.

- APPROVED: 다음 게시 단계 후보
- NEEDS REVISION: 피드백 필수
- HOLD: 게시하지 않음
- PUBLISHED: 승인된 외부 원고에 실제 게시 URL을 기록한 상태

버튼을 누르면 날짜 폴더에 `review-state.json`과 `review-feedback.md`가 저장된다. Codex에게 수정을 요청할 때는 해당 날짜의 `review-feedback.md`와 NEEDS REVISION 항목을 먼저 읽게 한다.

## 게시와 Published Log

외부 플랫폼은 APPROVED 상태에서만 게시 URL을 기록할 수 있다. URL 저장 시 `seo-ops/07-reports/published-log.csv`에 Date, Platform, Keyword, Title, URL, PUBLISHED 상태가 추가된다. 같은 날짜·플랫폼·URL은 중복 추가하지 않는다.

QuestDP Blog에는 게시 URL 버튼이 없다. 반드시 다음 순서를 지킨다.

```text
CODE GENERATED → DESIGN REVIEWED → CONTENT APPROVED → TEST → DEPLOY
```

Studio 승인은 Git commit, push, 배포 승인이 아니다.

## 저녁 루틴

1. `내일 SEO Daily Package 생성해줘.`라고 요청한다.
2. `npm run seo:studio`를 실행한다.
3. Keyword Brief와 Sources를 확인한다.
4. QuestDP Blog Content Mode → Mobile → Desktop → Internal Links 순서로 검토한다.
5. Naver → Threads → Instagram → Tistory → Velog → LinkedIn 순서로 검토한다.
6. APPROVED / NEEDS REVISION / HOLD를 저장한다.
7. 수정 후 다시 검토해 게시 대상만 APPROVED로 남긴다.

## 아침 루틴

1. Studio에서 APPROVED 카드만 연다.
2. 제목·본문·Caption을 복사해 직접 게시한다.
3. 실제 게시 URL을 붙여 넣고 `게시 완료 + Log 기록`을 누른다.
4. Published Log에서 PUBLISHED 행을 확인한다.

## 안전 경계

- API는 loopback 요청만 허용하고, 모든 응답에 `noindex, nofollow, noarchive`를 붙인다.
- 날짜는 `YYYY-MM-DD`, 플랫폼은 고정 allowlist로 검증해 임의 경로 접근을 막는다.
- 외부 게시, Git commit/push, Production 배포를 수행하는 endpoint는 없다.
- Production 빌드에는 `/seo-studio` 정적 HTML이나 rewrite가 없다.
