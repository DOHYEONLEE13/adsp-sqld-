import {
  DATABASE_GENERAL_TOPICS,
  SPREADSHEET_GENERAL_TOPICS,
} from './expansionConcepts';

export interface ComhwalConceptQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

export interface ComhwalConceptCard {
  id: string;
  topicId: string;
  title: string;
  body: string;
  keyPoints: string[];
  examTip: string | null;
  visualHint?: string;
  question?: ComhwalConceptQuestion;
}

export interface ComhwalSection {
  id: string;
  title: string;
  topicRange: string;
  cards: ComhwalConceptCard[];
}

export interface ComhwalChapter {
  planetKey: string;
  title: string;
  sections: ComhwalSection[];
}

interface MicroCardSpec {
  title: string;
  setupBody?: string;
  body: string;
  keyPoints: string[];
  examTip: string;
  visualHint?: string;
  questionCheckpoint?: boolean;
  correct: string;
  wrongChoices?: string[];
  questionPrompt?: string;
  explanation: string;
}

interface TopicSpec {
  id: string;
  section: string;
  title: string;
  cards: MicroCardSpec[];
}

const COMPUTER_GENERAL_TOPICS: TopicSpec[] = [
  {
    id: '001',
    section: '한글 Windows 10의 기본',
    title: '한글 Windows 10의 특징',
    cards: [
      {
        title: '컴퓨터는 혼자 못 알아들어',
        body: '컴퓨터는 네가 누른 버튼의 뜻을 바로 몰라. 그래서 부탁을 바꿔 줄 친구가 필요해.',
        keyPoints: ['컴퓨터는 클릭 뜻을 바로 몰라', '사람 말과 컴퓨터 일은 달라', '중간에서 바꿔 줄 친구가 필요해'],
        examTip: '사용자 명령을 컴퓨터가 할 일로 바꿔 주는 장치를 먼저 떠올리면 쉬워.',
        visualHint: 'windows-os-map',
        questionCheckpoint: false,
        correct: '운영체제(OS)',
        wrongChoices: ['모니터', '프린터', '전원 케이블'],
        questionPrompt: '컴퓨터가 네 부탁을 바로 못 알아들을 때, 중간에서 바꿔 주는 것은?',
        explanation: '컴퓨터는 사람의 클릭 뜻을 바로 모르기 때문에 운영체제(OS)가 중간에서 바꿔 줘.',
      },
      {
        title: '운영체제는 중간 통역사야',
        body: '운영체제(OS)는 사람 부탁을 컴퓨터가 할 일로 바꿔 줘. 그래서 앱을 누르면 실행되는 거야.',
        keyPoints: ['운영체제(OS)는 중간 통역사야', '사람 부탁을 컴퓨터 일로 바꿔 줘', '앱 실행을 연결해 줘'],
        examTip: '중간 통역사처럼 사용자 명령을 컴퓨터 일로 바꾸면 운영체제야.',
        visualHint: 'windows-os-map',
        questionCheckpoint: false,
        correct: '운영체제(OS)',
        wrongChoices: ['모니터', '프린터', '전원 케이블'],
        questionPrompt: '컴퓨터와 사람 사이에서 부탁을 바꿔 주는 중간 통역사는?',
        explanation: '운영체제(OS)는 사람 부탁을 컴퓨터가 처리할 일로 바꿔 주는 중간 통역사야.',
      },
      {
        title: '운영체제는 총관리자야',
        body: '운영체제는 총관리자(매니저)야. 앱, 파일, 장치가 서로 부딪히지 않게 순서와 자리를 정리해.',
        keyPoints: ['앱 실행을 정리해', '파일 사용을 관리해', '장치 사용을 챙겨 줘'],
        examTip: '운영체제가 없으면 사용자가 모든 부품에 직접 명령해야 해서 너무 어려워.',
        visualHint: 'windows-os-role',
        questionCheckpoint: true,
        correct: '운영체제(OS)',
        wrongChoices: ['모니터', '프린터', '전원 케이블'],
        questionPrompt: '사람 부탁을 컴퓨터 일로 바꾸고, 앱·파일·장치까지 정리해 주는 것은?',
        explanation: '운영체제(OS)는 중간 통역사이면서 총관리자야. 사람 부탁을 바꿔 주고 앱·파일·장치를 정리해.',
      },
      {
        title: 'Windows 10은 운영체제 이름이야',
        body: 'Windows 10은 운영체제의 한 이름이야. 창, 폴더, 설정 화면으로 컴퓨터를 쉽게 쓰게 해.',
        keyPoints: ['Windows 10은 운영체제야', '창과 폴더로 조작해', '파일, 앱, 장치를 쉽게 쓰게 해'],
        examTip: 'Windows 10 특징은 “컴퓨터를 쉽게 쓰게 해 주는 운영체제”로 잡으면 좋아.',
        visualHint: 'windows-os-map',
        questionCheckpoint: false,
        correct: 'Windows 10은 컴퓨터 사용을 도와주는 운영체제야',
        wrongChoices: ['엑셀에서 쓰는 함수 이름이야', '프린터 종이 크기 이름이야', '인터넷 주소 이름이야'],
        questionPrompt: 'Windows 10을 가장 쉽게 설명하면?',
        explanation: 'Windows 10은 운영체제 중 하나라서 파일, 앱, 장치 사용을 편하게 해 줘.',
      },
      {
        title: 'Windows는 파일과 앱을 이어 줘',
        body: '파일을 누르면 Windows가 알맞은 앱을 찾아 열어 줘. 복잡한 명령을 몰라도 돼.',
        keyPoints: ['파일을 열 앱을 연결해', '앱 실행을 도와줘', '사용자 조작을 쉽게 해'],
        examTip: '파일을 열고 앱을 실행하는 장면은 Windows의 운영체제 역할로 연결해.',
        visualHint: 'windows-app-file',
        questionCheckpoint: true,
        correct: 'Windows가 파일에 맞는 앱을 찾아 실행해 줘',
        wrongChoices: ['파일 이름을 무조건 바꿔 줘', '컴퓨터 전원을 대신 만들어 줘', '인터넷 속도를 항상 올려 줘'],
        questionPrompt: '문서 파일을 눌렀을 때 알맞은 앱이 열리는 이유는?',
        explanation: '파일과 앱을 연결해서 실행 흐름을 만들어 주는 건 Windows의 역할이야.',
      },
      {
        title: 'GUI는 화면으로 조작해',
        body: 'GUI는 그림 버튼과 창을 보며 조작하는 방식이야. 폴더 그림을 누르면 폴더가 열려.',
        keyPoints: ['그래픽 화면으로 조작해', '아이콘과 창을 사용해', '마우스와 터치가 중심이야'],
        examTip: '아이콘, 창, 메뉴, 마우스 조작이 나오면 GUI를 떠올려.',
        visualHint: 'gui-window-icons',
        questionCheckpoint: false,
        correct: '아이콘과 창을 보며 마우스나 터치로 조작할 수 있어',
        wrongChoices: ['검은 화면에 글자 명령만 입력해', '파일을 저장하는 보안 규칙이야', '컴퓨터 전원을 공급하는 선이야'],
        questionPrompt: '아이콘과 창을 보며 마우스나 터치로 조작하는 방식은?',
        explanation: 'GUI는 글자 명령만 치는 방식보다 화면을 보며 조작하는 쪽이야.',
      },
      {
        title: '멀티태스킹은 여러 일을 함께 해',
        body: '음악을 틀어 놓고 문서도 쓰는 것처럼 여러 일을 함께 하는 거야.',
        keyPoints: ['여러 앱을 동시에 실행해', '창 전환을 도와줘', 'CPU 시간을 나눠 써'],
        examTip: '선점형은 운영체제가 CPU 사용 순서를 주도하는 쪽이야.',
        visualHint: 'multitasking-switch',
        questionCheckpoint: true,
        correct: '문서 작성 중 음악 재생과 브라우저 실행을 함께 하는 기능이야',
        wrongChoices: ['한 번에 앱 하나만 꼭 써야 해', '파일을 휴지통으로 보내는 기능이야', '새 장치를 자동 인식하는 기능이야'],
        questionPrompt: '음악을 틀어 놓고 문서도 쓰는 상황은 어떤 기능과 가까워?',
        explanation: '여러 작업을 동시에 다루는 특징은 멀티태스킹이야.',
      },
      {
        title: 'Plug & Play는 꽂으면 알아봐',
        body: '새 장치를 꽂으면 Windows가 알아보고 쓸 준비를 도와주는 기능이야.',
        keyPoints: ['장치를 자동 인식해', '드라이버 설정을 도와줘', 'USB와 프린터 예시로 나와'],
        examTip: '새 장치 연결 뒤 자동 인식 흐름이면 Plug & Play를 떠올려.',
        visualHint: 'plug-and-play-device',
        questionCheckpoint: false,
        correct: '새 USB를 꽂으면 Windows가 자동 인식을 시도해',
        wrongChoices: ['문서 안에 다른 앱 자료를 넣어', '아이콘을 보고 조작하는 방식이야', '여러 앱을 동시에 쓰는 기능이야'],
        questionPrompt: '새 USB를 꽂았을 때 Windows가 자동으로 알아보는 기능은?',
        explanation: 'Plug & Play는 장치를 연결하면 사용할 준비를 돕는 기능이야.',
      },
      {
        title: 'OLE는 다른 앱 자료를 넣어',
        body: '워드 문서 안에 엑셀 차트처럼 다른 앱 자료를 넣어 쓰는 기능이야.',
        keyPoints: ['개체 연결과 포함이야', '다른 앱 자료를 문서에 넣어', '원본 연결 여부가 중요해'],
        examTip: '서로 다른 프로그램 자료를 한 문서에서 쓰면 OLE 쪽으로 보면 돼.',
        visualHint: 'ole-document-link',
        questionCheckpoint: true,
        correct: 'Plug & Play는 장치 자동 인식, OLE는 다른 앱 자료 넣기야',
        wrongChoices: ['Plug & Play는 문서 차트 연결, OLE는 장치 자동 인식이야', '둘 다 여러 앱을 동시에 실행하는 기능이야', '둘 다 아이콘과 창으로 조작하는 방식이야'],
        questionPrompt: 'Plug & Play와 OLE를 바르게 연결한 것은?',
        explanation: 'Plug & Play는 새 장치를 꽂았을 때 자동 인식하는 쪽이고, OLE는 다른 앱 자료를 문서에 넣는 쪽이야.',
      },
    ],
  },
  {
    id: '002',
    section: '한글 Windows 10의 기본',
    title: '파일 시스템',
    cards: [
      {
        title: '파일 시스템은 저장 규칙이야',
        body: '파일 시스템은 저장 장치 안의 파일 위치를 정리하는 방식이야.',
        keyPoints: ['파일 위치를 관리해', '저장 공간을 나눠 써', '폴더 구조와 연결돼'],
        examTip: '파일 시스템은 파일 내용이 아니라 저장 규칙을 다루는 쪽이야.',
        visualHint: 'file-system-shelves',
        correct: '저장 장치 안에서 파일 위치와 공간을 정리해',
        explanation: '파일 시스템은 파일을 어디에 둘지, 어떻게 찾을지 정리해 줘.',
      },
      {
        title: 'NTFS는 Windows에서 자주 나와',
        body: 'NTFS는 권한, 보안, 큰 파일 관리와 자주 묶여 나와.',
        keyPoints: ['Windows에서 자주 써', '접근 권한을 다룰 수 있어', '대용량 파일 관리와 연결돼'],
        examTip: 'NTFS는 FAT보다 보안과 권한 쪽 기능이 강하다고 잡으면 좋아.',
        visualHint: 'ntfs-permission',
        correct: 'NTFS는 접근 권한과 보안 기능을 함께 떠올리면 좋아',
        explanation: 'NTFS는 단순 저장보다 권한과 안정성을 함께 다루는 파일 시스템이야.',
      },
    ],
  },
  {
    id: '003',
    section: '한글 Windows 10의 기본',
    title: '바로 가기 키',
    cards: [
      {
        title: '키 조합은 작업을 바로 줄여',
        setupBody: '바로 가기 키는 메뉴를 여러 번 누르는 일을 키 조합 하나로 줄여.',
        body: 'Alt+Tab은 열린 창 전환, Win+D는 바탕 화면 보기, Ctrl+Z는 실행 취소야.',
        keyPoints: ['Alt+Tab: 열린 창 전환', 'Win+D: 바탕 화면 표시', 'Ctrl+Z: 실행 취소', 'F2: 이름 바꾸기'],
        examTip: '창 전환은 Alt+Tab, 바탕 화면 보기는 Win+D로 짝지어 기억해.',
        visualHint: 'keyboard-shortcut',
        questionPrompt: '열려 있는 창 사이를 빠르게 전환하는 키 조합은?',
        correct: 'Alt+Tab',
        wrongChoices: ['Win+D', 'Ctrl+V', 'F2'],
        explanation: 'Alt+Tab은 열려 있는 창 사이를 옮겨 다닐 때 써. Win+D는 바탕 화면 표시야.',
      },
      {
        title: '관리 도구 키도 구분해',
        setupBody: '문제가 생겼을 때 작업 관리자나 잠금 화면으로 가는 키도 자주 나와.',
        body: 'Ctrl+Shift+Esc는 작업 관리자를 열고, Ctrl+Alt+Del은 보안 화면을 열어.',
        keyPoints: ['Ctrl+Shift+Esc: 작업 관리자', 'Ctrl+Alt+Del: 보안 화면', 'Win+L: 잠금', 'Alt+F4: 창 닫기'],
        examTip: '작업 관리자 직행은 Ctrl+Shift+Esc, 보안 화면은 Ctrl+Alt+Del이야.',
        visualHint: 'keyboard-shortcut',
        questionPrompt: '작업 관리자를 바로 여는 키 조합은?',
        correct: 'Ctrl+Shift+Esc',
        wrongChoices: ['Ctrl+Alt+Del', 'Win+L', 'Alt+F4'],
        explanation: 'Ctrl+Shift+Esc는 작업 관리자 직행이야. Ctrl+Alt+Del은 보안 옵션 화면을 먼저 열어.',
      },
    ],
  },
  {
    id: '004',
    section: '한글 Windows 10의 기본',
    title: '바로 가기 아이콘',
    cards: [
      {
        title: '바로 가기는 원본 길 안내야',
        setupBody: '바로 가기 아이콘은 원본 파일이나 프로그램으로 가는 연결 정보야.',
        body: '아이콘에 작은 화살표가 붙는 경우가 많고, 대상 경로를 따라 원본을 열어.',
        keyPoints: ['원본 자체가 아니라 연결', '대상 경로를 가짐', '작은 화살표 표시 가능', '빠른 실행에 사용'],
        examTip: '바로 가기는 원본 복사본이 아니라 원본으로 가는 길 안내로 잡아.',
        visualHint: 'shortcut-arrow',
        questionPrompt: '바로 가기 아이콘에 관한 설명으로 옳은 것은?',
        correct: '원본 파일이나 프로그램의 대상 경로를 가리켜',
        wrongChoices: ['원본 파일 내용을 항상 복사해 저장해', '휴지통에만 만들 수 있어', '확장자를 숨기는 폴더 옵션이야'],
        explanation: '바로 가기는 대상 경로를 가진 연결 아이콘이야. 원본 내용을 새로 복사한 파일은 아니야.',
      },
      {
        title: '바로 가기 삭제는 연결 삭제',
        setupBody: '바로 가기만 지우면 원본 파일이나 프로그램은 보통 그대로 남아.',
        body: '대상 경로가 깨지면 바로 가기는 열리지 않지만 원본 삭제와는 다른 문제야.',
        keyPoints: ['바로 가기 삭제: 연결만 삭제', '원본 삭제와 구분', '대상 이동 시 연결 깨짐', '속성에서 대상 확인 가능'],
        examTip: '바로 가기 삭제와 원본 삭제를 서로 바꾸는 보기가 자주 나와.',
        visualHint: 'shortcut-arrow',
        questionPrompt: '바로 가기 아이콘만 삭제했을 때 보통 맞는 설명은?',
        correct: '원본 파일은 그대로 남고 연결 아이콘만 사라져',
        wrongChoices: ['원본 파일까지 항상 같이 삭제돼', '원본 파일이 자동으로 압축돼', '파일 확장자가 자동으로 바뀌어'],
        explanation: '바로 가기는 연결 정보라서 아이콘만 지워도 원본 파일 자체는 보통 남아 있어.',
      },
    ],
  },
  {
    id: '005',
    section: '한글 Windows 10의 기본',
    title: '작업 표시줄의 개요',
    cards: [
      {
        title: '작업 표시줄은 앱 상황판이야',
        setupBody: '화면 아래 작업 표시줄은 실행 중인 앱과 고정 앱을 한곳에 보여 줘.',
        body: '앱 아이콘을 눌러 창을 전환하고, 자주 쓰는 앱은 고정해 빠르게 열 수 있어.',
        keyPoints: ['실행 중인 앱 표시', '앱 고정 가능', '창 전환에 사용', '검색·시작 단추와 함께 배치'],
        examTip: '실행 앱 확인, 앱 고정, 창 전환이 함께 나오면 작업 표시줄이야.',
        visualHint: 'taskbar-map',
        questionPrompt: '작업 표시줄에서 할 수 있는 작업으로 알맞은 것은?',
        correct: '실행 중인 앱을 확인하고 창을 전환해',
        wrongChoices: ['삭제 파일을 복원해', 'IP 주소를 자동 배정해', '하드디스크 파티션을 포맷해'],
        explanation: '작업 표시줄은 앱 실행 상태를 보고 전환하는 공간이야. 휴지통이나 네트워크 자동 배정과는 달라.',
      },
      {
        title: '알림 영역은 상태 아이콘 자리',
        setupBody: '작업 표시줄 오른쪽에는 시계, 네트워크, 소리 같은 상태 아이콘이 모여.',
        body: '알림 영역은 시스템 상태를 확인하고 숨겨진 아이콘을 펼쳐 보는 곳이야.',
        keyPoints: ['시계 표시', '네트워크 상태 확인', '소리·배터리 상태 확인', '숨겨진 아이콘 표시'],
        examTip: '시계와 상태 아이콘이 나오면 작업 표시줄의 알림 영역을 떠올려.',
        visualHint: 'taskbar-map',
        questionPrompt: '작업 표시줄의 알림 영역에서 주로 확인하는 것은?',
        correct: '시계, 네트워크, 소리 같은 상태 아이콘',
        wrongChoices: ['삭제된 파일 목록 전체', '워크시트의 수식 입력줄', '차트의 데이터 계열'],
        explanation: '알림 영역은 작업 표시줄 오른쪽 상태 확인 공간이야. 시간, 네트워크, 소리 등이 여기에 있어.',
      },
    ],
  },
  {
    id: '006',
    section: '한글 Windows 10의 기본',
    title: '작업 보기 / 가상 데스크톱',
    cards: [
      {
        title: '작업 보기는 열린 창 펼치기',
        setupBody: '창이 많을 때 작업 보기를 열면 현재 열린 창을 한눈에 볼 수 있어.',
        body: '작업 보기는 창 전환과 가상 데스크톱 이동을 함께 도와주는 화면이야.',
        keyPoints: ['열린 창 미리 보기', '창 전환에 사용', '가상 데스크톱 확인', 'Win+Tab과 연결'],
        examTip: '열린 창을 한 화면에 펼쳐 보고 고르는 기능이면 작업 보기야.',
        visualHint: 'task-view-windows',
        questionPrompt: '열려 있는 창을 한 화면에서 보고 전환하는 기능은?',
        correct: '작업 보기',
        wrongChoices: ['폴더 옵션', '디스크 정리', '인쇄 미리보기'],
        explanation: '작업 보기는 열린 창을 펼쳐 보여 주고, 창 전환이나 가상 데스크톱 선택을 도와.',
      },
      {
        title: '가상 데스크톱은 공간 분리',
        setupBody: '하나의 PC에서 공부용, 업무용처럼 작업 공간을 나눠 쓸 수 있어.',
        body: '가상 데스크톱은 여러 바탕 화면을 만들어 창을 목적별로 나눠 관리해.',
        keyPoints: ['여러 데스크톱 생성', '작업별 창 분리', '작업 보기에서 전환', '같은 모니터에서도 사용 가능'],
        examTip: '새 작업 공간을 만들어 창을 나누면 가상 데스크톱이야.',
        visualHint: 'virtual-desktops',
        questionPrompt: '업무용 창과 공부용 창을 별도 작업 공간으로 나눌 때 쓰는 기능은?',
        correct: '가상 데스크톱',
        wrongChoices: ['휴지통 비우기', '파일 압축', '프린터 대기열'],
        explanation: '가상 데스크톱은 여러 작업 공간을 만들어 창을 목적별로 분리해 관리하게 해.',
      },
    ],
  },
  {
    id: '007',
    section: '한글 Windows 10의 기본',
    title: '시작 메뉴',
    cards: [
      {
        title: '시작 메뉴는 Windows 입구',
        setupBody: '시작 메뉴는 앱 실행, 설정 이동, 전원 메뉴를 여는 기본 출발점이야.',
        body: '앱 목록, 고정 앱, 사용자 계정, 전원 옵션을 한곳에서 찾을 수 있어.',
        keyPoints: ['앱 목록 표시', '설정으로 이동', '전원 옵션 사용', '사용자 계정 메뉴 접근'],
        examTip: '앱 실행과 전원 종료가 함께 나오면 시작 메뉴를 먼저 떠올려.',
        visualHint: 'start-menu-map',
        questionPrompt: '시작 메뉴에서 할 수 있는 작업으로 알맞은 것은?',
        correct: '앱 실행, 설정 이동, 전원 옵션 선택',
        wrongChoices: ['셀 수식 자동 채우기', '프린터 잉크 직접 충전', 'DNS 서버 주소 변환'],
        explanation: '시작 메뉴는 Windows 기능의 대표 입구라 앱, 설정, 전원 메뉴로 들어갈 수 있어.',
      },
      {
        title: '고정 앱은 빠른 실행 칸',
        setupBody: '자주 쓰는 앱은 시작 메뉴나 작업 표시줄에 고정해 빠르게 열 수 있어.',
        body: '고정은 앱을 찾기 쉬운 위치에 붙여 두는 것이고, 앱 설치와는 다른 작업이야.',
        keyPoints: ['자주 쓰는 앱 빠른 실행', '시작 메뉴 고정 가능', '작업 표시줄 고정 가능', '앱 제거와 구분'],
        examTip: '고정은 바로 찾게 하는 기능이지 앱을 새로 설치하는 기능이 아니야.',
        visualHint: 'start-menu-map',
        questionPrompt: '자주 쓰는 앱을 시작 메뉴에 항상 보이게 두는 작업은?',
        correct: '앱 고정',
        wrongChoices: ['앱 제거', '디스크 포맷', '파일 압축'],
        explanation: '앱 고정은 자주 쓰는 앱을 시작 메뉴나 작업 표시줄에서 빠르게 열도록 붙여 두는 기능이야.',
      },
    ],
  },
  {
    id: '008',
    section: '한글 Windows 10의 기본',
    title: '폴더 옵션',
    cards: [
      {
        title: '폴더 옵션은 탐색기 보기 설정',
        setupBody: '폴더 옵션은 파일 탐색기에서 파일과 폴더를 어떻게 보여 줄지 정해.',
        body: '확장자, 숨김 파일, 폴더 열기 방식 같은 표시 설정을 다뤄.',
        keyPoints: ['파일 탐색기 표시 방식 조정', '확장자 표시 설정', '숨김 파일 표시 설정', '파일 내용은 그대로 유지'],
        examTip: '폴더 옵션은 파일 내용 변경이 아니라 표시 방식 변경이야.',
        visualHint: 'folder-options-view',
        questionPrompt: '파일 탐색기에서 숨김 파일 표시 여부를 바꾸는 설정은?',
        correct: '폴더 옵션',
        wrongChoices: ['장치 관리자', '작업 관리자', '인쇄 대기열'],
        explanation: '폴더 옵션은 파일 탐색기의 보기 방식을 조정해. 숨김 파일이나 확장자 표시도 여기와 연결돼.',
      },
      {
        title: '확장자는 파일 종류 단서야',
        setupBody: '보고서.xlsx에서 .xlsx처럼 파일 이름 뒤에 붙는 부분이 확장자야.',
        body: '알려진 파일 형식의 확장자 숨김을 끄면 파일 종류를 더 직접 확인할 수 있어.',
        keyPoints: ['확장자: 파일 형식 단서', '.txt, .jpg, .xlsx 예시', '표시/숨김 설정 가능', '이름 변경 때 주의'],
        examTip: '확장자 표시 여부는 폴더 옵션의 보기 설정과 자주 묶여 나와.',
        visualHint: 'folder-options-view',
        questionPrompt: '파일 이름 report.xlsx에서 .xlsx가 뜻하는 것은?',
        correct: '파일 형식을 알려 주는 확장자',
        wrongChoices: ['파일을 담는 폴더 이름', '휴지통 복원 지점', '네트워크 IP 주소'],
        explanation: '.xlsx는 파일 형식을 나타내는 확장자야. 폴더 옵션에서 확장자 표시 여부를 조정할 수 있어.',
      },
    ],
  },
  {
    id: '009',
    section: '한글 Windows 10의 기본',
    title: '파일과 폴더',
    cards: [
      {
        title: '파일은 실제 자료 단위야',
        setupBody: '문서, 사진, 음악처럼 내용이 담긴 저장 단위를 파일이라고 봐.',
        body: '파일은 이름과 확장자를 가지고, 복사·이동·삭제 같은 작업 대상이 돼.',
        keyPoints: ['문서·사진·음악 자료', '이름과 확장자 보유', '복사·이동 가능', '연결된 앱으로 열림'],
        examTip: '파일은 내용이 담긴 자료, 폴더는 그 자료를 묶는 공간으로 구분해.',
        visualHint: 'file-unit',
        questionPrompt: '문서나 사진처럼 실제 데이터가 담긴 저장 단위는?',
        correct: '파일',
        wrongChoices: ['폴더', '작업 표시줄', '알림 영역'],
        explanation: '파일은 실제 내용이 담긴 자료 단위야. 폴더는 파일을 묶어 정리하는 공간이야.',
      },
      {
        title: '폴더는 정리 공간이야',
        setupBody: '폴더는 파일과 하위 폴더를 담아 찾기 쉽게 정리하는 공간이야.',
        body: '경로는 드라이브와 폴더를 거쳐 파일까지 찾아가는 주소처럼 쓰여.',
        keyPoints: ['파일을 묶어 관리', '하위 폴더 생성 가능', '경로로 위치 표현', '삭제 시 안의 항목 영향'],
        examTip: '폴더 삭제는 안의 파일에도 영향을 줄 수 있다는 점을 조심해.',
        visualHint: 'file-folder-box',
        questionPrompt: 'C:\\Study\\exam.xlsx처럼 파일 위치를 나타내는 것은?',
        correct: '경로',
        wrongChoices: ['확장자', '범례', '보조 축'],
        explanation: '경로는 드라이브와 폴더를 따라 파일 위치를 나타내는 주소야.',
      },
    ],
  },
  {
    id: '010',
    section: '한글 Windows 10의 기본',
    title: '검색 상자',
    cards: [
      {
        title: '검색 상자는 빠른 찾기야',
        setupBody: '파일 위치나 앱 이름이 헷갈릴 때 검색 상자에 단서를 입력해 찾을 수 있어.',
        body: 'Windows 검색은 파일, 앱, 설정, 웹 결과까지 키워드로 찾아 줄 수 있어.',
        keyPoints: ['파일 검색 가능', '앱 검색 가능', '설정 검색 가능', '키워드 일부로도 검색'],
        examTip: '어디 있는지 모를 때 이름 일부로 찾는 기능이면 검색 상자야.',
        visualHint: 'search-box-map',
        questionPrompt: '파일, 앱, 설정을 키워드로 빠르게 찾는 Windows 기능은?',
        correct: '검색 상자',
        wrongChoices: ['휴지통', '인쇄 대기열', '장치 관리자'],
        explanation: '검색 상자는 이름이나 키워드 일부로 파일, 앱, 설정을 찾아 주는 기능이야.',
      },
      {
        title: '검색 결과는 범위별로 좁혀',
        setupBody: '검색 결과가 많으면 앱, 문서, 설정처럼 종류별로 좁혀 볼 수 있어.',
        body: '파일 이름 전체를 몰라도 일부 단어와 파일 종류 단서로 결과를 줄일 수 있어.',
        keyPoints: ['일부 단어 검색 가능', '앱·문서·설정별 분류', '결과 범위 축소 가능', '파일 탐색기 검색도 사용'],
        examTip: '파일 이름 전체를 몰라도 단서로 찾는다는 말에 주목해.',
        visualHint: 'search-box-map',
        questionPrompt: '파일 이름 전체를 모를 때도 검색할 수 있는 이유로 알맞은 것은?',
        correct: '일부 키워드나 종류 단서로 결과를 좁힐 수 있어',
        wrongChoices: ['검색하면 파일 확장자가 항상 삭제돼', '검색은 휴지통 파일만 대상으로 해', '검색은 인터넷 연결 때만 가능해'],
        explanation: 'Windows 검색은 이름 일부나 종류 단서를 이용해 결과를 찾고 범위를 좁힐 수 있어.',
      },
    ],
  },
  {
    id: '011',
    section: '한글 Windows 10의 기본',
    title: '휴지통',
    cards: [
      {
        title: '휴지통은 삭제 전 대기실',
        setupBody: '일반 삭제한 파일은 바로 사라지기보다 휴지통에 잠시 머무를 수 있어.',
        body: '휴지통에 있는 파일은 복원할 수 있고, 비우면 복원이 어려워져.',
        keyPoints: ['삭제 파일 임시 보관', '복원 가능', '휴지통 비우기 가능', '용량 제한 있음'],
        examTip: '일반 삭제와 완전 삭제를 구분하면 휴지통 문제가 쉬워져.',
        visualHint: 'recycle-bin-flow',
        questionPrompt: '일반 삭제한 파일을 잠시 보관해 복원할 수 있게 하는 곳은?',
        correct: '휴지통',
        wrongChoices: ['작업 표시줄', '장치 관리자', '검색 상자'],
        explanation: '휴지통은 삭제된 파일을 임시 보관해 실수로 지운 파일을 복원할 기회를 줘.',
      },
      {
        title: 'Shift+Delete는 휴지통을 건너뛰어',
        setupBody: 'Shift+Delete로 삭제하면 휴지통에 넣지 않고 바로 삭제하는 흐름이야.',
        body: '휴지통 비우기나 Shift+Delete는 일반 삭제보다 복원 가능성이 낮아.',
        keyPoints: ['Shift+Delete: 휴지통 우회', '휴지통 비우기: 완전 삭제에 가까움', '복원 가능성 감소', '네트워크 드라이브 삭제도 주의'],
        examTip: '휴지통을 거치지 않는 삭제라는 말이면 Shift+Delete를 떠올려.',
        visualHint: 'recycle-bin-flow',
        questionPrompt: '휴지통을 거치지 않고 삭제하는 대표 키 조합은?',
        correct: 'Shift+Delete',
        wrongChoices: ['Ctrl+C', 'Alt+Tab', 'Win+D'],
        explanation: 'Shift+Delete는 휴지통으로 보내지 않고 삭제하는 방식이라 복원이 어려울 수 있어.',
      },
    ],
  },
  {
    id: '012',
    section: '한글 Windows 10의 기본',
    title: 'Windows 보조프로그램',
    cards: [
      {
        title: '보조프로그램은 기본 생활 도구',
        setupBody: 'Windows에는 계산기, 메모장, 그림판처럼 간단한 기본 도구가 들어 있어.',
        body: '보조프로그램은 별도 전문 앱 없이 간단한 계산, 글 입력, 그림 작업을 돕는 도구야.',
        keyPoints: ['계산기: 기본 계산', '메모장: 간단한 텍스트', '그림판: 간단한 그림', '캡처 도구: 화면 캡처'],
        examTip: '도구 이름보다 무엇을 할 때 쓰는지 연결하면 보조프로그램 문제를 줄일 수 있어.',
        visualHint: 'windows-accessories',
        questionPrompt: '간단한 텍스트 파일을 작성할 때 쓰기 좋은 Windows 기본 도구는?',
        correct: '메모장',
        wrongChoices: ['장치 관리자', '작업 보기', '피벗 테이블'],
        explanation: '메모장은 간단한 텍스트 입력용 기본 도구야. 장치 관리자는 하드웨어 상태 확인 쪽이야.',
      },
      {
        title: '캡처와 그림 도구도 구분해',
        setupBody: '화면 일부를 저장할 때와 간단한 그림을 그릴 때 쓰는 도구는 달라.',
        body: '캡처 도구는 화면 영역 저장, 그림판은 이미지 그리기와 간단한 편집에 써.',
        keyPoints: ['캡처 도구: 화면 일부 저장', '그림판: 간단한 이미지 편집', '계산기: 계산', '문자표: 특수 문자 입력'],
        examTip: '화면 일부를 이미지로 잡는다는 말이면 캡처 도구를 먼저 봐.',
        visualHint: 'windows-accessories',
        questionPrompt: '화면의 일부 영역을 이미지로 저장할 때 가까운 도구는?',
        correct: '캡처 도구',
        wrongChoices: ['계산기', '문자표', '디스크 조각 모음'],
        explanation: '캡처 도구는 화면 일부나 창을 잡아 이미지로 저장할 때 쓰는 기본 도구야.',
      },
    ],
  },
  {
    id: '013',
    section: '한글 Windows 10의 기본',
    title: '유니버설 앱',
    cards: [
      {
        title: '유니버설 앱은 여러 화면용',
        setupBody: '유니버설 앱은 PC, 태블릿처럼 다양한 Windows 기기에서 쓰도록 만든 앱이야.',
        body: '화면 크기와 입력 방식에 맞춰 반응하고, Microsoft Store 흐름과 자주 연결돼.',
        keyPoints: ['여러 Windows 기기 지원', '화면 크기에 맞게 반응', 'Store 앱과 연결', '샌드박스 보안 모델과 관련'],
        examTip: 'PC와 태블릿에서 비슷한 앱 경험을 제공한다는 말이 핵심이야.',
        visualHint: 'universal-app-devices',
        questionPrompt: '유니버설 앱의 특징으로 알맞은 것은?',
        correct: '여러 Windows 기기와 화면 크기에 맞게 동작해',
        wrongChoices: ['휴지통 파일만 복원해', '프린터 드라이버만 업데이트해', 'IPv4 주소만 자동 배정해'],
        explanation: '유니버설 앱은 다양한 Windows 기기와 화면 환경에서 비슷한 앱 경험을 주도록 만들어져.',
      },
      {
        title: '데스크톱 앱과 설치 흐름이 달라',
        setupBody: '일반 데스크톱 앱은 설치 파일 중심, 유니버설 앱은 Store 흐름과 자주 묶여.',
        body: '유니버설 앱은 권한과 배포가 비교적 통제되고, 터치 환경도 고려해.',
        keyPoints: ['Store 배포와 연결', '권한 관리 흐름', '터치 환경 고려', '전통 데스크톱 앱과 구분'],
        examTip: 'Store, 여러 기기, 터치 친화라는 단서가 함께 나오면 유니버설 앱이야.',
        visualHint: 'universal-app-devices',
        questionPrompt: '유니버설 앱과 자주 연결되는 배포 경로는?',
        correct: 'Microsoft Store',
        wrongChoices: ['BIOS 설정 화면', '휴지통 속성', '프린터 대기열'],
        explanation: '유니버설 앱은 Microsoft Store 배포 흐름과 자주 연결돼. 전통 데스크톱 설치 파일과 구분해.',
      },
    ],
  },
  {
    id: '014',
    section: '한글 Windows 10의 고급 기능',
    title: '[설정] → [시스템]',
    cards: [
      {
        title: '[시스템]은 기본 상태판이야',
        setupBody: 'Windows 설정의 [시스템]은 화면, 소리, 전원 같은 기본 상태를 모아.',
        body: '디스플레이 해상도, 소리 출력, 알림, 전원과 절전 설정을 여기서 찾기 쉬워.',
        keyPoints: ['디스플레이 해상도', '소리 출력과 볼륨', '알림 설정', '전원 및 절전'],
        examTip: '해상도, 소리, 전원 문제가 나오면 [설정]의 [시스템]으로 연결해.',
        visualHint: 'settings-system',
        questionPrompt: '[설정] → [시스템]에서 주로 다루는 항목은?',
        correct: '디스플레이, 소리, 전원 및 절전',
        wrongChoices: ['앱 제거와 기본 앱 지정', '바탕 화면 배경과 테마', '프린터와 블루투스 장치 추가'],
        explanation: '[시스템]은 컴퓨터 기본 상태와 사용 환경을 다뤄. 앱 제거는 [앱], 배경은 [개인 설정]에 가까워.',
      },
      {
        title: '저장 공간과 정보도 확인해',
        setupBody: '[시스템]에서는 저장 공간 사용량과 PC 정보 같은 상태 확인도 할 수 있어.',
        body: '저장소 설정은 디스크 사용량을 보고, 정보 화면은 장치 사양과 Windows 정보를 보여 줘.',
        keyPoints: ['저장소 사용량 확인', '장치 사양 확인', 'Windows 정보 확인', '기본 상태 점검'],
        examTip: '저장 공간 상태나 PC 정보 확인은 [시스템] 흐름으로 봐.',
        visualHint: 'settings-system',
        questionPrompt: 'PC의 장치 사양과 Windows 정보를 확인하는 설정 흐름은?',
        correct: '[설정] → [시스템] → [정보]',
        wrongChoices: ['[설정] → [앱] → [기본 앱]', '[설정] → [개인 설정] → [색]', '[설정] → [장치] → [프린터]'],
        explanation: '[시스템]의 [정보] 화면은 장치 사양과 Windows 정보를 확인하는 곳이야.',
      },
    ],
  },
  {
    id: '015',
    section: '한글 Windows 10의 고급 기능',
    title: '[설정] → [개인 설정]',
    cards: [
      {
        title: '[개인 설정]은 화면 분위기',
        setupBody: '배경, 색, 테마처럼 Windows 화면의 겉모습을 바꿀 때 들어가.',
        body: '[개인 설정]은 바탕 화면 배경, 색, 테마, 잠금 화면을 다루는 설정이야.',
        keyPoints: ['배경 이미지 변경', '색과 테마 변경', '잠금 화면 설정', '작업 표시줄 모양 설정'],
        examTip: '기능 성능보다 화면 겉모습을 바꾸는 메뉴면 [개인 설정]이야.',
        visualHint: 'personalization-theme',
        questionPrompt: '바탕 화면 배경과 테마를 바꾸는 설정 메뉴는?',
        correct: '[개인 설정]',
        wrongChoices: ['[시스템]', '[앱]', '[장치]'],
        explanation: '[개인 설정]은 배경, 색, 테마, 잠금 화면처럼 사용자가 보는 화면 분위기를 바꿔.',
      },
      {
        title: '잠금 화면도 꾸미기 메뉴야',
        setupBody: '로그인 전에 보이는 잠금 화면 사진이나 상태 앱도 개인 설정에서 다뤄.',
        body: '잠금 화면은 보안 설정 자체보다 화면 표시와 배경 구성에 가까워.',
        keyPoints: ['잠금 화면 배경 변경', '상태 표시 앱 선택', '테마와 함께 관리', '사용자 화면 취향 반영'],
        examTip: '잠금 화면 그림을 바꾼다는 말이면 [개인 설정]으로 연결해.',
        visualHint: 'personalization-theme',
        questionPrompt: '잠금 화면 배경 이미지를 바꾸려면 어느 설정을 먼저 봐?',
        correct: '[개인 설정]',
        wrongChoices: ['[업데이트 및 보안]', '[네트워크 및 인터넷]', '[앱]'],
        explanation: '잠금 화면 배경은 화면 꾸미기 영역이라 [개인 설정]에서 찾는 흐름이 자연스러워.',
      },
    ],
  },
  {
    id: '016',
    section: '한글 Windows 10의 고급 기능',
    title: '[설정] → [앱]',
    cards: [
      {
        title: '[앱]은 설치 프로그램 관리',
        setupBody: '설치된 프로그램 목록을 보고 제거하거나 선택 기능을 바꿀 때 들어가.',
        body: '[앱] 설정은 앱 및 기능, 기본 앱, 시작 프로그램 같은 항목을 다뤄.',
        keyPoints: ['설치 앱 목록 확인', '앱 제거 가능', '기본 앱 지정', '시작 프로그램 관리'],
        examTip: '프로그램 제거나 기본 앱 지정이 나오면 [앱] 설정으로 봐.',
        visualHint: 'settings-apps',
        questionPrompt: '설치된 앱을 제거하거나 앱 목록을 확인하는 설정 메뉴는?',
        correct: '[앱]',
        wrongChoices: ['[개인 설정]', '[시스템]', '[장치]'],
        explanation: '[앱]은 설치된 프로그램을 확인하고 제거하는 메뉴야. 화면 배경 변경은 [개인 설정]에 가까워.',
      },
      {
        title: '기본 앱은 열 앱을 정해',
        setupBody: 'PDF, 사진, 웹 링크를 어떤 앱으로 열지 정하는 곳이 기본 앱 설정이야.',
        body: '파일 형식이나 프로토콜별로 기본으로 사용할 앱을 지정할 수 있어.',
        keyPoints: ['파일 형식별 기본 앱', '웹 브라우저 기본값', '사진 뷰어 기본값', '프로토콜별 연결'],
        examTip: '"어떤 앱으로 열까?"를 정하는 문제는 기본 앱 설정으로 봐.',
        visualHint: 'settings-apps',
        questionPrompt: 'PDF 파일을 항상 특정 앱으로 열도록 정하는 설정은?',
        correct: '기본 앱 설정',
        wrongChoices: ['전원 및 절전', '장치 관리자', '고급 필터'],
        explanation: '기본 앱 설정은 파일 형식별로 먼저 사용할 앱을 정해. PDF 열기 앱도 여기와 연결돼.',
      },
    ],
  },
  {
    id: '017',
    section: '한글 Windows 10의 고급 기능',
    title: '[설정] → [장치]',
    cards: [
      {
        title: '[장치]는 연결 기기 담당',
        setupBody: '프린터, 마우스, 키보드, 블루투스 같은 외부 기기를 관리해.',
        body: '[장치] 설정에서는 새 장치 추가와 프린터·마우스 관련 설정을 찾을 수 있어.',
        keyPoints: ['프린터 및 스캐너', '마우스와 키보드', '블루투스 장치', '새 장치 추가'],
        examTip: '컴퓨터에 붙이는 기기를 추가하거나 설정하면 [장치] 메뉴야.',
        visualHint: 'settings-devices',
        questionPrompt: '프린터나 블루투스 마우스를 추가할 때 먼저 볼 설정은?',
        correct: '[장치]',
        wrongChoices: ['[앱]', '[개인 설정]', '[업데이트 및 보안]'],
        explanation: '[장치]는 컴퓨터에 연결해 쓰는 프린터, 마우스, 블루투스 장치 등을 관리해.',
      },
      {
        title: '블루투스는 무선 장치 연결',
        setupBody: '블루투스 이어폰이나 마우스는 케이블 없이 PC와 짝지어 연결해.',
        body: '장치 추가 흐름에서 검색, 페어링, 연결 상태 확인을 거쳐 사용할 수 있어.',
        keyPoints: ['페어링으로 장치 등록', '무선 연결 사용', '연결 상태 확인', '장치 제거 가능'],
        examTip: '페어링이라는 말이 나오면 블루투스 장치 연결로 보면 좋아.',
        visualHint: 'settings-devices',
        questionPrompt: '블루투스 장치를 처음 연결할 때 필요한 등록 과정은?',
        correct: '페어링',
        wrongChoices: ['포맷', '부분합', '인쇄 제목'],
        explanation: '페어링은 블루투스 장치를 서로 인식하고 연결할 수 있게 등록하는 과정이야.',
      },
    ],
  },
  {
    id: '018',
    section: '한글 Windows 10의 고급 기능',
    title: '[설정] → [업데이트 및 보안]',
    cards: [
      {
        title: '업데이트는 최신 상태 유지',
        setupBody: '보안 패치와 기능 업데이트를 받아 Windows를 안전하고 최신으로 맞춰.',
        body: '[업데이트 및 보안]은 Windows 업데이트, 보안, 복구 관련 기능을 모아.',
        keyPoints: ['Windows 업데이트 확인', '보안 패치 적용', '복구 옵션 제공', '백업 흐름과 연결'],
        examTip: '업데이트, 보안 패치, 복구라는 단서가 나오면 이 메뉴야.',
        visualHint: 'update-security',
        questionPrompt: 'Windows 보안 패치와 업데이트를 확인하는 설정 메뉴는?',
        correct: '[업데이트 및 보안]',
        wrongChoices: ['[개인 설정]', '[앱]', '[장치]'],
        explanation: '[업데이트 및 보안]은 Windows 업데이트와 보안 패치, 복구 관련 기능을 다뤄.',
      },
      {
        title: '복구는 문제 뒤 되돌리기',
        setupBody: 'PC에 문제가 생겼을 때 초기화, 이전 상태 복원 같은 복구 옵션을 확인해.',
        body: '복구 기능은 업데이트 실패나 시스템 문제 뒤 다시 쓸 수 있게 돕는 흐름이야.',
        keyPoints: ['PC 초기화 옵션', '복구 환경 진입', '이전 상태로 되돌림', '백업과 함께 대비'],
        examTip: '문제 발생 뒤 되돌리거나 초기화하는 기능은 복구 쪽으로 연결해.',
        visualHint: 'update-security',
        questionPrompt: '시스템 문제 뒤 PC 초기화나 되돌리기 옵션을 찾는 메뉴는?',
        correct: '[업데이트 및 보안]의 복구',
        wrongChoices: ['[개인 설정]의 색', '[장치]의 마우스', '[앱]의 기본 앱'],
        explanation: '복구는 시스템 문제 뒤 PC를 다시 사용할 수 있게 초기화나 되돌리기 옵션을 제공해.',
      },
    ],
  },
  {
    id: '019',
    section: '한글 Windows 10의 고급 기능',
    title: '장치 관리자',
    cards: [
      {
        title: '장치 관리자는 하드웨어 목록',
        setupBody: '컴퓨터 안팎에 연결된 하드웨어와 장치 상태를 트리 형태로 확인해.',
        body: '장치 관리자는 장치 오류, 사용 여부, 드라이버 상태를 점검하는 관리 화면이야.',
        keyPoints: ['하드웨어 목록 표시', '장치 상태 확인', '드라이버 관리', '오류 표시 확인'],
        examTip: '드라이버 상태나 알 수 없는 장치가 나오면 장치 관리자를 봐.',
        visualHint: 'device-manager-tree',
        questionPrompt: '하드웨어 장치 목록과 드라이버 상태를 확인하는 도구는?',
        correct: '장치 관리자',
        wrongChoices: ['작업 보기', '폴더 옵션', '인쇄 미리보기'],
        explanation: '장치 관리자는 컴퓨터의 하드웨어 목록과 상태, 드라이버 문제를 확인하는 도구야.',
      },
      {
        title: '드라이버는 장치 통역 프로그램',
        setupBody: '드라이버는 Windows와 하드웨어가 서로 제대로 통신하게 돕는 프로그램이야.',
        body: '장치 관리자에서 드라이버 업데이트, 사용 안 함, 제거 같은 작업을 할 수 있어.',
        keyPoints: ['드라이버 업데이트', '장치 사용 안 함', '장치 제거', '오류 코드 확인'],
        examTip: '하드웨어가 인식되지 않으면 드라이버와 장치 관리자부터 연결해.',
        visualHint: 'device-manager-tree',
        questionPrompt: '하드웨어와 Windows 사이의 통신을 돕는 프로그램은?',
        correct: '드라이버',
        wrongChoices: ['테마', '바로 가기', '데이터 레이블'],
        explanation: '드라이버는 하드웨어를 Windows가 제대로 사용할 수 있게 연결하는 프로그램이야.',
      },
    ],
  },
  {
    id: '020',
    section: '한글 Windows 10의 고급 기능',
    title: '프린터',
    cards: [
      {
        title: '프린터는 종이 출력 장치',
        setupBody: '프린터는 문서나 그림 같은 컴퓨터 결과를 종이로 출력하는 장치야.',
        body: '여러 프린터가 있으면 기본 프린터와 인쇄 대기열 상태를 함께 봐야 해.',
        keyPoints: ['출력 장치', '문서·그림 인쇄', '기본 프린터 설정', '인쇄 대기열과 연결'],
        examTip: '기본 프린터는 여러 프린터 중 먼저 선택되는 장치로 잡아.',
        visualHint: 'printer-device',
        questionPrompt: '여러 프린터 중 인쇄 때 우선 선택되는 프린터는?',
        correct: '기본 프린터',
        wrongChoices: ['가상 데스크톱', '기본 앱', '조건 범위'],
        explanation: '기본 프린터는 사용자가 따로 고르지 않을 때 우선 선택되는 프린터야.',
      },
      {
        title: '로컬과 네트워크 프린터 구분',
        setupBody: '프린터는 PC에 직접 연결되거나 네트워크를 통해 함께 쓸 수 있어.',
        body: '네트워크 프린터는 여러 사용자가 같은 프린터를 공유해 출력할 때 쓰여.',
        keyPoints: ['로컬 프린터: 직접 연결', '네트워크 프린터: 네트워크 공유', '드라이버 설치 필요', '공유 권한 영향'],
        examTip: '여러 PC가 함께 쓰는 프린터라면 네트워크 프린터를 떠올려.',
        visualHint: 'printer-device',
        questionPrompt: '여러 PC가 네트워크를 통해 함께 사용하는 프린터는?',
        correct: '네트워크 프린터',
        wrongChoices: ['기본 앱', '휴지통', '폴더 옵션'],
        explanation: '네트워크 프린터는 네트워크를 통해 여러 사용자가 공유해 쓰는 프린터야.',
      },
    ],
  },
  {
    id: '021',
    section: '한글 Windows 10의 고급 기능',
    title: '문서 인쇄',
    cards: [
      {
        title: '인쇄 작업은 대기열에 쌓여',
        setupBody: '문서를 인쇄하면 작업이 프린터 대기열에 들어가 순서를 기다려.',
        body: '인쇄 대기열은 출력할 문서의 순서, 상태, 오류 여부를 확인하는 목록이야.',
        keyPoints: ['인쇄 작업 목록', '출력 순서 관리', '오류 상태 확인', '일시 중지 가능'],
        examTip: '인쇄 문서가 멈췄다는 말이 나오면 대기열 상태를 먼저 봐.',
        visualHint: 'print-queue',
        questionPrompt: '출력할 문서의 순서와 상태를 관리하는 목록은?',
        correct: '인쇄 대기열',
        wrongChoices: ['시작 메뉴', '조건부 서식', '가상 데스크톱'],
        explanation: '인쇄 대기열은 프린터로 보낸 작업을 줄 세워 상태와 순서를 관리해.',
      },
      {
        title: '대기열에서 취소와 일시 중지',
        setupBody: '잘못 보낸 문서는 프린터로 나가기 전에 대기열에서 조정할 수 있어.',
        body: '대기열에서는 특정 문서 취소, 일시 중지, 다시 시작 같은 작업을 할 수 있어.',
        keyPoints: ['문서 취소 가능', '인쇄 일시 중지', '다시 시작 가능', '프린터 오프라인 상태 확인'],
        examTip: '출력 전 작업 취소는 프린터 설정 전체보다 대기열에서 처리해.',
        visualHint: 'print-queue',
        questionPrompt: '잘못 보낸 인쇄 작업을 취소하려면 어디를 확인해?',
        correct: '인쇄 대기열',
        wrongChoices: ['파일 확장자 설정', '개인 설정 테마', '작업 보기 화면'],
        explanation: '인쇄 대기열은 아직 처리 중인 문서 작업을 취소하거나 멈추는 곳이야.',
      },
    ],
  },
  {
    id: '022',
    section: '한글 Windows 10의 고급 기능',
    title: 'Windows 관리 도구',
    cards: [
      {
        title: '관리 도구는 깊은 점검 도구',
        setupBody: 'Windows 관리 도구는 서비스, 이벤트, 작업 같은 시스템 관리 기능을 모아.',
        body: '일반 꾸미기 설정보다 시스템 상태를 자세히 보고 관리하는 도구 모음이야.',
        keyPoints: ['이벤트 뷰어', '서비스 관리', '작업 스케줄러', '컴퓨터 관리'],
        examTip: '일반 사용자 설정보다 시스템 관리·기록 확인에 가까우면 관리 도구야.',
        visualHint: 'admin-tools',
        questionPrompt: '시스템 기록 확인, 서비스 관리 같은 고급 도구 묶음은?',
        correct: 'Windows 관리 도구',
        wrongChoices: ['개인 설정', '검색 상자', '휴지통'],
        explanation: 'Windows 관리 도구는 이벤트 뷰어, 서비스, 작업 스케줄러 같은 관리 기능을 모아 둔 영역이야.',
      },
      {
        title: '이벤트 뷰어와 서비스 구분',
        setupBody: '이벤트 뷰어는 기록을 보고, 서비스는 백그라운드 기능의 실행 상태를 다뤄.',
        body: '작업 스케줄러는 정해진 시간이나 조건에 맞춰 작업을 자동 실행하게 해.',
        keyPoints: ['이벤트 뷰어: 로그 확인', '서비스: 백그라운드 기능 관리', '작업 스케줄러: 예약 실행', '도구별 역할 구분'],
        examTip: '기록 확인은 이벤트 뷰어, 자동 예약 실행은 작업 스케줄러야.',
        visualHint: 'admin-tools',
        questionPrompt: 'Windows의 시스템 로그와 오류 기록을 확인하는 도구는?',
        correct: '이벤트 뷰어',
        wrongChoices: ['서비스', '작업 스케줄러', '폴더 옵션'],
        explanation: '이벤트 뷰어는 시스템과 앱의 기록을 확인하는 도구야. 서비스는 백그라운드 기능 상태를 다뤄.',
      },
    ],
  },
  {
    id: '023',
    section: '한글 Windows 10의 고급 기능',
    title: '기본 네트워크 정보 및 연결 설정',
    cards: [
      {
        title: '네트워크 설정은 연결 상태 확인',
        setupBody: '인터넷이 안 될 때는 먼저 Wi-Fi, 유선 LAN, 어댑터 상태를 확인해.',
        body: '네트워크 설정은 연결 상태, 사용 중인 어댑터, 데이터 사용량을 보여 줘.',
        keyPoints: ['Wi-Fi 상태 확인', '이더넷 상태 확인', '어댑터 정보 확인', '데이터 사용량 확인'],
        examTip: '네트워크 문제는 연결 상태와 어댑터 정보부터 보는 흐름이야.',
        visualHint: 'network-status-card',
        questionPrompt: '인터넷 연결 상태와 네트워크 어댑터 정보를 확인하는 곳은?',
        correct: '네트워크 설정',
        wrongChoices: ['개인 설정', '휴지통 속성', '차트 편집'],
        explanation: '네트워크 설정은 Wi-Fi, 유선 LAN, 어댑터 정보와 연결 상태를 확인하는 곳이야.',
      },
      {
        title: 'IP·게이트웨이·DNS를 구분해',
        setupBody: '네트워크 연결 정보에는 IP 주소, 기본 게이트웨이, DNS 서버가 함께 나와.',
        body: 'IP는 내 주소, 게이트웨이는 바깥망 입구, DNS는 이름을 IP로 바꿔 주는 쪽이야.',
        keyPoints: ['IP 주소: 내 장치 주소', '기본 게이트웨이: 외부망 입구', 'DNS: 도메인 이름 변환', 'DHCP: IP 자동 할당'],
        examTip: '도메인을 IP로 바꾸면 DNS, IP를 자동으로 받으면 DHCP야.',
        visualHint: 'network-status-card',
        questionPrompt: '도메인 이름을 IP 주소로 바꿔 주는 서버는?',
        correct: 'DNS 서버',
        wrongChoices: ['기본 게이트웨이', 'DHCP 서버', '프린터 서버'],
        explanation: 'DNS는 사람이 읽는 도메인 이름을 실제 IP 주소로 바꿔 주는 역할을 해.',
      },
    ],
  },
  {
    id: '024',
    section: '한글 Windows 10의 고급 기능',
    title: '문제 해결',
    cards: [
      {
        title: '문제 해결은 자동 진단 도구',
        setupBody: '네트워크나 프린터가 이상할 때 Windows가 원인을 자동으로 점검해.',
        body: '문제 해결은 오류 원인을 찾고, 가능한 해결 방법을 제안하거나 일부를 자동 처리해.',
        keyPoints: ['오류 원인 자동 점검', '해결 방법 제안', '일부 설정 자동 수정', '네트워크·프린터 문제에 자주 사용'],
        examTip: '사용자가 직접 고치기 전 자동 진단을 돌리는 도구로 기억해.',
        visualHint: 'troubleshooter',
        questionPrompt: '네트워크 오류 원인을 Windows가 자동 점검하게 하는 도구는?',
        correct: '문제 해결',
        wrongChoices: ['개인 설정', '원형 차트', '바로 가기 아이콘'],
        explanation: '문제 해결은 오류 원인을 자동으로 진단하고 해결 방향을 제안하는 도구야.',
      },
      {
        title: '진단 도구라 만능은 아니야',
        setupBody: '문제 해결은 원인을 찾고 안내하지만 모든 문제를 반드시 고치지는 못해.',
        body: '결과에 따라 사용자가 드라이버 업데이트나 케이블 확인 같은 추가 조치를 해야 할 수 있어.',
        keyPoints: ['진단이 중심', '일부 문제 자동 해결', '추가 조치 필요 가능', '결과 안내 확인'],
        examTip: '문제 해결을 모든 오류를 완전히 고치는 기능으로 보면 함정이야.',
        visualHint: 'troubleshooter',
        questionPrompt: 'Windows 문제 해결 도구에 관한 설명으로 알맞은 것은?',
        correct: '오류를 진단하고 해결 방향을 안내하지만 만능은 아니야',
        wrongChoices: ['모든 하드웨어 고장을 반드시 수리해', '삭제 파일을 항상 복원해', '차트 종류를 자동으로 바꿔'],
        explanation: '문제 해결은 자동 진단과 일부 해결을 돕지만, 모든 원인을 완전히 고치는 도구는 아니야.',
      },
    ],
  },
  {
    id: '025',
    section: '컴퓨터 시스템의 개요',
    title: '컴퓨터 분류',
    cards: [
      {
        title: '분류 문제는 기준부터 잡아',
        setupBody: '컴퓨터는 처리 능력, 크기, 사용 목적, 자료 처리 방식 같은 기준으로 나눠.',
        body: '슈퍼컴퓨터, 서버, PC, 임베디드 시스템은 쓰임과 성능 기준으로 구분해.',
        keyPoints: ['처리 능력 기준', '사용 목적 기준', '자료 처리 방식 기준', '크기와 용도 함께 확인'],
        examTip: '이름만 보지 말고 어떤 기준으로 나눈 분류인지 먼저 확인해.',
        visualHint: 'computer-classification-scale',
        questionPrompt: '컴퓨터를 분류할 때 먼저 확인해야 할 것은?',
        correct: '크기, 처리 능력, 사용 목적 같은 분류 기준',
        wrongChoices: ['바탕 화면 배경색', '파일 확장자 숨김 여부', '인쇄 대기열 순서'],
        explanation: '컴퓨터 분류는 이름보다 기준이 먼저야. 처리 능력, 용도, 크기 등을 보고 나눠.',
      },
      {
        title: '서버·PC·슈퍼컴퓨터 역할',
        setupBody: '서버는 서비스를 제공하고, PC는 개인 작업, 슈퍼컴퓨터는 대규모 계산에 강해.',
        body: '임베디드 컴퓨터는 자동차, 가전처럼 특정 장치 안에서 정해진 일을 맡아.',
        keyPoints: ['서버: 서비스 제공', 'PC: 개인 작업', '슈퍼컴퓨터: 대규모 과학 계산', '임베디드: 특정 장치 내장'],
        examTip: '서버를 단순히 큰 PC로 보지 말고 여러 사용자에게 서비스 제공으로 봐.',
        visualHint: 'computer-classification-scale',
        questionPrompt: '여러 사용자에게 웹이나 파일 같은 서비스를 제공하는 컴퓨터는?',
        correct: '서버',
        wrongChoices: ['개인용 PC', '계산기', '스캐너'],
        explanation: '서버는 다른 컴퓨터나 사용자에게 필요한 서비스를 제공하는 역할의 컴퓨터야.',
      },
    ],
  },
  {
    id: '026',
    section: '컴퓨터 시스템의 개요',
    title: '자료 구성 단위',
    cards: [
      {
        title: 'bit는 0 또는 1 한 칸',
        setupBody: '컴퓨터 자료 단위는 0 또는 1 하나를 뜻하는 bit에서 시작해.',
        body: '8bit가 모이면 1Byte가 되고, Byte부터 파일 크기를 세는 기본 단위로 자주 써.',
        keyPoints: ['bit: 가장 작은 정보 단위', '0 또는 1 표현', '8bit = 1Byte', 'Byte는 문자 저장 단위로 자주 설명'],
        examTip: '8bit = 1Byte는 자료 단위 계산의 출발점이라 꼭 잡아 둬.',
        visualHint: 'data-unit-ladder',
        questionPrompt: '컴퓨터 정보의 가장 작은 단위로 0 또는 1 하나를 뜻하는 것은?',
        correct: 'bit',
        wrongChoices: ['Byte', 'KB', 'GB'],
        explanation: 'bit는 0 또는 1 하나를 뜻하는 가장 작은 정보 단위야. 8bit가 1Byte가 돼.',
      },
      {
        title: '용량 단위는 계단처럼 커져',
        setupBody: 'Byte 다음에는 KB, MB, GB, TB 순서로 저장 용량 단위가 커져.',
        body: '시험에서는 1KB=1024Byte, 1MB=1024KB처럼 1024배 단위로 자주 계산해.',
        keyPoints: ['Byte < KB < MB < GB < TB', '1KB = 1024Byte', '1MB = 1024KB', '단위 순서 함정 주의'],
        examTip: 'KB와 MB 순서를 바꾸거나 8bit=1Byte를 흔드는 보기를 조심해.',
        visualHint: 'data-unit-ladder',
        questionPrompt: '자료 용량 단위를 작은 것부터 큰 순서로 바르게 나열한 것은?',
        correct: 'Byte → KB → MB → GB → TB',
        wrongChoices: ['Byte → MB → KB → GB → TB', 'KB → Byte → MB → GB → TB', 'TB → GB → MB → KB → Byte'],
        explanation: '용량 단위는 Byte에서 시작해 KB, MB, GB, TB 순서로 커져.',
      },
    ],
  },
  {
    id: '027',
    section: '컴퓨터 시스템의 개요',
    title: '보수',
    cards: [
      {
        title: '보수는 부족분을 채우는 값',
        setupBody: '컴퓨터는 뺄셈과 음수 표현을 덧셈처럼 처리하려고 보수를 써.',
        body: '1의 보수는 비트를 반전하고, 2의 보수는 1의 보수에 1을 더해.',
        keyPoints: ['보수: 뺄셈 보조', '1의 보수: 0과 1 반전', '2의 보수: 1의 보수+1', '음수 표현에 자주 사용'],
        examTip: '2의 보수는 "뒤집고 1 더하기"로 바로 계산해.',
        visualHint: 'complement-bits',
        questionPrompt: '4비트 1010의 1의 보수는?',
        correct: '0101',
        wrongChoices: ['0110', '1011', '1101'],
        explanation: '1의 보수는 각 비트를 반대로 바꿔. 1010을 뒤집으면 0101이 돼.',
      },
      {
        title: '2의 보수는 음수 표현 단골',
        setupBody: '2의 보수는 1의 보수에 1을 더하므로 계산 순서가 한 번 더 있어.',
        body: '4비트 1010의 2의 보수는 0101에 1을 더한 0110이야.',
        keyPoints: ['비트 반전 먼저', '마지막에 1 더하기', '자리수 유지', '음수 표현과 뺄셈에 사용'],
        examTip: '1의 보수 답을 2의 보수로 착각하는 보기, 정말 자주 나와.',
        visualHint: 'complement-bits',
        questionPrompt: '4비트 1010의 2의 보수는?',
        correct: '0110',
        wrongChoices: ['0101', '1011', '1110'],
        explanation: '먼저 1010을 뒤집어 0101을 만들고, 여기에 1을 더해 0110이 돼.',
      },
    ],
  },
  {
    id: '028',
    section: '컴퓨터 시스템의 개요',
    title: '자료의 표현 방식',
    cards: [
      {
        title: '컴퓨터 안쪽은 0과 1',
        setupBody: '사람에게는 글자와 그림으로 보여도 컴퓨터 안에서는 비트 조합으로 저장돼.',
        body: '숫자, 문자, 이미지, 소리는 모두 약속된 표현 방식에 따라 0과 1로 바뀌어.',
        keyPoints: ['2진수 기반 표현', '문자는 코드값으로 표현', '그림은 픽셀 정보로 표현', '소리는 표본화·양자화와 연결'],
        examTip: '자료 종류가 달라도 내부 저장은 비트 조합이라는 공통점을 잡아.',
        visualHint: 'binary-representation',
        questionPrompt: '컴퓨터 내부에서 숫자와 문자를 저장할 때 공통으로 쓰는 기본 표현은?',
        correct: '0과 1의 비트 조합',
        wrongChoices: ['종이 인쇄 좌표', '프린터 대기열 순서', '바탕 화면 테마'],
        explanation: '컴퓨터는 전기 신호를 바탕으로 자료를 0과 1의 비트 조합으로 표현해.',
      },
      {
        title: '문자는 코드 번호로 저장돼',
        setupBody: 'A, 가 같은 글자는 ASCII, Unicode 같은 문자 코드의 번호로 바뀌어 저장돼.',
        body: 'ASCII는 기본 영문 중심, Unicode는 여러 나라 문자를 넓게 표현하려고 써.',
        keyPoints: ['ASCII: 영문·숫자 중심', 'Unicode: 다양한 문자 표현', '문자는 코드값으로 저장', '인코딩 방식과 연결'],
        examTip: '한글과 다양한 언어 지원이라는 말이 나오면 Unicode 쪽이야.',
        visualHint: 'binary-representation',
        questionPrompt: '여러 나라 문자를 폭넓게 표현하려고 쓰는 문자 코드 체계는?',
        correct: 'Unicode',
        wrongChoices: ['ASCII만', 'RAID 0', 'BIOS'],
        explanation: 'Unicode는 다양한 언어의 문자를 표현하려고 만든 문자 코드 체계야.',
      },
    ],
  },
  {
    id: '029',
    section: '컴퓨터 하드웨어',
    title: '중앙처리장치',
    cards: [
      {
        title: 'CPU는 해석하고 계산해',
        setupBody: 'CPU는 프로그램 명령을 가져와 해석하고 계산을 처리하는 핵심 장치야.',
        body: '제어장치는 명령 흐름을 지휘하고, 연산장치(ALU)는 산술·논리 연산을 맡아.',
        keyPoints: ['제어장치: 명령 해석·제어', 'ALU: 산술·논리 연산', '레지스터: 초고속 임시 저장', 'CPU는 처리 장치'],
        examTip: 'CPU를 저장 장치로 보지 말고 명령 처리 중심으로 봐.',
        visualHint: 'cpu-core',
        questionPrompt: 'CPU에서 산술 연산과 논리 연산을 맡는 부분은?',
        correct: '연산장치(ALU)',
        wrongChoices: ['제어장치', '보조기억장치', '출력장치'],
        explanation: 'ALU는 계산과 논리 판단을 맡아. 제어장치는 명령 흐름을 지휘하는 쪽이야.',
      },
      {
        title: '레지스터는 CPU 안 임시칸',
        setupBody: 'CPU는 계산 중인 값과 명령 주소를 아주 빠른 임시 공간에 잠깐 둬.',
        body: '레지스터는 CPU 내부의 초고속 임시 기억장치라 메모리보다 더 CPU 가까이에 있어.',
        keyPoints: ['CPU 내부 임시 저장', '접근 속도 매우 빠름', '명령·주소·데이터 보관', '주기억장치와 구분'],
        examTip: '레지스터는 큰 저장 창고가 아니라 CPU 안 초고속 임시칸이야.',
        visualHint: 'cpu-core',
        questionPrompt: 'CPU 내부에서 계산 중인 값을 잠시 보관하는 초고속 공간은?',
        correct: '레지스터',
        wrongChoices: ['하드디스크', '프린터', '스캐너'],
        explanation: '레지스터는 CPU 내부에 있는 매우 빠른 임시 기억 공간이야.',
      },
    ],
  },
  {
    id: '030',
    section: '컴퓨터 하드웨어',
    title: '주기억장치',
    cards: [
      {
        title: 'RAM은 켜져 있을 때만 기억해',
        setupBody: 'RAM은 실행 중인 프로그램과 데이터를 올려 두는 작업대야. 전원을 끄면 내용이 사라져.',
        body: 'DRAM은 재충전이 필요하고 값이 싸서 주기억장치에, SRAM은 빠르고 비싸서 캐시에 써.',
        keyPoints: ['RAM은 휘발성 메모리야', 'DRAM: 재충전 필요 · 주기억장치용', 'SRAM: 재충전 불필요 · 캐시용', '속도는 SRAM이 더 빨라'],
        examTip: 'DRAM과 SRAM 비교는 재충전 여부, 속도, 가격, 용도 네 가지로 묶어 두면 거의 다 풀려.',
        visualHint: 'main-memory',
        questionPrompt: '다음 중 DRAM과 SRAM에 관한 설명으로 옳은 것은?',
        correct: 'DRAM은 주기적인 재충전이 필요하고 주로 주기억장치에 쓰여',
        wrongChoices: ['SRAM은 DRAM보다 속도가 느린 대신 가격이 싸', 'DRAM은 전원이 꺼져도 내용을 그대로 유지해', 'SRAM은 재충전이 필요해서 캐시 메모리에는 못 써'],
        explanation: 'DRAM은 재충전 필요·저가·고집적이라 주기억장치용, SRAM은 재충전 불필요·고속·고가라 캐시용으로 갈라 두면 안 헷갈려.',
      },
      {
        title: 'ROM과 캐시는 역할이 달라',
        setupBody: 'ROM은 전원을 꺼도 내용이 남는 비휘발성 메모리야. BIOS 같은 기본 프로그램을 담아.',
        body: '캐시는 CPU와 주기억장치의 속도 차이를 줄이고, 가상 메모리는 보조기억장치로 용량을 늘려.',
        keyPoints: ['ROM: 비휘발성, BIOS 저장', '캐시: CPU와 메모리의 속도 차이를 메워', '가상 메모리: 디스크를 메모리처럼 써', '캐시에는 빠른 SRAM을 써'],
        examTip: '캐시는 속도 보완, 가상 메모리는 용량 보완. 두 목적을 서로 바꿔 내는 함정이 단골로 나와.',
        visualHint: 'ram-rom-compare',
        questionPrompt: '캐시 메모리에 관한 설명으로 옳은 것은?',
        correct: 'CPU와 주기억장치 사이의 속도 차이를 줄여 줘',
        wrongChoices: ['보조기억장치 일부를 주기억장치처럼 쓰는 방식을 말해', '전원이 꺼져도 내용이 남는 비휘발성 메모리야', '주로 DRAM으로 만들어 가격이 싸고 용량이 커'],
        explanation: '캐시는 빠른 SRAM으로 만들어 CPU와 주기억장치의 속도 차이를 메워. 디스크를 메모리처럼 쓰는 건 가상 메모리야.',
      },
    ],
  },
  {
    id: '031',
    section: '컴퓨터 하드웨어',
    title: '보조기억장치',
    cards: [
      {
        title: '보조기억장치는 오래 보관',
        setupBody: '보조기억장치는 전원을 꺼도 프로그램과 파일을 오래 보관하는 저장 장치야.',
        body: 'HDD, SSD, USB 메모리, 광디스크처럼 장기 저장을 맡는 장치를 묶어 봐.',
        keyPoints: ['비휘발성 저장', '장기 보관 목적', 'HDD·SSD 대표', '주기억장치보다 보통 느림'],
        examTip: '작업 중 빠른 공간은 주기억장치, 오래 보관하는 창고는 보조기억장치야.',
        visualHint: 'secondary-storage',
        questionPrompt: '전원을 꺼도 파일을 오래 보관하는 장치로 알맞은 것은?',
        correct: 'SSD',
        wrongChoices: ['레지스터', 'ALU', '캐시 메모리'],
        explanation: 'SSD는 보조기억장치라 전원을 꺼도 파일을 보관해. 레지스터와 캐시는 CPU 가까운 임시 공간이야.',
      },
      {
        title: 'SSD와 HDD는 방식이 달라',
        setupBody: 'SSD는 반도체 메모리 기반, HDD는 회전하는 자기 디스크 기반으로 저장해.',
        body: 'SSD는 충격에 비교적 강하고 빠른 편, HDD는 큰 용량을 저렴하게 쓰는 편이야.',
        keyPoints: ['SSD: 반도체 기반', 'HDD: 자기 디스크 기반', 'SSD는 접근 속도 빠른 편', 'HDD는 회전 부품 존재'],
        examTip: '회전 디스크가 나오면 HDD, 반도체 저장이 나오면 SSD야.',
        visualHint: 'secondary-storage',
        questionPrompt: '움직이는 디스크 대신 반도체 메모리로 저장하는 장치는?',
        correct: 'SSD',
        wrongChoices: ['HDD', 'CRT 모니터', '키보드'],
        explanation: 'SSD는 반도체 기반 저장 장치야. HDD는 자기 디스크가 회전하는 방식이야.',
      },
    ],
  },
  {
    id: '032',
    section: '컴퓨터 하드웨어',
    title: '출력장치',
    cards: [
      {
        title: '출력장치는 결과를 밖으로',
        setupBody: '컴퓨터가 처리한 결과를 사람이 볼 수 있게 화면, 종이, 소리로 내보내.',
        body: '모니터, 프린터, 스피커는 대표 출력장치고 입력장치와 방향이 반대야.',
        keyPoints: ['모니터: 화면 출력', '프린터: 종이 출력', '스피커: 소리 출력', '입력장치와 방향 구분'],
        examTip: '스캐너는 입력, 프린터는 출력처럼 데이터 방향으로 구분해.',
        visualHint: 'output-devices',
        questionPrompt: '컴퓨터 처리 결과를 종이로 내보내는 출력장치는?',
        correct: '프린터',
        wrongChoices: ['스캐너', '마우스', '키보드'],
        explanation: '프린터는 결과를 종이에 출력해. 스캐너, 마우스, 키보드는 입력장치 쪽이야.',
      },
      {
        title: '해상도와 출력 품질도 봐',
        setupBody: '모니터는 해상도와 화면 크기, 프린터는 해상도와 인쇄 속도를 자주 봐.',
        body: 'DPI는 1인치 안의 점 수를 뜻해 프린터나 이미지 출력 품질과 연결돼.',
        keyPoints: ['모니터: 해상도 확인', '프린터: DPI와 속도', '스피커: 소리 출력', '출력 품질 지표 구분'],
        examTip: 'DPI는 점의 밀도라 프린터 해상도 문제에 자주 나와.',
        visualHint: 'output-devices',
        questionPrompt: '프린터 해상도와 관련해 1인치당 점 수를 나타내는 단위는?',
        correct: 'DPI',
        wrongChoices: ['Hz', 'Byte', 'GHz'],
        explanation: 'DPI는 dots per inch로 1인치 안의 점 수를 뜻해. 프린터 해상도와 자주 연결돼.',
      },
    ],
  },
  {
    id: '033',
    section: '컴퓨터 하드웨어',
    title: '인터럽트 / 채널 / 마이크로프로세서',
    cards: [
      {
        title: '인터럽트는 CPU 호출 신호',
        setupBody: '입출력 완료나 오류처럼 급한 일이 생기면 CPU에게 신호를 보내.',
        body: '인터럽트가 오면 CPU는 현재 작업을 잠시 멈추고 우선 처리할 일을 확인해.',
        keyPoints: ['CPU에게 처리 요청', '현재 작업 잠시 중단', '입출력 완료 알림', '오류나 예외와 연결'],
        examTip: '잠깐 멈추고 먼저 처리한다는 흐름이면 인터럽트야.',
        visualHint: 'interrupt-signal',
        questionPrompt: '입출력 장치가 CPU에게 급한 처리를 요청하는 신호는?',
        correct: '인터럽트',
        wrongChoices: ['채널', '펌웨어', 'RAID'],
        explanation: '인터럽트는 CPU에게 우선 처리할 일이 생겼다고 알리는 신호야.',
      },
      {
        title: '채널은 입출력 전담 도우미',
        setupBody: '채널은 주변 장치 입출력 처리를 맡아 CPU 부담을 줄이는 장치야.',
        body: '마이크로프로세서는 CPU 기능을 하나의 칩에 집적한 처리 장치로 봐.',
        keyPoints: ['채널: 입출력 처리 보조', 'CPU 부담 감소', '마이크로프로세서: CPU 기능 집적', '주변 장치 처리와 구분'],
        examTip: '채널은 입출력 보조, 마이크로프로세서는 처리장치 칩으로 구분해.',
        visualHint: 'interrupt-signal',
        questionPrompt: '입출력 작업을 대신 처리해 CPU 부담을 줄이는 장치는?',
        correct: '채널',
        wrongChoices: ['레지스터', 'BIOS', '출력장치'],
        explanation: '채널은 입출력 작업 처리를 도와 CPU가 모든 입출력을 직접 맡지 않게 해.',
      },
    ],
  },
  {
    id: '034',
    section: '컴퓨터 하드웨어',
    title: '메인보드',
    cards: [
      {
        title: '메인보드는 부품 연결판',
        setupBody: '메인보드는 CPU, 메모리, 저장 장치, 확장 카드를 연결하는 중심 회로판이야.',
        body: '칩셋, 슬롯, 포트, 버스가 함께 있어 부품들이 데이터를 주고받게 해.',
        keyPoints: ['CPU 소켓', '메모리 슬롯', '확장 슬롯', '칩셋과 버스'],
        examTip: '메인보드는 직접 계산보다 부품 연결과 통신의 중심으로 봐.',
        visualHint: 'motherboard-map',
        questionPrompt: 'CPU, 메모리, 확장 카드가 장착되는 중심 회로판은?',
        correct: '메인보드',
        wrongChoices: ['프린터', '스피커', '휴지통'],
        explanation: '메인보드는 컴퓨터 주요 부품을 연결하고 통신하게 하는 중심 회로판이야.',
      },
      {
        title: '버스는 신호가 다니는 길',
        setupBody: '버스는 CPU, 메모리, 주변 장치 사이에서 데이터와 주소, 제어 신호가 오가는 통로야.',
        body: '데이터 버스, 주소 버스, 제어 버스처럼 오가는 신호 종류에 따라 나눠.',
        keyPoints: ['데이터 버스: 자료 이동', '주소 버스: 위치 지정', '제어 버스: 제어 신호', '부품 사이 통신 통로'],
        examTip: '버스는 부품 사이 신호 통로지 저장 장치 이름이 아니야.',
        visualHint: 'motherboard-map',
        questionPrompt: 'CPU와 메모리 사이에서 데이터와 주소 신호가 오가는 통로는?',
        correct: '버스',
        wrongChoices: ['펌웨어', '휴지통', '작업 표시줄'],
        explanation: '버스는 컴퓨터 부품 사이의 데이터, 주소, 제어 신호가 이동하는 통로야.',
      },
    ],
  },
  {
    id: '035',
    section: '컴퓨터 하드웨어',
    title: '바이오스 / 펌웨어',
    cards: [
      {
        title: 'BIOS는 부팅 전 점검 담당',
        setupBody: '전원을 켜면 BIOS가 하드웨어를 점검하고 운영체제를 불러올 준비를 해.',
        body: 'POST는 부팅 초기에 CPU, 메모리, 장치 상태를 검사하는 자기 진단 과정이야.',
        keyPoints: ['BIOS: 기본 입출력 시스템', 'POST: 전원 켠 뒤 자기 진단', '부팅 장치 선택', 'ROM/플래시 메모리와 연결'],
        examTip: '전원 직후 하드웨어 검사라는 말이 나오면 POST와 BIOS를 함께 봐.',
        visualHint: 'bios-boot',
        questionPrompt: '전원을 켠 뒤 하드웨어 이상을 먼저 점검하는 과정은?',
        correct: 'POST',
        wrongChoices: ['RAID 0', 'DPI', 'Alt+Tab'],
        explanation: 'POST는 Power-On Self-Test로, 전원을 켠 직후 하드웨어 상태를 점검하는 과정이야.',
      },
      {
        title: '펌웨어는 장치 속 프로그램',
        setupBody: '펌웨어는 하드웨어 안에 들어 있어 장치의 기본 동작을 제어하는 프로그램이야.',
        body: '일반 앱처럼 자주 바꾸기보다 장치 동작과 밀착되어 있고 업데이트가 가능할 수 있어.',
        keyPoints: ['하드웨어 내부 프로그램', '장치 기본 동작 제어', 'BIOS도 펌웨어 성격', '업데이트 가능'],
        examTip: '하드웨어와 소프트웨어 사이 성격이라는 말이 펌웨어 단서야.',
        visualHint: 'bios-boot',
        questionPrompt: '하드웨어 안에서 장치의 기본 동작을 제어하는 프로그램은?',
        correct: '펌웨어',
        wrongChoices: ['스프레드시트', '인쇄 대기열', '데이터 레이블'],
        explanation: '펌웨어는 장치 내부에 들어 있는 제어 프로그램이야. BIOS도 펌웨어 성격으로 볼 수 있어.',
      },
    ],
  },
  {
    id: '036',
    section: '컴퓨터 하드웨어',
    title: 'RAID',
    cards: [
      {
        title: 'RAID는 디스크 묶음 방식',
        setupBody: 'RAID는 여러 디스크를 하나의 저장장치처럼 묶어 성능이나 안정성을 높이는 방식이야.',
        body: 'RAID 0은 나눠 저장해 속도에 유리하고, RAID 1은 복사 저장해 안정성에 유리해.',
        keyPoints: ['여러 디스크 묶음', '성능 향상 가능', '장애 대응 가능', '백업 자체와 구분'],
        examTip: 'RAID는 백업 프로그램이 아니라 디스크 구성 방식이라는 점을 먼저 잡아.',
        visualHint: 'raid-disks',
        questionPrompt: '여러 디스크를 묶어 성능이나 안정성을 높이는 저장 구성은?',
        correct: 'RAID',
        wrongChoices: ['BIOS', 'ASCII', 'DPI'],
        explanation: 'RAID는 여러 저장 장치를 조합해 속도나 안정성을 높이는 구성 방식이야.',
      },
      {
        title: '스트라이핑과 미러링 구분',
        setupBody: '스트라이핑은 나눠 저장, 미러링은 같은 데이터를 복사 저장하는 방식이야.',
        body: 'RAID 0은 스트라이핑, RAID 1은 미러링으로 많이 연결해.',
        keyPoints: ['RAID 0: 스트라이핑', 'RAID 1: 미러링', '스트라이핑: 속도 중심', '미러링: 복제 안정성 중심'],
        examTip: '0은 속도, 1은 복사 안정성으로 먼저 붙여 두면 헷갈림이 줄어.',
        visualHint: 'raid-disks',
        questionPrompt: 'RAID 1처럼 같은 데이터를 두 디스크에 복사 저장하는 방식은?',
        correct: '미러링',
        wrongChoices: ['스트라이핑', '포맷', '페어링'],
        explanation: '미러링은 같은 데이터를 여러 디스크에 복사해 장애에 대비하는 방식이야.',
      },
    ],
  },
  {
    id: '037',
    section: '컴퓨터 하드웨어',
    title: '시스템 관리',
    cards: [
      {
        title: '시스템 관리는 상태 유지',
        setupBody: '컴퓨터가 느려지거나 불안정할 때 성능, 저장 공간, 오류 상태를 확인해.',
        body: '시스템 관리는 하드웨어와 소프트웨어가 안정적으로 동작하도록 점검하는 흐름이야.',
        keyPoints: ['성능 상태 확인', '저장 공간 점검', '오류 로그 확인', '불필요한 파일 정리'],
        examTip: '시스템 관리는 꾸미기보다 안정성과 성능 유지에 가까워.',
        visualHint: 'system-management',
        questionPrompt: '컴퓨터가 안정적으로 동작하도록 성능과 오류 상태를 점검하는 흐름은?',
        correct: '시스템 관리',
        wrongChoices: ['테마 변경', '원형 차트 작성', '파일 확장자 숨김'],
        explanation: '시스템 관리는 성능, 저장 공간, 오류 상태를 점검해 컴퓨터를 안정적으로 유지하는 흐름이야.',
      },
      {
        title: '작업 관리자와 저장소를 봐',
        setupBody: '느려진 PC는 CPU, 메모리, 디스크 사용률과 저장 공간 부족을 함께 확인해.',
        body: '작업 관리자는 성능과 프로세스를 보고, 저장소 설정은 디스크 사용량을 확인해.',
        keyPoints: ['작업 관리자: CPU·메모리 사용률', '프로세스 상태 확인', '저장소 사용량 확인', '디스크 정리와 연결'],
        examTip: '속도 저하 문제는 CPU, 메모리, 디스크 사용률을 같이 봐야 해.',
        visualHint: 'system-management',
        questionPrompt: 'PC가 느릴 때 CPU와 메모리 사용률을 확인하는 대표 도구는?',
        correct: '작업 관리자',
        wrongChoices: ['개인 설정', '그림판', '문자표'],
        explanation: '작업 관리자는 프로세스와 CPU, 메모리, 디스크 사용률을 확인할 때 쓰는 대표 도구야.',
      },
    ],
  },
  {
    id: '038',
    section: '컴퓨터 하드웨어',
    title: '하드웨어 업그레이드',
    cards: [
      {
        title: '업그레이드는 부품 개선',
        setupBody: 'RAM 추가, SSD 교체, 그래픽 카드 교체처럼 부품을 바꿔 성능을 높여.',
        body: '업그레이드 전에는 메인보드 규격, 전원 용량, 슬롯, 운영체제 지원을 확인해.',
        keyPoints: ['RAM 추가', 'SSD 교체', '그래픽 카드 교체', '호환성 확인 필수'],
        examTip: '성능 좋은 부품이라도 규격과 전원 조건이 안 맞으면 쓸 수 없어.',
        visualHint: 'hardware-upgrade',
        questionPrompt: 'RAM을 추가하거나 SSD로 바꿔 성능을 높이는 작업은?',
        correct: '하드웨어 업그레이드',
        wrongChoices: ['휴지통 복원', '조건부 서식', '도메인 변환'],
        explanation: '하드웨어 업그레이드는 부품을 교체하거나 추가해 성능을 높이는 작업이야.',
      },
      {
        title: '호환성은 설치 전 확인',
        setupBody: 'CPU 소켓, 메모리 규격, 저장장치 인터페이스가 맞아야 정상 장착돼.',
        body: '전원 공급 장치 용량과 케이스 공간도 업그레이드 전 확인할 조건이야.',
        keyPoints: ['CPU 소켓 확인', '메모리 DDR 규격 확인', '저장장치 인터페이스 확인', '전원 용량 확인'],
        examTip: '업그레이드 문제는 성능보다 "호환되는가"를 먼저 봐.',
        visualHint: 'hardware-upgrade',
        questionPrompt: '새 CPU를 사기 전에 반드시 확인해야 할 대표 조건은?',
        correct: '메인보드 CPU 소켓 호환',
        wrongChoices: ['바탕 화면 배경색', '휴지통 아이콘 모양', '인쇄 대기열 이름'],
        explanation: 'CPU는 메인보드 소켓과 지원 칩셋이 맞아야 장착하고 사용할 수 있어.',
      },
    ],
  },
  {
    id: '039',
    section: '컴퓨터 소프트웨어',
    title: '소프트웨어의 개요',
    cards: [
      {
        title: '소프트웨어는 명령 묶음',
        setupBody: '하드웨어가 직접 만질 수 있는 장치라면, 소프트웨어는 일을 시키는 명령 묶음이야.',
        body: '프로그램, 관련 데이터, 문서는 컴퓨터가 작업을 하게 만드는 소프트웨어 쪽으로 봐.',
        keyPoints: ['프로그램 포함', '관련 데이터와 문서 포함', '하드웨어 활용 지시', '물리 장치와 구분'],
        examTip: '만질 수 있는 장치는 하드웨어, 실행되는 명령 묶음은 소프트웨어야.',
        visualHint: 'software-vs-hardware',
        questionPrompt: '컴퓨터가 작업을 하도록 만든 프로그램과 관련 자료는?',
        correct: '소프트웨어',
        wrongChoices: ['메인보드', '프린터', 'SSD'],
        explanation: '소프트웨어는 프로그램과 관련 자료를 뜻해. 메인보드, 프린터, SSD는 하드웨어야.',
      },
      {
        title: '시스템과 응용으로 나눠',
        setupBody: '시스템 소프트웨어는 컴퓨터 운영을 돕고, 응용 소프트웨어는 사용자의 작업을 돕는 쪽이야.',
        body: '운영체제는 시스템 소프트웨어, 엑셀·한글·브라우저는 응용 소프트웨어로 구분해.',
        keyPoints: ['시스템 소프트웨어: 운영 지원', '응용 소프트웨어: 사용자 작업', '운영체제는 시스템 쪽', '엑셀은 응용 쪽'],
        examTip: '운영체제와 응용 프로그램을 서로 바꿔 낸 보기부터 조심해.',
        visualHint: 'software-vs-hardware',
        questionPrompt: '운영체제와 엑셀을 바르게 분류한 것은?',
        correct: '운영체제는 시스템 소프트웨어, 엑셀은 응용 소프트웨어',
        wrongChoices: ['운영체제와 엑셀 모두 하드웨어', '운영체제는 응용, 엑셀은 시스템', '운영체제는 출력장치, 엑셀은 입력장치'],
        explanation: '운영체제는 컴퓨터 운영을 돕는 시스템 소프트웨어고, 엑셀은 사용자 작업을 돕는 응용 소프트웨어야.',
      },
    ],
  },
  {
    id: '040',
    section: '컴퓨터 소프트웨어',
    title: '운영체제',
    cards: [
      {
        title: '운영체제는 자원 배분자',
        setupBody: '운영체제는 CPU, 메모리, 파일, 장치를 여러 프로그램이 함께 쓰게 조정해.',
        body: '프로세스 관리, 기억장치 관리, 파일 관리, 장치 관리가 운영체제의 핵심 역할이야.',
        keyPoints: ['프로세스 관리', '메모리 관리', '파일 시스템 관리', '입출력 장치 관리'],
        examTip: '운영체제 역할은 자원 관리와 사용자 편의 제공으로 크게 묶어.',
        visualHint: 'os-resource-manager',
        questionPrompt: 'CPU, 메모리, 파일, 장치를 관리하는 시스템 소프트웨어는?',
        correct: '운영체제',
        wrongChoices: ['프린터 드라이버만', '원형 차트', '문자표'],
        explanation: '운영체제는 컴퓨터 자원을 관리하고 프로그램 실행 환경을 제공하는 시스템 소프트웨어야.',
      },
      {
        title: '인터페이스와 보안도 맡아',
        setupBody: '사용자가 컴퓨터에 명령을 내릴 수 있게 GUI나 CLI 같은 환경을 제공해.',
        body: '운영체제는 사용자 계정, 접근 권한, 보안 업데이트 같은 보호 기능도 다뤄.',
        keyPoints: ['GUI/CLI 제공', '프로그램 실행 환경', '사용자 계정 관리', '권한과 보안 관리'],
        examTip: '운영체제를 단순 화면 꾸미기 기능으로만 보면 틀리기 쉬워.',
        visualHint: 'os-resource-manager',
        questionPrompt: '아이콘과 창을 보며 명령을 내리는 사용자 환경은?',
        correct: 'GUI',
        wrongChoices: ['RAID', 'DPI', 'POST'],
        explanation: 'GUI는 그래픽 화면 기반 사용자 인터페이스야. 운영체제는 이런 조작 환경을 제공해.',
      },
    ],
  },
  {
    id: '041',
    section: '컴퓨터 소프트웨어',
    title: '운영체제의 운영 방식',
    cards: [
      {
        title: '운영 방식은 처리 시간 기준',
        setupBody: '운영체제가 작업을 모아서 처리할지, 나눠 처리할지, 즉시 처리할지 나눠.',
        body: '일괄 처리는 작업을 모아 한꺼번에 처리하고, 실시간 처리는 정해진 시간 안에 반응해.',
        keyPoints: ['일괄 처리: 모아서 처리', '시분할 처리: 시간 조각 분배', '실시간 처리: 즉시성 중요', '다중 처리: 여러 CPU 활용'],
        examTip: '운영 방식은 "어떻게 시간을 나눠 처리하나"로 읽으면 쉬워.',
        visualHint: 'os-processing-modes',
        questionPrompt: '작업을 모아 두었다가 한꺼번에 처리하는 운영 방식은?',
        correct: '일괄 처리',
        wrongChoices: ['시분할 처리', '실시간 처리', '미러링'],
        explanation: '일괄 처리는 작업을 모아 한 번에 처리하는 방식이야. 즉시 반응이 핵심이면 실시간 처리야.',
      },
      {
        title: '시분할은 CPU 시간을 쪼개',
        setupBody: '여러 사용자가 동시에 쓰는 것처럼 느끼도록 CPU 시간을 아주 짧게 나눠.',
        body: '시분할 시스템은 대화식 처리에 알맞고, 사용자마다 빠르게 응답받는 느낌을 줘.',
        keyPoints: ['CPU 시간 조각 분배', '여러 사용자 지원', '대화식 처리에 적합', '응답 시간 중요'],
        examTip: '여러 사용자가 동시에 쓰는 느낌이면 시분할 처리를 떠올려.',
        visualHint: 'os-processing-modes',
        questionPrompt: '여러 사용자가 CPU 시간을 나눠 쓰는 운영 방식은?',
        correct: '시분할 처리',
        wrongChoices: ['일괄 처리', '오프라인 백업', 'RAID 1'],
        explanation: '시분할 처리는 CPU 시간을 아주 짧게 나눠 여러 사용자가 동시에 쓰는 듯한 환경을 만들어.',
      },
    ],
  },
  {
    id: '042',
    section: '컴퓨터 소프트웨어',
    title: '프로그래밍 언어',
    cards: [
      {
        title: '언어는 컴퓨터에게 쓰는 명령',
        setupBody: '프로그래밍 언어는 사람이 컴퓨터에게 처리할 일을 적는 규칙 있는 말이야.',
        body: '고급 언어는 사람이 읽기 쉽고, 기계어는 컴퓨터가 직접 처리하는 0과 1에 가까워.',
        keyPoints: ['고급 언어: 사람이 이해 쉬움', '저급 언어: 기계 가까움', '기계어: 0과 1 중심', '번역 과정 필요'],
        examTip: '사람에게 가까운지, 기계에 가까운지로 고급/저급 언어를 구분해.',
        visualHint: 'programming-language',
        questionPrompt: '사람이 비교적 읽기 쉽도록 만든 프로그래밍 언어는?',
        correct: '고급 언어',
        wrongChoices: ['기계어', '마이크로프로세서', '프린터 드라이버'],
        explanation: '고급 언어는 사람이 이해하기 쉽게 만든 언어야. 컴퓨터가 직접 처리하려면 번역 과정이 필요해.',
      },
      {
        title: '컴파일러와 인터프리터 구분',
        setupBody: '사람이 쓴 코드는 컴퓨터가 실행할 수 있게 번역되거나 해석돼.',
        body: '컴파일러는 전체를 번역해 실행 파일을 만들고, 인터프리터는 실행하며 한 줄씩 해석해.',
        keyPoints: ['컴파일러: 전체 번역', '실행 파일 생성 가능', '인터프리터: 순차 해석', '오류 발견 시점 차이'],
        examTip: '전체 번역은 컴파일러, 실행 중 해석은 인터프리터로 연결해.',
        visualHint: 'programming-language',
        questionPrompt: '프로그램 전체를 미리 번역해 실행 파일을 만들기 쉬운 번역기는?',
        correct: '컴파일러',
        wrongChoices: ['인터프리터', '스캐너', '라우터'],
        explanation: '컴파일러는 소스 전체를 번역해 실행 가능한 형태로 만드는 방식에 가까워.',
      },
    ],
  },
  {
    id: '043',
    section: '컴퓨터 소프트웨어',
    title: '웹 프로그래밍 언어',
    cards: [
      {
        title: 'HTML은 웹 문서 구조',
        setupBody: 'HTML은 제목, 문단, 링크, 이미지 같은 웹페이지 요소의 구조를 잡아.',
        body: '태그를 사용해 문서의 의미와 구조를 표시하고, 브라우저가 이를 해석해.',
        keyPoints: ['HTML: 구조 담당', '태그 사용', '링크와 이미지 삽입', '브라우저가 해석'],
        examTip: 'HTML은 꾸미기나 동작보다 웹 문서 구조라는 점을 먼저 잡아.',
        visualHint: 'html-css-js',
        questionPrompt: '웹페이지의 제목, 문단, 링크 같은 구조를 만드는 언어는?',
        correct: 'HTML',
        wrongChoices: ['CSS', 'JavaScript', 'SMTP'],
        explanation: 'HTML은 웹 문서의 구조를 만드는 언어야. CSS는 꾸미기, JavaScript는 동작 처리에 가까워.',
      },
      {
        title: 'CSS는 모양, JS는 동작',
        setupBody: '웹페이지는 구조, 모양, 동작을 나누어 만들면 역할이 선명해져.',
        body: 'CSS는 색, 글꼴, 배치 같은 스타일을 맡고 JavaScript는 클릭 반응 같은 동작을 맡아.',
        keyPoints: ['CSS: 스타일과 배치', 'JavaScript: 동작과 이벤트', 'HTML: 구조', '역할 구분이 핵심'],
        examTip: '색과 배치는 CSS, 클릭 반응과 계산은 JavaScript로 봐.',
        visualHint: 'html-css-js',
        questionPrompt: '웹페이지의 색, 글꼴, 배치를 주로 담당하는 것은?',
        correct: 'CSS',
        wrongChoices: ['HTML', 'JavaScript', 'FTP'],
        explanation: 'CSS는 웹페이지의 스타일과 배치를 담당해. HTML은 구조, JavaScript는 동작 쪽이야.',
      },
    ],
  },
  {
    id: '044',
    section: '인터넷 활용',
    title: '네트워크 운영 방식과 통신망의 종류',
    cards: [
      {
        title: '네트워크는 자료 공유 연결망',
        setupBody: '네트워크는 여러 컴퓨터와 장치가 데이터를 주고받도록 연결한 구조야.',
        body: '운영 방식은 클라이언트-서버와 P2P처럼 역할을 어떻게 나누는지로 구분해.',
        keyPoints: ['클라이언트-서버: 제공자와 요청자 분리', 'P2P: 서로 대등하게 공유', '자원 공유 가능', '통신 규칙 필요'],
        examTip: '서비스를 제공하는 전용 컴퓨터가 있으면 클라이언트-서버 방식을 떠올려.',
        visualHint: 'network-types',
        questionPrompt: '전용 서버가 서비스를 제공하고 사용자가 요청하는 운영 방식은?',
        correct: '클라이언트-서버 방식',
        wrongChoices: ['P2P 방식', 'RAID 0', '일괄 처리'],
        explanation: '클라이언트-서버 방식은 서버가 서비스를 제공하고 클라이언트가 요청하는 구조야.',
      },
      {
        title: 'LAN·MAN·WAN은 범위 차이',
        setupBody: '통신망 종류는 얼마나 넓은 지역을 연결하는지로 먼저 구분해.',
        body: 'LAN은 가까운 건물 안, MAN은 도시 규모, WAN은 국가·세계처럼 넓은 범위를 연결해.',
        keyPoints: ['LAN: 근거리 통신망', 'MAN: 도시권 통신망', 'WAN: 광역 통신망', '범위가 핵심 기준'],
        examTip: '학교·회사 안은 LAN, 넓은 지역 연결은 WAN으로 잡아.',
        visualHint: 'network-types',
        questionPrompt: '학교나 회사 건물 안처럼 가까운 범위를 연결하는 통신망은?',
        correct: 'LAN',
        wrongChoices: ['WAN', 'MAN', 'DNS'],
        explanation: 'LAN은 가까운 범위의 장치를 연결하는 근거리 통신망이야.',
      },
    ],
  },
  {
    id: '045',
    section: '인터넷 활용',
    title: '망 구성과 네트워크 장비',
    cards: [
      {
        title: '망 구성은 연결 모양',
        setupBody: '네트워크 장치가 어떤 형태로 연결되는지에 따라 버스형, 스타형, 링형으로 나눠.',
        body: '스타형은 중앙 장비에 각각 연결되어 관리가 쉽지만 중앙 장비 장애에 약해.',
        keyPoints: ['버스형: 한 선 공유', '스타형: 중앙 장비 중심', '링형: 고리 형태 연결', '장애 지점 특징 구분'],
        examTip: '중앙 장비가 나오면 스타형, 하나의 공통 선이면 버스형으로 봐.',
        visualHint: 'network-topology',
        questionPrompt: '중앙 장비에 각 컴퓨터가 따로 연결되는 망 구성은?',
        correct: '스타형',
        wrongChoices: ['버스형', '링형', '메시지형만'],
        explanation: '스타형은 중앙 장비를 중심으로 각 장치가 연결되는 형태야.',
      },
      {
        title: '장비는 어디까지 보내나 봐',
        setupBody: '허브, 스위치, 라우터는 데이터를 전달하지만 판단 범위가 달라.',
        body: '스위치는 같은 네트워크 안 목적지별 전달, 라우터는 서로 다른 네트워크 사이 경로 선택을 맡아.',
        keyPoints: ['허브: 단순 전달', '스위치: MAC 주소 기반 전달', '라우터: 네트워크 간 연결', '게이트웨이와 연결'],
        examTip: '다른 네트워크로 길을 찾아 보내면 라우터야.',
        visualHint: 'network-topology',
        questionPrompt: '서로 다른 네트워크 사이에서 경로를 선택해 연결하는 장비는?',
        correct: '라우터',
        wrongChoices: ['허브', '스위치', '키보드'],
        explanation: '라우터는 네트워크와 네트워크 사이에서 목적지까지 갈 경로를 선택해.',
      },
    ],
  },
  {
    id: '046',
    section: '인터넷 활용',
    title: '인터넷의 개요',
    cards: [
      {
        title: '인터넷은 네트워크들의 네트워크',
        setupBody: '인터넷은 전 세계 여러 네트워크가 TCP/IP 규칙으로 서로 연결된 거대한 망이야.',
        body: '웹, 이메일, 파일 전송, 원격 접속 같은 여러 서비스가 인터넷 위에서 동작해.',
        keyPoints: ['전 세계 네트워크 연결', 'TCP/IP 기반', '여러 서비스 제공', '특정 웹사이트 하나와 구분'],
        examTip: '인터넷은 기반 망, 웹은 그 위에서 쓰는 서비스 중 하나야.',
        visualHint: 'internet-global',
        questionPrompt: '인터넷에 관한 설명으로 가장 알맞은 것은?',
        correct: '전 세계 여러 네트워크가 TCP/IP로 연결된 거대한 망',
        wrongChoices: ['엑셀 차트만 저장하는 파일', '프린터 잉크를 관리하는 장치', '휴지통 안의 임시 폴더'],
        explanation: '인터넷은 전 세계 네트워크가 공통 통신 규칙으로 연결된 기반망이야.',
      },
      {
        title: '웹은 인터넷 위의 서비스',
        setupBody: '웹은 브라우저로 문서와 링크를 보는 서비스이고, 인터넷 전체와 같은 말은 아니야.',
        body: 'WWW는 HTTP/HTTPS와 브라우저를 통해 하이퍼텍스트 문서를 주고받는 서비스야.',
        keyPoints: ['웹은 인터넷 서비스', '브라우저로 이용', 'HTTP/HTTPS와 연결', '하이퍼링크 사용'],
        examTip: '인터넷과 웹을 같은 뜻으로 보는 보기를 조심해.',
        visualHint: 'internet-global',
        questionPrompt: '브라우저로 하이퍼링크 문서를 보는 인터넷 서비스는?',
        correct: 'WWW',
        wrongChoices: ['POST', 'RAID', 'BIOS'],
        explanation: 'WWW는 웹 서비스야. 인터넷이라는 기반망 위에서 HTTP/HTTPS로 문서를 주고받아.',
      },
    ],
  },
  {
    id: '047',
    section: '인터넷 활용',
    title: '인터넷의 주소 체계',
    cards: [
      {
        title: 'IPv4와 IPv6를 숫자로 갈라',
        setupBody: 'IP 주소는 인터넷에서 컴퓨터를 찾아가는 번지수야. 버전에 따라 모양이 달라.',
        body: 'IPv4는 32비트를 8비트씩 4부분, IPv6는 128비트를 16비트씩 8부분으로 나눠.',
        keyPoints: ['IPv4: 32비트, 점(.)으로 구분', 'IPv6: 128비트, 콜론(:)으로 구분', 'IPv6는 주소 부족 문제를 해결해', 'IPv6는 인증·보안 기능이 강화돼'],
        examTip: '32비트·점·10진수면 IPv4, 128비트·콜론·16진수면 IPv6. 숫자 조합만 외워도 바로 풀려.',
        visualHint: 'ip-address',
        questionPrompt: 'IPv6 주소 체계에 관한 설명으로 옳은 것은?',
        correct: '128비트를 16비트씩 8부분으로 나누고 콜론(:)으로 구분해',
        wrongChoices: ['32비트를 8비트씩 4부분으로 나누고 점(.)으로 구분해', 'IPv4보다 사용할 수 있는 주소 개수가 더 적어', '주소의 각 부분을 10진수로만 표기해야 해'],
        explanation: 'IPv6는 128비트·콜론·16진수 표기로, 주소 고갈을 해결하고 보안과 전송 기능을 강화한 차세대 체계야.',
      },
      {
        title: '도메인과 DNS는 한 세트야',
        setupBody: '숫자 IP는 외우기 힘들어서 사람용 이름인 도메인을 따로 둬.',
        body: 'DNS는 도메인 이름을 실제 IP 주소로 바꿔 주는 시스템이야.',
        keyPoints: ['도메인: 기억하기 쉬운 문자 주소', 'DNS가 도메인을 IP로 변환해', 'URL은 프로토콜://도메인/경로 순서야'],
        examTip: '"도메인을 IP 주소로 변환하는 것은?" 답은 거의 항상 DNS야. IP 자동 할당은 DHCP 몫이야.',
        questionPrompt: '도메인 이름을 IP 주소로 변환해 주는 것은?',
        correct: 'DNS',
        wrongChoices: ['DHCP', 'URL', 'HTTP'],
        explanation: 'DNS가 이름을 IP로 바꿔 줘. DHCP는 IP를 자동으로 나눠 주는 쪽이라 서로 바꿔 내는 함정이 많아.',
      },
    ],
  },
  {
    id: '048',
    section: '인터넷 활용',
    title: '프로토콜(Protocol)',
    cards: [
      {
        title: '프로토콜은 통신 규칙',
        setupBody: '컴퓨터끼리 데이터를 주고받으려면 형식, 순서, 오류 처리 규칙을 맞춰야 해.',
        body: '프로토콜은 서로 다른 장치가 같은 약속으로 통신하게 해 주는 규칙이야.',
        keyPoints: ['데이터 형식 약속', '전송 순서 약속', '오류 처리 방식', '서비스별 프로토콜 존재'],
        examTip: '프로토콜은 프로그램 이름이 아니라 통신 약속이라는 점을 잡아.',
        visualHint: 'protocol-rules',
        questionPrompt: '컴퓨터끼리 데이터를 주고받기 위해 정한 통신 약속은?',
        correct: '프로토콜',
        wrongChoices: ['레지스터', 'DPI', '휴지통'],
        explanation: '프로토콜은 데이터 형식과 전송 절차를 맞추기 위한 통신 규칙이야.',
      },
      {
        title: '서비스별 프로토콜을 짝지어',
        setupBody: '웹, 파일 전송, 메일, 원격 접속은 대표 프로토콜이 서로 달라.',
        body: 'HTTP는 웹, FTP는 파일 전송, SMTP는 메일 전송, TCP/IP는 인터넷 기본 통신과 연결돼.',
        keyPoints: ['HTTP: 웹 문서', 'FTP: 파일 전송', 'SMTP: 메일 전송', 'TCP/IP: 인터넷 기본'],
        examTip: '프로토콜 문제는 이름과 대표 서비스를 짝지어 외우는 게 빨라.',
        visualHint: 'protocol-rules',
        questionPrompt: '파일을 주고받는 서비스와 가장 가까운 프로토콜은?',
        correct: 'FTP',
        wrongChoices: ['HTTP', 'SMTP', 'POP3'],
        explanation: 'FTP는 File Transfer Protocol로 파일 전송에 쓰이는 대표 프로토콜이야.',
      },
    ],
  },
  {
    id: '049',
    section: '인터넷 활용',
    title: '인터넷 서비스',
    cards: [
      {
        title: '인터넷 서비스는 웹만 아니야',
        setupBody: '인터넷 위에서는 웹, 이메일, 파일 전송, 원격 접속 같은 여러 서비스가 돌아가.',
        body: '서비스를 구분할 때는 무엇을 주고받는지와 어떤 프로토콜을 쓰는지 함께 봐.',
        keyPoints: ['WWW: 웹 문서', 'E-mail: 전자우편', 'FTP: 파일 전송', 'Telnet/SSH: 원격 접속'],
        examTip: '인터넷 서비스와 프로토콜 이름을 함께 묶어 두면 보기 함정이 줄어.',
        visualHint: 'internet-services',
        questionPrompt: '인터넷 서비스의 예로 알맞은 것은?',
        correct: '웹, 이메일, 파일 전송',
        wrongChoices: ['메모리 슬롯, CPU 소켓, 전원 케이블', '셀 병합, 조건부 서식, 피벗 테이블', 'DPI, 해상도, 프린터 토너'],
        explanation: '웹, 이메일, 파일 전송은 인터넷 위에서 제공되는 대표 서비스야.',
      },
      {
        title: '메일은 보내기와 받기 분리',
        setupBody: '이메일은 보낼 때와 받을 때 쓰는 프로토콜이 다르게 나올 수 있어.',
        body: 'SMTP는 메일 전송, POP3와 IMAP은 메일 수신 쪽으로 연결해.',
        keyPoints: ['SMTP: 메일 보내기', 'POP3: 메일 받기', 'IMAP: 서버 동기화 수신', '메일 프로토콜 구분'],
        examTip: 'SMTP는 보내기, POP3/IMAP은 받기. 이 한 줄이 핵심이야.',
        visualHint: 'internet-services',
        questionPrompt: '전자우편을 보낼 때 쓰는 대표 프로토콜은?',
        correct: 'SMTP',
        wrongChoices: ['POP3', 'IMAP', 'FTP'],
        explanation: 'SMTP는 메일 전송에 쓰여. POP3와 IMAP은 메일을 받는 쪽과 연결돼.',
      },
    ],
  },
  {
    id: '050',
    section: '인터넷 활용',
    title: '정보통신기술 활용',
    cards: [
      {
        title: 'ICT는 정보 처리와 통신 결합',
        setupBody: '정보통신기술(ICT)은 정보를 만들고 처리하고 네트워크로 주고받는 기술을 말해.',
        body: '모바일, 클라우드, IoT, 빅데이터 서비스는 ICT 활용 예로 자주 묶여 나와.',
        keyPoints: ['정보 처리 기술', '통신 기술 결합', '모바일 서비스', '클라우드와 IoT 활용'],
        examTip: 'ICT는 컴퓨터 기술과 통신 기술을 함께 보는 넓은 개념이야.',
        visualHint: 'ict-services',
        questionPrompt: '정보 처리 기술과 통신 기술을 함께 활용하는 넓은 개념은?',
        correct: 'ICT',
        wrongChoices: ['DPI', 'RAID', 'POST'],
        explanation: 'ICT는 Information and Communication Technology로 정보 처리와 통신 기술을 함께 활용하는 개념이야.',
      },
      {
        title: '클라우드와 IoT를 갈라',
        setupBody: '클라우드는 인터넷으로 서버와 저장 공간을 빌려 쓰고, IoT는 사물이 연결돼 데이터를 주고받아.',
        body: '스마트워치, 센서, 가전이 네트워크로 연결되면 IoT 흐름으로 봐.',
        keyPoints: ['클라우드: 원격 자원 사용', 'IoT: 사물 인터넷', '센서 데이터 수집', '모바일·AI와 연결'],
        examTip: '서버·저장공간을 빌리면 클라우드, 사물이 연결되면 IoT야.',
        visualHint: 'ict-services',
        questionPrompt: '스마트 가전과 센서가 인터넷에 연결되어 데이터를 주고받는 기술은?',
        correct: 'IoT',
        wrongChoices: ['클라우드만', 'ASCII', 'RAID 1'],
        explanation: 'IoT는 사물 인터넷으로, 기기와 센서가 네트워크에 연결되어 데이터를 주고받는 기술이야.',
      },
    ],
  },
  {
    id: '051',
    section: '멀티미디어 활용',
    title: '멀티미디어',
    cards: [
      {
        title: '멀티미디어는 여러 매체 결합',
        setupBody: '문자, 그림, 소리, 영상, 애니메이션을 함께 사용해 정보를 전달해.',
        body: '멀티미디어는 여러 감각을 활용하고, 사용자 반응을 받는 상호작용성을 가질 수 있어.',
        keyPoints: ['문자·이미지·소리·영상 결합', '상호작용성', '비선형 탐색 가능', '용량 증가 가능'],
        examTip: '여러 매체 결합과 상호작용성이 멀티미디어 핵심 단서야.',
        visualHint: 'multimedia-media-types',
        questionPrompt: '문자, 그림, 소리, 영상을 함께 활용하는 정보 표현 방식은?',
        correct: '멀티미디어',
        wrongChoices: ['보수', 'RAID', '게이트웨이'],
        explanation: '멀티미디어는 여러 매체를 결합해 정보를 전달하는 방식이야.',
      },
      {
        title: '상호작용성과 용량을 같이 봐',
        setupBody: '사용자가 누르고 선택하면 내용이 반응하는 점도 멀티미디어 특징으로 나와.',
        body: '영상과 소리는 전달력이 좋지만 용량이 커지고 압축이 필요할 수 있어.',
        keyPoints: ['상호작용 가능', '교육·게임 활용', '큰 저장 용량', '압축 기술 필요'],
        examTip: '멀티미디어는 장점과 함께 큰 용량, 저작권 문제도 같이 봐.',
        visualHint: 'multimedia-media-types',
        questionPrompt: '멀티미디어 자료의 단점이나 주의점으로 알맞은 것은?',
        correct: '용량이 커져 압축이나 저장 공간 관리가 필요할 수 있어',
        wrongChoices: ['항상 문자만 저장할 수 있어', '소리와 영상을 절대 포함하지 못해', '사용자 입력에 반응할 수 없어'],
        explanation: '멀티미디어는 여러 매체를 담기 때문에 용량이 커질 수 있어 압축과 저장 공간을 고려해야 해.',
      },
    ],
  },
  {
    id: '052',
    section: '멀티미디어 활용',
    title: '멀티미디어 소프트웨어',
    cards: [
      {
        title: '제작 도구는 매체를 만든다',
        setupBody: '이미지, 오디오, 비디오를 만들거나 수정하는 프로그램이 멀티미디어 제작 도구야.',
        body: '이미지 편집기, 사운드 편집기, 동영상 편집기는 다루는 매체가 서로 달라.',
        keyPoints: ['이미지 편집 도구', '오디오 편집 도구', '비디오 편집 도구', '저작 도구와 연결'],
        examTip: '프로그램 이름보다 어떤 매체를 만들고 고치는지 먼저 봐.',
        visualHint: 'media-software',
        questionPrompt: '이미지, 소리, 영상을 만들거나 편집하는 프로그램은?',
        correct: '멀티미디어 제작 소프트웨어',
        wrongChoices: ['네트워크 라우터', '프린터 대기열', '보수 계산기'],
        explanation: '멀티미디어 제작 소프트웨어는 이미지, 오디오, 비디오 같은 매체 자료를 만들거나 편집해.',
      },
      {
        title: '재생 도구와 편집 도구 구분',
        setupBody: '미디어 플레이어는 자료를 재생하고, 편집 도구는 자료를 고치거나 만든다.',
        body: '저작 도구는 여러 매체를 묶어 교육용 콘텐츠나 발표 자료를 만드는 데 쓰여.',
        keyPoints: ['재생 도구: 보기·듣기', '편집 도구: 수정·제작', '저작 도구: 콘텐츠 구성', '역할 구분이 핵심'],
        examTip: '보기만 하면 재생, 고치면 편집, 여러 매체를 묶으면 저작 도구야.',
        visualHint: 'media-software',
        questionPrompt: '동영상 파일을 보기만 하는 데 주로 쓰는 소프트웨어는?',
        correct: '재생 소프트웨어',
        wrongChoices: ['저작 도구', '장치 관리자', '컴파일러'],
        explanation: '재생 소프트웨어는 이미 만들어진 미디어를 보여 주거나 들려주는 도구야.',
      },
    ],
  },
  {
    id: '053',
    section: '멀티미디어 활용',
    title: '멀티미디어 그래픽 데이터',
    cards: [
      {
        title: '비트맵은 픽셀을 저장해',
        setupBody: '사진처럼 작은 점 하나하나의 색을 저장하는 방식이 비트맵이야.',
        body: '비트맵은 확대하면 픽셀이 커져 계단처럼 깨질 수 있고, 사진 표현에 잘 맞아.',
        keyPoints: ['픽셀 기반', '확대 시 품질 저하 가능', '사진 표현에 적합', 'BMP·JPG·PNG와 연결'],
        examTip: '확대했을 때 깨지는지 여부가 비트맵과 벡터의 단골 차이야.',
        visualHint: 'bitmap-vector-compare',
        questionPrompt: '픽셀을 모아 그림을 표현하고 확대하면 깨질 수 있는 방식은?',
        correct: '비트맵',
        wrongChoices: ['벡터', 'MIDI', 'SMTP'],
        explanation: '비트맵은 픽셀 색 정보를 저장해 이미지를 만들기 때문에 확대하면 픽셀이 두드러질 수 있어.',
      },
      {
        title: '벡터는 도형 정보를 저장해',
        setupBody: '벡터는 점, 선, 곡선, 도형의 수학적 정보를 저장하는 방식이야.',
        body: '확대해도 비교적 선명해서 로고, 아이콘, 글자 모양 같은 자료에 잘 맞아.',
        keyPoints: ['도형·수식 기반', '확대해도 선명한 편', '로고와 아이콘에 적합', '복잡한 사진에는 비트맵이 자연스러움'],
        examTip: '로고처럼 확대해도 선명해야 하면 벡터를 떠올려.',
        visualHint: 'bitmap-vector-compare',
        questionPrompt: '선과 도형 정보로 그림을 표현해 확대해도 선명한 편인 방식은?',
        correct: '벡터',
        wrongChoices: ['비트맵', 'MP3', 'POP3'],
        explanation: '벡터는 도형 정보를 저장하므로 크기를 키워도 선명한 편이야. 사진 표현은 비트맵이 더 자연스러워.',
      },
    ],
  },
  {
    id: '054',
    section: '멀티미디어 활용',
    title: '멀티미디어 오디오/비디오 데이터',
    cards: [
      {
        title: '오디오는 소리를 숫자로 바꿔',
        setupBody: '아날로그 소리는 샘플링과 양자화를 거쳐 디지털 오디오 데이터가 돼.',
        body: 'MP3는 손실 압축 오디오 형식으로 용량을 줄이는 데 자주 쓰여.',
        keyPoints: ['샘플링: 소리 측정', '양자화: 숫자 단계화', 'MP3: 손실 압축', 'WAV: 비압축·고음질 예시'],
        examTip: 'MP3는 오디오, MP4는 비디오 쪽으로 먼저 연결해.',
        visualHint: 'audio-video-formats',
        questionPrompt: '소리를 손실 압축해 저장하는 대표 오디오 형식은?',
        correct: 'MP3',
        wrongChoices: ['MP4', 'JPG', 'HTML'],
        explanation: 'MP3는 오디오 손실 압축 형식이야. MP4는 주로 동영상 컨테이너로 자주 나와.',
      },
      {
        title: '비디오는 프레임과 소리 묶음',
        setupBody: '비디오는 연속된 화면 프레임과 소리를 함께 담아 움직임을 표현해.',
        body: '동영상은 용량이 커서 코덱으로 압축하고, MP4 같은 컨테이너에 담는 경우가 많아.',
        keyPoints: ['프레임: 한 장면', '프레임률: 초당 장면 수', '코덱: 압축·복원 방식', 'MP4: 동영상 컨테이너'],
        examTip: '코덱은 파일을 압축하고 풀기 위한 방식으로 기억해.',
        visualHint: 'audio-video-formats',
        questionPrompt: '동영상 데이터를 압축하고 다시 풀 때 쓰는 방식은?',
        correct: '코덱',
        wrongChoices: ['DNS', '레지스터', '폴더 옵션'],
        explanation: '코덱은 비디오나 오디오 데이터를 압축하고 복원하는 방식이야.',
      },
    ],
  },
  {
    id: '055',
    section: '멀티미디어 활용',
    title: '멀티미디어 활용',
    cards: [
      {
        title: '멀티미디어는 이해를 돕는다',
        setupBody: '글만으로 어려운 내용을 그림, 소리, 영상으로 함께 설명하면 더 빨리 이해돼.',
        body: '교육, 광고, 게임, 발표, 원격 회의처럼 전달력과 몰입이 필요한 곳에 많이 쓰여.',
        keyPoints: ['교육 콘텐츠', '광고·홍보', '게임과 체험', '발표와 회의'],
        examTip: '활용 분야와 장점을 함께 묻는 문제가 자주 나와.',
        visualHint: 'multimedia-use-cases',
        questionPrompt: '멀티미디어 활용의 장점으로 알맞은 것은?',
        correct: '그림, 소리, 영상으로 정보 전달력을 높일 수 있어',
        wrongChoices: ['항상 저장 공간을 거의 쓰지 않아', '저작권 확인이 전혀 필요 없어', '문자 데이터만 다룰 수 있어'],
        explanation: '멀티미디어는 여러 감각을 활용해 이해와 몰입을 높여. 대신 용량과 저작권도 봐야 해.',
      },
      {
        title: '활용 전 용량과 권리를 봐',
        setupBody: '영상과 음악 자료는 용량이 크고 만든 사람의 권리 문제가 따라올 수 있어.',
        body: '압축, 파일 형식, 라이선스, 출처 표시는 멀티미디어 활용 때 함께 확인해야 해.',
        keyPoints: ['큰 용량 관리', '압축 필요 가능', '저작권 확인', '출처와 라이선스 확인'],
        examTip: '멀티미디어 장점만 보지 말고 용량과 저작권 같은 주의점도 같이 봐.',
        visualHint: 'multimedia-use-cases',
        questionPrompt: '멀티미디어 자료를 사용할 때 함께 고려해야 할 것은?',
        correct: '파일 용량, 압축, 저작권과 라이선스',
        wrongChoices: ['CPU 소켓 모양만', '휴지통 아이콘 색만', '작업 표시줄 위치만'],
        explanation: '멀티미디어 자료는 용량이 크고 권리 문제가 생길 수 있어 사용 조건을 확인해야 해.',
      },
    ],
  },
  {
    id: '056',
    section: '컴퓨터 시스템 보호',
    title: '저작권 보호',
    cards: [
      {
        title: '저작권은 창작물 권리 보호',
        setupBody: '글, 음악, 그림, 영상, 프로그램은 만든 사람의 권리가 붙을 수 있어.',
        body: '저작권은 무단 복제, 배포, 변경, 상업적 이용을 제한해 창작자를 보호해.',
        keyPoints: ['창작물 보호', '무단 복제 금지', '무단 배포 금지', '소프트웨어에도 적용'],
        examTip: '소프트웨어 불법 복제는 저작권 침해 사례로 자주 나와.',
        visualHint: 'copyright-protection',
        questionPrompt: '소프트웨어를 허락 없이 복제해 배포하는 행위와 가장 관련 깊은 것은?',
        correct: '저작권 침해',
        wrongChoices: ['가상 데스크톱 생성', 'DPI 향상', 'RAID 미러링'],
        explanation: '소프트웨어도 저작권 보호 대상이라 허락 없는 복제와 배포는 침해가 될 수 있어.',
      },
      {
        title: '무료 자료도 라이선스 확인',
        setupBody: '무료로 받을 수 있어도 수정, 재배포, 상업적 사용 조건은 다를 수 있어.',
        body: '오픈소스나 무료 이미지도 라이선스와 출처 표시 조건을 확인해야 안전해.',
        keyPoints: ['라이선스 확인', '상업적 사용 조건', '출처 표시 조건', '재배포 가능 여부'],
        examTip: '무료와 자유 사용은 같은 뜻이 아닐 수 있다는 점을 기억해.',
        visualHint: 'copyright-protection',
        questionPrompt: '무료 이미지나 프로그램을 사용할 때 먼저 확인할 것은?',
        correct: '라이선스와 사용 조건',
        wrongChoices: ['프린터 대기열 순서', 'CPU 팬 색상', '차트 범례 위치'],
        explanation: '무료 자료도 사용 범위가 제한될 수 있어 라이선스와 출처 표시 조건을 확인해야 해.',
      },
    ],
  },
  {
    id: '057',
    section: '컴퓨터 시스템 보호',
    title: '바이러스(Virus)',
    cards: [
      {
        title: '바이러스는 파일에 붙어 퍼져',
        setupBody: '바이러스는 정상 파일이나 프로그램에 붙어 실행될 때 피해를 줄 수 있어.',
        body: '웜은 스스로 네트워크로 퍼지고, 트로이 목마는 유용한 프로그램처럼 속이는 쪽이야.',
        keyPoints: ['바이러스: 파일 감염', '웜: 스스로 전파', '트로이 목마: 위장', '랜섬웨어: 파일 잠금·금전 요구'],
        examTip: '바이러스, 웜, 트로이 목마는 퍼지는 방식과 속임수 차이로 구분해.',
        visualHint: 'malware-types',
        questionPrompt: '정상 파일에 붙어 실행될 때 함께 퍼지는 악성 프로그램은?',
        correct: '바이러스',
        wrongChoices: ['웜', '트로이 목마', '방화벽'],
        explanation: '바이러스는 다른 파일에 감염되어 퍼지는 특징이 있어. 웜은 스스로 전파되는 쪽이야.',
      },
      {
        title: '백신과 업데이트로 줄여',
        setupBody: '악성코드 예방은 백신 설치 하나로 끝나지 않고 최신 업데이트와 습관이 함께 필요해.',
        body: '의심 파일 실행을 피하고, 백신 실시간 감시와 보안 패치를 유지해야 감염 위험이 줄어.',
        keyPoints: ['백신 실시간 감시', '정기 검사', '보안 업데이트', '의심 첨부파일 주의'],
        examTip: '예방은 백신, 업데이트, 의심 파일 주의 세 묶음으로 봐.',
        visualHint: 'malware-types',
        questionPrompt: '악성코드 감염 위험을 줄이는 방법으로 알맞은 것은?',
        correct: '백신 검사와 보안 업데이트를 최신으로 유지해',
        wrongChoices: ['파일 확장자를 항상 숨겨', '방화벽을 항상 삭제해', '알 수 없는 첨부파일을 바로 실행해'],
        explanation: '백신과 보안 업데이트는 알려진 위협을 줄이는 기본 수단이야. 의심 파일 실행도 피해야 해.',
      },
    ],
  },
  {
    id: '058',
    section: '컴퓨터 시스템 보호',
    title: '정보 보안 개요',
    cards: [
      {
        title: '보안 3요소는 CIA',
        setupBody: '정보 보안은 기밀성, 무결성, 가용성을 지키는 일로 정리해.',
        body: '기밀성은 허가된 사람만 접근, 무결성은 내용 변조 방지, 가용성은 필요할 때 사용 가능이야.',
        keyPoints: ['기밀성: 허가된 접근', '무결성: 변조 방지', '가용성: 사용 가능 상태', 'CIA 3요소'],
        examTip: '기밀성·무결성·가용성 뜻을 서로 바꿔 내는 보기를 조심해.',
        visualHint: 'cia-triad',
        questionPrompt: '정보 보안의 3요소로 알맞은 것은?',
        correct: '기밀성, 무결성, 가용성',
        wrongChoices: ['속도, 용량, 해상도', '복사, 붙여넣기, 삭제', 'HTML, CSS, JavaScript'],
        explanation: '정보 보안의 대표 3요소는 기밀성, 무결성, 가용성이야.',
      },
      {
        title: '기밀·무결·가용을 예로 갈라',
        setupBody: '암호로 접근을 막으면 기밀성, 해시로 변조를 잡으면 무결성에 가까워.',
        body: '서버가 필요한 시간에 계속 동작하도록 유지하는 것은 가용성 확보와 연결돼.',
        keyPoints: ['기밀성: 비밀 유지', '무결성: 내용 정확성', '가용성: 서비스 지속', '예시로 구분'],
        examTip: '무결성은 비밀 유지가 아니라 내용이 바뀌지 않는 성질이야.',
        visualHint: 'cia-triad',
        questionPrompt: '정보가 허가 없이 바뀌지 않도록 지키는 성질은?',
        correct: '무결성',
        wrongChoices: ['기밀성', '가용성', '압축률'],
        explanation: '무결성은 정보가 허가 없이 변조되지 않고 정확하게 유지되는 성질이야.',
      },
    ],
  },
  {
    id: '059',
    section: '컴퓨터 시스템 보호',
    title: '정보 보안 기법',
    cards: [
      {
        title: '암호화는 내용을 알아보기 어렵게',
        setupBody: '암호화는 평문을 키를 이용해 알아보기 어려운 암호문으로 바꾸는 방법이야.',
        body: '복호화는 올바른 키로 암호문을 다시 원래 내용에 가깝게 되돌리는 과정이야.',
        keyPoints: ['평문 → 암호문', '키 사용', '복호화와 한 쌍', '기밀성 보호에 도움'],
        examTip: '암호화는 내용 숨김, 인증은 사용자 확인으로 역할을 구분해.',
        visualHint: 'security-methods',
        questionPrompt: '정보 내용을 알아보기 어렵게 바꿔 보호하는 기법은?',
        correct: '암호화',
        wrongChoices: ['인증', '방화벽', '백업'],
        explanation: '암호화는 내용을 숨기는 기법이야. 인증은 사용자가 누구인지 확인하는 쪽이야.',
      },
      {
        title: '인증·방화벽·백업 역할',
        setupBody: '인증은 사용자 확인, 방화벽은 네트워크 통제, 백업은 복구 준비에 가까워.',
        body: '방화벽은 허용되지 않은 외부 접근을 차단하거나 통신을 통제해 내부망을 보호해.',
        keyPoints: ['인증: 사용자 확인', '방화벽: 접근 통제', '백업: 복구 대비', '보안 기법 역할 구분'],
        examTip: '방화벽은 파일 복사 도구가 아니라 네트워크 접근 통제 도구야.',
        visualHint: 'security-methods',
        questionPrompt: '외부 네트워크 접근을 통제해 내부망을 보호하는 기법은?',
        correct: '방화벽',
        wrongChoices: ['백업', '인증', '디스크 조각 모음'],
        explanation: '방화벽은 네트워크 접근을 감시하고 통제해 내부 시스템을 보호하는 보안 기법이야.',
      },
    ],
  },
];

