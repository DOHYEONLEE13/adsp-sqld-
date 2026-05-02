# 레슨 디자인 플레이북 — ADsP Ch1 패턴 정리

> **이 문서의 역할.** 사용자가 2026-05-02 ~ 2026-05-03 세션에서 ADsP Ch1 의 거의 모든 step 을 재구성하면서 확립한 "학생 친화 마이크로 러닝" 패턴을 정리. 다음 Claude 세션이 새 lesson 추가/기존 lesson 수정 요청을 받았을 때 **이 패턴을 기본값으로** 따르면 사용자가 매번 재요청하지 않아도 됨.
>
> **읽는 순서.** (1) 핵심 원칙 → (2) 5-turn dialogue 공식 → (3) 비유·암기법 라이브러리 → (4) Quiz 디자인 규칙 → (5) Step ID·그룹·sync 규칙 → (6) 새 요청 처리 워크플로우 → (7) 안티패턴.

---

## 0. 핵심 원칙 (사용자가 명시적으로 정한 것)

1. **학생이 보는 시험.** ADsP·SQLD 는 학생이 공부함. corporate jargon (CEO, KPI, OJT, ETL Pipeline) 같은 직장인 용어는 **그 자체로 학습 부담**. 매번 "학생 친화 비유" 로 풀어서 설명할 것.
2. **친근체로 통일** (`~야` / `~어` / `~해` / `~지`). 격식체 (`~습니다` / 짧은 명사 종결) 금지.
3. **"왜 만들어졌는가" (배경) 를 항상 포함.** 사전 정의만으론 부족. 학생이 "이게 왜 필요한지" 를 알아야 머리에 남음.
4. **암기법은 dialogue 본문에 명시 + callout 으로 강조.** 예: 공통저변 (DB 4특징), 공표연내 (SECI), 데정지혜 (DIKW), 패지 (PB·EB·ZB·YB), 전후양상 (빅데이터 변화 4축), 개정신 (데이터 3법).
5. **모바일 우선.** 한 turn 의 길이는 모바일 (375px) 한 화면에 들어가게. 의도한 줄바꿈은 `\n` 으로 명시 (SpeechBubble 의 `whitespace-pre-line` 활용).
6. **PUSH 명령 전까지 commit·push 금지.** 사용자가 명시적으로 "push" 또는 "커밋 푸시" 라고 할 때만.

---

## 1. 5-turn Dialogue 공식

**모든 sub-step (DW/DM/Lake/OLAP/OLTP/DBMS/ERP/CRM/SCM/KMS/BI/BA/표본조사·전수조사/사전·사후처리/3법 sub-step 등) 은 이 구조로**:

```
1. wave: "첫째는/둘째는/{개념} 야/이번에는 {개념} 을 배워보자!"
   — 도입 (포즈: wave)

2. think: "{영문 약어 FULL 표기}"  +  "{사전적 정의}"
   — 영문 풀네임은 [B]usiness [I]ntelligence 같이 첫글자 대괄호 강조 권장
   — 한국어 명칭 같이 표기

3. lightbulb: "왜 만들어졌나 — {배경/필요성}"
   — 학생이 공감할 수 있는 동기 (e.g. "직원 퇴사 시 노하우 사라짐")

4. happy: "예: {학생 친화 비유 또는 구체 사례}"
   — 비유 라이브러리 (§3) 활용

5. idle: "{개념} 문제!"
   — quiz prompt (대개 짧게)
```

**길이 가이드**: 5 turn 이 표준. 6~7 turn 까지 허용 (overview 또는 4단계처럼 항목이 많을 때). 3 turn 이하는 빈약하다고 판단됨.

**Overview step (s_X)** 의 5-turn 변형:
```
1. wave: "이번에는 {대주제} 를 배워보자!"
2. think: 하위 항목 list (n개)
3. lightbulb: 암기법 (있으면) — "줄여서 [{암기법}] 으로 외우자!"
4. happy: 부가 컨텍스트 (분류 / 흐름 / 함정)
5. idle: quiz prompt
```

