---
status: ACTIVE
generated_by: /plan-ceo-review
date: 2026-04-26
branch: questdp-main
mode: SCOPE EXPANSION
target: P0 #2 — ADsP 예제 1→3 확장 (실제로는 angle pool + adaptive drill + SRS hook)
---

# CEO Plan: Step Quiz Pool · Adaptive Drill · SRS Hook

## Premise (locked)

표면 진술은 "step 당 예제 1→3 확장" 이지만, 진짜 문제는 다음 셋의 동시 부재:
1. **풀이량 부족** — 한 개념 1문이면 학습 신호가 약함
2. **이해 검증 부족** — "맞췄는데 진짜 알았나?" 의 답이 없음
3. **다양성 부족** — 같은 step 다시 와도 같은 문제 → 암기로 회피

→ 단순 양적 곱하기는 부족. 같은 개념을 다른 각도로 검증해서 진짜 이해를 측정하는 시스템이 필요.

## Approach (locked) — B+C 콤보

**B: 당일 적응형 drill** — step 풀에서 1차 출제, 틀리거나 망설이면(>20초) 같은 step 의 다른 angle 즉시 추가. 정답률 신호 누적.

**C: SRS hook** — lesson 풀이 직후 stat 기록 + SRS 큐 자동 등록. 다음 날 review 세션에서 같은 step 의 안 본 angle 자동 출제.

## 10x Vision

step 당 5~7 angle pool. matrix 기반:
1. 정의 매칭 (현재 100%)
2. 적용 (시나리오 → 개념)
3. 비교 (X vs Y)
4. 역질문 (X 가 *아닌* 것)
5. 시퀀스 / 순서
6. 시나리오 판단
7. 도식·표 해석
8. 코드 (R 챕터 한정)
9. 빈칸 / 단답
10. 메타인지 — 자가평가 (deferred)

같은 step 을 5번 와도 매번 새로운 검증 angle.

## Scope Decisions

| # | Proposal | Effort (CC) | Decision | Reasoning |
|---|---|---|---|---|
| 0 | LessonStep.quizPool: string[] (단일 → 배열) | ~15분 | **ACCEPTED (baseline)** | approach B 의 전제 |
| 0 | 당일 적응형 drill UX | ~30분 | **ACCEPTED (baseline)** | approach B |
| 0 | SRS hook (lesson → review queue) | ~20분 | **ACCEPTED (baseline)** | approach C |
| 0 | explanation 노출 (정답 후 1줄) | ~10분 | **ACCEPTED (baseline)** | JSON 에 이미 데이터 |
| 0 | 드릴 피로 가드 (룰: 1 step max 3 drill, 1 세션 max 5 step) | ~10분 | **ACCEPTED (baseline)** | risk mitigation, 무료 |
| 1 | Step 정복 게이지 + Zone 노드 mastery 색상 | ~45분 | **ACCEPTED (cherry-pick)** | 시각적 동기, RPG 톤 강화 |
| 2 | 각도 뱃지 (정의 마스터 / 토픽 정복자) | ~25분 | DEFERRED → TODOS | mastery viz 로 충분, 안정화 후 추가 |
| 3 | Distractor commentary (오답마다 1줄) | ~3시간+ | DEFERRED → TODOS | 콘텐츠 ~200 작성, drill 안정화 후 |
| 4 | 자가평가 prompt ("확신했나요?") | ~20분 | DEFERRED → TODOS | timeOverrun · oddsWrong 로 이미 신호 있음 |
| 5 | 연결 콜아웃 (cross-step refs) | ~30분 | DEFERRED → TODOS | 핵심 아닌 양념 |

## Accepted Scope (in this PR)