const TOPIC_REINFORCEMENT_BUBBLES: Record<string, string[]> = {
  '002': [
    '파일 시스템은 파일을 책장 칸처럼 어디 둘지 정해 줘.',
    'NTFS는 책장에 자물쇠까지 달아 주는 방식이야.',
  ],
  '003': [
    '단축키는 마우스 대신 키 두세 개로 부탁하는 방법이야.',
    '복사, 붙여넣기, 창 전환처럼 자주 쓰는 일부터 잡아.',
  ],
  '004': [
    '바로 가기는 원본으로 가는 문 앞 안내판이야.',
    '안내판을 버려도 원본 가게가 바로 사라지진 않아.',
  ],
  '005': [
    '작업 표시줄은 지금 열린 앱을 보여 주는 책상 위 줄이야.',
    '오른쪽 알림 영역은 시계와 소리 같은 상태를 알려 줘.',
  ],
  '006': [
    '작업 보기는 열려 있는 창을 한 번에 펼쳐 보는 화면이야.',
    '가상 데스크톱은 공부방과 문서방을 따로 두는 느낌이야.',
  ],
  '007': [
    '시작 메뉴는 Windows 기능으로 들어가는 첫 문이야.',
    '자주 쓰는 앱은 시작 메뉴에 붙여 두면 빨리 열 수 있어.',
  ],
  '008': [
    '폴더 옵션은 파일 내용이 아니라 보이는 방식을 바꿔.',
    '확장자와 숨김 파일은 시험에서 자주 묻는 보기 설정이야.',
  ],
  '009': [
    '파일은 실제 자료, 폴더는 그 자료를 담는 상자야.',
    '이름 바꾸기와 이동, 복사는 파일 관리의 기본 동작이야.',
  ],
  '010': [
    '검색 상자는 잃어버린 파일을 이름이나 단서로 찾아 줘.',
    '앱, 설정, 문서까지 한곳에서 찾아갈 수 있어.',
  ],
  '011': [
    '휴지통은 삭제한 파일을 잠깐 맡아 두는 임시 상자야.',
    '비우기를 누르면 다시 꺼내기 어려워진다고 보면 돼.',
  ],
  '012': [
    '보조프로그램은 Windows가 기본으로 넣어 둔 작은 도구들이야.',
    '메모장, 그림판처럼 따로 설치하지 않아도 바로 쓸 수 있어.',
  ],
  '013': [
    '유니버설 앱은 여러 Windows 기기에서 비슷하게 쓰는 앱이야.',
    '스토어 앱처럼 설치와 업데이트 흐름을 함께 떠올리면 쉬워.',
  ],
  '014': [
    '시스템 설정은 화면, 소리, 저장 공간 같은 몸 상태를 보는 곳이야.',
    '전원과 절전은 컴퓨터가 쉬는 방식을 정하는 메뉴야.',
  ],
  '015': [
    '개인 설정은 배경, 색, 잠금 화면처럼 겉모습을 꾸미는 곳이야.',
    '테마와 작업 표시줄 색은 컴퓨터 성능보다 화면 취향에 가까워.',
  ],
  '016': [
    '앱 설정은 설치된 프로그램을 살펴보고 정리하는 곳이야.',
    '기본 앱은 파일을 눌렀을 때 어떤 앱으로 열지 정해 줘.',
  ],
  '017': [
    '장치 설정은 마우스, 키보드, 프린터 같은 주변기기 집합소야.',
    '블루투스처럼 새 기기를 연결하는 흐름이 자주 나와.',
  ],
  '018': [
    '업데이트는 Windows를 고치고 보안 구멍을 막아 주는 작업이야.',
    '백업과 복구는 문제가 생겼을 때 되돌아갈 길을 준비해.',
  ],
  '019': [
    '장치 관리자는 컴퓨터 부품 명단을 보여 주는 점검표야.',
    '드라이버 문제는 장치 관리자와 같이 떠올리면 좋아.',
  ],
  '020': [
    '프린터는 종이로 결과를 내보내는 출력 장치야.',
    '기본 프린터는 인쇄할 때 먼저 선택되는 대표 프린터야.',
  ],
  '021': [
    '인쇄 명령을 보내면 문서는 바로 종이로만 가는 게 아니야.',
    '대기열은 인쇄할 문서가 줄 서 있는 공간이라고 보면 쉬워.',
  ],
  '022': [
    '관리 도구는 Windows를 깊게 점검하는 관리자용 도구 모음이야.',
    '이벤트 뷰어와 서비스는 문제 원인과 실행 상태를 볼 때 나와.',
  ],
  '023': [
    '네트워크 연결은 컴퓨터가 다른 컴퓨터와 대화하는 길이야.',
    'IP 주소는 네트워크 안에서 컴퓨터를 찾는 집 주소 느낌이야.',
  ],
  '024': [
    '문제 해결은 Windows가 고장 단서를 찾아보는 검사 도구야.',
    '소리, 네트워크, 프린터처럼 분야별로 점검할 수 있어.',
  ],
  '025': [
    '컴퓨터 분류는 크기와 쓰임에 따라 컴퓨터를 나누는 거야.',
    '슈퍼컴퓨터는 아주 큰 계산, 개인용 컴퓨터는 개인 작업에 가까워.',
  ],
  '026': [
    '자료 단위는 작은 알갱이부터 큰 묶음까지 순서가 있어.',
    '비트는 가장 작은 스위치, 바이트는 문자 한 글자와 자주 묶여.',
  ],
  '027': [
    '보수는 뺄셈을 덧셈처럼 처리하게 도와주는 숫자 장치야.',
    '1의 보수와 2의 보수는 음수를 표현할 때 자주 나와.',
  ],
  '028': [
    '자료 표현은 컴퓨터가 숫자와 문자를 안쪽에서 적는 방식이야.',
    'ASCII, 유니코드, BCD처럼 이름과 쓰임을 구분하면 쉬워.',
  ],
  '029': [
    'CPU는 컴퓨터의 머리 역할을 하는 처리 장치야.',
    '제어장치, 연산장치, 레지스터를 함께 묶어 기억하면 좋아.',
  ],
  '030': [
    '주기억장치는 CPU가 바로 꺼내 쓰는 가까운 작업 책상이야.',
    'RAM은 전원이 꺼지면 사라지고, ROM은 기본 내용을 보관해.',
  ],
  '031': [
    '보조기억장치는 전원이 꺼져도 자료를 오래 보관하는 창고야.',
    'SSD와 HDD는 저장 방식과 속도 차이로 자주 비교돼.',
  ],
  '032': [
    '출력장치는 컴퓨터 안 결과를 사람이 볼 수 있게 밖으로 보여 줘.',
    '모니터와 프린터는 대표 출력 장치로 자주 나와.',
  ],
  '033': [
    '인터럽트는 급한 일이 생겼다고 CPU에게 알리는 신호야.',
    '채널과 마이크로프로세서는 CPU 부담과 처리 흐름에서 나와.',
  ],
  '034': [
    '메인보드는 부품들이 꽂혀 서로 만나는 큰 판이야.',
    'CPU, 메모리, 슬롯이 어디에 연결되는지 묻는 문제가 나와.',
  ],
  '035': [
    'BIOS는 컴퓨터가 켜질 때 처음 점검을 돕는 기본 프로그램이야.',
    '펌웨어는 하드웨어 안에 들어 있는 작은 프로그램이라고 보면 돼.',
  ],
  '036': [
    'RAID는 여러 저장 장치를 묶어 속도나 안전성을 높이는 방식이야.',
    '스트라이핑과 미러링은 속도와 복구 관점으로 나눠 봐.',
  ],
  '037': [
    '시스템 관리는 컴퓨터 상태를 살피고 오래 쓰게 돌보는 일이야.',
    '디스크 정리와 조각 모음은 저장 공간 관리로 자주 나와.',
  ],
  '038': [
    '업그레이드는 부족한 부품을 바꿔 컴퓨터 능력을 올리는 일이야.',
    '메모리와 저장 장치는 호환성을 먼저 확인해야 해.',
  ],
  '039': [
    '소프트웨어는 컴퓨터에게 일을 시키는 프로그램 묶음이야.',
    '시스템 소프트웨어와 응용 소프트웨어를 나눠 보면 쉬워.',
  ],
  '040': [
    '운영체제는 사람과 하드웨어 사이에서 일을 정리해 주는 관리자야.',
    '프로세스, 파일, 장치 관리를 운영체제 역할로 묶어 기억해.',
  ],
  '041': [
    '운영 방식은 여러 사용자가 일을 나누는 방법을 말해.',
    '일괄, 시분할, 실시간은 처리 흐름과 속도 요구로 구분해.',
  ],
  '042': [
    '프로그래밍 언어는 사람이 컴퓨터에게 일을 설명하는 말이야.',
    '컴파일과 인터프리터는 번역 방식 차이로 자주 물어봐.',
  ],
  '043': [
    '웹 프로그래밍 언어는 웹 화면과 동작을 만드는 도구들이야.',
    'HTML은 구조, CSS는 꾸밈, JavaScript는 동작으로 잡으면 쉬워.',
  ],
  '044': [
    '네트워크 운영 방식은 컴퓨터들이 일을 나눠 처리하는 모양이야.',
    'LAN, MAN, WAN은 범위가 가까운지 넓은지로 구분해.',
  ],
  '045': [
    '망 구성은 컴퓨터들이 어떤 모양으로 연결됐는지 보는 거야.',
    '허브, 스위치, 라우터는 데이터를 보내는 역할이 서로 달라.',
  ],
  '046': [
    '인터넷은 전 세계 네트워크들이 서로 이어진 거대한 길이야.',
    '웹은 인터넷 위에서 문서와 서비스를 보는 한 가지 방법이야.',
  ],
  '047': [
    'IP 주소는 인터넷에서 컴퓨터를 찾는 숫자 주소야.',
    '도메인은 숫자 주소를 사람이 읽기 쉬운 이름으로 바꾼 거야.',
  ],
  '048': [
    '프로토콜은 컴퓨터끼리 대화할 때 지키는 약속이야.',
    'HTTP, FTP, SMTP는 어떤 서비스를 위한 약속인지 구분해.',
  ],
  '049': [
    '인터넷 서비스는 웹, 이메일, 파일 전송처럼 쓰임이 달라.',
    '전자우편과 FTP, Telnet은 목적을 섞어 내는 문제가 많아.',
  ],
  '050': [
    '정보통신기술은 인터넷과 기기를 활용해 일을 더 빠르게 해 줘.',
    '클라우드와 IoT는 연결과 원격 사용의 느낌으로 잡으면 쉬워.',
  ],
  '051': [
    '멀티미디어는 글자뿐 아니라 그림, 소리, 영상을 함께 쓰는 거야.',
    '상호작용성과 통합성이 핵심 특징으로 자주 나와.',
  ],
  '052': [
    '멀티미디어 소프트웨어는 그림, 소리, 영상을 만들고 편집해.',
    '재생 도구와 저작 도구를 역할로 나눠 보면 쉬워.',
  ],
  '053': [
    '그래픽 데이터는 그림을 컴퓨터가 저장하는 방식이야.',
    '비트맵은 점을 저장하고, 벡터는 선과 도형 정보를 저장해.',
  ],
  '054': [
    '오디오와 비디오는 소리와 영상을 디지털 자료로 바꾼 거야.',
    '샘플링, 압축, 코덱은 소리와 영상 문제에서 자주 나와.',
  ],
  '055': [
    '멀티미디어 활용은 교육, 회의, 게임처럼 여러 분야에 쓰여.',
    '가상현실과 증강현실은 실제 화면과 가상 정보의 섞임으로 봐.',
  ],
  '056': [
    '저작권은 만든 사람의 창작물을 함부로 쓰지 못하게 지켜 줘.',
    '프로그램도 저작권 보호 대상이라는 점이 자주 나와.',
  ],
  '057': [
    '바이러스는 컴퓨터에 몰래 들어와 문제를 일으키는 악성 코드야.',
    '웜, 트로이목마, 랜섬웨어는 퍼지는 방식과 피해가 달라.',
  ],
  '058': [
    '정보 보안은 소중한 정보를 훔치거나 바꾸지 못하게 지켜 줘.',
    '기밀성, 무결성, 가용성은 보안의 3대 목표로 자주 나와.',
  ],
  '059': [
    '암호화는 내용을 다른 사람이 못 알아보게 바꾸는 방법이야.',
    '인증은 사람 확인, 방화벽은 통신 길 감시로 구분해.',
  ],
};

