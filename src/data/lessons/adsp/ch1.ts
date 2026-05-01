import type { Lesson } from '../types';

const ADSP_1_1: Lesson = {
  id: 'adsp-1-1',
  subject: 'adsp',
  chapter: 1,
  chapterTitle: '데이터 이해',
  topic: '데이터의 이해',
  title: '데이터, 정보, 지식 — 그 차이부터',
  hook: '"데이터"와 "정보"가 헷갈리는 순간, 이 레슨으로 명확하게.',
  estimatedMinutes: 8,
  steps: [
    // ─── DIKW 피라미드 — 1 step → 5 steps 로 분해 (Phase C, 2026-04-27) ───
    {
      id: 'adsp-1-1-s1',
      title: 'DIKW 피라미드 — 4단계 개요',
      quizId: 'adsp-1-1-cp-01a',
      dialogue: [
        { pose: 'wave', text: '안녕! 첫 시간이야. 오늘은 [DIKW 피라미드] 부터.' },
        {
          pose: 'happy',
          text: '데이터(Data) → 정보(Information)\n→ 지식(Knowledge) → 지혜(Wisdom).',
        },
        { pose: 'lightbulb', text: '줄여서 [데정지혜] 라고 외우자!' },
        { pose: 'idle', text: '먼저 4단계 순서를 한 번 확인하고 가자.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'DIKW 피라미드는 데이터가 의사결정에 쓰이기까지의 가공 단계를 4 층으로 정리한 모델입니다. 아래로 갈수록 양은 많고 가치는 낮으며, 위로 갈수록 양은 줄지만 의사결정에 직접 쓰입니다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"데정지혜" 로 외우자',
          body:
            '데이터(Data) → 정보(Information) → 지식(Knowledge) → 지혜(Wisdom). 시험에 순서를 묻는 문제가 자주 나옵니다.',
        },
        {
          kind: 'table',
          title: '4단계 한 줄 정리 (위 → 아래: 가치 ↑ · 양 ↓)',
          headers: ['단계', '정의', '예시', '양·가치'],
          rows: [
            ['지혜 (W)', '새 영역으로의 확장 추론', '음료 전반 B마트가 저렴할 것', '양 ↓ · 가치 ↑↑'],
            ['지식 (K)', '일반화된 규칙', '콜라는 B마트가 유리', '양 ↓ · 가치 ↑'],
            ['정보 (I)', '비교·해석이 더해진 의미', 'B마트가 300원 더 싸다', '양 ↑ · 가치 ↑'],
            ['데이터 (D)', '가공 전 측정값', 'B마트 콜라 1,500원', '양 ↑↑ · 가치 ↓'],
          ],
        },
      ],
    },
    {
      id: 'adsp-1-1-s1-data',
      title: 'DIKW ① 데이터 (Data) — 가공 전 raw 값',
      quizId: 'adsp-1-1-cp-01b',
      dialogue: [
        { pose: 'wave', text: '첫 단계, [데이터] 야.' },
        { pose: 'happy', text: '있는 그대로의 객관적인 사실,\n가공되지 않은 상태야!' },
        { pose: 'think', text: '예: "휴대폰 100만원" /\n"ADsP 책 2만원" / "오늘 기온 22도".' },
        { pose: 'idle', text: '어떤 게 데이터 단계인지 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '데이터(Data) 는 측정·관찰·기록의 결과 그 자체입니다. 어떤 의미나 해석도 붙지 않은 raw 값이에요. 마트에 가서 가격표를 본 그 순간, 체중계 위에 올라가서 숫자가 표시된 그 순간 — 그게 데이터입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '편의점 영수증의 "삼다수 800원" / 체중계 화면의 "68.4kg" / 출석부에 찍힌 "9시 02분 출근" / 기상청 센서가 기록한 "오전 9시 기온 21.3℃". 모두 단일 측정값입니다. 다른 값과 비교하지도, "그래서 뭐?" 라는 의미를 붙이지도 않은 상태.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "그래서 뭐?" 가 빠져 있다',
          body:
            '"~원", "~kg", "~℃" 처럼 단일 값만 등장하고 다른 값과의 비교가 없다면 데이터 단계입니다. "B마트가 300원 싸다" 처럼 비교가 시작되면 다음 단계(정보) 로 넘어간 것.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s1-info',
      title: 'DIKW ② 정보 (Information) — 비교·집계로 의미가 생김',
      quizId: 'adsp-1-1-cp-01c',
      dialogue: [
        { pose: 'wave', text: '둘째, [정보] 단계.' },
        { pose: 'lightbulb', text: '데이터를 가공해서\n[패턴인식] 이 된 자료야!' },
        { pose: 'happy', text: '예: "제일 많이 팔린 상품" /\n"A서점이 책이 더 싸다".' },
        { pose: 'idle', text: '정보 단계 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정보(Information) 는 여러 데이터를 비교·집계·맥락 안에 놓아 "그래서 어떤 뜻이지?" 가 드러난 단계입니다. 데이터가 점이라면 정보는 점들을 잇는 선. 한 번 비교가 일어나는 순간 데이터는 정보로 승격합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '"이번 주 평균 매출 320만원, 지난 주 280만원 → 14% 증가" / "이 학생의 수학 점수 85점, 반 평균 72점 → 평균보다 13점 높음" / "오늘 강수량 50mm, 6월 평균 60mm → 평균보다 적은 비". 모두 단일 값이 아니라 비교·집계가 들어 있습니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — 비교는 있는데 일반화는 아직',
          body:
            '"이번엔 ~가 더 ~하다" 까지가 정보. "다음에도 ~가 더 ~할 것" 처럼 미래에 적용되는 규칙으로 굳어지면 다음 단계(지식). 한 번의 비교 결과인지 여러 번 통하는 룰인지로 가릅니다.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s1-knowledge',
      title: 'DIKW ③ 지식 (Knowledge) — 반복 가능한 규칙',
      quizId: 'adsp-1-1-cp-01',
      dialogue: [
        { pose: 'wave', text: '셋째, [지식] 단계.' },
        { pose: 'lightbulb', text: '패턴을 [의사결정] 에\n활용하는 룰이야!' },
        {
          pose: 'happy',
          text: '예: "ADsP 책은 A서점이 매번 싸다\n→ 책 살 땐 A서점에서 사자!".',
        },
        { pose: 'idle', text: '어떤 게 지식 단계인지 골라봐!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '지식(Knowledge) 은 여러 정보를 묶어 "이런 상황엔 이렇게 한다" 라는 규칙·패턴으로 굳힌 단계입니다. 정보가 "이번에 어떻더라" 의 일회성 관찰이라면 지식은 "다음에도 그럴 것" 의 반복 가능한 룰.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '"콜라류는 B마트, 과일은 농협하나로마트가 항상 더 싸다" / "비 오는 화요일엔 매장 매출이 평소보다 20% 떨어진다" / "겨울엔 따뜻한 음료가 평소보다 2배 더 팔린다". 한 번의 비교로 끝나지 않고 "다음에 또 그럴 때도 이렇게 결정하면 된다" 는 의사결정용 룰.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "다음에도" 가 들어간다',
          body:
            '"~할 때는 ~한다", "~가 유리하다", "보통 ~다" 같은 일반화된 표현이 등장하면 지식. 한 번의 비교 결과면 정보, 새 영역으로의 확장 추론(직접 본 적 없는 영역) 이면 다음 단계(지혜).',
        },
      ],
    },
    {
      id: 'adsp-1-1-s1-wisdom',
      title: 'DIKW ④ 지혜 (Wisdom) — 새 영역으로의 확장',
      quizId: 'adsp-1-1-cp-01d',
      dialogue: [
        { pose: 'wave', text: '마지막, [지혜] 단계.' },
        {
          pose: 'lightbulb',
          text: '쌓인 지식을 새 영역에 응용하는\n[창의적 전략] 이야!',
        },
        {
          pose: 'happy',
          text: '예: "ADsP 책이 A서점에서 싸니까,\nSQLD 책도 A서점이 유리할 거야!".',
        },
        { pose: 'idle', text: '마지막 단계, 지혜 예시를 골라봐!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '지혜(Wisdom) 는 검증된 지식을 새로운 영역으로 확장하는 창의적 추론입니다. 직접 비교한 적 없는 영역까지 같은 룰이 통할 거라 미루어 짐작하는 통찰. DIKW 의 가장 위, 양은 가장 적지만 가치는 가장 높습니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '"콜라가 B마트에서 매번 싸다 → 따라서 음료 카테고리 전체도 B마트가 유리할 것" (콜라 → 음료 전반으로 확장) / "장맛비 화요일에 매출이 떨어진다 → 다른 악천후 평일에도 비슷하게 떨어질 것" (비 → 악천후 일반화) / "X 약이 환자 100명에게 효과적이었다 → 비슷한 증상의 새 환자에게도 시도할 가치가 있다". 모두 직접 보지 않은 새 영역으로 룰을 미루어 적용하는 추론.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "확장 / 미루어 / 따라서"',
          body:
            '"따라서 다른 영역도 ~할 것", "~로 미루어 ~할 것" 같은 확장 추론이 등장하면 지혜. 같은 영역의 반복 룰이면 지식. 시험 단골 키워드: 창의적 아이디어, 통찰, 확장 추론.',
        },
      ],
    },
    // ─── 데이터 3가지 분류 기준 — 1 step → 4 substeps ───
    // ─── 데이터 3가지 분류 기준 — 1 step → 4 substeps (beginner-friendly 보강) ───
    {
      id: 'adsp-1-1-s2',
      title: '데이터 분류 — 3축 동시 적용 (개요)',
      quizId: 'adsp-1-1-cp-02',
      dialogue: [
        { pose: 'wave', text: '이번엔 [데이터] 에 대해\n자세히 알아보자!' },
        { pose: 'lightbulb', text: '데이터는 이런 [3가지 분류] 로\n나눌 수 있어!' },
        {
          pose: 'happy',
          text: '① [형태] 에 따른 분류\n② [표현 방식] 에 따른 분류\n③ [분석 목적] 에 따른 분류',
        },
        { pose: 'idle', text: '우선 [형태] 에 따른 분류부터\n자세히 보자!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"고객 리뷰 텍스트는 어떤 데이터인가?" 같은 시험 문제는 한 마디로는 답이 안 됩니다. 같은 데이터를 세 가지 다른 관점으로 묻거든요. (1) 어떻게 정리돼 있나(형태) (2) 숫자인가 말인가(표현 방식) (3) 무엇을 의미하나(분석 목적) — 이 세 축에 각각 답해야 완전한 분류가 됩니다.',
        },
        {
          kind: 'section',
          title: '예시로 한 번에 — "고객 리뷰 텍스트"',
          body:
            '같은 "고객 리뷰 텍스트" 를 3축으로 답해보면: 형태 = 비정형(미리 정해진 행·열 없음) · 표현 방식 = 정성적(숫자가 아닌 자연어) · 분석 목적 = 범주형(특정 단어/감정 라벨로 분류). 한 데이터에 답이 3개 동시에 붙는다는 게 핵심입니다.',
        },
        {
          kind: 'table',
          title: '3축 한눈에',
          headers: ['분류 기준', '질문', '유형'],
          rows: [
            ['형태', '어떻게 정리돼 있나?', '정형 / 반정형 / 비정형'],
            ['표현 방식', '값이 숫자인가, 말인가?', '정량적 / 정성적'],
            ['분석 목적', '값이 무엇을 의미하나?', '수치형 / 범주형'],
          ],
        },
      ],
    },
    {
      id: 'adsp-1-1-s2-jeong',
      title: '형태 ① 정형 — 행·열 구조',
      quizId: 'adsp-1-1-cp-02-jeong',
      dialogue: [
        { pose: 'wave', text: '[형태] 분류 첫째 — [정형] 부터!' },
        {
          pose: 'think',
          text: '미리 정한 행·열 구조에\n딱 맞춰 저장된 데이터야.\n키워드: [구조화].',
        },
        {
          pose: 'happy',
          text: '예시도 같이 보자:\n· [RDB] 테이블\n· [엑셀] 표\n· [CSV] 파일',
        },
        { pose: 'idle', text: '정형 데이터 예시를 골라봐!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정형(Structured) 은 미리 정한 행·열 구조에 딱 맞춰 저장된 데이터입니다. 키워드는 [구조화]. 이름·학번·전공이라는 열이 정해져 있고, 모든 학생이 같은 형식으로 한 행씩 들어가요. 컴퓨터가 가장 다루기 쉬운 형태 — SQL 한 줄로 검색·집계가 됩니다.',
        },
        {
          kind: 'section',
          title: '대표 예시',
          body:
            '· RDB 테이블 (회사 ERP 의 매출 기록, 학적 시스템) · 엑셀 표 (출석부, 인사 명단) · CSV 파일 (통장 거래 내역, 로그 export). 모두 "어디에 무엇이 들어갈지" 가 미리 정해진 행·열 형식.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁',
          body:
            '"미리 정해진 행·열 표에 그대로 들어가나?" → YES 면 정형. 컴퓨터 처리 난도 가장 낮음.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s2-ban',
      title: '형태 ② 반정형 — 메타데이터 동봉',
      quizId: 'adsp-1-1-cp-02-ban',
      dialogue: [
        { pose: 'wave', text: '[형태] 분류 둘째 — [반정형]!' },
        {
          pose: 'lightbulb',
          text: '구조는 자유롭지만 데이터 안에\n[메타데이터] (태그·키) 가\n함께 들어있는 형태야.',
        },
        {
          pose: 'happy',
          text: '예시도 같이 보자:\n· [JSON] (API 응답)\n· [XML] · [HTML]\n· 서버 [로그] 파일',
        },
        { pose: 'idle', text: '반정형 데이터 예시를 골라봐!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '반정형(Semi-structured) 은 미리 정해진 행·열 구조는 없지만 데이터 자체에 [메타데이터] (키·태그·항목 이름) 가 함께 들어있는 형태입니다. 키워드는 [메타데이터]. "규칙은 있는데 모양은 자유롭다" — 같은 키 이름을 쓰지만 메시지마다 길이·내용이 달라요.',
        },
        {
          kind: 'section',
          title: '대표 예시',
          body:
            '· JSON (REST API 응답) · XML (설정 파일·전자문서) · HTML (웹 페이지) · 서버 로그 파일 (key=value 패턴). 사람도 컴퓨터도 어느 정도 읽을 수 있지만 매번 모양이 다른 게 특징.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁',
          body:
            '"항목 이름(키·태그) 은 있지만 모양이 매번 다르다" → 반정형. 키-값 메타구조가 핵심 단서.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s2-bi',
      title: '형태 ③ 비정형 — 정해진 형식 X',
      quizId: 'adsp-1-1-cp-02-bi',
      dialogue: [
        { pose: 'wave', text: '[형태] 분류 셋째 — [비정형]!' },
        {
          pose: 'think',
          text: '미리 정해진 형식이\n전혀 없는 데이터야.',
        },
        {
          pose: 'happy',
          text: '예시도 같이 보자:\n· [영상] (CCTV·유튜브 클립)\n· [음성] (녹취록·통화)\n· [이미지] (사진·스캔)',
        },
        { pose: 'idle', text: '비정형 데이터 예시를 골라봐!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '비정형(Unstructured) 은 미리 정해진 행·열 구조나 키-값 형식이 전혀 없는 데이터입니다. 사람은 의미를 바로 알아채지만 컴퓨터 입장에선 그냥 바이트(0과 1) 의 긴 묶음이에요. 분석에 쓰려면 텍스트 추출·이미지 인식 같은 가공 단계가 먼저 필요합니다.',
        },
        {
          kind: 'section',
          title: '대표 예시',
          body:
            '· 영상 (CCTV 30분 클립, 유튜브 동영상) · 음성 (콜센터 통화 녹음, 인터뷰 녹취) · 이미지 (인스타 사진, 스캔본) · 자유 텍스트 (블로그 글, 자유 응답 리뷰). 컴퓨터 처리 난도 가장 높음.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁',
          body:
            '"행·열도 없고 키·태그도 없다" → 비정형. 영상·음성·이미지·자유 텍스트가 단골.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s2-quan',
      title: '표현 방식 ① 정량적 — 측정 가능한 숫자',
      quizId: 'adsp-1-1-cp-02-quan',
      dialogue: [
        { pose: 'wave', text: '[표현 방식] 분류 첫째 — [정량적] 부터!' },
        {
          pose: 'think',
          text: '숫자로 측정되는 데이터야.\n평균·합계가 [의미 있는 값].\n키워드: [측정값].',
        },
        {
          pose: 'happy',
          text: '예시도 같이 보자:\n· [키] 175cm\n· [월 매출] 300만 원\n· [체류시간] 42초',
        },
        { pose: 'idle', text: '정량적 데이터 예시를 골라봐!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정량적(Quantitative) 은 숫자로 측정 가능한 데이터입니다. 키워드는 [측정값]. 평균·합계·표준편차 같은 통계 연산이 자연스럽게 적용돼요. "더하기·평균이 의미가 있나?" 라고 자문해서 의미가 있으면 정량적.',
        },
        {
          kind: 'section',
          title: '대표 예시',
          body:
            '· 키 175cm · 월 매출 300만 원 · 페이지 체류시간 42초 · 쇼핑 카트 수량 3개 · 강수량 50mm. 모두 명확한 측정 단위가 있고, 평균을 내거나 합산하는 게 자연스럽습니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁',
          body:
            '"평균·합계가 의미가 있나?" → YES 면 정량적. 단위(cm, 원, 초, 개, mm)가 붙는 게 단골 단서.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s2-qual',
      title: '표현 방식 ② 정성적 — 말·감정·서술',
      quizId: 'adsp-1-1-cp-02-qual',
      dialogue: [
        { pose: 'wave', text: '[표현 방식] 분류 둘째 — [정성적]!' },
        {
          pose: 'lightbulb',
          text: '말·감정·서술처럼\n숫자가 아닌 [자연어 형태] 로\n표현된 데이터야.',
        },
        {
          pose: 'happy',
          text: '예시도 같이 보자:\n· [SNS 글] (트윗·인스타)\n· [뉴스 기사] 본문\n· [블로그] 포스트',
        },
        { pose: 'idle', text: '정성적 데이터 예시를 골라봐!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정성적(Qualitative) 은 말·감정·서술처럼 숫자가 아닌 자연어 형태로 표현된 데이터입니다. 분석할 땐 텍스트 마이닝·감성 분석·코딩(범주화) 같은 별도 처리가 필요해요.',
        },
        {
          kind: 'section',
          title: '대표 예시',
          body:
            '· SNS 게시글 (트위터·인스타·페이스북) · 뉴스 기사 본문 · 블로그 포스트 · 댓글 · 자유 응답 리뷰 ("배송이 빠르고 직원이 친절해요"). 모두 자연어 텍스트로, 평균이나 합계가 의미 없는 — 의미 자체가 메시지인 데이터.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — "정성적 = 비정형" 아님',
          body:
            '정성적과 비정형은 다른 축이에요. 학점(A·B·C·D), 만족도 5단계 같은 등급 코드는 정성적(말·감정 표현) 이지만 미리 정해진 라벨로 [정형] 화 돼 있습니다. 정성적 + 정형 의 좋은 예. 두 축을 섞어 묻는 게 시험 단골 함정.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s2-num',
      title: '분석 목적 ① 수치형 — 크기·차이의 의미',
      quizId: 'adsp-1-1-cp-02-num',
      dialogue: [
        { pose: 'wave', text: '[분석 목적] 분류 첫째 — [수치형] 부터!' },
        {
          pose: 'think',
          text: '값에 [크기·차이] 의 의미가 있어\n[산술 연산] (평균·합계) 이 자연스러워.\n키워드: [연산 가능].',
        },
        {
          pose: 'happy',
          text: '예시도 같이 보자:\n· [키] 175.3cm (연속형)\n· [학생 수] 23명 (이산형)\n· [매출] 300만 원',
        },
        { pose: 'idle', text: '수치형 데이터 예시를 골라봐!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '수치형(Numerical) 은 값 자체가 크기·차이·비율의 의미를 가지는 데이터입니다. 키워드는 [연산 가능]. 산술 연산(평균·합계·차이) 이 자연스럽게 통하면 수치형이에요.',
        },
        {
          kind: 'section',
          title: '두 갈래 — 이산형 / 연속형',
          body:
            '· 이산형(Discrete): 학생 수 23명, 카트 수량 3개, 시험 점수 85점 — 셀 수 있는 정수. · 연속형(Continuous): 키 175.3cm, 시간 42.5초, 강수량 50.2mm — 소수점이 의미 있는 실수. 둘 다 평균·합계가 자연스럽게 적용 가능.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁',
          body:
            '"평균·차이·비율이 의미 있나?" → YES 면 수치형. 단위(cm, 원, 명, 점)가 명확히 붙는 것도 단서.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s2-cat',
      title: '분석 목적 ② 범주형 — 카테고리·라벨',
      quizId: 'adsp-1-1-cp-02-cat',
      dialogue: [
        { pose: 'wave', text: '[분석 목적] 분류 둘째 — [범주형]!' },
        {
          pose: 'lightbulb',
          text: '값이 [카테고리·라벨] 인 데이터야.\n명목형 (순서 X) / 순서형 (순서 O).\n키워드: [라벨].',
        },
        {
          pose: 'happy',
          text: '예시도 같이 보자:\n· [혈액형] (A·B·O·AB) — 명목형\n· [도시] (서울·부산·대구)\n· [학점] (A·B·C·D) — 순서형',
        },
        { pose: 'idle', text: '범주형 데이터 예시를 골라봐!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '범주형(Categorical) 은 값이 카테고리·라벨인 데이터입니다. 키워드는 [라벨]. 평균이나 합계가 의미 없어요 — A·B·O·AB 의 평균은 정의되지 않으니까요.',
        },
        {
          kind: 'section',
          title: '두 갈래 — 명목형 / 순서형',
          body:
            '· 명목형(Nominal): 혈액형(A·B·O·AB), 도시(서울·부산), 성별 — 순서 의미 없음. · 순서형(Ordinal): 학점(A·B·C·D), 만족도 5단계, 군대 계급 — 순서·서열은 있지만 간격은 일정하지 않음.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — 숫자처럼 보이지만 범주형',
          body:
            '"1=서울, 2=부산, 3=대구" 처럼 코드로 1·2·3 이 적혀 있어도 그건 라벨일 뿐 범주형입니다. (1+3)/2 = 2 = "부산" 이라는 평균은 말이 안 되니까요. 시험에선 "숫자가 적혀 있다 = 수치형" 으로 속이는 함정 자주 등장.',
        },
      ],
    },
    // ─── SECI — 1 step → 5 substeps (암묵·형식 + 4 변환) ───
    {
      id: 'adsp-1-1-s3',
      title: '암묵지 · 형식지 · SECI 개요',
      quizId: 'adsp-1-1-cp-03',
      dialogue: [
        { pose: 'wave', text: '[자전거 타는 법] 을 책으로 옮길 수 있을까?' },
        { pose: 'think', text: '몸이 배운 노하우가 [암묵지]. 글로 정리되면 [형식지]. 조직은 이 변환으로 성장해.' },
        { pose: 'happy', text: '변환은 [4단계] — 공동화·표출화·연결화·내면화. "[공표연내]".' },
        { pose: 'idle', text: '먼저 암묵지/형식지 구분부터 확인.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '자전거 타는 법은 책으로 옮기기 어렵지만 누구나 탈 수 있습니다. 몸이 배운 노하우 — 이게 암묵지. 매뉴얼·논문처럼 글로 정리된 게 형식지. 조직은 둘 사이를 4가지 방식으로 순환시키며 지식을 키웁니다 (SECI).',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"공표연내"',
          body:
            'Socialization(공동화) → Externalization(표출화) → Combination(연결화) → Internalization(내면화). 시험에 4단계 매핑이 자주 등장합니다.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s3-S',
      title: 'SECI ① 공동화 (Socialization)',
      quizId: 'adsp-1-1-cp-03-S',
      dialogue: [
        { pose: 'wave', text: '첫 단계 [공동화] — 암묵지 → 암묵지.' },
        { pose: 'think', text: '말이나 글 없이 [몸에서 몸으로] 전해지는 단계야.' },
        { pose: 'happy', text: '예를 들어 신입사원이 선배 옆에 붙어 어깨너머로 일을 배우는 OJT 가 전형이야.' },
        { pose: 'idle', text: '공동화 예시를 한 번 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '공동화(Socialization) — 머리 속이나 몸에 있는 노하우(암묵지) 가 다른 사람의 머리·몸으로 그대로 옮겨가는 단계입니다. 중요한 건 "글로 적힌 게 없다" 는 점이에요. 같이 일하며 보고 따라하고, 시행착오를 옆에서 지켜보며 익힙니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '신입 요리사가 셰프 옆에서 1년간 어깨너머로 칼질을 익히는 경우 / 신입사원이 사수와 같이 출장 다니며 거래처 응대법을 몸으로 배우는 경우 / 숙련 기술자가 후배에게 "이 정도 압력으로 잡아야 해" 하며 손에 쥐어주는 경우. 모두 글이나 영상이 아닌 "함께 있어야만" 전해지는 지식.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 식별 키워드',
          body:
            '"OJT", "도제식", "현장 어깨너머", "동행 학습". 어딘가에 매뉴얼이나 문서가 등장하면 공동화 아님 — 표출화/연결화/내면화로 가야 합니다.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s3-E',
      title: 'SECI ② 표출화 (Externalization)',
      quizId: 'adsp-1-1-cp-03-E',
      dialogue: [
        { pose: 'wave', text: '둘째 [표출화] — 암묵지 → 형식지.' },
        { pose: 'think', text: '머릿속이나 몸에 있던 노하우를 글·도식·체크리스트로 [밖에 꺼내] 적는 단계야.' },
        { pose: 'happy', text: '시험 단골! 베테랑 기술자가 자기 비법을 매뉴얼로 정리한다 = 표출화.' },
        { pose: 'idle', text: '표출화 예시를 한 번 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '표출화(Externalization) — 사람 안(암묵지) 에 머물던 지식을 처음으로 외부의 형태(글·도식·매뉴얼) 로 꺼내는 단계입니다. 영어 단어 그대로 "externalize = 밖으로 끄집어 낸다". 조직이 한 사람의 노하우에 의존하지 않고 자산화 하는 결정적 단계여서, SECI 4단계 중 시험에 가장 자주 등장합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '40년 경력 장인의 작업 노하우를 영상 인터뷰 후 작업 매뉴얼로 작성 / 베테랑 영업사원의 거래처 응대 비법을 영업 가이드북으로 정리 / 노년 의사의 진료 패턴을 체크리스트화. 핵심은 "원래 글이 없던 지식이 글로 만들어진다" 는 것.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 식별 키워드',
          body:
            '"노하우를 매뉴얼로", "비법을 가이드북으로", "암묵 → 형식". 이미 글로 정리된 자료를 또 다른 글로 합치면 다음 단계(연결화).',
        },
      ],
    },
    {
      id: 'adsp-1-1-s3-C',
      title: 'SECI ③ 연결화 (Combination)',
      quizId: 'adsp-1-1-cp-03-C',
      dialogue: [
        { pose: 'wave', text: '셋째 [연결화] — 형식지 → 형식지.' },
        { pose: 'think', text: '이미 글로 정리된 자료들을 [모아 합쳐] 새 자료를 만드는 단계.' },
        { pose: 'happy', text: '여러 부서 보고서를 묶어 전사 백서를 발간하는 게 연결화야.' },
        { pose: 'idle', text: '연결화 예시를 한 번 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '연결화(Combination) — 이미 형식지(=글) 로 존재하는 여러 자료를 결합·재구성·요약해 새로운 형식지를 만드는 단계입니다. 글 → 글 의 변환이라는 점이 핵심이에요. 사람 머리 속의 새 노하우를 끌어내는 게 아니라, 흩어진 글들을 묶어 새 그림을 그리는 작업.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '사업부별 분기 보고서 4개를 통합해 전사 분기 백서 발간 / 여러 산학 논문을 모아 종합 리뷰 페이퍼 작성 / 부서별 데이터 표를 합쳐 통합 대시보드 보고서 제작. 모두 출발점이 "이미 적혀 있는" 자료라는 점이 표출화와의 차이.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 식별 키워드',
          body:
            '"여러 보고서를 합쳐", "기존 자료를 종합", "표준 매뉴얼 제정". 사람 머릿속에서 처음 꺼내면 표출화, 매뉴얼을 보고 익히면 내면화.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s3-I',
      title: 'SECI ④ 내면화 (Internalization)',
      quizId: 'adsp-1-1-cp-03-I',
      dialogue: [
        { pose: 'wave', text: '넷째 [내면화] — 형식지 → 암묵지.' },
        { pose: 'think', text: '매뉴얼·교본을 읽고 직접 따라하다 [몸에 배는] 단계야. 표출화의 반대 방향.' },
        { pose: 'happy', text: '신입이 매뉴얼대로 6개월 연습해서 손에 익는 게 전형이야.' },
        { pose: 'idle', text: '내면화 예시를 한 번 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '내면화(Internalization) — 글·매뉴얼·교본 같은 형식지를 읽고 실제로 반복 적용해 자기 몸·머리에 체화하는 단계입니다. 글 → 사람 안. 표출화(사람 → 글) 의 반대 방향이에요. SECI 사이클이 한 바퀴 돌아 다시 새로운 암묵지가 만들어지는 마무리 단계.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '신입 간호사가 표준 진료 가이드를 6개월간 반복 적용하다 손에 익어 매뉴얼 없이도 자연스러워짐 / 코딩 신입이 코드 컨벤션 문서를 보며 짜다가 어느 순간 자동으로 그렇게 코드 짬 / 영업사원이 응대 매뉴얼대로 반복 시도하다 자기만의 응대 패턴이 됨. 글로 시작했지만 "이젠 안 보고도 된다" 가 핵심.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 식별 키워드',
          body:
            '"매뉴얼 보고 연습 → 숙련", "교본대로 반복 후 체화". 매뉴얼을 처음 만든 단계는 표출화, 매뉴얼끼리 합치면 연결화.',
        },
      ],
    },
    // ─── DB 특징 + DW/Data Lake — 1 step → 3 substeps (특징 5종 통합 + DW + Data Lake) ───
    {
      id: 'adsp-1-1-s4',
      title: 'DB 5특징 — "공·통·저·변" + 실시간',
      quizId: 'adsp-1-1-cp-04',
      dialogue: [
        { pose: 'wave', text: '엑셀과 DB 차이는 [5가지 성질].' },
        { pose: 'think', text: '[공]용·[통]합·[저]장·[변]화 + [실시간]. "공통저변 + 실시간".' },
        { pose: 'idle', text: '5성질을 한꺼번에 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '엑셀 파일과 진짜 데이터베이스(DB) 의 차이는 단순히 "용량이 크냐" 가 아니라 5가지 본질적 성질로 갈립니다. 같은 학생 명단이라도, 엑셀 파일은 한 번에 한 사람만 열 수 있고 누군가 수정하면 다른 사람은 모르지만, DB 는 여러 사람이 동시에 보고 누군가의 수정이 즉시 반영됩니다.',
        },
        {
          kind: 'table',
          title: 'DB 5특징 한눈에',
          headers: ['특징', '의미', '엑셀과 차이'],
          rows: [
            ['공용', '여러 사용자가 동시에 공유·접근', '엑셀: 한 번에 한 사람만 열기'],
            ['통합', '동일 데이터의 중복을 최소화', '엑셀: 부서마다 같은 정보 반복 저장'],
            ['저장', '디스크에 영속 — 전원 꺼져도 유지', '엑셀: 파일 단위 저장 — 분실 위험'],
            ['변화', '수정·삽입·삭제가 즉시 반영', '엑셀: 누군가의 수정을 다른 사람은 모름'],
            ['실시간', '요청 즉시 응답 (초 이내)', '엑셀: 큰 파일은 열기·저장 자체가 느림'],
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '암기법: "공통저변 + 실시간"',
          body:
            '앞 글자 4개 = [공통저변]. 거기에 "실시간 처리" 까지. 시험에선 "DB 의 특징이 아닌 것" 으로 자주 출제 — 5가지 외 다른 보기가 정답.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s4-dw',
      title: 'DW (Data Warehouse) — 분석 창고',
      quizId: 'adsp-1-1-cp-04-dw',
      dialogue: [
        { pose: 'wave', text: 'DW — 운영계 데이터를 [ETL] 해서 정돈한 분석 창고.' },
        { pose: 'think', text: '주제별·시간별로 정형 데이터만 담음. OLAP 을 위한 읽기 전용.' },
        { pose: 'idle', text: 'DW 의 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Data Warehouse 는 운영 시스템(OLTP) 데이터를 ETL 후 주제별로 정돈한 분석 창고입니다. 주로 정형 데이터, OLAP·BI 가 사용. 운영 시스템에 영향을 안 주려고 별도 저장소에 모으는 게 핵심.',
        },
        {
          kind: 'keypoints',
          title: 'DW 의 핵심 용어 — 한 줄로',
          items: [
            'ETL = Extract(추출) → Transform(변환) → Load(적재). 운영 DB 의 raw 를 읽어 분석 형태로 가공 후 DW 에 저장하는 파이프라인.',
            '주제별 정돈 = 부서·테이블 단위가 아니라 "매출", "고객", "재고" 같은 분석 주제별로 묶어 저장.',
            '시간별 정돈 = 같은 매출 데이터도 일·주·월 단위로 미리 집계해서 보관 → 시계열 분석이 빠름.',
            'Schema-on-Write = 저장하는 시점에 컬럼·타입을 미리 결정. 정형 데이터만 가능.',
            'OLAP = Online Analytical Processing — 다차원 집계·조회가 주 작업.',
            'BI = Business Intelligence — 의사결정용 시각화 도구. DW 의 주 사용자.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 키워드 — DW 만의 시그널',
          body:
            '"ETL 후 주제별·시간별 정돈", "OLAP·BI 분석용", "Schema-on-Write". 정형·반정형·비정형 모두 raw 로 담는다 → Data Lake. 실시간 거래 처리 → OLTP.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s4-lake',
      title: 'Data Lake — 정제 전 저수지',
      quizId: 'adsp-1-1-cp-04-lake',
      dialogue: [
        { pose: 'wave', text: 'Data Lake — 정제 전 원시까지 다 담음.' },
        { pose: 'think', text: '정형·반정형·비정형 모두 raw 로 저장.' },
        { pose: 'idle', text: 'Data Lake 의 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Data Lake 는 정형뿐 아니라 반정형·비정형·raw 데이터까지 형태 변환 없이 적재하는 저장소입니다. DW 와의 결정적 차이는 "Schema-on-Read" — 저장할 땐 구조를 안 정하고 읽을(분석할) 때 비로소 구조를 입힙니다. 사진·영상·로그 같은 비정형도 모두 그대로 받습니다.',
        },
        {
          kind: 'table',
          title: 'DW vs Data Lake — 한눈에',
          headers: ['축', 'DW (Data Warehouse)', 'Data Lake'],
          rows: [
            ['데이터 형태', '정형 only', '정형·반정형·비정형 모두'],
            ['스키마 적용 시점', 'Schema-on-Write (저장 시)', 'Schema-on-Read (분석 시)'],
            ['주 사용자', 'BI 분석가·경영진', '데이터 사이언티스트·엔지니어'],
            ['활용 목적', '정형 리포트·대시보드', '머신러닝·로그 탐색·실험'],
            ['데이터 가공', 'ETL 후 적재', 'raw 그대로 적재'],
          ],
        },
        {
          kind: 'table',
          title: 'OLTP vs OLAP — 운영 vs 분석',
          headers: ['축', 'OLTP (Transaction)', 'OLAP (Analytical)'],
          rows: [
            ['주 작업', 'insert·update·delete', 'select·aggregate'],
            ['응답 시간', '짧은 트랜잭션 (ms)', '긴 분석 쿼리 (초~분)'],
            ['데이터 형태', '정규화된 정형', '비정규화·집계'],
            ['예시 시스템', 'ERP·CRM 운영 DB', 'DW·BI 분석 환경'],
          ],
        },
      ],
    },
    // ─── 기업 정보 시스템 5종 — 1 step → 6 substeps ───
    {
      id: 'adsp-1-1-s5',
      title: '기업 정보 시스템 — "생고공의" 개요',
      quizId: 'adsp-1-1-cp-05',
      dialogue: [
        { pose: 'wave', text: '회사 부서마다 다른 데이터 → 통합 시스템 필요.' },
        { pose: 'think', text: '5종: [DBMS] · [ERP] · [CRM] · [SCM] · [BI].' },
        { pose: 'idle', text: '먼저 5 시스템 매칭 + DBMS 유형.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '회사가 커지면 부서마다 데이터가 따로 쌓이고, 같은 고객 정보가 영업·마케팅·CS 에 중복 저장됩니다. 이를 통합·표준화하기 위한 5가지 정보 시스템이 시험에 자주 등장 — DBMS 가 가장 아래 인프라, 그 위에 ERP·CRM·SCM 이 영역별로 올라가고, BI 는 그 데이터들을 의사결정으로 연결합니다.',
        },
        {
          kind: 'table',
          title: '기업 정보 시스템 5종 — 한눈에',
          headers: ['시스템', '풀네임', '담당 영역', '대표 사례'],
          rows: [
            ['DBMS', 'DataBase Management System', '데이터 저장·관리 인프라', 'Oracle·MySQL·PostgreSQL'],
            ['ERP', 'Enterprise Resource Planning', '회사 안 — 생산·재무·인사 통합', 'SAP·Oracle ERP'],
            ['CRM', 'Customer Relationship Management', '고객 접점 — 마케팅·캠페인', 'Salesforce'],
            ['SCM', 'Supply Chain Management', '공급사슬 — 조달·재고·물류', 'SAP SCM'],
            ['BI', 'Business Intelligence', '의사결정 — 대시보드·리포트', 'Tableau·Power BI'],
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"생고공의" 흐름',
          body:
            'ERP(생산·전사) → CRM(고객) → SCM(공급사슬) → BI(의사결정). 모두 DBMS 위에서 작동. ERP 는 회사 안쪽, CRM·SCM 은 회사 바깥(고객·협력사) 접점, BI 는 그 데이터를 가공해 결정에 쓰는 도구.',
        },
        {
          kind: 'keypoints',
          title: 'DBMS 유형 4가지',
          items: [
            '계층형 (Hierarchical): 트리 구조 1:N — 한 부모-여러 자식. 예전 IBM IMS.',
            '망형 (Network): 한 자식이 여러 부모를 가질 수 있음. 복잡한 관계 표현.',
            '관계형 (RDB): 테이블·SQL — 현대 가장 널리 쓰임 (Oracle·MySQL·PostgreSQL).',
            'NoSQL: 대용량·비정형 대응 — 키-값·문서·그래프 등 (MongoDB·Redis).',
          ],
        },
      ],
    },
    {
      id: 'adsp-1-1-s5-dbms',
      title: '기업 시스템 ① DBMS',
      quizId: 'adsp-1-1-cp-05-dbms',
      dialogue: [
        { pose: 'wave', text: 'DBMS — 모든 시스템의 기반.' },
        { pose: 'think', text: '데이터베이스 생성·조회·수정·백업 소프트웨어.' },
        { pose: 'idle', text: 'DBMS 의 역할을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'DBMS(DataBase Management System) 는 데이터베이스의 생성·조회·수정·삭제·백업을 담당하는 소프트웨어. ERP·CRM·SCM·BI 모두 DBMS 위에서 동작.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"DB 관리 SW", "Oracle·MySQL·PostgreSQL". 전사 통합 업무는 ERP, 고객 관리는 CRM.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s5-erp',
      title: '기업 시스템 ② ERP',
      quizId: 'adsp-1-1-cp-05-erp',
      dialogue: [
        { pose: 'wave', text: 'ERP — Enterprise Resource Planning.' },
        { pose: 'think', text: '생산·판매·재무·인사 등 전사 업무를 하나로 통합.' },
        { pose: 'idle', text: 'ERP 의 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'ERP 는 생산·판매·재무·인사 등 전사적 자원을 하나의 시스템으로 통합해 부서 간 데이터 일관성을 확보합니다. 대표: SAP · Oracle ERP.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"전사 자원 통합", "생산·재무·인사 통합". 고객 관리만이면 CRM, 공급사슬만이면 SCM.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s5-crm',
      title: '기업 시스템 ③ CRM',
      quizId: 'adsp-1-1-cp-05-crm',
      dialogue: [
        { pose: 'wave', text: 'CRM — Customer Relationship Management.' },
        { pose: 'think', text: '고객 이력·성향 관리, 맞춤 마케팅·서비스.' },
        { pose: 'idle', text: 'CRM 의 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'CRM 은 고객 정보·구매 이력·접점 데이터를 통합 관리해 개인화된 마케팅·서비스 제공을 지원. 대표: Salesforce.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"고객 관리", "맞춤 마케팅". 공급자·재고면 SCM, 의사결정 BI.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s5-scm',
      title: '기업 시스템 ④ SCM',
      quizId: 'adsp-1-1-cp-05-scm',
      dialogue: [
        { pose: 'wave', text: 'SCM — Supply Chain Management.' },
        { pose: 'think', text: '원자재 조달 → 생산 → 유통 공급사슬 최적화.' },
        { pose: 'idle', text: 'SCM 의 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'SCM 은 원자재 조달부터 생산·유통·반품까지 공급사슬 전체를 통합 관리해 재고·납기·비용을 최적화. 협력사 정보 공유가 핵심.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"공급사슬 최적화", "조달·재고·물류". 고객 접점이면 CRM, 의사결정 대시보드면 BI.',
        },
      ],
    },
    {
      id: 'adsp-1-1-s5-bi',
      title: '기업 시스템 ⑤ BI',
      quizId: 'adsp-1-1-cp-05-bi',
      dialogue: [
        { pose: 'wave', text: 'BI — Business Intelligence.' },
        { pose: 'think', text: '쌓인 데이터를 대시보드·리포트로 가공 → 의사결정.' },
        { pose: 'idle', text: 'BI 의 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'BI 는 데이터를 다차원 분석·리포트·대시보드로 시각화해 경영 의사결정을 지원. 대표: Tableau · Power BI · Looker.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"대시보드·리포트", "의사결정 지원". 운영 통합이면 ERP, 고객 관리면 CRM.',
        },
      ],
    },
  ],
};

const ADSP_1_2: Lesson = {
  id: 'adsp-1-2',
  subject: 'adsp',
  chapter: 1,
  chapterTitle: '데이터 이해',
  topic: '데이터의 가치와 미래',
  title: '빅데이터는 왜 "빅" 인가',
  hook: '3V·5V… 숫자만 외우지 말고, 왜 "가치" 로 이어지는지.',
  estimatedMinutes: 8,
  steps: [
    // ─── 3V · 데이터 단위 — 1 step → 4 substeps ───
    {
      id: 'adsp-1-2-s1',
      title: '빅데이터 단위 · 3V/5V 개요',
      quizId: 'adsp-1-2-cp-01',
      dialogue: [
        { pose: 'wave', text: '스마트폰 10분이 인류 1만 년 분량을 넘는다고 해.' },
        { pose: 'think', text: '단위 KB·MB·GB·TB·PB·EB·ZB·YB — 단계마다 1024배.' },
        { pose: 'happy', text: '"빅" 의 정의는 가트너 [3V]: Volume · Variety · Velocity.' },
        { pose: 'idle', text: '단위·3V 개요부터 확인!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '데이터 단위',
          body:
            'KB → MB → GB → TB → PB(페타) → EB(엑사) → ZB(제타) → YB(요타). 단계마다 1024배. PB 이상을 빅데이터 영역으로 봅니다.',
        },
        {
          kind: 'table',
          title: '가트너의 3V',
          headers: ['V', '의미', '예시'],
          rows: [
            ['Volume', '데이터의 양', 'PB 로그'],
            ['Variety', '형태의 다양성', '정형+이미지+센서'],
            ['Velocity', '생성·처리 속도', '초당 수만 건'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '5V · 7V 확장',
          body:
            '3V + Value(가치) + Veracity(진실성) = 5V. + Validity(유효성) + Volatility(휘발성) = 7V.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s1-volume',
      title: '3V ① Volume — "데이터가 너무 많다"',
      quizId: 'adsp-1-2-cp-01-volume',
      dialogue: [
        { pose: 'wave', text: '첫째 V, [Volume] — 그냥 [양] 이야.' },
        { pose: 'think', text: '엑셀 한 장으론 절대 안 들어가는 [수십~수백 PB] 의 규모.' },
        { pose: 'happy', text: '한 대 컴퓨터로는 못 다뤄서 [여러 대로 나눠] 처리해야 해 (Hadoop · Spark).' },
        { pose: 'idle', text: 'Volume 의 핵심 키워드를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Volume(양) — 가장 직관적인 V 입니다. 단위 시간·공간에 쌓인 데이터의 절대 규모가 너무 커서 평소 도구(엑셀·MySQL 단일 인스턴스) 로는 다룰 수 없는 상태. PB(페타바이트, 1024 TB) 이상이 되면 한 대 컴퓨터의 디스크·메모리·CPU 한계를 넘어가 분산처리가 필요해집니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '카카오톡 하루치 메시지 로그 / 유튜브 1분당 업로드되는 영상 500시간 / 글로벌 신용카드 회사의 1주일치 결제 트랜잭션. 이런 규모는 이미 "파일 한 개로 저장" 자체가 불가능해서, 수백~수천 대 서버에 쪼개 담는 분산저장(HDFS) 과 분산처리(Hadoop·Spark) 가 필수가 됩니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "양" 만 강조되면 Volume',
          body:
            '"엄청난 규모", "PB·EB 단위", "분산 저장 필수" 가 키워드면 Volume. 데이터 종류가 다양하다면 Variety, 빠르게 들어오는 게 강조면 Velocity.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s1-variety',
      title: '3V ② Variety — "형태가 너무 제각각"',
      quizId: 'adsp-1-2-cp-01-variety',
      dialogue: [
        { pose: 'wave', text: '둘째 V, [Variety] — 형태의 [다양성].' },
        { pose: 'think', text: '엑셀 같은 [정형] 만이 아니라 카톡 로그(반정형) · 사진 · 음성까지 [한꺼번에] 쏟아져.' },
        { pose: 'happy', text: '예전엔 정형 데이터만 분석했는데, 이젠 모든 형태가 같은 시스템에 들어와.' },
        { pose: 'idle', text: 'Variety 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Variety(다양성) — 한 시스템 안에 정형(엑셀·DB 테이블) · 반정형(JSON·XML·로그) · 비정형(영상·이미지·음성·자유 텍스트) 이 함께 들어오는 상황입니다. 단순히 양이 많은 게 아니라 형태가 제각각이라는 점이 핵심. 같은 양이라도 형태가 한 가지면 Variety 가 아닙니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '쇼핑몰이 분석에 쓰는 데이터 — 회원 DB(정형) + 클릭 로그 JSON(반정형) + 상품 이미지(비정형) + 고객 리뷰 텍스트(비정형) + 콜센터 통화 녹취(비정형). 5가지 형태가 한 추천 시스템에 동시 입력. 또는 자율주행차의 카메라 영상(비정형) + 라이다 센서(반정형) + 차량 운행 로그(정형) 통합. 모두 단일 형태가 아닌 "여러 형태 동시" 라는 점이 시험 식별 포인트.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "다양한 형태" 가 강조되면 Variety',
          body:
            '"정형+비정형 혼재", "이미지·텍스트·센서 동시", "다양한 출처" 가 키워드면 Variety. "양이 많다" 만 강조면 Volume, "빠르다" 만 강조면 Velocity.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s1-velocity',
      title: '3V ③ Velocity — "쉴 새 없이 들어온다"',
      quizId: 'adsp-1-2-cp-01-velocity',
      dialogue: [
        { pose: 'wave', text: '셋째 V, [Velocity] — 생성·처리 [속도].' },
        { pose: 'think', text: '하루치 모아서 한 번에 처리하면 못 따라가. [실시간] 으로 받아내야 해.' },
        { pose: 'happy', text: '예: 카드 결제 사기 탐지 — 결제 0.1초 안에 정상/사기 판단해야 함.' },
        { pose: 'idle', text: 'Velocity 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Velocity(속도) — 데이터가 들어오고 처리되어야 하는 속도가 빠른 상황입니다. 옛날 데이터 분석은 "저녁에 그날 매출을 한 번에 정리" 하는 배치(batch) 처리로 충분했지만, 빅데이터 시대엔 "지금 막 발생한 사건을 즉시 판단" 해야 하는 케이스가 많아졌습니다. 이걸 스트리밍(streaming) 처리라 부릅니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '신용카드 사기 탐지 — 결제 후 0.1초 안에 의심 거래 판별 / 자율주행 차량의 라이다 센서 — 매 0.05초마다 장애물 감지 / 주식 시장의 알고리즘 트레이딩 — 1ms 단위로 매수/매도 / SNS 트렌드 — 트위터 분당 수십만 트윗 실시간 분석. 모두 "내일 정리해도 돼" 가 절대 안 통하는 상황. Kafka·Flink 같은 스트리밍 엔진이 등장한 배경.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "실시간 / 스트리밍" 이 핵심',
          body:
            '"실시간", "스트리밍", "초당 N 건", "즉시 판단" 이 키워드면 Velocity. 배치 처리만 등장하면 Velocity 가 아님 — 단순히 양이 많은 Volume 일 가능성.',
        },
      ],
    },
    // ─── 빅데이터 변화 4축 — 1 step → 5 substeps ───
    {
      id: 'adsp-1-2-s2',
      title: '빅데이터 변화 — 4축 개요',
      quizId: 'adsp-1-2-cp-02',
      dialogue: [
        { pose: 'wave', text: '빅데이터로 분석 패러다임이 4축에서 뒤집혔어.' },
        { pose: 'think', text: '[표본→전수] · [질→양] · [인과→상관] · [이론→데이터].' },
        { pose: 'idle', text: '먼저 4축 비교 매트릭스.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '빅데이터 시대 이전엔 데이터가 비싸고 분석 도구도 비쌌습니다. 그래서 작은 표본을 정성스럽게 모으고, 가설을 먼저 세우고, "왜 그런가" 의 인과를 밝히는 방식이 표준이었어요. 지금은 저장·연산 비용이 폭락해 4가지 축에서 분석의 디폴트가 뒤집혔습니다. 시험에선 "이전 → 이후" 매칭을 자주 묻습니다.',
        },
        {
          kind: 'table',
          title: '변화 4축 — 이전 vs 이후',
          headers: ['축', '이전 (전통적 통계)', '이후 (빅데이터)'],
          rows: [
            ['규모', '표본(Sample)', '전수(Population)'],
            ['품질', '질(Quality)', '양(Quantity)'],
            ['관점', '인과(Causation)', '상관(Correlation)'],
            ['접근', '이론 기반 (가설 우선)', '데이터 기반 (패턴 발굴)'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 함정 — 축은 4개로 독립',
          body:
            '예를 들어 "표본 → 전수" 는 규모 축, "인과 → 상관" 은 관점 축. 서로 다른 축의 변화를 섞어서 묻는 게 단골 함정입니다. 어느 축의 변화인지 라벨을 먼저 붙이고 답을 고르세요.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s2-scale',
      title: '변화 ① 표본 → 전수',
      quizId: 'adsp-1-2-cp-02-scale',
      dialogue: [
        { pose: 'wave', text: '첫 축 [규모] — 작은 표본 → 전수 데이터.' },
        { pose: 'think', text: '저장·연산 비용 하락 → 전수 다루기 가능.' },
        { pose: 'idle', text: '규모 축의 이전/이후를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"전수 조사"란 모집단(예: 전체 가입자) 의 한 명도 빠짐없이 다 분석하는 것이고, "표본 조사"는 그중 일부만 추려 분석하는 것입니다. 전통적 통계학은 비용 때문에 표본을 강제했지만, 빅데이터 시대엔 가입자 1억 명 거래 로그도 다 다룰 수 있게 됐어요.',
        },
        {
          kind: 'section',
          title: '왜 가능해졌나 — 비용의 폭락',
          body:
            '저장 비용: 1990년대 1GB = 수백만 원 → 현재 = 수십 원. 연산 비용: 클라우드(AWS·GCP) 로 수천 대 컴퓨터를 분 단위로 빌릴 수 있게 됨. 이 두 변화로 "비용 때문에 표본만 보던" 제약이 사라졌습니다.',
        },
        {
          kind: 'section',
          title: '구체 사례',
          body:
            '예전: 백화점이 고객 1만 명 표본 추출 → 만족도 설문 → 결과 일반화. 지금: 카드사 5천만 회원 전체의 1년치 거래 5억 건을 다 다루며 사기 탐지 모델 학습. 표본 추정의 오차 자체가 사라지고, 희소한 사례(예: 0.001% 의 사기 거래) 도 그대로 잡힙니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 키워드',
          body:
            '"표본 → 전수", "Sample → Population", "전수 조사 가능". 인과·상관 축, 질·양 축, 이론·데이터 축은 별개의 변화 — 섞어서 묻는 함정 주의.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s2-quality',
      title: '변화 ② 질 → 양',
      quizId: 'adsp-1-2-cp-02-quality',
      dialogue: [
        { pose: 'wave', text: '둘째 축 [품질] — 질 우선 → 양 우선.' },
        { pose: 'think', text: '깔끔한 소수 데이터 < 잡음 섞여도 풍부한 다량.' },
        { pose: 'idle', text: '품질 축의 변화를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"질" 이란 데이터가 얼마나 깔끔한지 — 결측·오타·이상치가 없는지를 말합니다. 전통 통계에선 작은 표본에서도 정확한 결론을 내야 했기에 데이터 정제에 큰 비중을 뒀어요. 빅데이터에선 양이 워낙 많아 일부 잡음이 평균에 묻혀버리는 효과가 생겨, 정제보다 양 확보가 우선이 됐습니다.',
        },
        {
          kind: 'section',
          title: '구체 사례',
          body:
            '예전: 의학 연구가 100명 환자의 혈액 샘플을 정밀 측정 → 깔끔한 작은 데이터로 모델 학습. 지금: 검색엔진이 수십억 개의 자유 텍스트 쿼리·클릭 로그를 학습 — 오타·중복·노이즈 섞여 있어도 양이 압도적이라 패턴이 더 잘 잡힘. ChatGPT 같은 거대 언어모델도 "정제된 소량" 보다 "잡음 섞인 인터넷 전체" 로 더 똑똑해진 사례.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 키워드',
          body:
            '"질 → 양", "Quality → Quantity", "잡음 허용", "정제보다 규모". 규모(표본/전수) 와 별개 축이라는 점이 함정 — 두 축이 비슷해 보이지만 다른 변화입니다.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s2-corr',
      title: '변화 ③ 인과 → 상관',
      quizId: 'adsp-1-2-cp-02-corr',
      dialogue: [
        { pose: 'wave', text: '셋째 축 [관점] — 인과 → 상관.' },
        { pose: 'think', text: '"왜?" 보다 "함께 움직이나?" 만으로도 의사결정 가능.' },
        { pose: 'idle', text: '관점 축의 변화를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '인과(Causation) = "A 가 B 의 원인이다" — A 를 바꾸면 B 가 바뀐다는 직접적 영향 관계. 상관(Correlation) = "A 와 B 가 함께 변한다" — 둘이 동시 변하지만 무엇이 원인인지는 모름. 전통 과학은 인과를 증명해야 결론을 내렸지만, 빅데이터 시대엔 상관만으로도 마케팅·운영 결정엔 충분합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례 — 상관만으로 충분한 경우',
          body:
            '월마트가 분석해보니 "허리케인 예보 직전 → 스트로베리 팝타르트 매출 7배 증가". 왜 사람들이 폭풍에 대비해 팝타르트를 사는지 인과는 모르지만, 매대를 미리 채워놓으면 매출이 오릅니다. 상관만으로 의사결정 OK. / 넷플릭스 추천: "이 영화 본 사람은 저 영화도 본다" — 왜 그런 취향 패턴인지 몰라도 추천 효과는 충분.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '주의 — "원인 무관" 은 아님',
          body:
            '시험 함정: "빅데이터 시대엔 인과관계가 무의미해졌다" 라는 보기는 틀림. 정답은 "상관만으로도 의사결정 가능" — 인과는 여전히 가치 있지만, 상관만 있어도 활용 가능한 영역이 늘어났다는 뜻.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s2-data',
      title: '변화 ④ 이론 → 데이터',
      quizId: 'adsp-1-2-cp-02-data',
      dialogue: [
        { pose: 'wave', text: '넷째 축 [접근] — 이론 → 데이터.' },
        { pose: 'think', text: '가설 먼저 → 데이터로 확인 vs 데이터에서 패턴 발굴.' },
        { pose: 'idle', text: '접근 축의 변화를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"이론 기반"은 분석가가 먼저 가설을 세우고 ("월요일에 매출이 더 높을 것이다") 데이터로 검증하는 방식. "데이터 기반"은 가설 없이 풍부한 데이터에서 알고리즘이 직접 패턴을 찾아주는 방식. 데이터가 폭증하고 머신러닝이 발달하면서 후자가 가능해졌습니다.',
        },
        {
          kind: 'section',
          title: '구체 사례',
          body:
            '이론 기반: 마케터가 "20대가 30대보다 SNS 광고에 반응이 클 것" 이라는 가설을 세우고 A/B 테스트로 검증. 데이터 기반: 추천 알고리즘이 사용자 1억 명의 행동 로그에서 "이런 패턴을 가진 사람은 이런 상품을 산다" 같은 규칙을 자동 발견 — 분석가가 미리 가설을 세우지 않은 새로운 패턴이 튀어나옴.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 키워드 — 인과/상관 축과 혼동 주의',
          body:
            '"이론 → 데이터", "Theory → Data-driven", "가설 우선 → 패턴 발굴". 인과/상관 축과 비슷해 보이지만 다른 차원 — 이 축은 "분석을 어떻게 시작하느냐", 인과/상관은 "결론의 형태가 무엇이냐" 의 차이.',
        },
      ],
    },
    // ─── 데이터 3법 (개정신) — 1 step → 4 substeps ───
    {
      id: 'adsp-1-2-s3',
      title: '데이터 3법 — "개·정·신" 개요',
      quizId: 'adsp-1-2-cp-03',
      dialogue: [
        { pose: 'wave', text: '2020년 개정으로 가명정보 활용 가능.' },
        { pose: 'think', text: '3법 "[개정신]" — 개인정보보호법 · 정보통신망법 · 신용정보법.' },
        { pose: 'idle', text: '먼저 3법 + 정보 카테고리 개요.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"개·정·신"',
          body:
            '개인정보보호법 · 정보통신망법 · 신용정보법. 2020년 개정으로 "가명정보" 개념 도입.',
        },
        {
          kind: 'keypoints',
          title: '3종 정보 카테고리',
          items: [
            '개인정보: 직접 식별 — 원칙적으로 동의 필요',
            '가명정보: 추가정보 없이는 식별 불가 — 통계·연구·공익 한정 동의 없이 활용 가능',
            '익명정보: 식별 불가능 — 개인정보보호법 대상 외',
          ],
        },
      ],
    },
    {
      id: 'adsp-1-2-s3-pipa',
      title: '데이터 3법 ① 개인정보보호법',
      quizId: 'adsp-1-2-cp-03-pipa',
      dialogue: [
        { pose: 'wave', text: '첫째 [개인정보보호법] — 개인정보 처리 일반.' },
        { pose: 'think', text: '수집·이용·제공·파기의 원칙. 일반법.' },
        { pose: 'idle', text: '개인정보보호법 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '개인정보보호법은 모든 개인정보 처리에 대한 일반법. 정보주체의 동의·열람·정정·삭제 권리, 처리자의 안전조치 의무 등을 규정.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"일반법", "동의 원칙", "정보주체 권리". 통신서비스 영역 추가 규제는 정보통신망법, 신용정보 영역은 신용정보법.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s3-net',
      title: '데이터 3법 ② 정보통신망법',
      quizId: 'adsp-1-2-cp-03-net',
      dialogue: [
        { pose: 'wave', text: '둘째 [정보통신망법] — 통신서비스 특화.' },
        { pose: 'think', text: '온라인 서비스·웹사이트·앱에서의 개인정보 보호 강화.' },
        { pose: 'idle', text: '정보통신망법 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정보통신망법은 정보통신서비스 제공자(웹사이트·앱·SNS 등) 의 개인정보 보호 의무·이용자 보호 조치를 규정.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"정보통신서비스", "웹·앱·SNS", "이용자 보호". 일반 처리는 개인정보보호법, 신용정보는 신용정보법.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s3-credit',
      title: '데이터 3법 ③ 신용정보법',
      quizId: 'adsp-1-2-cp-03-credit',
      dialogue: [
        { pose: 'wave', text: '셋째 [신용정보법] — 금융·신용 영역.' },
        { pose: 'think', text: '신용평가·금융거래의 신용정보 처리 규제.' },
        { pose: 'idle', text: '신용정보법 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '신용정보법은 금융거래·신용평가에 사용되는 신용정보의 수집·이용·제공·집중관리(신용정보집중기관) 등을 규제. 마이데이터(본인신용정보관리업) 의 근거 법.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"금융·신용정보", "마이데이터". 일반 개인정보면 개인정보보호법, 통신서비스면 정보통신망법.',
        },
      ],
    },
    {
      id: 'adsp-1-2-s4',
      title: '빅데이터 비유 · 위기요인',
      quizId: 'adsp-1-2-cp-04',
      dialogue: [
        { pose: 'wave', text: '빅데이터가 뭐와 닮았다고들 할까? [4가지 비유]가 시험에 자주 나와.' },
        { pose: 'think', text: '[산업혁명 석탄·철](원동력) · [원유](정제해야 쓸모) · [렌즈](관찰·발견) · [플랫폼](토대).' },
        { pose: 'lightbulb', text: '근데 위기도 있어 — [사생활 침해] · [책임원칙 훼손] · [데이터 오용(과신)].' },
        { pose: 'happy', text: '대응은 "[동의제 → 책임제]", "결과 기반 책임", "알고리즘 [접근·감사] 허용".' },
        { pose: 'idle', text: '비유 4개와 위기-대응 짝 정리 끝, 문제!' },
      ],
      blocks: [
        {
          kind: 'table',
          title: '4가지 비유와 강조점',
          headers: ['비유', '강조점'],
          rows: [
            ['산업혁명 석탄·철', '사회를 근본적으로 바꾸는 원동력'],
            ['원유', '정제해야 쓸모 있어진다'],
            ['렌즈', '세상을 새롭게 관찰·발견하게 해준다'],
            ['플랫폼', '다른 서비스가 그 위에서 자라는 토대'],
          ],
        },
        {
          kind: 'table',
          title: '위기요인 · 대응',
          headers: ['위기', '대응'],
          rows: [
            ['사생활 침해', '동의제 → 책임제 전환'],
            ['책임원칙 훼손', '결과 기반 책임원칙 고수'],
            ['데이터 오용(과신)', '알고리즘 접근·감사 허용'],
          ],
        },
      ],
    },
  ],
};

const ADSP_1_3: Lesson = {
  id: 'adsp-1-3',
  subject: 'adsp',
  chapter: 1,
  chapterTitle: '데이터 이해',
  topic: '가치 창조를 위한 데이터 사이언스',
  title: '데이터 사이언티스트라는 직업',
  hook: '코딩·수학·비즈니스 — 세 가지를 다 해야 한다면?',
  estimatedMinutes: 6,
  steps: [
    {
      id: 'adsp-1-3-s1',
      title: '핵심 3축 — "AI 비"',
      quizId: 'adsp-1-3-cp-01',
      dialogue: [
        { pose: 'wave', text: '[데이터 사이언스]는 통계학보다 훨씬 넓은 판이야.' },
        { pose: 'think', text: '통계가 [수식]이라면 DS는 여기에 [컴퓨터공학](속도)과 [비즈니스](목적)까지 합쳐져.' },
        { pose: 'lightbulb', text: '핵심 3축 = [A]nalytics · [I]T · [B]usiness. 첫 글자 "[AI 비]" 로 외우자!' },
        { pose: 'happy', text: '세 꼭짓점의 [교집합]에서 데이터 사이언스가 태어나는 거야.' },
        { pose: 'idle', text: '이 3축, 문제로 확인해보자.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '데이터 사이언스는 "데이터에서 가치를 뽑는 종합 예술". 통계학이 엄밀한 수식 위에서 움직인다면, 데이터 사이언스는 여기에 컴퓨터공학(속도)과 비즈니스(목적) 가 합쳐진 훨씬 넓은 판입니다. 한 사람이 셋을 다 갖추기는 어렵고 보통 팀으로 협업합니다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '핵심 구성요소 — "AI 비"',
          body:
            'Analytics(분석) + IT(정보기술) + Business(비즈니스 컨설팅). 세 꼭짓점의 교집합에서 데이터 사이언스가 태어납니다.',
        },
        {
          kind: 'table',
          title: '3축 한눈에 — 무엇을 책임지나',
          headers: ['축', '책임', '대표 활동', '핵심 도구'],
          rows: [
            ['Analytics', '데이터로 답을 찾아내기', '모델링·통계 분석·검정', 'Python·R·SAS'],
            ['IT', '데이터를 다룰 인프라', '파이프라인·DB·분산 처리', 'SQL·Spark·클라우드'],
            ['Business', '문제 정의·의사결정 연결', '도메인 이해·전략 수립', 'Tableau·발표·미팅'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시험 함정 — 통계학과의 관계',
          body:
            '"데이터 사이언스 = 통계학" 은 틀림. 통계학은 Analytics 한 축의 일부이고, 데이터 사이언스는 IT·Business 까지 포함하는 더 넓은 개념. 즉 데이터 사이언스 ⊃ 통계학.',
        },
      ],
    },
    {
      id: 'adsp-1-3-s2',
      title: 'Hard Skill vs Soft Skill',
      quizId: 'adsp-1-3-cp-02',
      dialogue: [
        { pose: 'wave', text: '데이터 사이언티스트의 역량은 두 부류로 나뉘어.' },
        { pose: 'think', text: '[Hard Skill] — 배워서 익히는 기술. 머신러닝, SQL, 프로그래밍.' },
        { pose: 'lightbulb', text: '[Soft Skill] — 태도·관점·커뮤니케이션. [통찰], [스토리텔링], [협력].' },
        { pose: 'happy', text: '시험은 "어떤 역량이 어느 쪽이냐" 매칭을 자주 물어. Hard = 기술, Soft = 태도!' },
        { pose: 'idle', text: '역량 매칭 문제로 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '배워서 익히는 것 vs 태도·관점',
          body:
            'Hard 는 "배워서 익히는 기술" — 머신러닝, SQL, 프로그래밍. Soft 는 "태도·관점·커뮤니케이션" — 통찰, 스토리텔링, 협력. 시험은 어떤 역량이 어느 쪽인지 매칭을 묻습니다.',
        },
        {
          kind: 'table',
          headers: ['분류', '해당 역량'],
          rows: [
            ['Hard Skill', '빅데이터 이론·기법 숙련, 분석기술 능숙'],
            ['Soft Skill', '통찰력, 시각화·커뮤니케이션, 협력·스토리텔링'],
          ],
        },
      ],
    },
    // ─── Digital CA메라 6역량 — 1 step → 7 substeps (overview + 6 역량) ───
    {
      id: 'adsp-1-3-s3',
      title: 'DS 6역량 — "Digital CA메라" 개요',
      quizId: 'adsp-1-3-cp-03',
      dialogue: [
        { pose: 'wave', text: '데이터 사이언티스트 6역량 — "Digital CA메라".' },
        { pose: 'think', text: '[C]·[A]·[M]·[E]·[R]·[A] — Comm·Analytics·Math·Eng·Research·Art.' },
        { pose: 'idle', text: '먼저 6역량 매핑 + 함정.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '앞서 본 3축(Analytics·IT·Business) 을 더 잘게 쪼개 6가지 구체적 역량으로 표현한 것이 "Digital CA메라". 시험에선 6개 알파벳에 무엇이 매핑되는지·매핑 안 되는 단어가 무엇인지를 자주 묻습니다 — Management 가 단골 함정.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '암기법 — "Digital CA메라" (CAMERA)',
          body:
            'C·A·M·E·R·A = Communication · Analytics · Math · Engineering · Research · Art. 6개 모두 영어 알파벳 첫 글자가 같아서 시험에 섞어 묻기 좋음. 답에 "Management" 가 보이면 즉시 오답 처리.',
        },
        {
          kind: 'table',
          title: '6역량 한눈에 — 어떤 일을 하나',
          headers: ['역량', '한 줄 정의', '대표 활동'],
          rows: [
            ['Communication', '결과를 청중에게 전달', '시각화·스토리텔링·발표'],
            ['Analytics', '도메인 + 분석 기법', '문제 정의·모델 선택'],
            ['Math', '수학·통계 기반', '확률·선형대수·검정'],
            ['Engineering', '시스템·코드 구현', '파이프라인·DB·배포'],
            ['Research', '새 가설·기법 탐구', '논문·R&D·실험 설계'],
            ['Art', '창의·디자인·통찰', '시각화 미감·새 관점 발견'],
          ],
        },
        {
          kind: 'keypoints',
          title: '의사결정의 진화 (참고)',
          items: [
            '직관 → 데이터 기반 → 예측 → 처방',
            '예측: "무슨 일이 일어날까?" (forecast)',
            '처방: "그럼 무엇을 해야 할까?" (prescribe)',
            '6역량 모두 갖춰야 처방까지 가능',
          ],
        },
      ],
    },
    {
      id: 'adsp-1-3-s3-c',
      title: '6역량 ① Communication',
      quizId: 'adsp-1-3-cp-03-c',
      dialogue: [
        { pose: 'wave', text: '첫째 [Communication] — 분석 결과 전달력.' },
        { pose: 'think', text: '시각화·스토리텔링·이해관계자 설득.' },
        { pose: 'idle', text: 'Communication 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Communication 은 분석 결과를 비즈니스 청중에 맞게 풀어내는 역량 — 시각화·스토리텔링·발표.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"전달", "스토리텔링", "시각화 발표". 통계·수식이면 Math, 시스템·코드면 Engineering.',
        },
      ],
    },
    {
      id: 'adsp-1-3-s3-a',
      title: '6역량 ② Analytics',
      quizId: 'adsp-1-3-cp-03-a',
      dialogue: [
        { pose: 'wave', text: '둘째 [Analytics] — 분석 기법·도메인 지식.' },
        { pose: 'think', text: '도메인 문제 정의 + 적합한 분석 방법 선택.' },
        { pose: 'idle', text: 'Analytics 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Analytics 는 도메인 이해 + 분석 기법 선택 능력. 어떤 비즈니스 문제에 어떤 모델·기법이 맞는지 판단하는 역량.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"도메인 + 분석 기법", "문제 정의 + 모델 선택". 순수 수학·통계면 Math, 새로운 가설 발굴이면 Research.',
        },
      ],
    },
    {
      id: 'adsp-1-3-s3-m',
      title: '6역량 ③ Math (수학·통계)',
      quizId: 'adsp-1-3-cp-03-m',
      dialogue: [
        { pose: 'wave', text: '셋째 [Math] — 수학·통계 이론.' },
        { pose: 'think', text: '확률·선형대수·미적분이 모델의 뼈대.' },
        { pose: 'idle', text: 'Math 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Math 는 통계·확률·선형대수·미적분 등 분석의 수학적 기반. 모델 가정·수식 유도·검정의 토대.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"확률·통계", "선형대수", "미적분". 코드·시스템이면 Engineering, 청중 설득이면 Communication.',
        },
      ],
    },
    {
      id: 'adsp-1-3-s3-e',
      title: '6역량 ④ Engineering',
      quizId: 'adsp-1-3-cp-03-e',
      dialogue: [
        { pose: 'wave', text: '넷째 [Engineering] — 데이터·시스템 구축.' },
        { pose: 'think', text: '파이프라인·DB·인프라·코드 구현.' },
        { pose: 'idle', text: 'Engineering 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Engineering 은 데이터 파이프라인·DB·분산 처리·코드 구현 능력. 모델을 실제 서비스로 옮기는 데 필수.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"파이프라인", "DB·시스템", "구현·코드". 수식·확률이면 Math, 도메인 분석이면 Analytics.',
        },
      ],
    },
    {
      id: 'adsp-1-3-s3-r',
      title: '6역량 ⑤ Research',
      quizId: 'adsp-1-3-cp-03-r',
      dialogue: [
        { pose: 'wave', text: '다섯째 [Research] — 새 가설·기법 탐구.' },
        { pose: 'think', text: '논문·신기법 도입, R&D 적 사고.' },
        { pose: 'idle', text: 'Research 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Research 는 기존 모델·기법으로 풀리지 않는 문제에 대해 새 가설·접근을 탐구하는 R&D 역량.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"새 가설·기법", "논문·R&D", "탐색적 연구". 검증된 기법 적용은 Analytics, 시각화 전달은 Communication.',
        },
      ],
    },
    {
      id: 'adsp-1-3-s3-art',
      title: '6역량 ⑥ Art (디자인·창의)',
      quizId: 'adsp-1-3-cp-03-art',
      dialogue: [
        { pose: 'wave', text: '여섯째 [Art] — 통찰·창의·디자인 감각.' },
        { pose: 'think', text: '데이터에서 새 관점·디자인을 끌어내는 능력.' },
        { pose: 'idle', text: 'Art 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Art 는 데이터에서 통찰·창의적 관점·미적 디자인을 끌어내는 비기술적 역량. 시각화 미감, 새 가치 발견의 직관.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"창의·통찰", "디자인 감각". 단순 발표면 Communication, 새 가설 R&D 면 Research. Management 는 6역량에 없음 — 시험 함정.',
        },
      ],
    },
  ],
};

export const ADSP_CH1_LESSONS: Lesson[] = [
  ADSP_1_1,
  ADSP_1_2,
  ADSP_1_3,
];
