# QuestDP Content Edit Log

## 2026-06-10 - COMHWAL Batch C 데이터베이스 일반 전체 재작성 완료

- 데이터베이스 일반 107~152 중 보존 대상 110, 111을 제외한 44개 토픽의 저작 카드 88장에 직접 `questionPrompt`와 3개 오답 선택지를 추가했다.
- 데이터베이스 개요, 테이블, 쿼리, 폼/컨트롤, 보고서, Access 매크로/VBA 개체를 직전 개념과 유기적으로 이어지는 Access 작업 장면 문제로 정리했다.
- 함수 계산형 문항은 없는 배치라 Excel COM 결과값 검산 대상은 없었다.
- Batch 완료 검증: 데이터베이스 107~152 조건 스캔, `npm test -- --run`, `npm run build`.

## 2026-06-10 - COMHWAL Batch C-4 데이터베이스 144~152 재작성

- 데이터베이스 일반 144~152의 18개 저작 카드에 직접 `questionPrompt`와 3개 오답 선택지를 추가했다.
- 보고서 주요 속성, 정렬 및 그룹화, 보고서 종류, 계산 컨트롤/페이지 나누기, Access 매크로, 매크로 함수, 이벤트 프로시저, Access 개체, DAO/ADO와 Recordset을 자동화·출력 역할별 문제로 연결했다.
- 함수 계산형 문항은 없는 단위라 Excel COM 결과값 검산 대상은 없었다.
- 검증: 데이터베이스 144~152 조건 스캔, `npx vitest run src/data/comhwal/concepts.test.ts src/game/comhwalVisualModels.test.ts`, `npm run typecheck`.

## 2026-06-10 - COMHWAL Batch C-3 데이터베이스 132~143 재작성

- 데이터베이스 일반 132~143의 24개 저작 카드에 직접 `questionPrompt`와 3개 오답 선택지를 추가했다.
- 폼의 개념/구성/자동 생성, 폼 형식·데이터 속성, 컨트롤, 하위 폼, 컨트롤 속성, 탭 순서·이벤트, 보고서 기본/구성/페이지 설정을 입력 화면과 출력물 관점으로 구분해 문제화했다.
- 함수 계산형 문항은 없는 단위라 Excel COM 결과값 검산 대상은 없었다.
- 검증: 데이터베이스 132~143 조건 스캔, `npx vitest run src/data/comhwal/concepts.test.ts src/game/comhwalVisualModels.test.ts`, `npm run typecheck`.

## 2026-06-10 - COMHWAL Batch C-2 데이터베이스 120~131 재작성

- 데이터베이스 일반 120~131의 24개 저작 카드에 직접 `questionPrompt`와 3개 오답 선택지를 추가했다.
- 참조 무결성, 가져오기/연결하기/내보내기, SELECT/WHERE/ORDER BY/GROUP BY/HAVING, Access 함수, Like/In/Between, 하위 질의, 다중 테이블 질의, 실행 질의, 매개 변수/크로스탭 질의를 실제 Access 문제 흐름으로 연결했다.
- 함수 계산형 문항은 없는 단위라 Excel COM 결과값 검산 대상은 없었다.
- 검증: 데이터베이스 120~131 조건 스캔, `npx vitest run src/data/comhwal/concepts.test.ts src/game/comhwalVisualModels.test.ts`, `npm run typecheck`.

## 2026-06-10 - COMHWAL Batch C-1 데이터베이스 107~119 재작성

- 데이터베이스 일반 107, 108, 109, 112, 113, 114, 115, 116, 117, 118, 119의 22개 저작 카드에 직접 `questionPrompt`와 3개 오답 선택지를 추가했다.
- 데이터베이스 개념, DBMS 구성, 관계형 테이블, ERD, 테이블 디자인, 데이터 형식, 입력 마스크, 유효성 검사, 조회 필드, 기본키/색인, 관계 설정을 Access 작업 장면 문제로 연결했다.
- 보존 대상 110, 111은 수정하지 않았다. 함수 계산형 문항은 없는 단위라 Excel COM 결과값 검산 대상은 없었다.
- 검증: 데이터베이스 107~119 조건 스캔, `npx vitest run src/data/comhwal/concepts.test.ts src/game/comhwalVisualModels.test.ts`, `npm run typecheck`.

## 2026-06-10 - COMHWAL Batch B 컴퓨터 일반 전체 재작성 완료

- 컴퓨터 일반 003~059 중 보존 대상 030, 047을 제외한 55개 토픽의 저작 카드 110장을 재작성했다.
- 모든 재작성 토픽은 서버 화이트리스트(q02/q04)에 맞춰 토픽당 카드 2장 구조를 유지했고, 직접 `questionPrompt`와 3개 오답 선택지를 넣었다.
- B-3 보수 계산 문항은 직접 재검산했고, 나머지 B 단위에는 Excel 함수 계산형 문항이 없어 Excel COM 검산 대상이 없었다.
- Batch 완료 검증: 컴퓨터 일반 003~059 조건 스캔, `npm test -- --run`, `npm run build`.

## 2026-06-10 - COMHWAL Batch B-5 컴퓨터 일반 053~059 재작성

- 컴퓨터 일반 053~059의 14개 저작 카드를 멀티미디어 그래픽/오디오/비디오 데이터, 멀티미디어 활용, 저작권, 바이러스, 정보 보안 개요, 정보 보안 기법 중심으로 재작성했다.
- 비트맵/벡터, 오디오/비디오 형식, CIA 3요소, 악성코드/보안 기법을 실제 예시 문제로 연결했다.
- 함수 계산형 문항은 없는 단위라 Excel COM 결과값 검산 대상은 없었다.
- 검증: `npx vitest run src/data/comhwal/concepts.test.ts src/game/comhwalVisualModels.test.ts`, `npm run typecheck`.

## 2026-06-10 - COMHWAL Batch B-4 컴퓨터 일반 040~052 재작성

- 컴퓨터 일반 040, 041, 042, 043, 044, 045, 046, 048, 049, 050, 051, 052의 24개 저작 카드를 운영체제, 운영 방식, 프로그래밍 언어, 웹 언어, 네트워크 운영 방식, 망 구성/장비, 인터넷 개요, 프로토콜, 인터넷 서비스, ICT, 멀티미디어, 멀티미디어 소프트웨어 중심으로 재작성했다.
- 보존 대상 047은 수정하지 않았다.
- 함수 계산형 문항은 없는 단위라 Excel COM 결과값 검산 대상은 없었다.
- 검증: `npx vitest run src/data/comhwal/concepts.test.ts src/game/comhwalVisualModels.test.ts`, `npm run typecheck`.

## 2026-06-10 - COMHWAL Batch B-3 컴퓨터 일반 027~039 재작성

- 컴퓨터 일반 027, 028, 029, 031, 032, 033, 034, 035, 036, 037, 038, 039의 24개 저작 카드를 보수, 자료 표현, CPU, 보조기억장치, 출력장치, 인터럽트/채널, 메인보드, BIOS/펌웨어, RAID, 시스템 관리, 하드웨어 업그레이드, 소프트웨어 개요 중심으로 재작성했다.
- 보존 대상 030은 수정하지 않았다.
- 보수 계산형 문항은 `1010`의 1의 보수 `0101`, 2의 보수 `0101+1=0110` 흐름으로 재검산했다.
- 검증: `npx vitest run src/data/comhwal/concepts.test.ts src/game/comhwalVisualModels.test.ts`, `npm run typecheck`.

## 2026-06-10 - COMHWAL Batch B-2 컴퓨터 일반 015~026 재작성

- 컴퓨터 일반 015~026의 24개 저작 카드를 개인 설정, 앱 설정, 장치, 업데이트 및 보안, 장치 관리자, 프린터, 문서 인쇄, Windows 관리 도구, 네트워크 설정, 문제 해결, 컴퓨터 분류, 자료 구성 단위 중심으로 재작성했다.
- Windows 설정 메뉴별 역할과 하드웨어/네트워크 기본 개념을 실제 작업 장면 기반 문제로 연결했다.
- 함수 계산형 문항은 없는 단위라 Excel COM 결과값 검산 대상은 없었다.
- 검증: `npx vitest run src/data/comhwal/concepts.test.ts src/game/comhwalVisualModels.test.ts`, `npm run typecheck`.

## 2026-06-10 - COMHWAL Batch B-1 컴퓨터 일반 003~014 재작성

- 컴퓨터 일반 003~014의 24개 저작 카드를 바로 가기 키, 바로 가기 아이콘, 작업 표시줄, 작업 보기/가상 데스크톱, 시작 메뉴, 폴더 옵션, 파일/폴더, 검색, 휴지통, 보조프로그램, 유니버설 앱, 시스템 설정 중심으로 재작성했다.
- 각 토픽에 직접 `questionPrompt`와 같은 Windows 도메인의 오답 선택지를 넣어 직전 개념 확인 문제로 이어지게 했다.
- 함수 계산형 문항은 없는 단위라 Excel COM 결과값 검산 대상은 없었다.
- 검증: `npx vitest run src/data/comhwal/concepts.test.ts src/game/comhwalVisualModels.test.ts`, `npm run typecheck`.

## 2026-06-10 - COMHWAL Batch A 스프레드시트 일반 전체 재작성 완료

- 스프레드시트 일반 060~106 중 보존 대상 070, 073, 076, 082를 제외한 43개 토픽의 저작 카드 86장을 재작성했다.
- 모든 재작성 토픽은 서버 화이트리스트(q02/q04)에 맞춰 토픽당 카드 2장 구조를 유지했고, 직접 `questionPrompt`와 3개 오답 선택지를 넣었다.
- 함수 계산형 문항은 Excel COM `Evaluate`로 실제 엑셀 결과를 재검산했다.
- Batch 완료 검증: `npm test -- --run`, `npm run build`.

## 2026-06-10 - COMHWAL Batch A-4 스프레드시트 097~106 재작성

- 스프레드시트 일반 097~106의 20개 저작 카드를 시나리오, 목표값 찾기, 데이터 표, 통합, 매크로 생성/실행, VBA 기본, 변수/배열, 제어문, 엑셀 개체 중심으로 재작성했다.
- 매크로/VBA 구간은 기능 이름 암기보다 실제 작업 장면, 확장자, 저장 위치, 개체·속성·메서드 구분으로 문제를 연결했다.
- 함수 계산형 문항은 없는 단위라 Excel COM 결과값 검산 대상은 없었다.
- 검증: `npx vitest run src/data/comhwal/concepts.test.ts src/game/comhwalVisualModels.test.ts`, `npm run typecheck`.

## 2026-06-10 - COMHWAL Batch A-3 스프레드시트 086~096 재작성

- 스프레드시트 일반 086~096의 22개 저작 카드를 차트 기초/편집/종류, 화면 보기, 페이지 설정, 인쇄, 정렬, 고급 필터, 외부 데이터, 부분합, 피벗 테이블 중심으로 재작성했다.
- 각 토픽에 직접 `questionPrompt`와 같은 도메인의 오답 선택지를 넣어 넓은 fallback 문제가 나오지 않게 했다.
- 함수 계산형 문항은 없는 단위라 Excel COM 결과값 검산 대상은 없었다.
- 검증: `npx vitest run src/data/comhwal/concepts.test.ts src/game/comhwalVisualModels.test.ts`, `npm run typecheck`.

## 2026-06-10 - COMHWAL Batch A-2 스프레드시트 071~085 재작성

- 스프레드시트 일반 071, 072, 074, 075, 077, 078, 079, 080, 081, 083, 084, 085의 24개 저작 카드를 조건부 서식, 수식 오류, 이름 정의, 함수 기본, 수학/텍스트/날짜/논리/정보/DB/재무/배열 함수 중심으로 재작성했다.
- 보존 대상 골드 스탠더드 토픽 073, 076, 082는 수정하지 않았고, 서버 화이트리스트(q02/q04)에 맞춰 토픽당 카드 2장 구조를 유지했다.
- 계산형 함수 문항은 Excel COM `Evaluate`로 결과를 재검산했다. 특히 `ROUNDUP(-12.31,1)=-12.4`, `ROUNDDOWN(-12.39,1)=-12.3`, `ROUND(-12.35,1)=-12.4`, `INT(-3.2)=-4`, `MOD(-7,3)=2`를 확인했다.
- 검증: `npx vitest run src/data/comhwal/concepts.test.ts src/game/comhwalVisualModels.test.ts`, `npm run typecheck`.

## 2026-06-10 - COMHWAL Batch A-1 스프레드시트 060~069 재작성

- 스프레드시트 일반 060~069의 20개 저작 카드를 화면 구성, 워크시트 한계, 입력 형식, 채우기 핸들, 찾기/바꾸기, 이동키, 고급 옵션, 셀 편집, 공유/보호 함정 중심으로 재작성했다.
- 서버 화이트리스트(q02/q04)에 맞춰 토픽당 카드 2장 구조를 유지했고, 새 Supabase migration은 만들지 않았다.
- 검증: `npx vitest run src/data/comhwal/concepts.test.ts src/game/comhwalVisualModels.test.ts`, `npm run typecheck`.

## 2026-06-09 - COMHWAL 1과목 Windows 개념 시각 요약 개선

### 사용자가 발견한 문제

- `[설정] → [시스템]` 개념의 시각 요약이 엑셀 표처럼 보이는 격자 도식으로 표시됐다.
- 시스템 설정은 화면, 소리, 저장 공간, 전원 같은 Windows 설정 메뉴인데 스프레드시트 형태로 설명되어 오히려 이해를 방해했다.

### 수정 방향

- 컴활 1과목 `visualHint`가 fallback 격자로 떨어지지 않도록 Windows/파일/장치/하드웨어/소프트웨어/네트워크/멀티미디어/보안 전용 도식으로 분기했다.
- 특히 `settings-system`은 Windows 설정 화면처럼 왼쪽 메뉴와 시스템 패널을 보여 주고, 디스플레이·소리·저장 공간·전원 카드를 직접 강조하도록 바꿨다.
- 단순 텍스트 칩이 아니라 개념의 실제 맥락을 보여 주는 패널형 그림으로 바꿔 SQLD 1과목 초반 개념 노드처럼 설명과 그림이 맞물리게 했다.
- 후속 검토에서 시스템뿐 아니라 단축키, 장치 관리자, 자료 단위, 하드웨어, 소프트웨어, 네트워크, 멀티미디어, 보안 도식의 큰 밝은 강조 면을 어두운 glass 강조로 통일했다.

### 사용자에게 주는 좋은 영향

- 사용자는 `[시스템]` 메뉴가 어디에 있고 무엇을 다루는지 그림만 봐도 바로 연결할 수 있다.
- Windows, 하드웨어, 네트워크, 보안 계열 개념이 더 이상 엑셀 격자처럼 보이지 않는다.
- 개념 진행 말풍선 아래 시각 요약이 “장식”이 아니라 방금 배운 개념을 붙잡는 보조 설명 역할을 한다.

### 반영 파일

- `src/game/screens/GalaxyScreen.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 상태

- 새 문제 ID나 문제 본문을 추가하지 않았다.
- 로컬 개념 시각화 렌더링만 바꾼 작업이라 Supabase migration은 필요하지 않다.

## 2026-06-05 - COMHWAL 문제 안내를 직전 개념 기준으로 연결

### 사용자가 발견한 문제

- `한글 Windows 10의 특징` 첫 흐름에서 운영체제 역할만 설명했는데, 문제 안내 말풍선이 `한글 Windows 10의 특징 문제를 풀어보자!`라고 떠서 아직 배우지 않은 Windows 10 특징을 묻는 것처럼 보였다.
- 컴활 확인 문제가 방금 본 개념과 유기적으로 이어지는지 전체적으로 점검할 필요가 있었다.

### 수정 방향

- 컴활 문제 안내 말풍선이 토픽 제목을 반복하지 않고 실제 `activeQuestion.prompt`를 보여 주도록 바꿨다.
- 자동 생성 문제의 fallback prompt를 `토픽 제목에서 방금 배운 핵심`이 아니라 `방금 본 "{카드 제목}" 설명과 가장 가까운 것`으로 바꿨다.
- 테스트에 다음 회귀 방지 규칙을 추가했다.
  - Windows 10 첫 체크포인트는 `Windows 10`이 아니라 직전 운영체제 설명을 묻는다.
  - 자동 생성 문제는 넓은 토픽 제목 기반 fallback 문구를 쓰지 않는다.
  - 문제 안내용 `문제를 풀어보자` 문구가 문제 prompt로 남지 않는다.

### 사용자에게 주는 좋은 영향

- 사용자는 문제를 보기 전에 “방금 배운 내용으로 풀 수 있겠다”는 연결감을 얻는다.
- 토픽 제목이 넓어도 문제는 직전 카드의 좁은 개념만 확인한다.
- 컴활 1·2·3과목 전체 자동 생성 문제에 같은 규칙이 적용된다.

### 반영 파일

- `src/game/screens/GalaxyScreen.tsx`
- `src/data/comhwal/concepts.ts`
- `src/data/comhwal/concepts.test.ts`
- `docs/content-edit-log.md`

### Supabase 반영 상태

- 새 문제 ID를 추가하지 않았다.
- 컴활 로컬 개념 확인 문제의 안내 문구와 자동 생성 prompt 규칙만 바꾼 작업이라 Supabase migration은 필요하지 않다.

## 2026-06-04 - COMHWAL 2·3과목 기본 시각 도식 표시

### 사용자가 발견한 문제

- 컴활 `스프레드시트 일반` 첫 개념 화면에서 말풍선과 버튼 아래가 넓게 비어 보였다.
- `visualHint`가 있는 1과목 카드와 달리 새 2·3과목 카드에는 개념을 쉽게 떠올리는 CSS 그림이나 진행 노드가 나오지 않았다.

### 수정 방향

- 컴활 개념 화면에서 `visualHint`가 없는 카드도 항상 `ComhwalConceptVisualCard`를 렌더하도록 바꿨다.
- 토픽 번호 범위에 따라 스프레드시트 격자, 수식 흐름, 차트 막대, 데이터베이스 테이블 연결 도식을 자동으로 고르게 했다.
- 첫 스프레드시트 카드에는 행·열·셀 주소를 보여 주는 미니 엑셀 격자 도식이 말풍선 아래에 표시된다.

### 사용자에게 주는 좋은 영향

- 컴활 2·3과목도 ADsP/SQLD처럼 말풍선 아래에 개념을 잡아 주는 시각 보조가 생긴다.
- 사용자는 빈 우주 배경만 보는 대신, 방금 들은 개념을 그림과 노드로 바로 연결할 수 있다.

### 반영 파일

- `src/game/screens/GalaxyScreen.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- UI 표시 방식 변경이며 새 서버 문제 ID를 추가하지 않았다.
- Supabase migration은 필요하지 않다.

## 2026-06-04 - COMHWAL 2·3과목 개념 카드 초안 작성

### 사용자가 발견한 문제

- 컴활 로드맵에는 `스프레드시트 일반` 060~106, `데이터베이스 일반` 107~152 토픽이 있지만 실제 개념 카드가 비어 있었다.
- 사용자는 ADsP/SQLD와 같은 학습 진행감을 위해 비어 있는 2·3과목 콘텐츠를 채워 달라고 요청했다.
- 이전 컴활 콘텐츠 수정 기록처럼 `짧은 말풍선 → 확인 문제 → 피드백` 흐름을 적극 참고해야 했다.

### 수정 방향

- `src/data/comhwal/expansionConcepts.ts`를 추가해 2과목 47토픽, 3과목 46토픽의 로컬 개념 카드 초안을 작성했다.
- 각 토픽은 최소 2개 핵심 카드로 나누고, 생성기에서 `사전 설명 말풍선 → 체크포인트 문제 카드` 구조로 확장되게 했다.
- 기존 `컴퓨터 일반` 전용 생성기를 세 planet 공통 생성기로 바꿔 `spreadsheet-general`, `database-general`도 `getComhwalTopicCards()`에서 조회되게 했다.
- 회귀 방지를 위해 테스트 범위를 001~152 전체로 넓혀 카드 존재, 문제 존재, 말풍선 길이, 교재식 문체 금지를 검증했다.

### 사용자에게 주는 좋은 영향

- 컴활 1급 로드맵의 세 과목이 모두 `레슨 준비 중` 느낌 없이 개념 학습 화면으로 진입할 수 있다.
- 2급 사용자도 `컴퓨터 일반`과 `스프레드시트 일반` 전체를 같은 리듬으로 학습할 수 있다.
- 향후 컴활 정식 문제은행과 진도 저장을 붙일 때 토픽별 개념 뼈대가 먼저 잡혀 있다.

### 반영 파일

- `src/data/comhwal/expansionConcepts.ts`
- `src/data/comhwal/concepts.ts`
- `src/data/comhwal/concepts.test.ts`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 이번 작업은 컴활 로컬 개념 카드와 로컬 확인 문제 초안이다.
- ADsP/SQLD 정식 서버 문제 `quizId`/`extraQuizIds`를 추가한 작업이 아니므로 Supabase migration은 필요하지 않다.

## 2026-06-04 - COMHWAL 1과목 전체 개념·문제 보강

### 사용자가 발견한 문제

- `한글 Windows 10의 특징`만 QuestDP식으로 잘게 쪼개져 있고, 002~059 나머지 1과목 토픽은 여전히 얇은 요약 카드처럼 느껴졌다.
- 사용자는 컴활도 ADSP/SQLD처럼 `짧은 대사 여러 개 → 방금 배운 개념 확인 문제 → 다음 개념` 구조가 되어야 한다고 요청했다.

### 수정 방향

- 1과목 `컴퓨터 일반`의 002~059 전체 토픽에 짧은 사전 설명 말풍선을 추가했다.
- 각 기존 핵심 카드 앞에 6살도 이해할 수 있는 수준의 쉬운 비유/예시 말풍선을 먼저 배치하고, 그 다음 카드에서 체크포인트 문제를 내도록 바꿨다.
- 001은 사용자가 이미 방향을 잡은 세부 흐름을 유지하고, 나머지 토픽만 전체 보강했다.
- “001만 보강되는 회귀”를 막기 위해 모든 002~059 토픽이 `설명 말풍선 → 문제 카드` 구조를 갖는지 테스트를 추가했다.

### Supabase 반영 여부

- 새 서버 문제 ID를 추가하지 않고, 컴활 로컬 개념 카드의 질문 생성과 연결 구조만 보강했다.
- Supabase `public.questions` migration은 필요 없다.

## 2026-06-04 - COMHWAL 개념 진행 보조 그림 연결

### 사용자가 발견한 문제

- 컴활 개념 진행 영역이 `한글 Windows 10의 특징 / 운영체제는 총관리자야` 같은 텍스트 카드처럼 보여 ADSP/SQLD의 그림 설명 방식과 달랐다.
- 사용자는 이 영역도 개념을 바로 떠올릴 수 있는 CSS 그림으로 보여 달라고 요청했다.

### 수정 방향

- 컴활 개념 카드의 `visualHint`를 실제 화면의 `ComhwalConceptVisualCard`에 연결해 말풍선 아래에 그림 설명이 보이게 했다.
- `운영체제는 총관리자야` 카드는 앱 실행, 파일 자리, 장치 연결을 운영체제가 가운데에서 정리하는 도식으로 표현했다.
- 기존 텍스트 중심 진행 카드는 화면에서 숨기고, 얇은 진행 바만 남겨 그림이 학습 보조의 중심이 되게 했다.

### Supabase 반영 여부

- 새 문제 ID나 서버 문제은행 변경은 없다.
- UI 렌더링과 로컬 컴활 개념 카드 표시 방식 변경이라 Supabase migration은 필요하지 않다.

## 2026-06-03 - COMHWAL 문제 타이밍 체크포인트 방식 전환

### 사용자가 발견한 문제

- 컴활 개념 진행이 `짧은 대사 1개 → 즉시 문제`로 반복되어 QuestDP의 ADSP/SQLD식 흐름과 달랐다.
- 사용자는 운영체제처럼 처음 보는 개념을 한 문장만 보고 바로 문제를 풀면 거부감이 든다고 지적했다.
- QuestDP의 목표는 `짧은 대사 여러 개 → 방금 배운 묶음에 대한 통합 문제 → 다음 개념` 흐름이어야 한다.

### 수정 방향

- 컴활 1과목 문제 연결 기준을 카드마다 즉시 문제가 아니라 체크포인트 문제로 바꿨다.
- 기본값은 토픽 안의 마지막 짧은 대사에만 문제를 붙여, 최소 2개 이상의 대사를 보고 확인 문제로 넘어가게 했다.
- 001 `한글 Windows 10의 특징`은 명시 체크포인트를 둬서 `컴퓨터는 혼자 못 알아들어 → 운영체제는 중간 통역사야 → 운영체제는 총관리자야` 뒤 통합 문제를 푸는 흐름으로 바꿨다.
- 테스트도 `첫 말풍선 뒤 즉시 문제 금지`, `토픽별 최소 1개 체크포인트 문제`를 검증하도록 바꿨다.

### Supabase 반영 여부

- 이번 작업은 컴활 로컬 개념 카드의 질문 타이밍과 문장 재구성이다.
- 아직 서버 문제은행에 들어가는 ADSP/SQLD형 정식 문제 ID 작업이 아니므로 Supabase migration은 필요 없다.

## 2026-06-03 — COMHWAL 개념 진행 목록 상단 배치

### 사용자가 발견한 문제

- 컴활 레슨에서 `개념 진행` 목록이 캐릭터와 말풍선 아래에 배치되어, 사용자가 먼저 현재 학습 위치를 파악하기 어려웠다.
- 진행 표시가 `1 / 1`처럼 보이거나 카드 보조 정보처럼 느껴져 ADSP/SQLD의 레슨 흐름과 달라 보였다.

### 수정 방향

- 컴활 개념 진행 목록을 캐릭터와 말풍선보다 위에 배치했다.
- 진행 목록은 실제 카드 묶음 기준으로 `1 / 7`처럼 표시되게 유지했다.
- 현재 카드의 퍼센트는 전체 카드 순번이 아니라 현재 설명/문제 단계의 진행률을 보여주도록 바꿨다.

### Supabase 반영 여부

- UI 배치와 진행 표시 의미 정리만 진행했다.
- 새 문제 ID나 서버 문제은행 변경이 없으므로 Supabase migration은 필요 없다.

## 2026-06-03 — COMHWAL 개념 진행 상단 메타 헤더 제거

### 사용자가 발견한 문제

- 컴활 개념 진행 화면 상단에 `컴활 필기 · 컴퓨터 일반 · NO.001` 같은 메타 정보가 노출되어 ADSP/SQLD 레슨과 다른 화면처럼 보였다.
- 개념 진행 중에는 캐릭터와 말풍선이 첫 시각 신호가 되어야 하는데, 과목/토픽 정보가 먼저 보여 학습 흐름을 끊었다.

### 수정 방향

- 컴활 개념 진행 화면 내부의 상단 메타 헤더를 제거했다.
- 과목명, 토픽 번호, 목차 정보는 목차/행성 화면에서만 보여주고, 레슨 내부는 ADSP/SQLD처럼 `TopBar → 개념 진행 → 캐릭터 → 말풍선 → 이전/계속` 흐름으로 맞춘다.

### Supabase 반영 여부

- UI 구조 정리만 진행했다.
- 새 문제 ID나 서버 문제은행 변경이 없으므로 Supabase migration은 필요 없다.

## 2026-06-03 — COMHWAL 1과목 001 Windows 10 특징 카드 분해

### 사용자가 발견한 문제

- 001 `한글 Windows 10의 특징`이 한 카드 요약으로만 되어 있어서, 초보자가 Windows 10의 시험 포인트를 기능별로 나눠 이해하기 어려웠다.
- 개념 뒤에 바로 확인할 문제가 없어 “짧은 개념 → 즉시 문제”라는 QuestDP 학습 루프가 약했다.

### 수정 방향

- 001을 `운영체제 역할`, `GUI`, `선점형 멀티태스킹`, `Plug & Play`, `OLE` 5개 카드로 쪼갰다.
- 각 카드에는 방금 배운 개념만 묻는 로컬 확인 문제를 붙였다.
- 기존 002~005 카드는 `Windows 기본 조작` 섹션으로 분리해서 섹션당 최대 5카드 규칙을 지켰다.
- 컴활 카드 화면에 확인 문제 UI를 연결해, 선택하면 바로 정오답과 해설을 볼 수 있게 했다.

### 사용자에게 주는 좋은 영향

- 사용자는 한 번에 하나의 시험 포인트만 보고 바로 문제로 확인할 수 있다.
- `Windows 10 특징`처럼 암기 포인트가 많은 주제도 “개념 하나씩” 진행되므로 거부감이 줄어든다.
- 앞으로 002~059도 같은 방식으로 확장할 기준 샘플이 생겼다.

