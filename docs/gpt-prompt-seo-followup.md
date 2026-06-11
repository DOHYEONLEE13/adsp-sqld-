# [실행 프롬프트] QuestDP SEO 후속 배치 — 색인 전략·소프트404·E-E-A-T

> 이 문서 전체를 GPT-5.5 (xhigh) / Codex 에게 첫 메시지로 그대로 붙여넣는다.
> 전제: "본문 풀텍스트 굽기"(P0-1) 작업이 검수 합격된 상태. 그 후속 4건 + 소형 1건.

---

너는 기술 SEO 엔지니어다. 의뢰인은 코딩을 하지 못하므로, 보고는 증거(명령 출력) 없이는 신뢰되지 않는다.

## 0. 시작 전 확인 (위반 시 즉시 중단)

1. `git status` 를 실행한다. **미커밋 변경(modified/staged)이 있으면 중단하고 보고**한다. 단, 원격 대비 `ahead` 상태(로컬 커밋이 푸시 안 됨)는 블로커가 아니다 — 푸시 여부는 의뢰인 결정 사항이므로 ahead 만으로 중단하지 않는다.
2. `.codex/`, `planet-preview.html`, `qa-*.png`, `question-bank/` 는 어떤 커밋에도 넣지 않는다. `git add -A` 금지, 파일 명시 add.
3. `npm run build` 가 현재 통과하는지 먼저 확인한다 (기준선).

## 미션 A — lesson 372개 색인 전략 재설계 (가장 큼)

**현황**: `/lesson/<stepId>` 372페이지가 전부 sitemap-lessons.xml 에 제출·색인됨. 대부분 검색 수요가 없는 스텝 단위 제목이고, meta description 에 캐릭터 대사("안녕! 첫 시간이야…")가 새고 있다.

**목표**: 검색 수요 있는 50~80개만 색인 유지, 나머지는 noindex + sitemap 제외.

작업:
1. **화이트리스트 선정** — 레슨 step 제목 중 "독립적으로 검색되는 개념어"(예: DIKW 피라미드, 정규화, JOIN, 윈도우 함수, 절대 참조, 앙상블, 가설검정, 트랜잭션…)를 50~80개 고른다. ADSP/SQLD 균형 있게. **선정 목록 전체를 보고서에 표로 제출**해 의뢰인이 거부권을 행사할 수 있게 한다.
2. `scripts/seo-route-manifest.mjs` 의 lesson 라우트에 `indexable: boolean` 플래그를 도입한다.
3. `scripts/generate-static-route-html.mjs`: `indexable: false` 라우트의 `<head>` 에 `<meta name="robots" content="noindex">` 를 출력한다. **robots.txt Disallow 로 막으면 안 된다** (차단되면 noindex 를 못 읽음). canonical 은 self 유지.
4. `scripts/generate-sitemap.mjs`: sitemap-lessons.xml 에는 `indexable: true` 인 lesson 만 포함.
5. **함정 — seo-audit 정합성 검사**: `scripts/seo-audit.mjs` 는 ①sitemap↔manifest 양방향 일치(43~48행) ②"manifest 에 없는 정적 HTML 존재 시 실패"(95~101행)를 강제한다. noindex 레슨은 **정적 HTML 은 존재하되 sitemap 에는 없는** 상태가 되므로, audit 를 "manifest 의 indexable 라우트 ⇔ sitemap" + "noindex 라우트는 파일 존재 + robots meta 확인"으로 확장해야 한다. 이걸 안 고치면 빌드가 깨진다.
6. **meta description 수정**: 색인 유지 레슨의 description 을 dialogue 첫 줄이 아니라 첫 intro 블록 요약으로 생성하도록 manifest 를 수정한다. 반말 대사가 description 에 남으면 실패.

검증 (보고에 출력 첨부):
```bash
npm run build
grep -c "<loc>" dist/sitemap-lessons.xml        # = 화이트리스트 개수
grep -rl 'name="robots" content="noindex"' dist/lesson | wc -l   # = 372 - 화이트리스트
grep -L 'noindex' dist/lesson/*/index.html | head  # 화이트리스트만 나와야 함
```

금지: lesson 콘텐츠 파일(`src/data/lessons/**`) 수정 금지. 정적 HTML 삭제 금지(페이지는 살아 있고 제출만 안 함).

## 미션 B — 소프트404 해소

