type VisualProfile = {
  eyebrow: string;
  pattern: string;
  flow: readonly [string, string, string];
};

export type ComhwalVisualFocus =
  | 'generic'
  | 'cell'
  | 'ribbon'
  | 'formula-bar'
  | 'name-box'
  | 'sheet-tab'
  | 'workbook'
  | 'worksheet'
  | 'input-value'
  | 'pointer'
  | 'format'
  | 'fill-handle'
  | 'search'
  | 'option'
  | 'edit'
  | 'protect'
  | 'condition'
  | 'error'
  | 'relative-reference'
  | 'absolute-reference'
  | 'named-range'
  | 'function'
  | 'argument'
  | 'result'
  | 'lookup'
  | 'criteria'
  | 'chart-data'
  | 'chart-element'
  | 'chart-type'
  | 'freeze'
  | 'page'
  | 'print'
  | 'sort'
  | 'filter'
  | 'external-data'
  | 'subtotal'
  | 'pivot-field'
  | 'scenario'
  | 'goal-cell'
  | 'macro'
  | 'vba'
  | 'variable'
  | 'branch'
  | 'object'
  | 'data-store'
  | 'deduplicate'
  | 'dbms'
  | 'table'
  | 'record'
  | 'field'
  | 'key'
  | 'foreign-key'
  | 'relationship'
  | 'integrity'
  | 'import'
  | 'export'
  | 'select'
  | 'where'
  | 'order'
  | 'group'
  | 'join'
  | 'subquery'
  | 'action-query'
  | 'parameter'
  | 'form'
  | 'control'
  | 'property'
  | 'subform'
  | 'report'
  | 'section'
  | 'event'
  | 'recordset';

export type ComhwalExpansionVisualModel = {
  eyebrow: string;
  title: string;
  lead: string;
  flow: string[];
  chips: string[];
  pattern: string;
  kind: string;
  focus: ComhwalVisualFocus;
  focusLabel: string;
};

export type ComhwalVisualCardInput = {
  topicId: string;
  title: string;
  body: string;
  keyPoints: readonly string[];
};

const profile = (
  eyebrow: string,
  pattern: string,
  flow: readonly [string, string, string],
): VisualProfile => ({ eyebrow, pattern, flow });