### 반영 파일

- `src/data/comhwal/concepts.ts`
- `src/game/screens/GalaxyScreen.tsx`
- `src/data/comhwal/concepts.test.ts`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 `quizId` 또는 `extraQuizIds`를 만들지 않았다.
- 컴활 카드 내부 로컬 확인 문제라 Supabase `public.questions` migration은 필요 없다.

## 2026-05-31 — ADSP 세부 개념 도식 추가 보강

### 사용자가 발견한 문제

- ADSP에 큰 단원 그림은 들어갔지만, 세부 스텝으로 들어가면 다시 문장 설명만 보이는 구간이 남아 있었다.
- 특히 데이터 분류 상세 스텝과 DB 4특징 상세 스텝은 초보자가 “지금 어떤 기준을 보고 있는지”를 놓치기 쉬웠다.

### 수정 방향

- 새 문제 ID를 만들지 않고, 기존 레슨 흐름에 CSS 도식만 추가했다.
- `데이터 분류` 상세 스텝은 형태 / 표현 방식 / 분석 목적 렌즈를 한 화면에 보여주고, 현재 배우는 카드만 밝게 켜지도록 했다.
- `DB 4특징` 상세 스텝은 공용 / 통합 / 저장 / 변화가 DB 중심으로 연결되는 구조를 보여주고, 현재 특징과 쉬운 예시를 강조했다.

### 사용자에게 주는 좋은 영향

- 사용자는 “지금 외우는 단어가 어느 분류 기준에 속하는지”를 시각적으로 구분할 수 있다.
- 정형·반정형·비정형, 정량·정성, 수치형·범주형처럼 헷갈리기 쉬운 개념을 한 화면에서 비교할 수 있다.
- DB 4특징은 암기어 `공통저변`만 남는 것이 아니라 각각의 의미와 실제 상황을 같이 떠올릴 수 있다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 `quizId`나 `extraQuizIds`를 추가하지 않았다.
- 문제 문항과 정답을 바꾸지 않았으므로 Supabase `public.questions` 반영은 필요 없다.

## 2026-05-31 — ADSP 데이터 사이언티스트 6역량 문제 문장 보정

### 사용자가 발견한 문제

- `다음 중 DS 6역량 (Digital CAMERA)에 속하지 않는 것은?`이라는 문제 문장은 Digital CAMERA를 실제 개념명처럼 보이게 만든다.
- Digital CAMERA는 개념 자체가 아니라 `Communication · Analytics · Math · Engineering · Research · Art`를 기억하기 위한 암기 도구다.

### 수정 방향

- 문제 stem을 `데이터 사이언티스트에게 필요한 6가지 역량`을 묻는 방식으로 바꿨다.
- 선택지는 유지해 기존 정답 구조를 흔들지 않았다.
- 해설에서만 Digital CAMERA를 암기 도구로 설명하고, Management가 포함되지 않는다는 시험 함정을 풀어썼다.

### 사용자에게 주는 좋은 영향

- 사용자가 암기어와 실제 개념을 혼동하지 않는다.
- 문제를 풀 때 “Digital CAMERA라는 명칭을 외웠는가”가 아니라 “데이터 사이언티스트 역량의 구성 요소를 이해했는가”를 확인하게 된다.

### 반영 파일

- `src/data/questions/adsp/concept-practice.json`
- `supabase/migrations/0071_update_adsp_data_scientist_competency_drill.sql`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 기존 문제 `adsp-1-3-cp-03`의 stem/explanation을 변경했다.
- 라이브 `public.questions` 반영용 migration SQL을 추가했다.

## 2026-05-31 — ADSP 데이터 사이언스 3축 도식 가독성 개선

### 사용자가 발견한 문제

- `데이터 사이언스는 분석·기술·비즈니스가 만나는 지점` 도식이 벤다이어그램 형태라 모바일에서 원과 글자가 겹쳐 보기 어려웠다.
- 사용자는 `Analytics`, `IT`, `Business` 각각이 무슨 역할인지보다 원의 교차 영역을 읽느라 부담을 느낄 수 있었다.

### 수정 방향

- 겹치는 원 도식을 제거하고, `Analytics → IT → Business` 3개의 역할 카드가 아래의 `데이터 사이언스` 카드로 모이는 구조로 바꿨다.
- 각 축은 번호, 영문명, 쉬운 한국어 역할, 예시 범위를 한 줄씩 분리해 모바일에서 읽기 쉽게 했다.
- `AI 비` 암기어는 별도 작은 배지로 남기되, 핵심 메시지는 “세 축이 함께 있어야 실제 가치가 된다”로 정리했다.

### 사용자에게 주는 좋은 영향

- 처음 보는 학습자가 데이터 사이언스를 원 교집합 그림이 아니라 세 가지 필요한 역량의 조합으로 이해할 수 있다.
- 작은 모바일 화면에서도 각 축의 역할이 분리되어 보여 눈의 부담이 줄어든다.
- 새 문제 ID를 추가하지 않아 Supabase 문제 누락 위험이 없다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 `quizId` 또는 `extraQuizIds`를 추가하지 않았다.
- 문제 JSON과 Supabase `public.questions`는 변경하지 않았으므로 migration은 필요 없다.

## 2026-05-31 — SQLD JOIN 도입부 난이도 완화

### 사용자가 발견한 문제

- `JOIN 4종` 단계가 JOIN의 목적, INNER/LEFT/RIGHT/FULL, 행 수 계산 패턴까지 한 번에 보여줘서 처음 보는 사용자가 따라가기 어렵다.
- 설명 말투는 친근하지만 진행 흐름이 빠르기 때문에, 사용자가 “왜 갑자기 네 종류를 외워야 하지?”라고 느낄 수 있다.
- 하단 도식도 `같은 값끼리 붙인다`는 핵심보다 JOIN 종류 요약으로 빨리 넘어가 부담이 생겼다.

### 수정 방향

- 새 `quizId`를 만들지 않고 기존 JOIN 레슨의 설명 흐름만 낮췄다.
- `JOIN은 표 두 개를 같은 값 기준으로 붙이는 것` → `ON 조건의 의미` → `어느 쪽 행을 남길지` → `INNER/LEFT/RIGHT/FULL` 순서로 다시 배치했다.
- 첫 JOIN 레슨에서 어려운 행 수 합계 패턴 설명을 제거하고, 문제 푸는 순서만 남겼다.
- `sqld-sql-lab-015`처럼 같은 키가 여러 번 있을 때 행 수를 계산하는 고난도 드릴은 첫 JOIN 레슨의 `extraQuizIds`에서 제외했다.
- `DialogueLesson.tsx`에 `joinKey` 도식을 추가해 `ON E.부서ID = D.부서ID`가 실제로 무엇을 의미하는지 표와 SQL 예시로 보이게 했다.
- `JOIN 조건 표기` 단계의 말투도 `ON/USING/NATURAL`을 처음 보는 사용자 기준으로 풀어썼다.

### 사용자에게 주는 좋은 영향

- JOIN을 종류 암기가 아니라 “같은 키로 붙이고, 어떤 행을 남길지 정하는 것”으로 먼저 이해할 수 있다.
- SQLD 2과목에서 이탈하기 쉬운 JOIN 파트의 첫 진입 부담을 낮춘다.
- 새 문제 ID를 추가하지 않아 Supabase 문제 누락 오류 위험이 없다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`
- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 `quizId` 또는 새 `extraQuizIds`를 추가하지 않았다.
- 오히려 첫 JOIN 레슨에서 고난도 기존 extra 문제 하나를 제외했으므로 Supabase migration은 필요 없다.

## 2026-05-31 — SQLD PIVOT/UNPIVOT 도식 추가

### 사용자가 발견한 문제

- `PIVOT은 행으로 길게 쌓인 값을 열로 펼치는 기능이야`라는 문장만으로는 실제로 표 모양이 어떻게 바뀌는지 상상하기 어렵다.
- 특히 PIVOT과 UNPIVOT은 이름이 비슷해서, 초보자는 `행 -> 열`, `열 -> 행` 방향을 헷갈릴 수 있다.

### 수정 방향

- `sqld-2-2-s11-pivot` 단계에 전용 CSS 도식을 추가했다.
- 긴 표(`월, 과목, 점수`)가 PIVOT을 거쳐 넓은 표(`월, SQL, 모델링`)로 바뀌는 모습을 한 화면에서 보여준다.
- Oracle 기준 PIVOT SQL 예시를 함께 넣어 `SUM(점수)` 집계 함수와 `FOR 과목 IN (...)` 구조를 연결했다.
- UNPIVOT은 반대 방향이라는 점을 별도 카드와 파이프라인으로 보여줬다.

### 사용자에게 주는 좋은 영향

- PIVOT/UNPIVOT을 말뜻 암기가 아니라 표의 모양 변화로 먼저 이해할 수 있다.
- SQLD에서 자주 나오는 “PIVOT은 집계 함수가 필요하다”는 포인트를 자연스럽게 기억할 수 있다.
- 새 문제 ID를 추가하지 않아 Supabase 문제 누락 오류 위험이 없다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 `quizId` 또는 `extraQuizIds`를 추가하지 않았다.
- 문제 JSON과 Supabase `public.questions`는 변경하지 않았으므로 migration은 필요 없다.

## 2026-05-31 — ADSP/SQLD 레슨 말투 전체 점검

### 사용자 발견 문제

- ADSP/SQLD 전체 설명의 종결 어미가 `~합니다`, `~됩니다`, `~세요`, `~해요`처럼 섞이면 1과목에서 잡아온 친근한 튜터 톤이 깨진다.
- SQLD 2과목처럼 어려운 파트는 말투가 조금만 딱딱해져도 사용자가 “교재 요약표”처럼 느끼기 쉽다.

### 수정 방향

- ADSP/SQLD lesson copy, 하단 CSS 도식 문구, 2회독 reminder, 레슨 공통 안내 문구를 스캔했다.
- 사용자에게 직접 설명하는 문장은 `~야`, `~어`, `~해`, `~지` 중심으로 통일했다.
- 기계 치환 중 생길 수 있는 `쓰야`, `보야`, `모야`, `"설명선"야` 같은 어색한 표현을 별도로 스캔해 자연스러운 문장으로 고쳤다.
- 시험형 문제 문항의 `옳은 것은?` 같은 형식은 문제 스타일로 남겼고, 이번 작업은 개념 설명과 학습 안내 톤에 집중했다.

### 사용자에게 주는 좋은 영향

- ADSP와 SQLD를 오가도 같은 선생님이 옆에서 설명해 주는 느낌이 유지된다.
- 어려운 SQLD 2과목에서도 압축 요약이 아니라 친근한 학습 흐름으로 받아들일 가능성이 커진다.
- 새 문제 ID를 추가하지 않았으므로 Supabase 문제은행 누락 위험은 없다.

### 반영 파일

- `src/data/lessons/adsp/ch1.ts`
- `src/data/lessons/adsp/ch2.ts`
- `src/data/lessons/adsp/ch3.ts`
- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/lessons/sqld/ch2-sql.ts`
- `src/data/reminders.ts`
- `src/game/lesson/DialogueLesson.tsx`
- `src/game/screens/ZoneScreen.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 `quizId` 또는 `extraQuizIds`를 추가하지 않았다.
- 문제 JSON과 Supabase `public.questions`는 변경하지 않았으므로 migration은 필요 없다.

## 2026-05-31 — SQLD ROLLUP/CUBE/GROUPING 말투 완화

### 사용자 발견 문제

- `ROLLUP(a, b): 컬럼 순서대로 점진적으로 그룹을 줄여 소계+총계`처럼 요약식 문장이 먼저 보이면 초보자가 시험 암기표를 보는 느낌을 받는다.
- SQLD 2과목은 난도가 높아서 “기능 이름 → 정의”보다 “매출표에서 어떤 합계가 궁금한 상황인지 → 어떤 SQL 기능을 쓰는지” 순서가 더 안전하다.

### 수정 방향

- ROLLUP은 `지역+상품별 상세 매출 → 지역별 매출 합계 → 전체 매출 합계` 흐름으로 설명했다.
- CUBE는 `지역별도 보고, 상품별도 보는 넓은 합계`로 풀어 설명했다.
- GROUPING SETS/GROUPING은 `필요한 묶음만 고르기`, `NULL처럼 보이는 소계 자리를 구분하기`로 표현을 부드럽게 바꿨다.
- 하단 도식 제목도 `오른쪽 기준부터 접어서` 같은 압축 표현 대신 `상세 매출 아래에 소계와 총계를 붙인다`처럼 결과표 관점으로 바꿨다.
- 2회독 reminder도 `ROLLUP(a,b)` 표기 중심에서 “상세 → 소계 → 총계” 중심으로 바꿨다.

### 사용자에게 주는 좋은 영향

- 사용자가 ROLLUP/CUBE/GROUPING을 기호 암기보다 실제 결과표 변화로 먼저 이해한다.
- 어려운 집계 확장 파트에서도 1과목처럼 부드러운 말투가 유지된다.
- 새 문제 ID를 추가하지 않았으므로 Supabase 동기화 위험은 없다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`
- `src/game/lesson/DialogueLesson.tsx`
- `src/data/reminders.ts`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 `quizId` 또는 `extraQuizIds`를 추가하지 않았다.
- 기존 문제 연결만 유지했으므로 Supabase migration은 필요 없다.

## 2026-05-31 — SQLD ROLLUP/CUBE/GROUPING 단계 분리

### 사용자가 발견한 문제

- `ROLLUP · CUBE` 도식이 ROLLUP, CUBE, GROUPING을 한 장에 압축해서 보여줬다.
- 사용자는 “아 이런 것이 있구나” 정도만 알 수 있고, SQL 문으로 어떻게 쓰이며 결과 표가 어떻게 달라지는지 한눈에 이해하기 어려웠다.
- 특히 ROLLUP, CUBE, GROUPING은 SQLD 2과목 집계 확장 파트에서 헷갈리기 쉬우므로 각각 독립된 그림과 SQL 예시가 필요했다.

### 수정한 방향

- 기존 `그룹 함수` 한 step을 다음 3개 step으로 분리했다.
  - `ROLLUP`: `GROUP BY ROLLUP(지역, 상품)` SQL 예시와 상세 → 지역 소계 → 전체 총계 결과표
  - `CUBE`: `GROUP BY CUBE(지역, 상품)` SQL 예시와 지역별 소계, 상품별 소계, 전체 총계 조합
  - `GROUPING`: `GROUPING(컬럼)=0/1`의 의미와 `CASE WHEN GROUPING(...)` SQL 예시
- 기존 문제 `sqld-2-2-cp-07`과 SQL LAB `sqld-sql-lab-019`는 마지막 `GROUPING` step에 유지했다.
- 새 문제 ID는 만들지 않았다. 따라서 로컬 JSON과 Supabase 문제은행을 새로 동기화할 필요가 없도록 했다.
- step 수가 2개 늘었으므로 `gameModes` 표시와 lesson integration test의 총 step 수를 함께 갱신했다.
- 로드맵은 `quizId`가 있는 대표 노드만 보여주므로, 대표 노드를 눌렀을 때 같은 그룹의 첫 설명 step부터 시작하도록 진입 로직을 보정했다. 이렇게 해야 사용자가 `GROUPING` 문제 노드를 눌러도 `ROLLUP → CUBE → GROUPING` 순서로 학습한다.
- `집합 연산자`와 ROLLUP/CUBE/GROUPING이 같은 group 키에 묶이지 않도록 `sqld-2-2-g3-rollup-cube` 전용 그룹을 만들었다.

### 사용자에게 주는 좋은 영향

- ROLLUP은 “오른쪽 기준부터 접어 소계 생성”, CUBE는 “모든 조합 생성”, GROUPING은 “소계/총계 행 구분”으로 역할이 분리되어 기억된다.
- SQL 문과 결과표를 같이 보므로 시험 문제에서 생성 그룹을 묻는 경우 더 빠르게 판단할 수 있다.
- 어려운 집계 확장 개념을 한 번에 던지지 않고, 모바일 화면에서 하나씩 따라가며 이해할 수 있다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`
- `src/game/GamePage.tsx`
- `src/game/lesson/DialogueLesson.tsx`
- `src/data/gameModes.ts`
- `src/data/lessons/lessons.integration.test.ts`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 `quizId` 또는 `extraQuizIds`를 추가하지 않았다.
- 기존 문제 ID를 재배치만 했으므로 Supabase migration은 필요 없다.

## 2026-05-31 — SQLD SELECT 실행 순서 단계형 도식 재구성

### 사용자가 발견한 문제

- `SELECT 실행 순서`에서 FWGHSO 전체를 한 번에 설명하고 도식도 한 화면에 모두 보여줘 초보자가 부담을 느낄 수 있었다.
- `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, `ORDER BY`가 각각 정확히 무엇을 의미하는지 충분히 익히기 전에 전체 순서와 규칙이 한꺼번에 나왔다.

### 수정한 방향

- 실제 step 개수는 늘리지 않고, 한 노드 안의 대사와 그림을 여러 장으로 쪼갰다.
- 하나의 SQL 예시를 계속 확장하는 방식으로 변경했다.
  - `FROM EMP`: EMP 직원 테이블에서 시작
  - `WHERE JOIN_YEAR >= 2020`: 2020년 이후 입사 행만 남김
  - `GROUP BY DEPT`: 남은 행을 부서별로 묶음
  - `HAVING AVG(SAL) >= 5000`: 평균 급여 5000 이상 그룹만 남김
  - `SELECT DEPT, AVG(SAL) AS AVG_SAL`: 보여줄 열과 별칭 생성
  - `ORDER BY AVG_SAL DESC`: 평균 급여 높은 순 정렬
- 각 대사 턴에 맞춰 도식이 `개요 → FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → 요약`으로 바뀌도록 했다.
- `FROM`, `SELECT`, `GROUP BY`, `HAVING`, `ORDER BY` 클릭 설명도 추가해 낯선 SQL 절을 바로 확인할 수 있게 했다.

### 사용자에게 주는 좋은 영향

- FWGHSO를 단순 암기어로 보는 것이 아니라, 실제 SQL 문장이 처리되는 흐름으로 이해할 수 있다.
- 각 절을 배운 직후 같은 예시에서 결과가 어떻게 바뀌는지 보므로 개념 간 연결이 자연스럽다.
- 이후 ALIAS, 집계함수, WHERE/HAVING 차이 문제를 풀 때 “지금 이 시점에 무엇이 만들어졌는가”를 판단하기 쉬워진다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`
- `src/game/lesson/DialogueLesson.tsx`
- `src/game/lesson/GlossaryKeyword.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 문제 ID, 문항, 선택지, 정답, 해설을 변경하지 않았다.
- 레슨 대사, 시각 도식, 클릭 용어 설명만 수정했으므로 Supabase migration은 필요 없다.

## 2026-05-31 — SQLD ALIAS/DISTINCT 구간 말투와 NULL 설명 보정

### 사용자가 발견한 문제

- `ALIAS와 DISTINCT` 스텝 중반부터 `NULL 도 한 값으로 취급`, `문자열 연결`, `ALIAS 쓸 수 없는 절은?`처럼 요약노트식 문장이 이어졌다.
- 앞뒤의 쉬운 말투와 달리 갑자기 딱딱해져서, 처음 보는 사용자가 의미를 따라가기 어려웠다.

### 수정한 방향

- ALIAS를 “SQL 결과에 잠깐 붙이는 별명”으로 풀어 설명했다.
- `급여 * 12 AS 연봉` 예시를 통해 왜 별칭이 필요한지 먼저 보여줬다.
- 별칭 제한은 `숫자로 시작`, `예약어`, `특수문자`, `공백 별칭은 큰따옴표`처럼 문장으로 나눴다.
- `WHERE/GROUP BY/HAVING`에서 별칭을 못 쓰는 이유를 실행 순서와 연결해 설명했다.
- DISTINCT는 “똑같이 반복되는 결과 줄을 하나만 남기는 기능”으로 풀고, 여러 컬럼일 때는 모든 컬럼이 같아야 중복이라고 설명했다.
- `SELECT DISTINCT`에서 NULL 줄이 하나로 남을 수 있다는 설명과 `COUNT(DISTINCT col)`은 일반적으로 NULL을 세지 않는다는 점을 구분했다.
- ALIAS, DISTINCT를 클릭 설명 용어로 추가했다.

### 사용자에게 주는 좋은 영향

- SQL 용어를 암기 문장으로 받는 것이 아니라, 실제 결과표를 읽는 흐름으로 이해할 수 있다.
- NULL과 DISTINCT의 차이를 더 정확하게 구분해 시험 함정에 덜 흔들린다.
- 이후 ALIAS 위치 오류 문제를 풀 때 “왜 WHERE에서 별칭을 모르는지”를 실행 순서로 설명할 수 있다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`
- `src/game/lesson/GlossaryKeyword.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 문제 ID, 문항, 선택지, 정답, 해설을 변경하지 않았다.
- 레슨 대사와 보조 설명만 수정했으므로 Supabase migration은 필요 없다.

## 2026-05-31 — SQLD 관계대수 WHERE 선행 용어 부담 완화

### 사용자가 발견한 문제

- `관계대수` 초반에서 아직 `WHERE 절`을 배우기 전에 “WHERE와 가까운 연산”을 확인하겠다는 말이 나와 초보자가 거부감을 느낄 수 있었다.
- 문제 자체는 관계대수의 `행 선택`을 확인하는 좋은 방향이지만, WHERE가 무엇인지 모르는 사용자에게는 낯선 용어가 먼저 튀어나오는 흐름이었다.

### 수정한 방향

- 관계대수 대사에 `[WHERE]` 클릭 설명을 추가했다.
- WHERE를 “조건에 맞는 행만 남기는 부분”이라고 아주 짧게 설명하고, 바로 뒤에서 WHERE 절을 따로 배운다고 안내했다.
- 첫 문제 안내 문구는 `WHERE와 가까운 연산` 대신 `조건에 맞는 행을 고르는 연산`으로 바꿔, 문제의 핵심을 먼저 이해하게 했다.

### 사용자에게 주는 좋은 영향

- SQL을 처음 보는 사용자도 WHERE라는 낯선 단어 때문에 멈칫하지 않고 넘어갈 수 있다.
- 관계대수의 `σ = 행 선택` 의미가 먼저 남고, 이후 WHERE 절 학습과 자연스럽게 연결된다.
- “뒤에서 다시 배운다”는 안내가 있어 지금 완벽히 몰라도 된다는 안정감을 준다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`
- `src/game/lesson/GlossaryKeyword.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 문제 ID, 문항, 선택지, 정답, 해설을 변경하지 않았다.
- 레슨 대사와 클릭 용어 설명만 수정했으므로 Supabase migration은 필요 없다.

## 2026-05-31 — SQLD FWGHSO 도식 순서 인지 보강

### 사용자가 발견한 문제

- `SELECT 실행 순서` 도식이 2열 카드 목록처럼 보여서 `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY` 순서가 한눈에 들어오지 않았다.
- 그림을 보고 “이런 절들이 있구나” 정도만 느껴지고, 실제 암기어 `FWGHSO`의 흐름을 잡기 어려웠다.

### 수정한 방향

- 기존 2열 카드 나열을 세로 타임라인으로 변경했다.
- 각 절에 `1`부터 `6`까지 번호를 붙이고, `F/W/G/H/S/O` 글자를 함께 표시했다.
- 하단에는 `F > W > G > H > S > O` 요약 줄을 추가해 암기 순서를 다시 확인하게 했다.
- 설명 문구도 `위에서 아래로 1→6 순서`와 `SELECT 별칭은 ORDER BY에서 사용 가능`으로 바꿨다.

### 사용자에게 주는 좋은 영향

- 모바일에서 순서를 위에서 아래로 따라 읽을 수 있어 SQL 논리 처리 순서가 더 쉽게 남는다.
- `FWGHSO`가 단순 약어가 아니라 실제 처리 흐름으로 연결된다.
- 이후 WHERE, GROUP BY, HAVING, ORDER BY 문제를 풀 때 “지금 이 절에서 무엇을 알고 있는가”를 판단하기 쉬워진다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 문제 ID, 문항, 선택지, 정답, 해설을 변경하지 않았다.
- 시각 도식만 수정했으므로 Supabase migration은 필요 없다.

## 2026-05-31 — SQLD 2과목 Part 3 DDL/TCL/DCL 문제 타이밍 점검

### 사용자가 발견한 문제

- DML 첫 문제처럼, 관리 구문 큰 묶음에서 아직 배우지 않은 개념이 문제에 먼저 섞일 위험이 있었다.
- `DDL`, `TCL`, `DCL`도 같은 기준으로 점검이 필요했다.

### 수정한 방향

- `DDL` 첫 문제는 DDL 정의와 `TCARD(티카드)` 설명 직후 같은 범위만 묻고 있어 유지했다.
- `TCL` 첫 문제 `sqld-2-3-cp-03`은 SAVEPOINT/COMMIT 시나리오가 너무 복잡해, 먼저 `TCL이 무엇인지`를 묻는 기본 확인 문제로 낮췄다.
- SAVEPOINT 응용 문제는 기존 후속 드릴(`sqld-2-3-cp-03-savepoint-rollback`, `sqld-sql-lab-031`)로 남겨 단계가 오른 뒤 확인하게 했다.
- `DCL` 첫 문제 `sqld-2-3-cp-08`은 `WITH GRANT OPTION`과 `WITH ADMIN OPTION` 차이부터 묻고 있어, 먼저 `DCL이 권한을 주고 회수하는 명령군`임을 확인하는 기본 문제로 낮췄다.
- 옵션 차이 문제는 기존 후속 드릴 `sqld-sql-lab-035`로 옮겨 고급 확인 문제 역할을 하게 했다.

### 사용자에게 주는 좋은 영향

- 큰 묶음 개념을 처음 배운 직후에는 정의와 역할만 확인하므로 진입 장벽이 낮아진다.
- `SAVEPOINT`, `WITH GRANT/ADMIN OPTION` 같은 어려운 함정은 설명을 충분히 본 뒤 후속 문제로 만나게 된다.
- 관리 구문 전체가 `큰 묶음 이해 → 구성 명령 이해 → 함정 문제` 순서로 더 자연스럽게 정리된다.

### 반영 파일

- `src/data/questions/sqld/concept-practice.json`
- `src/data/questions/sqld/sql-interpretation-drills.json`
- `supabase/migrations/0070_update_sqld_management_intro_drills.sql`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 문제 ID는 만들지 않았다.
- 기존 문제 ID `sqld-2-3-cp-03`, `sqld-2-3-cp-08`, `sqld-sql-lab-035`의 문항·선택지·정답·해설을 갱신했다.
- 서버 반영을 위해 migration `0070_update_sqld_management_intro_drills.sql`을 추가했다.

## 2026-05-31 — SQLD 2과목 Part 3 DML 첫 개념 노드 보강

### 사용자가 발견한 문제

- `DML 진행` trail에는 `DML이란` 항목이 보이지만, 실제 학습 흐름에서는 사용자가 DML 정의를 충분히 학습했다고 느끼기 어려웠다.
- 첫 노드가 `관리 구문 큰 묶음` 설명으로 시작해서 DML 자체보다 DDL/TCL/DCL까지 한꺼번에 들어왔고, 다음 화면이 바로 `INSERT`로 넘어가면서 “DML이란 개념 노드가 비어 있다”는 인상을 줬다.

### 수정한 방향

- `sqld-2-3-s1`을 `DML이란` 개념 노드로 명확히 재정리했다.
- 첫 문장을 관리 구문 전체가 아니라 `DML은 Data Manipulation Language, 데이터 조작어`라는 정의에서 시작하게 바꿨다.
- DML의 하위 흐름을 `INSERT`, `UPDATE`, `DELETE`, `MERGE`로 먼저 보여주고, DDL/TCL/DCL은 비교용으로 뒤에 짧게 배치했다.
- `INSERT` 스텝 첫 문장에는 “방금 DML이 테이블 안의 행 데이터를 다루는 묶음이라고 봤지?”라는 연결 문장을 추가해 흐름이 끊기지 않게 했다.
- DML 첫 확인 문제 `sqld-sql-lab-001`은 DDL/TCL/DCL까지 묻는 선행 학습 문제였으므로, 방금 배운 DML 정의만 확인하는 문제로 재작성했다.

### 사용자에게 주는 좋은 영향

