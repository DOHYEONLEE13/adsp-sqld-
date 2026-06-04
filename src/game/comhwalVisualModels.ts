type VisualProfile = {
  eyebrow: string;
  pattern: string;
  flow: readonly [string, string, string];
};

export type ComhwalExpansionVisualModel = {
  eyebrow: string;
  title: string;
  lead: string;
  flow: string[];
  chips: string[];
  pattern: string;
  kind: string;
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

export function getComhwalExpansionVisualModel(
  card: ComhwalVisualCardInput,
): ComhwalExpansionVisualModel {
  const profile = VISUAL_PROFILES_BY_TOPIC_ID[card.topicId];

  if (!profile) {
    return {
      eyebrow: 'VISUAL SUMMARY',
      title: card.title,
      lead: card.body,
      flow: card.keyPoints.slice(0, 3),
      chips: card.keyPoints.slice(0, 3),
      pattern: 'fallback-cards',
      kind: `fallback-${card.topicId}`,
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
  };
}