---

## 2. 비유 라이브러리 (학생 친화)

**한 번 정한 비유는 같은 시리즈로 확장**. 사용자가 "분식집 사장님" 비유를 좋아한다면 SCM 도 분식집으로 연결.

| 개념 | 비유 |
|---|---|
| DW (Data Warehouse) | 요리된 음식 창고 / 회사 통합 KPI |
| DM (Data Mart) | 학교 도서관(DW) vs 학과별 자료실(DM) / 분식집 본점 vs 매장별 데이터 |
| Data Lake | 요리 전 식재료 창고 (DW=요리된 음식) |
| ETL (DW 구성요소) | 매장에서 물건 가져와 다듬어 창고에 넣는 트럭+직원 |
| ODS | 매장과 창고 사이 임시 보관소 |
| OLAP | 매출 보고서를 지역×시기×상품 다축으로 보는 도구 |
| OLTP | 카페 POS — 주문→결제→영수증 |
| BI vs BA | BI = 백미러 (과거), BA = 네비게이션 (예측·처방) |
| KMS | 회사 위키피디아 (SECI 의 시스템화) |
| 사전처리 vs 사후처리 | 분식집 — 재료 미리 손질 vs 주문 들어올 때 손질 |
| 표본조사 vs 전수조사 | 카드사 5천만 회원 거래 5억 건 다 분석 |
| 인과관계 vs 상관관계 | 허리케인 예보 → 팝타르트 매출 7배 (월마트 사례) |
| 데이터 단위 폭락 | 1990년대 1GB 수백만 원 → 현재 1TB 몇만 원 |
| IoT·모바일 | 스마트폰·시계·자동차까지 모든 기기가 데이터 생산 |
| 공동화 (SECI ①) | 동아리 선배가 후배에게 어깨너머로 악기 가르침 |
| 내면화 (SECI ④) | 매뉴얼 6개월 연습 → 손에 익어 매뉴얼 없이 자연스러움 |
| ERP | 회사 전체를 묶는 OS |
| CRM | 단골 카페 사장의 디지털 손님 카드 |
| SCM | 분식집 김밥 — 김 농가 → 본점 → 매장 → 손님 |

**금지 비유 (이미 사용자가 "학생이 모를 수 있다" 고 거부)**:
- OJT (On-the-Job Training) — 직장인 용어
- CEO / KPI / 마케팅·재무·영업 같은 corporate jargon (기업 데이터베이스 overview 같은 곳에선 OK, 개별 학습 비유는 X)

---

## 3. 암기법 라이브러리

| 개념 | 암기법 | 의미 |
|---|---|---|
| DIKW | **데정지혜** | Data·Information·Knowledge·Wisdom |
| DB 4특징 | **공통저변** | 공용·통합·저장·변화 (실시간 X — 4특징만) |
| SECI | **공표연내** | 공동화·표출화·연결화·내면화 |
| DW 주요특징 4 | (별도 mnemonic 없음, 비휘발성★ 강조) | 주제 지향성·데이터 통합·시계열성·**비휘발성** |
| 빅데이터 5요인 | (별도 mnemonic 없음) | 저장·병렬·인터넷·클라우드·IoT |
| 데이터 단위 (PB~YB) | **패지** | P·E·Z·Y (페타·엑사·제타·요타) |
| 빅데이터 변화 4축 | **전후양상** | 전수조사·사후처리·양·상관관계 (변화 후 상태) |
| 데이터 3법 | **개정신** | 개인정보보호·정보통신망·신용정보 |
| 기업 데이터베이스 7종 | (별도 mnemonic 없음) | DBMS·ERP·CRM·SCM·KMS·BI·BA (운영계 4 + 분석계 3) |

---

## 4. Quiz 디자인 규칙

### 4.1 ✅ 좋은 quiz