- 초보자가 `DML`이라는 큰 범주를 이해하지 못한 채 `INSERT`로 넘어가는 느낌이 줄어든다.
- Part 3 로드맵의 큰 제목과 lesson 내부 진행표가 실제 개념 설명과 일치한다.
- 아직 배우지 않은 `COMMIT/ROLLBACK`, `GRANT/REVOKE`, `DDL` 범위가 DML 첫 문제에 섞여 나오지 않아 문제 타이밍이 자연스러워진다.
- 앞으로 큰 그룹 노드를 만들 때는 “그룹명만 있는 노드”가 아니라 첫 개념 자체를 충분히 설명해야 한다는 기준이 생겼다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 `quizId`나 `extraQuizIds`를 만들지 않았다.
- 기존 문제 ID `sqld-sql-lab-001`의 문항, 선택지, 정답, 해설을 DML 첫 개념 확인 문제로 재작성했다.
- 서버 반영을 위해 기존 migration `0069_move_sql_command_group_drills_to_management.sql`에 `sqld-sql-lab-001` upsert를 추가했다.

## 2026-05-31 — SQLD 2과목 Part 1/Part 3 범위 재배치

### 사용자가 발견한 문제

- SQLD 2과목 `SQL 기본` Part 1 첫 노드에 `DDL`, `DML·DCL·TCL`이 먼저 나오고 있었다.
- 하지만 `DDL/DML/DCL/TCL`은 SQL 기본의 SELECT 읽기 흐름보다 `관리 구문` 범위에 가까워, Part 1에서 먼저 설명하면 시험 범위 흐름이 어긋난다.

### 수정한 방향

- `sqld-2-1` Part 1의 첫 스텝을 `SQL 기본 흐름`으로 바꾸고, SQL 기본은 관계대수·SELECT 실행 순서·WHERE·GROUP BY/HAVING·ORDER BY를 읽는 흐름부터 시작하게 했다.
- Part 1에서 `DDL`, `DML·DCL·TCL` 스텝을 제거했다.
- `TCARD(DDL 대표 명령)` 확인 문제는 Part 3 `ALTER · DROP · TRUNCATE` 스텝의 추가 문제로 옮겼다.
- `sqld-sql-lab-001` 명령군 분류 문제는 처음에는 Part 3 관리 구문으로 옮겼고, 이후 위 기록처럼 DML 첫 개념 확인 문제로 재작성했다.
- `sqld-2-1-cp-01`은 SQL 명령군 문제가 아니라 SQL 기본 흐름 확인 문제로 재작성했다.
- 추가 검토 후 Part 3 로드맵 자체도 `DML → INSERT/UPDATE/DELETE/MERGE`, `TCL → AUTOCOMMIT`, `DDL → CREATE/ALTER/DROP/TRUNCATE/제약조건`, `DCL` 순서가 보이도록 조정했다.
- `DML`과 `DDL`이 숨은 설명 카드로만 남지 않게 각각 보이는 노드로 만들었다. DML 노드는 기존 `sqld-sql-lab-001`, DDL 노드는 기존 `sqld-2-1-cp-01-ddl-tcard`를 연결해 새 서버 문제 ID 없이 구조를 바로잡았다.

### 사용자에게 주는 좋은 영향

- 초보자가 SQLD 2과목을 시작할 때 관리 구문 암기부터 맞닥뜨리지 않고, 먼저 SELECT 문장을 읽는 감각을 잡을 수 있다.
- DDL/DML/DCL/TCL은 Part 3에서 실제 관리 구문을 배운 뒤 확인하게 되어 문제 타이밍이 자연스러워진다.
- 로드맵의 Part 구분이 시험 범위와 더 잘 맞아 사용자가 “왜 지금 이걸 배우지?”라는 혼란을 덜 느낀다.
- Part 3에서도 큰 묶음 제목이 먼저 보이고, 그 아래 구성 명령이 이어져 “이 명령이 어느 군에 속하는지”를 로드맵 자체로 이해할 수 있다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`
- `src/data/questions/sqld/concept-practice.json`
- `src/data/questions/sqld/sql-interpretation-drills.json`
- `supabase/migrations/0069_move_sql_command_group_drills_to_management.sql`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 서버 동기화를 위해 migration `0069_move_sql_command_group_drills_to_management.sql`을 추가했다.
- `sqld-2-1-cp-01`은 서버에서도 SQL 기본 흐름 문제로 upsert된다.
- `sqld-2-1-cp-01-ddl-tcard`, `sqld-sql-lab-001`은 서버에서도 `관리 구문` topic으로 이동한다.

## 2026-05-27 — ADSP 2·3과목 CSS 도식 보강

### 사용자가 발견한 문제

- ADSP 1과목에는 DIKW, SECI, DW/DM/Lake, OLTP/OLAP, 빅데이터 3V처럼 그림 보강이 들어갔지만 2과목과 3과목은 아직 텍스트 중심으로 느껴질 수 있었다.
- 특히 ADSP 3과목은 통계·모델링 개념이 많아 초보자가 “말은 읽었는데 머릿속에 그림이 안 남는” 구간이 생길 가능성이 높았다.

### 수정한 방향

- 새 문제 ID를 만들지 않고 `DialogueLesson.tsx`의 step id 기반 도식 렌더링만 확장했다.
- 기존 ADSP 2과목 도식 체계는 유지하고, ADSP 3과목 전체 핵심 축에 CSS 그림을 붙였다.
- 추가한 대표 도식: 요약변수/파생변수, EDA 4R, 결측 처리, 이상값 탐지, R 자료구조, 측정 척도, 확률분포, 좋은 추정량, 중심극한정리, PCA/MDS, 가설검정, t검정, 회귀 가정, 다중공선성, 시계열 4성분, 과적합/데이터 분할, 앙상블, 연관분석, 군집, 평가지표, 주요 모델(로지스틱·나무·KNN·NBC·SVM·신경망).

### 사용자에게 주는 좋은 영향

- 2·3과목에서도 “짧은 설명 → 바로 보이는 구조 → 문제” 흐름이 이어져 ADSP 1과목과 학습 경험이 통일된다.
- 통계/모델링 용어가 추상적인 문장으로만 남지 않고, 카드·흐름·비교 구조로 기억된다.
- 모바일 화면에서 긴 설명을 읽기 전에 핵심 분류를 먼저 잡을 수 있어 이탈 가능성을 줄인다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 `quizId`나 `extraQuizIds`를 만들지 않았다.
- 문제 문항, 선택지, 정답, 해설 JSON도 변경하지 않았다.
- 따라서 Supabase `public.questions` upsert는 필요 없다.

> **읽는 순서.** 개념·문제 수정 전에는 이 긴 로그를 처음부터 읽지 말고, 먼저 `docs/content-edit-guide.md`와 `docs/content-edit-checklist.md`를 읽는다. 이 파일은 상세 근거 보관소이므로 필요한 날짜, step, `quizId`, `extraQuizIds`, Supabase 키워드로 검색해서 참고한다.
>
> **새 기록 방식.** 앞으로 새 항목은 "사용자가 발견한 문제 / 수정한 방향 / 사용자에게 주는 좋은 영향 / 반영 파일 / Supabase 반영 여부"만 짧게 남긴다. 재발 방지 규칙으로 승격할 내용은 guide 또는 checklist에 반영한다.

이 문서는 개념·문제 수정 과정에서 Codex가 단순 지시 반영을 넘어서, 무엇을 어떻게 고쳤고 왜 그렇게 고쳤는지, 학습자에게 어떤 효과가 있는지 누적 기록하기 위한 파일이다.

## 2026-05-27 — SQLD 2과목 과밀 step 1차 세분화

### 사용자가 발견한 문제

- SQLD 시험은 2과목 비중과 난도가 큰데, 현재 QuestDP의 2과목 설명은 한 step 안에 너무 많은 개념이 몰려 있었다.
- `SQL 4명령군`, `서브쿼리`, `TOP N과 응용`, `DML 3총사`처럼 초보자가 어려워하는 구간이 한 화면에서 여러 개념을 동시에 요구했다.
- 처음 보는 사용자는 “지금 무엇을 배우는 중인지”를 잃고, 시험 요약표를 읽는 느낌을 받을 수 있다.

### 수정한 방향

- 새 문제 ID를 만들지 않고, 이미 서버에 존재하는 `quizId`/`extraQuizIds`를 재배치해 Supabase 누락 위험을 피했다.
- `sqld-2-1-s1`을 `SQL 명령군이란` → `DDL` → `DML·DCL·TCL`로 분리했다.
- `sqld-2-2-s4`를 `서브쿼리 반환 형태`와 `서브쿼리 위치`로 분리했다.
- `sqld-2-2-s11`을 `TOP N`, `비율 함수`, `계층형 질의`, `PIVOT과 UNPIVOT`으로 분리했다.
- `sqld-2-3-s1`을 `DML이란`, `INSERT`, `UPDATE와 DELETE`로 분리했다.
- 각 분리 step은 “전체 그림 → 한 개념 설명 → 바로 확인 문제” 흐름이 되도록 했다.

### 사용자에게 주는 좋은 영향

- SQLD 2과목의 첫 진입부와 고난도 구간이 더 작고 명확한 학습 단위가 된다.
- 사용자는 명령어와 문법을 암기하기 전에 “이 명령이 무엇을 건드리는지”, “서브쿼리는 결과 모양인지 위치인지”, “TOP N과 계층형/PIVOT이 서로 다른 개념인지”를 구분할 수 있다.
- 한 step에서 개념을 과하게 먹이는 느낌이 줄어 모바일 학습 이탈 가능성이 낮아진다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`
- `src/data/gameModes.ts`
- `src/data/lessons/lessons.integration.test.ts`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 `quizId` 또는 `extraQuizIds`를 만들지 않았다.
- 기존 로컬 문제 ID만 재배치했으므로 Supabase `public.questions` 신규 upsert는 필요하지 않다.
- 문제 문항, 선택지, 정답, 해설 JSON은 변경하지 않았다.

## 2026-05-27 — SQLD 2과목 말투와 관리 구문 설명 흐름 정리

### 사용자가 발견한 문제

- SQLD 2과목, 특히 `관리 구문` 파트가 “DML. 데이터 자체를 다루는 명령들.”, “INSERT: 새 행 추가.”처럼 요약 노트 말투로 남아 있었다.
- SQLD를 처음 보는 사용자는 DML, INSERT, TCL, DCL 같은 약어를 바로 이해하기 어렵다.
- 명령어 이름과 짧은 정의만 나오면 “무엇을 하는 구문인지”보다 암기표처럼 느껴져 이탈 가능성이 있다.

### 수정한 방향

- `sqld-2-3` 관리 구문 전체에서 DML, MERGE, TCL, AUTOCOMMIT, CREATE TABLE, ALTER/DROP/TRUNCATE, 제약조건, DCL의 첫 설명을 초보자용 문장으로 풀었다.
- 약어는 처음 등장할 때 `Data Manipulation Language`, `Transaction Control Language`, `Data Control Language`처럼 전체 명칭을 먼저 보여주고 한국어 의미를 붙였다.
- `INSERT: 새 행 추가` 같은 압축 표현을 `INSERT는 테이블에 새 행을 추가하는 구문`처럼 자연스러운 설명으로 바꿨다.
- SQLD 2과목 전체에서 `문법:`, `3종:`, `4가지:`, 짧은 콜론식 정의, `정의 문제`, `매칭 문제` 같은 요약 노트 느낌의 표현을 추가로 점검하고 주요 구간을 풀어썼다.

### 사용자에게 주는 좋은 영향

- SQL을 처음 보는 사용자가 명령어를 외우기 전에 “왜 쓰는 구문인지”를 먼저 이해할 수 있다.
- 관리 구문 파트가 SQLD 1과목에서 만든 친절한 설명 톤과 더 가까워진다.
- 문제를 풀기 전에 필요한 용어와 상황 설명이 먼저 나오므로 “앞 설명 없이 문제가 나온다”는 느낌이 줄어든다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 `quizId` 또는 `extraQuizIds`를 추가하지 않았다.
- 문제 문항, 선택지, 정답, 해설 JSON을 바꾸지 않았으므로 Supabase `public.questions` 동기화는 필요하지 않다.

## 2026-05-27 — ADSP 2과목 What x How 도식 사분면화

### 사용자가 발견한 문제

- `분석 4유형` 그림이 What/How 2축 개념임에도 리스트형 카드 4개로 표시되어 있었다.
- 사용자는 “풀 것이 무엇인지 안다/모른다”, “방법을 안다/모른다”를 사각형 사분면 안에 배치하는 방식이 더 정확하다고 지적했다.

### 수정한 방향

- `analysisTypes` 도식을 2x2 사분면으로 바꿨다.
- 위쪽 축은 `방법을 안다 / 방법을 모른다`, 왼쪽 축은 `풀 것이 무엇인지 안다 / 모른다`로 두었다.
- 각 칸에 `Optimization`, `Solution`, `Insight`, `Discovery`가 들어가게 하여 문제와 방법의 확실성 조합이 바로 보이게 했다.
- 하위 step에서는 기존처럼 현재 배우는 칸만 밝게 켜지는 구조를 유지했다.

### 사용자에게 주는 좋은 영향

- 분석 4유형이 단순 암기 목록이 아니라 What x How 조합이라는 것을 한눈에 이해할 수 있다.
- 이후 문제에서 What/How 조건을 보고 어느 유형인지 고르는 판단 속도가 빨라진다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 문제 ID를 추가하지 않았다.
- 문제 문항, 정답, 해설 JSON을 바꾸지 않았으므로 Supabase `public.questions` 동기화는 필요하지 않다.

## 2026-05-27 — ADSP 2·3과목 문제 타이밍과 말투 1차 정리

### 사용자가 발견한 문제

- ADSP 2·3과목은 문제 수와 범위는 갖춰졌지만, 일부 구간에서 개념을 충분히 풀어주기 전에 바로 정의·매칭 문제가 나오는 느낌이 있었다.
- `시험 키워드`, `정의 문제`, `매칭 문제`, `시험에서 뚫림` 같은 표현이 남아 있어 SQLD 1과목을 수정하며 만든 친절한 말투와 다르게 느껴졌다.
- 결측값, 확률분포, 가설검정, 회귀 4가정, R 자료구조, 군집처럼 초보자에게 추상적인 파트는 문제 직전의 “왜 이걸 배우는지” 설명이 더 필요했다.

### 수정한 방향

- 새 `quizId`나 `extraQuizIds`를 만들지 않고 기존 문제 연결은 그대로 유지했다.
- ADSP 2과목의 거버넌스·타당성·준비도 구간에서 `시험 키워드` 제목을 `구분 팁`으로 바꾸고, 문제 직전 문구를 “무엇을 구분해야 하는지” 중심으로 다듬었다.
- ADSP 3과목에는 문제 전에 이해할 수 있도록 결측값, 확률분포, 가설검정 5용어, 회귀 4가정, R 자료구조, 군집 개요에 초보자용 연결 설명과 표를 추가했다.
- `정의 문제!`, `매칭 문제!` 같은 딱딱한 안내를 “방금 배운 뜻을 확인해보자”, “어떤 기준으로 묶는지 확인해보자”처럼 사용자가 해야 할 행동이 보이는 말로 바꿨다.
- 복습 안내의 `시험 함정` 표현은 `헷갈렸던 구분` 중심으로 조정해 압박감보다 정리감을 주게 했다.

### 사용자에게 주는 좋은 영향

- 처음 보는 사용자가 “왜 갑자기 이 문제가 나오지?”라고 느끼는 구간을 줄인다.
- 문제 풀이가 암기 테스트가 아니라 방금 배운 개념 확인처럼 느껴져 이탈 가능성이 낮아진다.
- ADSP 2·3과목의 말투가 SQLD 1과목 개선 방향과 더 가까워져 앱 전체 톤이 통일된다.

### 반영 파일

- `src/data/lessons/adsp/ch2.ts`
- `src/data/lessons/adsp/ch3.ts`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 문제 ID를 추가하지 않았다.
- 문제 문항, 정답, 해설 JSON을 바꾸지 않았으므로 Supabase `public.questions` 동기화는 필요하지 않다.

## 2026-05-27 — ADSP 2과목 데이터 분석 기획 도식 추가

### 사용자가 발견한 문제

- ADSP 1과목과 SQLD 1과목에는 주요 개념을 그림으로 이해시키는 흐름이 생겼지만, ADSP 2과목 `데이터 분석 기획`은 아직 텍스트 중심이라 추상적인 기획 용어가 한 번에 들어왔다.
- `분석 4유형`, `KDD/CRISP-DM`, `하향식 접근`, `분석 방법론`, `우선순위`, `거버넌스`, `성숙도`, `준비도` 같은 개념은 초보자가 문장만 보면 암기 목록처럼 느낄 수 있다.

### 수정한 방향

- 새 문제 ID를 만들지 않고 기존 step id 기반으로 CSS-native 도식을 붙였다.
- `adsp-2-1`에는 `What x How 4유형`, `KDD/CRISP-DM 단계`, `탐정해타 하향식 흐름`, `분석 방법론 5종` 도식을 추가했다.
- `adsp-2-2`에는 `시급성 x 난이도 우선순위 매트릭스`, `분석 거버넌스 5축`, `도활확최 성숙도 계단`, `원조프 데이터 거버넌스` 도식을 추가했다.
- `adsp-2-3`에는 `타당성 3요소`, `하향식/상향식/디자인 씽킹 연결`, `분석 과제 정의서`, `분석 준비도 6영역` 도식을 추가했다.
- 하위 step에서는 전체 그림을 유지하되 현재 배우는 카드만 밝게 켜지게 하여, 사용자가 “지금 무엇을 보고 있는지”를 놓치지 않게 했다.

### 사용자에게 주는 좋은 영향

- ADSP 2과목의 추상적인 기획 개념을 목록 암기 대신 구조로 이해할 수 있다.
- 모바일에서 긴 설명을 읽기 전에 그림으로 방향을 잡을 수 있어 이탈 가능성을 줄인다.
- 새 quiz/Supabase 변경 없이 시각 이해도만 높여 서버 예약·XP·진행도 흐름을 흔들지 않는다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 `quizId` 또는 `extraQuizIds`를 추가하지 않았다.
- 문제 문항, 정답, 해설을 바꾸지 않았으므로 Supabase `public.questions` 동기화는 필요하지 않다.

## 2026-05-27 — ADSP 1과목 핵심 개념 도식 1차 추가

### 사용자가 발견한 문제

- SQLD 1과목에서는 주요 개념을 그림으로 풀어 설명하면서 초보자 이해도가 좋아졌지만, ADSP 1과목은 첫 노드부터 텍스트 중심이라 첫인상이 약했다.
- 특히 `DIKW`, 데이터 분류, SECI, DB 특징, DW/Data Lake, OLTP/OLAP, 기업 데이터베이스, 빅데이터 3V/변화는 추상어나 약어가 많아 처음 보는 사용자가 글만 읽으면 암기식 콘텐츠처럼 느낄 수 있었다.

### 수정한 방향

- 새 문제 ID를 추가하지 않고 기존 step id 기반으로 CSS-native 도식을 붙였다.
- `adsp-1-1-s1`에는 DIKW 피라미드를 추가해 `데이터 → 정보 → 지식 → 지혜` 순서와 `양 많음/가치 높음` 축을 한눈에 보이게 했다.
- `DIKW 피라미드 개요`의 축 라벨은 상단/하단에 가로로 놓으면 방향성이 약하므로, 왼쪽에는 가치 축(`가치 낮음 → 가치 높음`), 오른쪽에는 양 축(`양 많음 → 양 적음`)을 세로로 배치했다.
- `adsp-1-1-s2`, `adsp-1-1-s3`, `adsp-1-1-s4`, `adsp-1-1-s4-dw`, `adsp-1-1-s4-lake`, `adsp-1-1-s4-olap`, `adsp-1-1-s4-oltp`, `adsp-1-1-s5`, `adsp-1-2-s1-3v`, `adsp-1-2-s2`에 모바일 중심 도식을 추가했다.
- `DW (Data Warehouse)` 첫 설명에는 DW/Data Lake 비교를 바로 보여주지 않고, `POS·ERP·CRM처럼 흩어진 데이터 → 정리된 분석 창고 DW → 보고서/의사결정` 흐름만 보여주는 전용 도식으로 분리했다. DW/Data Lake 비교 도식은 Data Lake 단계에서 정리용으로 유지했다.
- `DM (Data Mart)`에는 `DW 전체 창고 → 필요한 부분만 → 마케팅/재무/인사 DM` 흐름을 보여주는 전용 도식을 추가했다. DM 목적 step에서는 부서별 빠른 분석을, DM 유형 step에서는 종속형/독립형 구분을 함께 볼 수 있게 했다.
- `Data Lake`에는 `표 데이터·로그·사진/영상·SNS 글 → 원본 그대로 먼저 저장 → 원시 데이터 호수` 흐름의 전용 도식을 추가했다. 목적 step에서는 ML 학습·로그 탐색·SNS 분석으로 나중에 꺼내 쓰는 그림을, 특징 step에서는 Schema-on-Read·모든 형태 원시·대규모 분산 저장·Data Swamp 위험을 카드로 보여주게 했다.
- `OLAP` 첫 설명에는 OLTP 비교표를 바로 보여주지 않고, `지역·시기·상품` 축으로 매출을 여러 각도로 보는 OLAP 전용 도식을 붙였다. `OLTP` 첫 설명에는 주문→결제→재고 반영 흐름을 보여주는 거래 처리 도식을 붙였고, OLTP/OLAP 비교 도식은 `OLTP 특징` 단계에서 정리용으로만 나오게 했다.
- `기업 데이터베이스` 도식은 전체 DBMS·ERP·CRM·SCM·KMS·BI·BA 지도를 유지하되, 각 하위 개념 step에서는 지금 배우는 시스템 카드만 은은하게 켜지도록 바꿨다. 한 번에 많은 약어가 보여도 현재 초점이 어디인지 알 수 있게 하기 위한 조정이다.
- `빅데이터 출현 배경`에는 저장·병렬·인터넷·클라우드·IoT/모바일 5요인이 순서대로 켜지는 도식을 추가했다. 한 step 안에 여러 요인이 나오므로 대화 순서에 맞춰 현재 설명 중인 요인만 강조한다.
- `빅데이터 3V` 도식도 전체 Volume·Variety·Velocity 지도를 유지하되, `Volume`, `Variety`, `Velocity` 하위 step에 들어가면 해당 V만 켜지게 조정했다. 사용자가 여러 V를 한 번에 외우기보다 지금 보는 기준을 먼저 잡게 하기 위한 변경이다.
- `가치 창조를 위한 데이터 사이언스` 파트에는 `핵심 3축`, `Hard Skill vs Soft Skill`, `Digital CAMERA 6역량` 전용 도식을 추가했다. 3축은 Analytics·IT·Business의 교집합으로, Hard/Soft는 기술과 태도·소통의 좌우 비교로, CAMERA는 전체 6역량 지도를 유지하되 각 하위 step에서 현재 배우는 역량만 켜지는 방식으로 구성했다.
- 도식이 나오는 동안 하단 group trail이 화면을 밀어내지 않도록 숨김 조건에 ADSP 도식 모드를 포함했다.
- `암묵지 · 형식지` 단계는 SECI 순환도가 아니라 암묵지/형식지의 차이 자체를 먼저 보여줘야 하므로, `몸 안의 노하우`와 `밖으로 정리된 문서` 비교 그림으로 분리했다. SECI 순환도는 `SECI 4단계` step에서만 보이게 했다.
- `SECI ① 공동화` 단계는 공표연내 암기 순환도가 아니라 `선배가 악기 연주 감각을 옆에서 보여주고 후배가 따라 배우는` 암묵지→암묵지 장면으로 따로 그렸다. 매뉴얼이 등장하면 표출화이고, 문서 없이 직접 보고 배우면 공동화라는 시험 구분점을 함께 넣었다.

### 사용자에게 주는 좋은 영향

- 첫 노드에서 바로 “글 많은 요약집”이 아니라 “그림으로 이해하는 학습 앱”이라는 인상을 준다.
- 약어와 추상 분류를 보기 전에 구조를 먼저 보게 되어, 문제 풀이 전에 개념을 더 안정적으로 잡을 수 있다.
- 새 quiz/Supabase 변경 없이 UI 이해도만 높여 서버 예약·XP·진행도 흐름을 흔들지 않는다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 `quizId` 또는 `extraQuizIds`를 추가하지 않았다.
- 문제 문항, 정답, 해설을 바꾸지 않았으므로 Supabase `public.questions` 동기화는 필요하지 않다.

## 2026-05-27 — SQLD Part 2 함수 종속~식별자 선택 시각 보강

### 사용자가 발견한 문제

- `함수적 종속`, `정규형`, `반정규화`, `특수 관계`, `트랜잭션`, `NULL`, `본질/인조식별자` 흐름은 맞지만 초보자에게 추상적으로 보일 수 있었다.
- 특히 `2NF/3NF/BCNF`, `격리수준`, `NULL 산술`, `인조 PK + 본질 값 UNIQUE`는 말만으로 이해하기 어렵고 문제 타이밍도 그림 뒤에 오는 편이 더 자연스럽다.

### 수정한 방향

- 기존 step id와 `quizId`는 유지했다.
- 함수 종속 설명에 `정규화에서 테이블을 나눌 근거`라는 연결 문장을 추가했다.
- 함수 종속 그림의 영어 라벨을 `전체 필요`, `일부만`, `중간 경유`처럼 직관적으로 바꿨다.
- 정규형에는 `1NF → 2NF → 3NF → BCNF` 로드맵과 각 단계별 그림을 추가했다.
- 반정규화에는 `안전하게 나누기 vs 빠르게 읽기`, 방법, 대가 그림을 추가했다.
- 특수 관계, 트랜잭션, ACID, 격리수준, NULL, 식별자 선택에도 모바일에서 바로 읽히는 CSS 그림을 추가했다.
- 기존 ACID 문제는 4특성을 모두 구분하게 바꿨고, 기존 NULL 비교 문제는 `IS NULL`과 `NULL + 1 = NULL`을 함께 묻도록 바꿨다.

### 사용자에게 주는 좋은 영향