function getReinforcedTopicCards(topic: TopicSpec): MicroCardSpec[] {
  if (topic.id === '001') {
    return topic.cards;
  }

  const bubbles = TOPIC_REINFORCEMENT_BUBBLES[topic.id] ?? [];

  return topic.cards.flatMap((card, cardIndex) => {
    const simpleBubble: MicroCardSpec = {
      ...card,
      title: '쉽게 먼저 보자',
      body:
        card.setupBody ??
        bubbles[cardIndex % Math.max(bubbles.length, 1)] ??
        `${topic.title}은 시험에서 쓰임을 구분하면 쉬워.`,
      questionCheckpoint: false,
    };

    return [
      simpleBubble,
      {
        ...card,
        questionCheckpoint: true,
      },
    ];
  });
}

const ALL_COMHWAL_TOPICS: TopicSpec[] = [
  ...COMPUTER_GENERAL_TOPICS,
  ...SPREADSHEET_GENERAL_TOPICS,
  ...DATABASE_GENERAL_TOPICS,
];

const questionChoicePool = ALL_COMHWAL_TOPICS.flatMap((topic) =>
  topic.cards.map((card) => card.correct),
);

function pickQuestionChoices(
  correct: string,
  seed: number,
  preferredWrongs: string[] = [],
): { choices: string[]; answerIndex: number } {
  const wrongs: string[] = [];

  for (const candidate of preferredWrongs) {
    if (candidate !== correct && !wrongs.includes(candidate)) {
      wrongs.push(candidate);
    }
    if (wrongs.length >= 3) break;
  }

  let cursor = (seed * 7 + 3) % questionChoicePool.length;

  while (wrongs.length < 3) {
    const candidate = questionChoicePool[cursor % questionChoicePool.length];
    if (candidate !== correct && !wrongs.includes(candidate)) {
      wrongs.push(candidate);
    }
    cursor += 5;
  }

  const answerIndex = seed % 4;
  const choices = [...wrongs];
  choices.splice(answerIndex, 0, correct);
  return { choices, answerIndex };
}