### Data layer
- `LessonStep.quizId: string` → `LessonStep.quizPool: string[]` (최소 1개, 권장 3~5개)
- `getQuizQuestion(id)` → `getQuizPool(quizPoolIds): MultipleChoiceQuestion[]`
- ADsP `concept-practice.json` 50문 → ~150문 (step 당 +2~3 angle)
- SQLD 는 **이 PR scope 아님** (P0 #1 별도 작업)

### Selection logic (새 파일: `src/game/lesson/quizSelector.ts`)
- `selectNextAngle(step, progress)` — 안 본 angle 우선, 약점 angle 후순위
- `shouldDrill(answer, signals)` — 정답이지만 timeOverrun OR 오답 → drill 트리거
- `drillBudget(session, stepHistory)` — 가드 룰 적용 (1 step max 3, 1 세션 max 5 step)

### SRS hook
- `LessonScreen` 정답 처리 후 `recordSingleAnswer` + `enqueueForSrs(stepId, leitnerBoxFromStat)` 호출
- 다음 날 ReviewPage 의 `sliceReviewPool` 가 자동으로 due step 픽업

### UI
- `LessonScreen` 정답 카드: explanation 1줄 + "한 번 더?" / "다음 step" 버튼
- 오답 카드: explanation + "복습하기" (drill)
- Step 정복 게이지 (lesson sticky bar 에 추가) — 0~100%
- Zone 노드 색상: 미정복 cream/30, 진행 중 accent, 정복 #6FFF00 + glow

### Content
- ADsP 50 step × angle 2~3 추가 = ~150문 신규 작성 (CC 위임)
- 각 angle 작성 가이드 — angle matrix 의 1~9번 분포 (10번 메타인지 deferred)

## Deferred to TODOS.md

- [P1] 각도 뱃지 — `badges.ts` 에 angle-master / topic-conqueror 추가
- [P1] Distractor commentary — JSON 스키마 `distractors[].why: string` 추가, 66 step × 4 = ~200 코멘트 작성 후 UI 노출
- [P2] 자가평가 prompt — 정답 후 "확신했나요?" 1bit 신호 → SRS 우선순위 영향
- [P2] 연결 콜아웃 — `LessonStep.crossRefs: { stepId, line }[]` 타입 추가, 일부 angle 에 수동 작성
- [P3] angle 10 (메타인지) — 자가평가 prompt 와 묶어서

## NOT in scope

- SQLD 콘텐츠 확장 — 별도 P0 #1 작업
- 레슨 완료 축하 화면 — 별도 P0 #3 작업 (mastery viz 와 시너지 있지만 분리)
- 시험 모드 / 실전 세트 영향 — 변경 없음 (실전 세트는 풀 단위 랜덤)
- Bundle 분할 — 콘텐츠 60KB → 180KB 증가는 무시 가능

## Design Spec (added by /plan-design-review)

### Information hierarchy — LessonScreen

```
[Sticky h=56, semi-base bg]
  ← 뒤로  |  Chapter ▭▭▭▭░░░░ 42% (1차, 큼)  |  Step ●●●○○○○ 3/7 (2차, accent, 작음)

[Body px-5 py-6]
  STEP TITLE (kr-heading 18px)
  TOPIC LABEL (kr-body 11px text-cream/60)

  CONCEPT VIEW → 개념 카드 → "예제 풀기" CTA

  QUIZ VIEW
    Question (kr-body 16px)
    Options (4 × py-4)
    [정답 후]
      ✓ 정답 / ✗ 오답 (24px icon · accent / #f87171)
      💡 ExplanationLine (좌 4px accent line + kr-body 13px text-cream/80)
      [DRILL · angle 2/3] DrillBadge — 모바일 sticky 우측 / 태블릿 카드 상단
      [다음 step] primary accent gradient   [한 번 더, 다른 각도] secondary glass
```

### State matrix

| Feature | Loading | Empty | Error | Partial |
|---|---|---|---|---|
| Quiz card | n/a (sync) | dev assert + prod step hide | "콘텐츠 로드 실패. 다음 step 으로" + back-to-zone | 풀이 중 이탈 → 다음 진입 시 step 처음부터, drill 카운트 0 |
| DrillBadge | n/a | 첫 시도면 hidden | - | 이탈 후 복귀 시 reset |
| 정복 토스트 | n/a | - | - | idempotent — 재진입 시 안 뜸 |
| Step 정복 게이지 | n/a | 0/N gray | - | 첫 angle 통과 즉시 1/N + accent |
| Zone 노드 ring | n/a | 미정복 cream/30 | - | 일부 정복 → ring partial fill |
| SRS auto-enqueue | n/a | first answer → enqueue | quota: silent fail + console.warn | enqueue idempotent |

### Mastery thresholds (locked)

- **Step 정복**: 모든 angle 시도 + topic 정답률 ≥ 80%
- **Zone 노드 정복 (#6FFF00 + glow)**: 해당 topic 의 모든 step 이 정복 상태
- **Zone 노드 진행 (accent)**: topic 의 1+ step 시도 (정복 미달)
- **Zone 노드 미시도 (cream/30)**: topic 0 시도

### Drill 트리거 (locked)

- 오답 → 자동 drill (1)
- 정답 ≤ 10s → 다음 step 으로
- 정답 10-20s → "한 번 더, 다른 각도?" **opt-in** 버튼 표시 (자동 X)
- 정답 > 20s → drill 자동 + 카드 상단 "한 번만 더 확인해볼까요?" 카피
- 가드: 1 step max 3 drill, 1 세션 max 5 step drill

### Emotional arc · 카피 톤

| 상태 | User feels | UI 톤 / 카피 |
|---|---|---|
| step 시작 | 호기심 / 부담 | 챕터 진행바 위치, 명확한 step title |
| 정답 fast | 자신감 | "✓ 정답!" + 짧은 explanation, "다음 step" 강조 |
| 정답 slow (opt-in) | 약간 안도 | "한 번 더, 다른 각도?" secondary, 강요 X |
| 정답 slow (자동) | 우연이었나? | "한 번만 더 확인해볼까요?" 부드럽게 |
| 오답 | 좌절 | "다시 해봐요" 격려 톤, 징벌 X |
| 정복 | 성취 | 🎉 토스트 + 게이지 채움, 다음 step 강조 |
| 다음 날 SRS | 친숙 | "어제 본 개념 다시 만나요" |

### 새 컴포넌트 vocabulary

- `<MasteryGauge stepCount attempted mastered />` — 7-dot row, 미시도 cream/15, 시도 accent, 정복 #6FFF00
- `<DrillBadge angle of />` — bg rgba(251,191,36,0.12), color #fbbf24, kr-heading 10px tracking-widest
- `<ConcurToast text />` — bottom-center, 2.5s auto-dismiss, scale-in (prefers-reduced-motion: fade)
- `<ExplanationLine text />` — 좌측 4px accent line + kr-body 13px text-cream/80
- `<ZoneNodeMasteryRing percent accent />` — Zone 노드 outer ring, percent 만큼 #6FFF00 fill

### Responsive

| | 375 mobile | 768+ tablet/desktop |
|---|---|---|
| Sticky bar | 챕터 % \| step dots (topic 라벨 hidden) | + topic 라벨 inline |
| Quiz card | px-4 py-5 | px-6 py-7 max-w-[680px] |
| 버튼 그룹 | flex-col stacked, "다음" full width | flex-row inline |
| DrillBadge | sticky bar 우측 | 카드 상단 absolute |
| 정복 토스트 | bottom-center 풀폭 | bottom-center max-w-[420px] |

### A11y

- 모든 버튼 `aria-label` (특히 추상 아이콘)
- DrillBadge: `role="status" aria-live="polite"` — 모드 변화 통지
- 정복 토스트: `role="status" aria-live="polite"`, focus 안 빼앗음
- 키보드: 정답 후 "다음 step" auto-focus, "한 번 더" 는 Tab 한 번 더
- Touch target ≥ 44px (옵션 버튼 py-4 ≈ 52px ✓)
- 색상 대비: ExplanationLine text-cream/80 on base → ≥ 12:1 ✓
- DrillBadge amber on amber/12% — implementation 시 contrast 측정, < 4.5:1 이면 #fcd34d fallback
- `prefers-reduced-motion` → scale-in 토스트 fade-only

## Dream State Delta

```
CURRENT (지금)            THIS PR                   12-MONTH IDEAL
step.quizId 1개      → step.quizPool[] 5~7      → 학습자 모델 기반
풀이 한 번 끝            angle 다양성, drill,         동적 angle 선택,
신호 연결 X            SRS auto-enqueue,           "이 개념 너 약해" →
                       정복 게이지                  즉시 다른 angle
```

This PR closes ~50% of the distance to platonic ideal. 12-month ideal additionally needs:
- 자가평가 신호 통합 (deferred)
- distractor commentary (deferred, P1)
- 학습자 모델 (probabilistic mastery per concept) — 미래 R&D

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|---|---|---|---|---|---|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | CLEAR (PLAN) | EXPANSION mode, 11 proposals, 6 accepted, 5 deferred, 0 critical gaps |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — (env: codex unavailable) | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR | score 5/10 → 8.6/10, 7 decisions added |
| DX Review | `/plan-devex-review` | DX gaps | 0 | — (n/a — no developer-facing API) | — |

**UNRESOLVED:** 0
**VERDICT:** CEO + DESIGN CLEARED — eng review required before implementation (env: gstack/plan-eng-review unavailable on this machine, equivalent inline coverage in CEO review Sections 1-11).