- 학습자는 추상 용어를 외우기 전에 “표가 어떻게 나뉘고, 값이 어떻게 결정되고, 무엇이 위험한지”를 그림으로 먼저 본다.
- 문제는 그림과 바로 이어져서 방금 본 개념을 확인하는 역할을 한다.
- 새 문제 ID를 늘리지 않아 진행도와 서버 예약 흐름이 흔들릴 가능성을 줄였다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`
- `src/data/reminders.ts`
- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 문제 ID는 추가하지 않았다.
- 기존 문제 `sqld-1-2-cp-06-acid`, `sqld-1-2-cp-07-compare`의 문항/정답/해설을 바꿨다.
- `supabase/migrations/0067_update_sqld_part2_visual_drills.sql`에 서버 동기화 SQL을 추가했다.
- 작업 시점에 Supabase MCP가 handshake timeout으로 직접 실행되지 않아, 라이브 DB 적용 여부는 배포/마이그레이션 적용 단계에서 확인해야 한다.

## 2026-05-26 — SQLD 정규화 시작 흐름과 키·무결성 설명 보강

### 사용자가 발견한 문제

- SQLD `데이터 모델과 성능` Part가 정규화 범위인데도, QuestDP에서는 `이상 현상`부터 갑자기 시작해 정규화의 큰 맥락이 부족했다.
- `키 5종`, `무결성 3종`, `PK와 UNIQUE 차이` 설명이 짧아 초보자가 왜 구분해야 하는지 이해하기 어려웠다.

### 수정한 방향

- `sqld-1-2-s1`의 ID는 유지하고 제목과 설명을 `정규화가 필요한 이유`로 바꿨다.
- 이상 현상은 독립 주제가 아니라 `정규화를 해야 하는 이유`로 배치했다.
- 첫 그림을 `섞인 테이블 → 정규화 → 학생/수강/과목 테이블` 구조로 바꿔 정규화 흐름을 먼저 보이게 했다.
- `키 5종`은 `유일한가 / 대표로 골랐나 / 다른 표와 연결하나` 기준으로 재설명하고 그림을 추가했다.
- `무결성 3종`은 `PK 규칙 / FK 연결 규칙 / 값 범위 규칙`으로 그림화했다.
- `PK와 UNIQUE 차이`는 Oracle/SQLD 기준으로 `PK = UNIQUE + NOT NULL + 대표 키`, `UNIQUE = 중복 방지 제약, NULL 허용 가능, 여러 개 가능`으로 정리했다.

### 사용자에게 주는 좋은 영향

- 사용자는 Part 2를 “이상 현상 암기”가 아니라 “정규화가 왜 필요한지”로 시작한다.
- 키와 무결성을 용어 목록이 아니라 표 안에서 맡는 역할과 제약으로 이해할 수 있다.
- PK와 UNIQUE를 단순히 “둘 다 중복 금지”로 뭉개지 않고 시험에서 자주 나오는 차이로 구분할 수 있다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/reminders.ts`
- `src/game/lesson/DialogueLesson.tsx`
- `src/game/lesson/GlossaryKeyword.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 새 문제 ID를 추가하지 않았다.
- 기존 `quizId`는 유지했고 문제 문항/정답 JSON도 변경하지 않았다. `public.questions` 동기화는 필요하지 않다.

## 2026-05-27 — SQLD 이상 현상 그림을 정규화 교재 흐름에 맞게 보정

### 사용자가 발견한 문제

- 사용자가 배운 이상 현상 정의는 `삽입 시 의도하지 않은 값 삽입`, `삭제 시 의도하지 않은 값 삭제`, `일부 갱신으로 모순 발생`인데, 기존 그림은 학과 예시로 풀려 있어 첨부한 `학생 과목 테이블 → 정규화` 그림과 결이 조금 달랐다.
- 이후 검토에서 첫 문장을 너무 앱식으로 풀어쓴 표현보다 시험식 정의에 맞추는 편이 낫다고 판단했다.

### 수정한 방향

- 삽입 이상 첫 문장을 `데이터를 삽입할 때 의도하지 않은 값까지 함께 삽입되는 현상`으로 맞췄다.
- 삭제 이상 첫 문장을 `데이터를 삭제할 때 의도하지 않은 정보까지 함께 삭제되는 현상`으로 맞췄다.
- 갱신 이상 첫 문장을 `일부 데이터만 갱신되어 모순이 발생하는 현상`으로 맞췄다.
- 삽입 이상은 `105번 휴학생 삽입 → 과목명/교수명 NULL까지 함께 삽입` 예시로 정리했다.
- 삭제 이상은 `장보고 행 삭제 → 경제 과목/박OO 교수 정보도 함께 사라짐` 예시로 정리했다.
- 갱신 이상은 `수학 교수명 일부 행만 바뀜 → 같은 수학 과목인데 교수명이 서로 다름` 예시로 정리했다.
- 정규화 그림의 섞인 테이블도 `학번 / 이름 / 과목명 / 교수명` 구조로 바꾸고, 정규화 후 `학생 / 수강 / 과목` 테이블로 나뉘는 흐름을 유지했다.

### 사용자에게 주는 좋은 영향

- 학습자는 교재에서 자주 보는 `학생 과목 테이블` 예시와 QuestDP 화면을 바로 연결할 수 있다.
- 삽입/삭제/갱신 이상을 각각 “무슨 작업을 하다가 어떤 의도치 않은 부작용이 생기는지”로 이해한다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 문제 ID와 문제 JSON은 변경하지 않았다. `public.questions` 동기화는 필요하지 않다.

## 2026-05-26 — SQLD 식별자 vs 비식별자 비교 설명 완화

### 사용자가 발견한 문제

- `식별자 vs 비식별자 비교` step이 너무 어렵게 느껴졌다.
- 기존 설명은 `부모 식별자`, `자식 PK`, `FK`, `실선/점선` 같은 결론을 빠르게 말해서, 처음 보는 사용자가 머릿속에 예시를 만들기 전에 부담을 느낄 수 있었다.

### 수정한 방향

- 대사를 `자식의 대표 이름표(PK) 안에 부모 키가 들어갔는지`라는 한 기준으로 다시 풀었다.
- `수강신청` 예시는 `학번+과목코드`가 자식 PK 안에 들어가는 식별자 관계로 설명했다.
- `주문` 예시는 `주문ID`가 자식 PK이고 `고객ID`는 FK로만 남는 비식별자 관계로 설명했다.
- 비교 그림도 `PK 안/PK 밖` 두 줄 요약에서, 부모/자식 카드가 나란히 보이고 자식 카드 안에 어떤 값이 PK인지 바로 보이는 구조로 강화했다.

### 사용자에게 주는 좋은 영향

- 사용자는 관계 이름을 외우기 전에 “부모 키가 자식 PK 안에 있나?”라는 판단 기준을 먼저 잡을 수 있다.
- 이후 문제에서 실선/점선, 강한/약한 연결, 생명주기 표현이 나와도 같은 그림 기준으로 다시 연결할 수 있다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 문제 문항/정답 데이터는 변경하지 않았다. `public.questions` 동기화는 필요하지 않다.

## 2026-05-26 — SQLD 속성 모양 분류와 역할 분류 그림 설명 추가

### 사용자가 발견한 문제

- `단일 속성`, `복합 속성`, `다중값 속성`과 `PK 속성`, `FK 속성`, `일반 속성`도 앞선 속성 분류처럼 그림으로 풀어야 한다.
- 글 설명만 있으면 어떤 기준으로 나누는지 흐려지고, 특히 `분해 가능 여부/값 개수`와 `테이블 안에서의 역할`이 섞여 보일 수 있다.

### 수정한 방향

- `단일/복합/다중값`에는 `값의 모양으로 보기` 그림을 추가했다.
  - 단일 속성: `학번 → 2026001`처럼 한 칸으로 충분한 값
  - 복합 속성: `주소 → 시/구/도로명/상세`처럼 필요하면 쪼갤 수 있는 값
  - 다중값 속성: `이메일 → 개인/학교/회사 메일`처럼 같은 종류가 여러 개 나올 수 있는 값
- `PK/FK/일반`에는 `속성의 역할` 그림을 추가했다.
  - PK: 학생 표에서 한 행을 찾는 대표 이름표
  - FK: 학생 표의 학과ID가 학과 표를 가리키는 연결 고리
  - 일반 속성: 이름/생년월일처럼 대상을 설명하는 정보

### 사용자에게 주는 좋은 영향

- 학습자는 속성 분류를 “외울 목록”이 아니라 “기준이 다른 분류”로 이해할 수 있다.
- 이후 식별자, 관계, 정규화 파트에서 PK/FK가 다시 나와도 이미 그림으로 본 연결 감각을 재사용할 수 있다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 문제 문항/정답 데이터는 변경하지 않았다. `public.questions` 동기화는 필요하지 않다.

## 2026-05-26 — SQLD 속성 기초와 특성 분류 그림 설명 추가

### 사용자가 발견한 문제

- `속성이란 무엇인가 → 특성에 따른 분류 → 기본/설계/파생 속성` 흐름이 글로만 이어져, 초보자가 “속성은 무엇이고, 왜 3가지로 나누는지”를 한눈에 잡기 어려웠다.

### 수정한 방향

- `속성이란 무엇인가` step에는 `학생 엔터티 → 학번/이름/학과` 카드 그림을 넣어, 속성이 엔터티를 설명하는 작은 정보 칸이라는 감각을 먼저 보여줬다.
- `기본 속성`, `설계 속성`, `파생 속성` step에는 각각 `현실 업무에 원래 있던 값`, `시스템이 관리하려고 만든 값`, `다른 값으로 계산한 값`을 비교하는 그림 카드를 추가했다.
- 예시는 `이름·생년월일·주소`, `회원ID·주문번호`, `나이·총점·평균`처럼 초보자가 바로 이해할 수 있는 말로 구성했다.

### 사용자에게 주는 좋은 영향

- 사용자는 속성을 “DB 표의 어려운 용어”가 아니라 “대상을 설명하는 정보 칸”으로 먼저 이해할 수 있다.
- 기본/설계/파생의 구분 기준이 시각적으로 남아, 뒤에서 속성 분류 문제가 나와도 암기보다 판단으로 풀 가능성이 높아진다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 문제 문항/정답 데이터는 변경하지 않았다. `public.questions` 동기화는 필요하지 않다.

## 2026-05-26 — SQLD 상관 관점 그림 설명 추가

### 사용자가 발견한 문제

- 모델링의 3가지 관점 중 `상관 관점`은 CRUD라는 낯선 축약어가 나오기 때문에, 글 설명만으로는 “프로세스와 데이터가 만나는 지점”이라는 감각이 약했다.

### 수정한 방향

- `상관 관점` step에 `수강신청 버튼 → 학생/과목/수강 기록 데이터`가 연결되는 그림을 추가했다.
- CRUD를 SQL 표나 엔터티 형식으로 딱딱하게 보여주지 않고, `학생 정보 확인`, `과목 정보 확인`, `수강 기록 생성`, `남은 자리 변경`처럼 실제 업무에서 데이터가 움직이는 말로 풀었다.
- Delete는 취소 기능이 있을 때 함께 떠올리도록 보조 설명으로 남겼다. 처음부터 4가지를 한 번에 외우게 하기보다, 상관 관점의 의미를 먼저 잡는 방향이다.

### 사용자에게 주는 좋은 영향

- 초보자가 CRUD를 “영어 암기”가 아니라 “업무가 데이터를 움직이는 방식”으로 받아들일 수 있다.
- 데이터 관점, 프로세스 관점, 상관 관점의 차이가 더 분명해져 이후 CRUD 매트릭스나 트랜잭션 흐름을 배울 때 부담이 줄어든다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 문제 문항/정답 데이터는 변경하지 않았다. `public.questions` 동기화는 필요하지 않다.

## 2026-05-26 — SQLD 모델링 초반 핵심 개념 그림 보강 + 프로모 코드 본인 해지

### 사용자가 발견한 문제

- `도배설명차선`의 엔터티 배치 설명은 말로만 되어 있어, 핵심 엔터티를 왼쪽 상단에 둔다는 시험 포인트가 눈에 잘 남지 않았다.
- `단추명`, `명확화`, `프로세스 관점`, `개논물`, `함수적 종속`은 글 설명은 좋아졌지만 “그림을 보고 바로 이해하는” QuestDP식 장점이 더 필요했다.
- 사용자가 직접 등록한 프로모션 코드를 해지할 수 없어, 베타 권한을 스스로 원복할 운영 UX가 부족했다.

### 수정한 방향

- `단추명`은 `단순화 → 추상화 → 명확화`를 말로만 나열하지 않고, 각각 `복잡함 → 읽기 쉬움`, `불필요한 정보 → 핵심`, `날짜 → 수강신청일`처럼 그림형 카드로 보여주게 했다.
- `명확화` 단계에는 수강신청과 과목이 명확한 속성명으로 연결되는 ERD 느낌의 작은 그림을 추가했다.
- `프로세스 관점`은 `강의 조회 → 과목 선택 → 신청 확인 → 완료` 흐름도로 보여주어, 데이터 대상이 아니라 업무 순서를 보는 관점임을 강조했다.
- `개논물`은 `개념적 → 논리적 → 물리적`을 단계 카드로 보여주고, 논리적 모델링에서 키·관계·함수적 종속 같은 의존성을 정리한다는 연결을 넣었다.
- 함수적 종속 계열에는 `학번 → 이름`, `학번+과목코드 → 성적`, `학번 → 학과코드 → 학과명` 같은 의존성 그림을 추가했다.
- `도배설명차선`에는 엑셀 표처럼 핵심 엔터티가 왼쪽 상단에 놓이는 배치 감각 그림을 추가했다.
- 프로모션 코드는 `revoke_my_redemption_grant` RPC를 추가하고, `#/redeem`의 내 premium 이력에서 본인이 사용한 활성 초대 코드만 직접 해지할 수 있게 했다.

### 사용자에게 주는 좋은 영향

- 초보자는 시험 단어를 암기하기 전에 “무엇을 어떻게 보라는 뜻인지”를 시각적으로 이해할 수 있다.
- 모델링 초반의 추상어가 그림과 연결되어 첫 단원 이탈 가능성이 줄어든다.
- 베타/쿠폰 운영 중 사용자가 자신의 프로모션 권한을 직접 원복할 수 있어 운영 문의 부담이 줄고, 권한 상태도 서버 기준으로 정리된다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/redemption.ts`
- `src/pages/RedeemPage.tsx`
- `supabase/migrations/0066_self_revoke_redemption_grant.sql`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 신규 RPC가 필요하므로 `0066_self_revoke_redemption_grant.sql` 마이그레이션을 추가했다.
- 문제 문항/정답 데이터는 변경하지 않았으므로 `public.questions` 동기화는 필요하지 않다.

## 2026-05-26 — SQLD 이상 현상 첫 확인 문제 흐름 수정

### 사용자가 발견한 문제

- `이상 현상이란` 첫 개념 뒤에 바로 `이상 현상 3종에 해당하지 않는 것`을 묻고 있었다.
- 삽입 이상, 삭제 이상, 갱신 이상은 뒤에서 하나씩 설명할 예정인데, 첫 문제에서 세부 유형을 먼저 맞히게 해 초보자 흐름이 어색했다.

### 수정한 방향

- 첫 카드의 마지막 대사를 `세부 유형은 바로 다음 카드에서 하나씩 볼 거야. 먼저 왜 생기는지부터 잡아보자.`로 바꿨다.
- 첫 개념 블록은 `이상 현상 3종` 나열보다 `중복이 문제를 만든다`는 원인 중심으로 바꿨다.
- `sqld-1-2-cp-01` 문제를 세부 유형 암기가 아니라 `한 표에 학생 정보와 학과 정보가 섞여 같은 학과명이 반복되는 상황`을 고르는 기본 원인 문제로 바꿨다.

### 사용자에게 주는 좋은 영향

- 처음 보는 사용자가 삽입·삭제·갱신 이상을 배우기 전에 억지로 세부 유형을 외우지 않아도 된다.
- `왜 이상 현상이 생기는지`를 먼저 이해한 뒤, 뒤 카드에서 삽입/삭제/갱신 이상을 자연스럽게 분리해서 학습한다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`
- `supabase/migrations/0065_update_sqld_anomaly_intro_drill.sql`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 서버 동기화를 위해 `0065_update_sqld_anomaly_intro_drill.sql` 마이그레이션을 추가했다.
- 대상 문제 ID: `sqld-1-2-cp-01`.
- 라이브 Supabase `public.questions`에도 같은 문항, 보기, 정답 인덱스, 해설을 upsert했고 반환값으로 반영을 확인했다.

## 2026-05-26 — SQLD 이상 현상 4단계 CSS 그림 추가

### 사용자가 발견한 문제

- `이상 현상이란`, `삽입 이상`, `삭제 이상`, `갱신 이상`은 초보자가 글만으로 이해하기 어렵다.
- 특히 어떤 표 구조가 잘못되어 어떤 사고가 생기는지 그림으로 보이지 않으면 “정의 암기”처럼 느껴질 수 있다.

### 수정한 방향

- `DialogueLesson`에 `AnomalyTableDiagram`을 추가했다.
- `이상 현상이란`에서는 학생, 학과, 수강과목이 한 표에 섞여 같은 학과명이 반복되는 모습을 보여준다.
- `삽입 이상`에서는 새 학과만 저장하고 싶은데 학생명/수강과목 칸까지 요구되는 상황을 보여준다.
- `삭제 이상`에서는 마지막 학생 행을 지웠더니 학과 정보까지 사라지는 상황을 보여준다.
- `갱신 이상`에서는 반복된 학과명 중 일부만 바뀌어 서로 다른 값이 남는 상황을 보여준다.

### 사용자에게 주는 좋은 영향

- 사용자는 삽입·삭제·갱신 이상을 단어로 외우기보다 “표가 어떻게 망가지는지”로 이해한다.
- 뒤의 정규화 개념으로 넘어갈 때, 왜 테이블을 나누어야 하는지 자연스럽게 받아들일 수 있다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 화면 시각화만 추가했다.
- 문제 문항, 선택지, 정답, 해설은 바꾸지 않았으므로 Supabase 추가 반영은 필요하지 않다.

## 2026-05-26 — SQLD 2과목 초반 문제 품질 1차 개선

### 사용자가 발견한 문제

- SQLD 2과목 문제는 시험 포인트는 잡고 있지만, 처음 가입한 사용자가 보기에는 객관식 문제집 느낌이 아직 강하다.
- 첫 문제부터 `옳지 않은 것은?`, `DROP`, `TRUNCATE` 같은 함정이 나와 초보자가 부담을 느낄 수 있다.
- SQL 해석/순서 조립 문제는 좋지만 정답 위치가 앞쪽에 몰려 찍기 패턴이 생길 수 있다.

### 수정한 방향

- `SQL 4명령군` 첫 확인 문제를 부정형 함정에서 `CREATE TABLE은 어떤 명령군인가?` 형태의 쉬운 역할 매칭 문제로 바꿨다.
- `관계대수` 첫 확인 문제를 `두 릴레이션에 모두 존재하는 튜플` 같은 어려운 표현보다 `WHERE와 가까운 연산`으로 바꿨다.
- `ALIAS` 첫 확인 문제를 `옳지 않은 것은?`에서 별칭의 역할을 묻는 이해형 문제로 바꿨다.
- SQL 해석/순서 조립 드릴 일부의 보기 순서를 바꿔 정답 위치 편향을 줄였다.
- 레슨 대사도 “함정 암기”보다 `SQL은 DB에 부탁하는 말`, `역할별 명령군` 흐름으로 부드럽게 수정했다.

### 사용자에게 주는 좋은 영향

- SQLD 2과목 첫 진입자가 “처음부터 함정 문제를 맞혀야 한다”는 부담을 덜 느낀다.
- 쉬운 역할 매칭 뒤에 해석·순서 조립·시험 함정으로 이어져 학습 난이도가 자연스럽게 올라간다.
- 정답 위치 편향이 줄어들어 문제 풀이가 찍기보다 이해 기반으로 흐른다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`
- `src/data/questions/sqld/concept-practice.json`
- `src/data/questions/sqld/sql-interpretation-drills.json`
- `src/data/questions/sqld/sql-interactive-drills.json`
- `supabase/migrations/0064_update_sqld_ch2_beginner_drills.sql`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 수정된 문제 ID: `sqld-2-1-cp-01`, `sqld-2-1-cp-02`, `sqld-2-1-cp-03`, `sqld-2-1-cp-04`, `sqld-sql-lab-001`, `sqld-sql-lab-002`, `sqld-sql-lab-003`, `sqld-sql-order-001`, `sqld-sql-order-002`.
- 서버 동기화를 위해 `0064_update_sqld_ch2_beginner_drills.sql` 마이그레이션을 추가했다.
- 라이브 Supabase `public.questions`에도 동일 ID 9개를 upsert했고, 대조 쿼리로 문항·보기·정답 인덱스 반영을 확인했다.

## 2026-05-25 — SQLD 첫 단원 데이터 모델링 CSS 그림 추가

### 사용자가 발견한 문제

- 신규 가입자가 첫 단원에서 문제를 풀 때 “와, 이거 대박이다”라고 느낄 만한 시각적 장치가 필요하다.
- 첫 단원이 데이터 모델링이므로, 현실 세계의 정보를 DB 구조로 바꾸는 과정을 글이 아니라 그림으로 먼저 이해하게 해야 한다.

### 수정한 방향

- SQLD 첫 스텝 `데이터 모델링이란`에 DOM/CSS 기반 그림을 추가했다.
- 대사 진행에 따라 `현실 세계` → `MODELING` → `DB 구조`가 순서대로 강조되게 했다.
- 현실 세계는 학생, 과목, 교수, 시간표 카드로 보여주고, DB 구조는 학생, 수강, 과목 테이블 카드로 보여준다.
- 이 그림이 나오는 동안에는 하단 개념 진행 목록을 숨겨 첫 화면의 집중도를 높였다.

### 사용자에게 주는 좋은 영향

- 초보자는 데이터 모델링을 “어려운 정의”보다 “현실을 컴퓨터가 다룰 수 있는 구조로 정리하는 과정”으로 먼저 받아들인다.
- QuestDP가 단순 문제집이 아니라 시각적으로 이해시키는 게임형 학습앱이라는 첫인상을 준다.
- 첫 단원 초반 이탈 가능성을 줄이고, 뒤의 엔터티/속성/관계 설명으로 자연스럽게 이어진다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 문제 문항, 선택지, 정답, 해설은 바꾸지 않았다.
- 레슨 화면의 시각화 컴포넌트만 추가했으므로 Supabase `public.questions` upsert는 필요하지 않다.

## 2026-05-25 — SQLD 무결성 3종 설명 보강

### 사용자가 발견한 문제

- `무결성은 데이터가 틀어지지 않게 지키는 규칙`이라는 한 줄 설명만으로는 초보자가 무결성이 무엇인지 충분히 이해하기 어렵다.
- 개체 무결성, 참조 무결성, 도메인 무결성의 기준을 잡기 전에 바로 문제가 나와 학습 흐름이 급하다.

### 수정한 방향

- `무결성 3종` 스텝에 무결성의 의미를 먼저 설명하는 intro를 추가했다.
- 학생 DB 예시로 `학번이 비어 있음`, `없는 학번을 수강 기록이 참조함`, `학년 값이 범위를 벗어남`을 연결했다.
- `PK = 개체 무결성`, `FK = 참조 무결성`, `값 범위/형식 = 도메인 무결성`으로 시험에서 바로 떠올릴 수 있는 기준을 넣었다.
- `무결성`, `개체 무결성`, `참조 무결성`, `도메인 무결성` 클릭 설명을 추가했다.

### 사용자에게 주는 좋은 영향

- 사용자는 무결성을 추상적인 용어가 아니라 DB가 망가지지 않게 지키는 규칙으로 이해한다.
- 문제에서 FK가 나오면 참조 무결성으로 연결하는 기준이 생긴다.
- PK, FK, 값 범위가 각각 어떤 무결성과 연결되는지 기억하기 쉬워진다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/reminders.ts`
- `src/game/lesson/GlossaryKeyword.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 기존 문제 `sqld-1-1-cp-10-integrity`의 문항, 선택지, 정답, 해설은 바꾸지 않았다.
- 레슨 설명과 클릭 설명만 보강했으므로 Supabase `public.questions` upsert는 필요하지 않다.

## 2026-05-25 — SQLD 데이터 모델과 성능 Part 2 전체 재작성

### 사용자가 발견한 문제

- SQLD `Part 2 데이터 모델과 성능` 흐름이 압축 요약형에 가까워, 처음 보는 사용자가 정규화, 함수적 종속, 반정규화, 트랜잭션, NULL을 한 번에 받아들이기 어렵다.
- `step 44~48` 이후도 이전에 개선한 엔터티/관계/식별자 흐름처럼 개념을 쪼개고, 개념 직후 바로 확인 문제가 나와야 한다.
- 문제를 추가하거나 바꾸는 경우 로컬 JSON만 바꾸면 실제 플레이에서 서버 예약 실패가 날 수 있으므로 Supabase 동기화까지 필요하다.

### 수정한 방향

- `데이터 모델과 성능` lesson 전체를 `이상 현상 → 함수적 종속 → 정규형 → 반정규화 → 특수 관계 → 트랜잭션 → NULL → 식별자 선택` 순서로 재정리했다.
- 각 스텝을 짧은 대화, 쉬운 학교/서비스 예시, 표/암기 포인트, 즉시 확인 문제로 구성했다.
- `삽입/삭제/갱신 이상`, `완전/부분/이행 함수 종속`, `1NF/2NF/3NF/BCNF`, `반정규화 방법과 대가`, `ACID`, `격리수준`, `NULL 집계/정렬`, `본질식별자/인조식별자`의 문제 문항과 해설을 초보자 기준으로 다시 썼다.
- 정답 위치가 한쪽으로 몰리지 않도록 섞었다.
- 2회독 reminder도 새 설명 흐름에 맞게 갱신했다.

### 사용자에게 주는 좋은 영향

- 사용자는 Part 2를 암기 목록이 아니라 “왜 테이블을 나누고, 언제 다시 합치며, 트랜잭션과 NULL은 왜 조심해야 하는지” 흐름으로 이해할 수 있다.
- 어려운 용어가 나오기 전에 예시가 먼저 깔려 이탈 가능성이 줄어든다.
- 문제를 풀면서 방금 배운 개념을 바로 확인하므로 개념-문제 연결이 강화된다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`
- `src/data/reminders.ts`
- `supabase/migrations/0063_update_sqld_model_performance_part2.sql`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 라이브 Supabase `public.questions`에 29개 Part 2 문항을 upsert했다.
- 대상 29문항의 서버 누락은 `0`건이고, 샘플 문항의 `answer_index`, `choices`, `is_playable=true` 동기화를 확인했다.

## 2026-05-25 — SQLD 식별자 관계 / 비식별자 관계 설명 강화

### 사용자가 발견한 문제

- `예: 학생 + 과목이 모여 수강신청의 PK가 되는 경우`라는 설명만으로는 초보자가 왜 학생과 과목의 키가 수강신청 PK가 되는지 이해하기 어렵다.
- `식별자 관계의 특징을 골라보자` 문제 앞의 개념 설명이 너무 짧아, 사용자가 원리를 이해하기 전에 문제를 풀게 된다.
- 식별자 관계와 비식별자 관계는 SQLD에서 자주 출제되므로, 정확한 정보와 쉬운 그림이 모두 필요하다.

### 수정한 방향

- `식별자 관계` 스텝을 `부모 PK가 자식 PK 안으로 들어감`이라는 기준으로 다시 설명했다.
- 수강신청 예시를 시각화했다.
  - 부모: `학생(PK: 학번)`, `과목(PK: 과목코드)`
  - 자식: `수강신청(PK: 학번 + 과목코드)`
- `비식별자 관계` 스텝도 `자식은 자기 PK를 따로 가지고, 부모 키는 FK로만 둔다`는 흐름으로 보강했다.
- `비식별자 = 무조건 선택사항`으로 외우지 않도록, 선택/필수 여부와 PK 포함 여부를 구분하는 함정 설명을 넣었다.
- 기존 문제 3개를 그림과 설명에 맞게 다시 작성했다.
  - `sqld-1-1-cp-09`: 수강신청 PK 예시에서 식별자 관계 판단
  - `sqld-1-1-cp-09-nonident`: 주문ID/고객ID 예시에서 비식별자 관계 판단
  - `sqld-1-1-cp-09-compare`: 두 관계를 가르는 핵심 기준 확인

### 사용자에게 주는 좋은 영향

- 사용자는 식별자 관계를 단순 암기가 아니라 `부모 키가 자식 PK 안에 들어가는 그림`으로 이해한다.
- 비식별자 관계도 `부모 키는 FK로만 남고 자식 PK는 따로 있다`는 기준으로 구분할 수 있다.
- 어려워서 이탈하기 쉬운 식별자 관계 구간에서 시각 자료가 완충 역할을 한다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`
- `src/data/reminders.ts`
- `src/game/lesson/DialogueLesson.tsx`
- `src/game/lesson/GlossaryKeyword.tsx`
- `supabase/migrations/0062_update_sqld_identifier_relationship_drills.sql`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 라이브 Supabase `public.questions`에 `0062_update_sqld_identifier_relationship_drills.sql` 내용을 upsert했다.
- 대상 3문항의 누락은 `0`건이고, `answer_index`와 `is_playable=true` 동기화를 확인했다.

## 2026-05-25 — SQLD 관계 차수의 카디널리티 용어 보강

### 사용자가 발견한 문제

- 관계의 구성 요소 중 `차수`가 SQLD 시험에서 `카디널리티(Cardinality)`라는 용어로도 자주 출제된다.
- 기존 설명은 `차수`만 말하고 있어, 문제에서 `카디널리티`라는 단어가 나오면 같은 개념으로 연결하기 어려울 수 있었다.

### 수정한 방향

- `차수와 선택사양` 스텝의 첫 설명에 `차수 = 카디널리티(Cardinality)` 연결을 추가했다.
- `차수`와 `카디널리티`를 클릭 설명 가능한 용어로 등록했다.
- 2회독 리마인더에도 카디널리티 명칭을 함께 넣었다.

### 사용자에게 주는 좋은 영향

- 사용자가 `차수`, `카디널리티`, `1:1 / 1:M / M:N`을 같은 시험 포인트로 묶어 기억할 수 있다.
- SQLD 문제에서 영어 용어가 나와도 당황하지 않고 관계 연결 개수 문제로 해석할 수 있다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/game/lesson/GlossaryKeyword.tsx`
- `src/data/reminders.ts`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 문제 `quizId`/`extraQuizIds`, 선택지, 정답, 해설을 바꾸지 않은 개념 설명 보강이므로 Supabase 문제 테이블 반영은 필요하지 않다.

## 2026-05-25 — SQLD ERD 작성 순서와 배치 시험 포인트 추가

### 사용자가 발견한 문제

- 관계와 ERD 선 표기는 설명했지만, SQLD에서 자주 묻는 `ERD 작성 순서`가 빠져 있었다.
- 사용자는 `엔터티 도출 → 배치 → 관계 설정 → 관계명 기술 → 관계 차수 설정 → 필수/선택사양 기술` 흐름과 `도배설명차선` 암기어를 추가해야 한다고 지적했다.
- ERD 배치에서 중요한 엔터티를 왼쪽 상단에 두는 것이 맞는지도 확인이 필요했다.

