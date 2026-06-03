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
  body: string;
  keyPoints: string[];
  examTip: string;
  visualHint?: string;
  correct: string;
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
        title: 'Windows 10은 운영체제야',
        body: 'Windows 10은 사람과 컴퓨터 사이를 이어 주는 운영체제야.',
        keyPoints: ['사용자와 컴퓨터 사이를 이어줘', '앱 실행을 도와줘', '파일과 장치를 관리해'],
        examTip: 'Windows 문제는 “사용자가 컴퓨터를 쉽게 쓰게 돕나?”부터 보면 쉬워.',
        visualHint: 'windows-os-map',
        correct: '사용자와 컴퓨터 사이에서 앱, 파일, 장치 사용을 도와줘',
        explanation: '운영체제는 사용자가 복잡한 명령을 몰라도 컴퓨터를 쓰게 도와줘.',
      },
      {
        title: 'Windows는 파일과 앱을 이어 줘',
        body: '문서 파일을 누르면 알맞은 앱을 열어 주는 식이야.',
        keyPoints: ['파일을 열 앱을 연결해', '앱 실행을 도와줘', '사용자 조작을 쉽게 해'],
        examTip: '파일을 열고 앱을 실행하는 장면은 운영체제 역할로 연결해.',
        visualHint: 'windows-app-file',
        correct: '문서 파일을 더블클릭하자 알맞은 앱이 열리는 상황이야',
        explanation: '파일과 앱을 연결해서 실행 흐름을 만들어 주는 건 Windows의 역할이야.',
      },
      {
        title: '장치도 Windows가 정리해 줘',
        body: '프린터나 USB를 쓰게 해 주는 것도 Windows가 정리해.',
        keyPoints: ['장치 사용을 도와줘', '컴퓨터 자원을 관리해', '사용자 편의를 높여줘'],
        examTip: '장치 연결, 자원 관리, 사용자 편의가 보이면 Windows 특징으로 보면 돼.',
        visualHint: 'windows-os-role',
        correct: '프린터나 USB 같은 장치를 사용할 수 있게 도와줘',
        explanation: 'Windows는 앱뿐 아니라 장치와 자원도 사용자가 쓰기 쉽게 관리해.',
      },
      {
        title: 'GUI는 화면으로 조작해',
        body: 'GUI는 아이콘과 창을 보며 마우스나 터치로 조작하는 방식이야.',
        keyPoints: ['그래픽 화면으로 조작해', '아이콘과 창을 사용해', '마우스와 터치가 중심이야'],
        examTip: '아이콘, 창, 메뉴, 마우스 조작이 나오면 GUI를 떠올려.',
        visualHint: 'gui-window-icons',
        correct: '아이콘과 창을 보며 마우스나 터치로 조작할 수 있어',
        explanation: 'GUI는 글자 명령만 치는 방식보다 화면을 보며 조작하는 쪽이야.',
      },
      {
        title: '멀티태스킹은 여러 일을 함께 해',
        body: '문서 작성과 음악 재생을 같이 하는 게 멀티태스킹이야.',
        keyPoints: ['여러 앱을 동시에 실행해', '창 전환을 도와줘', 'CPU 시간을 나눠 써'],
        examTip: '선점형은 운영체제가 CPU 사용 순서를 주도하는 쪽이야.',
        visualHint: 'multitasking-switch',
        correct: '문서 작성 중 음악 재생과 브라우저 실행을 함께 하는 기능이야',
        explanation: '여러 작업을 동시에 다루는 특징은 멀티태스킹이야.',
      },
      {
        title: 'Plug & Play는 꽂으면 알아봐',
        body: 'USB를 꽂았을 때 자동으로 알아보려는 기능이 Plug & Play야.',
        keyPoints: ['장치를 자동 인식해', '드라이버 설정을 도와줘', 'USB와 프린터 예시로 나와'],
        examTip: '새 장치 연결 뒤 자동 인식 흐름이면 Plug & Play를 떠올려.',
        visualHint: 'plug-and-play-device',
        correct: '새 장치를 연결했을 때 Windows가 자동 인식을 시도해',
        explanation: 'Plug & Play는 장치를 연결하면 사용할 준비를 돕는 기능이야.',
      },
      {
        title: 'OLE는 다른 앱 자료를 넣어',
        body: '워드 문서 안에 엑셀 차트를 넣는 장면을 떠올리면 쉬워.',
        keyPoints: ['개체 연결과 포함이야', '다른 앱 자료를 문서에 넣어', '원본 연결 여부가 중요해'],
        examTip: '서로 다른 프로그램 자료를 한 문서에서 쓰면 OLE 쪽으로 보면 돼.',
        visualHint: 'ole-document-link',
        correct: '워드 문서 안에 엑셀 차트를 연결하거나 포함하는 기능이야',
        explanation: 'OLE는 다른 앱에서 만든 자료를 문서 안에 연결하거나 포함해.',
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
        title: '바로 가기 키는 손 빠른 조작이야',
        body: '바로 가기 키는 마우스 여러 번 클릭을 키 조합 하나로 줄여줘.',
        keyPoints: ['키 조합으로 빠르게 실행해', '복사와 붙여넣기에 자주 써', '창 전환에도 쓰여'],
        examTip: '문제는 키 이름보다 어떤 동작인지 묻는 경우가 많아.',
        visualHint: 'keyboard-shortcut',
        correct: '키 조합 하나로 자주 쓰는 작업을 빠르게 실행해',
        explanation: '바로 가기 키는 작업 시간을 줄여 주는 조작 방법이야.',
      },
      {
        title: '자주 나오는 키부터 잡아',
        body: 'Ctrl+C는 복사, Ctrl+V는 붙여넣기, Alt+Tab은 창 전환이야.',
        keyPoints: ['Ctrl+C는 복사야', 'Ctrl+V는 붙여넣기야', 'Ctrl+Z는 실행 취소야', 'Alt+Tab은 창 전환이야'],
        examTip: 'Ctrl 계열과 Alt+Tab은 기본 문제로 자주 확인해.',
        correct: 'Alt+Tab은 열려 있는 창을 전환할 때 써',
        explanation: 'Alt+Tab은 여러 창 사이를 빠르게 이동할 때 쓰는 대표 키야.',
      },
    ],
  },
  {
    id: '004',
    section: '한글 Windows 10의 기본',
    title: '바로 가기 아이콘',
    cards: [
      {
        title: '바로 가기 아이콘은 입구야',
        body: '바로 가기 아이콘은 원본 파일로 가는 연결 통로야.',
        keyPoints: ['원본을 가리켜', '작은 화살표가 붙을 수 있어', '빠른 실행에 쓰여'],
        examTip: '바로 가기와 원본 파일을 같은 것으로 보면 틀리기 쉬워.',
        visualHint: 'shortcut-arrow',
        correct: '원본 파일이나 프로그램으로 가는 연결 통로야',
        explanation: '바로 가기는 원본 자체가 아니라 원본을 가리키는 아이콘이야.',
      },
      {
        title: '삭제해도 원본은 보통 남아',
        body: '바로 가기만 지우면 원본 파일은 보통 그대로 남아 있어.',
        keyPoints: ['바로 가기 삭제는 연결 삭제야', '원본 삭제와 달라', '대상 경로가 중요해'],
        examTip: '“바로 가기를 삭제하면 원본도 삭제된다”는 식의 함정에 조심해.',
        correct: '바로 가기만 삭제해도 원본 파일은 보통 그대로 남아 있어',
        explanation: '바로 가기는 연결 정보라서 삭제해도 원본 삭제와는 달라.',
      },
    ],
  },
  {
    id: '005',
    section: '한글 Windows 10의 기본',
    title: '작업 표시줄의 개요',
    cards: [
      {
        title: '작업 표시줄은 현재 작업 지도야',
        body: '작업 표시줄은 실행 중인 앱과 자주 쓰는 앱을 보여줘.',
        keyPoints: ['실행 앱을 보여줘', '앱을 고정할 수 있어', '창 전환에 도움을 줘'],
        examTip: '작업 표시줄은 앱 전환과 고정 기능을 함께 묶어 기억해.',
        visualHint: 'taskbar-map',
        correct: '실행 중인 앱과 고정된 앱을 한눈에 보여줘',
        explanation: '작업 표시줄은 지금 어떤 앱을 쓰는지 보고 전환하는 공간이야.',
      },
      {
        title: '알림 영역도 작업 표시줄에 있어',
        body: '시계, 네트워크, 소리 같은 상태 아이콘은 알림 영역에서 봐.',
        keyPoints: ['시계가 보여', '네트워크 상태를 볼 수 있어', '소리와 배터리도 확인해'],
        examTip: '시계와 상태 아이콘이 나오면 알림 영역을 떠올리면 돼.',
        correct: '시계와 네트워크 상태 아이콘을 확인할 수 있어',
        explanation: '알림 영역은 작업 표시줄 오른쪽에 있는 상태 확인 공간이야.',
      },
    ],
  },
  {
    id: '006',
    section: '한글 Windows 10의 기본',
    title: '작업 보기 / 가상 데스크톱',
    cards: [
      {
        title: '작업 보기는 열린 창 보기야',
        body: '작업 보기는 열려 있는 창을 한눈에 펼쳐 보는 기능이야.',
        keyPoints: ['열린 창을 보여줘', '작업 전환에 좋아', '현재 작업 흐름을 확인해'],
        examTip: '열려 있는 창 전체를 한눈에 보는 기능이면 작업 보기를 떠올려.',
        visualHint: 'task-view-windows',
        correct: '열려 있는 창을 한 화면에서 확인하고 전환해',
        explanation: '작업 보기는 지금 열린 창들을 펼쳐 보여 주는 기능이야.',
      },
      {
        title: '가상 데스크톱은 작업 공간 나누기야',
        body: '공부용 화면과 문서용 화면을 따로 두는 식으로 쓸 수 있어.',
        keyPoints: ['여러 작업 공간을 만들어', '작업을 분리해 정리해', '창을 공간별로 나눠'],
        examTip: '“공간을 새로 나눈다”는 표현이면 가상 데스크톱이야.',
        visualHint: 'virtual-desktops',
        correct: '여러 작업 공간을 만들어 창을 나눠 관리해',
        explanation: '가상 데스크톱은 하나의 화면 안에서 여러 작업 공간을 쓰는 느낌이야.',
      },
    ],
  },
  {
    id: '007',
    section: '한글 Windows 10의 기본',
    title: '시작 메뉴',
    cards: [
      {
        title: '시작 메뉴는 출발점이야',
        body: '시작 메뉴는 앱 실행, 설정 이동, 전원 종료의 출발점이야.',
        keyPoints: ['앱을 실행해', '설정으로 이동해', '전원 메뉴를 열어'],
        examTip: '앱, 설정, 전원 옵션이 한꺼번에 나오면 시작 메뉴를 봐.',
        visualHint: 'start-menu-map',
        correct: '앱 실행과 설정 이동, 전원 종료를 시작할 수 있어',
        explanation: '시작 메뉴는 Windows 기능으로 들어가는 대표 입구야.',
      },
      {
        title: '고정 앱은 빠른 입구야',
        body: '자주 쓰는 앱은 시작 메뉴에 고정해 빠르게 열 수 있어.',
        keyPoints: ['앱 고정이 가능해', '자주 쓰는 앱을 빠르게 열어', '앱 목록과 함께 나와'],
        examTip: '시작 메뉴는 앱 목록과 고정 앱 영역을 구분해서 보면 좋아.',
        correct: '자주 쓰는 앱을 시작 메뉴에 고정해 빠르게 열 수 있어',
        explanation: '고정은 자주 쓰는 앱을 찾기 쉽게 만드는 기능이야.',
      },
    ],
  },
  {
    id: '008',
    section: '한글 Windows 10의 기본',
    title: '폴더 옵션',
    cards: [
      {
        title: '폴더 옵션은 보는 방식이야',
        body: '폴더 옵션은 파일 탐색기에서 파일을 어떻게 보여줄지 정해.',
        keyPoints: ['표시 방식을 바꿔', '파일 탐색기와 연결돼', '파일 내용은 그대로야'],
        examTip: '폴더 옵션은 파일 내용 변경이 아니라 표시 설정이야.',
        visualHint: 'folder-options-view',
        correct: '파일 탐색기에서 파일을 보여주는 방식을 바꿔',
        explanation: '폴더 옵션은 사용자가 파일을 보는 방법을 조정하는 메뉴야.',
      },
      {
        title: '확장자와 숨김 파일이 자주 나와',
        body: '확장자 표시와 숨김 파일 표시는 폴더 옵션 단골 포인트야.',
        keyPoints: ['확장자 표시를 바꿔', '숨김 파일 표시를 바꿔', '보기 탭과 연결돼'],
        examTip: '확장자 숨김 여부를 묻는 문제는 폴더 옵션으로 연결해.',
        correct: '확장자 표시 여부와 숨김 파일 표시 여부를 설정해',
        explanation: '폴더 옵션에서는 파일 이름 뒤 확장자를 보이게 하거나 숨길 수 있어.',
      },
    ],
  },
  {
    id: '009',
    section: '한글 Windows 10의 기본',
    title: '파일과 폴더',
    cards: [
      {
        title: '파일은 실제 자료야',
        body: '파일은 문서, 사진, 음악처럼 실제 데이터가 담긴 단위야.',
        keyPoints: ['자료가 들어 있어', '이름과 확장자가 있어', '복사와 이동이 가능해'],
        examTip: '파일은 실제 자료, 폴더는 정리 공간으로 구분하면 쉬워.',
        visualHint: 'file-unit',
        correct: '문서나 사진처럼 실제 데이터가 담긴 단위야',
        explanation: '파일은 컴퓨터가 저장하고 여는 실제 자료 단위야.',
      },
      {
        title: '폴더는 파일을 담는 상자야',
        body: '폴더는 여러 파일을 묶어 정리하는 공간이야.',
        keyPoints: ['파일을 묶어 관리해', '하위 폴더를 만들 수 있어', '경로와 연결돼'],
        examTip: '폴더를 삭제하면 안의 파일까지 영향을 받을 수 있어.',
        visualHint: 'file-folder-box',
        correct: '여러 파일과 하위 폴더를 묶어 정리하는 공간이야',
        explanation: '폴더는 파일을 찾기 쉽게 묶어 두는 정리 공간이야.',
      },
    ],
  },
  {
    id: '010',
    section: '한글 Windows 10의 기본',
    title: '검색 상자',
    cards: [
      {
        title: '검색 상자는 길찾기야',
        body: '검색 상자는 파일, 앱, 설정을 빠르게 찾게 해 줘.',
        keyPoints: ['파일을 찾을 수 있어', '앱을 찾을 수 있어', '설정도 검색할 수 있어'],
        examTip: '검색은 “어디 있는지 모를 때 찾는 기능”으로 기억해.',
        visualHint: 'search-box-map',
        correct: '파일, 앱, 설정을 빠르게 찾는 기능이야',
        explanation: '검색 상자는 이름이나 키워드를 이용해 필요한 항목을 찾아 줘.',
      },
      {
        title: '일부 단어로도 찾을 수 있어',
        body: '이름 전체를 몰라도 일부 키워드로 검색할 수 있어.',
        keyPoints: ['키워드 검색이 가능해', '조건으로 결과를 줄여', '시작 메뉴 검색과 연결돼'],
        examTip: '검색 조건과 키워드 활용을 묻는 기본 문제가 나와.',
        correct: '전체 이름을 몰라도 일부 단어로 결과를 찾을 수 있어',
        explanation: '검색은 완전한 파일 이름을 몰라도 단서를 이용해 찾게 해 줘.',
      },
    ],
  },
  {
    id: '011',
    section: '한글 Windows 10의 기본',
    title: '휴지통',
    cards: [
      {
        title: '휴지통은 임시 보관소야',
        body: '휴지통은 삭제한 파일을 잠시 보관하는 공간이야.',
        keyPoints: ['삭제 파일을 보관해', '복원이 가능해', '완전 삭제 전 단계야'],
        examTip: '휴지통은 삭제 파일을 바로 없애는 게 아니라 잠시 보관해.',
        visualHint: 'recycle-bin-flow',
        correct: '삭제한 파일을 잠시 보관해 복원할 수 있게 해',
        explanation: '휴지통은 실수로 지운 파일을 되돌릴 수 있게 도와줘.',
      },
      {
        title: 'Shift+Delete는 조심해야 해',
        body: 'Shift+Delete는 휴지통을 거치지 않고 삭제할 때 쓰여.',
        keyPoints: ['휴지통을 건너뛸 수 있어', '복원이 어려워질 수 있어', '완전 삭제와 가까워'],
        examTip: '휴지통 비우기와 Shift+Delete는 복원 가능성을 낮춰.',
        correct: '휴지통을 거치지 않고 삭제되는 방식이라 조심해야 해',
        explanation: '휴지통을 건너뛰면 일반적인 복원이 어려워질 수 있어.',
      },
    ],
  },
  {
    id: '012',
    section: '한글 Windows 10의 기본',
    title: 'Windows 보조프로그램',
    cards: [
      {
        title: '보조프로그램은 기본 도구야',
        body: '보조프로그램은 계산기, 메모장처럼 기본으로 제공되는 도구야.',
        keyPoints: ['기본 제공 도구야', '간단한 작업에 써', '별도 설치 앱과 구분해'],
        examTip: '보조프로그램은 전문 앱보다 기본 제공 작은 도구로 보면 돼.',
        visualHint: 'windows-accessories',
        correct: '계산기나 메모장처럼 Windows가 기본 제공하는 도구야',
        explanation: '보조프로그램은 설치 없이 간단한 작업을 처리하게 해 줘.',
      },
      {
        title: '도구 이름과 쓰임을 연결해',
        body: '계산기는 계산, 메모장은 간단한 글 입력에 쓰는 식이야.',
        keyPoints: ['계산기는 계산에 써', '메모장은 간단한 글에 써', '그림판은 간단한 그림에 써'],
        examTip: '프로그램 이름보다 어떤 일을 하는 도구인지 먼저 봐.',
        correct: '계산기, 메모장, 그림판의 기본 용도를 구분해',
        explanation: '보조프로그램 문제는 도구 이름과 하는 일을 연결하면 쉬워.',
      },
    ],
  },
  {
    id: '013',
    section: '한글 Windows 10의 기본',
    title: '유니버설 앱',
    cards: [
      {
        title: '유니버설 앱은 여러 기기용 앱이야',
        body: '유니버설 앱은 여러 Windows 기기에서 쓰기 좋게 만든 앱이야.',
        keyPoints: ['여러 기기에서 쓸 수 있어', '화면 크기에 맞게 동작해', '스토어 앱과 연결돼'],
        examTip: 'PC와 태블릿처럼 다른 화면에서도 쓰는 앱 형태로 기억해.',
        visualHint: 'universal-app-devices',
        correct: '여러 Windows 기기와 화면 크기에 맞게 쓸 수 있어',
        explanation: '유니버설 앱은 다양한 Windows 환경에서 비슷한 앱 경험을 목표로 해.',
      },
      {
        title: '일반 데스크톱 앱과 구분해',
        body: '유니버설 앱은 스토어 앱 흐름과 함께 나오는 경우가 많아.',
        keyPoints: ['스토어 앱과 관련돼', '기기 호환성이 중요해', '데스크톱 앱과 구분해'],
        examTip: '유니버설 앱은 “여러 기기에서 같은 앱 경험”이 핵심이야.',
        correct: '스토어 앱 흐름과 여러 기기 호환성을 함께 떠올려',
        explanation: '유니버설 앱은 특정 PC 한 대보다 여러 Windows 기기 사용을 염두에 둬.',
      },
    ],
  },
  {
    id: '014',
    section: '한글 Windows 10의 고급 기능',
    title: '[설정] → [시스템]',
    cards: [
      {
        title: '[시스템]은 컴퓨터 상태판이야',
        body: '[시스템]에서는 화면, 소리, 전원 같은 기본 상태를 조정해.',
        keyPoints: ['디스플레이를 다뤄', '소리 설정이 있어', '전원 설정과 연결돼'],
        examTip: '해상도, 소리, 전원 문제가 나오면 [시스템]을 먼저 떠올려.',
        visualHint: 'settings-system',
        correct: '디스플레이, 소리, 전원 같은 기본 상태를 조정해',
        explanation: '[시스템]은 컴퓨터 사용 상태와 기본 환경을 다루는 설정이야.',
      },
      {
        title: '저장 공간도 시스템에서 봐',
        body: '저장 공간 상태나 절전 흐름도 [시스템] 설정과 자주 연결돼.',
        keyPoints: ['저장 공간을 확인해', '절전 설정을 다뤄', '장치 기본 상태를 봐'],
        examTip: '성능보다 “컴퓨터 상태와 기본 설정”에 가까우면 [시스템]이야.',
        correct: '저장 공간과 절전 같은 기본 상태를 확인할 수 있어',
        explanation: '[시스템]은 컴퓨터 자체의 사용 환경을 넓게 관리해.',
      },
    ],
  },
  {
    id: '015',
    section: '한글 Windows 10의 고급 기능',
    title: '[설정] → [개인 설정]',
    cards: [
      {
        title: '[개인 설정]은 화면 꾸미기야',
        body: '[개인 설정]은 배경, 색, 테마처럼 보이는 모습을 바꿔.',
        keyPoints: ['배경을 바꿔', '색과 테마를 바꿔', '잠금 화면도 다뤄'],
        examTip: '기능 동작보다 겉모습을 바꾸는 메뉴면 [개인 설정]이야.',
        visualHint: 'personalization-theme',
        correct: '배경, 색, 테마처럼 화면의 겉모습을 바꿔',
        explanation: '[개인 설정]은 사용자가 보는 화면 분위기를 조정해.',
      },
      {
        title: '잠금 화면도 여기서 다뤄',
        body: '잠금 화면 이미지나 테마 변경은 개인 설정 쪽으로 보면 돼.',
        keyPoints: ['잠금 화면을 설정해', '테마를 적용해', '사용자 취향을 반영해'],
        examTip: '화면 배경, 테마, 잠금 화면은 한 묶음으로 기억해.',
        correct: '잠금 화면 이미지와 테마를 바꾸는 메뉴야',
        explanation: '잠금 화면은 사용자가 보는 화면 구성이어서 개인 설정과 연결돼.',
      },
    ],
  },
  {
    id: '016',
    section: '한글 Windows 10의 고급 기능',
    title: '[설정] → [앱]',
    cards: [
      {
        title: '[앱]은 프로그램 관리야',
        body: '[앱]에서는 설치된 앱을 확인하고 제거할 수 있어.',
        keyPoints: ['설치 앱을 확인해', '앱 제거를 할 수 있어', '기본 앱과 연결돼'],
        examTip: '설치된 프로그램 목록이나 앱 제거가 나오면 [앱] 설정이야.',
        visualHint: 'settings-apps',
        correct: '설치된 앱을 확인하고 제거하거나 관리해',
        explanation: '[앱] 설정은 컴퓨터에 들어온 프로그램을 관리하는 곳이야.',
      },
      {
        title: '기본 앱도 앱 설정에서 잡아',
        body: 'PDF나 사진을 어떤 앱으로 열지 정하는 것도 여기와 연결돼.',
        keyPoints: ['기본 앱을 지정해', '파일 형식과 연결돼', '열기 동작을 정해'],
        examTip: '“어떤 앱으로 열까?”는 기본 앱 설정으로 보면 쉬워.',
        correct: '파일을 열 때 기본으로 사용할 앱을 정할 수 있어',
        explanation: '기본 앱은 특정 파일 형식을 열 때 먼저 쓰는 앱을 말해.',
      },
    ],
  },
  {
    id: '017',
    section: '한글 Windows 10의 고급 기능',
    title: '[설정] → [장치]',
    cards: [
      {
        title: '[장치]는 연결 기기 관리야',
        body: '[장치]에서는 프린터, 마우스, 키보드 같은 기기를 다뤄.',
        keyPoints: ['프린터를 다뤄', '마우스와 키보드를 설정해', '블루투스와 연결돼'],
        examTip: '외부 장치를 추가하거나 연결하면 [장치] 설정을 봐.',
        visualHint: 'settings-devices',
        correct: '프린터, 마우스, 키보드 같은 연결 기기를 관리해',
        explanation: '[장치] 설정은 컴퓨터에 붙여 쓰는 장비를 다루는 곳이야.',
      },
      {
        title: '블루투스도 장치 흐름이야',
        body: '블루투스 이어폰이나 마우스 연결은 장치 설정과 묶여 나와.',
        keyPoints: ['블루투스 연결을 관리해', '장치 추가를 할 수 있어', '외부 기기와 연결돼'],
        examTip: '장치 추가와 블루투스 연결은 [장치] 메뉴로 연결해.',
        correct: '블루투스 장치를 추가하거나 연결할 수 있어',
        explanation: '블루투스도 컴퓨터와 외부 장치를 연결하는 기능이야.',
      },
    ],
  },
  {
    id: '018',
    section: '한글 Windows 10의 고급 기능',
    title: '[설정] → [업데이트 및 보안]',
    cards: [
      {
        title: '업데이트는 최신 상태 만들기야',
        body: '[업데이트 및 보안]은 Windows를 최신 상태로 유지하게 해.',
        keyPoints: ['Windows 업데이트를 관리해', '보안 패치를 받아', '최신 상태를 유지해'],
        examTip: '업데이트와 보안 패치가 나오면 이 메뉴를 먼저 떠올려.',
        visualHint: 'update-security',
        correct: 'Windows 업데이트와 보안 패치를 관리해',
        explanation: '업데이트는 오류와 보안 문제를 줄이기 위해 최신 상태로 맞추는 일이야.',
      },
      {
        title: '복구와 백업도 같이 봐',
        body: '문제가 생겼을 때 되돌리는 복구 기능도 이 메뉴와 연결돼.',
        keyPoints: ['백업과 복구를 다뤄', '문제 발생 뒤 되돌릴 수 있어', '보호 기능과 연결돼'],
        examTip: '업데이트, 백업, 복구, 보안은 한 묶음으로 기억해.',
        correct: '백업과 복구처럼 문제가 생긴 뒤 대비하는 기능도 있어',
        explanation: '업데이트 및 보안은 최신 상태 유지와 문제 대비를 함께 다뤄.',
      },
    ],
  },
  {
    id: '019',
    section: '한글 Windows 10의 고급 기능',
    title: '장치 관리자',
    cards: [
      {
        title: '장치 관리자는 하드웨어 목록이야',
        body: '장치 관리자는 컴퓨터에 연결된 하드웨어 상태를 보여줘.',
        keyPoints: ['하드웨어 목록을 봐', '장치 상태를 확인해', '드라이버와 연결돼'],
        examTip: '드라이버 상태 확인은 장치 관리자를 떠올리면 돼.',
        visualHint: 'device-manager-tree',
        correct: '연결된 하드웨어와 장치 상태를 확인해',
        explanation: '장치 관리자는 컴퓨터 안팎의 장치 상태를 점검하는 화면이야.',
      },
      {
        title: '드라이버를 점검할 수 있어',
        body: '장치가 이상하면 드라이버 업데이트나 사용 안 함을 확인해.',
        keyPoints: ['드라이버를 확인해', '장치 사용 여부를 바꿔', '오류 표시를 볼 수 있어'],
        examTip: '장치 추가 설정과 장치 관리자 역할을 구분해야 해.',
        correct: '드라이버 상태를 확인하거나 업데이트할 수 있어',
        explanation: '드라이버는 하드웨어가 Windows와 잘 통신하게 돕는 프로그램이야.',
      },
    ],
  },
  {
    id: '020',
    section: '한글 Windows 10의 고급 기능',
    title: '프린터',
    cards: [
      {
        title: '프린터는 출력 장치야',
        body: '프린터는 문서나 그림을 종이로 출력하는 장치야.',
        keyPoints: ['출력 장치야', '문서를 종이로 내보내', '기본 프린터 설정이 있어'],
        examTip: '여러 프린터 중 우선 쓰는 프린터가 기본 프린터야.',
        visualHint: 'printer-device',
        correct: '문서나 그림을 종이로 출력하는 장치야',
        explanation: '프린터는 컴퓨터의 처리 결과를 종이로 보여 주는 출력 장치야.',
      },
      {
        title: '기본 프린터는 먼저 쓰는 프린터야',
        body: '기본 프린터를 정하면 인쇄할 때 먼저 선택되는 프린터가 돼.',
        keyPoints: ['우선 사용할 프린터야', '여러 프린터에서 중요해', '인쇄 설정과 연결돼'],
        examTip: '기본 프린터는 “항상 하나만 쓴다”가 아니라 우선 선택이라는 뜻이야.',
        correct: '여러 프린터 중 인쇄 때 먼저 선택되는 프린터야',
        explanation: '기본 프린터는 사용자가 따로 고르지 않아도 먼저 쓰이는 프린터야.',
      },
    ],
  },
  {
    id: '021',
    section: '한글 Windows 10의 고급 기능',
    title: '문서 인쇄',
    cards: [
      {
        title: '인쇄는 대기열을 거쳐',
        body: '인쇄한 문서는 바로 나가기 전에 인쇄 대기열에 들어가.',
        keyPoints: ['인쇄 작업이 쌓여', '순서대로 처리돼', '상태를 확인할 수 있어'],
        examTip: '인쇄 대기열은 출력 작업의 순서와 상태를 관리해.',
        visualHint: 'print-queue',
        correct: '인쇄 작업이 대기열에 들어가 순서대로 처리돼',
        explanation: '대기열은 여러 인쇄 작업을 줄 세워 관리하는 목록이야.',
      },
      {
        title: '대기열에서 취소할 수 있어',
        body: '잘못 보낸 문서는 대기열에서 일시 중지하거나 취소할 수 있어.',
        keyPoints: ['작업 취소가 가능해', '일시 중지가 가능해', '프린터 상태를 확인해'],
        examTip: '문서 출력이 멈춘 상황이면 대기열과 프린터 상태를 함께 봐.',
        correct: '인쇄 대기열에서 작업을 취소하거나 일시 중지할 수 있어',
        explanation: '대기열은 출력 전 작업을 관리하므로 취소와 일시 중지가 가능해.',
      },
    ],
  },
  {
    id: '022',
    section: '한글 Windows 10의 고급 기능',
    title: 'Windows 관리 도구',
    cards: [
      {
        title: '관리 도구는 고급 관리 메뉴야',
        body: 'Windows 관리 도구는 시스템을 더 깊게 관리하는 도구 모음이야.',
        keyPoints: ['시스템 관리용이야', '서비스와 이벤트를 봐', '관리자용 기능이 많아'],
        examTip: '일반 설정이 아니라 시스템 관리 기능으로 보면 돼.',
        visualHint: 'admin-tools',
        correct: '서비스, 이벤트, 작업 같은 시스템 관리 기능을 모아 둬',
        explanation: '관리 도구는 컴퓨터 상태를 자세히 보고 관리하는 도구 묶음이야.',
      },
      {
        title: '이벤트와 서비스가 자주 나와',
        body: '이벤트 뷰어는 기록 확인, 서비스는 백그라운드 기능 관리에 쓰여.',
        keyPoints: ['이벤트 뷰어는 기록을 봐', '서비스는 백그라운드 기능이야', '작업 스케줄러도 나와'],
        examTip: '도구 이름과 역할을 짝지어 기억하는 문제가 자주 나와.',
        correct: '이벤트 뷰어는 시스템 기록을 확인할 때 써',
        explanation: '관리 도구 문제는 도구 이름보다 하는 일을 연결해야 쉬워.',
      },
    ],
  },
  {
    id: '023',
    section: '한글 Windows 10의 고급 기능',
    title: '기본 네트워크 정보 및 연결 설정',
    cards: [
      {
        title: '네트워크 설정은 연결 확인이야',
        body: '네트워크 설정에서는 인터넷 연결 상태와 어댑터 정보를 확인해.',
        keyPoints: ['연결 상태를 봐', 'Wi-Fi와 유선 LAN을 다뤄', '어댑터 정보를 확인해'],
        examTip: '네트워크 문제는 먼저 연결 상태를 확인하는 흐름으로 접근해.',
        visualHint: 'network-status-card',
        correct: '인터넷 연결 상태와 네트워크 어댑터 정보를 확인해',
        explanation: '네트워크 설정은 컴퓨터가 외부와 연결됐는지 보여 줘.',
      },
      {
        title: 'IP 정보도 함께 봐',
        body: 'IP 주소, 게이트웨이, DNS 같은 값은 연결 정보에서 확인해.',
        keyPoints: ['IP 주소를 확인해', '게이트웨이를 봐', 'DNS 정보와 연결돼'],
        examTip: '네트워크 주소 문제는 IP, 게이트웨이, DNS를 구분해.',
        correct: 'IP 주소와 DNS 같은 연결 정보를 확인할 수 있어',
        explanation: '네트워크 연결은 주소 정보가 맞아야 정상적으로 통신할 수 있어.',
      },
    ],
  },
  {
    id: '024',
    section: '한글 Windows 10의 고급 기능',
    title: '문제 해결',
    cards: [
      {
        title: '문제 해결은 자동 점검이야',
        body: '문제 해결은 Windows가 오류 원인을 자동으로 찾아보는 도구야.',
        keyPoints: ['오류 원인을 점검해', '자동 진단을 도와줘', '해결 방법을 제안해'],
        examTip: '문제 해결은 사용자가 직접 고치기 전 먼저 돌려보는 진단 도구야.',
        visualHint: 'troubleshooter',
        correct: 'Windows가 문제 원인을 자동으로 점검하고 해결을 도와줘',
        explanation: '문제 해결은 네트워크나 프린터 오류를 먼저 진단할 때 유용해.',
      },
      {
        title: '완벽한 수리 도구는 아니야',
        body: '문제 해결은 원인을 찾고 안내하지만 모든 문제를 고치진 못해.',
        keyPoints: ['진단이 중심이야', '일부 문제만 해결해', '사용자 확인이 필요할 수 있어'],
        examTip: '문제 해결을 만능 수리 기능처럼 보면 안 돼.',
        correct: '오류를 진단하고 해결 방향을 안내하지만 만능은 아니야',
        explanation: '자동 점검은 도움을 주지만 사용자가 추가 조치를 해야 할 수 있어.',
      },
    ],
  },
  {
    id: '025',
    section: '컴퓨터 시스템의 개요',
    title: '컴퓨터 분류',
    cards: [
      {
        title: '컴퓨터 분류는 기준부터 봐',
        body: '컴퓨터는 크기, 성능, 사용 목적 같은 기준으로 나눠.',
        keyPoints: ['크기로 나눌 수 있어', '성능으로 나눌 수 있어', '목적으로 나눌 수 있어'],
        examTip: '이름보다 어떤 기준으로 나누는지 먼저 확인해.',
        visualHint: 'computer-classification-scale',
        correct: '크기, 처리 능력, 사용 목적 같은 기준으로 나눠',
        explanation: '컴퓨터 분류 문제는 기준을 먼저 잡으면 헷갈림이 줄어.',
      },
      {
        title: '서버와 PC 역할을 구분해',
        body: '서버는 서비스를 제공하고 PC는 개인 작업에 많이 쓰여.',
        keyPoints: ['서버는 서비스를 제공해', 'PC는 개인용 작업에 써', '슈퍼컴퓨터는 대규모 계산에 써'],
        examTip: '서버를 단순히 큰 PC로만 보면 틀리기 쉬워.',
        correct: '서버는 여러 사용자에게 서비스를 제공하는 컴퓨터야',
        explanation: '서버는 다른 컴퓨터나 사용자에게 필요한 기능을 제공하는 역할이야.',
      },
    ],
  },
  {
    id: '026',
    section: '컴퓨터 시스템의 개요',
    title: '자료 구성 단위',
    cards: [
      {
        title: '가장 작은 단위는 bit야',
        body: 'bit는 0 또는 1 하나를 나타내는 가장 작은 정보 단위야.',
        keyPoints: ['bit가 가장 작아', '0 또는 1을 나타내', '8bit는 1Byte야'],
        examTip: '8bit = 1Byte는 단위 계산의 출발점이야.',
        visualHint: 'data-unit-ladder',
        correct: 'bit는 0 또는 1 하나를 나타내는 가장 작은 단위야',
        explanation: '컴퓨터 자료 단위는 bit에서 시작해서 Byte로 커져.',
      },
      {
        title: 'Byte부터 용량 단위가 커져',
        body: 'Byte가 커지면 KB, MB, GB, TB 순서로 올라가.',
        keyPoints: ['Byte는 8bit야', 'KB보다 MB가 커', 'GB보다 TB가 커'],
        examTip: '용량 단위 순서를 거꾸로 묻는 함정에 조심해.',
        correct: 'Byte 다음으로 KB, MB, GB, TB처럼 커져',
        explanation: '저장 용량 문제는 단위 순서를 정확히 아는 게 핵심이야.',
      },
    ],
  },
  {
    id: '027',
    section: '컴퓨터 시스템의 개요',
    title: '보수',
    cards: [
      {
        title: '보수는 뺄셈을 돕는 방법이야',
        body: '보수는 컴퓨터가 뺄셈과 음수 표현을 쉽게 하려고 써.',
        keyPoints: ['뺄셈 처리에 도움돼', '음수 표현과 연결돼', '2진수에서 자주 나와'],
        examTip: '보수는 “부족한 만큼 채우기” 느낌으로 이해하면 쉬워.',
        visualHint: 'complement-bits',
        correct: '컴퓨터가 뺄셈과 음수 표현을 쉽게 처리하게 해',
        explanation: '보수는 계산 회로가 뺄셈을 덧셈처럼 다룰 수 있게 도와줘.',
      },
      {
        title: '2의 보수는 뒤집고 1 더해',
        body: '2의 보수는 1의 보수를 만든 뒤 1을 더하는 흐름이야.',
        keyPoints: ['1의 보수는 비트 반전이야', '2의 보수는 1을 더해', '음수 표현에 자주 써'],
        examTip: '“뒤집고 1 더하기”는 2의 보수 단골 암기야.',
        correct: '2의 보수는 비트를 뒤집은 뒤 1을 더해서 구해',
        explanation: '1의 보수에 1을 더하면 2의 보수를 만들 수 있어.',
      },
    ],
  },
  {
    id: '028',
    section: '컴퓨터 시스템의 개요',
    title: '자료의 표현 방식',
    cards: [
      {
        title: '컴퓨터는 0과 1로 표현해',
        body: '컴퓨터는 숫자, 문자, 그림을 결국 0과 1의 조합으로 저장해.',
        keyPoints: ['2진수 기반이야', '자료는 비트로 저장돼', '표현 방식이 다를 수 있어'],
        examTip: '사람이 보는 값과 컴퓨터가 저장하는 비트를 구분해.',
        visualHint: 'binary-representation',
        correct: '숫자와 문자도 내부에서는 0과 1의 조합으로 저장돼',
        explanation: '컴퓨터는 전기 신호를 기준으로 자료를 2진 형태로 다뤄.',
      },
      {
        title: '문자는 코드로 바뀌어',
        body: '문자는 ASCII나 유니코드 같은 코드 값으로 바뀌어 저장돼.',
        keyPoints: ['문자는 코드로 표현해', 'ASCII가 자주 나와', '유니코드는 더 넓은 문자 범위야'],
        examTip: '문자 코드 문제는 ASCII와 유니코드를 구분해.',
        correct: '문자는 ASCII나 유니코드 같은 코드로 표현돼',
        explanation: '문자도 컴퓨터 안에서는 정해진 숫자 코드로 바뀌어 저장돼.',
      },
    ],
  },
  {
    id: '029',
    section: '컴퓨터 하드웨어',
    title: '중앙처리장치',
    cards: [
      {
        title: 'CPU는 계산과 지휘 담당이야',
        body: 'CPU는 명령을 해석하고 계산을 처리하는 핵심 장치야.',
        keyPoints: ['명령을 해석해', '계산을 처리해', '컴퓨터의 핵심 처리 장치야'],
        examTip: 'CPU는 저장 장치가 아니라 처리 장치라는 점을 먼저 잡아.',
        visualHint: 'cpu-core',
        correct: '명령을 해석하고 계산을 처리하는 핵심 장치야',
        explanation: 'CPU는 컴퓨터가 무엇을 할지 판단하고 처리하는 중심 장치야.',
      },
      {
        title: '제어장치와 연산장치를 구분해',
        body: '제어장치는 흐름을 지휘하고, 연산장치는 계산을 맡아.',
        keyPoints: ['제어장치는 지휘해', '연산장치는 계산해', '레지스터는 빠른 임시 공간이야'],
        examTip: 'CPU 구성 요소의 역할을 서로 바꿔 내는 문제가 많아.',
        correct: '제어장치는 작업 흐름을 지휘하고 연산장치는 계산해',
        explanation: 'CPU 내부 구성은 이름과 역할을 짝지어 기억해야 해.',
      },
    ],
  },
  {
    id: '030',
    section: '컴퓨터 하드웨어',
    title: '주기억장치',
    cards: [
      {
        title: '주기억장치는 작업 공간이야',
        body: '주기억장치는 CPU가 바로 쓸 데이터를 올려 두는 공간이야.',
        keyPoints: ['CPU가 빠르게 접근해', '작업 중 데이터가 올라와', 'RAM과 ROM이 자주 나와'],
        examTip: '주기억장치는 장기 보관보다 작업 중 사용에 가깝게 봐.',
        visualHint: 'main-memory',
        correct: 'CPU가 바로 사용할 데이터를 올려 두는 작업 공간이야',
        explanation: '주기억장치는 실행 중인 프로그램과 데이터를 빠르게 다루게 해.',
      },
      {
        title: 'RAM과 ROM을 구분해',
        body: 'RAM은 휘발성, ROM은 기본 내용 보관 쪽으로 기억해.',
        keyPoints: ['RAM은 전원 끄면 사라져', 'ROM은 비휘발성 성격이 강해', '둘 다 주기억장치로 나와'],
        examTip: '전원을 껐을 때 남는지로 RAM과 ROM을 구분하면 쉬워.',
        visualHint: 'ram-rom-compare',
        correct: 'RAM은 휘발성이고 ROM은 비휘발성 성격이 강해',
        explanation: 'RAM은 작업 중 임시 공간, ROM은 기본 프로그램 보관 쪽이야.',
      },
    ],
  },
  {
    id: '031',
    section: '컴퓨터 하드웨어',
    title: '보조기억장치',
    cards: [
      {
        title: '보조기억장치는 저장 창고야',
        body: '보조기억장치는 전원이 꺼져도 자료를 오래 보관해.',
        keyPoints: ['장기 보관에 써', '전원을 꺼도 남아', 'SSD와 HDD가 대표적이야'],
        examTip: '주기억장치보다 느릴 수 있지만 보관 목적이 강해.',
        visualHint: 'secondary-storage',
        correct: '전원이 꺼져도 자료를 오래 보관하는 저장 장치야',
        explanation: '보조기억장치는 작업 공간보다 창고 역할에 가까워.',
      },
      {
        title: 'SSD와 HDD가 자주 나와',
        body: 'SSD는 반도체 기반, HDD는 자기 디스크 기반으로 많이 설명해.',
        keyPoints: ['SSD는 빠른 편이야', 'HDD는 디스크 기반이야', 'USB도 보조기억장치로 볼 수 있어'],
        examTip: '저장 방식과 속도 차이를 묻는 문제가 나와.',
        correct: 'SSD는 반도체 기반 저장 장치로 빠른 편이야',
        explanation: 'SSD는 움직이는 디스크 대신 반도체 메모리를 이용하는 저장 장치야.',
      },
    ],
  },
  {
    id: '032',
    section: '컴퓨터 하드웨어',
    title: '출력장치',
    cards: [
      {
        title: '출력장치는 결과를 보여줘',
        body: '출력장치는 컴퓨터가 처리한 결과를 사람에게 전달해.',
        keyPoints: ['결과를 보여줘', '화면이나 종이로 내보내', '입력장치와 반대 방향이야'],
        examTip: '입력장치와 출력장치를 섞어 내는 기본 문제에 조심해.',
        visualHint: 'output-devices',
        correct: '컴퓨터가 처리한 결과를 사람에게 보여주거나 들려줘',
        explanation: '출력장치는 컴퓨터에서 사람 쪽으로 결과를 보내는 장치야.',
      },
      {
        title: '모니터와 프린터가 대표적이야',
        body: '모니터는 화면, 프린터는 종이, 스피커는 소리로 출력해.',
        keyPoints: ['모니터는 화면 출력이야', '프린터는 인쇄 출력이야', '스피커는 소리 출력이야'],
        examTip: '스캐너는 입력, 프린터는 출력처럼 방향을 기준으로 봐.',
        correct: '모니터, 프린터, 스피커는 출력장치로 볼 수 있어',
        explanation: '이 장치들은 컴퓨터 결과를 눈이나 귀로 확인하게 해 줘.',
      },
    ],
  },
  {
    id: '033',
    section: '컴퓨터 하드웨어',
    title: '인터럽트 / 채널 / 마이크로프로세서',
    cards: [
      {
        title: '인터럽트는 급한 호출이야',
        body: '인터럽트는 CPU에게 급히 처리해 달라고 보내는 신호야.',
        keyPoints: ['CPU에게 알림을 보내', '작업 흐름을 잠시 바꿔', '입출력 장치가 발생시킬 수 있어'],
        examTip: '인터럽트는 “잠깐 멈추고 먼저 처리” 흐름으로 이해해.',
        visualHint: 'interrupt-signal',
        correct: 'CPU에게 급히 처리할 일이 생겼다고 알리는 신호야',
        explanation: '인터럽트가 오면 CPU는 현재 작업을 잠시 멈추고 요청을 확인해.',
      },
      {
        title: '채널은 입출력을 도와줘',
        body: '채널은 입출력 작업을 CPU 대신 처리하도록 도와주는 장치야.',
        keyPoints: ['입출력을 도와줘', 'CPU 부담을 줄여', '주변 장치 처리와 연결돼'],
        examTip: '채널은 CPU 자체가 아니라 입출력 처리를 돕는 쪽이야.',
        correct: '입출력 작업을 도와 CPU의 부담을 줄여',
        explanation: '채널은 주변 장치와 데이터가 오갈 때 처리 효율을 높여 줘.',
      },
    ],
  },
  {
    id: '034',
    section: '컴퓨터 하드웨어',
    title: '메인보드',
    cards: [
      {
        title: '메인보드는 연결 중심판이야',
        body: '메인보드는 CPU, 메모리, 저장 장치가 연결되는 회로판이야.',
        keyPoints: ['부품을 연결해', 'CPU와 메모리가 장착돼', '슬롯과 버스가 있어'],
        examTip: '메인보드는 계산 담당이 아니라 부품 연결의 중심이야.',
        visualHint: 'motherboard-map',
        correct: 'CPU, 메모리, 저장 장치가 연결되는 중심 회로판이야',
        explanation: '메인보드는 부품들이 서로 데이터를 주고받게 길을 만들어 줘.',
      },
      {
        title: '버스는 데이터가 다니는 길이야',
        body: '버스는 메인보드 안에서 데이터가 이동하는 통로야.',
        keyPoints: ['데이터 통로야', '주소와 제어 신호도 다뤄', '부품 사이를 연결해'],
        examTip: '버스는 교통수단이 아니라 부품 사이 신호 통로로 봐.',
        correct: '부품 사이에서 데이터와 신호가 이동하는 통로야',
        explanation: '버스가 있어야 CPU와 메모리, 장치가 정보를 주고받을 수 있어.',
      },
    ],
  },
  {
    id: '035',
    section: '컴퓨터 하드웨어',
    title: '바이오스 / 펌웨어',
    cards: [
      {
        title: 'BIOS는 부팅 준비 담당이야',
        body: 'BIOS는 컴퓨터가 켜질 때 하드웨어를 점검하고 부팅을 준비해.',
        keyPoints: ['부팅을 준비해', '하드웨어를 점검해', 'ROM 계열과 연결돼'],
        examTip: '전원을 켠 직후 하드웨어 점검은 BIOS로 연결해.',
        visualHint: 'bios-boot',
        correct: '컴퓨터가 켜질 때 하드웨어를 점검하고 부팅을 준비해',
        explanation: 'BIOS는 운영체제가 올라오기 전 기본 준비를 맡아.',
      },
      {
        title: '펌웨어는 하드웨어 안의 프로그램이야',
        body: '펌웨어는 장치 안에 들어 있어 하드웨어 동작을 제어해.',
        keyPoints: ['하드웨어 안에 있어', '장치 제어에 쓰여', '소프트웨어와 하드웨어 사이 느낌이야'],
        examTip: '펌웨어는 일반 앱보다 장치 제어 프로그램에 가까워.',
        correct: '하드웨어 내부에서 장치 동작을 제어하는 프로그램이야',
        explanation: '펌웨어는 장치가 기본 기능을 수행하도록 안쪽에서 제어해.',
      },
    ],
  },
  {
    id: '036',
    section: '컴퓨터 하드웨어',
    title: 'RAID',
    cards: [
      {
        title: 'RAID는 디스크 여러 개를 묶어',
        body: 'RAID는 여러 저장 장치를 하나처럼 묶어 쓰는 방식이야.',
        keyPoints: ['디스크를 여러 개 묶어', '속도나 안정성을 높여', '서버 저장소에서 자주 나와'],
        examTip: 'RAID는 백업 프로그램이 아니라 저장 장치 구성 방식이야.',
        visualHint: 'raid-disks',
        correct: '여러 디스크를 묶어 속도나 안정성을 높이는 방식이야',
        explanation: 'RAID는 저장 장치를 조합해서 성능이나 장애 대응을 높이는 방법이야.',
      },
      {
        title: '미러링과 스트라이핑을 구분해',
        body: '미러링은 복사 저장, 스트라이핑은 나눠 저장하는 느낌이야.',
        keyPoints: ['미러링은 같은 내용을 복사해', '스트라이핑은 나눠 저장해', '패리티는 복구 정보와 연결돼'],
        examTip: 'RAID 0은 속도, RAID 1은 복제 안정성 쪽으로 먼저 잡아.',
        correct: '미러링은 같은 데이터를 여러 디스크에 복사해',
        explanation: '미러링은 한 디스크가 고장 나도 다른 디스크에 같은 내용이 남게 해.',
      },
    ],
  },
  {
    id: '037',
    section: '컴퓨터 하드웨어',
    title: '시스템 관리',
    cards: [
      {
        title: '시스템 관리는 상태 점검이야',
        body: '시스템 관리는 컴퓨터가 안정적으로 돌아가도록 점검하는 일이야.',
        keyPoints: ['성능을 확인해', '오류를 점검해', '사용 환경을 관리해'],
        examTip: '시스템 관리는 하드웨어와 소프트웨어 상태를 함께 봐.',
        visualHint: 'system-management',
        correct: '컴퓨터가 안정적으로 동작하도록 상태를 점검하고 관리해',
        explanation: '시스템 관리는 문제를 줄이고 성능을 유지하기 위한 관리 흐름이야.',
      },
      {
        title: '성능과 저장 공간을 확인해',
        body: '느려지거나 공간이 부족하면 성능과 저장 상태를 먼저 봐.',
        keyPoints: ['작업 관리자와 연결돼', '디스크 상태를 확인해', '불필요한 파일을 정리해'],
        examTip: '속도 저하 문제는 CPU, 메모리, 저장 공간을 함께 확인해.',
        correct: '느려진 컴퓨터는 CPU, 메모리, 저장 공간 상태를 확인해',
        explanation: '성능 문제는 한 요소만 보는 것보다 전체 상태를 함께 봐야 해.',
      },
    ],
  },
  {
    id: '038',
    section: '컴퓨터 하드웨어',
    title: '하드웨어 업그레이드',
    cards: [
      {
        title: '업그레이드는 부품 성능 높이기야',
        body: '하드웨어 업그레이드는 부품을 바꿔 성능을 높이는 일이야.',
        keyPoints: ['부품을 교체해', '성능 향상이 목적이야', '호환성을 확인해야 해'],
        examTip: '업그레이드는 설치 전 호환성 확인이 매우 중요해.',
        visualHint: 'hardware-upgrade',
        correct: '부품을 교체하거나 추가해 컴퓨터 성능을 높여',
        explanation: '업그레이드는 기존 컴퓨터를 더 빠르고 편하게 쓰기 위한 작업이야.',
      },
      {
        title: '호환성이 먼저야',
        body: 'CPU나 메모리를 바꾸기 전 메인보드와 규격이 맞는지 봐야 해.',
        keyPoints: ['메인보드 규격을 봐', '메모리 규격을 확인해', '전원 용량도 확인해'],
        examTip: '성능 좋은 부품이라도 규격이 안 맞으면 쓸 수 없어.',
        correct: '새 부품이 메인보드와 규격상 맞는지 먼저 확인해',
        explanation: '하드웨어는 물리적 규격과 지원 범위가 맞아야 정상적으로 작동해.',
      },
    ],
  },
  {
    id: '039',
    section: '컴퓨터 소프트웨어',
    title: '소프트웨어의 개요',
    cards: [
      {
        title: '소프트웨어는 실행되는 명령 묶음이야',
        body: '소프트웨어는 컴퓨터가 일을 하도록 만든 프로그램과 데이터야.',
        keyPoints: ['프로그램을 포함해', '데이터와 문서도 연결돼', '하드웨어를 활용하게 해'],
        examTip: '하드웨어는 만질 수 있는 장치, 소프트웨어는 동작 지시 쪽이야.',
        visualHint: 'software-vs-hardware',
        correct: '컴퓨터가 일을 하도록 만든 프로그램과 관련 자료야',
        explanation: '소프트웨어는 하드웨어가 실제 작업을 하도록 지시하는 역할을 해.',
      },
      {
        title: '시스템과 응용을 나눠',
        body: '운영체제는 시스템 소프트웨어, 엑셀은 응용 소프트웨어야.',
        keyPoints: ['시스템 소프트웨어가 있어', '응용 소프트웨어가 있어', '목적에 따라 구분해'],
        examTip: '운영체제와 응용 프로그램을 섞어 내는 문제에 조심해.',
        correct: '운영체제는 시스템 소프트웨어, 엑셀은 응용 소프트웨어야',
        explanation: '시스템 소프트웨어는 컴퓨터 운영을 돕고, 응용 소프트웨어는 사용자의 작업을 돕는 쪽이야.',
      },
    ],
  },
  {
    id: '040',
    section: '컴퓨터 소프트웨어',
    title: '운영체제',
    cards: [
      {
        title: '운영체제는 자원 관리자야',
        body: '운영체제는 CPU, 메모리, 파일, 장치를 관리해.',
        keyPoints: ['CPU를 관리해', '메모리를 관리해', '파일과 장치를 관리해'],
        examTip: '운영체제 역할은 자원 관리와 사용자 편의로 크게 잡아.',
        visualHint: 'os-resource-manager',
        correct: 'CPU, 메모리, 파일, 장치를 관리해',
        explanation: '운영체제는 컴퓨터 자원을 나눠 쓰고 사용자가 다루기 쉽게 만들어.',
      },
      {
        title: '사용자 인터페이스도 제공해',
        body: '사용자가 명령을 내릴 수 있게 화면과 조작 방법을 제공해.',
        keyPoints: ['사용자 인터페이스를 제공해', '앱 실행 환경을 제공해', '보안과 계정도 다뤄'],
        examTip: '운영체제 기능을 단순 화면 꾸미기로만 보면 안 돼.',
        correct: '사용자가 컴퓨터에 명령을 내릴 수 있는 환경을 제공해',
        explanation: '운영체제는 사용자와 컴퓨터가 소통하는 기본 환경을 만들어 줘.',
      },
    ],
  },
  {
    id: '041',
    section: '컴퓨터 소프트웨어',
    title: '운영체제의 운영 방식',
    cards: [
      {
        title: '운영 방식은 처리 방법이야',
        body: '운영체제의 운영 방식은 작업을 어떻게 처리하는지에 대한 구분이야.',
        keyPoints: ['일괄 처리가 있어', '시분할 처리가 있어', '실시간 처리가 있어'],
        examTip: '운영 방식은 “언제, 어떻게 처리하나?”를 기준으로 봐.',
        visualHint: 'os-processing-modes',
        correct: '작업을 언제 어떤 방식으로 처리하는지 나누는 기준이야',
        explanation: '운영 방식은 운영체제가 작업 순서와 처리 시간을 다루는 방법이야.',
      },
      {
        title: '시분할은 시간을 나눠 써',
        body: '시분할은 여러 사용자가 CPU 시간을 조금씩 나눠 쓰는 방식이야.',
        keyPoints: ['CPU 시간을 나눠', '여러 사용자가 함께 써', '대화식 처리와 연결돼'],
        examTip: '실시간은 즉시 반응, 시분할은 시간 조각을 나눠 쓰는 느낌이야.',
        correct: '여러 사용자가 CPU 시간을 나눠 쓰는 방식이야',
        explanation: '시분할은 매우 짧은 시간 단위로 작업을 바꿔 가며 처리해.',
      },
    ],
  },
  {
    id: '042',
    section: '컴퓨터 소프트웨어',
    title: '프로그래밍 언어',
    cards: [
      {
        title: '프로그래밍 언어는 명령을 쓰는 말이야',
        body: '프로그래밍 언어는 컴퓨터에게 할 일을 알려 주는 언어야.',
        keyPoints: ['프로그램을 만들 때 써', '명령과 규칙이 있어', '컴파일과 해석이 나와'],
        examTip: '언어 이름보다 컴파일러와 인터프리터 차이를 함께 봐.',
        visualHint: 'programming-language',
        correct: '컴퓨터에게 처리할 일을 알려 주는 프로그램 작성 언어야',
        explanation: '프로그래밍 언어는 사람이 쓴 명령을 컴퓨터가 처리할 수 있게 해.',
      },
      {
        title: '컴파일러와 인터프리터를 구분해',
        body: '컴파일러는 한 번에 번역하고, 인터프리터는 실행하며 해석해.',
        keyPoints: ['컴파일러는 전체 번역이야', '인터프리터는 순차 해석이야', '실행 방식이 달라'],
        examTip: '전체 번역과 줄 단위 해석 차이는 단골 문제야.',
        correct: '컴파일러는 전체 번역, 인터프리터는 실행 중 해석에 가까워',
        explanation: '둘 다 프로그램을 실행 가능하게 하지만 번역 방식이 달라.',
      },
    ],
  },
  {
    id: '043',
    section: '컴퓨터 소프트웨어',
    title: '웹 프로그래밍 언어',
    cards: [
      {
        title: 'HTML은 웹 문서의 뼈대야',
        body: 'HTML은 웹페이지의 제목, 문단, 링크 같은 구조를 만들어.',
        keyPoints: ['웹 문서 구조를 만들어', '태그를 사용해', 'CSS와 함께 나와'],
        examTip: 'HTML은 동작보다 구조를 만드는 언어로 기억해.',
        visualHint: 'html-css-js',
        correct: '웹페이지의 제목, 문단, 링크 같은 구조를 만들어',
        explanation: 'HTML은 웹 문서에 어떤 요소가 있는지 나타내는 뼈대 역할이야.',
      },
      {
        title: 'CSS와 JavaScript 역할도 나눠',
        body: 'CSS는 꾸미기, JavaScript는 동작을 맡는다고 보면 쉬워.',
        keyPoints: ['CSS는 스타일이야', 'JavaScript는 동작이야', '웹페이지 구성에 함께 쓰여'],
        examTip: 'HTML, CSS, JavaScript의 역할을 서로 바꿔 내는 문제가 나와.',
        correct: 'CSS는 화면 꾸미기, JavaScript는 동작 처리에 가까워',
        explanation: '웹페이지는 구조, 모양, 동작이 나뉘어 함께 만들어져.',
      },
    ],
  },
  {
    id: '044',
    section: '인터넷 활용',
    title: '네트워크 운영 방식과 통신망의 종류',
    cards: [
      {
        title: '네트워크는 컴퓨터 연결망이야',
        body: '네트워크는 여러 컴퓨터가 자료를 주고받게 연결한 구조야.',
        keyPoints: ['컴퓨터를 연결해', '자료를 주고받아', '범위에 따라 나눠'],
        examTip: 'LAN, WAN은 연결 범위 차이로 먼저 구분해.',
        visualHint: 'network-types',
        correct: '여러 컴퓨터가 자료를 주고받도록 연결한 구조야',
        explanation: '네트워크가 있어야 컴퓨터들이 서로 데이터를 교환할 수 있어.',
      },
      {
        title: 'LAN은 가까운 곳, WAN은 넓은 곳이야',
        body: 'LAN은 학교나 회사처럼 가까운 범위, WAN은 더 넓은 범위야.',
        keyPoints: ['LAN은 근거리야', 'WAN은 광역이야', 'MAN도 중간 범위로 나와'],
        examTip: '통신망 종류는 범위가 시험 포인트야.',
        correct: 'LAN은 가까운 범위, WAN은 넓은 범위의 통신망이야',
        explanation: '통신망은 얼마나 넓은 지역을 연결하는지에 따라 나눌 수 있어.',
      },
    ],
  },
  {
    id: '045',
    section: '인터넷 활용',
    title: '망 구성과 네트워크 장비',
    cards: [
      {
        title: '망 구성은 연결 모양이야',
        body: '버스형, 스타형, 링형처럼 장비가 연결된 모양을 말해.',
        keyPoints: ['버스형이 있어', '스타형이 있어', '링형이 있어'],
        examTip: '망 구성은 장비 역할보다 연결 형태를 먼저 봐.',
        visualHint: 'network-topology',
        correct: '장비들이 어떤 모양으로 연결됐는지 나타내는 구조야',
        explanation: '망 구성은 네트워크의 선과 장비가 배치된 모양을 설명해.',
      },
      {
        title: '장비는 역할로 구분해',
        body: '허브, 스위치, 라우터는 데이터를 보내는 역할이 서로 달라.',
        keyPoints: ['허브는 단순 전달에 가까워', '스위치는 목적지별 전달을 도와', '라우터는 다른 네트워크를 연결해'],
        examTip: '라우터는 서로 다른 네트워크를 연결하는 장비로 자주 나와.',
        correct: '라우터는 서로 다른 네트워크 사이의 길을 찾아 연결해',
        explanation: '라우터는 네트워크와 네트워크 사이에서 경로를 선택해.',
      },
    ],
  },
  {
    id: '046',
    section: '인터넷 활용',
    title: '인터넷의 개요',
    cards: [
      {
        title: '인터넷은 전 세계 네트워크야',
        body: '인터넷은 전 세계 컴퓨터 네트워크가 서로 연결된 거대한 망이야.',
        keyPoints: ['전 세계를 연결해', 'TCP/IP 기반이야', '여러 서비스를 제공해'],
        examTip: '인터넷은 특정 웹사이트 하나가 아니라 연결된 네트워크 전체야.',
        visualHint: 'internet-global',
        correct: '전 세계의 여러 네트워크가 서로 연결된 거대한 망이야',
        explanation: '인터넷은 많은 네트워크가 공통 규칙으로 연결된 구조야.',
      },
      {
        title: '웹은 인터넷 서비스 중 하나야',
        body: '웹은 인터넷 위에서 문서와 링크를 보여주는 서비스야.',
        keyPoints: ['웹은 인터넷의 일부야', 'HTTP와 연결돼', '브라우저로 이용해'],
        examTip: '인터넷과 웹을 같은 뜻으로 보면 헷갈릴 수 있어.',
        correct: '웹은 인터넷에서 제공되는 여러 서비스 중 하나야',
        explanation: '인터넷은 기반 망이고, 웹은 그 위에서 쓰는 대표 서비스야.',
      },
    ],
  },
  {
    id: '047',
    section: '인터넷 활용',
    title: '인터넷의 주소 체계',
    cards: [
      {
        title: 'IP 주소는 컴퓨터의 주소야',
        body: 'IP 주소는 네트워크에서 장치를 찾아가기 위한 숫자 주소야.',
        keyPoints: ['장치 위치를 나타내', 'IPv4와 IPv6가 있어', '네트워크 통신에 필요해'],
        examTip: 'IPv4는 점으로 나뉜 10진수 형태가 자주 나와.',
        visualHint: 'ip-address',
        correct: '네트워크에서 장치를 찾기 위한 숫자 주소야',
        explanation: 'IP 주소가 있어야 데이터가 어느 장치로 갈지 알 수 있어.',
      },
      {
        title: '도메인은 사람이 읽기 쉬운 이름이야',
        body: '도메인은 숫자 IP 대신 사람이 기억하기 쉬운 주소 이름이야.',
        keyPoints: ['사람이 읽기 쉬워', 'DNS가 IP로 바꿔 줘', '웹 주소와 연결돼'],
        examTip: '도메인 이름을 IP 주소로 바꿔 주는 건 DNS야.',
        correct: '도메인은 사람이 기억하기 쉬운 주소 이름이야',
        explanation: '도메인은 복잡한 숫자 주소 대신 쓰는 이름표 같은 역할이야.',
      },
    ],
  },
  {
    id: '048',
    section: '인터넷 활용',
    title: '프로토콜(Protocol)',
    cards: [
      {
        title: '프로토콜은 통신 약속이야',
        body: '프로토콜은 컴퓨터끼리 데이터를 주고받기 위한 규칙이야.',
        keyPoints: ['통신 규칙이야', '데이터 교환 방식을 정해', '인터넷 서비스마다 달라'],
        examTip: '프로토콜은 프로그램 이름이 아니라 약속과 규칙이야.',
        visualHint: 'protocol-rules',
        correct: '컴퓨터끼리 데이터를 주고받기 위해 정한 통신 규칙이야',
        explanation: '프로토콜이 같아야 서로 데이터를 이해하고 주고받을 수 있어.',
      },
      {
        title: 'HTTP와 FTP 역할을 구분해',
        body: 'HTTP는 웹 문서, FTP는 파일 전송과 자주 연결돼.',
        keyPoints: ['HTTP는 웹과 연결돼', 'FTP는 파일 전송이야', 'SMTP는 메일 전송이야'],
        examTip: '프로토콜 이름과 대표 서비스를 짝지어 기억해.',
        correct: 'HTTP는 웹 문서 전송, FTP는 파일 전송과 연결돼',
        explanation: '프로토콜은 서비스 종류에 맞는 데이터 전송 규칙을 제공해.',
      },
    ],
  },
  {
    id: '049',
    section: '인터넷 활용',
    title: '인터넷 서비스',
    cards: [
      {
        title: '인터넷 서비스는 여러 종류가 있어',
        body: '웹, 이메일, 파일 전송, 원격 접속이 대표 인터넷 서비스야.',
        keyPoints: ['웹 서비스가 있어', '이메일이 있어', '파일 전송이 있어'],
        examTip: '서비스 이름과 사용하는 프로토콜을 함께 묶어 봐.',
        visualHint: 'internet-services',
        correct: '웹, 이메일, 파일 전송처럼 인터넷으로 제공되는 기능이야',
        explanation: '인터넷은 단순 웹뿐 아니라 여러 서비스를 제공하는 기반이야.',
      },
      {
        title: '이메일은 보내기와 받기가 나뉘어',
        body: 'SMTP는 보내기, POP3와 IMAP은 받기와 자주 연결돼.',
        keyPoints: ['SMTP는 메일 전송이야', 'POP3는 메일 수신과 연결돼', 'IMAP도 메일 수신에 쓰여'],
        examTip: '메일 프로토콜은 보내기와 받기를 구분하는 문제가 많아.',
        correct: 'SMTP는 메일을 보낼 때 쓰는 프로토콜이야',
        explanation: '이메일은 보내는 규칙과 받는 규칙이 따로 나오는 경우가 많아.',
      },
    ],
  },
  {
    id: '050',
    section: '인터넷 활용',
    title: '정보통신기술 활용',
    cards: [
      {
        title: '정보통신기술은 연결해서 쓰는 기술이야',
        body: '정보통신기술은 정보를 만들고 보내고 활용하는 기술을 말해.',
        keyPoints: ['정보를 처리해', '정보를 전송해', '생활과 업무에 활용해'],
        examTip: 'ICT는 컴퓨터와 통신 기술을 함께 보는 넓은 개념이야.',
        visualHint: 'ict-services',
        correct: '정보를 처리하고 전송해 생활과 업무에 활용하는 기술이야',
        explanation: '정보통신기술은 데이터 처리와 통신을 함께 이용하는 분야야.',
      },
      {
        title: '클라우드와 사물인터넷이 자주 나와',
        body: '클라우드는 빌려 쓰는 자원, IoT는 사물이 연결되는 기술이야.',
        keyPoints: ['클라우드는 원격 자원 활용이야', 'IoT는 사물 연결이야', '모바일 서비스와 연결돼'],
        examTip: '새 기술 문제는 핵심 기능을 한 문장으로 잡으면 쉬워.',
        correct: '클라우드는 인터넷으로 서버와 저장 공간을 빌려 쓰는 방식이야',
        explanation: '클라우드는 내 컴퓨터 밖의 자원을 인터넷으로 사용하는 흐름이야.',
      },
    ],
  },
  {
    id: '051',
    section: '멀티미디어 활용',
    title: '멀티미디어',
    cards: [
      {
        title: '멀티미디어는 여러 매체야',
        body: '멀티미디어는 문자, 그림, 소리, 영상을 함께 쓰는 방식이야.',
        keyPoints: ['문자를 써', '이미지를 써', '소리와 영상을 써'],
        examTip: '멀티미디어는 한 가지가 아니라 여러 매체의 결합이 핵심이야.',
        visualHint: 'multimedia-media-types',
        correct: '문자, 그림, 소리, 영상 같은 여러 매체를 함께 써',
        explanation: '멀티미디어는 다양한 정보 형태를 결합해 전달력을 높여.',
      },
      {
        title: '상호작용성도 중요해',
        body: '사용자가 누르고 선택하며 반응하는 요소도 멀티미디어에 자주 나와.',
        keyPoints: ['상호작용성이 있어', '용량이 커질 수 있어', '교육과 게임에 많이 써'],
        examTip: '멀티미디어 장점과 함께 큰 용량 같은 단점도 같이 봐.',
        correct: '사용자 입력에 반응하는 상호작용성이 포함될 수 있어',
        explanation: '멀티미디어는 보기만 하는 자료보다 사용자가 참여하는 형태도 많아.',
      },
    ],
  },
  {
    id: '052',
    section: '멀티미디어 활용',
    title: '멀티미디어 소프트웨어',
    cards: [
      {
        title: '멀티미디어 소프트웨어는 제작 도구야',
        body: '이미지, 소리, 영상을 만들거나 편집하는 프로그램이야.',
        keyPoints: ['이미지 편집이 있어', '오디오 편집이 있어', '비디오 편집이 있어'],
        examTip: '프로그램 이름보다 어떤 매체를 다루는지 먼저 봐.',
        visualHint: 'media-software',
        correct: '이미지, 소리, 영상을 만들거나 편집하는 프로그램이야',
        explanation: '멀티미디어 소프트웨어는 다양한 매체 자료를 다루게 해 줘.',
      },
      {
        title: '재생 도구도 구분해',
        body: '편집 도구와 재생 도구는 하는 일이 달라.',
        keyPoints: ['편집 도구는 수정해', '재생 도구는 보여줘', '저작 도구도 나와'],
        examTip: '편집, 재생, 저작 도구를 섞어 내는 문제에 조심해.',
        correct: '편집 도구는 자료를 고치고 재생 도구는 자료를 보여줘',
        explanation: '멀티미디어 프로그램은 제작용인지 재생용인지 역할을 봐야 해.',
      },
    ],
  },
  {
    id: '053',
    section: '멀티미디어 활용',
    title: '멀티미디어 그래픽 데이터',
    cards: [
      {
        title: '비트맵은 픽셀 그림이야',
        body: '비트맵은 작은 점인 픽셀을 모아 그림을 표현해.',
        keyPoints: ['픽셀 기반이야', '확대하면 깨질 수 있어', '사진 표현에 자주 써'],
        examTip: '확대했을 때 깨지는지 여부가 비트맵과 벡터의 단골 차이야.',
        visualHint: 'bitmap-vector-compare',
        correct: '비트맵은 픽셀을 모아 그림을 표현해',
        explanation: '비트맵은 점 하나하나의 색을 저장해서 이미지를 만들어.',
      },
      {
        title: '벡터는 선과 도형 정보야',
        body: '벡터는 선, 곡선, 도형 정보를 이용해 그림을 표현해.',
        keyPoints: ['수식과 도형 기반이야', '확대해도 선명한 편이야', '로고와 도형에 좋아'],
        examTip: '벡터는 확대해도 비교적 깨지지 않는 특징이 자주 나와.',
        correct: '벡터는 선과 도형 정보로 그림을 표현해',
        explanation: '벡터는 픽셀보다 도형의 수학적 정보를 저장하는 쪽이야.',
      },
    ],
  },
  {
    id: '054',
    section: '멀티미디어 활용',
    title: '멀티미디어 오디오/비디오 데이터',
    cards: [
      {
        title: '오디오는 소리 데이터야',
        body: '오디오는 소리를 디지털 데이터로 저장한 형태야.',
        keyPoints: ['소리 자료야', 'MP3가 자주 나와', '샘플링과 연결돼'],
        examTip: 'MP3는 오디오 형식으로 먼저 기억해.',
        visualHint: 'audio-video-formats',
        correct: '오디오는 소리를 디지털 데이터로 저장한 형태야',
        explanation: '소리도 컴퓨터 안에서는 숫자 데이터로 바뀌어 저장돼.',
      },
      {
        title: '비디오는 영상 데이터야',
        body: '비디오는 화면 변화와 소리를 함께 담는 데이터야.',
        keyPoints: ['영상 자료야', 'MP4가 자주 나와', '압축이 중요해'],
        examTip: '영상은 용량이 커서 압축 형식과 함께 자주 나와.',
        correct: '비디오는 움직이는 화면과 소리를 담는 데이터야',
        explanation: '비디오 파일은 많은 프레임과 소리를 포함해서 용량이 커질 수 있어.',
      },
    ],
  },
  {
    id: '055',
    section: '멀티미디어 활용',
    title: '멀티미디어 활용',
    cards: [
      {
        title: '멀티미디어는 전달력을 높여',
        body: '그림, 소리, 영상은 글만으로 어려운 내용을 쉽게 보여줘.',
        keyPoints: ['교육에 활용돼', '광고에 활용돼', '발표에 활용돼'],
        examTip: '활용 분야와 장점을 함께 묻는 문제가 나와.',
        visualHint: 'multimedia-use-cases',
        correct: '글만으로 어려운 내용을 그림과 소리로 쉽게 전달해',
        explanation: '멀티미디어는 여러 감각을 활용해 이해를 돕는 장점이 있어.',
      },
      {
        title: '용량과 저작권도 조심해',
        body: '멀티미디어 자료는 용량이 크고 저작권 문제가 생길 수 있어.',
        keyPoints: ['용량이 커질 수 있어', '저작권을 확인해야 해', '압축이 필요할 수 있어'],
        examTip: '장점만 외우지 말고 단점과 주의점도 같이 봐.',
        correct: '자료 용량과 저작권 문제를 함께 고려해야 해',
        explanation: '멀티미디어는 편리하지만 저장 공간과 사용 권한을 신경 써야 해.',
      },
    ],
  },
  {
    id: '056',
    section: '컴퓨터 시스템 보호',
    title: '저작권 보호',
    cards: [
      {
        title: '저작권은 만든 사람의 권리야',
        body: '저작권은 글, 음악, 그림, 프로그램 같은 창작물을 보호해.',
        keyPoints: ['창작물을 보호해', '무단 복제를 막아', '프로그램에도 적용돼'],
        examTip: '소프트웨어 불법 복제와 저작권은 자주 함께 나와.',
        visualHint: 'copyright-protection',
        correct: '글, 음악, 그림, 프로그램 같은 창작물의 권리를 보호해',
        explanation: '저작권은 만든 사람의 노력과 권리를 지키기 위한 제도야.',
      },
      {
        title: '무료 자료도 조건이 있어',
        body: '무료로 받은 자료라도 사용 조건을 확인해야 해.',
        keyPoints: ['라이선스를 확인해', '무단 배포는 위험해', '출처와 사용 범위를 봐'],
        examTip: '무료와 자유 사용은 같은 말이 아닐 수 있어.',
        correct: '무료 자료라도 라이선스와 사용 조건을 확인해야 해',
        explanation: '무료 자료도 상업적 사용이나 재배포가 제한될 수 있어.',
      },
    ],
  },
  {
    id: '057',
    section: '컴퓨터 시스템 보호',
    title: '바이러스(Virus)',
    cards: [
      {
        title: '바이러스는 악성 프로그램이야',
        body: '바이러스는 파일을 감염시키고 피해를 줄 수 있는 프로그램이야.',
        keyPoints: ['악성 프로그램이야', '파일 감염이 특징이야', '피해를 줄 수 있어'],
        examTip: '바이러스, 웜, 트로이 목마 차이를 구분해야 해.',
        visualHint: 'malware-types',
        correct: '파일을 감염시키고 피해를 줄 수 있는 악성 프로그램이야',
        explanation: '바이러스는 다른 파일에 붙어 퍼지는 특징으로 자주 설명돼.',
      },
      {
        title: '백신과 업데이트로 예방해',
        body: '백신 프로그램과 보안 업데이트는 감염 위험을 줄여줘.',
        keyPoints: ['백신으로 검사해', '업데이트가 중요해', '의심 파일을 조심해'],
        examTip: '예방은 백신 설치만이 아니라 최신 업데이트까지 함께 봐.',
        correct: '백신 검사와 보안 업데이트로 감염 위험을 줄일 수 있어',
        explanation: '악성 프로그램은 새 방식으로 변하므로 최신 상태 유지가 중요해.',
      },
    ],
  },
  {
    id: '058',
    section: '컴퓨터 시스템 보호',
    title: '정보 보안 개요',
    cards: [
      {
        title: '보안 3요소를 잡아',
        body: '정보 보안은 기밀성, 무결성, 가용성을 지키는 일이야.',
        keyPoints: ['기밀성을 지켜', '무결성을 지켜', '가용성을 지켜'],
        examTip: '보안 3요소는 뜻을 서로 바꿔 내는 문제가 많아.',
        visualHint: 'cia-triad',
        correct: '기밀성, 무결성, 가용성을 지키는 일이야',
        explanation: '정보 보안은 정보를 숨기고, 바르게 유지하고, 필요할 때 쓰게 해.',
      },
      {
        title: '기밀성은 허가된 사람만 봐',
        body: '기밀성은 허락된 사람만 정보에 접근하게 하는 성질이야.',
        keyPoints: ['기밀성은 접근 제한이야', '무결성은 변조 방지야', '가용성은 사용 가능 상태야'],
        examTip: '무결성은 비밀 유지가 아니라 내용이 틀어지지 않는 쪽이야.',
        correct: '기밀성은 허락된 사람만 정보에 접근하게 하는 성질이야',
        explanation: '기밀성은 정보가 아무에게나 공개되지 않게 지키는 개념이야.',
      },
    ],
  },
  {
    id: '059',
    section: '컴퓨터 시스템 보호',
    title: '정보 보안 기법',
    cards: [
      {
        title: '암호화는 내용을 숨겨',
        body: '암호화는 정보를 알아보기 어렵게 바꿔 보호하는 방법이야.',
        keyPoints: ['내용을 바꿔 보호해', '키가 중요해', '복호화와 함께 나와'],
        examTip: '암호화와 인증을 서로 바꿔 내는 문제에 조심해.',
        visualHint: 'security-methods',
        correct: '정보를 알아보기 어렵게 바꿔 보호하는 방법이야',
        explanation: '암호화된 정보는 올바른 키가 있어야 원래 내용으로 되돌릴 수 있어.',
      },
      {
        title: '인증과 방화벽도 구분해',
        body: '인증은 사용자를 확인하고, 방화벽은 통신 통로를 감시해.',
        keyPoints: ['인증은 사용자 확인이야', '방화벽은 통신 통제야', '백업은 복구에 도움돼'],
        examTip: '방화벽은 파일 백업 도구가 아니라 네트워크 접근 통제 쪽이야.',
        correct: '인증은 사용자를 확인하고 방화벽은 네트워크 접근을 통제해',
        explanation: '보안 기법은 각각 지키는 방식이 달라서 역할 구분이 중요해.',
      },
    ],
  },
];

