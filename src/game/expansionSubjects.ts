import {
  Database,
  FileSpreadsheet,
  Monitor,
  type LucideIcon,
} from 'lucide-react';

export type ExpansionSubjectId = 'comhwal';
export type ExpansionVariantId = string;

export interface ExpansionVariant {
  id: ExpansionVariantId;
  title: string;
  shortLabel: string;
  subtitle: string;
  meta: string;
}

export interface ExpansionPlanet {
  key: string;
  title: string;
  subtitle: string;
  variantIds: ExpansionVariantId[];
  icon: LucideIcon;
  sections: ExpansionSection[];
}

export interface ExpansionSection {
  key: string;
  title: string;
  topics: ExpansionTopic[];
}

export interface ExpansionTopic {
  id: string;
  title: string;
}

export interface ExpansionSubjectConfig {
  id: ExpansionSubjectId;
  routeLabel: string;
  accent: string;
  accentRgb: string;
  variants: ExpansionVariant[];
  planets: ExpansionPlanet[];
}

export const EXPANSION_SUBJECTS: Record<
  ExpansionSubjectId,
  ExpansionSubjectConfig
> = {
  comhwal: {
    id: 'comhwal',
    routeLabel: '컴활 필기',
    accent: '#A7E96A',
    accentRgb: '167, 233, 106',
    variants: [
      {
        id: 'grade-1',
        title: '컴활 1급',
        shortLabel: '컴활 1급',
        subtitle: '컴퓨터활용능력 필기',
        meta: '3과목',
      },
      {
        id: 'grade-2',
        title: '컴활 2급',
        shortLabel: '컴활 2급',
        subtitle: '컴퓨터활용능력 필기',
        meta: '2과목',
      },
    ],
    planets: [
      {
        key: 'computer-general',
        title: '컴퓨터 일반',
        subtitle: '필기 과목',
        variantIds: ['grade-1', 'grade-2'],
        icon: Monitor,
        sections: [
          {
            key: 'windows-basic',
            title: '한글 Windows 10의 기본',
            topics: [
              { id: '001', title: '한글 Windows 10의 특징' },
              { id: '002', title: '파일 시스템' },
              { id: '003', title: '바로 가기 키' },
              { id: '004', title: '바로 가기 아이콘' },
              { id: '005', title: '작업 표시줄의 개요' },
              { id: '006', title: '작업 보기 / 가상 데스크톱' },
              { id: '007', title: '시작 메뉴' },
              { id: '008', title: '폴더 옵션' },
              { id: '009', title: '파일과 폴더' },
              { id: '010', title: '검색 상자' },
              { id: '011', title: '휴지통' },
              { id: '012', title: 'Windows 보조프로그램' },
              { id: '013', title: '유니버설 앱' },
            ],
          },
          {
            key: 'windows-advanced',
            title: '한글 Windows 10의 고급 기능',
            topics: [
              { id: '014', title: '[설정] → [시스템]' },
              { id: '015', title: '[설정] → [개인 설정]' },
              { id: '016', title: '[설정] → [앱]' },
              { id: '017', title: '[설정] → [장치]' },
              { id: '018', title: '[설정] → [업데이트 및 보안]' },
              { id: '019', title: '장치 관리자' },
              { id: '020', title: '프린터' },
              { id: '021', title: '문서 인쇄' },
              { id: '022', title: 'Windows 관리 도구' },
              { id: '023', title: '기본 네트워크 정보 및 연결 설정' },
              { id: '024', title: '문제 해결' },
            ],
          },
          {
            key: 'system-overview',
            title: '컴퓨터 시스템의 개요',
            topics: [
              { id: '025', title: '컴퓨터 분류' },
              { id: '026', title: '자료 구성 단위' },
              { id: '027', title: '보수' },
              { id: '028', title: '자료의 표현 방식' },
            ],
          },
          {
            key: 'hardware',
            title: '컴퓨터 하드웨어',
            topics: [
              { id: '029', title: '중앙처리장치' },
              { id: '030', title: '주기억장치' },
              { id: '031', title: '보조기억장치' },
              { id: '032', title: '출력장치' },
              { id: '033', title: '인터럽트 / 채널 / 마이크로프로세서' },
              { id: '034', title: '메인보드' },
              { id: '035', title: '바이오스 / 펌웨어' },
              { id: '036', title: 'RAID' },
              { id: '037', title: '시스템 관리' },
              { id: '038', title: '하드웨어 업그레이드' },
            ],
          },
          {
            key: 'software',
            title: '컴퓨터 소프트웨어',
            topics: [
              { id: '039', title: '소프트웨어의 개요' },
              { id: '040', title: '운영체제' },
              { id: '041', title: '운영체제의 운영 방식' },
              { id: '042', title: '프로그래밍 언어' },
              { id: '043', title: '웹 프로그래밍 언어' },
            ],
          },
          {
            key: 'internet',
            title: '인터넷 활용',
            topics: [
              { id: '044', title: '네트워크 운영 방식과 통신망의 종류' },
              { id: '045', title: '망 구성과 네트워크 장비' },
              { id: '046', title: '인터넷의 개요' },
              { id: '047', title: '인터넷의 주소 체계' },
              { id: '048', title: '프로토콜(Protocol)' },
              { id: '049', title: '인터넷 서비스' },
              { id: '050', title: '정보통신기술 활용' },
            ],
          },
          {
            key: 'multimedia',
            title: '멀티미디어 활용',
            topics: [
              { id: '051', title: '멀티미디어' },
              { id: '052', title: '멀티미디어 소프트웨어' },
              { id: '053', title: '멀티미디어 그래픽 데이터' },
              { id: '054', title: '멀티미디어 오디오/비디오 데이터' },
              { id: '055', title: '멀티미디어 활용' },
            ],
          },
          {
            key: 'security',
            title: '컴퓨터 시스템 보호',
            topics: [
              { id: '056', title: '저작권 보호' },
              { id: '057', title: '바이러스(Virus)' },
              { id: '058', title: '정보 보안 개요' },
              { id: '059', title: '정보 보안 기법' },
            ],
          },
        ],
      },
      {
        key: 'spreadsheet-general',
        title: '스프레드시트 일반',
        subtitle: '필기 과목',
        variantIds: ['grade-1', 'grade-2'],
        icon: FileSpreadsheet,
        sections: [
          {
            key: 'input-editing',
            title: '입력 및 편집',
            topics: [
              { id: '060', title: '엑셀의 화면 구성' },
              { id: '061', title: '워크시트' },
              { id: '062', title: '데이터 입력' },
              { id: '063', title: '데이터 형식' },
              { id: '064', title: '채우기 핸들을 이용한 데이터 입력' },
              { id: '065', title: '찾기' },
              { id: '066', title: '셀 포인터 이동' },
              { id: '067', title: "[파일] → [옵션] → '고급' 탭" },
              { id: '068', title: '셀 편집' },
              { id: '069', title: '통합 문서 공유 / 보호' },
              { id: '070', title: '사용자 지정 서식' },
              { id: '071', title: '조건부 서식' },
            ],
          },
          {
            key: 'formulas',
            title: '수식 활용',
            topics: [
              { id: '072', title: '수식 작성 / 오류 메시지' },
              { id: '073', title: '셀 참조' },
              { id: '074', title: '이름 정의' },
              { id: '075', title: '함수의 기본' },
              { id: '076', title: '통계 함수' },
              { id: '077', title: '수학/삼각 함수' },
              { id: '078', title: '텍스트 함수' },
              { id: '079', title: '날짜 함수' },
              { id: '080', title: '논리 함수' },
              { id: '081', title: '정보 함수' },
              { id: '082', title: '찾기/참조 함수' },
              { id: '083', title: '데이터베이스 함수' },
              { id: '084', title: '재무 함수' },
              { id: '085', title: '배열 수식' },
            ],
          },
          {
            key: 'charts',
            title: '차트 작성',
            topics: [
              { id: '086', title: '차트 작성의 기초' },
              { id: '087', title: '차트 편집' },
              { id: '088', title: '용도별 차트의 종류' },
            ],
          },
          {
            key: 'print',
            title: '출력',
            topics: [
              { id: '089', title: '워크시트의 화면 설정' },
              { id: '090', title: '페이지 설정' },
              { id: '091', title: '인쇄' },
            ],
          },
          {
            key: 'data-management',
            title: '데이터 관리',
            topics: [
              { id: '092', title: '정렬' },
              { id: '093', title: '고급 필터' },
              { id: '094', title: '외부 데이터베이스 이용' },
            ],
          },
          {
            key: 'data-analysis',
            title: '데이터 분석',
            topics: [
              { id: '095', title: '부분합' },
              { id: '096', title: '피벗 테이블' },
              { id: '097', title: '시나리오' },
              { id: '098', title: '목표값 찾기' },
              { id: '099', title: '데이터 표' },
              { id: '100', title: '통합' },
            ],
          },
          {
            key: 'macro-vba',
            title: '매크로 작성과 VBA 프로그래밍',
            topics: [
              { id: '101', title: '매크로 생성' },
              { id: '102', title: '매크로 실행' },
              { id: '103', title: 'VBA의 기본' },
              { id: '104', title: 'VBA 문법 - 변수 / 배열' },
              { id: '105', title: 'VBA 문법 - 제어문' },
              { id: '106', title: '엑셀 개체의 이용' },
            ],
          },
        ],
      },
      {
        key: 'database-general',
        title: '데이터베이스 일반',
        subtitle: '필기 과목',
        variantIds: ['grade-1'],
        icon: Database,
        sections: [
          {
            key: 'database-overview',
            title: '데이터베이스 개요',
            topics: [
              { id: '107', title: '데이터베이스의 개념' },
              { id: '108', title: '데이터베이스 시스템의 구성 요소' },
              { id: '109', title: '관계형 데이터베이스' },
              { id: '110', title: '키(KEY)' },
              { id: '111', title: '정규화' },
            ],
          },
          {
            key: 'tables',
            title: '테이블(Table) 작성',
            topics: [
              { id: '112', title: '개체 관계도(ERD)' },
              { id: '113', title: '테이블 만들기' },
              { id: '114', title: '데이터 형식' },
              { id: '115', title: '필드 속성 - 입력 마스크' },
              { id: '116', title: '필드 속성 - 유효성 검사 규칙' },
              { id: '117', title: '필드 속성 - 조회' },
              { id: '118', title: '기본키와 색인(Index)' },
              { id: '119', title: '관계 설정하기' },
              { id: '120', title: '참조 무결성' },
              { id: '121', title: '외부 데이터 가져오기/연결하기' },
              { id: '122', title: '데이터 내보내기' },
            ],
          },
          {
            key: 'queries',
            title: '데이터베이스 질의(Query)',
            topics: [
              { id: '123', title: '단순 조회 질의 - 기본 구문' },
              { id: '124', title: '단순 조회 질의 - 정렬' },
              { id: '125', title: '단순 조회 질의 - 그룹 지정' },
              { id: '126', title: '주요 함수' },
              { id: '127', title: '특수 연산자를 이용한 질의' },
              { id: '128', title: '하위 질의' },
              { id: '129', title: '다중 테이블 질의' },
              { id: '130', title: '실행 질의' },
              { id: '131', title: '기타 질의' },
            ],
          },
          {
            key: 'forms-controls',
            title: '폼과 컨트롤',
            topics: [
              { id: '132', title: '폼의 개념' },
              { id: '133', title: '폼의 구성 요소' },
              { id: '134', title: '자동 폼 생성 도구' },
              { id: '135', title: "폼의 속성 - '형식' 탭" },
              { id: '136', title: "폼의 속성 - '데이터' 탭" },
              { id: '137', title: '컨트롤의 개요' },
              { id: '138', title: '하위 폼' },
              { id: '139', title: '컨트롤의 주요 속성' },
              { id: '140', title: '폼 작성 기타' },
            ],
          },
          {
            key: 'reports',
            title: '보고서(Report) 작성',
            topics: [
              { id: '141', title: '보고서 작성의 기본' },
              { id: '142', title: '보고서의 구성' },
              { id: '143', title: '페이지 설정하기' },
              { id: '144', title: '보고서의 주요 속성' },
              { id: '145', title: '보고서의 정렬 및 그룹화' },
              { id: '146', title: '보고서의 종류' },
              { id: '147', title: '보고서 작성 기타' },
            ],
          },
          {
            key: 'database-programming',
            title: '데이터베이스 프로그래밍',
            topics: [
              { id: '148', title: '매크로 작성' },
              { id: '149', title: '매크로 함수' },
              { id: '150', title: '이벤트 프로시저' },
              { id: '151', title: 'ACCESS의 개체' },
              { id: '152', title: '데이터 접근 개체' },
            ],
          },
        ],
      },
    ],
  },
};

export function isExpansionSubjectId(
  value: string | undefined,
): value is ExpansionSubjectId {
  return value === 'comhwal';
}