### 수정한 방향

- 외부 자료로 ERD 작성 순서와 배치 포인트를 대조했다.
  - ERD 작성 흐름은 사용자가 제시한 순서와 일치한다.
  - 중요한 엔터티를 왼쪽 상단 쪽에 배치하고 추가 엔터티를 우측/하단으로 확장하는 설명도 SQLD 정리 자료에서 반복된다.
- `차수와 선택사양` 뒤에 `ERD 작성 순서` 스텝을 새로 추가했다.
- 대사 흐름은 `작성 순서 중요성 → 전체 순서 → 도배설명차선 → 배치 포인트 → 문제`로 구성했다.
- `DialogueLesson`에 반응형 `ERD ORDER` 시각 자료를 추가했다.
  - 첫 구현은 엑셀 표처럼 보여 모바일에서 눈이 피로하다는 피드백이 있었다.
  - 강한 표 테두리와 밝은 포인트를 줄이고, 어두운 카드 + 짧은 행 리스트 + 부드러운 단계 모션으로 재정리했다.
- 새 문제 2개를 추가했다.
  - `sqld-1-1-cp-07-erd-order`: ERD 작성 순서 확인
  - `sqld-1-1-cp-07-erd-placement`: 핵심 엔터티 배치 확인

### 사용자에게 주는 좋은 영향

- 사용자가 ERD를 단순 그림으로 보지 않고, 어떤 순서로 작성하는지 기억할 수 있다.
- `도배설명차선` 암기어로 시험 직전 빠르게 복습할 수 있다.
- 배치가 미관이 아니라 관계선 꼬임을 줄이고 가독성을 높이는 시험 포인트라는 점을 이해한다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`
- `src/data/reminders.ts`
- `src/game/lesson/DialogueLesson.tsx`
- `src/game/lesson/GlossaryKeyword.tsx`
- `src/data/gameModes.ts`
- `src/data/lessons/lessons.integration.test.ts`
- `supabase/migrations/0061_seed_sqld_erd_order_drills.sql`

### Supabase 반영 여부

- 라이브 Supabase `public.questions`에 `0061_seed_sqld_erd_order_drills.sql` 내용을 upsert했다.
- 대상 2문항의 누락은 `0`건이고, 모두 `is_playable=true`로 확인했다.
- SQLD 1과목 레슨에서 참조하는 전체 `quizId`/`extraQuizIds`도 Supabase와 대조했고 누락 `0`건을 확인했다.

## 2026-05-25 — SQLD 속성 진행 표시 분류 기준 라벨 추가

### 사용자가 발견한 문제

- 속성 스텝이 `속성이란 무엇인가 → 기본 속성 → 설계 속성 → 파생 속성 → 단일 속성 → 복합 속성 → 다중값 속성 → PK 속성 → FK 속성 → 일반 속성`처럼 한 목록에 붙어 보여, 각각이 어떤 기준의 분류인지 알기 어려웠다.
- 특히 `특성에 따른 분류`, `분해/값 개수에 따른 분류`, `구성 방식에 따른 분류`가 섞여 보였다.

### 수정한 방향

- SQLD 속성 그룹의 진행 표시 이름을 `개념 진행`에서 `속성 분류 진행`으로 바꿨다.
- 속성 진행 목록에 작은 섹션 라벨을 추가했다.
  - `속성 기초`
  - `특성에 따른 분류`
  - `분해·값 개수에 따른 분류`
  - `구성 방식에 따른 분류`
- 앱 전체 진행 UI를 바꾸지 않고, `sqld-1-1-g8-attributes` 그룹에만 적용되도록 범위를 좁혔다.

### 사용자에게 주는 좋은 영향

- 사용자는 지금 배우는 속성 개념이 어떤 기준으로 나뉘는지 먼저 보고 들어갈 수 있다.
- 분류명이 단순 암기 목록처럼 보이지 않고 구조화되어 기억된다.
- 모바일 진행 목록이 길어져도 기준별로 끊어 읽을 수 있다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 여부

- 문제 ID, 선택지, 정답, 해설 변경이 없는 UI 진행 표시 수정이므로 Supabase 반영 없음.

## 2026-05-25 — SQLD 단일·복합·다중값 / PK·FK·일반 속성 흐름 재구성

### 사용자가 발견한 문제

- `단일·복합·다중값 속성`, `PK·FK·일반 속성` 스텝이 각각 한 카드 안에서 세 개념을 한꺼번에 설명하고 있었다.
- 초보자는 `단일`, `복합`, `다중값`, `PK`, `FK`, `일반`을 이름만 보고 외우게 되고, 왜 그렇게 분류하는지 충분히 이해하기 어려웠다.
- 문제도 한 분류만 확인하고 넘어가서 나머지 분류를 바로 점검하지 못했다.

### 수정한 방향

- 기존 두 스텝을 아래 6개 마이크로 스텝으로 분리했다.
  - `단일 속성`
  - `복합 속성`
  - `다중값 속성`
  - `PK 속성`
  - `FK 속성`
  - `일반 속성`
- 각 스텝은 `쉬운 정의 → 생활형 예시 → 시험에서 보는 기준 → 바로 확인 문제` 순서로 배치했다.
- 새 문제 `sqld-1-1-cp-06-shape-single`, `sqld-1-1-cp-06-shape-composite`, `sqld-1-1-cp-06-role-pk`, `sqld-1-1-cp-06-role-general`을 추가했다.
- 기존 `sqld-1-1-cp-06-shape`, `sqld-1-1-cp-06-role`은 각각 다중값 속성, FK 속성 확인 문제로 더 명확하게 갱신했다.
- `단일 속성`, `복합 속성`, `다중값 속성`, `일반 속성`도 클릭 설명 가능한 용어로 등록했다.

### 사용자에게 주는 좋은 영향

- 사용자는 속성 분류를 암기 목록이 아니라 실제 예시로 하나씩 이해할 수 있다.
- 각 개념 직후 같은 개념만 묻는 문제가 나오므로 오개념이 바로 잡힌다.
- 모바일 화면에서도 한 번에 읽어야 하는 정보량이 줄어 학습 피로가 낮아진다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`
- `src/data/reminders.ts`
- `src/game/lesson/GlossaryKeyword.tsx`
- `src/data/gameModes.ts`
- `src/data/lessons/lessons.integration.test.ts`
- `supabase/migrations/0060_seed_sqld_attribute_shape_role_micro_steps.sql`

### Supabase 반영 여부

- 라이브 Supabase `public.questions`에 `0060_seed_sqld_attribute_shape_role_micro_steps.sql` 내용을 upsert했다.
- 대상 6문항의 누락은 `0`건이고, 모두 `is_playable=true`로 확인했다.
- SQLD 1과목 레슨에서 참조하는 전체 `quizId`/`extraQuizIds`도 Supabase와 대조했고 누락 `0`건을 확인했다.

## 2026-05-25 — SQLD 속성 분류 기본·설계·파생 흐름 재구성

### 사용자가 발견한 문제

- `속성은 만들어진 방식으로 기본, 설계, 파생으로 나눠` 다음에 곧바로 `계산으로 만든 속성`을 묻고 있어 흐름이 어색했다.
- 속성이 무엇인지, 원자성이 무엇인지 다시 잡지 않은 채 분류로 넘어가 초보자가 따라가기 어려웠다.
- 기본 속성, 설계 속성, 파생 속성을 각각 배운 직후 확인하는 문제가 부족했다.

### 수정한 방향

- `속성이란 무엇인가` 스텝에 `더 이상 나누지 않고 하나의 의미로 쓰는 최소 데이터 단위`와 `원자성` 설명을 추가했다.
- 기존 `기본·설계·파생 속성` 스텝을 아래 흐름으로 분리했다.
  - `기본 속성`
  - `설계 속성`
  - `파생 속성`
- `기본 속성`, `설계 속성` 확인 문제를 새로 추가했고, 기존 파생 속성 문제는 `생년월일 → 나이` 예시로 더 명확하게 고쳤다.
- `원자성`도 클릭 설명 가능한 용어로 등록했다.

### 사용자에게 주는 좋은 영향

- 사용자가 속성의 기본 의미를 먼저 잡은 뒤 분류를 배우므로 흐름이 자연스러워진다.
- 기본/설계/파생을 한 번에 암기하지 않고 하나씩 예시와 문제로 확인한다.
- 파생 속성이 “다른 값에서 계산된 값”이라는 핵심을 더 오래 기억할 수 있다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`
- `src/data/reminders.ts`
- `src/game/lesson/GlossaryKeyword.tsx`
- `src/data/gameModes.ts`
- `src/data/lessons/lessons.integration.test.ts`
- `supabase/migrations/0059_seed_sqld_attribute_origin_micro_steps.sql`

### Supabase 반영 여부

- 새 문제 `sqld-1-1-cp-06-origin-basic`, `sqld-1-1-cp-06-origin-designed`를 추가했고, 기존 `sqld-1-1-cp-06`, `sqld-1-1-cp-06-origin`도 문항/해설을 갱신해야 한다.
- 라이브 Supabase `public.questions`에 `0059_seed_sqld_attribute_origin_micro_steps.sql` 내용을 upsert했다.
- 반영 후 대상 4문항의 누락은 `0`건이고, 모두 `is_playable=true`로 확인했다.
- SQLD 1과목 레슨에서 참조하는 전체 `quizId`/`extraQuizIds`도 Supabase와 대조했고 누락 `0`건을 확인했다.

## 2026-05-25 — SQLD 로드맵 중복 제목과 PK/FK 용어 보완

### 사용자가 발견한 문제

- SQLD 1-1 로드맵에서 `속성 분류`가 여러 번 반복되어, 서로 다른 개념인지 같은 문제가 반복되는 것인지 구분하기 어려웠다.
- `엔터티 분류`도 유무형 분류와 발생 시점 분류가 같은 제목으로 보여 학습 위치가 흐려졌다.
- `PK`, `FK`, `컬럼` 같은 약어와 용어가 처음 보는 사용자에게 낯설 수 있었다.

### 수정한 방향

- 로드맵 제목을 짧게 유지하되, 서로 구분되도록 바꿨다.
  - `엔터티 분류` → `유형·개념·사건 엔터티`
  - `엔터티 분류` → `기본·중심·행위 엔터티`
  - `속성 분류` → `기본·설계·파생 속성`
  - `속성 분류` → `단일·복합·다중값 속성`
  - `속성 분류` → `PK·FK·일반 속성`
- `컬럼`, `PK`, `FK`를 클릭 가능한 짧은 설명 용어로 등록했다.
- PK/FK가 다시 등장하는 대사에도 대괄호 키워드를 적용해 설명 팝업과 연결했다.

### 사용자에게 주는 좋은 영향

- 사용자는 로드맵에서 각 STEP이 무엇을 다루는지 바로 구분할 수 있다.
- 같은 `속성 분류`처럼 보이던 반복감이 줄고, 학습 진행이 더 명확해진다.
- SQLD를 처음 보는 사용자도 PK/FK/컬럼에서 멈추지 않고 즉시 뜻을 확인할 수 있다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/game/lesson/GlossaryKeyword.tsx`

### Supabase 반영 여부

- 문제 `quizId`/`extraQuizIds`를 추가하거나 문항 정답을 바꾸지 않은 UI/설명 보완이므로 Supabase 문제 테이블 반영은 필요하지 않다.

## 2026-05-25 — SQLD 엔터티 이름 짓기 예시 보완

### 사용자가 발견한 문제

- `예: 학생들(X) → 학생(O), STD(X) → 학생(O).` 문장이 한 줄에 붙어 있어 모바일에서 읽기 부담이 있었다.
- `STD`가 무엇인지 설명 없이 등장해, 처음 보는 사용자가 “왜 STD가 틀렸지?”라고 느낄 수 있었다.

### 수정한 방향

- 예시를 줄바꿈 처리해 `학생들 → 학생`, `STD → 학생`을 따로 보이게 했다.
- `STD`는 `Student`를 임의로 줄인 이름이라는 설명을 추가했다.
- 2회독 리마인더도 같은 취지로 보완했다.

### 사용자에게 주는 좋은 영향

- 엔터티 이름 규칙의 핵심인 `단수 명사`와 `약어 지양`을 더 쉽게 구분할 수 있다.
- 초보자가 낯선 약어 때문에 거부감을 느끼는 일을 줄인다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/reminders.ts`

### Supabase 반영 여부

- 문제 `quizId`/`extraQuizIds`를 추가하거나 수정하지 않은 설명 문구 변경이므로 Supabase 문제 테이블 반영은 필요하지 않다.

## 2026-05-23 — SQLD 콘텐츠 개편 시작 기준

### 사용자가 발견한 문제

- SQLD 개념 설명이 ADSP 1과목에 비해 너무 길다.
- 하나의 화면이나 한 스텝 안에 여러 개념이 묶여 있어, 사용자가 무엇을 지금 배워야 하는지 흐려진다.
- 개념 뒤에 바로 확인 문제가 충분히 붙지 않아, 읽은 내용을 즉시 써보는 흐름이 약하다.
- 말투가 너무 딱딱해서 “UI만 좋은 책”처럼 느껴진다는 피드백이 있었다.

### 수정 방향

- SQLD 개념을 더 작은 단위로 세분화한다.
- 세분화한 개념마다 바로 이어지는 확인 문제를 붙인다.
- 한 스텝은 “짧은 개념 하나 → 바로 적용하는 문제 하나”를 기본 구조로 둔다.
- 설명은 시험 요약문처럼 압축하지 않고, 초보자가 상황을 떠올릴 수 있는 말투로 바꾼다.
- SQL 문제는 단순 암기보다 “이 SQL이 무엇을 하는지”, “어느 자리에 어떤 문법이 들어가는지”, “실행 순서상 왜 그런지”를 이해하게 만든다.

### 왜 이렇게 수정하는가

- SQLD는 용어와 문법이 한꺼번에 쏟아지면 초보자가 빠르게 지친다.
- 긴 설명은 사용자가 읽었다고 느끼게 만들 수 있지만, 실제로는 개념을 분리해 기억하기 어렵다.
- 개념 직후의 작은 문제는 사용자가 “방금 배운 것을 내가 쓸 수 있다”는 감각을 만든다.
- 말투가 부드러워지면 앱이 교재가 아니라 학습 코치처럼 느껴진다.

### 사용자에게 기대되는 좋은 영향

- 한 번에 이해해야 하는 양이 줄어 학습 부담이 낮아진다.
- 개념과 문제가 바로 연결되어 기억이 오래 간다.
- SQLD를 처음 보는 사용자도 “지금 뭘 배우는 중인지” 놓치지 않는다.
- 게임형 UI와 콘텐츠 톤이 맞아져 전체 경험이 더 자연스러워진다.

### 앞으로 Codex가 지킬 편집 원칙

- SQLD 개념 하나가 길어지면 먼저 쪼갤 수 있는지 판단한다.
- 한 스텝에 서로 다른 개념이 섞여 있으면 분리 후보로 본다.
- 문제는 개념을 읽은 사람이 바로 성공 또는 실패를 확인할 수 있게 만든다.
- 딱딱한 정의문은 가능한 한 짧은 상황 예시, 비교, 실행 결과 중심으로 바꾼다.
- 사용자가 직접 수정한 표현은 이후 문제 수정의 기준 데이터로 삼는다.

## 2026-05-23 — SQLD 첫 스텝: 데이터 모델링 도입부 세분화

### 수정한 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`
- `src/data/reminders.ts`
- `supabase/migrations/0047_seed_sqld_modeling_micro_steps.sql`
- `src/game/screens/LessonScreen.tsx`
- `src/game/lesson/highlight.tsx`

### 무엇을 수정했나

- 기존 `데이터 모델링이란 — 3특징 + 3관점` 스텝을 세 개의 작은 스텝으로 나눴다.
  - `데이터 모델링이란`
  - `좋은 모델의 3가지 특징`
  - `모델링의 3가지 관점`
- 첫 스텝은 사용자가 제안한 수강신청 흐름을 반영했다.
  - `학교에서 수강신청 한 번쯤 해봤지?`
  - `학생·과목·교수·시간표 같은 정보를 컴퓨터가 다루려면 어떻게 해야 할까?`
  - 화살표식 관계 표현은 이후 피드백에 따라 문장형 예시로 정리했다.
- `[DB]`를 클릭하면 짧은 설명이 뜨는 용어 설명 UI를 카드 본문과 대화 말풍선에 추가했다.
- 첫 문제를 “모델링의 설명에 대해 옳은 것”을 고르는 문제로 바꿨다.
- 기존 3특징 문제는 별도 스텝으로 분리하고, 3관점 확인 문제를 새로 추가했다.
- 2회독 reminder도 세분화된 스텝에 맞게 갱신했다.

### 왜 이렇게 수정했나

- 기존 첫 스텝은 정의, 3특징, 3관점, CRUD가 한 번에 묶여 있어 SQLD 입문자에게 정보량이 많았다.
- 사용자는 처음 보는 `DB` 같은 약어에서 거부감을 느낄 수 있으므로, 본문을 벗어나지 않고 즉시 확인할 수 있는 클릭 설명이 필요했다.
- 데이터 모델링의 정의를 배우는 순간에는 “단추명”보다 “현실 정보를 DB 구조로 바꾸는 과정” 자체를 먼저 잡아야 한다.

### 사용자에게 기대되는 좋은 영향

- 첫 화면에서 배워야 할 개념이 하나로 줄어 부담이 낮아진다.
- 수강신청 예시 덕분에 데이터 모델링이 추상적인 정의가 아니라 현실을 DB 구조로 바꾸는 일로 느껴진다.
- DB라는 약어를 모르는 사용자가 이탈하지 않고 바로 뜻을 확인할 수 있다.
- 3특징과 3관점은 각각 별도 문제로 확인하므로 기억 단위가 더 선명해진다.

### 발견한 개념/표현 문제

- 기존 문장은 시험 범위 요소를 빠르게 많이 보여주지만, 앱의 첫 SQLD 경험으로는 너무 교재식이었다.
- “상관 관점”은 처음부터 CRUD까지 함께 설명하면 낯설 수 있으므로, 먼저 “업무와 데이터가 만나는 지점”으로 풀어주는 편이 낫다.

### 앞으로 Codex가 배운 편집 원칙

- SQLD 첫 설명은 정의를 먼저 잡고, 특징·관점·암기법은 다음 스텝으로 분리한다.
- 초보자가 처음 마주칠 약어는 클릭 설명 또는 짧은 보조 설명을 붙인다.
- 사용자가 준 예시 문장은 콘텐츠 톤의 기준으로 삼되, 오탈자나 시험 개념상 부정확한 표현은 자연스럽게 바로잡는다.

### 후속 UI 수정

- `[DB]` 설명을 말풍선 위에 작은 툴팁으로 띄우는 방식은 모바일에서 제대로 보이지 않았다.
- 화면 하단의 고정 미니 설명 카드로 바꿔, 사용자가 어디를 눌렀는지와 관계없이 안정적으로 읽을 수 있게 했다.
- 앞으로 초보자용 용어 설명은 작은 hover 툴팁보다 모바일에서 확실히 보이는 클릭형 카드가 우선이다.
- 추가 확인 결과, 설명 카드를 말풍선 내부 컴포넌트에 그대로 렌더하면 애니메이션/레이어 구조에 갇혀 실제 화면에서 보이지 않을 수 있었다.
- 용어 설명 카드를 `document.body` 최상단 전역 레이어로 분리해, 말풍선·카드·모바일 레이아웃 어디서 눌러도 같은 방식으로 보이게 수정했다.
- 화살표식 수강신청 관계 표현은 단독 대사로 보일 때 흐름을 끊고 다소 투박해 보여 삭제했다. 본문 예시 카드에서도 같은 표현을 문장형 예시로 바꿨다.
- `컴퓨터가 다루려면 어떻게 해야 할까?` 다음에 바로 `데이터 모델링` 정의로 넘어가면 논리 연결이 급했다. 중간에 `현실 정보를 DB가 담을 수 있는 모양으로 정리한다`는 다리 문장을 넣어, 초보자가 정의를 더 자연스럽게 받아들이게 했다. 이후 말풍선 길이를 줄이기 위해 `누가, 무엇을, 어떻게 연결되는지 잡는 거지` 문장은 삭제했다.

## 2026-05-23 — SQLD 좋은 모델 특징: 단순화 스텝 분리

### 수정한 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`
- `src/data/reminders.ts`

### 무엇을 수정했나

- 좋은 모델의 3가지 특징을 `단추명`으로 소개한 뒤, 첫 번째 특징인 `단순화`만 따로 배우는 스텝으로 정리했다.
- 단순화를 “처음 보는 사람도 구조를 쉽게 이해할 수 있게 정리하는 것”으로 풀어 썼다.
- 수강신청 예시는 `학생·과목·수강신청`처럼 역할을 나누면 구조가 쉬워진다는 방향으로 바꿨다.
- 기존 3특징 암기 문제를 단순화 판단 문제로 재작성했다.
- 2회독 reminder에서도 예전 화살표 표현을 없애고, 단순화 복습 문구가 현재 스텝과 맞도록 고쳤다.

### 왜 이렇게 수정했나

- `단순화·추상화·명확화`를 한 번에 설명하면 암기어는 남지만, 각각이 실제로 무엇을 뜻하는지 흐려진다.
- 단순화는 SQLD 모델링의 첫인상에 해당하므로, 초보자가 “좋은 모델은 보기 쉬워야 한다”는 감각을 먼저 잡는 것이 중요하다.
- 한 줄짜리 거대한 표와 역할이 나뉜 구조를 비교하면, 단순화가 단순히 “짧게 줄이기”가 아니라 “이해하기 쉬운 구조 만들기”라는 점이 선명해진다.

### 사용자에게 기대되는 좋은 영향

- 사용자가 `단추명`을 외우기 전에 각 단어의 의미를 실제 예시로 이해한다.
- 문제를 풀 때 “단순화 = 처음 보는 사람도 구조를 쉽게 이해”라는 기준으로 오답을 걸러낼 수 있다.
- 수강신청 예시가 계속 이어져 첫 단원의 흐름이 끊기지 않는다.

### 발견한 개념/표현 문제

- `과목은 교수와 시간표를 가집니다`는 초보자용으로는 이해되지만, 모델링 관점에서는 `개설된 과목에는 담당 교수와 시간이 정해진다`가 더 정확하다.
- `컴퓨터가 이해할 수 있는 저장 구조`는 물리 저장처럼 들릴 수 있어, `DB에 저장할 구조`로 더 부드럽게 고쳤다.

### 후속 표현 수정

- `단순화·추상화·명확화` 3가지 특징을 한 줄에 모두 보여주면 모바일 말풍선에서 문장이 길게 뭉쳐 보였다.
- 각 특징을 `1/2/3` 줄로 나누어, 사용자가 한눈에 세 항목을 비교하며 읽을 수 있게 했다.
- `단추명` 설명 직후 바로 단순화 세부 설명으로 넘어가면, 사용자가 3가지 특징 자체를 확인할 기회가 없었다.
- 그래서 `좋은 모델의 3가지 특징` 스텝을 먼저 두고, 바로 `특징이 아닌 것은?` 문제를 풀게 했다.
- 그 다음 스텝에서 `단순화`를 따로 설명하고 단순화 판단 문제를 풀도록 분리했다.
- 모바일 말풍선에서 `데이터 모델은 개발자든, 기획자든...` 문장이 너무 길게 보였다.
- 모바일 중심 플랫폼이라는 기준에 맞춰, 같은 뜻을 `좋은 모델은 처음 봐도 바로 이해돼야 해.`와 `"아, 이런 구조구나!" 하고 따라올 수 있으면 좋아.` 두 개의 짧은 말풍선으로 나눴다.

### 서버 문제은행 반영

- QuestDP v2 문제풀이 구조는 로컬 JSON만 보지 않고, 문제 시작 전에 Supabase `questions` 테이블에서 같은 `question_id`로 세션을 예약한다.
- 로컬에 새 문제 ID를 추가하고 서버 문제은행에 반영하지 않으면 `문제 이용권을 확인하지 못했어요` 안내가 뜰 수 있다.
- 이번 변경분 `sqld-1-1-cp-01`, `sqld-1-1-cp-01b`, `sqld-1-1-cp-01c`, `sqld-1-1-cp-01d`를 서버에 upsert했고, 같은 내용을 재현 가능한 migration 파일로 남겼다.
- SQLD 스텝 수가 50개에서 53개로 늘었으므로 랜딩/학습원리/카운트 검증 테스트도 함께 갱신했다. 콘텐츠 숫자가 틀리면 사용자가 플랫폼 규모를 잘못 이해할 수 있기 때문이다.

## 2026-05-23 — SQLD 좋은 모델 특징: 추상화·명확화 스텝 추가

### 수정한 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`
- `src/data/reminders.ts`
- `supabase/migrations/0048_seed_sqld_modeling_abstract_clear.sql`

### 무엇을 수정했나

- `단순화`와 같은 방식으로 `추상화`, `명확화`도 각각 별도 스텝으로 분리했다.
- 각 스텝을 모바일에서 읽기 쉽도록 짧은 말풍선 4~5개로 구성했다.
- `추상화`는 “현실 전체를 복사하지 않고 지금 필요한 핵심만 남기는 것”으로 설명했다.
- `명확화`는 “누가 봐도 같은 뜻으로 읽히게 이름과 관계를 분명히 하는 것”으로 설명했다.
- 두 개념 뒤에 각각 판단 문제를 추가해, 단순 암기가 아니라 단어별 차이를 바로 확인하게 했다.
- 2회독 reminder도 `s1d=추상화`, `s1e=명확화`, `s1f=모델링 3관점` 순서에 맞게 갱신했다.

### 왜 이렇게 수정했나

- `단추명`은 외우기 쉬운 암기어지만, 세 단어를 한 번에 지나가면 사용자가 실제 문제에서 `추상화`와 `명확화`를 구분하기 어렵다.
- SQLD 첫 단원은 이후 엔터티·속성·관계 판단의 기초이므로, 각 특징을 “예시 하나 + 문제 하나”로 바로 고정해야 한다.
- 모바일에서는 긴 정의보다 짧은 말풍선이 학습 부담을 줄이고, 다음 문제로 넘어가는 리듬을 살린다.

### 사용자에게 기대되는 좋은 영향

- 사용자가 `단순화=쉽게 읽기`, `추상화=핵심만 남기기`, `명확화=같은 의미로 읽히기`를 분리해서 기억할 수 있다.
- 수강신청 예시가 계속 이어져 첫 단원의 스토리가 끊기지 않는다.
- 문제 이용권 오류가 나지 않도록 Supabase 서버 문제은행에도 같은 문제 id를 반영했다.

### 발견한 개념/표현 문제

- `추상화`를 “간단하게 만든다”로만 설명하면 `단순화`와 겹친다. 그래서 “업무에 필요한 핵심만 남긴다”로 기준을 분리했다.
- `명확화`를 “정확하게 표현한다”로만 쓰면 추상적이다. 그래서 `날짜 → 수강신청일`처럼 이름이 애매한 예시를 붙였다.

### 후속 문제 품질 수정

- `단순화`, `추상화`, `명확화` 3개 문제의 정답이 모두 A 위치에 있어서 사용자가 개념 판단 대신 위치 패턴을 학습할 위험이 있었다.
- 정답 위치를 `단순화=B`, `추상화=C`, `명확화=D`로 섞었다.
- 로컬 JSON, 재현용 migration, Supabase 서버 문제은행을 모두 같은 순서로 맞췄다.
- 이 변경은 난이도를 높이려는 목적이 아니라, 사용자가 보기 위치가 아니라 문장 의미를 읽고 고르게 하려는 목적이다.

## 2026-05-23 — SQLD 모델링 3가지 관점: 데이터·프로세스·상관 스텝 분리

### 수정한 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`
- `src/data/reminders.ts`
- `supabase/migrations/0047_seed_sqld_modeling_micro_steps.sql`
- `supabase/migrations/0049_seed_sqld_modeling_perspective_drills.sql`

### 무엇을 수정했나

- 기존 `모델링의 3가지 관점` 스텝은 전체 설명과 상관 관점 문제를 한 번에 담고 있었다.
- 이를 `전체 소개 → 데이터 관점 → 프로세스 관점 → 상관 관점` 4단계로 나눴다.
- 전체 소개 문제는 `3가지 관점에 포함되지 않는 것`을 묻도록 바꿨다.
- `데이터 관점`, `프로세스 관점`, `상관 관점` 각각에 짧은 말풍선, 쉬운 수강신청 예시, 확인 문제를 추가했다.
- Supabase 서버 문제은행에도 새 문제 3개를 추가하고, 기존 `sqld-1-1-cp-01d`의 문항/정답도 새 구조에 맞게 갱신했다.