export const COMHWAL_TOPIC_VISUAL_PROFILES = {
  '060': profile('EXCEL SCREEN', 'sheet-workspace-grid', ['리본', '셀 A1', '시트 탭']),
  '061': profile('WORKBOOK TABS', 'sheet-workbook-tabs', ['통합 문서', '워크시트', '시트 이동']),
  '062': profile('CELL INPUT', 'sheet-input-bar', ['선택', '입력줄', '셀 값']),
  '063': profile('DATA FORMAT', 'sheet-format-preview', ['원본 값', '표시 형식', '보이는 값']),
  '064': profile('FILL HANDLE', 'sheet-fill-series', ['첫 값', '끌기', '연속 채우기']),
  '065': profile('FIND MAP', 'sheet-find-lens', ['검색어', '범위', '찾은 셀']),
  '066': profile('CELL POINTER', 'sheet-pointer-routes', ['현재 셀', '방향키', '다음 위치']),
  '067': profile('ADVANCED TAB', 'sheet-options-panel', ['옵션', '고급', '편집 설정']),
  '068': profile('CELL EDIT', 'sheet-edit-before-after', ['기존 값', '수정', '새 값']),
  '069': profile('PROTECT SHARE', 'sheet-protect-lock', ['공유', '보호', '권한']),
  '070': profile('FORMAT TOKENS', 'sheet-custom-format', ['값', '서식 코드', '표시 결과']),
  '071': profile('HEAT RULE', 'sheet-conditional-heatmap', ['조건', '색 규칙', '강조 셀']),

  '072': profile('ERROR FLAGS', 'formula-error-tags', ['수식', '오류 코드', '원인 확인']),
  '073': profile('CELL REFERENCE', 'formula-reference-anchor', ['A1', '$A$1', '고정/이동']),
  '074': profile('NAME RANGE', 'formula-named-range', ['범위 선택', '이름 붙임', '수식에 사용']),
  '075': profile('FUNCTION BOX', 'formula-function-machine', ['인수', '함수', '결과']),
  '076': profile('STAT VIEW', 'formula-stat-summary', ['자료 묶음', '통계 함수', '요약값']),
  '077': profile('MATH TOOLS', 'formula-math-toolkit', ['숫자', '계산 규칙', '계산값']),
  '078': profile('TEXT SLICE', 'formula-text-slice', ['문자열', '자르기/붙이기', '새 텍스트']),
  '079': profile('DATE WHEEL', 'formula-date-wheel', ['날짜', '간격 계산', '결과 날짜']),
  '080': profile('LOGIC GATE', 'formula-logic-gate', ['조건', '참/거짓', '선택 결과']),
  '081': profile('INFO CHECK', 'formula-info-check', ['셀 상태', '검사 함수', '판정']),
  '082': profile('LOOKUP MAP', 'formula-lookup-map', ['찾을 값', '표 범위', '돌려줄 값']),
  '083': profile('DB FUNCTION', 'formula-database-criteria', ['목록', '조건 범위', '계산 결과']),
  '084': profile('FINANCE LINE', 'formula-finance-timeline', ['현재 가치', '기간/이율', '미래 값']),
  '085': profile('ARRAY GRID', 'formula-array-matrix', ['여러 셀', '배열 계산', '여러 결과']),

  '086': profile('CHART BUILD', 'chart-build-bars', ['표 데이터', '차트 선택', '그림 비교']),
  '087': profile('CHART EDIT', 'chart-edit-layers', ['차트', '요소 수정', '완성 보기']),
  '088': profile('CHART TYPES', 'chart-type-gallery', ['비교', '추세', '비율']),
  '089': profile('VIEW SETUP', 'sheet-view-freeze', ['큰 표', '틀 고정', '보기 유지']),
  '090': profile('PAGE SETUP', 'print-page-margins', ['용지', '여백', '인쇄 범위']),
  '091': profile('PRINT PREVIEW', 'print-preview-paper', ['시트', '미리 보기', '출력']),
  '092': profile('SORT STACK', 'data-sort-stack', ['기준 열', '오름/내림', '정렬 결과']),
  '093': profile('FILTER GATE', 'data-advanced-filter', ['원본 표', '조건 범위', '걸러진 목록']),
  '094': profile('EXTERNAL DATA', 'data-external-plug', ['외부 원본', '연결', '시트로 가져오기']),
  '095': profile('SUBTOTAL OUTLINE', 'analysis-subtotal-outline', ['그룹', '부분합', '윤곽']),
  '096': profile('PIVOT CROSS', 'analysis-pivot-cross', ['필드', '행/열 배치', '요약표']),
  '097': profile('SCENARIO CARDS', 'analysis-scenario-cards', ['가정 1', '가정 2', '결과 비교']),
  '098': profile('GOAL SEEK', 'analysis-goal-seek', ['목표값', '바꿀 셀', '필요 입력']),
  '099': profile('DATA TABLE', 'analysis-data-table', ['입력값 목록', '수식', '결과 표']),
  '100': profile('CONSOLIDATE', 'analysis-consolidation-merge', ['여러 표', '기준', '통합 결과']),
  '101': profile('MACRO REC', 'macro-record-tape', ['동작', '기록', '매크로']),
  '102': profile('MACRO RUN', 'macro-run-button', ['버튼', '매크로 실행', '반복 처리']),
  '103': profile('VBA OBJECT', 'vba-object-tree', ['Application', 'Workbook', 'Worksheet']),
  '104': profile('VARIABLE BOX', 'vba-variable-array', ['변수', '배열', '값 저장']),
  '105': profile('CONTROL FLOW', 'vba-control-flow', ['조건', '반복', '분기']),
  '106': profile('EXCEL OBJECT', 'vba-excel-hierarchy', ['엑셀', '통합 문서', '시트/셀']),

  '107': profile('DB VAULT', 'db-concept-cylinder', ['자료', '구조화', '검색']),
  '108': profile('DBMS LAYERS', 'db-system-layers', ['사용자', 'DBMS', '데이터베이스']),
  '109': profile('RELATION TABLE', 'db-relational-table', ['테이블', '행/열', '관계']),
  '110': profile('KEY BADGE', 'db-key-badge', ['후보키', '기본키', '외래키']),
  '111': profile('NORMAL FORM', 'db-normalization-split', ['중복 표', '분리', '정리된 표']),
  '112': profile('ERD LINK', 'table-erd-entities', ['개체', '관계', '도식']),
  '113': profile('TABLE DESIGN', 'table-design-grid', ['필드', '자료형', '테이블']),
  '114': profile('ACCESS TYPES', 'table-data-type-shelf', ['텍스트', '숫자', '날짜']),
  '115': profile('INPUT MASK', 'table-input-mask', ['입력 규칙', '마스크', '일정한 모양']),
  '116': profile('VALIDATION', 'table-validation-gate', ['입력값', '검사 규칙', '허용/거절']),
  '117': profile('LOOKUP FIELD', 'table-lookup-dropdown', ['목록', '선택', '저장값']),
  '118': profile('INDEX SPEED', 'table-index-speed', ['키 필드', '색인', '빠른 검색']),
  '119': profile('RELATIONSHIP', 'table-relationship-line', ['부모 표', '자식 표', '연결선']),
  '120': profile('INTEGRITY', 'table-integrity-chain', ['외래키', '참조', '삭제 제한']),
  '121': profile('IMPORT LINK', 'table-import-link', ['외부 파일', '가져오기', '연결']),
  '122': profile('EXPORT FILE', 'table-export-file', ['Access 자료', '내보내기', '다른 형식']),

  '123': profile('SELECT QUERY', 'query-select-pipeline', ['SELECT', 'FROM', 'WHERE']),
  '124': profile('ORDER QUERY', 'query-order-sort', ['원본', 'ORDER BY', '정렬 결과']),
  '125': profile('GROUP QUERY', 'query-group-aggregate', ['그룹 기준', '집계 함수', 'HAVING']),
  '126': profile('ACCESS FUNC', 'query-function-calc', ['값', '함수', '계산 필드']),
  '127': profile('OPERATORS', 'query-special-operators', ['LIKE', 'IN/BETWEEN', '조건 추출']),
  '128': profile('SUBQUERY', 'query-subquery-nest', ['안쪽 질의', '중간 결과', '바깥 질의']),
  '129': profile('JOIN QUERY', 'query-join-tables', ['표 A', 'JOIN', '표 B']),
  '130': profile('ACTION QUERY', 'query-action-warning', ['선택', '실행 질의', '자료 변경']),
  '131': profile('CROSSTAB', 'query-parameter-crosstab', ['매개변수', '행/열 머리글', '교차표']),

  '132': profile('FORM SCREEN', 'form-screen-layout', ['테이블 자료', '폼 화면', '입력/수정']),
  '133': profile('FORM PARTS', 'form-section-stack', ['폼 머리글', '본문', '폼 바닥글']),
  '134': profile('FORM WIZARD', 'form-wizard-steps', ['원본 선택', '레이아웃', '자동 생성']),
  '135': profile('FORM FORMAT', 'form-format-brush', ['글꼴', '색/테두리', '보기 조정']),
  '136': profile('FORM DATA', 'form-data-binding', ['레코드 원본', '필드 연결', '값 표시']),
  '137': profile('CONTROL PALETTE', 'form-control-palette', ['레이블', '텍스트 상자', '버튼']),
  '138': profile('SUBFORM', 'form-subform-nest', ['기본 폼', '하위 폼', '관련 레코드']),
  '139': profile('CONTROL PROPS', 'form-control-properties', ['컨트롤', '속성', '동작']),
  '140': profile('TAB EVENT', 'form-tab-event', ['탭 순서', '이벤트', '실행']),
  '141': profile('REPORT PAPER', 'report-paper-layout', ['자료', '보고서', '인쇄물']),
  '142': profile('REPORT PARTS', 'report-section-bands', ['보고서 머리글', '본문', '바닥글']),
  '143': profile('REPORT PAGE', 'report-page-setup', ['용지', '여백', '페이지 번호']),
  '144': profile('REPORT PROPS', 'report-property-panel', ['보고서', '속성', '출력 모양']),
  '145': profile('REPORT GROUP', 'report-group-sort', ['그룹 기준', '정렬', '요약']),
  '146': profile('REPORT TYPES', 'report-type-gallery', ['표 형식', '열 형식', '레이블']),
  '147': profile('REPORT EXTRA', 'report-extra-tools', ['계산 컨트롤', '페이지 설정', '출력 보정']),

  '148': profile('ACCESS MACRO', 'automation-macro-flow', ['이벤트', '매크로', '동작 실행']),
  '149': profile('MACRO ACTIONS', 'automation-action-list', ['조건', '함수/동작', '처리']),
  '150': profile('EVENT CODE', 'automation-event-procedure', ['이벤트', '프로시저', 'VBA 실행']),
  '151': profile('ACCESS OBJECTS', 'automation-object-radar', ['테이블', '쿼리', '폼/보고서']),
  '152': profile('DAO ADO', 'automation-data-access', ['연결', 'Recordset', '자료 처리']),
} as const satisfies Record<string, VisualProfile>;