- **개념 자체 검증** (실제로 그 개념을 이해했는지)
- **사례 → 카테고리 매핑** (e.g., "허리케인 → 팝타르트 매출" 이 어느 변화 축?)
- **카테고리 → 사례** (e.g., 비정형 예시는?)
- **순서 검증** (e.g., 데이터 단위 크기 순서 옳지 않은 것)
- **방향 검증** (e.g., "사후처리 → 사전처리" 가 거꾸로)
- **여러 선지 중 옳지 않은 것** (디스트랙터 한 개만 진짜 틀린 것)
- **디스트랙터 = 같은 카테고리의 다른 항목** (DBMS 묻기 → ERP/CRM/BI 가 디스트랙터)

### 4.2 ❌ 부적절한 quiz (사용자가 명시적으로 거부)

- **암기법 자체를 묻기** ("PB·EB·ZB·YB 의 암기법은?" — 정답 "패지"). 이건 메타지식. 사용자가 두 번 거부함.
- **암기법 mnemonic 4개 중 고르기** ("4축 변화 암기법 중 알맞은 것?" — 공통저변/전후양상/공표연내/데정지혜). 같은 이유.
- 정답이 dialogue 에서 깊이 다루지 않은 개념 (예: overview dialogue 에 가명정보 한 줄 있는데 quiz 가 가명정보 정의 묻기 → "문제 배치 잘못됨")

### 4.3 Quiz 위치 원칙

- **각 step 은 정확히 1 quiz**. quiz 직전 dialogue 마지막 turn 은 prompt ("X 문제!" / "골라봐!").
- **Quiz 정답이 그 step 의 dialogue·blocks 에서 충분히 다뤄진 것이어야 함**. 그렇지 않으면 다른 step 으로 옮기거나, dialogue 보강.

---

## 5. Step ID · 그룹 규칙

### 5.1 ID 명명

```
adsp-{chapter}-{topic}-s{N}              # overview
adsp-{chapter}-{topic}-s{N}-{letters}    # sub-step (단어 1개)
adsp-{chapter}-{topic}-s{N}-{a}-{b}      # sub-step (dash 포함, regex 통과)
```

**예시**:
- `adsp-1-1-s4-dw` (DW overview, dash 1개)
- `adsp-1-1-s4-dw-purpose` (DW 목적, dash 2개)
- `adsp-1-1-s4-lake-features` (Lake 특징)
- `adsp-1-2-s2-quan` / `s2-qual` / `s2-num` / `s2-cat` (단어 1개)

### 5.2 Trail 그룹 (`group?` 필드)

[`src/data/lessons/types.ts`](../src/data/lessons/types.ts) 의 `LessonStep.group?: string` 필드 사용.

- **미지정**: regex fallback `^(.+-s\d+)(?:-[a-zA-Z][a-zA-Z0-9-]*)?$` → 같은 `-s\d+` prefix 의 모든 step 이 한 그룹.
- **명시 지정**: 같은 `group` 값을 공유하는 step 만 묶음. **DB / DW / DM / Lake 같이 한 s4 안에서 4 그룹 분리할 때 사용**.

**예시** (`src/data/lessons/adsp/ch1.ts`):
```typescript
// DB 5 step (group 미지정 → fallback 'adsp-1-1-s4')
{ id: 'adsp-1-1-s4', ... }
{ id: 'adsp-1-1-s4-share', ... }

// DW 3 step (명시 group)
{ id: 'adsp-1-1-s4-dw', group: 'adsp-1-1-s4-dw', ... }
{ id: 'adsp-1-1-s4-dw-purpose', group: 'adsp-1-1-s4-dw', ... }
{ id: 'adsp-1-1-s4-dw-features', group: 'adsp-1-1-s4-dw', ... }
```

### 5.3 Trail 길이 가이드

- **3~6 sub-step**: 이상적
- **7~9 sub-step**: 허용 (그룹 이탈 시 의미가 깨질 때)
- **10+ sub-step**: 분리 필수 (`group` 으로 나누기)

---

## 6. Sync Checklist (step/quiz 추가·삭제 시 필수)