### 왜 이렇게 수정했나

- `데프상`은 암기어로 좋지만, 초보자는 세 관점의 차이를 한 번에 들으면 “다 비슷한 말”로 느낄 수 있다.
- SQLD 모델링 문제는 저장 대상, 업무 흐름, 업무와 데이터의 연결을 구분하는 감각이 중요하다.
- 각 관점을 한 화면 단위로 분리하면 사용자가 “무엇을 저장하나 = 데이터”, “어떤 순서인가 = 프로세스”, “데이터를 어떻게 쓰나 = 상관”으로 판단 기준을 세울 수 있다.

### 사용자에게 기대되는 좋은 영향

- 처음 SQLD를 접하는 사용자가 모델링 관점을 암기어가 아니라 상황 판단으로 이해할 수 있다.
- 이후 엔터티·속성·관계로 넘어갈 때 `데이터 관점`의 의미가 자연스럽게 이어진다.
- 상관 관점에서 CRUD를 미리 맛보게 되어 뒤쪽 SQL/관리 구문 학습과도 연결된다.

### 발견한 개념/표현 문제

- 기존 상관 관점 설명은 맞지만 너무 빨리 CRUD까지 들어가 초반 사용자에게 부담이 될 수 있었다.
- 그래서 CRUD는 상관 관점 스텝에서 “업무가 데이터에 하는 기본 동작”으로만 짧게 소개하고, 깊은 설명은 뒤 SQL 파트로 넘기는 흐름이 더 적절하다.
- 후속 점검에서 `CRUD`라는 약어 자체도 초보자에게 낯설다는 문제가 확인됐다.
- 상관 관점 설명 뒤에 `CRUD = 만들기·읽기·고치기·지우기`를 바로 풀어 설명하도록 말풍선과 블록 설명을 고쳤다.
- `CRUD`도 눌러 볼 수 있는 용어 설명으로 등록해, 사용자가 약어를 마주쳤을 때 바로 뜻을 확인할 수 있게 했다.

### 후속 용어 부담 수정

- `데이터 관점` 스텝에서 “이때 엔터티와 속성을 찾게 돼”라고 바로 말하면, 처음 SQLD를 접하는 사용자는 `엔터티`와 `속성` 자체를 몰라 멈출 수 있다.
- 메인 말풍선은 “어려운 말로는 엔터티와 속성”이라고 완충하고, 바로 뒤에서 자세히 배운다고 안내했다.
- `엔터티`, `속성`, `식별자`는 DB처럼 눌러 볼 수 있는 짧은 설명 키워드로 등록했다.
- 이렇게 하면 사용자는 지금은 “저장할 대상과 정보” 정도로 이해하고 넘어가되, 궁금하면 즉시 간단한 뜻을 확인할 수 있다.
- 용어 설명 카드가 갑자기 튀어나오면 모바일에서 부담스러울 수 있어, 아래에서 살짝 올라오고 흐림이 풀리는 바텀시트형 모션을 추가했다.
- 실제 모바일 화면에서 설명 카드가 작게 느껴져, 카드 폭·패딩·본문 글자 크기·닫기 버튼 크기를 한 단계 키웠다.
- 확대 후 상단 여백이 조금 떠 보였기 때문에, 카드 위쪽 패딩과 손잡이 높이·간격을 줄여 제목이 더 빠르게 보이도록 조정했다.

## 2026-05-23 — SQLD 1-1 편집 세션 종합 요약

### 현재까지 반영된 구조

- SQLD 첫 단원은 긴 설명형 흐름에서 `짧은 개념 → 쉬운 예시 → 즉시 문제` 흐름으로 전환 중이다.
- `데이터 모델링이란`은 수강신청 예시로 시작해, 현실 정보를 DB 구조로 표현하는 과정이라는 정의로 연결했다.
- `좋은 모델의 3가지 특징`은 전체 암기어 `단추명`을 먼저 확인한 뒤, `단순화`, `추상화`, `명확화`를 각각 별도 스텝으로 분리했다.
- `모델링의 3가지 관점`은 전체 암기어 `데프상`을 먼저 확인한 뒤, `데이터 관점`, `프로세스 관점`, `상관 관점`을 각각 별도 스텝으로 분리했다.
- 낯선 용어 `DB`, `엔터티`, `속성`, `식별자`, `CRUD`는 클릭 가능한 짧은 설명 카드로 연결했다.

### 문제 수정 원칙

- 정답 위치가 반복되지 않도록 보기 순서를 섞었다.
- 정답 위치를 맞히는 게임이 아니라, 문장 의미를 읽고 판단하는 문제로 유지한다.
- 하나의 문제는 한 개념만 묻는다. 예를 들어 `단순화` 문제에서 `추상화`까지 동시에 판단하게 하지 않는다.
- 초반 SQLD 문제는 시험 용어를 바로 던지기보다, 먼저 생활 예시로 판단 기준을 만든 뒤 시험 용어를 붙인다.
- 서버 문제은행을 사용하는 v2 흐름 때문에, 로컬 JSON에 새 문제를 추가하면 Supabase `questions`에도 같은 id로 반드시 반영한다.

### UI/UX 수정 원칙

- 모바일 첫 화면에서 한 문장이 너무 길면 말풍선을 나눈다.
- 낯선 약어는 처음 등장하는 순간 바로 풀어 쓴다.
- 용어 설명 카드는 바텀시트처럼 아래에서 올라오는 모션을 사용한다.
- 설명 카드는 너무 작게 보이면 폭, 본문 크기, 닫기 버튼 크기를 키우되, 상단 공백은 줄여 정보가 빨리 보이게 한다.
- 사용자가 “뒤에서 배울 개념”을 먼저 마주치면, 지금은 이름만 봐도 된다고 안내한다.

### 현재 콘텐츠 카운트 영향

- SQLD concept-practice는 `58문항` 기준으로 갱신됐다.
- SQLD 레슨 스텝은 `58 step`, 전체 레슨 스텝은 `309 step` 기준으로 갱신됐다.
- 전체 playable 문항 표기는 `726문항` 기준으로 갱신됐다.
- `node scripts/validate-questions.mjs` 기준 전체 raw 문항 수는 `727`, 기계 결함은 `0`이었다.

### 서버 반영 내역

- `sqld-1-1-cp-01`, `sqld-1-1-cp-01b`, `sqld-1-1-cp-01c`, `sqld-1-1-cp-01d`를 Supabase `questions`에 upsert했다.
- `sqld-1-1-cp-01c-abstract`, `sqld-1-1-cp-01c-clear`를 Supabase `questions`에 upsert했다.
- `sqld-1-1-cp-01d-data`, `sqld-1-1-cp-01d-process`, `sqld-1-1-cp-01d-interaction`을 Supabase `questions`에 upsert했다.
- `sqld-1-1-cp-01d-interaction`의 해설을 `CRUD = 만들고(Create), 읽고(Read), 고치고(Update), 지우는지(Delete)`로 풀어 쓰도록 갱신했다.
- 재현 가능한 migration 파일로 `0047`, `0048`, `0049`를 남겼다.

### 검증 기록

- `node scripts/validate-questions.mjs` 통과.
- `npm run typecheck` 통과.
- `npm test -- --run` 통과.
- `npm run build` 통과.
- 브라우저에서 `#/game/sqld` 렌더링, 용어 설명 카드 열림/닫힘, 설명 카드 크기/상단 여백 조정, CRUD 말풍선 노출을 확인했다.

### 다음 편집에 적용할 기준

- 사용자가 “이 단어 처음 보는 사람은 모른다”고 지적한 단어는 클릭 설명 또는 직후 풀이 문장으로 처리한다.
- 다만 모든 용어를 팝업으로 해결하지 않는다. 핵심 흐름을 방해하는 경우에는 문장 자체를 더 쉬운 표현으로 바꾼다.
- 개념을 세분화할 때는 반드시 문제도 함께 추가한다.
- 문제를 추가하면 `reminders.ts`, 카운트 표기, Supabase seed, 검증 테스트까지 같이 갱신한다.

## 2026-05-23 — SQLD 모델링 단계·ANSI/SPARC 세분화

### 무엇을 수정했나

- 기존 `모델링 단계` 설명을 한 번에 읽는 긴 흐름에서 `개념적 모델링`, `논리적 모델링`, `물리적 모델링`으로 분리했다.
- 기존 `ANSI/SPARC 3-스키마 + 데이터 독립성` 설명을 `외부 스키마`, `개념 스키마`, `내부 스키마`, `데이터 독립성`으로 나눴다.
- 각 하위 개념마다 바로 확인할 수 있는 객관식 문제를 추가했다.
- 처음 보는 사용자가 막힐 수 있는 `ERD`, `DBMS`, `인덱스`, `스키마`를 클릭 설명 용어로 등록했다.
- 2회독 reminder도 새 step 단위에 맞춰 추가했다.

### 어떻게 수정했나

- `모델링 단계`는 먼저 `개념적 → 논리적 → 물리적` 전체 순서를 한 번 보여주고, 이후 각 단계를 따로 익히게 했다.
- `개념적 모델링`은 “큰 그림”, `논리적 모델링`은 “키·관계·중복 제거”, `물리적 모델링`은 “DBMS·자료형·인덱스·성능”으로 구분했다.
- `ANSI/SPARC`는 먼저 `외부·개념·내부` 암기 순서를 보여주고, 이후 각 스키마를 사용자 화면 / 조직 전체 통합 구조 / 실제 저장 구조로 나눴다.
- `데이터 독립성`은 시험에서 헷갈리는 `논리적 독립성`과 `물리적 독립성`을 각각 “개념 스키마 변경 영향 감소”, “내부 저장 구조 변경 영향 감소”로 설명했다.
- 문제 정답 위치는 A로 몰리지 않게 섞었다.

### 왜 이렇게 수정했나

- SQLD 초반 모델링 파트는 용어가 한꺼번에 나오면 사용자가 “좋은 UI의 책”처럼 느낄 가능성이 높다.
- `개념적/논리적/물리적`은 이름만 외우는 것이 아니라 “언제 무엇을 결정하는 단계인지”를 알아야 이후 엔터티, 속성, 식별자, 정규화로 자연스럽게 이어진다.
- `ANSI/SPARC`도 “3층 구조” 자체보다 각 층이 어떤 사람 또는 시스템 관점을 뜻하는지 잡아야 데이터 독립성 문제가 쉬워진다.
- 따라서 이번 수정은 정보량을 줄인 것이 아니라, 한 화면에서 판단해야 하는 개념 수를 줄이는 방향으로 진행했다.

### 사용자에게 기대되는 좋은 영향

- 모바일 화면에서 한 말풍선 안에 들어오는 정보가 줄어 처음 보는 사용자의 부담이 낮아진다.
- 사용자는 `개념적 → 논리적 → 물리적`, `외부 → 개념 → 내부`를 순서 암기와 의미 이해를 동시에 할 수 있다.
- 각 단계 뒤에 바로 문제를 풀기 때문에 “방금 본 단어를 실제 시험 보기에서 어떻게 구분하는지”를 즉시 연습한다.
- 클릭 설명이 있는 용어는 흐름을 끊지 않고 필요할 때만 짧게 확인할 수 있다.

### 발견한 개념·표현 문제

- 기존 흐름은 `모델링 단계`와 `ANSI/SPARC`를 한 step 안에서 처리해 초보자가 `단계`, `스키마`, `독립성`을 동시에 받아들여야 했다.
- `DBMS`, `인덱스`, `스키마`는 SQLD에서 핵심 용어지만 초반 사용자에게는 낯설 수 있어, 설명 없이 바로 던지면 학습 저항이 생긴다.
- `ERD`도 개념적 모델링에서 자연스럽게 등장하지만, 아직 본격 설명 전이므로 “뒤에서 더 자세히 볼 것”이라고 안내해 현재 학습 부담을 줄였다.
- `개념 스키마` 확인 문제의 기존 표현은 “스키마 구조”, “모든 사용자 관점”, “조직 전체 관점의 통합적 표현”처럼 시험지 원문에 가까워 초보자가 의미를 잡기 어려웠다. 그래서 `학교 전체 DB의 중앙 설계도` 비유로 바꾸고, 사용자별 화면과 실제 저장 방식이 아니라는 비교 단서를 함께 넣었다.
- 다만 `학교 전체 DB의 중앙 설계도` 문제를 ANSI/SPARC 전체 소개 직후에 배치하면, 아직 외부/개념/내부 스키마를 각각 배우기 전이라 순서가 맞지 않았다. 그래서 전체 소개 step의 문제는 `외부·개념·내부` 3층 이름 확인으로 바꾸고, 중앙 설계도 문제는 `개념 스키마` 전용 step으로 옮겼다.
- `데이터 독립성`은 “변경 영향 감소”라는 목적을 먼저 잡지 않으면 논리적/물리적 독립성의 차이가 암기 문제로만 남는다.
- `데이터 독립성` step은 논리적 독립성과 물리적 독립성의 정의만 있고 예시가 부족했다. 그래서 `장학금 정보 추가 후 학생 성적 화면 유지`를 논리적 독립성 예시로, `인덱스/저장 위치 변경 후 화면과 DB 구조 설명 유지`를 물리적 독립성 예시로 추가했다.
- 이후 물리적 독립성 예시의 `인덱스` 표현이 초반 사용자에게 어려울 수 있어, `성적 데이터를 더 빠른 저장공간으로 옮겨도 학생 화면이 그대로`라는 예시로 낮췄다.
- SQLD 1-1 앞부분의 진행 트레일이 `개념 진행 18/18`처럼 너무 길게 보여 모바일에서 부담이 컸다. 그래서 step group을 `기초`, `특징`, `관점`, `단계`, `스키마`로 나누고, 화면 라벨도 `특징 진행`, `관점 진행`, `단계 진행`, `스키마 진행`처럼 세분화했다.
- 세분화 후 `기초` 그룹은 step이 1개라 트레일이 아예 사라지는 문제가 있었다. 첫 시작 맥락은 필요하므로 `기초 진행 · 1 / 1`은 예외적으로 노출하도록 조정했다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`
- `src/data/reminders.ts`
- `src/game/lesson/GlossaryKeyword.tsx`
- `src/data/gameModes.ts`
- `src/data/lessons/lessons.integration.test.ts`
- `src/pages/StudyMethodPage.tsx`
- `src/components/sections/CTA.tsx`
- `src/lib/curriculum.ts`
- `src/pages/CurriculumPage.tsx`
- `supabase/migrations/0050_seed_sqld_modeling_stages_and_schema_drills.sql`

### 현재 콘텐츠 카운트 영향

- SQLD concept-practice는 `65문항` 기준으로 갱신된다.
- SQLD 레슨 스텝은 `65 step`, 전체 레슨 스텝은 `316 step` 기준으로 갱신된다.
- 전체 playable 문항 표기는 `733문항` 기준으로 갱신된다.
- `node scripts/validate-questions.mjs` 기준 전체 raw 문항 수는 `734`가 되어야 한다.

### 서버 반영 내역

- 로컬 레슨이 v2 서버 문제 발급과 어긋나지 않도록 `sqld-1-1-cp-02`, `sqld-1-1-cp-02-conceptual`, `sqld-1-1-cp-02-logical`, `sqld-1-1-cp-02-physical`, `sqld-1-1-cp-03`, `sqld-1-1-cp-03-external`, `sqld-1-1-cp-03-conceptual`, `sqld-1-1-cp-03-internal`, `sqld-1-1-cp-03-independence`를 Supabase `questions`에 upsert했다.
- 서버 반영 후 각 id의 `answer_index`, 정답 보기, `is_playable=true`를 조회해 검증했다.

### 검증 기록

- `node scripts/validate-questions.mjs` 통과: 전체 raw 문항 `734`, 결함 `0`.
- `npm run typecheck` 통과.
- `npm test -- --run` 통과: `35`개 테스트 파일, `515`개 테스트 통과.
- `npm run build` 통과: sitemap `336 URL`, lesson `316`, quiz `0`.
- 브라우저에서 `#/game/sqld`의 새 step 목록 렌더링, `개념적 모델링 — 큰 그림 그리기` 진입, `ANSI/SPARC 3-스키마 + 데이터 독립성`과 `데이터 독립성` step 노출, 콘솔 에러 없음 확인.

### 다음 편집에 적용할 기준

- 긴 개념은 “전체 지도 1개 + 하위 개념 여러 개”로 나눈다.
- 각 하위 개념은 되도록 한 화면에 들어가는 말풍선 길이로 유지한다.
- 생소한 시험 용어는 클릭 설명 또는 직후 쉬운 문장 중 하나로 처리한다.
- 로컬 문제를 추가하면 Supabase seed와 총량 표기를 같이 갱신한다.

## 2026-05-23 — SQLD 엔터티/성능 파트 마이크로 스텝 세분화

### 사용자가 발견한 문제

- SQLD 1과목 후반의 엔터티·속성·관계·식별자와 데이터 모델 성능 파트가 ADSP 1과목보다 훨씬 긴 책식 설명으로 묶여 있었다.
- 초보자는 “엔터티 5요건 + 명명 규칙”, “속성 3×3×3”, “트랜잭션 ACID + 격리수준” 같은 제목만 봐도 부담을 느낄 수 있었다.
- 한 노드 안에서 여러 개념을 한꺼번에 읽고 한 문제만 푸는 구조라, 실제로 어떤 하위 개념을 이해했는지 확인하기 어려웠다.

### 수정한 방향

- SQLD 1-1의 기존 7개 큰 스텝을 23개 마이크로 스텝으로 세분화했다.
- SQLD 1-2의 기존 8개 큰 스텝을 29개 마이크로 스텝으로 세분화했다.
- 각 마이크로 스텝마다 전용 concept-practice 문제를 1개씩 연결했다.
- 설명 톤은 “시험 요약”보다 “처음 보는 사용자가 예시로 따라오는 말투”로 낮췄다.
- 정답 위치가 한쪽으로 몰리지 않도록 answerIndex를 섞었다.

### 사용자에게 주는 좋은 영향

- 모바일 화면에서 한 번에 읽어야 하는 문장량이 줄어든다.
- 사용자가 “방금 배운 한 개념”을 바로 문제로 확인하므로 기억 고리가 짧아진다.
- 엔터티/속성/관계/정규화처럼 초보자가 처음 막히는 용어를 더 천천히 받아들일 수 있다.
- 나중에 문제 품질을 개선할 때 어떤 하위 개념의 문제가 약한지 더 정확히 추적할 수 있다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`

- `src/data/reminders.ts`
- SQLD concept-practice는 `102문항` 기준으로 갱신된다.
- SQLD 레슨 스텝은 `102 step`, 전체 레슨 스텝은 `353 step` 기준으로 갱신된다.
- 전체 playable 문항 표기는 `770문항` 기준으로 갱신된다.
- `node scripts/validate-questions.mjs` 기준 전체 raw 문항 수는 `771`가 되어야 한다.

### 검증

- `node scripts/validate-questions.mjs` 통과: 전체 raw 문항 `771`, 결함 `0`.
- `npm run typecheck` 통과.
- `npm test -- --run` 통과: 35 files, 515 tests.
- `npm run build` 통과: sitemap `373 URL`, lesson `353`, quiz `0`.

### 문제 수정 운영 단계

앞으로 Codex를 통해 개념/문제를 수정할 때는 아래 3단계를 하나의 작업 단위로 본다.

1. **Codex가 문제 수정**
   - 사용자의 의도, 실제 수정 내용, 왜 그렇게 바꿨는지, 사용자에게 주는 학습 효과를 이 로그에 기록한다.
   - 로컬 파일 기준으로 `LessonStep`, `quizId`, `concept-practice`, `reminders`, 표시 카운트를 함께 맞춘다.
   - 최소 검증은 `node scripts/validate-questions.mjs`, `npm run typecheck`, 필요 시 테스트/빌드까지 수행한다.

2. **사용자가 검수**
   - 사용자가 `localhost` 브라우저에서 실제 학습 흐름, 문장 난이도, 모바일 가독성, 정답/해설 납득 가능성을 확인한다.
   - 사용자가 짚은 이상한 개념, 과도한 문장, 순서 문제, 보기 편향은 다시 이 로그에 남기고 수정한다.
   - 이 단계가 끝나기 전에는 “콘텐츠 완료”로 보지 않는다.

3. **Supabase 연동**
   - v2 서버 문제풀이에서는 Supabase `public.questions`가 채점과 XP 지급의 기준이므로, 로컬 문제 수정분을 서버 문제은행에 반드시 upsert한다.
   - Supabase 반영 전에는 화면에는 새 문제가 보여도 서버가 예전 문제/정답 기준으로 채점할 수 있어 XP가 오르지 않을 수 있다.
   - 반영 후에는 대상 `question_id` 개수, 대표 문항의 `stem`, `choices`, `answer_index`, `is_playable=true`를 조회해 로컬과 서버가 맞는지 확인한다.
   - 이번 SQLD 1-1/1-2 마이크로 스텝 작업의 Supabase seed 파일은 `supabase/migrations/0051_seed_sqld_entity_performance_micro_steps.sql`이다.

### Supabase 연동 기록

- 반영 전 `public.questions`에 존재한 대상 문항은 `14 / 52`개였다.
- `0051_seed_sqld_entity_performance_micro_steps.sql` 기준 SQLD 1-1/1-2 마이크로 스텝 문항 `52`개를 Supabase `public.questions`에 upsert했다.
- 반영 후 대상 문항은 `52 / 52`개로 확인했고, 누락 ID는 없었다.
- 대표 검증 문항:
  - `sqld-1-1-cp-04`: 서버 지문이 “엔터티(Entity)에 가장 가까운 설명은?”으로 갱신됐고, 정답은 `0`번이다.
  - `sqld-1-1-cp-04-requirements`: 서버 지문이 “엔터티의 요건으로 옳지 않은 것은?”으로 갱신됐고, 정답은 `2`번이다.
  - `sqld-1-2-cp-08-practice`: 서버 지문/보기/정답이 로컬 문제은행과 일치하고 `is_playable=true`다.
- 이 반영으로 로컬 화면의 새 SQLD 문제와 서버 채점 기준이 맞춰져, 정답인데 XP가 `240 → 250`으로 유지되지 않던 원인을 제거했다.

## 2026-05-23 — SQLD 로드맵 제목 부연 설명 제거

### 사용자가 발견한 문제

- SQLD 로드맵의 개념 제목이 `외부 스키마 — 사용자별 화면`처럼 제목과 부연 설명을 한 줄에 같이 보여줬다.
- 모바일 화면에서는 step 목록을 빠르게 훑어야 하는데, `—` 뒤 설명이 붙으면 제목이 길어져 화면이 답답해 보였다.

### 수정한 방향

- SQLD 레슨의 `LessonStep.title`에 한해서 `—` 뒤 부연 설명을 일괄 제거했다.
- 예: `외부 스키마 — 사용자별 화면` → `외부 스키마`
- 본문 카드, keypoints, dialogue, 문제 지문/보기/해설은 건드리지 않았다. 학습 중 필요한 설명은 그대로 남겨 로드맵만 간결하게 보이도록 했다.

### 사용자에게 주는 좋은 영향

- SQLD 로드맵에서 개념명이 짧고 일정하게 보여 모바일 스캔 속도가 빨라진다.
- 사용자는 “어디를 풀고 있는지”를 먼저 파악하고, 자세한 설명은 해당 step 안에서 확인할 수 있다.
- ADSP 제목 구성은 건드리지 않아 이번 요청의 범위를 SQLD에만 제한했다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/lessons/sqld/ch2-sql.ts`

## 2026-05-23 — SQLD 엔터티 5요건 설명 세분화

### 사용자가 발견한 문제

- `업무 필요·식별 가능·인스턴스 2개 이상·속성 보유·관계 보유`처럼 5요건을 한 줄로만 제시해 초보자가 각각의 의미를 이해하기 어려웠다.
- 특히 `식별 가능`, `인스턴스`, `속성`, `관계`는 SQLD를 처음 접하는 사용자가 용어 자체에서 막힐 수 있었다.

### 수정한 방향

- `엔터티 5요건` dialogue를 한 문장 암기형에서 5개의 짧은 설명 카드로 나눴다.
- 각 요건마다 수강신청 예시를 붙였다.
  - 업무 필요: 실제 업무에서 관리해야 하는 대상
  - 식별 가능: 학번, 과목코드처럼 각각을 구분하는 기준
  - 인스턴스 2개 이상: 실제 사례가 여러 건 존재해야 함
  - 속성 보유: 이름, 학번, 학과처럼 설명하는 값
  - 관계 보유: 학생과 과목처럼 다른 엔터티와 연결됨
- 블록 설명과 keypoints도 같은 기준으로 풀어서, 사용자가 복습 카드에서 다시 봐도 의미가 살아나도록 정리했다.

### 사용자에게 주는 좋은 영향

- 사용자가 5요건을 단순 암기어가 아니라 “DB 표 후보를 판단하는 체크리스트”로 이해할 수 있다.
- 다음 문제에서 “엔터티 요건이 아닌 것”을 물어도 각 선택지를 스스로 제거할 근거가 생긴다.
- 모바일 화면에서는 한 번에 긴 문단을 읽는 대신 한 요건씩 넘겨보는 흐름이 되어 부담이 줄어든다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`

## 2026-05-23 — SQLD SQL 기본/활용/관리 구문 로드맵 정리

### 사용자가 발견한 문제

- SQLD SQL 파트의 로드맵 제목이 `SELECT 실행 순서 — "FWGHSO" 프웨그하셀오`, `LAG / LEAD / FIRST_VALUE + 범위 지정 (ROWS · RANGE)`, `CREATE TABLE + 데이터 타입 + 제약`처럼 모바일에서 길고 부담스럽게 보였다.
- `관계대수`, `윈도우 함수`, `CREATE TABLE`, `제약조건`처럼 초보자가 첫 화면에서 의미를 바로 잡기 어려운 개념도 압축된 설명 위주였다.

### 수정한 방향

- SQLD 2과목의 `LessonStep.title`을 로드맵용 짧은 제목으로 정리했다.
  - `SELECT 실행 순서 — "FWGHSO" 프웨그하셀오` → `SELECT 실행 순서`
  - `LAG / LEAD / FIRST_VALUE + 범위 지정 (ROWS · RANGE)` → `행 간 참조 함수`
  - `TOP N · 비율 · 계층형 · PIVOT/UNPIVOT` → `TOP N과 응용`
  - `CREATE TABLE + 데이터 타입 + 제약` → `CREATE TABLE`
  - `제약조건 6종 + CTAS + VIEW` → `제약조건`
- 긴 제목에서 빠진 부가 설명은 본문/대화 안에서 다루도록 유지했다.
- 초보자가 막히기 쉬운 개념에는 진입 문장을 보강했다.
  - 관계대수: 릴레이션을 일단 테이블로 생각하도록 안내
  - 윈도우 함수: 행을 줄이지 않고 각 행 옆에 계산값을 붙이는 기능으로 설명
  - 행 간 참조 함수: LAG는 이전 행, LEAD는 다음 행으로 설명
  - CREATE TABLE: 새 표의 설계도를 만드는 명령으로 설명
  - 제약조건: 이상한 데이터가 들어오지 못하게 막는 안전장치로 설명

### 사용자에게 주는 좋은 영향

- 로드맵에서 한눈에 “지금 어떤 개념을 배우는지”만 먼저 보이므로 모바일 스캔 부담이 줄어든다.
- 암기어와 약어가 제목에 과하게 노출되지 않아 SQL을 처음 접하는 사용자의 거부감이 줄어든다.
- 자세한 정보는 본문에 남겨 두었기 때문에 시험에 필요한 범위는 줄이지 않고, 첫 진입 장벽만 낮춘다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`

## 2026-05-23 — SQLD 2과목 개념 진행 표시 복구

### 사용자가 발견한 문제

- SQLD 2과목 레슨에 들어가면 SQLD 1과목에서 보이던 하단 `개념 진행` 트레일이 보이지 않았다.
- 사용자는 지금 보고 있는 설명이 SQLD 2과목 전체 흐름에서 어느 위치인지 알기 어려웠다.

### 수정한 방향

- SQLD 2과목 step을 학습 흐름 단위로 묶는 `group` 메타데이터를 추가했다.
  - SQL 기본: `SQL 기초`, `함수`, `조건·정렬`
  - SQL 활용: `JOIN`, `서브쿼리`, `집합·그룹`, `윈도우`, `정규식`
  - 관리 구문: `DML`, `트랜잭션`, `DDL`, `권한`