const VISUAL_PROFILES_BY_TOPIC_ID: Record<string, VisualProfile> =
  COMHWAL_TOPIC_VISUAL_PROFILES;

const visualTopicIdsInRange = (from: number, to: number) =>
  Object.keys(COMHWAL_TOPIC_VISUAL_PROFILES)
    .filter((id) => Number(id) >= from && Number(id) <= to)
    .sort((a, b) => Number(a) - Number(b));

export const COMHWAL_SPREADSHEET_VISUAL_TOPIC_IDS = visualTopicIdsInRange(60, 106);

export const COMHWAL_DATABASE_VISUAL_TOPIC_IDS = visualTopicIdsInRange(107, 152);

const FOCUS_LABELS: Record<ComhwalVisualFocus, string> = {
  generic: '핵심',
  cell: '셀',
  ribbon: '리본',
  'formula-bar': '수식 입력줄',
  'name-box': '이름 상자',
  'sheet-tab': '시트 탭',
  workbook: '통합 문서',
  worksheet: '워크시트',
  'input-value': '입력값',
  pointer: '셀 포인터',
  format: '표시 형식',
  'fill-handle': '채우기 핸들',
  search: '찾기',
  option: '옵션',
  edit: '편집',
  protect: '보호',
  condition: '조건',
  error: '오류',
  'relative-reference': '상대 참조',
  'absolute-reference': '절대 참조',
  'named-range': '이름 범위',
  function: '함수',
  argument: '인수',
  result: '결과',
  lookup: '찾을 값',
  criteria: '조건 범위',
  'chart-data': '차트 데이터',
  'chart-element': '차트 요소',
  'chart-type': '차트 종류',
  freeze: '틀 고정',
  page: '페이지',
  print: '인쇄',
  sort: '정렬',
  filter: '필터',
  'external-data': '외부 데이터',
  subtotal: '부분합',
  'pivot-field': '피벗 필드',
  scenario: '시나리오',
  'goal-cell': '목표 셀',
  macro: '매크로',
  vba: 'VBA',
  variable: '변수',
  branch: '제어문',
  object: '개체',
  'data-store': '저장소',
  deduplicate: '중복 감소',
  dbms: 'DBMS',
  table: '테이블',
  record: '레코드',
  field: '필드',
  key: '기본키',
  'foreign-key': '외래키',
  relationship: '관계',
  integrity: '무결성',
  import: '가져오기',
  export: '내보내기',
  select: 'SELECT',
  where: 'WHERE',
  order: 'ORDER BY',
  group: 'GROUP BY',
  join: 'JOIN',
  subquery: '하위 질의',
  'action-query': '실행 질의',
  parameter: '매개변수',
  form: '폼',
  control: '컨트롤',
  property: '속성',
  subform: '하위 폼',
  report: '보고서',
  section: '구역',
  event: '이벤트',
  recordset: 'Recordset',
};