| 위치 | 확인 |
|---|---|
| `src/data/gameModes.ts` | `metaValue: 'XXX step · YYY 문항'` + 헤더 주석 lessons.integration.test.ts 카운트·playable 합 |
| `src/data/lessons/lessons.integration.test.ts` | `expect(totalSteps).toBe(N)` 두 군데 |
| reminders.ts | step 추가 시 reminder 도 추가 (없으면 dialogue 첫 turn fallback) |
| concept-practice.json | 각 step 의 `quizId` 가 실제로 존재하는지 |

---

## 7. 새 요청 처리 워크플로우

### 7.1 사용자 요청 패턴 분석

**전형적 요청 형태**:
- "{X 개념} 수정사항: {요구 list}"
- "{X 섹션} 재구성"
- "{X} 추가"
- "이전의 수정 예시들을 참고하여 {X} 도 같은 방식으로"

### 7.2 표준 처리 절차

1. **현재 상태 grep/read** — 해당 step id, quizId, dialogue, blocks 모두 인용
2. **CLAUDE.md / 이 플레이북 reference**
3. **이 패턴의 적용 가능성 판단**:
   - 같은 5-turn 구조? ✓
   - 비유 라이브러리에 있는 비유? 또는 새 비유 필요?
   - 암기법 있으면 callout + dialogue 둘 다에 명시?
4. **파일 변경 (auto mode 면 즉시 / plan mode 면 plan 작성 후)**:
   - `ch1.ts` (또는 다른 lesson 파일) 의 dialogue + blocks
   - `concept-practice.json` 의 quiz
   - `reminders.ts` 의 reminder
   - `gameModes.ts` + `lessons.integration.test.ts` (count 변동 시)
5. **검증**:
   - `npm run typecheck`
   - `npm test -- --run` (164 tests)
   - 모바일 preview (Claude_Preview MCP) — 5 turn dialogue + quiz 진입까지 확인
6. **사용자 명시적 push 명령 대기**

### 7.3 명확화 질문 시점 (Auto mode 외 / Plan mode)

- **그룹 구조** (1 group 으로? n group 으로 분리?)
- **step 분할 정도** (1 step 단일 / 3 step DW 패턴 / 5 step DB 패턴)
- **암기법 신설 여부** (새 mnemonic 만들지, 기존 사용)
- **위치** (어느 step 다음에)

---

## 8. 안티패턴 (절대 하지 말 것)

| 안티패턴 | 왜 안 되는가 | 사용자 명시 거부 사례 |
|---|---|---|
| 암기법 자체를 quiz 정답으로 묻기 | 메타지식. 학생이 mnemonic 단어만 외우게 됨 | "패지 암기법은?" / "전후양상은?" 두 번 거부 |
| Corporate jargon (OJT, ETL, raw, KPI) 사용 | 학생 시험. 직장인 용어 모름 | OJT → 동아리 선배 비유, raw → 원시, ETL → 매장→창고 트럭 |
| 격식체 ("~합니다") | 친근체로 통일 정책 위반 | "말투 일관되게 수정" 요청 다수 |
| 짧은 명사 종결 ("~분담." "~공급." "~생산.") | 친근체 위반 + 어색 | "③ 인터넷 속도 증가!" → "GB 영상도 몇 초 만에 다운돼." 같이 풀어쓰기 |
| 한 turn 에 2개 이상 항목 욱여넣기 | 모바일 가독성 + 한 항목 한 강조 원칙 | "③ + ④ 같이" → 분리 요청 |
| 매트릭스/4사분면 표 (불필요) | 시각 부담 | 사용자가 "매트릭스 빼버려" 명시 |
| dialogue 에서 부족하게 다룬 개념을 quiz 정답으로 | "문제 배치 잘못됨" | cp-03 가명정보 quiz 사례 |
| 사용자 명시 push 명령 없이 commit/push | 사용자 정책 위반 | CLAUDE.md 명시 |

---

## 9. 핵심 파일 (이 작업에서 자주 건드리는 곳)