- `DialogueLesson`의 진행 트레일 라벨을 위 그룹에 맞게 확장했다.
- SQLD 2과목은 그룹이 1개짜리여도 진행 트레일을 보여 주도록 조정했다.

### 사용자에게 주는 좋은 영향

- 사용자가 SQLD 2과목에서도 “지금 배우는 묶음 안에서 몇 번째인지”를 바로 파악할 수 있다.
- 긴 SQL 과목을 무작정 넘기는 느낌이 줄고, `SQL 기초 → 함수 → 조건·정렬`처럼 작은 단위로 정복하는 감각이 생긴다.
- 모바일 화면에서 학습 위치를 잃는 문제가 줄어든다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`
- `src/game/lesson/DialogueLesson.tsx`

## 2026-05-24 — SQLD 엔터티 유무형 분류 설명 세분화

### 사용자가 발견한 문제

- `유형은 만질 수 있는 대상, 개념은 생각으로 구분하는 대상, 사건은 어떤 일이 발생한 기록이야.`라는 문장이 한 번에 세 분류를 모두 설명하고 있었다.
- SQLD를 처음 보는 사용자는 `유형`, `개념`, `사건`을 각각 무엇으로 떠올려야 하는지 잡기 어렵고, 모바일 화면에서도 한 문장 안에 정보가 너무 몰려 보였다.

### 수정한 방향

- `유형`, `개념`, `사건`을 각각 별도 dialogue 카드로 나눴다.
- 각 분류마다 `정의 → 쉬운 예시` 순서로 설명했다.
  - 유형: 눈에 보이거나 만질 수 있는 대상. 학생, 책, 고객.
  - 개념: 만질 수는 없지만 기준으로 구분할 수 있는 대상. 학과, 과목, 부서.
  - 사건: 어떤 일이 발생했다는 기록. 수강신청, 주문, 결제.
- 레슨 본문 표와 2회독 reminder도 같은 표현으로 맞춰, 첫 학습과 복습에서 다른 설명이 나오지 않게 했다.

### 사용자에게 주는 좋은 영향

- 사용자가 유무형 분류를 암기어가 아니라 “대상을 어떻게 떠올리면 되는지”로 이해할 수 있다.
- 문제에서 `수강신청`, `학과`, `학생` 같은 예시가 나왔을 때 어떤 분류인지 스스로 판단하기 쉬워진다.
- 모바일 학습에서 한 화면에 세 개념이 몰리지 않아 읽기 부담이 줄어든다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/reminders.ts`

## 2026-05-24 — SQLD 엔터티 유무형 분류 확인 문제 추가

### 사용자가 발견한 문제

- `수강신청`을 보고 사건 엔터티를 고르는 문제는 있었지만, 같은 분류 안의 `유형 엔터티`, `개념 엔터티`를 직접 고르는 문제가 없었다.
- 설명은 세 분류를 모두 다루는데 문제는 사건 하나만 확인하므로, 사용자가 유형/개념을 제대로 구분했는지 검증하기 어려웠다.

### 수정한 방향

- 기존 `엔터티 분류` 스텝에 `extraQuizIds`를 추가해, 사건 문제 뒤에 유형/개념 확인 문제가 이어서 나오게 했다.
- 추가한 문제는 초보자에게 익숙한 예시를 기준으로 만들었다.
  - `학생` → 실제로 존재하고 눈에 보이는 대상 → 유형 엔터티
  - `학과` → 만질 수는 없지만 기준으로 구분하는 대상 → 개념 엔터티
- 정답 위치를 B/D로 배치해, 앞선 문제와 같은 선택지 패턴으로 외우는 일을 줄였다.

### 사용자에게 주는 좋은 영향

- 유무형 분류를 `사건` 하나만 맞히고 넘어가지 않고, 세 분류를 모두 한 번씩 확인하게 된다.
- 사용자가 시험 보기에서 `학생`, `학과`, `수강신청` 같은 예시를 만났을 때 분류 기준을 빠르게 떠올릴 수 있다.
- 새 로드맵 스텝을 늘리지 않고 같은 스텝 안에 이어 붙여, 학습 흐름은 유지하면서 연습량만 보강한다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`

## 2026-05-24 — SQLD 엔터티 진행 트레일 라벨 정리

### 사용자가 발견한 문제

- 하단 진행 트레일에서 `엔터티란 무엇인가`, `엔터티 5요건`, `엔터티 이름 짓기`가 한 묶음으로 보이는데, 사용자는 이 묶음이 `엔터티 5요건` 안에 모든 개념이 들어간 것처럼 느꼈다.
- 실제 의도는 `엔터티 5요건` 하위가 아니라, 세 개념을 `엔터티 기초`라는 상위 흐름으로 묶는 것이다.

### 수정한 방향

- `sqld-1-1-g6-entity` 그룹의 진행 라벨을 `엔터티 기초 진행`으로 명시했다.
- 이어지는 `유무형/발생시점/기준 구분` 묶음은 `엔터티 분류 진행`으로 보이도록 라벨을 추가했다.
- 콘텐츠 구조 자체는 유지했다. `엔터티란 무엇인가 → 엔터티 5요건 → 엔터티 이름 짓기`는 모두 엔터티 기초에 속하는 흐름이므로 같은 그룹으로 두는 것이 맞다.

### 사용자에게 주는 좋은 영향

- 사용자가 `엔터티 이름 짓기`가 `엔터티 5요건`의 하위 개념이라고 오해하지 않는다.
- 현재 학습 위치가 `엔터티 기초`인지 `엔터티 분류`인지 더 명확하게 보인다.
- 모바일 하단 진행 표시가 단순 진행률이 아니라 개념 구조를 안내하는 역할을 하게 된다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`

## 2026-05-24 — SQLD 엔터티 유무형 분류 ERD 시각화 추가

### 사용자가 발견한 문제

- `유형·개념·사건` 분류는 말로만 설명하면 초보자가 실제 DB 모델에서 어떻게 보이는지 연결하기 어렵다.
- 사용자는 `학생 — 수강 — 과목` 형태의 ERD 예시를 참고로 제시했고, 이를 이미지가 아니라 반응형 CSS/코드 기반 시각 자료로 넣을 수 있는지 확인했다.

### 수정한 방향

- `엔터티 분류` 스텝(`sqld-1-1-s5-kind`)의 narrate 화면 하단에 반응형 ERD 컴포넌트를 추가했다.
- 이미지 파일을 삽입하지 않고 SVG + CSS 스타일로 직접 렌더링했다.
  - 학생: 유형 엔터티
  - 수강: 사건 엔터티
  - 과목: 개념 엔터티
- 모바일 폭에서는 `max-width`와 `viewBox`를 통해 자동 축소되고, 접근성을 위해 `title`, `desc`, `figcaption`을 함께 넣었다.

### 사용자에게 주는 좋은 영향

- 사용자가 `유형/사건/개념`을 단어 암기가 아니라 실제 모델 그림 안에서 이해할 수 있다.
- `수강`이 단순 명사가 아니라 학생과 과목 사이에서 발생한 일을 기록하는 사건 엔터티라는 감각이 생긴다.
- 이미지 파일보다 유지보수가 쉬워, 나중에 색·문구·관계선을 앱 톤에 맞게 바로 조정할 수 있다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`

## 2026-05-24 — SQLD 엔터티 ERD 모바일 가독성 개선

### 사용자가 발견한 문제

- PC에서는 가로 ERD가 괜찮지만, 모바일에서는 `학생-수강-과목` 전체를 한 장으로 축소하면서 글자가 너무 작아졌다.
- QuestDP는 모바일 중심 플랫폼이므로, 작은 ERD를 확대해서 보게 만드는 방식은 학습 흐름에 맞지 않는다.

### 수정한 방향

- 모바일에서는 가로 ERD를 숨기고, `학생 → 수강 → 과목`을 세로 카드형 ERD로 보여주도록 분기했다.
- 각 카드 안에 엔터티명, 분류명, 쉬운 설명, 주요 속성을 크게 배치했다.
- 태블릿/PC(`md` 이상)에서는 기존 가로 ERD를 유지해 넓은 화면의 구조감을 살렸다.

### 사용자에게 주는 좋은 영향

- 모바일 사용자가 화면을 확대하지 않아도 `유형/사건/개념`과 예시 속성을 바로 읽을 수 있다.
- 관계를 한 줄 그림으로만 보지 않고, 세 엔터티가 어떤 역할인지 순서대로 따라가며 이해할 수 있다.
- 데스크톱에서는 기존 ERD의 전체 구조를 유지해 화면 크기별로 적합한 학습 경험을 제공한다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`

## 2026-05-24 — SQLD 엔터티 모바일 ERD 다크 패널 리디자인

### 사용자가 발견한 문제

- 모바일 ERD가 커지긴 했지만, 흰색 표 배경이 QuestDP의 다크 우주 UI 안에서 튀어 보였다.
- 밝은 표 형태라 카드 자체는 커졌어도 `앱 안의 학습 도식`이라기보다 외부 문서 이미지를 붙인 느낌이 강했다.

### 수정한 방향

- 모바일 ERD 카드를 흰 배경에서 다크 글래스 패널로 변경했다.
- 각 엔터티 카드에 왼쪽 컬러 라인, 은은한 컬러 글로우, 분류 라벨 pill, 속성 chip을 적용했다.
- 엔터티 사이에는 단순 `관계` 문구 대신 `1 : N`, `N : 1` 관계 배지를 넣어 ERD의 흐름을 더 자연스럽게 보이게 했다.

### 사용자에게 주는 좋은 영향

- 화면 전체 톤이 QuestDP 게임 UI와 이어져, 학습 도식이 페이지 안에 자연스럽게 녹아든다.
- 모바일에서도 엔터티명, 분류명, 속성이 구분되어 더 빠르게 스캔된다.
- 사용자가 `학생 → 수강 → 과목` 관계를 시각적으로 따라가며 사건 엔터티의 위치를 이해하기 쉬워진다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`

## 2026-05-24 — SQLD 엔터티 모바일 ERD 아이콘 추가 및 글로우 제거

### 사용자가 발견한 문제

- 모바일 ERD 카드에 은은한 빛/글로우 효과가 남아 있어 학습용 도식치고 시각적으로 산만했다.
- `학생`, `수강`, `과목`이 모두 텍스트 중심이라, 처음 보는 사용자가 각 엔터티의 성격을 그림으로 빠르게 잡기 어려웠다.

### 수정한 방향

- 모바일 ERD에서 컬러 글로우, blur 장식, 점 주변 glow를 제거했다.
- 각 엔터티 제목 옆에 단순 선 아이콘을 추가했다.
  - 학생: 사람 아이콘
  - 수강: 기록/목록 아이콘
  - 과목: 책 아이콘
- 어두운 카드와 컬러 라벨은 유지하되, 장식보다 정보가 먼저 보이도록 정리했다.

### 사용자에게 주는 좋은 영향

- 모바일 화면에서 도식이 덜 번쩍이고 더 차분하게 읽힌다.
- 사용자가 글을 읽기 전에도 `학생=사람`, `수강=기록`, `과목=학습 대상`이라는 의미를 직관적으로 잡을 수 있다.
- QuestDP의 게임 UI 톤은 유지하면서도 문제 설명에 필요한 시각 정보만 남는다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`

## 2026-05-24 — SQLD 엔터티 ERD 외곽 프레임 제거

### 사용자가 발견한 문제

- 모바일 ERD 전체를 감싸는 바깥 figure 테두리와 배경 때문에 내부 카드가 한 번 더 갇힌 느낌이 들었다.
- 이미 각 엔터티 카드가 개별 패널 역할을 하므로, 외곽 프레임은 시각적으로 중복이었다.

### 수정한 방향

- ERD 전체 wrapper의 테두리, 배경, 패딩, 그림자를 제거했다.
- 내부 엔터티 카드와 관계 배지만 남겨 화면이 더 가볍게 보이도록 했다.

### 사용자에게 주는 좋은 영향

- 모바일 화면에서 도식이 답답하게 둘러싸인 느낌이 줄어든다.
- 사용자의 시선이 외곽 박스가 아니라 `학생 → 수강 → 과목` 카드 흐름에 바로 간다.
- QuestDP의 기존 레슨 화면 여백과 더 자연스럽게 어울린다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`

## 2026-05-24 — SQLD 엔터티 모바일 ERD 색상 통일

### 사용자가 발견한 문제

- 모바일 ERD의 `학생`, `수강`, `과목` 카드가 각각 청록·노랑·보라로 나뉘어 화면 안에서 색이 너무 많아 보였다.
- SQLD 레슨 화면의 주 색이 보라 계열인데, ERD만 여러 색을 쓰면서 학습 도식보다 상태 카드처럼 보였다.

### 수정한 방향

- 모바일 ERD의 카드 라인, 아이콘, 분류 라벨, 관계 점을 SQLD 보라 계열(`#c084fc`)로 통일했다.
- 관계 연결선도 보라 계열의 낮은 투명도로 정리해, 색보다 구조가 먼저 보이게 했다.

### 사용자에게 주는 좋은 영향

- 한 화면 안의 색 정보가 줄어들어 모바일에서 더 차분하게 읽힌다.
- 사용자는 색을 분류 기준으로 착각하지 않고, `유형/사건/개념` 텍스트와 카드 구조에 집중할 수 있다.
- SQLD 과목 화면 전체 톤과 ERD 도식이 더 자연스럽게 이어진다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`

## 2026-05-24 — SQLD 엔터티 ERD 대사 진행 연동

### 사용자가 발견한 문제

- `유형은 눈에 보이거나 만질 수 있는 대상이야.`라는 대사가 나올 때 이미 학생·수강·과목 전체 ERD가 함께 보여, 현재 배우는 개념과 도식의 초점이 맞지 않았다.
- `개념`, `사건` 설명도 각각 나오는 시점에 맞춰 도식이 이어져야 했다.

### 수정한 방향

- `엔터티 분류` 스텝의 현재 대사 순서에 따라 ERD 노출 범위를 나눴다.
  - 유형 설명/예시 대사: 학생 카드만 표시
  - 개념 설명/예시 대사: 과목 카드만 표시
  - 사건 설명/예시 대사: 수강 카드만 표시
  - 마지막 정리 대사: 학생 → 수강 → 과목 전체 ERD 표시
- PC용 가로 ERD는 전체 정리 시점에만 보이게 하고, 개별 개념 설명 중에는 모바일과 같은 단일 카드 도식을 보여준다.

### 사용자에게 주는 좋은 영향

- 사용자가 방금 나온 설명과 바로 대응되는 그림만 보게 되어 인지 부담이 줄어든다.
- 유형/개념/사건을 각각 독립적으로 이해한 뒤, 마지막에 전체 관계 구조로 묶어 볼 수 있다.
- 도식이 단순 장식이 아니라 대사 흐름을 따라가는 학습 보조 장치가 된다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`

## 2026-05-24 — SQLD 엔터티 ERD 인스턴스와 속성 구분

### 사용자가 발견한 문제

- `학생` 카드 안에 `학번`, `생년월일`, `이름`이 바로 나열되어 있어, 사용자가 이것들을 유형 엔터티의 예시로 오해할 수 있었다.
- 특히 `생년월일`은 눈에 보이거나 만질 수 있는 대상이 아니므로, `유형 엔터티` 설명과 충돌하는 것처럼 보일 수 있었다.

### 수정한 방향

- 모바일 ERD 카드 구조를 `엔터티 → 인스턴스 예시 → 속성`으로 분리했다.
  - 학생: 인스턴스 예시 `김민지`, 속성 `학번/생년월일/이름`
  - 수강: 인스턴스 예시 `김민지의 SQL 기본 수강`, 속성 `학번/과목명/학점`
  - 과목: 인스턴스 예시 `SQL 기본`, 속성 `과목명/강의실/교수`
- `인스턴스 예시`와 `속성` 라벨을 별도로 표시해, 엔터티 분류와 속성 개념이 섞이지 않도록 했다.

### 사용자에게 주는 좋은 영향

- 사용자가 `유형 엔터티`는 학생이라는 대상 자체를 말하고, `생년월일`은 학생을 설명하는 속성이라는 차이를 바로 이해할 수 있다.
- 뒤에서 배울 `엔터티/인스턴스/속성` 구분을 초반부터 자연스럽게 준비할 수 있다.
- ERD가 단순 예쁜 카드가 아니라 데이터 모델링의 기본 단위 관계를 설명하는 도식으로 기능한다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`

## 2026-05-24 — SQLD 엔터티 ERD 용어 팝업 추가

### 사용자가 발견한 문제

- ERD 카드에 `인스턴스 예시`, `속성`을 분리해 표시했지만, 처음 배우는 사용자는 `인스턴스`라는 말 자체를 모를 수 있었다.
- 라벨만 추가하면 “김민지”가 왜 인스턴스이고, `학번/생년월일/이름`이 왜 속성인지 스스로 추론해야 했다.

### 수정한 방향

- 기존 DB/엔터티 설명과 같은 바텀 팝업 패턴을 재사용했다.
- `인스턴스 예시` 라벨을 누르면 “엔터티에 실제로 들어가는 한 건의 예시”라는 설명이 뜨도록 했다.
- `속성` 라벨을 누르면 “엔터티를 설명하는 항목”이라는 설명이 뜨도록 했다.
- `속성` 설명도 학생 예시 기준으로 더 정확하게 다듬었다.

### 사용자에게 주는 좋은 영향

- 초보자가 ERD 카드에서 낯선 단어를 만났을 때 화면을 벗어나지 않고 즉시 뜻을 확인할 수 있다.
- `엔터티`, `인스턴스`, `속성`의 차이가 한 화면 안에서 자연스럽게 연결된다.
- 이후 엔터티 5요건, 속성 분류, 식별자 개념으로 넘어갈 때 용어 장벽이 낮아진다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `src/game/lesson/GlossaryKeyword.tsx`

## 2026-05-24 — SQLD 엔터티 ERD 등장 모션 추가

### 사용자가 발견한 문제

- 엔터티 분류 설명 중 ERD 카드가 갑자기 나타나서 화면이 심심하고, 학습 흐름 안에서 등장하는 느낌이 약했다.
- 특히 모바일에서는 한 카드가 화면 중간에 바로 생기면 사용자의 시선 이동이 부자연스러울 수 있었다.

### 수정한 방향

- ERD figure 자체에 `opacity`, `y`, `scale`, `blur` 기반의 짧은 spring 모션을 추가했다.
- `유형 → 개념 → 사건 → 전체 ERD`로 대사가 바뀔 때마다 도식이 살짝 올라오며 나타나도록 했다.
- 전체 ERD에서는 카드와 관계 배지가 아주 짧은 간격으로 순서대로 등장하게 해, `학생 → 수강 → 과목` 흐름을 더 자연스럽게 따라가게 했다.
- 과한 반짝임이나 큰 이동은 넣지 않고, 학습을 방해하지 않는 정도의 움직임만 적용했다.

### 사용자에게 주는 좋은 영향

- 도식이 갑자기 끼어드는 느낌이 줄고, 방금 나온 설명과 연결된 학습 자료처럼 느껴진다.
- 모바일 사용자가 새로 나타난 카드에 자연스럽게 시선을 옮길 수 있다.
- 전체 관계를 볼 때 `학생 → 수강 → 과목` 순서가 시각적으로 더 잘 읽힌다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`

## 2026-05-24 — SQLD 엔터티 분류 추가 문제 Supabase 동기화

### 사용자가 발견한 문제

- `엔터티 분류` 레슨에서 추가 문제로 넘어갈 때 `문제 이용권을 확인하지 못했어요` 토스트가 뜨며 풀이가 막혔다.
- 로컬에는 `유형 엔터티`, `개념 엔터티` 확인 문제가 추가되어 있었지만, 서버 문제은행에는 해당 두 문제 ID가 아직 없었다.

### 수정한 방향

- Supabase `questions` 테이블에 누락된 두 문제를 동기화했다.
  - `sqld-1-1-cp-05-kind-type`
  - `sqld-1-1-cp-05-kind-concept`
- 같은 내용의 DB 마이그레이션을 추가해, 나중에 다른 환경에서도 서버 문제은행이 같은 상태로 맞춰지게 했다.
- 사용자에게 보이는 실패 문구는 `이용권` 문제가 아니라 문제 로드 실패로 이해되도록 `문제를 불러오지 못했어요`로 정리했다.

### 사용자에게 주는 좋은 영향

- `사건 엔터티` 문제 뒤에 이어지는 `유형 엔터티`, `개념 엔터티` 문제도 서버 권위 흐름에서 정상적으로 예약된다.
- 로컬에서 맞힌 XP/진행도가 새로고침 뒤 사라지는 일을 줄이고, 서버 기준 학습 기록과 연결된다.
- 오류가 다시 발생해도 사용자는 결제/이용권 문제가 아니라 문제 로드 문제로 더 정확히 이해할 수 있다.

### 반영 파일

- `supabase/migrations/0054_seed_sqld_entity_kind_followup_drills.sql`
- `src/game/lesson/DialogueLesson.tsx`
- `src/game/screens/LessonScreen.tsx`

## 2026-05-24 — SQLD 데이터 독립성 논리/물리 문제 분리

### 사용자가 발견한 문제

- `데이터 독립성` 스텝에서 물리적 독립성 문제만 먼저 확인하고 있어, 논리적 독립성 예시를 배운 직후 바로 확인하는 문제가 부족했다.
- 직전 수정에서 논리적 독립성 예시가 나오는 순간 물리적 독립성 그림이 하이라이트되는 타이밍 오류가 있었기 때문에, 문제 추가도 순서가 어긋나면 다시 혼란을 만들 수 있었다.

### 수정한 방향

- `데이터 독립성` 스텝의 첫 문제를 `논리적 독립성` 확인 문제로 바꿨다.
  - 새 문제 ID: `sqld-1-1-cp-03-logical-independence`
  - 정답은 “장학금 정보를 DB 전체 구조에 추가해도 기존 학생 성적 화면은 그대로다”로 설정했다.
- 기존 `물리적 독립성` 문제는 `extraQuizIds`로 뒤에 이어지게 했다.
- 대사 흐름은 `논리적 독립성 설명/예시 → 물리적 독립성 설명/예시 → 논리 문제 → 물리 문제` 순서가 되도록 정리했다.
- 서버 문제 예약 오류가 나지 않도록 Supabase `questions` 테이블 seed 마이그레이션도 함께 추가했다.

### 사용자에게 주는 좋은 영향

- 사용자는 논리적 독립성과 물리적 독립성을 각각 배운 직후 별도 문제로 확인할 수 있다.
- “구조가 바뀌면 논리, 저장 방식이 바뀌면 물리”라는 구분 기준이 문제 풀이를 통해 더 단단하게 남는다.
- 로컬 문제은행과 Supabase 문제은행의 ID가 맞아, 추가 문제에서 문제 로드/예약 오류가 재발할 가능성이 줄어든다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`
- `supabase/migrations/0055_seed_sqld_logical_independence_drill.sql`

## 2026-05-25 — SQLD 관계 ERD 표기 도식 추가

### 사용자가 발견한 문제

- `차수와 선택사양` 개념을 말로만 설명하면, 실제 ERD에서 선 끝의 `|`, `O`, 까마귀발 모양을 어떻게 읽어야 하는지 연결이 약했다.
- 첨부 예시처럼 IE 표기법과 Barker 표기법의 차이를 한 번에 보여주는 시각 설명이 필요했다.
- 초보자는 `1:N`, `선택`, `필수`라는 말을 들어도 실제 학생-수강내역 관계에서 어떤 의미인지 바로 감을 잡기 어렵다.

### 수정한 방향

- `차수와 선택사양` 스텝의 대사 뒤에 ERD 표기 설명을 추가했다.
  - ERD는 차수와 선택사양을 선 끝 기호로 압축해서 보여준다고 연결했다.
  - `|`는 반드시 하나, `O`는 없어도 됨, 까마귀발은 여러 개라는 기본 해석을 먼저 제시했다.
  - 학생 한 명과 수강내역 여러 건 예시로 바로 이어지게 했다.
- `관계란 무엇인가` 스텝에서 ERD가 처음 언급될 때, 뒤에서 선 읽는 법을 볼 것이라는 예고 문장을 덧붙였다.
- `DialogueLesson`에 `RelationshipErdDiagram`을 추가했다.
  - `notation` 모드: `1:1 필수`, `1:1 선택`, `1:N 필수`, `1:N 선택`을 IE/Barker 표기 카드로 비교한다.
  - `example` 모드: 학생과 수강내역 엔터티를 카드로 보여주고, 학생 1명은 수강내역 0..N건을 가질 수 있다는 관계를 도식화한다.
- 기존 엔터티 ERD처럼 등장 모션을 넣어, 설명 문장이 바뀔 때 도식이 자연스럽게 나타나도록 했다.
- 도식이 보이는 동안에는 하단 개념 진행 목록을 숨겨 모바일 첫 화면의 시각 부담을 줄였다.

### 사용자에게 주는 좋은 영향

- 사용자는 관계의 3요소 중 `차수`와 `선택사양`을 시험 용어가 아니라 실제 ERD 기호로 읽는 법까지 함께 익힌다.
- IE/Barker 표기법을 외우는 표가 아니라 `필수/선택`, `하나/여러 개`의 의미로 이해할 수 있다.
- 이후 식별자 관계, 비식별자 관계, 교차 엔터티 문제를 볼 때 ERD 선 모양을 더 빠르게 해석할 수 있다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/game/lesson/DialogueLesson.tsx`

## 2026-05-25 — SQLD 관계 3요소 암기어 표현 정리

### 사용자가 발견한 문제

- `관차선 구성요소를 골라보자`라는 문장이 `관차선` 자체를 공식 개념처럼 보이게 만들 수 있었다.
- 실제 핵심 개념은 `관계명·차수·선택사양`이고, `관차선`은 그 세 단어를 기억하기 위한 암기 도구일 뿐이다.

### 수정한 방향

- 레슨 대사를 `관계의 3요소에 포함되지 않는 것을 골라보자`로 바꿨다.
- 문제 문항도 `관계의 3요소에 포함되지 않는 것은?`으로 정리했다.
- 해설에서만 “관차선은 관계명, 차수, 선택사양을 기억하기 위한 암기어”라고 설명하도록 바꿨다.
- 실제 플레이에서 서버가 내려주는 문항도 같은 표현이 되도록 Supabase 문제은행을 동기화하고 마이그레이션을 추가했다.

### 사용자에게 주는 좋은 영향

- 사용자는 암기어와 실제 시험 개념을 혼동하지 않는다.
- `관차선`을 외워도, 답을 고를 때는 관계의 3요소를 기준으로 판단하게 된다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`
- `supabase/migrations/0056_update_sqld_relationship_elements_copy.sql`

## 2026-05-25 — SQLD 식별자 분류 축약 표현 해소

### 사용자가 발견한 문제

- `주/보조, 내부/외부, 단일/복합, 본질/인조`처럼 축약해서 보여주면 처음 배우는 사용자는 각각이 모두 `식별자` 분류라는 사실을 바로 알아차리기 어렵다.
- 특히 `주식별자/보조식별자`처럼 전체 명칭을 먼저 보여준 뒤, 한 쌍씩 설명해야 개념이 누락되지 않는다.

### 수정한 방향

- `식별자 4가지 분류` 대사에서 모든 분류명을 전체 명칭으로 줄바꿈 처리했다.
  - `주식별자/보조식별자`
  - `내부식별자/외부식별자`
  - `단일식별자/복합식별자`
  - `본질식별자/인조식별자`
- `먼저 주식별자/보조식별자부터 알아보자` 흐름을 추가했다.
- 네 쌍 모두를 한 문장씩 풀어서 설명했다.
- 상세 표도 축약어 대신 전체 명칭과 쉬운 예시로 바꿨다.
- 로컬 문제 해설도 `주/보조` 같은 축약어 대신 전체 식별자 명칭으로 정리했다.
- Supabase 문제은행 반영용 마이그레이션을 추가했고, 라이브 DB의 기존 문제 해설도 같은 표현으로 동기화했다.

### 사용자에게 주는 좋은 영향

- 사용자는 축약어를 해독하느라 멈추지 않고, 어떤 기준으로 식별자를 나누는지 바로 따라갈 수 있다.
- `주식별자`, `내부식별자`, `복합식별자`, `인조식별자`처럼 시험에 나오는 실제 용어가 더 정확하게 남는다.
- 이후 `주식별자 4요건`, `식별자 관계`, `본질식별자 vs 인조식별자`로 이어지는 흐름이 부드러워진다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`
- `supabase/migrations/0057_update_sqld_identifier_types_copy.sql`