function buildQuestion(
  cardIdPrefix: string,
  topic: TopicSpec,
  card: MicroCardSpec,
  topicIndex: number,
  cardIndex: number,
): ComhwalConceptQuestion {
  const { choices, answerIndex } = pickQuestionChoices(
    card.correct,
    topicIndex + cardIndex,
    card.wrongChoices,
  );

  return {
    id: `${cardIdPrefix}-${topic.id}-q${String(cardIndex + 1).padStart(2, '0')}`,
    prompt:
      card.questionPrompt ??
      `방금 본 "${card.title}" 설명과 가장 가까운 것은?`,
    choices,
    answerIndex,
    explanation: card.explanation,
  };
}

function shouldAttachQuestion(cards: MicroCardSpec[], cardIndex: number): boolean {
  const hasExplicitCheckpoints = cards.some(
    (card) => card.questionCheckpoint !== undefined,
  );

  if (hasExplicitCheckpoints) {
    return cards[cardIndex]?.questionCheckpoint === true;
  }

  return cardIndex === cards.length - 1;
}

function buildTopicSections(
  planetKey: string,
  cardIdPrefix: string,
  topics: TopicSpec[],
): ComhwalSection[] {
  return topics.flatMap((topic, topicIndex) => {
    const topicCards = getReinforcedTopicCards(topic);
    const cards: ComhwalConceptCard[] = topicCards.map((card, cardIndex) => ({
      id: `${cardIdPrefix}-${topic.id}-c${String(cardIndex + 1).padStart(2, '0')}`,
      topicId: topic.id,
      title: card.title,
      body: card.body,
      keyPoints: card.keyPoints,
      examTip: card.examTip,
      visualHint: card.visualHint,
      question: shouldAttachQuestion(topicCards, cardIndex)
        ? buildQuestion(cardIdPrefix, topic, card, topicIndex, cardIndex)
        : undefined,
    }));

    const sections: ComhwalSection[] = [];
    for (let start = 0; start < cards.length; start += 5) {
      const slice = cards.slice(start, start + 5);
      const sectionIndex = Math.floor(start / 5) + 1;
      sections.push({
        id:
          cards.length <= 5
            ? `${planetKey}-${topic.id}`
            : `${planetKey}-${topic.id}-${sectionIndex}`,
        title: cards.length <= 5 ? topic.title : `${topic.title} ${sectionIndex}`,
        topicRange: topic.id,
        cards: slice,
      });
    }
    return sections;
  });
}