**현황**: [public/_redirects](public/_redirects) 마지막 `/* /index.html 200` 때문에 존재하지 않는 URL 도 200 + 홈 셸을 반환한다.
**확인된 사실**: Cloudflare Pages 는 정적 파일이 존재하면 _redirects 보다 우선 서빙한다 (프로덕션에서 실측 확인됨). 따라서 catch-all 은 "파일 없는 경로"에만 작동 중.

작업:
1. `src/App.tsx` 의 path 라우트를 **전수 조사**해 "파일은 없지만 기능해야 하는 경로" 목록을 만든다 (최소: `/login`, `/redeem`, `/refund-request`, `/payment/callback`, `/admin`, `/app`, `/game/...` path 진입형). 이 목록을 보고서에 포함.
2. 그 경로들에 `_redirects` 명시 `200 → /index.html` 규칙을 추가한다.
3. 마지막 `/* /index.html 200` 을 제거하고, 루트에 `public/404.html` 을 만든다 (브랜드 404 — 홈/커리큘럼 링크 포함, 정적 단일 파일, JS 불필요).
4. 해시 라우팅(`/#/game`)은 `/` 요청이므로 영향 없음을 확인한다.

검증: 로컬에서 `npx wrangler pages dev dist` 가 가능하면 `curl -I` 로 ①미정의 경로 404 ②`/login` 200 ③`/curriculum/adsp` 200 을 확인하고 출력 첨부. wrangler 불가 시 그 사실을 명시하고 "배포 후 curl 체크리스트"를 보고서에 포함한다.

## 미션 C — WebSite alternateName 정리 (1줄)

[index.html:108](index.html) WebSite JSON-LD 의 `alternateName` 에서 키워드 나열("ADsP 학습사이트" 등)을 제거하고 `["퀘스트디피"]` 만 남긴다.

## 미션 D — About / E-E-A-T 보강

원칙: **이미 실재하는 프로세스만 쓴다. 과장·허구 금지.**

1. About 페이지에 "콘텐츠는 이렇게 만들고 검수합니다" 섹션 추가. 사용할 수 있는 실재 사실: ①문제은행 기계 검증 6종(`scripts/validate-questions.mjs` M1~M6) ②엑셀 계산형 문항은 Excel COM `Evaluate` 재검산 ③수정 이력은 `docs/content-edit-log.md` 로 관리 ④시험 범위 기준(ADSP·SQLD=KDATA, 컴활=대한상공회의소 출제기준, 기준 연도 명시).
2. `src/data/seo/blog.ts` 에 `author`(표시명)·`reviewedAt` 필드를 추가하고, Article JSON-LD 의 author/dateModified 와 화면 노출(작성·검수일)을 연결한다. **운영자 실명·약력 문구는 임의로 짓지 말고 `TODO` placeholder 로 두고, 의뢰인에게 물어볼 질문 목록(이름 표기, 약력 한 줄, 자격 보유 여부)을 보고서에 적는다.**
3. 커리큘럼 3종 하단에 "이 페이지는 {기준연도} 출제기준 기준, 최종 검수 {날짜}" 한 줄 노출.

## 미션 E — RSS 피드 (소형)

`scripts/generate-sitemap.mjs` 또는 신규 스크립트에서 블로그 12편으로 `dist/rss.xml` 생성 (RSS 2.0, 전문 아님 — 제목+요약+링크). `index.html` head 에 `<link rel="alternate" type="application/rss+xml">` 추가. seo-audit 에 rss.xml 존재 검사 1줄 추가.

## 공통 검증 프로토콜 — 매 미션 후

```bash
npm run typecheck
npm test -- --run
npm run build        # seo audit passed 까지 출력 첨부
```

보고 형식: 미션별로 ①변경 파일 ②핵심 diff 요약 ③검증 출력 ④(미션 A) 화이트리스트 표 ⑤(미션 D) 의뢰인 질문 목록. 명령 출력 없는 "완료" 선언 금지.

## 중단 조건

- 시작 시 작업 트리가 더럽다 → 중단·보고
- seo-audit 를 통과시키려고 검사를 약화(기준 완화·삭제)하고 싶어진다 → 중단·보고 (검사는 확장만 허용)
- 미션 B 에서 기능 경로 목록이 확신 안 선다 → 해당 경로는 200 규칙을 보수적으로 유지하고 보고
- lesson/comhwal 콘텐츠 데이터, 채점 로직, Supabase 를 건드려야 할 것 같다 → 중단·보고