## 2026-05-25 — SQLD 식별자 분류 추가 확인 문제 3개

### 사용자가 발견한 문제

- `식별자 4가지 분류`에서 전체 분류 기준은 묻고 있었지만, 다음 세 쌍을 각각 확인하는 문제가 없었다.
  - `내부식별자/외부식별자`
  - `단일식별자/복합식별자`
  - `본질식별자/인조식별자`
- 설명만 보고 넘어가면 실제 사례에서 어떤 분류인지 고르는 힘이 약할 수 있었다.

### 수정한 방향

- `식별자 4가지 분류` 스텝에 `extraQuizIds` 3개를 추가했다.
- 새 문제를 각각 다음 기준으로 만들었다.
  - 수강내역이 학생의 학번을 가져와 참조하는 상황 → `외부식별자`
  - 학번과 과목ID를 함께 묶어 구분하는 상황 → `복합식별자`
  - 시스템이 자동 생성한 주문ID로 구분하는 상황 → `인조식별자`
- SQLD 랜딩 카운트도 실제 playable 문항 수에 맞춰 `353문항`에서 `356문항`으로 갱신했다.
- Supabase 문제은행 반영용 seed 마이그레이션을 추가했고, 라이브 DB에도 새 문제 3개를 upsert했다.
- 이후 SQLD 1과목 레슨에서 참조하는 `quizId`/`extraQuizIds`가 Supabase `questions`에 모두 존재하는지 대조해 누락 0건을 확인했다.

### 사용자에게 주는 좋은 영향

- 사용자는 네 가지 식별자 분류 기준을 단순 암기하지 않고, 실제 예시에서 바로 구분해볼 수 있다.
- 뒤에 나오는 `식별자 관계`, `본질식별자 vs 인조식별자` 개념으로 넘어가기 전 기초 분류가 더 단단해진다.
- 추가 문제들이 같은 스텝 안에서 이어져 나오기 때문에 학습 흐름이 끊기지 않는다.

### 반영 파일

- `src/data/lessons/sqld/ch1-modeling.ts`
- `src/data/questions/sqld/concept-practice.json`
- `src/data/gameModes.ts`
- `supabase/migrations/0058_seed_sqld_identifier_type_followup_drills.sql`

## 2026-05-25 — 재발 방지 기록: 로컬 문제 추가 후 Supabase 미동기화 오류

### 실제로 발생한 문제

- `식별자 4가지 분류` 스텝에 `extraQuizIds`로 새 문제 3개를 연결했다.
- 로컬 JSON과 레슨 파일은 정상이라 `typecheck`, 레슨 통합 테스트, 빌드는 통과했다.
- 하지만 실제 플레이에서는 `문제를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.` 토스트가 떴다.
- 원인은 로컬에 추가한 문제 ID가 Supabase `public.questions`에 아직 없었기 때문이다.
- QuestDP v2 문제풀이 구조는 클라이언트 문제은행만으로 문제를 시작하지 않는다. 레슨 문제 진입 시 `start_lesson_question` RPC가 Supabase `questions`에서 해당 `question_id`를 찾아 세션을 예약한다.
- 따라서 로컬 `concept-practice.json`에 문제가 있어도, 서버 `questions`에 같은 `id`가 없으면 사용자는 문제 화면으로 들어갈 수 없다.

### 왜 이 실수가 위험한가

- 로컬 테스트만 보면 문제가 없어 보인다.
- `getQuizQuestion()`은 로컬 JSON에서 문제를 찾기 때문에 레슨 통합 테스트는 통과할 수 있다.
- 그러나 실제 사용자는 서버 예약 단계를 거치므로, Supabase 누락은 런타임에서만 터진다.
- 특히 `extraQuizIds`는 기존 문제 뒤에 이어서 호출되므로, 앞부분은 정상처럼 보이다가 특정 시점에서 갑자기 실패한다.
- 이 상태로 배포하면 “콘텐츠는 보이는데 문제만 안 열리는” 가장 헷갈리는 장애가 된다.

### 이번에 확인한 직접 원인

- 누락됐던 서버 문제 ID:
  - `sqld-1-1-cp-08-types-internal-external`
  - `sqld-1-1-cp-08-types-single-composite`
  - `sqld-1-1-cp-08-types-natural-surrogate`
- Supabase에서 다음 대조 쿼리로 누락 여부를 확인했다.

```sql
with expected(id) as (
  select unnest(array[
    'sqld-1-1-cp-08-types-internal-external',
    'sqld-1-1-cp-08-types-single-composite',
    'sqld-1-1-cp-08-types-natural-surrogate'
  ]::text[])
)
select expected.id
from expected
left join public.questions q using (id)
where q.id is null
order by expected.id;
```

- 처음에는 3개가 모두 누락되어 있었다.
- `supabase/migrations/0058_seed_sqld_identifier_type_followup_drills.sql` 내용을 라이브 Supabase에 upsert했다.
- 이후 SQLD 1과목 레슨에서 참조하는 전체 `quizId`/`extraQuizIds`를 Supabase `questions`와 대조했고 누락 0건을 확인했다.

### 앞으로 문제를 추가할 때 반드시 지킬 체크리스트

1. `src/data/questions/.../concept-practice.json`에 새 문제를 추가한다.
2. `src/data/lessons/...`에서 `quizId` 또는 `extraQuizIds`로 연결한다.
3. `src/data/gameModes.ts`의 표시 문항 수를 실제 playable 수와 맞춘다.
4. Supabase 반영용 migration 또는 seed SQL을 만든다.
5. 라이브 Supabase `public.questions`에 같은 `id`를 upsert한다.
6. 로컬 검증을 실행한다.
   - `node scripts/validate-questions.mjs --file=src/data/questions/sqld/concept-practice.json`
   - `npm test -- --run src/data/lessons/lessons.integration.test.ts src/data/gameModes.test.ts`
   - `npm run typecheck`
   - `npm run build`
7. 서버 대조 쿼리로 `quizId`/`extraQuizIds` 누락이 0건인지 확인한다.
8. 브라우저에서 실제로 해당 스텝의 `문제 풀기` 버튼을 눌러 서버 예약이 되는지 확인한다.

### 절대 하지 말아야 할 우회

- 서버에 없는 문제를 클라이언트 로컬 문제은행에서 바로 풀게 만드는 fallback을 만들지 않는다.
- `start_lesson_question` 실패를 조용히 무시하고 다음 문제로 넘기지 않는다.
- XP가 안 오르는 문제를 “로컬호스트라서 그런 것”으로 추정하지 않는다.
- Supabase 반영 전에는 “수정 완료”라고 말하지 않는다.

### 다음 Codex가 기억해야 할 한 줄

`quizId` 또는 `extraQuizIds`를 추가했다면, 로컬 JSON 수정만으로는 끝난 것이 아니다. 반드시 Supabase `public.questions`에 같은 `id`가 있어야 실제 플레이, 채점, XP 지급이 정상 작동한다.

## 2026-05-26 — SQLD 2과목 SQL 4명령군 DDL 암기 보강

### 사용자가 발견한 문제

- `CREATE (생성), ALTER (변경), DROP (삭제), RENAME (이름 변경), TRUNCATE (행 전체 삭제)!`처럼 대표 명령을 나열만 하고 지나가고 있었다.
- 초보 사용자는 이 목록을 어떻게 외워야 하는지 알기 어렵다.
- 암기해야 하는 묶음 뒤에 바로 확인 문제가 붙어야 하는데, DDL 5개 묶음에는 별도 보강 문제가 없었다.
- DDL만 암기법이 붙고 DML, DCL, TCL에는 같은 요약 흐름이 적용되지 않아 학습 리듬이 끊겼다.

### 수정 방향

- DDL 대표 명령 5개를 `TCARD(티카드)`로 묶었다.
  - `T = TRUNCATE`
  - `C = CREATE`
  - `A = ALTER`
  - `R = RENAME`
  - `D = DROP`
- DML 대표 명령 5개를 `SIDUM(시둠)`으로 묶었다.
  - `S = SELECT`
  - `I = INSERT`
  - `D = DELETE`
  - `U = UPDATE`
  - `M = MERGE`
- DCL은 `GR(지알)`, TCL은 `CRS(커롤세)`로 간단히 묶었다.
- 단순히 “외우자”로 끝내지 않고, `TRUNCATE는 행을 비우지만 DDL`이라는 시험 함정을 함께 설명했다.
- 같은 스텝의 `extraQuizIds`에 `sqld-2-1-cp-01-ddl-tcard`를 추가해 암기법 직후 바로 확인하게 했다.

### 사용자에게 주는 좋은 영향

- 긴 SQL 명령어 목록을 무작정 외우는 느낌이 줄어든다.
- `TRUNCATE`를 `DELETE`와 헷갈리는 대표 함정을 초반부터 잡을 수 있다.
- SQL 4명령군 전체가 같은 리듬으로 정리되어 사용자가 “이 부분은 외워야 하는 묶음”이라고 인식하기 쉽다.
- “개념 나열 → 암기법 → 바로 문제” 흐름이 생겨 모바일 학습 중 이탈 가능성을 줄인다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`
- `src/data/questions/sqld/concept-practice.json`
- `src/data/gameModes.ts`
- `supabase/migrations/0064_update_sqld_ch2_beginner_drills.sql`

### Supabase 반영 상태

- 새 문제 ID `sqld-2-1-cp-01-ddl-tcard`를 Supabase `public.questions`에 upsert했다.
- 서버 대조 쿼리로 `stem`, `choices`, `answer_index=1`이 반영된 것을 확인했다.

## 2026-05-27 — SQLD 2과목 전체 도식 보강 및 후속 문제 추가

### 사용자가 발견한 문제

- SQLD 2과목 `SQL 기본 및 활용`은 SQL 문법이 많이 나오는데, 글과 표만으로 설명하면 처음 보는 사용자가 “이 SQL이 어떤 순서로 움직이는지”를 한눈에 잡기 어렵다.
- 특히 `관계대수`, `WHERE`, `JOIN`, `서브쿼리`, `윈도우 함수`, `TCL`, `DELETE/TRUNCATE/DROP`, `제약조건`은 그림으로 먼저 보면 이해가 빠른 영역이다.
- 기존 한 문제만으로는 도식 직후 확인이 부족한 step이 있었다.

### 수정 방향

- `DialogueLesson`에 SQLD 2과목 전용 도식 모드를 추가했다.
  - SQL 기본: 명령군, 관계대수, SELECT 실행 순서, 별칭/DISTINCT, 문자·숫자·날짜·집계·NULL·CASE 함수, WHERE, GROUP BY/HAVING, ORDER BY
  - SQL 활용: JOIN 4종, JOIN 표기, CROSS/SELF, 서브쿼리, 다중행 비교, 집합 연산자, ROLLUP/CUBE, 윈도우 함수, TOP N, 정규표현식
  - 관리 구문: DML, MERGE, TCL, AUTOCOMMIT, CREATE TABLE, DELETE/TRUNCATE/DROP, 제약조건, DCL
- 핵심 step 8곳에 후속 확인 문제를 추가했다.
  - `sqld-2-1-cp-02-sql-map`
  - `sqld-2-1-cp-10-where-flow`
  - `sqld-2-2-cp-01-left-join`
  - `sqld-2-2-cp-04-subquery-place`
  - `sqld-2-2-cp-08-rank-dense`
  - `sqld-2-3-cp-03-savepoint-rollback`
  - `sqld-2-3-cp-06-ddl-delete-compare`
  - `sqld-2-3-cp-07-pk-unique-null`
- 새 문제를 각 step의 `extraQuizIds`에 연결하고, `gameModes.ts`의 SQLD 문항 수를 실제 playable 수에 맞춰 갱신했다.
- Supabase 반영용 migration `0068_seed_sqld_ch2_visual_followup_drills.sql`을 추가했다.

### 사용자에게 주는 좋은 영향

- 사용자는 긴 SQL 설명을 읽기 전에 “표 → SQL → 결과” 또는 “명령 → 효과”를 그림으로 먼저 본다.
- SQLD 2과목에서 가장 어려운 문법 파트가 책식 설명이 아니라 모바일 카드형 개념 흐름으로 바뀐다.
- 새 문제 ID가 Supabase에 반영되도록 migration을 함께 만들었기 때문에, 로컬에서는 보이지만 실제 플레이에서 `문제를 불러오지 못했어요`가 뜨는 사고를 막을 수 있다.

### 반영 파일

- `src/game/lesson/DialogueLesson.tsx`
- `src/data/lessons/sqld/ch2-sql.ts`
- `src/data/questions/sqld/concept-practice.json`
- `src/data/gameModes.ts`
- `supabase/migrations/0068_seed_sqld_ch2_visual_followup_drills.sql`

### Supabase 반영 상태

- MCP handshaking timeout으로 이 세션에서 라이브 `public.questions` 직접 upsert는 수행하지 못했다.
- 대신 migration에 새 문제 8개를 모두 포함했다. 배포/마이그레이션 적용 단계에서 이 SQL을 라이브 DB에 적용해야 완료로 본다.

## 2026-05-27 — SQLD 2과목 말투 1과목 톤으로 정리

### 사용자가 발견한 문제

- SQLD 2과목 일부 문장이 SQLD 1과목에 비해 너무 압축적이었다.
- 예: `HAVING 은 GROUP BY 후라 집계함수 사용 가능!`처럼 요약노트/시험특강 말투가 남아 있어 초보자가 부담스럽게 느낄 수 있었다.

### 수정 방향

- `시험 빈출`, `단골`, `함정`, `OK`, `사용 가능/불가` 같은 압축 표현을 줄였다.
- `WHERE와 HAVING`, `SELECT 실행 순서`, `문자 함수`, `집계함수 NULL 처리`, `JOIN`, `TCL`, `DCL` 등에서 “왜 그런지”를 설명하는 1과목식 말투로 바꿨다.
- 기계적 치환 중 `REVOKE`의 `OK`가 잘못 바뀔 수 있음을 확인하고 즉시 복구했다. 이후 SQL 키워드 내부 문자열은 기계 치환 대상에서 제외해야 한다.

### 사용자에게 주는 좋은 영향

- SQLD 2과목이 “문법 암기 요약”이 아니라 “처음 보는 사람도 순서대로 이해하는 설명”에 가까워진다.
- 특히 GROUP BY/HAVING처럼 헷갈리는 구간에서 사용자가 왜 WHERE가 안 되는지 자연스럽게 이해할 수 있다.
- ADSP/SQLD 1과목과 2과목의 말투 통일성이 좋아져 앱 전체 경험이 덜 딱딱해진다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`

### Supabase 반영 상태

- 새 문제 ID를 추가하지 않은 말투/설명 변경이므로 별도 Supabase migration은 필요하지 않다.

## 2026-05-31 — SQLD SELECT 실행 순서 이후 학습 순서 재배치

### 사용자가 발견한 문제

- `SELECT 실행 순서`에서 FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY 흐름을 배운 뒤, 실제 로드맵은 ALIAS, 함수, NULL, CASE로 빠졌다.
- 사용자는 SQL 처리 순서를 막 배운 직후라 `WHERE 절`, `GROUP BY · HAVING`, `ORDER BY`를 바로 이어서 배우는 편이 더 자연스럽다고 지적했다.

### 수정 방향

- `SQL 기본` 레슨 배열에서 기존 `WHERE 절`, `GROUP BY · HAVING`, `ORDER BY` step을 `SELECT 실행 순서` 바로 뒤로 이동했다.
- 기존 `step id`, `quizId`, `extraQuizIds`, 문제 내용은 그대로 유지했다.
- 이후 흐름은 `ALIAS와 DISTINCT` → `문자 함수` → `숫자·날짜 함수` → `집계 함수` → `NULL 처리 함수` → `CASE와 DECODE`로 이어지게 했다.

### 사용자에게 주는 좋은 영향

- 사용자는 실행 순서를 배운 직후 WHERE, GROUP BY/HAVING, ORDER BY를 실제 절 단위로 확장해서 배운다.
- SQL 문장을 한 번에 외우는 느낌보다 “처리 순서 → 각 절의 역할”로 자연스럽게 연결된다.
- 함수와 별칭은 기본 절 흐름을 잡은 뒤 배우므로, 초보자가 SQL 문법 덩어리에 압도될 가능성이 줄어든다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`

### Supabase 반영 상태

- 새 문제 ID를 추가하지 않고 레슨 노출 순서만 바꾼 작업이므로 별도 Supabase migration은 필요하지 않다.

## 2026-05-31 — SQLD NULL 처리 함수 단계 분리

### 사용자가 발견한 문제

- `NULL 처리 함수` step의 시각 자료가 `NVL`, `COALESCE`, `NULLIF`를 한 번에 보여줘 처음 보는 사용자가 이해하기 어렵다.
- 이름이 비슷한 함수들이 한 카드에 몰려 있어 “각 함수가 언제 쓰이는지”보다 “표를 통째로 외워야 한다”는 느낌을 준다.

### 수정 방향

- 기존 `NULL 처리 함수` step을 `NVL`, `NVL2`, `NULLIF`, `COALESCE` 4단계로 분리했다.
- 각 단계마다 SQL 예시 그림을 따로 보여주도록 `DialogueLesson`에 NULL 함수 전용 SQL 도식을 추가했다.
  - `NVL`: 전화번호가 NULL이면 `미등록`
  - `NVL2`: 보너스가 있으면 `있음`, 없으면 `없음`
  - `NULLIF`: 시도횟수 0을 NULL로 바꿔 0 나누기 오류 회피
  - `COALESCE`: 휴대폰 → 집전화 → 이메일 순서로 첫 NOT NULL 선택
- 기존 서버에 이미 있는 문제 ID만 재배치했다.
  - `sqld-sql-lab-009`는 COALESCE/NULLIF 확인 문제로 연결
  - `sqld-2-1-cp-08`은 CASE/DECODE NULL 비교 문제로 이동
  - `sqld-2-1-cp-09`는 CASE/DECODE 후속 문제로 유지

### 사용자에게 주는 좋은 영향

- 사용자는 NULL 함수 네 개를 한 번에 외우지 않고, 한 함수씩 SQL 문장과 결과표를 보며 이해할 수 있다.
- `Oracle 전용` 함수와 `표준 SQL` 함수의 차이를 단계별로 익히므로 실전 SQL 해석 부담이 줄어든다.
- 기존 서버 문제 ID를 재사용해 “로컬에서는 보이지만 실제 앱에서는 문제를 못 불러오는” 사고를 피한다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`
- `src/game/lesson/DialogueLesson.tsx`
- `src/data/gameModes.ts`
- `src/data/lessons/lessons.integration.test.ts`

### Supabase 반영 상태

- 새 문제 ID를 추가하지 않았고, 이미 Supabase에 존재하는 문제 ID를 재배치한 작업이므로 별도 migration은 필요하지 않다.

## 2026-05-31 — SQLD JOIN 도입부 말투와 도식 흐름 개선

### 사용자가 발견한 문제

- `JOIN 4종` 도입부가 `JOIN은 여러 테이블을 한 결과로 묶는 도구`, `JOIN 종류 4가지`처럼 요약노트 말투로 보였다.
- SQLD 1과목의 단계적 설명 톤과 달라져, SQL 활용 파트에 들어오자 갑자기 차갑고 압축적인 느낌이 났다.

### 수정 방향

- JOIN을 “서로 떨어져 있는 표를 연결해 사람이 읽기 좋은 결과표로 만드는 방법”으로 풀어 설명했다.
- `사원` 표와 `부서` 표를 `부서ID`로 붙이는 상황을 먼저 보여주고, 그다음 `INNER`, `LEFT OUTER`, `RIGHT/FULL OUTER`, 정리 순서로 진행되게 했다.
- `DialogueLesson`의 JOIN 도식을 고정 4종 카드에서 진행형 도식으로 바꿨다.
  - 입문: 사원 표 + 부서 표 + 같은 값끼리 연결
  - INNER: 양쪽에 맞는 행만 남김
  - LEFT: 왼쪽 표를 모두 지키고 없는 오른쪽 값은 NULL
  - RIGHT/FULL: 오른쪽 또는 양쪽 보존
  - 요약: 문제에서는 “어느 쪽 행을 남길지” 먼저 보기

### 사용자에게 주는 좋은 영향

- 사용자는 JOIN을 종류 이름부터 외우지 않고, 왜 테이블을 붙이는지부터 이해한다.
- OUTER JOIN을 “보존해야 하는 쪽”으로 판단하게 되어 행 수 문제와 실전 SQL 해석이 쉬워진다.
- SQLD 2과목도 1과목과 같은 친절한 말투를 유지하게 된다.

### 반영 파일

- `src/data/lessons/sqld/ch2-sql.ts`
- `src/game/lesson/DialogueLesson.tsx`

### Supabase 반영 상태

- 새 문제 ID를 추가하지 않은 설명/도식 변경이므로 별도 Supabase migration은 필요하지 않다.


## 2026-05-31 - Same-concept drill pack connection hardening

### User problem

- The feedback action for same-concept practice should feel like a focused concept drill pack.
- Steps without `extraQuizIds` could still rely on a broad fallback, so related but not exact old questions could appear in a way that felt random.
- Creating hundreds of new ADSP/SQLD questions in one pass would raise content accuracy and Supabase sync risk.

### Change direction

- Did not generate new question IDs in this pass.
- Reused already reviewed lesson-group questions that already exist in the local bank and server-backed IDs.
- Selection priority is now: explicit `quizId + extraQuizIds` first, then same narrow lesson group in authored order.
- Removed the old random shuffle / two-item fallback behavior.
- Added `scripts/audit-drill-packs.mjs` to check missing IDs, duplicate pack IDs, and groups that still need more authored questions.

### Learner impact

- After a wrong answer, learners now see more stable questions from the same concept family.
- Existing reviewed questions are reused before writing new ones, reducing the chance of wrong content.
- Remaining weak packs are now measurable and can be filled chapter by chapter.

### Files changed

- `src/game/similarQuestions.ts`
- `src/game/similarQuestions.test.ts`
- `scripts/audit-drill-packs.mjs`
- `docs/content-edit-log.md`

### Supabase status

- No new `quizId` or `extraQuizIds` were added.
- No migration is required for this pass because the runtime only reuses existing question IDs.
- `audit-drill-packs` confirmed 0 missing lesson-referenced question IDs.

## 2026-06-03 — 컴활 001 레슨을 ADSP/SQLD식 대화 흐름으로 교정

### 사용자가 발견한 문제

- 컴활 1과목 `한글 Windows 10의 특징` 첫 카드가 긴 설명문처럼 보여서 “UI 예쁜 책”처럼 느껴졌다.
- 문제와 핵심 포인트가 같은 화면 아래에 항상 노출되어 ADSP/SQLD의 `짧은 개념 → 문제 풀기 → 피드백 → 다음 개념` 흐름과 달랐다.

### 수정 방향

- 컴활 개념 화면을 큰 요약 카드가 아니라 ADSP/SQLD처럼 짧은 말풍선 중심으로 바꿨다.
- `문제 풀기`를 누른 뒤에만 선택지가 나오게 해서, 개념과 문제가 한 화면에 섞이지 않게 했다.
- Windows 10 특징 카드 5개의 대사를 70자 이하의 짧은 문장으로 줄였다.
- 테스트에 말풍선 길이 제한을 추가해 같은 문제가 다시 생기지 않게 했다.

### 사용자에게 주는 좋은 영향

- 사용자는 한 화면에서 한 개념만 보고 바로 문제로 확인한다.
- 컴활도 ADSP/SQLD와 같은 학습 리듬을 가져, 새 과목처럼 따로 노는 느낌이 줄어든다.
- 문제는 “아래에 붙은 부록”이 아니라 개념 직후의 확인 단계로 동작한다.

### 반영 파일

- `src/game/screens/GalaxyScreen.tsx`
- `src/data/comhwal/concepts.ts`
- `src/data/comhwal/concepts.test.ts`
- `docs/content-edit-log.md`

### Supabase 반영 상태

- 새 문제 ID를 추가하지 않았다.
- 컴활 로컬 준비 문제의 표시 방식과 대사만 조정한 작업이라 Supabase migration은 필요하지 않다.

## 2026-06-03 — 컴활 1과목 전체를 ADSP/SQLD식 마이크로 학습 구조로 강제

### 사용자가 발견한 문제

- 컴활 1과목 화면에 `CONCEPT CARD`, `핵심 포인트`, `시험 포인트`가 한 번에 크게 보여 “예쁜 책”처럼 느껴졌다.
- ADSP/SQLD처럼 `짧은 개념 대사 → 문제 풀기 → 피드백 → 다음 개념` 흐름이 아니라, 개념 요약 카드가 화면 아래에 계속 붙어 있었다.
- 한 토픽의 카드가 너무 많이 한 섹션에 묶여 있어 개념 진행이 무겁게 보였다.

### 수정 방향

- 컴활 1과목 `컴퓨터 일반` 001~059 전체를 짧은 마이크로 카드 구조로 유지했다.
- 모든 카드에 바로 확인할 수 있는 로컬 개념 문제를 붙였다.
- 화면에서는 책형 요약 카드 대신 ADSP/SQLD처럼 캐릭터, 말풍선, 이전/문제/다음 흐름만 보이게 정리했다.
- 섹션이 5카드를 넘지 않도록 자동 분할해 한 묶음이 길어지는 문제를 막았다.
- 테스트에 다음 회귀 방지 규칙을 넣었다.
  - 모든 섹션은 5카드 이하
  - 모든 001~059 토픽은 최소 2카드 이상
  - 모든 카드에는 즉시 확인 문제가 존재
  - 카드 제목과 본문은 모바일 말풍선 기준으로 짧게 유지
  - 딱딱한 교재 문체 금지

### 사용자에게 주는 좋은 영향

- 컴활도 ADSP/SQLD와 같은 학습 리듬으로 보인다.
- 한 화면에서 한 개념만 짧게 보고 바로 문제로 확인할 수 있다.
- 추후 2과목, 3과목으로 확장할 때도 같은 규칙을 테스트가 잡아준다.

### 반영 파일

- `src/data/comhwal/concepts.ts`
- `src/data/comhwal/concepts.test.ts`
- `src/game/screens/GalaxyScreen.tsx`
- `docs/content-edit-log.md`

### Supabase 반영 상태

- 이번 문제는 컴활 로컬 개념 카드용 준비 문제다.
- ADSP/SQLD의 서버 문제 `quizId`/`extraQuizIds`를 새로 추가한 작업이 아니므로 Supabase migration은 필요하지 않다.

## 2026-06-03 — 컴활 Windows 10 첫 설명을 6살 기준으로 재작성

### 사용자가 발견한 문제

- `Windows 10은 사람과 컴퓨터 사이를 이어 주는 운영체제야`라는 식의 설명은 운영체제를 처음 듣는 사용자에게 너무 모호했다.
- “사람과 컴퓨터 사이를 이어 준다”는 말만으로는 무엇을 실제로 해 주는지 상상하기 어려웠다.
- 문제도 앞에서 배운 개념만으로 풀기보다, 운영체제라는 용어를 이미 알고 있어야 하는 느낌이 있었다.

### 수정 방향

- 001번 첫 흐름을 `컴퓨터는 혼자 못 알아들어 → 운영체제는 컴퓨터 안내 선생님 → Windows 10은 운영체제 이름` 순서로 낮췄다.
- 운영체제를 “중간 도우미”, “안내 선생님”으로 먼저 설명해서 초등학생도 역할을 떠올릴 수 있게 했다.
- 첫 문제는 `컴퓨터가 네 클릭을 이해하도록 도와주는 중간 도우미는?`처럼 방금 배운 비유를 그대로 확인하게 바꿨다.
- 카드별 `questionPrompt`와 `wrongChoices`를 더 구체화해서, 선지가 무관한 예전 문제처럼 섞이지 않게 했다.

### 사용자에게 주는 좋은 영향

- 운영체제라는 말을 몰라도 “왜 Windows가 필요한지”부터 이해할 수 있다.
- 첫 문제를 풀 때 용어 암기가 아니라 방금 들은 설명을 근거로 답을 고를 수 있다.
- 컴활도 QuestDP의 방향인 “아무것도 모르는 사람이 단번에 이해”에 더 가까워졌다.

### 반영 파일

- `src/data/comhwal/concepts.ts`
- `docs/content-edit-log.md`

### Supabase 반영 상태

- 새 `quizId` 또는 `extraQuizIds`를 추가하지 않았다.
- 컴활 로컬 개념 확인 문제의 문구와 선지 생성 기준을 조정한 작업이라 Supabase migration은 필요하지 않다.