const computerGeneralSections: ComhwalSection[] = buildTopicSections(
  'computer-general',
  'comhwal-1',
  COMPUTER_GENERAL_TOPICS,
);

const spreadsheetGeneralSections: ComhwalSection[] = buildTopicSections(
  'spreadsheet-general',
  'comhwal-2',
  SPREADSHEET_GENERAL_TOPICS,
);

const databaseGeneralSections: ComhwalSection[] = buildTopicSections(
  'database-general',
  'comhwal-3',
  DATABASE_GENERAL_TOPICS,
);

export const COMHWAL_CONCEPT_CHAPTERS: ComhwalChapter[] = [
  {
    planetKey: 'computer-general',
    title: '컴퓨터 일반',
    sections: computerGeneralSections,
  },
  {
    planetKey: 'spreadsheet-general',
    title: '스프레드시트 일반',
    sections: spreadsheetGeneralSections,
  },
  {
    planetKey: 'database-general',
    title: '데이터베이스 일반',
    sections: databaseGeneralSections,
  },
];

const cardsByTopic = new Map<string, ComhwalConceptCard[]>();
const sectionByTopic = new Map<
  string,
  { chapter: ComhwalChapter; section: ComhwalSection }
>();

for (const chapter of COMHWAL_CONCEPT_CHAPTERS) {
  for (const section of chapter.sections) {
    for (const card of section.cards) {
      const key = `${chapter.planetKey}:${card.topicId}`;
      const existing = cardsByTopic.get(key) ?? [];
      existing.push(card);
      cardsByTopic.set(key, existing);
      sectionByTopic.set(key, { chapter, section });
    }
  }
}

export function getComhwalTopicCards(
  planetKey: string,
  topicId: string,
): ComhwalConceptCard[] {
  return cardsByTopic.get(`${planetKey}:${topicId}`) ?? [];
}

export function getComhwalTopicMeta(
  planetKey: string,
  topicId: string,
): { chapter: ComhwalChapter; section: ComhwalSection } | null {
  return sectionByTopic.get(`${planetKey}:${topicId}`) ?? null;
}

export function hasComhwalTopicCards(
  planetKey: string,
  topicId: string,
): boolean {
  return getComhwalTopicCards(planetKey, topicId).length > 0;
}

export function listComhwalCards(): ComhwalConceptCard[] {
  return COMHWAL_CONCEPT_CHAPTERS.flatMap((chapter) =>
    chapter.sections.flatMap((section) => section.cards),
  );
}
