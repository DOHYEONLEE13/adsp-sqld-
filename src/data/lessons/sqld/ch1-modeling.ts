import type { Lesson } from '../types';

const SQLD_1_1: Lesson = {
  id: 'sqld-1-1',
  subject: 'sqld',
  chapter: 1,
  chapterTitle: '데이터 모델링의 이해',
  topic: '데이터 모델링의 이해',
  title: '모델링 · 스키마 · 엔터티 · 속성 · 관계 · 식별자',
  hook: '테이블을 그리기 전에, "무엇을 어떻게 저장할지" 를 정리하는 단계.',
  estimatedMinutes: 42,
  steps: [
    {
      id: 'sqld-1-1-s1',
      title: '데이터 모델링이란',
      quizId: 'sqld-1-1-cp-01',
      group: 'sqld-1-1-g1-basic',
      dialogue: [
        { pose: 'wave', text: 'SQLD 첫 시간! [데이터 모델링]부터 차근차근 배워보자.' },
        { pose: 'think', text: '학교에서 [수강신청] 한 번쯤 해봤지?' },
        { pose: 'think', text: '학생·과목·교수·시간표 같은 정보를 컴퓨터가 다루려면 어떻게 해야 할까?' },
        { pose: 'lightbulb', text: '먼저 현실의 정보를 [DB]가 담을 수 있는 모양으로 정리해야 해.' },
        { pose: 'happy', text: '이렇게 현실 정보를 [DB]의 구조로 표현하는 과정을 [데이터 모델링]이라고 해!' },
        { pose: 'lightbulb', text: '정확히는 현실 세계의 정보를 [약속된 표기법]을 활용해 [데이터베이스 구조]로 표현하는 과정이야.' },
        { pose: 'idle', text: '자, 모델링 설명을 제대로 고를 수 있는지 확인해보자.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '데이터 모델링은 현실 세계의 정보를 [약속된 표기법]을 활용해 [DB]의 구조로 표현하는 과정입니다. 본격적인 SQL을 짜기 전에, DB에 저장할 구조를 먼저 그려보는 단계예요.',
        },
        {
          kind: 'example',
          title: '수강신청 예시',
          body:
            '학생은 과목을 신청하고, 개설된 과목에는 담당 교수와 시간이 정해집니다.\n\n이런 현실의 사실을 DB 구조로 바꾸는 첫 작업이 데이터 모델링입니다.',
        },
        {
          kind: 'section',
          title: '한 문장으로 말하면',
          body:
            '데이터 모델링은 “현실을 표로 저장하기 전에, 무엇을 어떤 관계로 저장할지 약속된 그림으로 정리하는 일”입니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s1b',
      title: '좋은 모델의 3가지 특징',
      quizId: 'sqld-1-1-cp-01b',
      group: 'sqld-1-1-g2-features',
      dialogue: [
        { pose: 'think', text: '근데 아무렇게나 표를 만들면 안 돼. 좋은 모델은 [3가지 특징]이 있어야 해!' },
        { pose: 'lightbulb', text: '1. [단순화] 쉽게 이해할 수 있고,\n2. [추상화] 핵심만 남길 수 있고,\n3. [명확화] 헷갈리지 않게 표현하는 거야!' },
        { pose: 'happy', text: '줄여서 [단추명]으로 외우자!' },
        { pose: 'idle', text: '좋은 모델의 특징이 아닌 것을 골라보자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '좋은 데이터 모델은 복잡한 현실을 아무렇게나 표로 옮기지 않습니다. 쉽게 이해되고, 핵심만 남고, 누가 봐도 같은 뜻으로 읽혀야 해요.',
        },
        {
          kind: 'keypoints',
          title: '모델링의 3가지 특징 — "단추명"',
          items: [
            '단순화 — 처음 보는 사람도 구조를 쉽게 이해할 수 있게 만든다',
            '추상화 — 모든 세부사항이 아니라 핵심 정보만 남긴다',
            '명확화 — 누가 봐도 같은 의미로 해석되게 표현한다',
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"단·추·명"',
          body:
            '단순화·추상화·명확화. SQLD에서는 “좋은 모델이 갖춰야 할 특징”으로 묶어 기억하면 됩니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s1c',
      title: '단순화',
      quizId: 'sqld-1-1-cp-01c',
      group: 'sqld-1-1-g2-features',
      dialogue: [
        { pose: 'think', text: '첫 번째 특징! [단순화]부터 알아보자.' },
        { pose: 'lightbulb', text: '좋은 모델은 처음 봐도 바로 이해돼야 해.' },
        { pose: 'happy', text: '"아, 이런 구조구나!" 하고 따라올 수 있으면 좋아.' },
        { pose: 'happy', text: '예를 들어 [학생], [과목], [수강신청]을 따로 보면 "학생이 과목을 신청한다"는 구조가 바로 보이지?' },
        { pose: 'idle', text: '[단순화]에 대한 문제를 풀어보자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '단순화는 모델을 처음 보는 사람도 구조를 쉽게 이해할 수 있게 정리하는 특징입니다. 복잡한 현실을 그대로 복사하는 것이 아니라, 읽기 쉬운 구조로 만드는 거예요.',
        },
        {
          kind: 'example',
          title: '쉬운 예시',
          body:
            '수강신청을 한 줄짜리 거대한 표로 만들면 학생 정보, 과목 정보, 신청 기록이 뒤섞입니다. 반대로 학생·과목·수강신청처럼 역할을 나누면 처음 보는 사람도 구조를 따라가기 쉬워집니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '단순화의 기준',
          body:
            '처음 보는 사람이 “아, 이 구조구나!” 하고 따라올 수 있으면 단순화가 잘 된 모델입니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s1d',
      title: '추상화',
      quizId: 'sqld-1-1-cp-01c-abstract',
      group: 'sqld-1-1-g2-features',
      dialogue: [
        { pose: 'think', text: '두 번째 특징은 [추상화]야.' },
        { pose: 'lightbulb', text: '현실의 모든 정보를 다 넣지는 않아.' },
        { pose: 'happy', text: '지금 필요한 [핵심]만 남기는 거야.' },
        { pose: 'think', text: '수강신청 모델이라면 취미나 신발 사이즈까지는 필요 없겠지?' },
        { pose: 'idle', text: '[추상화]에 대한 문제를 풀어보자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '추상화는 현실의 모든 세부사항을 다 넣지 않고, 지금 만들려는 DB에 필요한 핵심만 남기는 특징입니다.',
        },
        {
          kind: 'example',
          title: '쉬운 예시',
          body:
            '수강신청 DB를 만들 때 학생의 취미, 신발 사이즈, 점심 메뉴까지 모두 저장할 필요는 없습니다. 학생, 과목, 신청 기록처럼 수강신청에 필요한 핵심만 남기면 됩니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '추상화의 기준',
          body:
            '시험에서는 “핵심만 추출”, “필요한 정보만 남김” 같은 표현을 추상화로 연결하면 됩니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s1e',
      title: '명확화',
      quizId: 'sqld-1-1-cp-01c-clear',
      group: 'sqld-1-1-g2-features',
      dialogue: [
        { pose: 'think', text: '세 번째 특징은 [명확화]야.' },
        { pose: 'lightbulb', text: '누가 봐도 같은 뜻으로 읽혀야 해.' },
        { pose: 'happy', text: '예를 들어 [신청일]이 결제일인지 수강신청일인지 헷갈리면 안 돼.' },
        { pose: 'think', text: '이름과 관계를 분명하게 정해야 해.' },
        { pose: 'idle', text: '[명확화]에 대한 문제를 풀어보자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '명확화는 같은 모델을 본 사람들이 같은 의미로 이해하게 만드는 특징입니다. 이름, 관계, 기준이 애매하면 좋은 모델이 아닙니다.',
        },
        {
          kind: 'example',
          title: '쉬운 예시',
          body:
            '수강신청 화면에 “날짜”라고만 적으면 신청한 날짜인지, 결제한 날짜인지, 수업 날짜인지 헷갈릴 수 있습니다. “수강신청일”처럼 의미가 분명해야 합니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '명확화의 기준',
          body:
            '누가 봐도 같은 뜻으로 읽히면 명확화가 잘 된 모델입니다. 반대로 사람마다 다르게 해석되면 명확화가 부족합니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s1f',
      title: '모델링의 3가지 관점',
      quizId: 'sqld-1-1-cp-01d',
      group: 'sqld-1-1-g3-perspectives',
      dialogue: [
        { pose: 'think', text: '같은 업무도 한 방향에서만 보면 놓치는 게 생겨.' },
        { pose: 'lightbulb', text: '그래서 모델링은 [3가지 관점]으로 나눠 봐.' },
        { pose: 'happy', text: '데이터 관점, 프로세스 관점, 상관 관점.' },
        { pose: 'think', text: '암기는 [데프상]으로 잡자!' },
        { pose: 'idle', text: '먼저 3가지 관점이 아닌 것을 골라보자.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '모델링은 데이터만 보는 작업이 아닙니다. 무엇을 저장하는지, 업무가 어떻게 흐르는지, 업무가 데이터를 어디서 쓰는지를 함께 봅니다.',
        },
        {
          kind: 'keypoints',
          title: '모델링의 3가지 관점 — "데프상"',
          items: [
            '데이터 관점(Data, What) — 무엇이 저장되는가 → 엔터티·속성을 본다',
            '프로세스 관점(Process, How) — 업무가 어떻게 흐르는가 → 업무 흐름을 본다',
            '상관 관점(Data-Process, Interaction) — 업무가 데이터를 어떻게 쓰는가 → CRUD를 본다',
          ],
        },
        {
          kind: 'example',
          title: '쇼핑몰 예시',
          body:
            '데이터 관점: 회원·상품·주문이 있다.\n프로세스 관점: 장바구니 → 결제 → 주문 생성으로 흐른다.\n상관 관점: 결제 단계가 회원을 읽고, 주문을 새로 만든다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"데·프·상"',
          body:
            '데이터·프로세스·상관. 특히 상관 관점은 “업무와 데이터가 만나는 지점”이라고 생각하면 덜 딱딱합니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s1g',
      title: '데이터 관점',
      quizId: 'sqld-1-1-cp-01d-data',
      group: 'sqld-1-1-g3-perspectives',
      dialogue: [
        { pose: 'think', text: '첫 번째는 [데이터 관점]이야.' },
        { pose: 'lightbulb', text: '무엇을 저장해야 하는지 보는 관점이야.' },
        { pose: 'happy', text: '수강신청이라면 학생, 과목, 신청 기록을 먼저 떠올려.' },
        { pose: 'think', text: '어려운 말로는 [엔터티]와 [속성]을 찾는 거야.' },
        { pose: 'happy', text: '둘 다 바로 뒤에서 자세히 배울 거니까 지금은 이름만 봐도 돼.' },
        { pose: 'idle', text: '[데이터 관점] 문제를 풀어보자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '데이터 관점은 업무에서 어떤 데이터를 저장해야 하는지 보는 관점입니다. 나중에 [엔터티], [속성], [식별자]를 찾는 출발점이 됩니다.',
        },
        {
          kind: 'example',
          title: '쉬운 예시',
          body:
            '수강신청을 만든다면 “학생”, “과목”, “수강신청 기록”처럼 저장해야 할 대상을 먼저 찾습니다. 이것이 데이터 관점입니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '데이터 관점의 기준',
          body:
            '문제에서 “무엇을 저장하는가”, “엔터티와 속성”이 보이면 데이터 관점을 떠올리면 됩니다. 정확한 용어 정의는 곧 이어지는 스텝에서 다시 다룹니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s1h',
      title: '프로세스 관점',
      quizId: 'sqld-1-1-cp-01d-process',
      group: 'sqld-1-1-g3-perspectives',
      dialogue: [
        { pose: 'think', text: '두 번째는 [프로세스 관점]이야.' },
        { pose: 'lightbulb', text: '업무가 어떤 순서로 흘러가는지 보는 관점이야.' },
        { pose: 'happy', text: '조회하고, 선택하고, 신청 완료까지 가는 흐름을 보는 거지.' },
        { pose: 'think', text: '저장 대상보다 [업무 순서]에 초점이 있어.' },
        { pose: 'idle', text: '[프로세스 관점] 문제를 풀어보자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '프로세스 관점은 업무가 어떤 단계로 진행되는지 보는 관점입니다. 데이터 자체보다 업무의 흐름과 절차에 초점을 둡니다.',
        },
        {
          kind: 'example',
          title: '쉬운 예시',
          body:
            '수강신청 업무라면 “강의 조회 → 과목 선택 → 신청 완료”처럼 업무가 어떤 순서로 진행되는지 정리합니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '프로세스 관점의 기준',
          body:
            '문제에서 “업무 흐름”, “절차”, “어떤 순서로 처리되는가”가 보이면 프로세스 관점을 떠올리면 됩니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s1i',
      title: '상관 관점',
      quizId: 'sqld-1-1-cp-01d-interaction',
      group: 'sqld-1-1-g3-perspectives',
      dialogue: [
        { pose: 'think', text: '세 번째는 [상관 관점]이야.' },
        { pose: 'lightbulb', text: '업무가 데이터를 어떻게 쓰는지 보는 관점이야.' },
        { pose: 'happy', text: '예를 들어 신청 버튼은 학생을 읽고, 신청 기록을 새로 만들어.' },
        { pose: 'think', text: '이런 4가지 행동을 묶어 [CRUD]라고 불러.' },
        { pose: 'happy', text: '만들기, 읽기, 고치기, 지우기라고 생각하면 돼.' },
        { pose: 'idle', text: '[상관 관점] 문제를 풀어보자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '상관 관점은 프로세스와 데이터가 만나는 지점을 보는 관점입니다. 업무가 어떤 데이터를 만들고, 읽고, 수정하고, 삭제하는지 확인합니다. 이 네 가지 행동을 줄여 [CRUD]라고 부릅니다.',
        },
        {
          kind: 'example',
          title: '쉬운 예시',
          body:
            '수강신청 버튼을 누르면 학생 정보를 읽고, 수강신청 기록을 새로 만듭니다. 이런 연결을 보는 것이 상관 관점입니다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: 'CRUD',
          body:
            'Create(만들기) · Read(읽기) · Update(고치기) · Delete(지우기). 업무가 데이터에 하는 기본 동작 4가지입니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s2',
      title: '모델링 단계',
      quizId: 'sqld-1-1-cp-02',
      group: 'sqld-1-1-g4-stages',
      dialogue: [
        { pose: 'wave', text: '모델링은 한 번에 완성하지 않아.' },
        { pose: 'think', text: '큰 그림부터 실제 DB 설정까지 단계적으로 내려가.' },
        { pose: 'lightbulb', text: '순서는 [개념적] → [논리적] → [물리적]이야.' },
        { pose: 'happy', text: '암기는 [개논물]로 잡자!' },
        { pose: 'idle', text: '먼저 단계 순서를 확인해보자.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '데이터 모델링은 보통 개념적 → 논리적 → 물리적 순서로 진행합니다. 처음에는 큰 그림을 그리고, 그다음 구조를 정리하고, 마지막에 실제 DB에 맞게 바꿉니다.',
        },
        {
          kind: 'keypoints',
          title: '3단계 — "개논물"',
          items: [
            '개념적 — 업무의 큰 그림',
            '논리적 — DB 구조를 정리',
            '물리적 — 실제 DBMS에 맞게 구현',
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"개논물"',
          body:
            '개념(스케치) → 논리(설계도) → 물리(시공). 시험에서는 순서와 단계별 특징 매칭이 자주 나옵니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s2a',
      title: '개념적 모델링',
      quizId: 'sqld-1-1-cp-02-conceptual',
      group: 'sqld-1-1-g4-stages',
      dialogue: [
        { pose: 'think', text: '첫 단계는 [개념적] 모델링이야.' },
        { pose: 'lightbulb', text: '아직 세부 설정은 생각하지 않아.' },
        { pose: 'happy', text: '학생, 과목, 수강신청이 서로 어떻게 연결되는지 큰 그림을 잡아.' },
        { pose: 'think', text: '이때 [ERD] 같은 그림을 그리기도 해.' },
        { pose: 'idle', text: 'ERD는 뒤에서 더 자세히 볼 거야. 지금은 “큰 그림”만 기억하면 돼.' },
        { pose: 'idle', text: '[개념적] 모델링 문제를 풀어보자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '개념적 모델링은 업무의 큰 그림을 잡는 단계입니다. 어떤 대상이 있고, 서로 어떻게 연결되는지 먼저 봅니다.',
        },
        {
          kind: 'example',
          title: '쉬운 예시',
          body:
            '수강신청 시스템이라면 “학생이 과목을 신청한다”는 큰 관계를 먼저 잡습니다. 컬럼 자료형이나 인덱스는 아직 정하지 않습니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '개념적 단계의 기준',
          body:
            '문제에서 “업무 관점”, “큰 그림”, “핵심 대상과 관계”가 보이면 개념적 모델링을 떠올리면 됩니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s2b',
      title: '논리적 모델링',
      quizId: 'sqld-1-1-cp-02-logical',
      group: 'sqld-1-1-g4-stages',
      dialogue: [
        { pose: 'think', text: '두 번째는 [논리적] 모델링이야.' },
        { pose: 'lightbulb', text: '큰 그림을 DB 구조로 더 정확하게 정리해.' },
        { pose: 'happy', text: '키, 관계, 중복 줄이기 같은 구조 판단이 들어가.' },
        { pose: 'think', text: '뒤에서 나오는 [함수적 종속]도 여기와 연결돼. “무엇이 무엇을 결정하나?”를 정리하는 거야.' },
        { pose: 'think', text: '[DBMS]가 바뀌어도 비교적 다시 쓸 수 있어.' },
        { pose: 'idle', text: '[논리적] 모델링 문제를 풀어보자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '논리적 모델링은 개념적 모델을 더 정밀한 DB 구조로 정리하는 단계입니다. 키, 관계, 중복 제거, 함수적 종속 같은 논리 구조를 다룹니다.',
        },
        {
          kind: 'example',
          title: '쉬운 예시',
          body:
            '학생은 학번으로 구분하고, 학번을 알면 이름이 정해진다는 의존성도 확인합니다. 수강신청 기록은 학생과 과목을 연결한다고 정리합니다. 아직 Oracle인지 MySQL인지는 핵심이 아닙니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '논리적 단계의 기준',
          body:
            '시험에서 “정규화”, “키”, “관계 정밀화”, “재사용성”이 보이면 논리적 모델링에 가깝습니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s2c',
      title: '물리적 모델링',
      quizId: 'sqld-1-1-cp-02-physical',
      group: 'sqld-1-1-g4-stages',
      dialogue: [
        { pose: 'think', text: '마지막은 [물리적] 모델링이야.' },
        { pose: 'lightbulb', text: '이제 실제 DB에서 어떻게 저장할지 정해.' },
        { pose: 'happy', text: '자료형, [인덱스], 저장 공간, 성능을 생각해.' },
        { pose: 'think', text: 'Oracle인지 MySQL인지 같은 [DBMS] 차이도 중요해져.' },
        { pose: 'idle', text: '[물리적] 모델링 문제를 풀어보자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '물리적 모델링은 논리 구조를 실제 DBMS에 맞게 구현하는 단계입니다. 자료형, 인덱스, 저장 방식, 성능을 고려합니다.',
        },
        {
          kind: 'example',
          title: '쉬운 예시',
          body:
            '학번을 문자로 저장할지 숫자로 저장할지, 자주 검색하는 컬럼에 인덱스를 둘지, Oracle과 MySQL 중 어디에 맞출지 결정합니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '물리적 단계의 기준',
          body:
            '문제에서 “자료형”, “인덱스”, “저장 공간”, “성능”, “DBMS 종속”이 보이면 물리적 모델링을 떠올리면 됩니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s3',
      title: 'ANSI/SPARC 3-스키마 + 데이터 독립성',
      quizId: 'sqld-1-1-cp-03',
      group: 'sqld-1-1-g5-schema',
      dialogue: [
        { pose: 'wave', text: '같은 DB도 보는 사람마다 필요한 화면이 달라.' },
        { pose: 'think', text: '학생, 교수, 관리자가 보는 정보가 다르겠지?' },
        { pose: 'lightbulb', text: '여기서 [스키마]는 DB 구조를 설명하는 설계도라고 보면 돼.' },
        { pose: 'lightbulb', text: 'ANSI/SPARC는 이걸 [외부]·[개념]·[내부] 3계층으로 나눠.' },
        { pose: 'happy', text: '암기는 [외개내]로 잡자!' },
        { pose: 'idle', text: '먼저 3층 이름부터 문제로 확인해보자.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'ANSI/SPARC 3-스키마는 DB를 외부 스키마, 개념 스키마, 내부 스키마로 나누어 보는 구조입니다.',
        },
        {
          kind: 'keypoints',
          title: '3계층 — "외개내"',
          items: [
            '외부 스키마 — 사용자별 화면',
            '개념 스키마 — 조직 전체 통합 구조',
            '내부 스키마 — 실제 저장 구조',
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"외·개·내"',
          body:
            '외부(사용자) → 개념(전체) → 내부(저장). “조직 전체 통합” 키워드가 보이면 개념 스키마입니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s3a',
      title: '외부 스키마',
      quizId: 'sqld-1-1-cp-03-external',
      group: 'sqld-1-1-g5-schema',
      dialogue: [
        { pose: 'think', text: '첫 번째는 [외부 스키마]야.' },
        { pose: 'lightbulb', text: '사용자별로 보이는 화면이나 뷰라고 생각하면 돼.' },
        { pose: 'happy', text: '학생은 내 성적표, 교수는 담당 학생 명단을 볼 수 있겠지.' },
        { pose: 'think', text: '그래서 외부 스키마는 여러 개 존재할 수 있어.' },
        { pose: 'idle', text: '[외부 스키마] 문제를 풀어보자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '외부 스키마는 사용자나 응용 프로그램이 보는 DB의 모습입니다. 사용자별 화면 또는 뷰라고 생각하면 쉽습니다.',
        },
        {
          kind: 'example',
          title: '쉬운 예시',
          body:
            '같은 학교 DB라도 학생은 내 수강 내역을 보고, 교수는 담당 강의 수강생 명단을 봅니다. 이렇게 사용자별로 보이는 구조가 외부 스키마입니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '외부 스키마의 기준',
          body:
            '문제에서 “사용자별”, “응용 프로그램별”, “개별 화면”, “여러 개”가 보이면 외부 스키마를 떠올리면 됩니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s3b',
      title: '개념 스키마',
      quizId: 'sqld-1-1-cp-03-conceptual',
      group: 'sqld-1-1-g5-schema',
      dialogue: [
        { pose: 'think', text: '두 번째는 [개념 스키마]야.' },
        { pose: 'lightbulb', text: 'DB 전체를 하나로 통합해서 보는 구조야.' },
        { pose: 'happy', text: '학생, 과목, 수강신청 전체 규칙을 한곳에서 정리해.' },
        { pose: 'think', text: '시험에서 “통합”이 보이면 개념 스키마를 강하게 의심해.' },
        { pose: 'idle', text: '[개념 스키마] 문제를 풀어보자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '개념 스키마는 조직 전체의 DB 구조를 통합해서 표현한 것입니다. 외부 스키마처럼 사용자별로 여러 개가 아니라 전체 관점입니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '개념 스키마의 기준',
          body:
            '문제에서 “조직 전체”, “통합”, “전체 DB 구조”, “하나의 전체 관점”이 보이면 개념 스키마입니다.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 보기',
          body:
            '“응용 스키마”, “논리 스키마”, “외래 스키마” 같은 보기는 ANSI/SPARC 3-스키마의 정식 이름이 아닙니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s3c',
      title: '내부 스키마',
      quizId: 'sqld-1-1-cp-03-internal',
      group: 'sqld-1-1-g5-schema',
      dialogue: [
        { pose: 'think', text: '세 번째는 [내부 스키마]야.' },
        { pose: 'lightbulb', text: 'DB가 실제로 어떻게 저장되는지 보는 구조야.' },
        { pose: 'happy', text: '[인덱스], 저장 위치, 파일 구조 같은 것이 가까워.' },
        { pose: 'think', text: '사용자 화면보다 저장장치 쪽에 더 가깝다고 보면 돼.' },
        { pose: 'idle', text: '[내부 스키마] 문제를 풀어보자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '내부 스키마는 데이터가 실제 저장장치에 어떻게 저장되는지 다루는 구조입니다. 물리 저장 구조에 가깝습니다.',
        },
        {
          kind: 'example',
          title: '쉬운 예시',
          body:
            '학생 정보가 어떤 파일 구조로 저장되는지, 인덱스를 어떻게 둘지, 저장 공간을 어떻게 배치할지 같은 내용이 내부 스키마와 가깝습니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '내부 스키마의 기준',
          body:
            '문제에서 “물리 저장”, “저장장치”, “파일 구조”, “인덱스”가 보이면 내부 스키마를 떠올리면 됩니다.',
        },
      ],
    },
    {
      id: 'sqld-1-1-s3d',
      title: '데이터 독립성',
      quizId: 'sqld-1-1-cp-03-logical-independence',
      extraQuizIds: ['sqld-1-1-cp-03-independence'],
      group: 'sqld-1-1-g5-schema',
      dialogue: [
        { pose: 'think', text: '3계층을 나누는 이유는 [데이터 독립성] 때문이야.' },
        { pose: 'lightbulb', text: '아래쪽을 바꿔도 위쪽 화면이 덜 흔들리게 만드는 거지.' },
        { pose: 'happy', text: '[논리적 독립성]은 개념 스키마가 바뀌어도 외부 스키마 영향이 적은 것.' },
        { pose: 'lightbulb', text: '예를 들어 장학금 정보를 새로 추가해도 학생 성적 화면이 그대로라면 논리적 독립성이야.' },
        { pose: 'think', text: '[물리적 독립성]은 내부 스키마가 바뀌어도 개념·외부 영향이 적은 것.' },
        { pose: 'happy', text: '예를 들어 성적 데이터를 더 빠른 저장공간으로 옮겨도 학생 화면이 그대로라면 물리적 독립성이야.' },
        { pose: 'idle', text: '[논리적 독립성]과 [물리적 독립성] 문제를 순서대로 풀어보자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '데이터 독립성은 한 계층의 변경이 다른 계층에 미치는 영향을 줄이는 성질입니다. 3-스키마 구조를 나누는 핵심 이유입니다.',
        },
        {
          kind: 'keypoints',
          title: '독립성 2종',
          items: [
            '논리적 독립성 — 개념 스키마 변경이 외부 스키마에 영향을 덜 줌',
            '물리적 독립성 — 내부 스키마 변경이 개념·외부 스키마에 영향을 덜 줌',
          ],
        },
        {
          kind: 'example',
          title: '논리적 독립성 예시',
          body:
            '학교 DB에 “장학금” 정보를 새로 관리하기로 했다고 해봅시다. DB 전체 구조에는 장학금 관련 정보가 추가되지만, 학생이 보는 “내 성적 보기” 화면이 그대로라면 논리적 독립성에 가깝습니다.',
        },
        {
          kind: 'example',
          title: '물리적 독립성 예시',
          body:
            '학교가 성적 데이터를 더 빠른 저장공간으로 옮겼다고 해봅시다. 그래도 학생은 같은 “내 성적 보기” 화면을 보고, DB 전체 구조 설명도 그대로라면 물리적 독립성에 가깝습니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '구분 기준',
          body:
            '관리하는 데이터의 구조가 바뀌면 논리적 독립성, 저장하거나 찾는 방법이 바뀌면 물리적 독립성을 떠올리면 됩니다.',
        },
      ],
    },
    {
          id: "sqld-1-1-s4",
          title: "엔터티란 무엇인가",
          quizId: "sqld-1-1-cp-04",
          group: "sqld-1-1-g6-entity",
          dialogue: [
                {
                      pose: "wave",
                      text: "[엔터티(Entity)]는 DB에 저장하고 싶은 대상이야."
                },
                {
                      pose: "think",
                      text: "수강신청으로 보면 [학생], [과목], [신청 기록]처럼 따로 관리해야 하는 것들이 엔터티가 될 수 있어."
                },
                {
                      pose: "lightbulb",
                      text: "처음에는 “표로 만들 대상”이라고 생각하면 쉬워."
                },
                {
                      pose: "idle",
                      text: "엔터티가 무엇인지 바로 확인해보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "엔터티는 업무에서 관리해야 하는 대상입니다. 사람, 물건, 장소뿐 아니라 주문·수강신청처럼 발생한 사건도 엔터티가 될 수 있어요."
                },
                {
                      kind: "example",
                      title: "수강신청 예시",
                      body: "학생 정보는 학생 엔터티, 과목 정보는 과목 엔터티, 누가 어떤 과목을 신청했는지는 수강신청 엔터티로 나눠 관리할 수 있습니다."
                },
                {
                      kind: "callout",
                      tone: "tip",
                      title: "처음엔 이렇게 기억",
                      body: "엔터티 = DB에서 표로 만들 후보. “이걸 따로 관리해야 하나?”라고 물어보면 됩니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s4-req",
          title: "엔터티 5요건",
          quizId: "sqld-1-1-cp-04-requirements",
          group: "sqld-1-1-g6-entity",
          dialogue: [
                {
                      pose: "think",
                      text: "아무 대상이나 엔터티가 되는 건 아니야. [5요건]을 봐야 해."
                },
                {
                      pose: "lightbulb",
                      text: "1. [업무 필요]: 실제 업무에서 관리해야 하는 대상이어야 해. 예를 들면 수강신청에서 학생, 과목, 신청 기록처럼."
                },
                {
                      pose: "think",
                      text: "2. [식별 가능]: 각각을 구분할 수 있어야 해. 학생은 학번, 과목은 과목코드처럼 기준이 있어야 하지."
                },
                {
                      pose: "happy",
                      text: "3. [인스턴스 2개 이상]: 실제 예시가 여러 개 있어야 해. 학생 한 명만 있는 표라면 엔터티로 보기 애매해."
                },
                {
                      pose: "lightbulb",
                      text: "4. [속성 보유]: 설명할 값이 있어야 해. 학생이라면 이름, 학번, 학과 같은 정보가 속성이야."
                },
                {
                      pose: "think",
                      text: "5. [관계 보유]: 다른 엔터티와 연결돼야 해. 학생은 수강신청을 통해 과목과 이어질 수 있어."
                },
                {
                      pose: "happy",
                      text: "시험 함정은 “반드시 영구 저장”이야. 임시 엔터티도 가능하니까 요건이 아니야."
                },
                {
                      pose: "idle",
                      text: "엔터티 요건이 아닌 것을 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "엔터티는 현실의 대상을 DB에서 따로 관리하기 위해 만든 표의 후보입니다. 그래서 “업무에 필요한가?”, “각각을 구분할 수 있는가?”, “실제 예시가 여러 개 있는가?”, “설명할 속성이 있는가?”, “다른 대상과 연결되는가?”를 차례대로 확인합니다."
                },
                {
                      kind: "keypoints",
                      title: "엔터티 5요건",
                      items: [
                            "업무 필요: 실제 업무에서 관리할 이유가 있어야 함",
                            "식별 가능: 학생의 학번처럼 각각을 구분할 기준이 있어야 함",
                            "인스턴스 2개 이상: 실제 사례가 여러 건 존재해야 함",
                            "속성 보유: 이름, 날짜, 금액처럼 설명할 값이 있어야 함",
                            "관계 보유: 다른 엔터티와 업무적으로 연결될 수 있어야 함"
                      ]
                },
                {
                      kind: "callout",
                      tone: "warn",
                      title: "시험 함정",
                      body: "“반드시 영속적으로 저장되어야 한다”는 엔터티 요건이 아닙니다. 한 학기만 쓰는 임시 관리 대상도 엔터티가 될 수 있습니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s4-name",
          title: "엔터티 이름 짓기",
          quizId: "sqld-1-1-cp-04-naming",
          group: "sqld-1-1-g6-entity",
          dialogue: [
                {
                      pose: "think",
                      text: "엔터티 이름도 규칙이 있어. 협업자가 봐도 바로 알아야 하거든."
                },
                {
                      pose: "lightbulb",
                      text: "[현업 용어]를 쓰고, [약어]는 줄이고, [단수 명사]로 적어."
                },
                {
                      pose: "happy",
                      text: "예시는 이렇게 보면 쉬워.\n학생들(X) → 학생(O)\nSTD(X) → 학생(O)\n여기서 STD는 Student를 임의로 줄인 이름이야. 처음 보는 사람은 헷갈릴 수 있으니 피하는 게 좋아."
                },
                {
                      pose: "idle",
                      text: "올바른 엔터티 이름 규칙을 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "좋은 엔터티 이름은 현업에서 쓰는 말과 가까워야 합니다. 줄임말이나 애매한 이름은 나중에 모델을 읽는 사람을 헷갈리게 해요."
                },
                {
                      kind: "keypoints",
                      title: "명명 규칙",
                      items: [
                            "현업에서 실제 쓰는 용어 사용",
                            "약어 사용 지양",
                            "단수 명사 사용",
                            "시스템 전체에서 유일한 이름",
                            "의미가 명확한 이름"
                      ]
                },
                {
                      kind: "example",
                      title: "쉬운 예시",
                      body: "“학생들”, “STU”, “사용자정보1”보다 “학생”이 더 좋은 이름입니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s5-kind",
          title: "유형·개념·사건 엔터티",
          quizId: "sqld-1-1-cp-05-kind",
          extraQuizIds: [
                "sqld-1-1-cp-05-kind-type",
                "sqld-1-1-cp-05-kind-concept"
          ],
          group: "sqld-1-1-g7-entity-types",
          dialogue: [
                {
                      pose: "wave",
                      text: "엔터티는 먼저 [유무형]으로 나눌 수 있어."
                },
                {
                      pose: "think",
                      text: "[유형]은 눈에 보이거나 만질 수 있는 대상이야."
                },
                {
                      pose: "happy",
                      text: "예를 들면 학생, 책, 고객처럼 실제로 존재하는 것을 떠올리면 쉬워."
                },
                {
                      pose: "think",
                      text: "[개념]은 만질 수는 없지만 기준으로 구분할 수 있는 대상이야."
                },
                {
                      pose: "lightbulb",
                      text: "학과, 과목, 부서처럼 이름으로 나눌 수 있는 묶음을 떠올리면 쉬워."
                },
                {
                      pose: "think",
                      text: "[사건]은 어떤 일이 발생했다는 기록이야."
                },
                {
                      pose: "happy",
                      text: "수강신청, 주문, 결제처럼 “일어난 일”을 남기는 것을 떠올리면 쉬워."
                },
                {
                      pose: "idle",
                      text: "유무형 분류를 예시로 확인해보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "유무형 분류는 엔터티가 어떤 성격의 대상인지 보는 기준입니다."
                },
                {
                      kind: "table",
                      title: "유무형 분류",
                      headers: [
                            "분류",
                            "의미",
                            "예시"
                      ],
                      rows: [
                            [
                                  "유형 엔터티",
                                  "눈에 보이거나 만질 수 있는 대상",
                                  "학생, 책, 고객"
                            ],
                            [
                                  "개념 엔터티",
                                  "만질 수는 없지만 기준으로 구분할 수 있는 대상",
                                  "학과, 과목, 부서"
                            ],
                            [
                                  "사건 엔터티",
                                  "특정 시점에 일어난 일을 남긴 기록",
                                  "수강신청, 주문, 결제"
                            ]
                      ]
                },
                {
                      kind: "callout",
                      tone: "mnemonic",
                      title: "개·사·유",
                      body: "개념·사건·유형을 묶어 외우면 보기를 빠르게 지울 수 있습니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s5-time",
          title: "기본·중심·행위 엔터티",
          quizId: "sqld-1-1-cp-05-time",
          group: "sqld-1-1-g7-entity-types",
          dialogue: [
                {
                      pose: "think",
                      text: "두 번째 기준은 [발생 시점]이야."
                },
                {
                      pose: "lightbulb",
                      text: "[기본]은 독립적으로 먼저 있고, [중심]은 업무의 중심이 되고, [행위]는 활동 결과로 생겨."
                },
                {
                      pose: "happy",
                      text: "고객은 기본, 주문은 중심, 주문상세는 행위처럼 생각하면 돼."
                },
                {
                      pose: "idle",
                      text: "발생 시점 분류를 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "발생 시점 분류는 엔터티가 업무 흐름에서 어떤 순서와 역할로 생기는지 보는 기준입니다."
                },
                {
                      kind: "table",
                      title: "발생 시점 분류",
                      headers: [
                            "분류",
                            "의미",
                            "예시"
                      ],
                      rows: [
                            [
                                  "기본 엔터티",
                                  "다른 엔터티에 의존하지 않고 먼저 존재",
                                  "학생, 과목, 고객"
                            ],
                            [
                                  "중심 엔터티",
                                  "업무의 중심이 되는 거래·관리 대상",
                                  "수강신청, 주문"
                            ],
                            [
                                  "행위 엔터티",
                                  "둘 이상의 엔터티 관계에서 발생한 상세 기록",
                                  "수강내역, 주문상세"
                            ]
                      ]
                },
                {
                      kind: "callout",
                      tone: "warn",
                      title: "가짜 보기 주의",
                      body: "발생 시점 분류는 기본·중심·행위입니다. “관계 엔터티”는 이 분류명이 아닙니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s5-check",
          title: "엔터티 분류 기준 구분",
          quizId: "sqld-1-1-cp-05-check",
          group: "sqld-1-1-g7-entity-types",
          dialogue: [
                {
                      pose: "think",
                      text: "같은 엔터티도 기준에 따라 다르게 분류될 수 있어."
                },
                {
                      pose: "lightbulb",
                      text: "예를 들어 [수강신청]은 유무형 기준으로는 사건, 발생 시점 기준으로는 중심 또는 행위로 볼 수 있어."
                },
                {
                      pose: "happy",
                      text: "문제에서 “어떤 기준”을 묻는지 먼저 확인하면 덜 헷갈려."
                },
                {
                      pose: "idle",
                      text: "기준이 다른 보기를 찾아보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "엔터티 분류 문제는 기준을 섞어 내는 경우가 많습니다. 보기 자체보다 “유무형을 묻는지, 발생 시점을 묻는지”를 먼저 확인하세요."
                },
                {
                      kind: "keypoints",
                      title: "구분법",
                      items: [
                            "유무형: 유형·개념·사건",
                            "발생 시점: 기본·중심·행위",
                            "문제의 기준과 맞지 않는 보기는 먼저 제외"
                      ]
                }
          ]
    },
    {
          id: "sqld-1-1-s6",
          title: "속성이란 무엇인가",
          quizId: "sqld-1-1-cp-06",
          group: "sqld-1-1-g8-attributes",
          dialogue: [
                {
                      pose: "wave",
                      text: "[속성(Attribute)]은 엔터티가 가진 세부 정보야."
                },
                {
                      pose: "think",
                      text: "더 이상 나누지 않고 하나의 의미로 쓰는 최소 데이터 단위라고 보면 쉬워."
                },
                {
                      pose: "lightbulb",
                      text: "이런 특징을 [원자성]이라고 해. 학번은 학번 하나, 이름은 이름 하나처럼 담는 거야."
                },
                {
                      pose: "happy",
                      text: "DB 표로 보면 속성은 보통 [컬럼]이 돼. 학생 표라면 학번, 이름, 학과가 각각 속성이야."
                },
                {
                      pose: "idle",
                      text: "속성의 의미를 확인해보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "속성은 엔터티를 설명하는 최소 데이터 단위입니다. 학생이라는 대상을 관리하려면 학번·이름·학과처럼 더 이상 나누지 않고 하나의 의미로 쓰는 항목들이 필요합니다."
                },
                {
                      kind: "example",
                      title: "표로 보면",
                      body: "학생 테이블의 컬럼이 학번, 이름, 학과라면 각각이 속성입니다."
                },
                {
                      kind: "callout",
                      tone: "tip",
                      title: "원자성",
                      body: "한 속성에는 하나의 의미만 담는 것이 좋습니다. 주소 전체를 한 칸에 모두 넣기보다 우편번호, 시도, 도로명처럼 필요한 단위로 나누면 검색과 수정이 쉬워집니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s6-origin",
          title: "기본 속성",
          quizId: "sqld-1-1-cp-06-origin-basic",
          group: "sqld-1-1-g8-attributes",
          dialogue: [
                {
                      pose: "think",
                      text: "속성은 만들어진 방식으로 [기본 속성], [설계 속성], [파생 속성]으로 나눠."
                },
                {
                      pose: "lightbulb",
                      text: "먼저 [기본 속성]부터 보자. 업무에 원래부터 존재하는 속성이야."
                },
                {
                      pose: "happy",
                      text: "학생의 이름, 생년월일, 주소처럼 업무에서 자연스럽게 다루는 값이 기본 속성이야."
                },
                {
                      pose: "idle",
                      text: "기본 속성에 가까운 것을 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "기본 속성은 업무에 원래 존재하는 속성입니다. 시스템을 만들기 전에도 학생에게 이름과 생년월일이 있듯이, 현실 업무에서 자연스럽게 필요한 값입니다."
                },
                {
                      kind: "callout",
                      tone: "tip",
                      title: "쉽게 구분하기",
                      body: "시스템이 새로 만든 값인지, 다른 값으로 계산한 값인지 고민하기 전에 “현실 업무에 원래 있던 값인가?”를 먼저 봅니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s6-designed",
          title: "설계 속성",
          quizId: "sqld-1-1-cp-06-origin-designed",
          group: "sqld-1-1-g8-attributes",
          dialogue: [
                {
                      pose: "think",
                      text: "[설계 속성]은 업무에 원래 있던 값이 아니라, 시스템을 만들면서 필요해서 붙인 속성이야."
                },
                {
                      pose: "lightbulb",
                      text: "예를 들어 주문번호, 회원ID, 일련번호처럼 구분하거나 관리하려고 새로 만든 값이야."
                },
                {
                      pose: "happy",
                      text: "현실의 사람에게 처음부터 회원ID가 있는 건 아니지? 시스템이 관리하려고 만든 거야."
                },
                {
                      pose: "idle",
                      text: "설계 속성에 가까운 것을 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "설계 속성은 데이터 모델을 설계하는 과정에서 새로 만든 속성입니다. 업무를 더 쉽게 식별하거나 관리하기 위해 시스템이 부여하는 값이 많습니다."
                },
                {
                      kind: "example",
                      title: "쉬운 예시",
                      body: "쇼핑몰에서 주문을 구분하려고 만든 주문번호, 회원을 구분하려고 만든 회원ID는 설계 속성으로 볼 수 있습니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s6-derived",
          title: "파생 속성",
          quizId: "sqld-1-1-cp-06-origin",
          group: "sqld-1-1-g8-attributes",
          dialogue: [
                {
                      pose: "think",
                      text: "[파생 속성]은 다른 속성에서 계산하거나 가공해서 만든 속성이야."
                },
                {
                      pose: "lightbulb",
                      text: "생년월일로 계산한 나이, 과목 점수들로 계산한 총점처럼 생각하면 쉬워."
                },
                {
                      pose: "happy",
                      text: "중요한 건 원본 값이 바뀌면 파생 속성도 다시 맞춰야 한다는 점이야."
                },
                {
                      pose: "idle",
                      text: "파생 속성에 가까운 것을 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "파생 속성은 다른 속성으로부터 계산되거나 가공되어 만들어지는 속성입니다. 시험에서도 자주 묻는 중요한 개념입니다."
                },
                {
                      kind: "callout",
                      tone: "warn",
                      title: "파생 속성이 중요한 이유",
                      body: "파생 속성은 편하지만 원본 값이 바뀌면 함께 다시 계산해야 합니다. 그래서 저장할지, 필요할 때 계산할지 모델링 단계에서 신중히 판단해야 합니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s6-shape",
          title: "단일 속성",
          quizId: "sqld-1-1-cp-06-shape-single",
          group: "sqld-1-1-g8-attributes",
          dialogue: [
                {
                      pose: "think",
                      text: "이번에는 속성을 값의 모양으로 나눠볼게."
                },
                {
                      pose: "lightbulb",
                      text: "[단일 속성]은 더 나누지 않고 하나로 쓰는 속성이야."
                },
                {
                      pose: "happy",
                      text: "예를 들어 학번은 2026001 하나로 의미가 끝나. 학번을 앞자리, 뒷자리로 쪼개 쓰지 않지."
                },
                {
                      pose: "idle",
                      text: "단일 속성에 가까운 것을 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "단일 속성은 하나의 의미로 쓰는 속성입니다. 학번, 이름처럼 더 쪼개서 관리할 필요가 없는 값을 떠올리면 쉽습니다."
                },
                {
                      kind: "callout",
                      tone: "tip",
                      title: "원자성과 연결",
                      body: "단일 속성은 앞에서 배운 원자성과도 연결됩니다. 한 칸에는 하나의 의미만 담는다는 감각을 유지하면 됩니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s6-shape-composite",
          title: "복합 속성",
          quizId: "sqld-1-1-cp-06-shape-composite",
          group: "sqld-1-1-g8-attributes",
          dialogue: [
                {
                      pose: "think",
                      text: "[복합 속성]은 필요하면 여러 하위 속성으로 나눌 수 있는 속성이야."
                },
                {
                      pose: "lightbulb",
                      text: "주소는 시, 구, 상세주소처럼 나눠 볼 수 있으니 복합 속성으로 볼 수 있어."
                },
                {
                      pose: "happy",
                      text: "시험에서는 '이 값을 더 작은 의미로 쪼갤 수 있나?'를 먼저 보면 돼."
                },
                {
                      pose: "idle",
                      text: "복합 속성 예시를 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "복합 속성은 하나처럼 보이지만 내부를 나눠 볼 수 있는 속성입니다. 주소는 시, 구, 도로명, 상세주소처럼 하위 속성으로 나눌 수 있습니다."
                },
                {
                      kind: "callout",
                      tone: "tip",
                      title: "모델링 감각",
                      body: "항상 쪼개야 한다는 뜻은 아닙니다. 검색, 정렬, 검증에 따로 필요하면 나눠서 관리하는 쪽을 생각합니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s6-shape-multivalue",
          title: "다중값 속성",
          quizId: "sqld-1-1-cp-06-shape",
          group: "sqld-1-1-g8-attributes",
          dialogue: [
                {
                      pose: "think",
                      text: "[다중값 속성]은 한 인스턴스가 같은 종류의 값을 여러 개 가질 수 있는 속성이야."
                },
                {
                      pose: "lightbulb",
                      text: "한 학생이 이메일을 여러 개 등록할 수 있다면 이메일은 다중값 속성이야."
                },
                {
                      pose: "happy",
                      text: "실무에서는 이메일1, 이메일2처럼 칸을 계속 늘리기보다 별도 테이블로 빼는 경우가 많아."
                },
                {
                      pose: "idle",
                      text: "다중값 속성을 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "다중값 속성은 한 인스턴스가 같은 속성 값을 여러 개 가질 수 있는 경우입니다. 전화번호 여러 개, 이메일 여러 개처럼 반복되는 값을 떠올리면 쉽습니다."
                },
                {
                      kind: "callout",
                      tone: "warn",
                      title: "시험 포인트",
                      body: "다중값 속성을 한 테이블 안에 반복 컬럼으로 계속 두면 관리가 어려워집니다. 보통 별도 엔터티나 테이블로 분리하는 방향을 생각합니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s6-role",
          title: "PK 속성",
          quizId: "sqld-1-1-cp-06-role-pk",
          group: "sqld-1-1-g8-attributes",
          dialogue: [
                {
                      pose: "think",
                      text: "이제 속성이 테이블에서 맡은 역할을 볼게."
                },
                {
                      pose: "lightbulb",
                      text: "[PK]는 한 행을 딱 하나로 구분하는 대표 속성이야."
                },
                {
                      pose: "happy",
                      text: "학생 표에서 학번이 겹치지 않는다면 학번을 PK로 둘 수 있어."
                },
                {
                      pose: "idle",
                      text: "PK에 가까운 속성을 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "PK 속성은 테이블에서 한 행을 유일하게 구분하는 대표 속성입니다. 학생 표의 학번처럼 중복되면 안 되는 값을 떠올리면 쉽습니다."
                },
                {
                      kind: "callout",
                      tone: "warn",
                      title: "PK 핵심",
                      body: "PK는 비어 있으면 안 되고, 같은 값이 두 번 나오면 안 됩니다. 그래서 한 데이터를 정확히 찾을 때 기준점이 됩니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s6-role-fk",
          title: "FK 속성",
          quizId: "sqld-1-1-cp-06-role",
          group: "sqld-1-1-g8-attributes",
          dialogue: [
                {
                      pose: "think",
                      text: "[FK]는 다른 테이블의 PK를 가져와 연결하는 속성이야."
                },
                {
                      pose: "lightbulb",
                      text: "학생 표와 학과 표가 있을 때, 학생의 학과ID는 학과 표를 가리키는 FK가 될 수 있어."
                },
                {
                      pose: "happy",
                      text: "FK는 관계를 실제 데이터로 이어 주는 연결고리야."
                },
                {
                      pose: "idle",
                      text: "FK의 역할을 확인해보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "FK 속성은 다른 테이블의 대표값을 참조해 두 테이블을 연결합니다. 학생의 학과ID가 학과 테이블의 학과ID를 가리키는 식입니다."
                },
                {
                      kind: "callout",
                      tone: "tip",
                      title: "쉽게 보기",
                      body: "PK가 '내 표 안에서 나를 찾는 값'이라면, FK는 '다른 표의 누구와 연결되는지 알려주는 값'입니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s6-role-general",
          title: "일반 속성",
          quizId: "sqld-1-1-cp-06-role-general",
          group: "sqld-1-1-g8-attributes",
          dialogue: [
                {
                      pose: "think",
                      text: "[일반 속성]은 PK도 FK도 아니지만 인스턴스를 설명해 주는 속성이야."
                },
                {
                      pose: "lightbulb",
                      text: "학생의 이름, 생년월일, 연락처처럼 구분용 대표키는 아니지만 필요한 정보야."
                },
                {
                      pose: "happy",
                      text: "중요하지 않다는 뜻이 아니라, 역할이 구분용이나 참조용이 아니라는 뜻이야."
                },
                {
                      pose: "idle",
                      text: "일반 속성을 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "일반 속성은 PK나 FK처럼 특별한 연결 역할을 하지는 않지만, 인스턴스를 설명하는 데 필요한 속성입니다."
                },
                {
                      kind: "callout",
                      tone: "tip",
                      title: "도메인",
                      body: "도메인은 속성이 가질 수 있는 값의 범위입니다. 예: 학년은 1~4 중 하나, 성별은 정해진 코드 중 하나."
                }
          ]
    },
    {
          id: "sqld-1-1-s7",
          title: "관계란 무엇인가",
          quizId: "sqld-1-1-cp-07",
          group: "sqld-1-1-g9-relationship",
          dialogue: [
                {
                      pose: "wave",
                      text: "[관계(Relationship)]는 엔터티 사이의 연결이야."
                },
                {
                      pose: "think",
                      text: "학생과 과목 사이에는 “수강한다”라는 관계가 있을 수 있어."
                },
                {
                      pose: "lightbulb",
                      text: "관계는 ERD에서 선으로 보이지만, 그 선 안에도 의미가 있어. 뒤에서 그 선을 어떻게 읽는지 볼 거야."
                },
                {
                      pose: "idle",
                      text: "관계의 의미를 확인해보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "관계는 둘 이상의 엔터티가 업무적으로 어떻게 연결되는지를 표현합니다."
                },
                {
                      kind: "example",
                      title: "수강신청 예시",
                      body: "학생은 과목을 수강하고, 고객은 상품을 주문하고, 직원은 부서에 소속됩니다. 이런 동사형 연결이 관계입니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s7-elements",
          title: "관계 3요소",
          quizId: "sqld-1-1-cp-07-elements",
          group: "sqld-1-1-g9-relationship",
          dialogue: [
                {
                      pose: "think",
                      text: "관계를 볼 때는 [관계명], [차수], [선택사양]을 확인해."
                },
                {
                      pose: "lightbulb",
                      text: "줄여서 [관차선]이라고 외우자."
                },
                {
                      pose: "happy",
                      text: "무슨 관계인지, 몇 개씩 연결되는지, 반드시 참여해야 하는지를 보는 거야."
                },
                {
                      pose: "idle",
                      text: "관계의 3요소에 포함되지 않는 것을 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "table",
                      title: "관계 3요소",
                      headers: [
                            "요소",
                            "뜻",
                            "예시"
                      ],
                      rows: [
                            [
                                  "관계명",
                                  "관계의 이름",
                                  "수강한다, 주문한다"
                            ],
                            [
                                  "차수",
                                  "몇 개씩 연결되는가",
                                  "1:1, 1:M, M:N"
                            ],
                            [
                                  "선택사양",
                                  "반드시 참여하는가",
                                  "필수, 선택"
                            ]
                      ]
                },
                {
                      kind: "callout",
                      tone: "mnemonic",
                      title: "관·차·선",
                      body: "관계명, 차수, 선택사양. 관계 문제는 이 세 단어를 먼저 떠올리면 됩니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s7-cardinality",
          title: "차수와 선택사양",
          quizId: "sqld-1-1-cp-07-cardinality",
          group: "sqld-1-1-g9-relationship",
          dialogue: [
                {
                      pose: "think",
                      text: "[차수]는 양쪽이 몇 개씩 연결되는지 보는 거야.\n시험에서는 [카디널리티](Cardinality)라고도 자주 나와."
                },
                {
                      pose: "lightbulb",
                      text: "부서 하나에 사원이 여러 명이면 1:M 관계야."
                },
                {
                      pose: "happy",
                      text: "[선택사양]은 반드시 연결돼야 하는지, 없어도 되는지 보는 기준이야."
                },
                {
                      pose: "lightbulb",
                      text: "ERD에서는 차수와 선택사양을 [선 끝 기호]로 압축해서 보여줘."
                },
                {
                      pose: "think",
                      text: "[|]는 반드시 하나, [O]는 없어도 됨, 까마귀발은 여러 개를 뜻해."
                },
                {
                      pose: "happy",
                      text: "예를 들어 학생 한 명은 수강내역이 없거나 여러 개일 수 있고, 수강내역 하나는 반드시 학생 한 명에 연결돼."
                },
                {
                      pose: "idle",
                      text: "차수 예시를 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "keypoints",
                      title: "차수(Cardinality)",
                      items: [
                            "1:1 — 한쪽 하나가 반대쪽 하나와 연결",
                            "1:M — 한쪽 하나가 반대쪽 여러 개와 연결",
                            "M:N — 양쪽 모두 여러 개와 연결"
                      ]
                },
                {
                      kind: "example",
                      title: "선택사양 예시",
                      body: "모든 학생이 반드시 학과에 소속되어야 한다면 필수. 아직 학과가 정해지지 않은 학생도 허용한다면 선택입니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s7-erd-order",
          title: "ERD 작성 순서",
          quizId: "sqld-1-1-cp-07-erd-order",
          extraQuizIds: [
                "sqld-1-1-cp-07-erd-placement"
          ],
          group: "sqld-1-1-g9-relationship",
          dialogue: [
                {
                      pose: "think",
                      text: "ERD는 선 모양만큼이나 [작성 순서]도 시험 포인트야."
                },
                {
                      pose: "lightbulb",
                      text: "순서는 엔터티 도출 → 엔터티 배치 → 관계 설정 → 관계명 기술 → 관계 차수 설정 → 필수/선택사양 기술이야."
                },
                {
                      pose: "happy",
                      text: "줄여서 [도배설명차선]으로 외우자!"
                },
                {
                      pose: "think",
                      text: "배치도 중요해. 핵심 엔터티는 왼쪽 상단 쪽에 두고, 추가로 생기는 엔터티는 우측이나 하단으로 뻗게 배치하면 관계선이 덜 꼬여."
                },
                {
                      pose: "idle",
                      text: "ERD 작성 순서를 확인해보자."
                }
          ],
          blocks: [
                {
                      kind: "table",
                      title: "ERD 작성 순서",
                      headers: [
                            "순서",
                            "작업",
                            "확인할 것"
                      ],
                      rows: [
                            [
                                  "1",
                                  "엔터티 도출",
                                  "관리할 대상 찾기"
                            ],
                            [
                                  "2",
                                  "엔터티 배치",
                                  "중요 엔터티를 왼쪽 상단 쪽에 배치"
                            ],
                            [
                                  "3",
                                  "관계 설정",
                                  "연결되는 엔터티 찾기"
                            ],
                            [
                                  "4",
                                  "관계명 기술",
                                  "수강한다, 주문한다 같은 이름 붙이기"
                            ],
                            [
                                  "5",
                                  "관계 차수 설정",
                                  "1:1, 1:N, M:N"
                            ],
                            [
                                  "6",
                                  "필수/선택사양 기술",
                                  "반드시 필요한지, 없어도 되는지"
                            ]
                      ]
                },
                {
                      kind: "callout",
                      tone: "mnemonic",
                      title: "도배설명차선",
                      body: "도출, 배치, 설정, 명명, 차수, 선택사양의 앞글자를 이어 붙인 암기어입니다. 실제 개념은 순서와 각 단계의 의미입니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s7-bridge",
          title: "M:N과 교차 엔터티",
          quizId: "sqld-1-1-cp-07-bridge",
          group: "sqld-1-1-g9-relationship",
          dialogue: [
                {
                      pose: "think",
                      text: "관계형 DB는 [M:N]을 그대로 두기 어렵기 때문에 중간 엔터티를 넣어 풀어."
                },
                {
                      pose: "lightbulb",
                      text: "학생 M:N 과목 → 학생 1:M [수강신청] M:1 과목."
                },
                {
                      pose: "happy",
                      text: "이 중간의 수강신청이 [교차 엔터티]야."
                },
                {
                      pose: "idle",
                      text: "교차 엔터티가 필요한 상황을 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "M:N 관계는 중간에 교차 엔터티를 넣어 두 개의 1:M 관계로 바꿉니다."
                },
                {
                      kind: "example",
                      title: "쉬운 예시",
                      body: "학생은 여러 과목을 듣고, 과목도 여러 학생이 듣습니다. 그래서 “수강신청” 엔터티를 넣어 학생-수강신청-과목으로 풀어냅니다."
                },
                {
                      kind: "callout",
                      tone: "tip",
                      title: "왜 필요할까",
                      body: "교차 엔터티에는 신청일, 성적, 상태처럼 관계 자체의 속성을 담을 수 있습니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s8",
          title: "식별자란 무엇인가",
          quizId: "sqld-1-1-cp-08",
          group: "sqld-1-1-g10-identifiers",
          dialogue: [
                {
                      pose: "wave",
                      text: "[식별자]는 인스턴스를 구분하는 값이야."
                },
                {
                      pose: "think",
                      text: "학생 테이블에서 학번이 다르면 누구인지 구분할 수 있지? 이런 역할이 식별자야."
                },
                {
                      pose: "lightbulb",
                      text: "시험에서는 식별자 분류와 주식별자 요건을 자주 물어봐."
                },
                {
                      pose: "idle",
                      text: "식별자의 역할을 확인해보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "식별자는 엔터티 안의 각 인스턴스를 서로 구분할 수 있게 해주는 속성 또는 속성 묶음입니다."
                },
                {
                      kind: "example",
                      title: "학생 예시",
                      body: "학번이 20260001이면 특정 학생 한 명을 가리킬 수 있습니다. 그래서 학번은 학생 엔터티의 식별자가 될 수 있습니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s8-types",
          title: "식별자 4가지 분류",
          quizId: "sqld-1-1-cp-08-types",
          extraQuizIds: [
                "sqld-1-1-cp-08-types-internal-external",
                "sqld-1-1-cp-08-types-single-composite",
                "sqld-1-1-cp-08-types-natural-surrogate"
          ],
          group: "sqld-1-1-g10-identifiers",
          dialogue: [
                {
                      pose: "think",
                      text: "식별자는 4가지 기준으로 나눠."
                },
                {
                      pose: "lightbulb",
                      text: "[주식별자/보조식별자]\n[내부식별자/외부식별자]\n[단일식별자/복합식별자]\n[본질식별자/인조식별자]"
                },
                {
                      pose: "happy",
                      text: "먼저 [주식별자/보조식별자]부터 알아보자!"
                },
                {
                      pose: "think",
                      text: "[주식별자]는 대표로 고른 식별자, [보조식별자]는 대표는 아니지만 찾는 데 도움 되는 식별자야."
                },
                {
                      pose: "lightbulb",
                      text: "[내부식별자/외부식별자]는 그 값이 어디서 왔는지 보는 기준이야."
                },
                {
                      pose: "happy",
                      text: "[단일식별자/복합식별자]는 속성 하나로 구분하는지, 여러 속성을 묶어 구분하는지 보는 기준이야."
                },
                {
                      pose: "think",
                      text: "[본질식별자/인조식별자]는 업무에 원래 있던 값인지, 시스템이 새로 만든 값인지 보는 기준이야."
                },
                {
                      pose: "idle",
                      text: "분류 기준을 맞춰보자."
                }
          ],
          blocks: [
                {
                      kind: "table",
                      title: "식별자 분류",
                      headers: [
                            "분류",
                            "질문",
                            "예시"
                      ],
                      rows: [
                            [
                                  "주식별자/보조식별자",
                                  "대표로 선택했나?",
                                  "학번은 주식별자, 이메일은 보조식별자 후보"
                            ],
                            [
                                  "내부식별자/외부식별자",
                                  "값이 어디서 왔나?",
                                  "주문ID는 내부, 고객ID는 외부에서 온 식별자"
                            ],
                            [
                                  "단일식별자/복합식별자",
                                  "속성 몇 개로 구분하나?",
                                  "학번 하나면 단일, 학번+과목ID면 복합"
                            ],
                            [
                                  "본질식별자/인조식별자",
                                  "업무 자연값인가 시스템 생성값인가?",
                                  "학번은 본질, 자동 증가 ID는 인조"
                            ]
                      ]
                }
          ]
    },
    {
          id: "sqld-1-1-s8-main",
          title: "주식별자 4요건",
          quizId: "sqld-1-1-cp-08-main",
          group: "sqld-1-1-g10-identifiers",
          dialogue: [
                {
                      pose: "think",
                      text: "주식별자는 아무 값이나 고르면 안 돼."
                },
                {
                      pose: "lightbulb",
                      text: "[유일성]·[최소성]·[불변성]·[존재성]. 줄여서 [유최불존]."
                },
                {
                      pose: "happy",
                      text: "특히 존재성은 NULL이면 안 된다는 뜻이야."
                },
                {
                      pose: "idle",
                      text: "주식별자 요건이 아닌 것을 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "keypoints",
                      title: "주식별자 4요건",
                      items: [
                            "유일성 — 한 인스턴스를 딱 하나로 구분",
                            "최소성 — 필요한 속성만 사용",
                            "불변성 — 값이 자주 바뀌지 않음",
                            "존재성 — NULL 불가"
                      ]
                },
                {
                      kind: "callout",
                      tone: "mnemonic",
                      title: "유최불존",
                      body: "유일성, 최소성, 불변성, 존재성. “의미성”은 4요건이 아닙니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s9",
          title: "식별자 관계",
          quizId: "sqld-1-1-cp-09",
          group: "sqld-1-1-g11-id-relations",
          dialogue: [
                {
                      pose: "think",
                      text: "[식별자 관계]는 부모 엔터티의 식별자가 자식 엔터티의 [PK] 안으로 들어가는 관계야."
                },
                {
                      pose: "lightbulb",
                      text: "예를 들어 수강신청을 [학번] + [과목코드]로 구분한다고 해보자."
                },
                {
                      pose: "happy",
                      text: "이때 학번은 학생의 PK, 과목코드는 과목의 PK야.\n두 부모의 PK가 모여 수강신청의 PK가 되는 거지."
                },
                {
                      pose: "think",
                      text: "그래서 식별자 관계는 강한 연결 관계야.\n부모 키가 없으면 자식의 PK도 완성되지 않아."
                },
                {
                      pose: "lightbulb",
                      text: "자식 PK에 들어간 부모 키는 비어 있으면 안 돼.\n시험에서는 생명주기를 함께 가진다는 표현도 자주 나와."
                },
                {
                      pose: "idle",
                      text: "수강신청 예시에서 식별자 관계를 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "식별자 관계에서는 부모 엔터티의 주식별자가 자식 엔터티의 주식별자에 포함됩니다. 자식은 부모 키를 빌려 자기 PK를 완성합니다."
                },
                {
                      kind: "example",
                      title: "수강신청 예시",
                      body: "수강신청이 (학번, 과목코드)로 식별된다면 학생의 학번과 과목의 과목코드가 자식 엔터티인 수강신청의 PK 일부가 됩니다."
                },
                {
                      kind: "callout",
                      tone: "warn",
                      title: "시험 포인트",
                      body: "부모 PK가 자식 PK에 포함되면 식별자 관계입니다. 이때 부모 키는 자식 PK의 일부라서 NULL이면 안 됩니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s9-nonident",
          title: "비식별자 관계",
          quizId: "sqld-1-1-cp-09-nonident",
          group: "sqld-1-1-g11-id-relations",
          dialogue: [
                {
                      pose: "think",
                      text: "[비식별자 관계]에서는 부모의 식별자가 자식에게 오긴 하지만, 자식의 PK 안으로 들어가지는 않아."
                },
                {
                      pose: "lightbulb",
                      text: "자식은 자기 PK를 따로 가지고, 부모 값은 [FK]로만 참조하는 구조야."
                },
                {
                      pose: "happy",
                      text: "예를 들어 주문은 주문ID로 구분하고, 고객ID는 주문의 일반 속성/FK로만 두는 식이야."
                },
                {
                      pose: "think",
                      text: "그래서 비식별자 관계는 약한 연결 관계라고도 해.\n부모와 자식의 생명주기를 따로 관리하기 쉬워."
                },
                {
                      pose: "lightbulb",
                      text: "단, 선택/필수 여부와 PK 포함 여부는 구분해야 해.\n시험 핵심은 부모 키가 자식 PK에 들어가지 않는다는 점이야."
                },
                {
                      pose: "idle",
                      text: "주문 예시에서 비식별자 관계를 골라보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "비식별자 관계에서는 부모의 식별자가 자식의 주식별자에 포함되지 않고, 일반 속성 또는 외래키로만 존재합니다."
                },
                {
                      kind: "example",
                      title: "주문 예시",
                      body: "주문ID가 주문의 PK이고 고객ID는 FK라면, 주문은 고객을 참조하지만 주문ID만으로도 주문을 구분할 수 있습니다."
                },
                {
                      kind: "callout",
                      tone: "warn",
                      title: "함정",
                      body: "비식별자 관계는 부모 키가 자식 PK에 포함되지 않는다는 뜻입니다. 관계가 필수인지 선택인지는 업무 규칙에 따라 별도로 판단합니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s9-compare",
          title: "식별자 vs 비식별자 비교",
          quizId: "sqld-1-1-cp-09-compare",
          group: "sqld-1-1-g11-id-relations",
          dialogue: [
                {
                      pose: "think",
                      text: "둘을 구분하는 핵심은 부모 식별자가 [자식 PK에 들어가느냐]야."
                },
                {
                      pose: "lightbulb",
                      text: "들어가면 식별자 관계, FK로만 있으면 비식별자 관계."
                },
                {
                      pose: "happy",
                      text: "IE 표기에서는 보통 식별자 관계는 실선, 비식별자 관계는 점선으로 본다."
                },
                {
                      pose: "idle",
                      text: "두 관계를 비교해보자."
                }
          ],
          blocks: [
                {
                      kind: "table",
                      title: "관계 비교",
                      headers: [
                            "구분",
                            "식별자 관계",
                            "비식별자 관계"
                      ],
                      rows: [
                            [
                                  "부모 식별자 위치",
                                  "자식 PK 일부",
                                  "자식 일반 속성/FK"
                            ],
                            [
                                  "관계 강도",
                                  "강함",
                                  "상대적으로 약함"
                            ],
                            [
                                  "표기 감각",
                                  "실선",
                                  "점선"
                            ]
                      ]
                },
                {
                      kind: "callout",
                      tone: "warn",
                      title: "함정",
                      body: "식별자 관계라고 해서 항상 1:1만 되는 것은 아닙니다. 1:M도 가능합니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s10",
          title: "키 5종",
          quizId: "sqld-1-1-cp-10",
          group: "sqld-1-1-g12-keys-integrity",
          dialogue: [
                {
                      pose: "wave",
                      text: "[키]는 행을 찾거나 연결하기 위한 속성이야."
                },
                {
                      pose: "think",
                      text: "후보키, 기본키, 대체키, 슈퍼키, 외래키를 구분해야 해."
                },
                {
                      pose: "lightbulb",
                      text: "기본키는 대표로 선택된 후보키, 외래키는 다른 테이블을 참조하는 키야."
                },
                {
                      pose: "idle",
                      text: "키의 종류를 확인해보자."
                }
          ],
          blocks: [
                {
                      kind: "table",
                      title: "키 5종",
                      headers: [
                            "키",
                            "뜻"
                      ],
                      rows: [
                            [
                                  "후보키",
                                  "유일성과 최소성을 만족하는 키 후보"
                            ],
                            [
                                  "기본키",
                                  "후보키 중 대표로 선택한 키"
                            ],
                            [
                                  "대체키",
                                  "선택되지 않은 후보키"
                            ],
                            [
                                  "슈퍼키",
                                  "유일성은 있지만 최소성은 없을 수 있음"
                            ],
                            [
                                  "외래키",
                                  "다른 테이블의 키를 참조"
                            ]
                      ]
                }
          ]
    },
    {
          id: "sqld-1-1-s10-integrity",
          title: "무결성 3종",
          quizId: "sqld-1-1-cp-10-integrity",
          group: "sqld-1-1-g12-keys-integrity",
          dialogue: [
                {
                      pose: "think",
                      text: "[무결성]은 DB 안의 데이터가 약속한 규칙을 계속 지키는 상태야."
                },
                {
                      pose: "lightbulb",
                      text: "예를 들어 학생 표에서 학번이 비어 있거나 중복되면 한 학생을 정확히 찾을 수 없겠지?"
                },
                {
                      pose: "happy",
                      text: "또 수강 테이블의 학번이 실제 학생 표에 없다면 연결이 끊긴 데이터가 돼."
                },
                {
                      pose: "lightbulb",
                      text: "그래서 [개체 무결성]은 PK, [참조 무결성]은 FK, [도메인 무결성]은 값 범위를 지켜."
                },
                {
                      pose: "idle",
                      text: "이제 무결성 종류를 맞춰보자."
                }
          ],
          blocks: [
                {
                      kind: "intro",
                      body: "무결성은 데이터가 정확하고 일관된 상태를 유지하도록 DB가 지키는 규칙입니다. 저장하거나 수정하거나 삭제할 때도 이 규칙이 깨지면 안 됩니다."
                },
                {
                      kind: "example",
                      title: "학생 DB 예시",
                      body: "학번이 비어 있으면 학생 한 명을 구분할 수 없습니다. 수강 기록이 없는 학번을 가리키면 학생과 수강 기록의 연결도 깨집니다. 학년 칸에 99가 들어가도 현실과 맞지 않습니다."
                },
                {
                      kind: "keypoints",
                      title: "무결성은 무엇을 지킬까?",
                      items: [
                            "개체 무결성: 한 행을 구분하는 PK가 비거나 중복되지 않게 지킴",
                            "참조 무결성: FK가 실제로 존재하는 부모 행을 가리키게 지킴",
                            "도메인 무결성: 값이 허용된 범위와 형식 안에 들어오게 지킴"
                      ]
                },
                {
                      kind: "table",
                      title: "무결성 3종",
                      headers: [
                            "무결성",
                            "지키는 것",
                            "예시"
                      ],
                      rows: [
                            [
                                  "개체 무결성",
                                  "PK는 NULL 불가·중복 불가",
                                  "학번이 비거나 겹치면 안 됨"
                            ],
                            [
                                  "참조 무결성",
                                  "FK는 실제 부모를 참조",
                                  "없는 학번을 수강 기록에 쓰면 안 됨"
                            ],
                            [
                                  "도메인 무결성",
                                  "속성 값은 허용 범위 안",
                                  "학년은 1~4 같은 범위 안"
                            ]
                      ]
                },
                {
                      kind: "callout",
                      tone: "mnemonic",
                      title: "PK · FK · 값 범위",
                      body: "문제에서 PK가 나오면 개체 무결성, FK가 나오면 참조 무결성, 값의 범위나 형식이 나오면 도메인 무결성을 떠올리면 됩니다."
                }
          ]
    },
    {
          id: "sqld-1-1-s10-pk-unique",
          title: "PK와 UNIQUE 차이",
          quizId: "sqld-1-1-cp-10-pk-unique",
          group: "sqld-1-1-g12-keys-integrity",
          dialogue: [
                {
                      pose: "think",
                      text: "PK와 UNIQUE는 둘 다 중복을 막지만 완전히 같지는 않아."
                },
                {
                      pose: "lightbulb",
                      text: "PK는 [NULL 불가]이고 테이블 대표 키야. UNIQUE는 중복만 막는 보조 규칙에 가까워."
                },
                {
                      pose: "happy",
                      text: "테이블에는 보통 PK 하나, UNIQUE는 여러 개 둘 수 있어."
                },
                {
                      pose: "idle",
                      text: "PK와 UNIQUE 차이를 확인해보자."
                }
          ],
          blocks: [
                {
                      kind: "table",
                      title: "PK vs UNIQUE",
                      headers: [
                            "구분",
                            "PK",
                            "UNIQUE"
                      ],
                      rows: [
                            [
                                  "NULL",
                                  "허용하지 않음",
                                  "DBMS에 따라 NULL 허용 가능"
                            ],
                            [
                                  "역할",
                                  "테이블 대표 식별자",
                                  "중복 방지 제약"
                            ],
                            [
                                  "개수",
                                  "테이블당 하나",
                                  "여러 개 가능"
                            ]
                      ]
                },
                {
                      kind: "callout",
                      tone: "tip",
                      title: "시험 감각",
                      body: "PK는 개체 무결성의 핵심입니다. UNIQUE만으로는 PK와 같은 의미가 아닙니다."
                }
          ]
    }
  ],
};

const SQLD_1_2: Lesson = {
  id: "sqld-1-2",
  subject: "sqld",
  chapter: 1,
  chapterTitle: "데이터 모델링의 이해",
  topic: "데이터 모델과 성능",
  title: "정규화·성능·트랜잭션·NULL",
  hook: "중복 때문에 생기는 문제를 정규화로 줄이고, 성능이 필요할 때만 신중하게 보정한다.",
  estimatedMinutes: 42,
  steps: [
    {
      id: "sqld-1-2-s1",
      title: "이상 현상이란",
      quizId: "sqld-1-2-cp-01",
      group: "sqld-1-2-g1-anomaly",
      dialogue: [
        {
          pose: "wave",
          text: "[이상 현상]은 한 표에 너무 많은 정보를 섞어 놓았을 때 생기는 문제야."
        },
        {
          pose: "think",
          text: "학생 정보, 학과 정보, 수강 정보를 한 표에 몰아넣으면 같은 학과명이 계속 반복될 수 있어."
        },
        {
          pose: "lightbulb",
          text: "그 반복 때문에 데이터를 넣을 때, 지울 때, 고칠 때 사고가 생겨."
        },
        {
          pose: "idle",
          text: "세부 유형은 바로 다음 카드에서 하나씩 볼 거야. 먼저 왜 생기는지부터 잡아보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "이상 현상은 중복된 데이터 때문에 삽입·삭제·갱신 과정에서 생기는 부작용입니다."
        },
        {
          kind: "keypoints",
          title: "핵심 원인",
          items: [
            "한 표에 서로 다른 정보를 너무 많이 섞음",
            "같은 값이 여러 행에 반복됨",
            "데이터를 넣거나 지우거나 고칠 때 사고가 생김"
          ]
        },
        {
          kind: "callout",
          tone: "mnemonic",
          title: "먼저 원인부터",
          body: "삽입·삭제·갱신 이상은 뒤에서 하나씩 따로 봅니다. 지금은 “중복이 문제를 만든다”는 흐름만 잡으면 됩니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s1-insert",
      title: "삽입 이상",
      quizId: "sqld-1-2-cp-01-insert",
      group: "sqld-1-2-g1-anomaly",
      dialogue: [
        {
          pose: "think",
          text: "[삽입 이상]은 넣고 싶은 정보만 따로 넣지 못하는 문제야."
        },
        {
          pose: "lightbulb",
          text: "예를 들어 신설 학과만 등록하고 싶은데, 그 학과 학생 정보까지 있어야 저장된다면 이상하지?"
        },
        {
          pose: "happy",
          text: "정보가 서로 과하게 묶여 있어서 생기는 문제야."
        },
        {
          pose: "idle",
          text: "삽입 이상 예시를 골라보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "삽입 이상은 새 데이터를 넣을 때 원하지 않는 다른 데이터까지 함께 요구되는 문제입니다."
        },
        {
          kind: "example",
          title: "학교 예시",
          body: "“AI데이터학과”를 새로 만들었는데 아직 학생이 없습니다. 그런데 학생 행이 없으면 학과를 저장할 수 없다면 삽입 이상입니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s1-delete",
      title: "삭제 이상",
      quizId: "sqld-1-2-cp-01-delete",
      group: "sqld-1-2-g1-anomaly",
      dialogue: [
        {
          pose: "think",
          text: "[삭제 이상]은 지우려던 데이터와 함께 남겨야 할 정보까지 사라지는 문제야."
        },
        {
          pose: "lightbulb",
          text: "마지막 학생 행을 지웠더니 그 학생의 학과 정보까지 같이 사라지는 장면을 떠올려봐."
        },
        {
          pose: "idle",
          text: "삭제 이상에 맞는 예시를 찾아보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "삭제 이상은 데이터를 삭제했을 때 보존해야 할 정보가 함께 없어지는 문제입니다."
        },
        {
          kind: "example",
          title: "학교 예시",
          body: "마지막 재학생을 지웠을 뿐인데 학과명, 학과 사무실, 학과 전화번호까지 알 수 없게 되면 삭제 이상입니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s1-update",
      title: "갱신 이상",
      quizId: "sqld-1-2-cp-01-update",
      group: "sqld-1-2-g1-anomaly",
      dialogue: [
        {
          pose: "think",
          text: "[갱신 이상]은 같은 정보를 여러 곳에서 고치다가 일부만 바뀌는 문제야."
        },
        {
          pose: "lightbulb",
          text: "학과명이 100행에 반복되어 있으면 이름을 바꿀 때 100행을 전부 고쳐야 해."
        },
        {
          pose: "happy",
          text: "한 행이라도 놓치면 같은 학과가 두 이름으로 남아 모순이 생겨."
        },
        {
          pose: "idle",
          text: "갱신 이상 상황을 골라보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "갱신 이상은 중복된 값을 일부만 수정해서 데이터가 서로 맞지 않게 되는 문제입니다."
        },
        {
          kind: "example",
          title: "학교 예시",
          body: "“컴퓨터공학과”를 “AI소프트웨어학과”로 바꿨는데 일부 행만 바뀌면 같은 학과가 두 이름으로 남습니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s2",
      title: "함수적 종속이란",
      quizId: "sqld-1-2-cp-02",
      group: "sqld-1-2-g2-fd",
      dialogue: [
        {
          pose: "wave",
          text: "[함수적 종속]은 A를 알면 B가 하나로 정해지는 관계야."
        },
        {
          pose: "think",
          text: "학번을 알면 학생 이름이 하나로 정해지는 것처럼 말이야."
        },
        {
          pose: "lightbulb",
          text: "표기는 [학번 → 이름]처럼 써. 왼쪽은 결정자, 오른쪽은 종속자라고 불러."
        },
        {
          pose: "idle",
          text: "함수적 종속의 의미를 확인해보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "함수적 종속은 어떤 속성 값이 정해지면 다른 속성 값이 하나로 정해지는 관계입니다."
        },
        {
          kind: "table",
          title: "읽는 법",
          headers: [
            "표현",
            "뜻"
          ],
          rows: [
            [
              "학번 → 이름",
              "학번을 알면 이름이 정해짐"
            ],
            [
              "과목코드 → 과목명",
              "과목코드를 알면 과목명이 정해짐"
            ]
          ]
        }
      ]
    },
    {
      id: "sqld-1-2-s2-full",
      title: "완전 함수 종속",
      quizId: "sqld-1-2-cp-02-full",
      group: "sqld-1-2-g2-fd",
      dialogue: [
        {
          pose: "think",
          text: "[완전 함수 종속]은 복합키 전체가 있어야 값이 결정되는 경우야."
        },
        {
          pose: "lightbulb",
          text: "수강성적은 학번만 알아도 부족하고, 과목코드만 알아도 부족해."
        },
        {
          pose: "happy",
          text: "학번 + 과목코드를 함께 알아야 성적이 정해지면 완전 종속이야."
        },
        {
          pose: "idle",
          text: "완전 함수 종속 예시를 골라보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "완전 함수 종속은 복합키 전체에 종속되는 상태입니다."
        },
        {
          kind: "example",
          title: "성적 예시",
          body: "수강성적 테이블의 PK가 학번+과목코드일 때, 성적은 두 값을 모두 알아야 결정됩니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s2-partial",
      title: "부분 함수 종속",
      quizId: "sqld-1-2-cp-02-partial",
      group: "sqld-1-2-g2-fd",
      dialogue: [
        {
          pose: "think",
          text: "[부분 함수 종속]은 복합키 중 일부만으로 값이 결정되는 경우야."
        },
        {
          pose: "lightbulb",
          text: "PK가 학번+과목코드인데 학생이름은 학번만 알아도 정해져."
        },
        {
          pose: "happy",
          text: "이런 값은 수강 테이블에 계속 두면 중복이 늘어나. 그래서 분리해야 해."
        },
        {
          pose: "idle",
          text: "부분 함수 종속을 찾아보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "부분 함수 종속은 복합키 전체가 아니라 일부 키에만 매달린 속성이 있는 상태입니다."
        },
        {
          kind: "callout",
          tone: "tip",
          title: "2NF와 연결",
          body: "부분 함수 종속을 제거하는 단계가 제2정규형(2NF)입니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s2-transitive",
      title: "이행 함수 종속",
      quizId: "sqld-1-2-cp-02-transitive",
      group: "sqld-1-2-g2-fd",
      dialogue: [
        {
          pose: "think",
          text: "[이행 함수 종속]은 A가 B를 정하고, B가 C를 정해서 A가 C까지 간접으로 정해지는 구조야."
        },
        {
          pose: "lightbulb",
          text: "학번 → 학과코드 → 학과명 흐름을 떠올리면 쉬워."
        },
        {
          pose: "happy",
          text: "학과명은 학생이 아니라 학과코드 쪽에 붙어 있는 정보지."
        },
        {
          pose: "idle",
          text: "이행 함수 종속 예시를 골라보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "이행 함수 종속은 중간 속성을 한 번 거쳐서 결정되는 종속입니다."
        },
        {
          kind: "example",
          title: "학교 예시",
          body: "학번을 알면 학과코드를 알고, 학과코드를 알면 학과명을 알 수 있습니다. 이때 학과명은 학번에 간접으로 종속됩니다."
        },
        {
          kind: "callout",
          tone: "tip",
          title: "3NF와 연결",
          body: "이행 함수 종속을 제거하는 단계가 제3정규형(3NF)입니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s3",
      title: "정규형 순서",
      quizId: "sqld-1-2-cp-03",
      group: "sqld-1-2-g3-normal-forms",
      dialogue: [
        {
          pose: "wave",
          text: "[정규형]은 테이블을 더 안전하고 깔끔하게 만드는 단계야."
        },
        {
          pose: "think",
          text: "1NF → 2NF → 3NF → BCNF 순서로 조건이 점점 강해져."
        },
        {
          pose: "lightbulb",
          text: "암기: [도·부·이·결]."
        },
        {
          pose: "idle",
          text: "정규형 순서를 확인해보자."
        }
      ],
      blocks: [
        {
          kind: "table",
          title: "정규형 흐름",
          headers: [
            "단계",
            "핵심"
          ],
          rows: [
            [
              "1NF",
              "값을 하나씩만 둠"
            ],
            [
              "2NF",
              "부분 종속 제거"
            ],
            [
              "3NF",
              "이행 종속 제거"
            ],
            [
              "BCNF",
              "결정자=후보키"
            ]
          ]
        },
        {
          kind: "callout",
          tone: "mnemonic",
          title: "도·부·이·결",
          body: "도메인 원자값, 부분 종속 제거, 이행 종속 제거, 결정자=후보키."
        }
      ]
    },
    {
      id: "sqld-1-2-s3-1nf",
      title: "1NF",
      quizId: "sqld-1-2-cp-03-1nf",
      group: "sqld-1-2-g3-normal-forms",
      dialogue: [
        {
          pose: "think",
          text: "[1NF]는 한 칸에 하나의 값만 두는 단계야."
        },
        {
          pose: "lightbulb",
          text: "전화번호 칸에 “010-1111, 010-2222”처럼 두 값을 같이 넣으면 1NF에 어긋나."
        },
        {
          pose: "idle",
          text: "1NF 위반 예시를 골라보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "제1정규형은 속성 값이 원자값이어야 한다는 조건입니다."
        },
        {
          kind: "example",
          title: "나쁜 예시",
          body: "전화번호 컬럼 하나에 집전화와 휴대폰을 함께 적으면 검색과 수정이 어려워집니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s3-2nf",
      title: "2NF",
      quizId: "sqld-1-2-cp-03-2nf",
      group: "sqld-1-2-g3-normal-forms",
      dialogue: [
        {
          pose: "think",
          text: "[2NF]는 복합키 일부에만 매달린 값을 떼어내는 단계야."
        },
        {
          pose: "lightbulb",
          text: "PK가 학번+과목코드인데 학생이름은 학번만으로 정해지면 학생 테이블로 분리하는 게 자연스러워."
        },
        {
          pose: "idle",
          text: "2NF에서 제거해야 할 것을 골라보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "제2정규형은 부분 함수 종속을 제거한 상태입니다."
        },
        {
          kind: "callout",
          tone: "warn",
          title: "등장 조건",
          body: "2NF 문제는 주로 복합키가 있는 테이블에서 나옵니다. 단일키만 있으면 부분 종속을 묻기 어렵습니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s3-3nf",
      title: "3NF",
      quizId: "sqld-1-2-cp-03-3nf",
      group: "sqld-1-2-g3-normal-forms",
      dialogue: [
        {
          pose: "think",
          text: "[3NF]는 기본키가 아닌 속성끼리 이어진 간접 종속을 줄이는 단계야."
        },
        {
          pose: "lightbulb",
          text: "학생 테이블에 학과코드와 학과명이 같이 있으면 학과코드가 학과명을 정해."
        },
        {
          pose: "happy",
          text: "학과명은 학과 테이블로 보내면 중복과 갱신 이상이 줄어들어."
        },
        {
          pose: "idle",
          text: "3NF에서 제거해야 할 것을 골라보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "제3정규형은 이행 함수 종속을 제거한 상태입니다."
        },
        {
          kind: "example",
          title: "분리 감각",
          body: "학생(학번, 이름, 학과코드) / 학과(학과코드, 학과명)처럼 나누면 학과명이 여러 번 반복되지 않습니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s3-bcnf",
      title: "BCNF",
      quizId: "sqld-1-2-cp-03-bcnf",
      group: "sqld-1-2-g3-normal-forms",
      dialogue: [
        {
          pose: "think",
          text: "[BCNF]는 3NF보다 더 엄격한 정규형이야."
        },
        {
          pose: "lightbulb",
          text: "핵심은 “무언가를 결정하는 속성은 후보키여야 한다”는 말이야."
        },
        {
          pose: "happy",
          text: "시험에서는 [모든 결정자가 후보키] 문장을 보면 BCNF를 떠올리면 돼."
        },
        {
          pose: "idle",
          text: "BCNF 조건을 확인해보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "BCNF는 모든 결정자가 후보키인 상태입니다."
        },
        {
          kind: "table",
          title: "용어 감각",
          headers: [
            "용어",
            "쉬운 뜻"
          ],
          rows: [
            [
              "결정자",
              "다른 값을 정하는 속성"
            ],
            [
              "후보키",
              "행을 유일하게 구분할 수 있는 키"
            ]
          ]
        }
      ]
    },
    {
      id: "sqld-1-2-s4",
      title: "반정규화란",
      quizId: "sqld-1-2-cp-04",
      group: "sqld-1-2-g4-denormalization",
      dialogue: [
        {
          pose: "wave",
          text: "[반정규화]는 조회 성능을 위해 일부러 중복을 허용하는 선택이야."
        },
        {
          pose: "think",
          text: "정규화가 원칙이라면, 반정규화는 실제 서비스 속도를 위한 현실 보정이야."
        },
        {
          pose: "lightbulb",
          text: "단, 처음부터 막 하는 게 아니라 조회 병목을 확인한 뒤 고려해."
        },
        {
          pose: "idle",
          text: "반정규화를 고려할 상황을 골라보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "반정규화는 정규화된 테이블을 일부러 합치거나 값을 중복시켜 조회 성능을 높이는 방법입니다."
        },
        {
          kind: "callout",
          tone: "warn",
          title: "먼저 측정",
          body: "반정규화는 성능 문제가 확인된 뒤 적용하는 최적화입니다. 무작정 중복시키면 관리 부담만 커질 수 있습니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s4-methods",
      title: "반정규화 방법",
      quizId: "sqld-1-2-cp-04-methods",
      group: "sqld-1-2-g4-denormalization",
      dialogue: [
        {
          pose: "think",
          text: "반정규화 방법은 크게 합치기, 중복하기, 미리 계산하기로 볼 수 있어."
        },
        {
          pose: "lightbulb",
          text: "매번 JOIN하는 고객명을 주문 테이블에 복사하거나, 총주문금액을 미리 저장하는 식이야."
        },
        {
          pose: "idle",
          text: "반정규화 방법을 골라보자."
        }
      ],
      blocks: [
        {
          kind: "table",
          title: "대표 방법",
          headers: [
            "방법",
            "예시"
          ],
          rows: [
            [
              "테이블 통합",
              "자주 같이 보는 1:1 테이블 합치기"
            ],
            [
              "컬럼 중복",
              "주문에 고객명 사본 저장"
            ],
            [
              "파생 컬럼",
              "총주문금액 미리 저장"
            ],
            [
              "요약 테이블",
              "월별 매출 집계 테이블"
            ]
          ]
        }
      ]
    },
    {
      id: "sqld-1-2-s4-tradeoff",
      title: "반정규화의 대가",
      quizId: "sqld-1-2-cp-04-tradeoff",
      group: "sqld-1-2-g4-denormalization",
      dialogue: [
        {
          pose: "think",
          text: "반정규화는 조회를 빠르게 만들 수 있지만 공짜는 아니야."
        },
        {
          pose: "lightbulb",
          text: "같은 값이 여러 곳에 있으면 수정할 때 모두 맞춰야 해."
        },
        {
          pose: "happy",
          text: "그래서 갱신 부담, 저장 공간 증가, 일관성 리스크가 대가야."
        },
        {
          pose: "idle",
          text: "반정규화의 단점을 확인해보자."
        }
      ],
      blocks: [
        {
          kind: "keypoints",
          title: "대가",
          items: [
            "수정할 곳이 늘어남",
            "일부만 바뀌면 값이 서로 달라짐",
            "저장 공간이 늘어남",
            "동기화 로직이 복잡해짐"
          ]
        }
      ]
    },
    {
      id: "sqld-1-2-s5",
      title: "특수 관계란",
      quizId: "sqld-1-2-cp-05",
      group: "sqld-1-2-g5-special-relations",
      dialogue: [
        {
          pose: "wave",
          text: "모든 관계가 단순한 1:M만 있는 건 아니야."
        },
        {
          pose: "think",
          text: "같은 엔터티가 자기 자신을 참조하거나, 여러 후보 중 하나만 선택되는 관계도 있어."
        },
        {
          pose: "lightbulb",
          text: "계층형·순환 관계와 상호배타 관계를 구분하면 돼."
        },
        {
          pose: "idle",
          text: "특수 관계의 기본 예시를 확인해보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "특수 관계는 일반적인 1:M 관계보다 구조를 한 번 더 생각해야 하는 관계 패턴입니다."
        },
        {
          kind: "table",
          title: "대표 패턴",
          headers: [
            "패턴",
            "쉬운 예시"
          ],
          rows: [
            [
              "계층형/순환",
              "사원과 상사처럼 같은 엔터티를 다시 참조"
            ],
            [
              "상호배타",
              "결제수단처럼 여러 후보 중 하나만 선택"
            ]
          ]
        }
      ]
    },
    {
      id: "sqld-1-2-s5-hierarchy",
      title: "계층형·순환 관계",
      quizId: "sqld-1-2-cp-05-hierarchy",
      group: "sqld-1-2-g5-special-relations",
      dialogue: [
        {
          pose: "think",
          text: "[계층형 관계]는 위아래 구조를 가진 데이터야."
        },
        {
          pose: "lightbulb",
          text: "사원과 상사, 카테고리와 상위 카테고리처럼 같은 테이블이 자기 자신을 참조해."
        },
        {
          pose: "happy",
          text: "SQL에서는 셀프 조인이나 Oracle의 CONNECT BY로 다루는 경우가 많아."
        },
        {
          pose: "idle",
          text: "계층형 관계 예시를 골라보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "계층형 또는 순환 관계는 같은 엔터티 안에서 부모-자식처럼 연결되는 구조입니다."
        },
        {
          kind: "example",
          title: "사원 예시",
          body: "사원 테이블에 상사사번 컬럼이 있고, 그 값이 다시 사원 테이블의 사번을 참조하면 계층형 관계입니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s5-exclusive",
      title: "상호배타 관계",
      quizId: "sqld-1-2-cp-05-exclusive",
      group: "sqld-1-2-g5-special-relations",
      dialogue: [
        {
          pose: "think",
          text: "[상호배타 관계]는 여러 후보 중 하나만 선택되는 관계야."
        },
        {
          pose: "lightbulb",
          text: "결제는 카드 결제이거나 계좌이체일 수 있지만, 한 결제 건이 동시에 둘 다일 수는 없게 잡을 수 있어."
        },
        {
          pose: "idle",
          text: "상호배타 관계 예시를 골라보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "상호배타 관계는 하나의 인스턴스가 여러 부모 후보 중 하나와만 연결되는 구조입니다."
        },
        {
          kind: "example",
          title: "결제 예시",
          body: "결제 건 하나가 카드 결제 또는 계좌이체 중 하나로만 처리되도록 모델링하는 경우입니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s6",
      title: "트랜잭션이란",
      quizId: "sqld-1-2-cp-06",
      group: "sqld-1-2-g6-transaction",
      dialogue: [
        {
          pose: "wave",
          text: "[트랜잭션]은 DB에서 하나로 묶어 처리해야 하는 작업 단위야."
        },
        {
          pose: "think",
          text: "계좌이체는 출금과 입금이 둘 다 성공해야 해. 하나만 성공하면 사고야."
        },
        {
          pose: "lightbulb",
          text: "그래서 전부 성공하거나 전부 취소되도록 한 덩어리로 묶어."
        },
        {
          pose: "idle",
          text: "트랜잭션의 의미를 확인해보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "트랜잭션은 여러 SQL을 하나의 논리 작업 단위로 묶어 처리하는 개념입니다."
        },
        {
          kind: "example",
          title: "계좌이체 예시",
          body: "A 계좌에서 1만원을 빼고 B 계좌에 1만원을 더하는 두 작업은 함께 성공하거나 함께 취소되어야 합니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s6-acid",
      title: "ACID 4특성",
      quizId: "sqld-1-2-cp-06-acid",
      group: "sqld-1-2-g6-transaction",
      dialogue: [
        {
          pose: "think",
          text: "트랜잭션이 안전하려면 [ACID]가 필요해."
        },
        {
          pose: "lightbulb",
          text: "원자성, 일관성, 고립성, 지속성 4가지를 말해."
        },
        {
          pose: "happy",
          text: "특히 전부 성공 또는 전부 취소는 원자성이야."
        },
        {
          pose: "idle",
          text: "ACID 특성을 맞춰보자."
        }
      ],
      blocks: [
        {
          kind: "table",
          title: "ACID",
          headers: [
            "특성",
            "쉬운 뜻"
          ],
          rows: [
            [
              "원자성",
              "전부 성공 또는 전부 취소"
            ],
            [
              "일관성",
              "제약을 지킨 상태 유지"
            ],
            [
              "고립성",
              "동시에 실행돼도 간섭 최소화"
            ],
            [
              "지속성",
              "커밋 결과는 장애 후에도 유지"
            ]
          ]
        }
      ]
    },
    {
      id: "sqld-1-2-s6-isolation",
      title: "격리수준",
      quizId: "sqld-1-2-cp-06-isolation",
      group: "sqld-1-2-g6-transaction",
      dialogue: [
        {
          pose: "think",
          text: "[격리수준]은 동시에 실행되는 트랜잭션을 얼마나 엄격하게 분리할지 정하는 단계야."
        },
        {
          pose: "lightbulb",
          text: "Read Uncommitted < Read Committed < Repeatable Read < Serializable 순서로 강해져."
        },
        {
          pose: "happy",
          text: "강할수록 안전하지만, 동시에 처리하는 성능 부담은 커질 수 있어."
        },
        {
          pose: "idle",
          text: "격리수준 순서를 확인해보자."
        }
      ],
      blocks: [
        {
          kind: "keypoints",
          title: "격리수준 순서",
          items: [
            "Read Uncommitted",
            "Read Committed",
            "Repeatable Read",
            "Serializable"
          ]
        },
        {
          kind: "callout",
          tone: "tip",
          title: "트레이드오프",
          body: "격리수준이 높을수록 일관성은 좋아지지만 동시 처리 성능은 떨어질 수 있습니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s7",
      title: "NULL이란",
      quizId: "sqld-1-2-cp-07",
      group: "sqld-1-2-g7-null",
      dialogue: [
        {
          pose: "wave",
          text: "[NULL]은 0이나 빈 문자열이 아니라 “값을 모름/없음”에 가까워."
        },
        {
          pose: "think",
          text: "0은 값이 0인 것이고, NULL은 아직 값이 없거나 알 수 없다는 뜻이야."
        },
        {
          pose: "lightbulb",
          text: "그래서 NULL 여부는 = NULL이 아니라 [IS NULL]로 확인해."
        },
        {
          pose: "idle",
          text: "NULL의 기본 성질을 확인해보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "NULL은 아직 값이 없거나 알 수 없다는 뜻입니다. 0이나 빈 문자열과 다릅니다."
        },
        {
          kind: "callout",
          tone: "warn",
          title: "비교 함정",
          body: "col = NULL은 원하는 결과를 주지 않습니다. NULL 여부는 IS NULL, IS NOT NULL로 확인합니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s7-compare",
      title: "NULL 비교와 산술",
      quizId: "sqld-1-2-cp-07-compare",
      group: "sqld-1-2-g7-null",
      dialogue: [
        {
          pose: "think",
          text: "NULL과 비교하면 결과가 TRUE/FALSE가 아니라 [UNKNOWN]이 돼."
        },
        {
          pose: "lightbulb",
          text: "NULL + 1도 NULL이야. 모르는 값에 1을 더해도 결과를 알 수 없으니까."
        },
        {
          pose: "idle",
          text: "NULL 연산 결과를 골라보자."
        }
      ],
      blocks: [
        {
          kind: "table",
          title: "NULL 연산 감각",
          headers: [
            "표현",
            "결과"
          ],
          rows: [
            [
              "NULL = NULL",
              "UNKNOWN"
            ],
            [
              "NULL <> NULL",
              "UNKNOWN"
            ],
            [
              "NULL + 1",
              "NULL"
            ],
            [
              "NULL * 0",
              "NULL"
            ]
          ]
        }
      ]
    },
    {
      id: "sqld-1-2-s7-aggregate",
      title: "NULL과 집계함수",
      quizId: "sqld-1-2-cp-07-aggregate",
      group: "sqld-1-2-g7-null",
      dialogue: [
        {
          pose: "think",
          text: "집계함수는 NULL을 다루는 방식이 중요해."
        },
        {
          pose: "lightbulb",
          text: "SUM, AVG, MIN, MAX, COUNT(컬럼)은 NULL을 제외하고 계산해."
        },
        {
          pose: "happy",
          text: "하지만 [COUNT(*)]는 행 자체를 세기 때문에 NULL이 있어도 포함해."
        },
        {
          pose: "idle",
          text: "COUNT(*)와 COUNT(컬럼)을 구분해보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "집계함수 대부분은 NULL을 제외하고 계산합니다. 단, COUNT(*)는 행 수를 세므로 NULL이 있어도 포함됩니다."
        },
        {
          kind: "example",
          title: "평균 예시",
          body: "점수 90, NULL, 80이면 AVG(점수)는 (90+80)/2입니다. NULL을 0으로 바꾸면 평균이 달라집니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s7-sort",
      title: "NULL 정렬",
      quizId: "sqld-1-2-cp-07-sort",
      group: "sqld-1-2-g7-null",
      dialogue: [
        {
          pose: "think",
          text: "NULL 정렬 위치는 DBMS마다 다를 수 있어."
        },
        {
          pose: "lightbulb",
          text: "SQLD에서는 Oracle 기준으로 ASC 때 NULL이 뒤쪽에 간다는 점을 자주 봐."
        },
        {
          pose: "happy",
          text: "명확하게 하려면 NULLS FIRST 또는 NULLS LAST를 직접 지정할 수 있어."
        },
        {
          pose: "idle",
          text: "Oracle NULL 정렬을 확인해보자."
        }
      ],
      blocks: [
        {
          kind: "table",
          title: "NULL 정렬 감각",
          headers: [
            "DBMS",
            "ASC 기본"
          ],
          rows: [
            [
              "Oracle",
              "NULL이 뒤쪽"
            ],
            [
              "SQL Server",
              "NULL이 앞쪽"
            ]
          ]
        },
        {
          kind: "callout",
          tone: "tip",
          title: "명시하기",
          body: "ORDER BY col NULLS FIRST 또는 NULLS LAST로 위치를 지정할 수 있습니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s8",
      title: "본질식별자 vs 인조식별자",
      quizId: "sqld-1-2-cp-08",
      group: "sqld-1-2-g8-key-choice",
      dialogue: [
        {
          pose: "wave",
          text: "[본질식별자]는 업무에 원래 있는 값이고, [인조식별자]는 시스템이 새로 만든 값이야."
        },
        {
          pose: "think",
          text: "학번은 업무에서 이미 쓰는 값이라 본질식별자에 가깝고, 자동 증가 id나 UUID는 인조식별자에 가까워."
        },
        {
          pose: "idle",
          text: "둘의 차이를 확인해보자."
        }
      ],
      blocks: [
        {
          kind: "table",
          title: "비교",
          headers: [
            "구분",
            "본질식별자",
            "인조식별자"
          ],
          rows: [
            [
              "어디서 옴",
              "업무에 원래 있음",
              "시스템이 생성"
            ],
            [
              "예시",
              "학번, 사업자번호",
              "id, 시퀀스, UUID"
            ],
            [
              "장점",
              "의미가 바로 보임",
              "변경·노출 리스크 낮음"
            ]
          ]
        }
      ]
    },
    {
      id: "sqld-1-2-s8-surrogate",
      title: "인조식별자를 쓰는 이유",
      quizId: "sqld-1-2-cp-08-surrogate",
      group: "sqld-1-2-g8-key-choice",
      dialogue: [
        {
          pose: "think",
          text: "실무에서는 인조식별자를 많이 써."
        },
        {
          pose: "lightbulb",
          text: "업무 규칙이 바뀌어도 PK가 덜 흔들리고, 개인정보를 PK로 직접 노출하지 않아도 되거든."
        },
        {
          pose: "happy",
          text: "대신 의미가 없어서 학번 같은 본질 값은 별도 UNIQUE로 중복을 막아야 해."
        },
        {
          pose: "idle",
          text: "인조식별자의 장점을 확인해보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "인조식별자는 의미 없는 내부 ID라서 업무 정책 변화와 개인정보 노출에 강합니다."
        },
        {
          kind: "callout",
          tone: "warn",
          title: "단점도 있음",
          body: "의미가 없기 때문에 같은 사람이 중복 등록되는 것을 막으려면 별도의 UNIQUE 제약이나 검증이 필요합니다."
        }
      ]
    },
    {
      id: "sqld-1-2-s8-practice",
      title: "실무 선택 기준",
      quizId: "sqld-1-2-cp-08-practice",
      group: "sqld-1-2-g8-key-choice",
      dialogue: [
        {
          pose: "think",
          text: "실무에서는 보통 [인조 PK + 본질 값 UNIQUE] 조합을 많이 써."
        },
        {
          pose: "lightbulb",
          text: "id는 내부 연결용 PK로 쓰고, 학번이나 사업자번호는 UNIQUE로 중복만 막는 방식이야."
        },
        {
          pose: "idle",
          text: "가장 안정적인 선택을 골라보자."
        }
      ],
      blocks: [
        {
          kind: "intro",
          body: "PK는 인조식별자로 안정적으로 두고, 업무상 중복되면 안 되는 값은 UNIQUE로 관리하는 방식이 흔합니다."
        },
        {
          kind: "example",
          title: "학생 예시",
          body: "학생(id PK, 학번 UNIQUE, 이름, 학과). 내부 연결은 id로 하고, 학번 중복은 UNIQUE로 막습니다."
        }
      ]
    }
  ]
};

export const SQLD_CH1_LESSONS: Lesson[] = [
  SQLD_1_1,
  SQLD_1_2,
];