| 파일 | 역할 |
|---|---|
| [`src/data/lessons/adsp/ch1.ts`](../src/data/lessons/adsp/ch1.ts) | ADsP Ch1 모든 step (Topic 1·2·3) |
| [`src/data/lessons/types.ts`](../src/data/lessons/types.ts) | LessonStep 타입 (group 필드 포함) |
| [`src/data/questions/adsp/concept-practice.json`](../src/data/questions/adsp/concept-practice.json) | step 별 quiz (cp-XX) |
| [`src/data/reminders.ts`](../src/data/reminders.ts) | 2회독+ reminder |
| [`src/game/lesson/DialogueLesson.tsx`](../src/game/lesson/DialogueLesson.tsx) | dialogue 렌더 (groupKey 함수, sub-step trail) |
| [`src/game/lesson/SpeechBubble.tsx`](../src/game/lesson/SpeechBubble.tsx) | 말풍선 (whitespace-pre-line, [키워드] 하이라이트) |
| [`src/data/gameModes.ts`](../src/data/gameModes.ts) | 랜딩 카운트 sync |
| [`src/data/lessons/lessons.integration.test.ts`](../src/data/lessons/lessons.integration.test.ts) | step 카운트 테스트 |

---

## 10. 현 시점 (2026-05-03) Ch1 진행 상태

**완료된 재구성** (모두 5-turn 패턴 + 친근체 + 비유 적용):
- DIKW 5 step (overview + Data·Info·Knowledge·Wisdom) — `데정지혜` 암기, ADsP 책/A서점 비유
- 데이터 분류 8 step (overview + 형태 3 + 표현 방식 2 + 분석 목적 2)
- SECI 6 step (암묵·형식 + SECI 4단계 + 4 transition + summary) — `공표연내`
- DB 4특징 5 step (overview + 공·통·저·변) — `공통저변`
- DW 3 step (overview + 목적 + 특징★비휘발성) — 분식집 사장 비유
- DM 3 step (overview + 목적 + 유형) — 학교 도서관-학과 자료실 비유
- Data Lake 3 step (overview + 목적 + 특징) — 요리된 음식-식재료 창고 비유
- OLAP/OLTP 6 step — 매출 보고서/카페 POS 비유
- 기업 데이터베이스 8 step (overview + DBMS·ERP·CRM·SCM·KMS·BI·BA)
- 빅데이터 출현 배경 1 step (s0) — 5요인
- 빅데이터 단위·3V 5 step — `패지` 암기, 단위 크기 순서 quiz
- 빅데이터 변화 4축 5 step — `전후양상` 암기 (이론→데이터 제거, 사전→사후 추가)
- 데이터 3법 4 step — `개정신` 암기

**현재 카운트 (2026-05-03 23:xx 기준)**:
- ADsP step: **202**
- ADsP 문항: **407**
- lessons.integration.test: 252

**다음 후보 영역** (사용자가 다음 요청 시 같은 패턴 적용):
- s4 (빅데이터 비유·위기·대응) — 아직 미재구성
- adsp-1-3 (가치 창조 데이터 사이언스) — DS 6역량, AI 비 등
- adsp Ch2/Ch3 — 분석 기획·분석 모델
- SQLD lessons

---

## 11. 마지막 메모 — 사용자의 톤·취향

- **명확한 거부 표현**: "거슬림", "이상함", "반성 바람", "잘못됨" — 즉시 다시 작업
- **선호 표현**: "최고로", "최고 수준", "전세계 최고" — 진지하게 받아들여 plan mode 활용
- **인내심**: 같은 패턴 반복 요구는 OK 하지만, 명시한 정책 (메타지식 quiz 금지, push 정책) 어기면 강하게 지적함
- **모바일 우선**: 데스크톱 미리보기로 OK 한 것도 모바일에서 줄바꿈 어색하면 즉시 지적

이 플레이북을 따르면 사용자가 매번 "친근체로", "비유 추가", "왜 만들어졌는지", "암기법 별도 quiz 금지" 같은 재요청을 하지 않아도 됨. **Auto mode 활성 시엔 이 패턴을 default 로 적용해 즉시 실행할 것.**