const includesAny = (text: string, words: readonly string[]) =>
  words.some((word) => text.includes(word));

export function inferComhwalVisualFocus(
  card: ComhwalVisualCardInput,
): ComhwalVisualFocus {
  const text = [card.title, card.body, ...card.keyPoints].join(' ');
  const topicNumber = Number(card.topicId);
  const isSpreadsheetTopic = topicNumber >= 60 && topicNumber <= 106;
  const isDatabaseTopic = topicNumber >= 107 && topicNumber <= 152;

  if (includesAny(text, ['수식 입력줄', '수식줄'])) return 'formula-bar';
  if (includesAny(text, ['이름 상자'])) return 'name-box';
  if (includesAny(text, ['리본'])) return 'ribbon';
  if (includesAny(text, ['시트 탭', '탭 색', '시트 삽입', '이동과 복사'])) return 'sheet-tab';
  if (includesAny(text, ['통합 문서'])) return 'workbook';
  if (includesAny(text, ['워크시트'])) return 'worksheet';
  if (includesAny(text, ['채우기 핸들', '오른쪽 아래 점', '끌어'])) return 'fill-handle';
  if (includesAny(text, ['셀 포인터', 'Enter', 'Tab', '방향'])) return 'pointer';
  if (includesAny(text, ['찾기', '검색'])) return 'search';
  if (includesAny(text, ['옵션', '고급'])) return 'option';
  if (includesAny(text, ['편집', '수정'])) return 'edit';
  if (includesAny(text, ['보호', '공유', '권한'])) return 'protect';
  if (isSpreadsheetTopic && includesAny(text, ['셀', 'A1', '주소'])) return 'cell';
  if (includesAny(text, ['WHERE'])) return 'where';
  if (includesAny(text, ['ORDER BY', 'ASC', 'DESC'])) return 'order';
  if (includesAny(text, ['GROUP BY', 'HAVING', '묶어서'])) return 'group';
  if (includesAny(text, ['JOIN', '다중 테이블'])) return 'join';
  if (includesAny(text, ['하위 질의', '안쪽 질의'])) return 'subquery';
  if (includesAny(text, ['실행 질의', '자료 변경', '삭제', '추가'])) return 'action-query';
  if (includesAny(text, ['매개변수', '교차표'])) return 'parameter';
  if (includesAny(text, ['SELECT', '선택 질의', '조회 질의'])) return 'select';
  if (includesAny(text, ['조건 범위', 'criteria'])) return 'criteria';
  if (includesAny(text, ['조건부', '조건을 걸', '조건 범위', '조건에 맞'])) return 'condition';
  if (includesAny(text, ['오류', '#DIV', '#VALUE', '#N/A'])) return 'error';
  if (includesAny(text, ['절대 참조', '$'])) return 'absolute-reference';
  if (includesAny(text, ['상대 참조'])) return 'relative-reference';
  if (includesAny(text, ['이름 정의', '이름 관리자', '범위에 이름'])) return 'named-range';
  if (includesAny(text, ['인수'])) return 'argument';
  if (includesAny(text, ['함수', 'SUM', 'AVERAGE'])) return 'function';
  if (includesAny(text, ['결과', '돌려줘'])) return 'result';
  if (includesAny(text, ['찾을 값', 'LOOKUP', '조회'])) return 'lookup';
  if (includesAny(text, ['차트 요소', '축', '범례', '제목'])) return 'chart-element';
  if (includesAny(text, ['차트 종류', '막대', '꺾은선', '원형'])) return 'chart-type';
  if (includesAny(text, ['차트', '그림 비교'])) return 'chart-data';
  if (includesAny(text, ['틀 고정', '보기 유지'])) return 'freeze';
  if (includesAny(text, ['페이지', '용지', '여백'])) return 'page';
  if (includesAny(text, ['인쇄', '미리 보기', '출력'])) return 'print';
  if (includesAny(text, ['정렬', '오름차순', '내림차순'])) return 'sort';
  if (includesAny(text, ['필터', '걸러'])) return 'filter';
  if (includesAny(text, ['외부', '가져오기', '연결하기'])) return 'import';
  if (includesAny(text, ['내보내기', 'PDF'])) return 'export';
  if (includesAny(text, ['부분합'])) return 'subtotal';
  if (includesAny(text, ['피벗', '필드 배치'])) return 'pivot-field';
  if (includesAny(text, ['시나리오', '가정'])) return 'scenario';
  if (includesAny(text, ['목표값', '바꿀 셀'])) return 'goal-cell';
  if (includesAny(text, ['매크로'])) return 'macro';
  if (includesAny(text, ['VBA', '프로시저'])) return 'vba';
  if (includesAny(text, ['변수', '배열'])) return 'variable';
  if (includesAny(text, ['제어문', '조건문', '반복문'])) return 'branch';
  if (includesAny(text, ['개체', 'Application', 'Workbook'])) return 'object';

  if (includesAny(text, ['중복', '불일치'])) return 'deduplicate';
  if (includesAny(text, ['DBMS'])) return 'dbms';
  if (includesAny(text, ['외래키'])) return 'foreign-key';
  if (includesAny(text, ['기본키', '후보키', '키는', '키가'])) return 'key';
  if (includesAny(text, ['참조 무결성', '무결성'])) return 'integrity';
  if (includesAny(text, ['관계', '연결'])) return 'relationship';
  if (isDatabaseTopic && includesAny(text, ['레코드', '행은'])) return 'record';
  if (isDatabaseTopic && includesAny(text, ['필드', '열은'])) return 'field';
  if (isDatabaseTopic && includesAny(text, ['테이블', '표로', '표 형태'])) return 'table';
  if (isDatabaseTopic && includesAny(text, ['데이터베이스', '저장소', '창고'])) return 'data-store';

  if (includesAny(text, ['하위 폼'])) return 'subform';
  if (includesAny(text, ['컨트롤'])) return 'control';
  if (includesAny(text, ['속성', '형식 탭', '데이터 탭'])) return 'property';
  if (includesAny(text, ['폼'])) return 'form';
  if (includesAny(text, ['보고서 구역', '머리글', '본문', '바닥글'])) return 'section';
  if (includesAny(text, ['보고서'])) return 'report';
  if (includesAny(text, ['이벤트'])) return 'event';
  if (includesAny(text, ['Recordset', 'DAO', 'ADO'])) return 'recordset';

  if (includesAny(text, ['형식', '표시 모양', '날짜'])) return 'format';
  if (includesAny(text, ['값', '숫자', '문자', '수식'])) return 'input-value';
  if (includesAny(text, ['셀', 'A1', '주소'])) return 'cell';

  return 'generic';
}

export function getComhwalExpansionVisualModel(
  card: ComhwalVisualCardInput,
): ComhwalExpansionVisualModel {
  const profile = VISUAL_PROFILES_BY_TOPIC_ID[card.topicId];
  const focus = inferComhwalVisualFocus(card);

  if (!profile) {
    return {
      eyebrow: 'VISUAL SUMMARY',
      title: card.title,
      lead: card.body,
      flow: card.keyPoints.slice(0, 3),
      chips: card.keyPoints.slice(0, 3),
      pattern: 'fallback-cards',
      kind: `fallback-${card.topicId}`,
      focus,
      focusLabel: FOCUS_LABELS[focus],
    };
  }

  return {
    eyebrow: profile.eyebrow,
    title: card.title,
    lead: card.body,
    flow: [...profile.flow],
    chips: card.keyPoints.slice(0, 3),
    pattern: profile.pattern,
    kind: `${card.topicId}-${profile.pattern}`,
    focus,
    focusLabel: FOCUS_LABELS[focus],
  };
}