const questionChoicePool = COMPUTER_GENERAL_TOPICS.flatMap((topic) =>
  topic.cards.map((card) => card.correct),
);

function pickQuestionChoices(correct: string, seed: number): { choices: string[]; answerIndex: number } {
  const wrongs: string[] = [];
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
  topic: TopicSpec,
  card: MicroCardSpec,
  topicIndex: number,
  cardIndex: number,
): ComhwalConceptQuestion {
  const { choices, answerIndex } = pickQuestionChoices(
    card.correct,
    topicIndex + cardIndex,
  );

  return {
    id: `comhwal-1-${topic.id}-q${String(cardIndex + 1).padStart(2, '0')}`,
    prompt:
      cardIndex === 0
        ? `${topic.title}에서 방금 배운 핵심은 무엇일까?`
        : `${topic.title}의 시험 포인트로 가장 알맞은 것은?`,
    choices,
    answerIndex,
    explanation: card.explanation,
  };
}

function buildComputerGeneralSections(): ComhwalSection[] {
  return COMPUTER_GENERAL_TOPICS.flatMap((topic, topicIndex) => {
    const cards: ComhwalConceptCard[] = topic.cards.map((card, cardIndex) => ({
      id: `comhwal-1-${topic.id}-c${String(cardIndex + 1).padStart(2, '0')}`,
      topicId: topic.id,
      title: card.title,
      body: card.body,
      keyPoints: card.keyPoints,
      examTip: card.examTip,
      visualHint: card.visualHint,
      question: buildQuestion(topic, card, topicIndex, cardIndex),
    }));

    const sections: ComhwalSection[] = [];
    for (let start = 0; start < cards.length; start += 5) {
      const slice = cards.slice(start, start + 5);
      const sectionIndex = Math.floor(start / 5) + 1;
      sections.push({
        id:
          cards.length <= 5
            ? `computer-general-${topic.id}`
            : `computer-general-${topic.id}-${sectionIndex}`,
        title: cards.length <= 5 ? topic.title : `${topic.title} ${sectionIndex}`,
        topicRange: topic.id,
        cards: slice,
      });
    }
    return sections;
  });
}

const computerGeneralSections: ComhwalSection[] = buildComputerGeneralSections();

export const COMHWAL_CONCEPT_CHAPTERS: ComhwalChapter[] = [
  {
    planetKey: 'computer-general',
    title: '컴퓨터 일반',
    sections: computerGeneralSections,
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
