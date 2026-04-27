---
status: ACTIVE
generated: 2026-04-27
scope: ADSP / SQLD lesson content + quiz overhaul
phases: A (highlight CSS · 완료) · B (criteria) · C (DIKW exemplar) · D (rest of steps)
---

# 콘텐츠 전면 검토 · 보강

## 사용자 피드백 (요약)

1. "데정지혜 문제처럼" 한 step 에 여러 sub-개념이 들어있는데 quiz 는 하나뿐 → **각 sub-개념마다 별도 문제**가 있어야 함.
2. `[구조]` `[형태]` 같이 brackets-everywhere 하이라이트 → 너무 많고 산만. **굵은 글씨로 충분**, 색 highlight 는 절제.
3. 체계적 기준을 세우고 그 기준대로 전면 검토·수정·신규 보강.

## 콘텐츠 품질 기준 (Locked)

### 1. 하이라이트 디시플린

- **CSS 변경 완료 (Phase A)**: `.dialogue-keyword` 는 이제 `font-weight: 700` 만. 색·점선밑줄 제거.
- **bracket 사용 원칙**:
  - 한 문장(turn)에 brackets **1~2 개 이내**. 3개 이상이면 디자인 실패.
  - bracket 안에 들어가는 건 **문장의 핵심 명사** 하나 (그 문장이 가르치려는 단 하나의 개념).
  - 예시 / 보조 단어 / 형용사 / 일반 명사 brackets 금지.
- **색 강조가 필요한 경우**: `.dialogue-keyword--accent` 클래스 별도 사용 (현재 코드 변경 없이도 inline 표기 가능).

### 2. Step 분해 룰

**1 step = 1 sub-개념 = 1 quiz**.

step 안에서 N 개의 sub-개념을 나열하면(예: DIKW 의 4단계, 데이터 분류 3축, SECI 4모드) → step 을 **(N+1) 개로 분리**:
- 0번: 개요 step (전체 그림 + 암기법) → quiz: 전체 구조 묻기
- 1~N번: 각 sub-개념 step → quiz: 그 sub-개념의 정의/예시 묻기

### 3. Quiz 품질 룰

- **distractor (오답 선택지)**: 같은 차원의 다른 단계/축이어야 함 (random 아님).
- **질문**: 정의 외우기보다 **예시 식별 / 적용** 중심.
- **explanation**: 한 줄로 정답 근거 + 왜 다른 선지가 함정인지.
- 한 quiz 가 두 개 이상 개념을 동시에 묻지 않음.

### 4. Block 구조 룰

- **intro**: hook + 한 문장 비유. 4문장 이내.
- **section**: per sub-개념. 정의 + 예시 + 시험 키워드. 4문장 이내.
- **callout (mnemonic)**: 암기법이 정말 강력할 때만. 한 step 에 한 개.
- **table**: 비교 요약. headers 3 개 이상이면 분리.

### 5. Dialogue 룰

- 한 turn = 한 문장 (또는 짧은 두 문장). 화면 가득 찬 turn 금지.
- 5~7 turn 이내가 이상적. step 이 더 길어지면 분해.
- 첫 turn = hook (질문 또는 일상 예시), 마지막 turn = quiz 안내.

## Audit 결과 — 분해 필요한 step (ADSP)

| Step ID | 현재 제목 | sub-개념 N | 권장 분해 | 우선순위 |
|---|---|---|---|---|
| `adsp-1-1-s1` | DIKW 피라미드 | 4 (D·I·K·W) | 1 → **5 steps** | **P0 (이번 작업)** |
| `adsp-1-1-s2` | 데이터 3가지 분류 기준 | 3 (구조·형태·값) | 1 → 4 steps | P1 |
| `adsp-1-1-s3` | 암묵지 vs 형식지 (SECI) | 4 (S·E·C·I) | 1 → 5 steps | P1 |
| `adsp-1-2-s1` | 빅데이터 3V/5V | 5 (V·V·V·V·V) | 1 → 6 steps | P1 |
| `adsp-1-2-s2` | 데이터 3법 | 3 (개·정·신) | 1 → 4 steps | P2 |
| `adsp-2-1-s1` | KDD 프로세스 | 5 (단계) | 1 → 6 steps | P2 |
| `adsp-2-1-s2` | CRISP-DM | 6 (단계) | 1 → 7 steps | P2 |
| `adsp-2-2-s1` | 분석 우선순위 매트릭스 | 4 (사분면) | 1 → 5 steps | P2 |
| `adsp-3-1-s1` | 데이터 마트 / EDA | 2 | 1 → 3 steps | P3 |
| `adsp-3-2-s2` | R 자료 구조 | 5 (vector·matrix·array·list·df) | 1 → 6 steps | P2 |
| `adsp-3-3-s2` | t검정 종류 | 3 (단일·독립·짝지은) | 1 → 4 steps | P3 |
| `adsp-3-4-s1` | 분석모형 평가지표 | 4 (acc·prec·recall·F1) | 1 → 5 steps | P0 (시험 핵심) |
| `adsp-3-4-s4` | 군집 알고리즘 | 3 (k-means·계층·DBSCAN) | 1 → 4 steps | P3 |

기타: SQLD 16 step 도 동일 기준으로 audit 필요 (현재 콘텐츠 양 자체가 적어 분해보다 보강이 우선).

## 신규 작성 추정량

- ADSP 50 step → 분해 후 **약 90~100 step**
- 신규 quiz 약 **40~50 개**
- 신규 dialogue + section block 약 **40~50 개**
- 작업 분량: P0 (DIKW + 평가지표) 이번 세션, P1 (5개) 다음 세션, P2~P3 차주 단위

## 작업 순서 (실행 계획)

- ✅ **Phase A**: `.dialogue-keyword` CSS 톤다운 (완료)
- ✅ **Phase C-DIKW**: DIKW 1 → 5 substeps, 4 신규 quiz (완료)
- ✅ **Phase D-1 (P0 5종)**: 2026-04-27 완료
  - `adsp-1-1-s2` 데이터 분류 → 4 substeps + 3 신규 quiz
  - `adsp-1-1-s3` SECI → 5 substeps + 4 신규 quiz
  - `adsp-1-2-s1` 3V/단위 → 4 substeps + 3 신규 quiz
  - `adsp-2-1-s1` 분석 4유형 → 5 substeps + 4 신규 quiz
  - `adsp-3-4-s5` 분류 평가지표 → 5 substeps + 4 신규 quiz
  - 총 신규 quiz 18개, ADSP 합계 50 → 72문 (+ SQLD 16 = 88 questions)
  - Step 합계 50 → 73 (Chapter 1 Part 1: 5 → 16)
- ⬜ **Phase D-2 (P1 잔여)** (다음 세션):
  - `adsp-1-2-s3` 데이터 3법 (3) · `adsp-1-3-s1` AI비 3축 · `adsp-1-3-s3` Digital CA메라
  - `adsp-2-1-s2` KDD vs CRISP-DM (2 method × 다단계)
  - `adsp-2-1-s3` 하향식 4단계 · `adsp-2-1-s4` 분석 방법론 5종
  - `adsp-2-2-s1` 우선순위 4사분면 · `adsp-2-2-s3` 성숙도 4단계 · `adsp-2-2-s4` 거버넌스 3요소
- ⬜ **Phase D-3 (P2)** (그 다음): Chapter 3 다수 (측정 척도 4단계, EDA 4원칙, 추정량 4성질, t검정 3종, 회귀 가정 4 등)
- ⬜ **Phase E**: SQLD 콘텐츠 보강 (별도 트랙)

## Phase D-1 완료 (2026-04-27 본 세션)

ADSP P0 5종 step 분해 + 18 신규 quiz 작성 완료. 모든 quiz 의 distractor 가 같은 차원의 다른 단계로 정렬, explanation 에 정답 근거 + 함정 키워드 명시. typecheck 통과. lesson↔question mapping 88↔88 일치.

## Phase D-2 완료 (2026-04-27 본 세션 후속)

Chapter 2 + Chapter 3 핵심 8 step 추가 분해:
- `adsp-2-1-s3` 하향식 4단계 (탐정해타) → 5 substeps + 4 quiz
- `adsp-2-2-s1` 우선순위 4사분면 → 5 substeps + 4 quiz
- `adsp-2-2-s3` 성숙도 4단계 (도활확최) → 5 substeps + 4 quiz
- `adsp-2-2-s4` 데이터 거버넌스 3요소 (원조프) → 4 substeps + 3 quiz
- `adsp-3-1-s2` EDA 4원칙 (저잔재현) → 5 substeps + 4 quiz
- `adsp-3-2-s1` 측정 척도 4단계 (명서등비) → 5 substeps + 4 quiz
- `adsp-3-2-s3` 추정량 4성질 (불효일충) → 5 substeps + 4 quiz
- `adsp-3-3-s3` 회귀 4가정 (선분정독) → 5 substeps + 4 quiz
- `adsp-3-3-s5` 시계열 4성분 (추계순불) → 5 substeps + 4 quiz

신규 quiz 35개 추가. lesson↔question mapping **123↔123** 일치, typecheck 통과.

ADSP step 합계: 50 → **107** (Ch1 26 / Ch2 30 / Ch3 51).
ADSP quiz 합계: 50 → **107**, 전체(ADSP+SQLD) **123 questions**.

## 잔여 작업 (Phase D-3 — 다음 세션)

P2 (Ch3 분석 위주):
- `adsp-3-1-s4` 이상값 탐지 4가지 (ESD/IQR/Z/DBScan)
- `adsp-3-3-s2` t검정 3종 (단일·독립·대응)
- `adsp-3-4-s2` 앙상블 4종 (배깅·부스팅·스태킹·랜덤포레스트)
- `adsp-3-4-s3` 연관분석 3 (지·신·향)
- `adsp-2-1-s4` 분석 방법론 5종 (Waterfall/Prototype/Spiral/Agile/RAD)

P3 (낮은 우선순위, 단일 step 유지 가능):
- `adsp-1-1-s4` DB 특징 5종
- `adsp-1-1-s5` 기업 정보 시스템 5종
- `adsp-1-2-s2` 변화 4축
- `adsp-1-2-s3` 데이터 3법
- `adsp-1-3-s3` Digital CA메라 6역량
- `adsp-2-1-s2` KDD vs CRISP-DM (2 메서드 통합 비교용)
- `adsp-3-2-s2` 확률분포 (이산/연속 분리)
- `adsp-3-3-s1` 가설검정 5용어 (귀무·대립·1종·2종·검정력)

## Verification

- `#/game/adsp` → Chapter 1 → Zone 화면에서 Part 1 (데이터의 이해) step 수가 5 → **9** 로 늘어남 (DIKW 5 step + 데이터 분류 4 step + SECI 5 step = 14 — Phase D 까지 가야)
- 이번 세션은 DIKW 5 step + 기존 분류/SECI = **5 + 4 + 3 = 12 → 5 + 4 + 3 = 12 지만 Part 1 이 12 → 11~13 (DIKW 1 → 5 변환)**
  실제: Part 1 데이터의 이해 = 현재 5 step → DIKW 1 → 5 분해로 9 step
- 각 새 DIKW step 클릭 시 그에 해당하는 quiz 가 노출되어야 함
- `[키워드]` 가 더이상 색·점선 밑줄로 표시되지 않고 굵게만 표시
