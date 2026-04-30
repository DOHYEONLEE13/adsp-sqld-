import type { Lesson } from '../types';

const ADSP_2_1: Lesson = {
  id: 'adsp-2-1',
  subject: 'adsp',
  chapter: 2,
  chapterTitle: '데이터 분석 기획',
  topic: '데이터 분석 기획의 이해',
  title: '분석의 4가지 유형과 방법론',
  hook: '"문제를 안다 × 방법을 안다" — 2×2 칸이 분석을 결정합니다.',
  estimatedMinutes: 9,
  steps: [
    // ─── 분석 4유형 (What × How) — 1 step → 5 substeps ───
    {
      id: 'adsp-2-1-s1',
      title: '분석 4유형 — What × How (개요)',
      quizId: 'adsp-2-1-cp-01',
      dialogue: [
        { pose: 'wave', text: '분석 프로젝트 실패 1위 — 엉뚱한 방법을 엉뚱한 문제에.' },
        { pose: 'think', text: '두 축: [What] (풀 것이 분명?) × [How] (푸는 법 아는?).' },
        { pose: 'happy', text: '4 칸: Optimization · Solution · Insight · Discovery.' },
        { pose: 'idle', text: '먼저 매트릭스 구조부터.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"What 을 안다 / 모른다" × "How 를 안다 / 모른다" 의 2×2. 각 칸이 다른 분석 전략을 요구합니다.',
        },
        {
          kind: 'table',
          title: 'What × How = 4유형',
          headers: ['What', 'How', '유형'],
          rows: [
            ['○', '○', 'Optimization (최적화)'],
            ['○', '×', 'Solution (방법 탐색)'],
            ['×', '○', 'Insight (대상 발견)'],
            ['×', '×', 'Discovery (전방위 탐험)'],
          ],
        },
      ],
    },
    {
      id: 'adsp-2-1-s1-opt',
      title: '4유형 ① Optimization — "둘 다 안다"',
      quizId: 'adsp-2-1-cp-01-opt',
      dialogue: [
        { pose: 'wave', text: '[Optimization] — 풀 [문제] 도 알고, 푸는 [방법] 도 안다.' },
        { pose: 'think', text: '이미 굴러가는 시스템을 [더 잘 굴러가게] 하는 거.' },
        { pose: 'happy', text: '예: 택배 회사가 이미 쓰는 경로 최적화 모델의 파라미터만 조정해 비용 5% 추가 절감.' },
        { pose: 'idle', text: 'Optimization 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Optimization(최적화) 는 What(풀 문제) 도 분명하고 How(푸는 방법) 도 갖춰진 가장 안정된 상태입니다. 새로운 모델을 만드는 게 아니라 이미 잘 작동하는 모델·프로세스의 효율을 한 단계 더 끌어올리는 일 — 파라미터 튜닝, 자원 배분 재조정, 운영 최적화.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '쿠팡이 이미 운영 중인 물류 경로 최적화 모델에서 변수만 조정해 연간 배송비 5% 절감 / 광고 회사가 기존 입찰 알고리즘의 학습률·임계값만 미세 조정해 ROAS 7% 개선 / 콜센터가 기존 인력 배치 모델의 가중치만 변경해 평균 대기시간 12초 단축. 모두 "새로 뭘 만든다" 가 아니라 "원래 있던 걸 더 잘 굴린다".',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "튜닝 / 미세 조정 / 효율 개선"',
          body:
            '"파라미터 튜닝", "자원 배분 최적화", "기존 모델 효율 개선" 이 키워드면 Optimization. 모델 자체를 새로 고를 단계면 Solution, 풀 대상부터 찾아야 하면 Insight 또는 Discovery.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s1-sol',
      title: '4유형 ② Solution — "문제는 알지만 방법을 모른다"',
      quizId: 'adsp-2-1-cp-01-sol',
      dialogue: [
        { pose: 'wave', text: '[Solution] — 풀 [문제] 는 분명, 푸는 [방법] 이 미정.' },
        { pose: 'think', text: '예: "고객 이탈을 예측하자" 는 분명한데, 어떤 모델로 풀어야 할진 아직 정해지지 않았어.' },
        { pose: 'happy', text: '여러 후보(로지스틱·랜덤포레스트·XGBoost) 를 비교해 가장 잘 맞는 걸 고르는 단계.' },
        { pose: 'idle', text: 'Solution 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Solution(방법 탐색) 은 What 은 분명("어떤 결과를 얻고 싶은지" 명확) 한데 How 가 비어있는 단계입니다. 여러 분석 기법·모델을 후보로 두고 "이 문제엔 어느 기법이 가장 잘 맞을까?" 를 비교 실험하는 일.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '통신사가 "어떤 고객이 다음 달에 해지할까?" 라는 명확한 문제를 두고 로지스틱 회귀, 랜덤포레스트, XGBoost, LightGBM 4개 모델을 학습시켜 가장 잘 맞는 걸 채택 / 병원이 "수술 후 합병증을 예측" 이라는 문제에 대해 의사 룰 기반 vs 머신러닝 vs 딥러닝 3가지 접근을 비교해 적용 / 쇼핑몰이 "추천 정확도 향상" 목표로 협업 필터링·콘텐츠 기반·하이브리드 후보를 비교. 풀어야 할 게 뭔지는 명확.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "여러 기법 비교"',
          body:
            '"여러 알고리즘 비교 후 선택", "최적 모델 선정" 이 키워드면 Solution. 이미 모델 정해져 있고 튜닝만이면 Optimization, 풀 문제 자체가 미정이면 Discovery.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s1-ins',
      title: '4유형 ③ Insight — "방법은 있지만 풀 대상이 없다"',
      quizId: 'adsp-2-1-cp-01-ins',
      dialogue: [
        { pose: 'wave', text: '[Insight] — 푸는 [방법] 은 안다, 풀 [대상] 이 미정.' },
        { pose: 'think', text: '"우리 회사 데이터로 뭐 재미난 거 없을까?" 식이야.' },
        { pose: 'happy', text: '예: 보유한 회원 데이터에서 새로운 고객 세그먼트(VIP·휴면·신규맘) 를 발굴.' },
        { pose: 'idle', text: 'Insight 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Insight(대상 발견) 는 How(분석 도구·기법) 는 갖춰져 있지만 What(어디에 적용할까) 이 비어 있는 단계입니다. "우리 회사가 잘하는 회귀·군집·EDA 를 어디에 써먹지?" 라는 질문에서 시작해 데이터에서 가치 있는 분석 대상을 발굴하는 일.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '카드사가 보유한 고객 결제 데이터에 군집 분석을 돌려 새로운 5개 고객 세그먼트(미식가·트래블러·홈쇼퍼…) 를 발견 → 이후 마케팅 캠페인 설계 / 통신사가 통화 패턴 데이터에 EDA 를 돌려 "주말 야간 요금제" 라는 새 상품 컨셉 발굴 / 의료기관이 환자 진료 기록에서 이상 패턴(예: 특정 약물 조합 부작용) 을 데이터 마이닝으로 자동 탐지. 모두 "데이터를 먼저 들여다보다가 흥미로운 무언가를 찾는" 흐름.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "패턴 발견 / 새 세그먼트 / 흥미로운 발견"',
          body:
            '"이상 패턴 발견", "새 고객 세그먼트 발굴" 같이 출발이 데이터인 표현이면 Insight. 풀 대상 + 방법 모두 모르는 진짜 미지면 Discovery.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s1-dis',
      title: '4유형 ④ Discovery — "둘 다 모른다"',
      quizId: 'adsp-2-1-cp-01-dis',
      dialogue: [
        { pose: 'wave', text: '[Discovery] — 풀 [문제] 도, 푸는 [방법] 도 모른다.' },
        { pose: 'think', text: '신규 사업·미지의 시장이라 [가설부터] 세워야 해.' },
        { pose: 'happy', text: '예: 메타버스 사업을 처음 시작하는 회사 — 어떤 데이터를 쌓아 어떤 가치를 낼지 자체가 미정.' },
        { pose: 'idle', text: 'Discovery 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Discovery(전방위 탐험) 는 What 도 How 도 모두 비어있는 가장 모험적인 영역입니다. 가설·문제 정의부터 시작해서 어떤 데이터가 의미 있는지, 어떤 기법으로 접근할지까지 전부 만들어가는 R&D 적 분석.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '대기업이 "메타버스 사업 진출 가능성" 을 검토 — 어떤 데이터(VR 사용 패턴? 게임 로그? SNS 트렌드?) 를 봐야 할지부터 막막한 상태 / 농업회사가 "기후위기 시대의 새 작물" 을 모색 — 풀 문제도, 적합한 기법도 모두 가설로부터 출발 / 신생 헬스케어 스타트업이 "예방의학 수요 발굴" 을 위해 산업 데이터·고객 인터뷰·논문을 동시에 들여다봄. 모두 "지도 없는 탐험".',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "신규 사업 / 미지 / 가설부터"',
          body:
            '"신규 사업 가능성 탐색", "탐색적 R&D", "가설부터 세움" 이 키워드면 Discovery. 풀 문제가 분명하면 Solution/Optimization, 풀 대상만 비어있으면 Insight.',
        },
      ],
    },
    // ─── KDD vs CRISP-DM — 1 step → 3 substeps (overview + KDD + CRISP) ───
    {
      id: 'adsp-2-1-s2',
      title: '분석 프로세스 — KDD vs CRISP-DM 개요',
      quizId: 'adsp-2-1-cp-02',
      dialogue: [
        { pose: 'wave', text: '분석 프로세스 두 표준 — [KDD] 5단계 · [CRISP-DM] 6단계.' },
        { pose: 'think', text: '큰 틀은 같지만 단계 수·이름이 다름.' },
        { pose: 'idle', text: '먼저 비교 매트릭스부터.' },
      ],
      blocks: [
        {
          kind: 'table',
          title: '두 프로세스 비교',
          headers: ['구분', 'KDD (5)', 'CRISP-DM (6)'],
          rows: [
            ['1', '데이터 선택', '업무 이해'],
            ['2', '데이터 전처리', '데이터 이해'],
            ['3', '데이터 변환', '데이터 준비'],
            ['4', '데이터 마이닝', '모델링'],
            ['5', '해석/평가', '평가'],
            ['6', '—', '전개'],
          ],
        },
      ],
    },
    {
      id: 'adsp-2-1-s2-kdd',
      title: 'KDD 5단계',
      quizId: 'adsp-2-1-cp-02-kdd',
      dialogue: [
        { pose: 'wave', text: '[KDD] 5단계: 선택·전처리·변환·마이닝·해석/평가.' },
        { pose: 'think', text: '학술적 색채. 데이터부터 시작 (업무이해 단계 없음).' },
        { pose: 'idle', text: 'KDD 단계 순서를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'KDD(Knowledge Discovery in Databases) 는 1996년 Fayyad 가 정립한 5단계 프로세스. 데이터 선택 → 전처리 → 변환 → 마이닝 → 해석·평가.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"5단계", "선택·전처리·변환·마이닝·해석". 6단계+업무이해 시작이면 CRISP-DM.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s2-crisp',
      title: 'CRISP-DM 6단계 — "업데데이트모델평가전"',
      quizId: 'adsp-2-1-cp-02-crisp',
      dialogue: [
        { pose: 'wave', text: '[CRISP-DM] 6단계: 업무→데이터이해→준비→모델링→평가→전개.' },
        { pose: 'think', text: '"[업데데이트모델평가전]" 그대로 시험에 나옴.' },
        { pose: 'idle', text: 'CRISP-DM 단계 순서를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'CRISP-DM(Cross-Industry Standard Process for Data Mining) 은 산업 표준. 6단계: 업무 이해 → 데이터 이해 → 데이터 준비 → 모델링 → 평가 → 전개. 비즈니스 의도에서 출발하고 배포까지.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"업데데이트모델평가전"',
          body:
            '업무이해 · 데이터이해 · 데이터준비 · 모델링 · 평가 · 전개. 5단계·해석으로 끝나면 KDD.',
        },
      ],
    },
    // ─── 하향식 4단계 — 1 step → 5 substeps ───
    {
      id: 'adsp-2-1-s3',
      title: '하향식 접근 — "탐·정·해·타" 개요',
      quizId: 'adsp-2-1-cp-03',
      dialogue: [
        { pose: 'wave', text: '문제가 분명할 때 쓰는 정석 — [하향식 접근].' },
        { pose: 'think', text: '4단계: [탐]색 → [정]의 → [해]결방안 → [타]당성. "[탐정해타]" 로 외워.' },
        { pose: 'idle', text: '먼저 4단계 순서를 확인.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '하향식(Top-down) 접근은 풀어야 할 문제가 명확할 때 쓰는 정석. 4단계 순서가 시험에 그대로 나옵니다 — "탐정해타".',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"탐·정·해·타"',
          body:
            '문제 탐색(Exploration) → 문제 정의(Definition) → 해결방안 탐색(Solution) → 타당성 검토(Feasibility).',
        },
      ],
    },
    {
      id: 'adsp-2-1-s3-explore',
      title: '하향식 ① 문제 [탐]색 — "넓게 훑는다"',
      quizId: 'adsp-2-1-cp-03-explore',
      dialogue: [
        { pose: 'wave', text: '첫 단계 [탐] — 어떤 문제들이 있는지 [넓게] 모으는 단계.' },
        { pose: 'think', text: '회사 안(업·제·고·에) + 회사 밖(STEEP) 두 렌즈로 빠짐없이 둘러봐.' },
        { pose: 'happy', text: '예: "신상품 매출 침체" / "고객 이탈 가속" / "원자재 가격 변동" 같은 후보들을 줄줄이 적는 단계야.' },
        { pose: 'idle', text: '탐색 단계 행동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '문제 탐색(Exploration) 은 풀어야 할 문제 후보를 빠짐없이 모으는 단계입니다. 처음부터 한두 개로 좁히지 않고 일단 넓게 펼쳐놓는 게 핵심 — 회사 안과 밖, 두 관점을 교차하면 사각지대를 줄일 수 있습니다.',
        },
        {
          kind: 'section',
          title: '두 렌즈로 보기 — 내부 / 외부',
          body:
            '내부 관점("업·제·고·에"): 업무 프로세스의 비효율, 제품의 결함·기회, 고객 경험의 불편, 외부 협력사·공급망 이슈. 외부 관점(STEEP): Social(소셜·문화 트렌드), Technology(신기술 등장), Economic(경기·환율), Environment(기후·자원), Political(규제·정책). 이 5축을 한 바퀴 돌면 외부 환경 변화로 인한 신규 문제를 놓치지 않습니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "후보를 줄줄이 적는다"',
          body:
            '"문제 후보를 펼쳐놓는다", "내·외부 환경 분석" 이 키워드면 탐색. 한 문제를 골라 측정 가능하게 다시 쓰는 단계는 다음(정의).',
        },
      ],
    },
    {
      id: 'adsp-2-1-s3-define',
      title: '하향식 ② 문제 [정]의 — "측정 가능하게 다시 쓴다"',
      quizId: 'adsp-2-1-cp-03-define',
      dialogue: [
        { pose: 'wave', text: '둘째 [정] — 후보 중 하나를 골라 [숫자로 풀 수 있게] 다시 써.' },
        { pose: 'think', text: '"매출 부진" 은 분석 문제 아냐. "다음 달 이탈 확률 예측 → 이탈률 5%↓" 가 분석 문제.' },
        { pose: 'happy', text: '비즈니스 언어 → 데이터·지표 언어로 [번역] 하는 단계.' },
        { pose: 'idle', text: '정의 단계 행동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '문제 정의(Definition) 는 탐색에서 모은 후보 중 한 개를 골라 "데이터로 풀 수 있는 형태" 로 다시 쓰는 단계입니다. "요즘 매출이 좀 부진해" 같은 구어체 비즈니스 문제는 분석가가 그대로 풀 수 없어요. 측정 가능한 지표·시점·범위로 좁혀줘야 합니다.',
        },
        {
          kind: 'section',
          title: '예시로 — 비즈니스 → 분석 번역',
          body:
            '"고객들이 빠져나가는 것 같다" → "최근 3개월 활성 고객 중 다음 달 이탈할 사용자 식별 → 이탈률 5%p 감소" / "신상품이 안 팔린다" → "출시 후 4주차 재구매율 < 12% 인 상품 사전 선별 → 진열 우선순위 조정" / "재고가 자주 부족하다" → "주별 SKU 단위 수요 예측 → 안전재고 재산정". 모두 (1) 측정 단위 (2) 시간 범위 (3) 의사결정 행동이 분명합니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "지표·시점·행동"',
          body:
            '"비즈니스 문제 → 분석 문제 변환", "측정 가능한 KPI 설정" 이 키워드면 정의. 후보 발굴이 키워드면 탐색, 방법 비교면 해결방안.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s3-solve',
      title: '하향식 ③ [해]결방안 탐색 — "어떤 방법으로?"',
      quizId: 'adsp-2-1-cp-03-solve',
      dialogue: [
        { pose: 'wave', text: '셋째 [해] — 정의된 문제에 [어떤 도구·기법] 으로 답을 낼지 비교.' },
        { pose: 'think', text: '예: "이탈 예측" 을 로지스틱·랜덤포레스트·XGBoost 중 무엇으로 풀까?' },
        { pose: 'happy', text: '실행은 아직. "이걸 쓸 수 있을까?" 까지의 검토 단계.' },
        { pose: 'idle', text: '해결방안 단계 행동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '해결방안 탐색(Solution) 은 정의된 분석 문제에 대해 풀이 방법 후보를 나열하고 비교하는 단계입니다. 어떤 알고리즘으로? 어떤 데이터를? 어떤 시스템 위에서? — 도구·기법·데이터 소스의 후보를 줄세우고 일차 비교를 합니다. 실제로 운영에 올리기 전 단계.',
        },
        {
          kind: 'section',
          title: '예시로 — 후보 비교',
          body:
            '이탈 예측 문제라면: 모델 후보 = 로지스틱·랜덤포레스트·XGBoost·딥러닝 / 데이터 소스 후보 = 결제 로그·앱 활동·고객센터 문의 / 인프라 후보 = 사내 서버·AWS SageMaker·GCP Vertex. 각각의 정확도·속도·비용·구현 난이도를 일차 정리. 이 단계에서 "이건 우리가 할 수 있겠다" 까지만 결정.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "기법 후보 비교"',
          body:
            '"어떤 알고리즘으로 풀지 비교", "데이터·시스템 아키텍처 검토" 가 키워드면 해결방안. 비용 ROI·조직 수용성까지 따지면 다음 단계(타당성).',
        },
      ],
    },
    {
      id: 'adsp-2-1-s3-feas',
      title: '하향식 ④ [타]당성 검토 — "정말 굴러갈까?"',
      quizId: 'adsp-2-1-cp-03-feas',
      dialogue: [
        { pose: 'wave', text: '마지막 [타] — 실행 직전 [3축] 으로 실행 가능성 최종 점검.' },
        { pose: 'think', text: '경제적(돈 되나?) · 기술적(만들 수 있나?) · 운영적(조직이 받아들이나?).' },
        { pose: 'happy', text: '한 축이라도 빨간불이면 다시 정의·해결방안으로 회귀.' },
        { pose: 'idle', text: '타당성 검토 활동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '타당성 검토(Feasibility) 는 실제 프로젝트 착수 직전, "정말 진행 가능한가?" 를 3축으로 점검하는 마지막 관문입니다. 한 축이라도 막히면 앞 단계로 돌아가 후보를 다시 고려해야 합니다.',
        },
        {
          kind: 'section',
          title: '3축으로 보기',
          body:
            '경제적 타당성: 들어갈 비용 vs 기대 수익. ROI 가 양인가? 수익 회수 기간이 얼마? / 기술적 타당성: 우리 팀이 만들 수 있나? 필요한 데이터를 확보할 수 있나? 인프라가 되나? / 운영적 타당성: 사용 부서가 이 결과를 실제로 의사결정에 쓸까? 조직이 변화를 수용할까? 보안·규제 이슈는?',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "비용·기술·조직 동시 점검"',
          body:
            '"ROI 검토", "데이터 확보 가능성", "조직 수용성" 같은 표현이 등장하면 타당성. 단순히 "어떤 기법이 좋을까" 비교만이면 해결방안.',
        },
      ],
    },
    // ─── 분석 방법론 5종 — 1 step → 6 substeps ───
    {
      id: 'adsp-2-1-s4',
      title: '분석 방법론 5종 — 개요',
      quizId: 'adsp-2-1-cp-04',
      dialogue: [
        { pose: 'wave', text: '분석 방법론 5종 (SW공학에서 넘어옴).' },
        { pose: 'think', text: '[Waterfall] · [Prototype] · [Spiral] · [Agile] · [RAD].' },
        { pose: 'idle', text: '먼저 5종 매칭 + 상황별 선택.' },
      ],
      blocks: [
        {
          kind: 'table',
          title: '상황 → 방법론',
          headers: ['모델', '언제'],
          rows: [
            ['Waterfall', '요구사항 명확'],
            ['Prototype', '요구사항 불명확'],
            ['Spiral', '대형·위험 큰 프로젝트'],
            ['Agile', '요구 변화 잦음'],
            ['RAD', '단기 사이클 필요'],
          ],
        },
      ],
    },
    {
      id: 'adsp-2-1-s4-waterfall',
      title: '방법론 ① Waterfall — "물 흐르듯, 되돌릴 수 없다"',
      quizId: 'adsp-2-1-cp-04-waterfall',
      dialogue: [
        { pose: 'wave', text: '첫째 [Waterfall] — 순차적으로 한 단계씩 [되돌릴 수 없게] 흘러감.' },
        { pose: 'think', text: '분석 → 설계 → 구현 → 테스트 → 배포. 다음 단계로 가면 끝.' },
        { pose: 'happy', text: '예: 정부·관공서 시스템 — 요구사항이 법적으로 고정돼 있어 변경이 거의 없음.' },
        { pose: 'idle', text: 'Waterfall 적용 상황을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Waterfall(폭포수) 은 단계가 순차적으로 진행되어 한 번 다음 단계로 가면 이전으로 되돌리기 어려운 방법론입니다. 폭포처럼 위에서 아래로 한 방향으로만 흐른다는 뜻에서 이름이 붙었어요. 요구사항이 처음부터 명확하고 변경이 거의 없는 프로젝트에서만 효율적입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '정부 행정망 시스템 — 법령으로 요구사항이 고정 / 항공기 제어 SW — 안전 표준이 미리 명시 / 대형 SI 프로젝트에서 발주처가 요구사항을 사전 문서화 후 RFP 발주. 모두 "처음부터 무엇을 만들지가 명확" 한 케이스라 단계 간 되돌아갈 일이 적습니다. 반대로 요구가 자주 바뀌는 스타트업 앱이라면 부적합.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "순차 / 변경 적음"',
          body:
            '"순차 진행", "요구 명확", "되돌리기 어려움" 이 키워드면 Waterfall. 변경이 잦으면 Agile, 위험 평가가 핵심이면 Spiral.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s4-prototype',
      title: '방법론 ② Prototype — "일단 만들어 보여주고 피드백"',
      quizId: 'adsp-2-1-cp-04-prototype',
      dialogue: [
        { pose: 'wave', text: '둘째 [Prototype] — 일단 [시제품] 부터 만들어 사용자한테 보여줘.' },
        { pose: 'think', text: '요구사항이 모호할 때 "이런 거예요?" 하고 빠르게 보여주며 피드백.' },
        { pose: 'happy', text: '예: 신규 모바일 앱의 와이어프레임 → 사용성 테스트 → 다시 수정하는 사이클.' },
        { pose: 'idle', text: 'Prototype 적용 상황을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Prototype(시제품) 방법론은 요구사항이 처음부터 분명하지 않을 때 일단 동작하는 시제품을 빠르게 만들어 사용자에게 보여주고 피드백을 받아 개선하는 반복 사이클입니다. "말로 설명해도 사용자가 정확히 뭘 원하는지 모를 때" 가장 강력 — 사용자도 만든 걸 봐야 진짜 원하는 걸 깨닫는 경우가 많거든요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '신규 모바일 앱의 와이어프레임을 Figma 로 빠르게 만들어 잠재 사용자에게 보여주고 클릭 흐름 피드백 / B2B SaaS 의 새 대시보드 — 더미 데이터로 시제품 한 페이지 만들어 고객 인터뷰 / VR 콘텐츠 — 단순한 360도 영상부터 시작해 사용자 반응 보고 점진 확장. 모두 "본격 개발 전 가설 검증" 단계.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "시제품 / 사용자 피드백"',
          body:
            '"시제품 → 피드백", "요구 불명확" 이 키워드면 Prototype. 위험 관리 강조면 Spiral, 짧은 반복이면 Agile/RAD.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s4-spiral',
      title: '방법론 ③ Spiral — "반복 + 매 회 위험 점검"',
      quizId: 'adsp-2-1-cp-04-spiral',
      dialogue: [
        { pose: 'wave', text: '셋째 [Spiral] — 반복은 하는데 매 사이클마다 [위험 평가] 가 끼어 있어.' },
        { pose: 'think', text: '대형·신기술·예산 큰 프로젝트에서 사용. 한 사이클 망치면 손실이 크거든.' },
        { pose: 'happy', text: '예: 우주항공·국방·자율주행 — 매 단계 "이게 안전한가?" 를 통과해야 다음 단계.' },
        { pose: 'idle', text: 'Spiral 적용 상황을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Spiral(나선형) 은 반복 사이클 + 각 사이클마다 위험 분석을 결합한 방법론입니다. 한 사이클당 4단계(계획·위험분석·개발·평가) 를 돌고, 다음 사이클로 갈지 멈출지를 위험 평가 결과로 결정해요. 신기술·대형·고위험 프로젝트에 적합 — 한 번의 실패가 너무 비싸기 때문에 매 단계 점검이 필요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '자율주행 시스템 — 단계마다 안전 위험 평가 후 다음 단계 진입 / 우주 발사체 SW — 매 사이클 시뮬레이션·실험·위험 검토 / 의료 기기 SW — 규제·환자 안전 위험을 매 단계 평가 / 대형 은행 차세대 시스템 — 단계마다 컴플라이언스·운영 위험 검토. 모두 "한 번 실패하면 사람 다치거나 수십억 손실" 인 영역.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "반복 + 위험 평가"',
          body:
            '"반복 + 위험 관리", "대형/고위험 프로젝트" 가 키워드면 Spiral. 단순 시제품 검증이면 Prototype, 짧고 변화 수용이 핵심이면 Agile.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s4-agile',
      title: '방법론 ④ Agile — "2~4주 스프린트로 변화 수용"',
      quizId: 'adsp-2-1-cp-04-agile',
      dialogue: [
        { pose: 'wave', text: '넷째 [Agile] — [2~4주 단위 스프린트] 로 짧게 끊어 만들고 [변경] 수용.' },
        { pose: 'think', text: '한 스프린트 끝나면 동작하는 결과물 + 사용자 피드백 → 다음 스프린트 계획 조정.' },
        { pose: 'happy', text: '예: 토스·카카오의 SaaS 프로덕트 — 격주로 새 기능 출시·실험·롤백.' },
        { pose: 'idle', text: 'Agile 적용 상황을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Agile(애자일) 은 2~4주 짧은 반복 주기(스프린트) 를 돌며 매 스프린트마다 동작하는 결과물을 만들고 변경을 적극 수용하는 방법론입니다. "요구사항이 자주 바뀐다" 를 약점이 아닌 자연스러운 사실로 받아들이는 게 철학적 차이 — Waterfall 이 변경을 비용으로 본다면 Agile 은 변경을 학습으로 봅니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '토스·쿠팡 같은 SaaS — 매 스프린트 새 기능 배포·실험·KPI 측정·롤백 / 모바일 게임 — 사용자 데이터 보며 매 패치마다 밸런스 조정 / B2B SaaS — 고객 요청을 매 스프린트 우선순위에 반영 / 스타트업 MVP — 빠르게 만들고 가설 검증 → 다시 조정. 모두 "변화 수용 = 빠르게 학습" 의 철학.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "스프린트 / 변경 수용"',
          body:
            '"짧은 반복", "변경 수용", "스프린트" 가 키워드면 Agile. 시제품 검증이 중심이면 Prototype, 위험 관리 강조면 Spiral.',
        },
      ],
    },
    {
      id: 'adsp-2-1-s4-rad',
      title: '방법론 ⑤ RAD — "60~90일 안에 끝"',
      quizId: 'adsp-2-1-cp-04-rad',
      dialogue: [
        { pose: 'wave', text: '다섯째 [RAD] — Rapid Application Development. [60~90일] 단기 결과.' },
        { pose: 'think', text: '미리 만든 [모듈·컴포넌트] 를 빠르게 조립해 단기 완성.' },
        { pose: 'happy', text: '예: 고객사가 "분기 안에 데모 시스템 필요" 라고 짧은 데드라인 명시한 경우.' },
        { pose: 'idle', text: 'RAD 적용 상황을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'RAD(Rapid Application Development) 는 60~90일 같은 명확한 단기 데드라인 안에 결과물을 내야 하는 프로젝트에 쓰는 방법론입니다. 미리 만들어둔 모듈·컴포넌트·라이브러리를 빠르게 조립해 단기간에 동작하는 시스템을 완성. Agile 과 비슷해 보이지만 RAD 는 더 짧은 단발성 완료 사이클이 특징입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '내부 사내 도구 — 60일 안에 영업팀용 간단 CRM 완성 / 마케팅 캠페인 랜딩페이지 — 2~3주 단기 / 컨퍼런스용 데모 시스템 — 행사 전까지 완성 / 단기 R&D 프로토타이핑 — 분기 안에 PoC 산출. 모두 "데드라인 명확 + 기존 컴포넌트 적극 활용" 으로 빠르게 끝내는 영역.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "단기 데드라인 + 컴포넌트 조립"',
          body:
            '"빠른 개발", "단기 사이클", "60~90일" 이 키워드면 RAD. 지속 반복이면 Agile, 시제품-피드백이면 Prototype, 위험 관리·대형이면 Spiral.',
        },
      ],
    },
  ],
};

const ADSP_2_2: Lesson = {
  id: 'adsp-2-2',
  subject: 'adsp',
  chapter: 2,
  chapterTitle: '데이터 분석 기획',
  topic: '분석 마스터플랜',
  title: '조직을 움직이는 마스터플랜',
  hook: '좋은 아이디어도 조직 준비가 없으면 사장됩니다.',
  estimatedMinutes: 6,
  steps: [
    // ─── 우선순위 4사분면 — 1 step → 5 substeps ───
    {
      id: 'adsp-2-2-s1',
      title: '과제 우선순위 — 시급성 × 난이도 (개요)',
      quizId: 'adsp-2-2-cp-01',
      dialogue: [
        { pose: 'wave', text: '과제 100개? 한 번에 못 해. 순서가 필요.' },
        { pose: 'think', text: '두 축: [시급성] (지금?) × [난이도] (어려움?).' },
        { pose: 'idle', text: '먼저 4사분면 구조를 확인.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '과제 우선순위는 "지금 급한가" × "얼마나 어려운가" 의 2×2 매트릭스로 분류. 각 칸이 다른 행동을 권합니다.',
        },
        {
          kind: 'table',
          headers: ['시급성', '난이도', '권고'],
          rows: [
            ['Now', 'Easy', '1순위 즉시'],
            ['Now', 'Difficult', '장기 투자'],
            ['Future', 'Easy', '3순위'],
            ['Future', 'Difficult', '후순위'],
          ],
        },
      ],
    },
    {
      id: 'adsp-2-2-s1-now-easy',
      title: '우선순위 ① Now × Easy — "지금 + 쉬움 = 즉시 착수"',
      quizId: 'adsp-2-2-cp-01-ne',
      dialogue: [
        { pose: 'wave', text: '[Now × Easy] = 1순위. 망설일 이유가 없어.' },
        { pose: 'think', text: '효과는 빨리 나오고 비용·시간은 적게 드는 [Quick Win] 영역.' },
        { pose: 'happy', text: '예: 이미 있는 매출 데이터로 [지난달 vs 이번달] 대시보드 만들기.' },
        { pose: 'idle', text: '1순위에 해당하는 과제를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Now × Easy = 1순위. 시급성도 높고 난이도도 낮아 망설일 이유가 없는 과제입니다. 보통 데이터·인프라가 이미 갖춰져 있어 며칠~몇 주 안에 결과를 낼 수 있어요. 분석 조직이 처음 들어왔을 때 "조직의 신뢰" 를 빠르게 쌓는 카드로도 사용됩니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '이미 쌓인 매출 데이터로 "지난달 vs 이번달" 비교 대시보드 만들기 / 기존 고객 DB 에 RFM 분류 한 번 돌려서 VIP 세그먼트 추출 / 회원가입 폼의 이탈 단계를 GA 로그로 분석해 가장 비효율적인 1단계 개선. 모두 추가 데이터 수집·인프라 도입 없이 [기존 자원 + 며칠 작업] 으로 끝나는 일.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "단기 + 빠른 효과"',
          body:
            '"Quick Win", "단기 ROI 명확", "기존 자원으로 가능" 이 키워드면 1순위. 인프라·플랫폼 구축이 필요하면 Now×Difficult.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s1-now-hard',
      title: '우선순위 ② Now × Difficult — "지금 필요한데 어려움 = 장기 투자"',
      quizId: 'adsp-2-2-cp-01-nh',
      dialogue: [
        { pose: 'wave', text: '[Now × Difficult] — 지금 꼭 필요한데 [큰 투자] 가 필요해.' },
        { pose: 'think', text: '바로 끝낼 순 없으니 [단계적 로드맵] 으로 쪼개서 진행.' },
        { pose: 'happy', text: '예: 전사 데이터 플랫폼 구축 — 1년짜리지만 모든 분석의 토대가 됨.' },
        { pose: 'idle', text: '이 칸에 맞는 과제를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Now × Difficult = 시급성은 높은데 난이도도 높은 영역. 지금 안 하면 다른 분석들이 모두 막히지만, 한 번에 끝낼 수 없는 큰 투자가 필요한 과제들이 여기 옵니다. 단계적 로드맵·예산 분할·점진적 인도(MVP → 확장) 가 정석.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '전사 데이터 웨어하우스(DW) 신규 구축 — 1년짜리 프로젝트지만 끝나면 모든 부서가 통합 데이터를 쓸 수 있어 후속 분석이 모두 빨라짐 / 사내 머신러닝 플랫폼(MLOps) 도입 — 6~9개월 / 부서별 흩어진 고객 마스터 데이터 통합(MDM). 모두 "지금 안 하면 후속 분석 모두 정체" 라는 시급성 + "한 분기로는 안 끝남" 의 난이도가 결합.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "필수 인프라 / 6개월+"',
          body:
            '"전사 플랫폼", "대규모 시스템 통합", "필수지만 장기" 가 키워드면 이 칸. 짧고 빠르면 Now×Easy.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s1-fut-easy',
      title: '우선순위 ③ Future × Easy — "미래용 + 쉬움 = 3순위"',
      quizId: 'adsp-2-2-cp-01-fe',
      dialogue: [
        { pose: 'wave', text: '[Future × Easy] — 미래에 쓸만하고 부담도 적음.' },
        { pose: 'think', text: '지금 [급한 건 아님]. 자원 여유 있을 때 처리하는 [보너스] 영역.' },
        { pose: 'happy', text: '예: 보유 고객 만족도 데이터로 워드클라우드 만들기 — 흥미로운데 당장 의사결정에 안 쓰임.' },
        { pose: 'idle', text: '이 칸 과제를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Future × Easy = 시급하진 않지만 부담도 적은 영역. 분석 팀이 한가할 때 처리하면 작은 가치라도 확보할 수 있는 보너스 후보들입니다. 다만 이 영역에 자원을 너무 많이 쓰면 1·2순위 핵심 과제를 놓치기 쉬워요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '보유한 고객 리뷰 텍스트로 워드클라우드 시각화 (재미있고 쉽지만 즉각 의사결정엔 영향 작음) / 사내 자료실의 과거 보고서 메타데이터를 모아 키워드 트렌드 분석 / 영업팀 대시보드에 부가적인 시계열 위젯 하나 추가. 모두 "안 해도 큰일 안 나지만 해두면 작게나마 도움" 인 일들.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "여유 있을 때"',
          body:
            '"중요도 낮음 + 부담 낮음", "여유 있을 때 추가" 가 키워드면 3순위. 시급해지면 Now 칸들로 즉시 이동.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s1-fut-hard',
      title: '우선순위 ④ Future × Difficult — "미래용 + 어려움 = 후순위"',
      quizId: 'adsp-2-2-cp-01-fh',
      dialogue: [
        { pose: 'wave', text: '[Future × Difficult] — 미래에 쓸만한데 [큰 투자] 가 필요해.' },
        { pose: 'think', text: '당장 효용은 작고 비용은 큼 → [중장기 R&D] 로 분류.' },
        { pose: 'happy', text: '예: 양자컴퓨팅 기반 추천 엔진 — 5년 R&D, 지금은 ROI 거의 없음.' },
        { pose: 'idle', text: '이 칸 과제를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Future × Difficult = 후순위. 지금 시작하기엔 비용 부담이 크고 즉각 효용도 낮은 영역입니다. 보통 R&D·신기술 검토·실험적 프로젝트가 여기 분류됩니다. 회사 자원이 충분하고 미래 대비를 명확히 할 때만 착수.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '양자 컴퓨팅 기반 추천 엔진 R&D — 5년 단위 / 사내 LLM 직접 학습 — 6개월~1년 + 거대 인프라 / VR/AR 환경 데이터 분석 파이프라인 — 사용처가 아직 명확치 않은 사전 연구. 모두 "지금 당장 의사결정에 안 쓰이는데 비용은 막대" 한 영역.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "중장기 R&D"',
          body:
            '"중장기 R&D", "당장 효용 미미 + 큰 투자" 가 키워드면 후순위. 시급해지면 Now×Difficult.',
        },
      ],
    },
    // ─── 분석 거버넌스 5축 (시조프인데) — 1 step → 6 substeps ───
    {
      id: 'adsp-2-2-s2',
      title: '분석 거버넌스 — "시·조·프·인·데" 개요',
      quizId: 'adsp-2-2-cp-02',
      dialogue: [
        { pose: 'wave', text: '분석 거버넌스 5축 — 조직이 분석을 체계적으로 돌리는 틀.' },
        { pose: 'think', text: '"[시조프인데]" — 시스템 · 조직 · 프로세스 · 인력 · 데이터.' },
        { pose: 'idle', text: '먼저 5축 + 함정 ("마케팅" 미포함).' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"시·조·프·인·데"',
          body:
            '시스템(Infra) · 조직(Organization) · 프로세스(Process) · 인력(Resource) · 데이터(Data). "마케팅" 은 포함되지 않음 — 함정.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '조직 준비도 — "IT문데기인파"',
          body:
            'IT · 문화 · 데이터 · 기법 · 인력 · 파급효과. 거버넌스 5축과 별개의 6영역 평가.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s2-system',
      title: '거버넌스 ① 시스템 (Infra)',
      quizId: 'adsp-2-2-cp-02-system',
      dialogue: [
        { pose: 'wave', text: '첫 축 [시스템] — IT 인프라.' },
        { pose: 'think', text: '분석 플랫폼·DB·BI 도구 등 기술 기반.' },
        { pose: 'idle', text: '시스템 축 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '시스템(Infra) 축은 분석을 돌릴 수 있는 기술 기반 — 분석 플랫폼·데이터베이스·BI 도구·컴퓨팅 인프라.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"분석 플랫폼", "BI·DB·인프라". 사람·R&R 이면 조직, 작업 흐름이면 프로세스.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s2-org',
      title: '거버넌스 ② 조직 (Organization)',
      quizId: 'adsp-2-2-cp-02-org',
      dialogue: [
        { pose: 'wave', text: '둘째 [조직] — 분석을 책임지는 부서·체계.' },
        { pose: 'think', text: 'CDO · 데이터 분석팀 · CoE 같은 R&R 구조.' },
        { pose: 'idle', text: '조직 축 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '조직(Organization) 축은 분석 활동의 R&R · 보고 라인 · CoE / 분산 / 기능 같은 조직 형태를 정합니다.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"R&R", "CoE", "보고 체계". 인프라면 시스템, 직원 역량이면 인력.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s2-process',
      title: '거버넌스 ③ 프로세스 (Process)',
      quizId: 'adsp-2-2-cp-02-process',
      dialogue: [
        { pose: 'wave', text: '셋째 [프로세스] — 분석 작업 흐름·표준.' },
        { pose: 'think', text: '과제 발굴 → 수행 → 평가의 표준화된 순서.' },
        { pose: 'idle', text: '프로세스 축 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '프로세스(Process) 축은 과제 발굴 → 수행 → 평가의 표준화된 작업 흐름·승인 절차·산출물 양식.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"표준 절차", "작업 흐름", "단계별 산출물". 사람·역할이면 조직, 기술 기반이면 시스템.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s2-resource',
      title: '거버넌스 ④ 인력 (Resource)',
      quizId: 'adsp-2-2-cp-02-resource',
      dialogue: [
        { pose: 'wave', text: '넷째 [인력] — 분석가 역량·교육.' },
        { pose: 'think', text: '데이터 사이언티스트 채용·육성·교육.' },
        { pose: 'idle', text: '인력 축 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '인력(Resource) 축은 분석 인력의 채용·교육·역량 평가·경력 경로.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"역량 교육", "채용·육성". R&R 구조면 조직, 데이터 자체 관리면 데이터.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s2-data',
      title: '거버넌스 ⑤ 데이터 (Data)',
      quizId: 'adsp-2-2-cp-02-data',
      dialogue: [
        { pose: 'wave', text: '다섯째 [데이터] — 데이터 자체의 관리.' },
        { pose: 'think', text: '데이터 표준화·품질·메타데이터 — 데이터 거버넌스 3요소(원조프) 와 연결.' },
        { pose: 'idle', text: '데이터 축 영역을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '데이터(Data) 축은 데이터 자체의 표준화·품질 관리·메타데이터·라이프사이클. 더 깊이 들어가면 별도 "데이터 거버넌스 (원·조·프)" 로 펼쳐짐.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"데이터 품질·표준화·메타", "데이터 자체". 인프라·도구면 시스템, 사람 역량이면 인력.',
        },
      ],
    },
    // ─── 성숙도 4단계 (도활확최) — 1 step → 5 substeps ───
    {
      id: 'adsp-2-2-s3',
      title: '분석 성숙도 — "도·활·확·최" 개요',
      quizId: 'adsp-2-2-cp-03',
      dialogue: [
        { pose: 'wave', text: '조직의 분석 [성숙도] 4단계.' },
        { pose: 'think', text: '"[도활확최]" — 도입 · 활용 · 확산 · 최적화.' },
        { pose: 'idle', text: '먼저 4단계 순서를 잡자.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"도·활·확·최"',
          body:
            '도입(Introduction) → 활용(Adoption) → 확산(Diffusion) → 최적화(Optimization). 준비도(Readiness) 와 혼동 금지 — 준비도는 별개 축.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '조직 구조 진화 — "집·기·분"',
          body:
            '집중형(CoE) → 기능형 → 분산형. 성숙도가 올라갈수록 DSCoE 가 전사 분산으로 퍼져나갑니다.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s3-intro',
      title: '성숙도 ① [도]입 — "한두 명이 시작"',
      quizId: 'adsp-2-2-cp-03-intro',
      dialogue: [
        { pose: 'wave', text: '첫 단계 [도]입 — 회사에 [한두 명] 만 분석을 해본 단계.' },
        { pose: 'think', text: '예산·표준·플랫폼 다 없음. 그저 호기심 많은 직원이 엑셀로 시도하는 수준.' },
        { pose: 'happy', text: '예: 마케팅 한 직원이 자기 노트북에서 엑셀로 캠페인 효과 분석 — 동료들은 무관심.' },
        { pose: 'idle', text: '도입 단계 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '도입(Introduction) 은 회사의 분석이 일부 개인의 자발적 시도 수준에 머무는 단계입니다. 회사가 공식적으로 "분석을 하자" 라고 말한 적은 없고, 호기심 많은 한두 명이 엑셀·구글 시트로 자기 업무를 분석해 보는 정도. 표준·예산·플랫폼 모두 부재합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '직원 100명 회사에서 마케팅 1명이 자기 노트북 엑셀로 광고 ROI 를 분석 — 동료는 관심 없음 / 영업팀의 한 매니저가 거래처 데이터를 피벗테이블로 정리하지만 다른 부서엔 공유 없음 / 데이터팀이라는 부서 자체가 아직 없음. "조직 차원이 아니라 개인 차원" 이 키워드.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "개인 / 비공식"',
          body:
            '"개인 차원", "비공식 시도", "표준·예산·플랫폼 없음" 이 키워드면 도입. 한 부서 단위로 정기 업무가 되면 다음 단계(활용).',
        },
      ],
    },
    {
      id: 'adsp-2-2-s3-adopt',
      title: '성숙도 ② [활]용 — "한두 부서가 정기적으로"',
      quizId: 'adsp-2-2-cp-03-adopt',
      dialogue: [
        { pose: 'wave', text: '둘째 [활]용 — [부서 단위] 로 분석이 정기 업무가 됨.' },
        { pose: 'think', text: '단, 부서마다 [도구·표준] 이 제각각. 마케팅은 R, 영업은 엑셀, 재무는 SAS.' },
        { pose: 'happy', text: '예: 마케팅팀에 분석 담당자 2명이 정규직으로 배치돼 매주 캠페인 성과를 정리해 공유.' },
        { pose: 'idle', text: '활용 단계 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '활용(Adoption) 은 한두 부서가 분석을 정기 업무로 통합한 단계입니다. 도입과 다른 점은 (1) 개인이 아니라 부서 차원의 활동이 되었다는 것 (2) 정기적으로(주간·월간) 결과를 만들어 의사결정에 쓴다는 것. 다만 전사 차원의 통일된 도구·플랫폼은 아직 없어 부서마다 도구가 제각각입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '마케팅팀에 데이터 분석가 2명 정규직 배치, 매주 캠페인 ROI 보고서 자동 발행 / 영업팀이 자체적으로 Power BI 도입해 거래처별 매출 추세 모니터링 / 재무팀은 별도로 SAS 라이선스로 리스크 분석. 세 부서가 모두 각자의 도구로 분석을 정기화 — 그러나 도구·데이터·표준은 통일 안 됨.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "부서별 + 산발적"',
          body:
            '"부서별로 정기 활용", "도구·표준 부서별 다름", "전사 표준 미정" 이 키워드면 활용. 전사 통일 플랫폼이 도입되면 다음 단계(확산).',
        },
      ],
    },
    {
      id: 'adsp-2-2-s3-diffuse',
      title: '성숙도 ③ [확]산 — "전사 표준 플랫폼"',
      quizId: 'adsp-2-2-cp-03-diffuse',
      dialogue: [
        { pose: 'wave', text: '셋째 [확]산 — [전사] 차원의 표준 플랫폼·거버넌스 도입.' },
        { pose: 'think', text: '도구가 통일되고 데이터도 한 곳에 모임. 거버넌스 정책도 발효.' },
        { pose: 'happy', text: '예: 전사 데이터 플랫폼 (Snowflake + Tableau) 구축, 모든 부서가 이걸로 통일.' },
        { pose: 'idle', text: '확산 단계 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '확산(Diffusion) 은 전사 차원에서 분석을 표준화하는 단계입니다. 부서마다 흩어져 있던 데이터·도구를 통합 플랫폼 위로 모으고, 거버넌스 정책(누가 어떤 데이터를 볼 수 있는지·품질 기준은 어떻게 되는지) 을 공식화합니다. 분석이 "있으면 좋은" 게 아니라 "모든 부서가 공유하는 인프라" 가 됩니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '전사 데이터 플랫폼 (Snowflake + Tableau) 도입 — 마케팅·영업·재무 모두 같은 데이터 위에서 분석 / Data CoE(분석 전담 조직) 신설하고 거버넌스 정책 발효 / 모든 부서원이 분석 도구 사용 가능하도록 사내 교육 프로그램 운영. "부서별 산발" 이 "전사 표준" 으로 바뀌는 게 핵심 변화.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "전사 표준 + 거버넌스"',
          body:
            '"전사 통합 플랫폼", "Data CoE", "거버넌스 정책 발효" 가 키워드면 확산. 분석이 의사결정의 디폴트가 되어 ROI 까지 다시 최적화하면 마지막 단계(최적화).',
        },
      ],
    },
    {
      id: 'adsp-2-2-s3-optimize',
      title: '성숙도 ④ [최]적화 — "분석이 의사결정의 디폴트"',
      quizId: 'adsp-2-2-cp-03-optimize',
      dialogue: [
        { pose: 'wave', text: '마지막 [최]적화 — 분석이 [모든 의사결정의 기본값] 이 됨.' },
        { pose: 'think', text: '"감으로 결정" 은 거의 사라지고, 데이터 근거 없으면 회의에서 통과 안 됨.' },
        { pose: 'happy', text: '예: Netflix·Amazon — 추천·가격·재고 모두 알고리즘이 1차 결정, 사람은 검증만.' },
        { pose: 'idle', text: '최적화 단계 특징을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '최적화(Optimization) 는 분석이 조직 의사결정의 디폴트가 된 단계입니다. 회의에서 데이터 근거 없이 의견을 내면 통과되지 않을 정도로 분석이 일상에 내재화됩니다. 한 발 더 나아가 "분석 자체의 ROI 와 효율" 을 다시 분석해 최적화하는 메타 단계까지 진행됩니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            'Netflix — 추천·콘텐츠 투자·가격 모두 알고리즘이 1차 결정 / Amazon — 가격·재고·물류 경로 모두 실시간 ML 결정 / 토스 — 모든 신규 기능에 A/B 테스트 결과 첨부 안 되면 출시 보류. 모두 "분석 없는 의사결정은 예외" 인 상태. 추가로 어떤 분석이 효과적이었는지를 다시 측정해 분석 자체를 최적화.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "내재화 + 메타 최적화"',
          body:
            '"전사 내재화", "데이터 기반 의사결정 주류", "분석 ROI 최적화" 가 키워드면 최적화. 표준화 진행 중이면 확산, 부서별 산발이면 활용.',
        },
      ],
    },
    // ─── 데이터 거버넌스 3요소 (원조프) — 1 step → 4 substeps ───
    {
      id: 'adsp-2-2-s4',
      title: '데이터 거버넌스 — "원·조·프" 개요',
      quizId: 'adsp-2-2-cp-04',
      dialogue: [
        { pose: 'wave', text: '[분석 거버넌스] ≠ [데이터 거버넌스] — 시험 함정 1위.' },
        { pose: 'think', text: '데이터 거버넌스는 데이터 자체를 공용 자산으로 관리하는 규범. 3요소 "[원조프]".' },
        { pose: 'idle', text: '먼저 두 거버넌스 구분부터.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"분석 거버넌스 5축 (시조프인데)" 와 "데이터 거버넌스 3요소 (원조프)" 는 별개. 시험에서 두 축을 섞어 오답 선지로 주는 게 흔합니다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"원·조·프"',
          body:
            '원칙(Principle) · 조직(Organization) · 프로세스(Process). "비전·전략·계획" 같은 엉뚱한 묶음이 함정.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s4-principle',
      title: '데이터 거버넌스 ① [원]칙 — "회사의 헌법"',
      quizId: 'adsp-2-2-cp-04-principle',
      dialogue: [
        { pose: 'wave', text: '첫 요소 [원]칙 — 데이터를 다루는 [회사 헌법] 같은 규범.' },
        { pose: 'think', text: '"누가 어떤 데이터를 어떤 조건으로 볼 수 있나" — 모든 결정의 출발점.' },
        { pose: 'happy', text: '예: "고객 개인정보는 마케팅 목적 외 사용 금지", "재무 데이터는 임원 이상만 접근".' },
        { pose: 'idle', text: '원칙 영역의 활동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '원칙(Principle) 은 회사가 데이터를 다룰 때 따라야 할 기본 규범·정책입니다. "헌법" 에 비유하면 가장 정확해요. 보안 정책, 접근 권한 정책, 데이터 품질 정책, 활용 정책 — 모든 일상 결정이 이 원칙에서 출발합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '"고객 개인정보는 마케팅 목적 외에는 사용 금지" / "재무 거래 데이터는 임원·재무팀만 조회 가능" / "외부 업체와 공유하는 모든 데이터는 익명화 후 송출" / "데이터 품질 등급 A·B·C 의 정의와 적용 범위". 모두 회사가 데이터에 대해 미리 약속한 큰 규칙들. 이 규칙을 누가 책임지고 굴리는지(조직), 매일 어떤 절차로 점검하는지(프로세스) 와는 분리됩니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "정책 / 헌법 / 표준 정의"',
          body:
            '"기본 정책 수립", "데이터 관리 원칙·표준 정의" 가 키워드면 원칙. "누가 책임자인지" 면 조직, "어떤 절차로 매일 굴리는지" 면 프로세스.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s4-org',
      title: '데이터 거버넌스 ② [조]직 — "누가 책임지나"',
      quizId: 'adsp-2-2-cp-04-org',
      dialogue: [
        { pose: 'wave', text: '둘째 [조]직 — 데이터 거버넌스를 [실행할 사람·역할] 구조.' },
        { pose: 'think', text: '원칙은 그냥 종이 — 책임자가 있어야 굴러가.' },
        { pose: 'happy', text: '대표 역할: CDO(Chief Data Officer), 데이터 오너, 데이터 스튜어드.' },
        { pose: 'idle', text: '조직 영역 활동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '조직(Organization) 은 데이터 거버넌스의 원칙을 실제로 굴릴 사람·역할 구조입니다. 아무리 좋은 정책도 책임자가 없으면 종이일 뿐 — 누가 어떤 데이터에 대해 결정권을 가지고, 누가 일상 운영을 담당할지를 명확히 합니다.',
        },
        {
          kind: 'section',
          title: '대표 역할 3가지',
          body:
            'CDO(Chief Data Officer) — 회사 전체의 데이터 전략·정책을 총괄하는 임원. 데이터 오너(Data Owner) — 특정 데이터(예: 고객 데이터, 재무 데이터) 의 최종 책임자. 보통 해당 비즈니스 부서장이 맡습니다. 데이터 스튜어드(Data Steward) — 일상적으로 데이터 품질 점검, 메타데이터 관리, 표준 코드 적용 등 실무를 담당하는 역할.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "사람·역할·R&R"',
          body:
            '"책임자 지정", "역할 분담(R&R)", "CDO/스튜어드" 가 키워드면 조직. 일상 실행 절차(품질 점검, 표준화 작업) 자체는 프로세스.',
        },
      ],
    },
    {
      id: 'adsp-2-2-s4-process',
      title: '데이터 거버넌스 ③ [프]로세스 — "매일 굴러가는 절차"',
      quizId: 'adsp-2-2-cp-04-process',
      dialogue: [
        { pose: 'wave', text: '셋째 [프]로세스 — 원칙을 [매일 굴리는] 실행 절차.' },
        { pose: 'think', text: '데이터 표준화, 품질 점검, 메타데이터 운영, 백업·아카이브 관리.' },
        { pose: 'happy', text: '예: 매주 월요일 데이터 품질 점검 회의, 신규 테이블 등록 시 표준 코드 검토.' },
        { pose: 'idle', text: '프로세스 영역 활동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '프로세스(Process) 는 원칙을 일상 운영에 녹이는 실행 절차입니다. "매일·매주 어떤 일을 어떤 순서로 하는가" 가 프로세스. 원칙(헌법) 이 있고 조직(책임자) 이 정해졌어도 이 일상 절차가 없으면 결국 운영이 안 됩니다.',
        },
        {
          kind: 'keypoints',
          title: '주요 활동 4가지',
          items: [
            '데이터 표준화: 명칭(예: cust_id vs customerId)·코드·형식을 통일',
            '메타데이터 / 마스터데이터 관리: "이 컬럼이 뭘 의미하나" 를 항상 알 수 있게 운영',
            '저장소 관리: 아카이브 정책·접근 권한·백업·복구 절차',
            '품질관리: 정확성·완전성·일관성·시의성을 정기 점검',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "표준화·품질·메타데이터·백업"',
          body:
            '"표준화 작업", "품질 점검", "메타데이터 운영", "백업·아카이브" 가 키워드면 프로세스. 누가 책임자인지면 조직, 큰 규범 자체면 원칙.',
        },
      ],
    },
  ],
};

const ADSP_2_3: Lesson = {
  id: 'adsp-2-3',
  subject: 'adsp',
  chapter: 2,
  chapterTitle: '데이터 분석 기획',
  topic: '분석 과제 발굴',
  title: '좋은 분석 과제는 어떻게 찾는가',
  hook: '데이터에서 먼저? 문제에서 먼저? — 둘 다 필요합니다.',
  estimatedMinutes: 6,
  steps: [
    // ─── 타당성 3요소 — 1 step → 4 substeps ───
    {
      id: 'adsp-2-3-s1',
      title: '타당성 3요소 — 개요',
      quizId: 'adsp-2-3-cp-01',
      dialogue: [
        { pose: 'wave', text: '하향식 마지막 [타당성] 은 3축으로 분리.' },
        { pose: 'think', text: '[경제적] · [기술적] · [운영적] — 사회적 타당성은 함정.' },
        { pose: 'idle', text: '먼저 3축 구분.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'warn',
          title: '"사회적 타당성" 함정',
          body:
            '기본 3요소는 경제·기술·운영. "사회적 타당성" 같은 추가 항목은 오답 함정.',
        },
      ],
    },
    {
      id: 'adsp-2-3-s1-econ',
      title: '타당성 ① 경제적 (Economic)',
      quizId: 'adsp-2-3-cp-01-econ',
      dialogue: [
        { pose: 'wave', text: '첫 [경제적] — 비용·편익(ROI).' },
        { pose: 'think', text: '투자 대비 수익이 양인지 검증.' },
        { pose: 'idle', text: '경제적 타당성 활동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '경제적(Economic) 타당성 — 비용·편익 분석(ROI). 프로젝트가 투자 대비 충분한 수익을 낼 수 있는지.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"비용 vs 편익", "ROI". 데이터·시스템 가용성이면 기술적, 사람·프로세스 수용성이면 운영적.',
        },
      ],
    },
    {
      id: 'adsp-2-3-s1-tech',
      title: '타당성 ② 기술적 (Technical)',
      quizId: 'adsp-2-3-cp-01-tech',
      dialogue: [
        { pose: 'wave', text: '둘째 [기술적] — 데이터·알고리즘·시스템.' },
        { pose: 'think', text: '필요한 데이터·기술 가용성 점검.' },
        { pose: 'idle', text: '기술적 타당성 활동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '기술적(Technical) 타당성 — 필요한 데이터가 있는지, 알고리즘·인프라·시스템이 가능한지.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"데이터·알고리즘 가능성", "시스템 인프라". 비용·편익은 경제적, 인력·조직 수용성은 운영적.',
        },
      ],
    },
    {
      id: 'adsp-2-3-s1-ops',
      title: '타당성 ③ 운영적 (Operational)',
      quizId: 'adsp-2-3-cp-01-ops',
      dialogue: [
        { pose: 'wave', text: '셋째 [운영적] — 조직·인력·프로세스.' },
        { pose: 'think', text: '결과를 받아 운영할 조직 준비도 점검.' },
        { pose: 'idle', text: '운영적 타당성 활동을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '운영적(Operational) 타당성 — 분석 결과를 실제 운영할 조직·인력·프로세스 수용 가능성. "기술은 되지만 사람이 못 받는" 케이스 점검.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"조직 수용성", "인력·프로세스 준비도". ROI 면 경제적, 시스템·데이터면 기술적.',
        },
      ],
    },
    {
      id: 'adsp-2-3-s2',
      title: '상향식 접근',
      quizId: 'adsp-2-3-cp-02',
      dialogue: [
        { pose: 'wave', text: '하향식이 "문제 먼저" 라면 [상향식]은 "[데이터 먼저]" 야.' },
        { pose: 'think', text: '대량의 로그·거래 데이터에서 [패턴·이상 징후]를 발견하는 방식.' },
        { pose: 'lightbulb', text: '주 무기는 [비지도 학습] · [EDA]. 문제를 미리 정의 안 해!' },
        { pose: 'happy', text: '대표 예 — [장바구니 분석]에서 "맥주 + 기저귀" 같은 예상 밖 조합 발견.' },
        { pose: 'idle', text: '주제 없을 때 or 혁신 찾을 때 유리. 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '데이터에서 먼저 시작한다',
          body:
            '대량의 로그·거래 데이터를 들여다보고 패턴·이상 징후에서 분석 주제를 "발견" 하는 방식. 비지도 학습·EDA 가 주 무기입니다. 문제를 미리 정의하지 않고 데이터가 말하게 하는 것.',
        },
        {
          kind: 'example',
          title: '언제 유리한가',
          body:
            '주제가 뚜렷하지 않거나 혁신적인 패턴을 찾고 싶을 때. 대표 예: 장바구니 분석에서 예상치 못한 동반 구매 조합을 발견하는 경우.',
        },
      ],
    },
    {
      id: 'adsp-2-3-s3',
      title: '디자인 씽킹 (혼합)',
      quizId: 'adsp-2-3-cp-03',
      dialogue: [
        { pose: 'wave', text: '현대 기업이 제일 선호하는 방식은 뭘까? [디자인 씽킹].' },
        { pose: 'think', text: '[하향식] ↔ [상향식]을 왕복하며 [가설 수정 반복]하는 접근이야.' },
        { pose: 'lightbulb', text: '과제도 프로젝트로 관리돼 — [PMBOK 10영역].' },
        { pose: 'happy', text: '"[이범통이의자에서]" — 이해관계자 · 범위 · 통합 · 일정 · 원가 · 품질 · 자원 · 의사소통 · 위험 · 조달.' },
        { pose: 'idle', text: '혼합 접근이 왜 강한지, 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '하향식 ↔ 상향식을 왕복',
          body:
            '하향식으로 가설을 세우고, 상향식으로 데이터를 점검하고, 다시 가설을 수정하는 반복 운동. 이 혼합 접근을 디자인 씽킹이라 부릅니다. 현대 기업들이 가장 선호하는 방식.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: 'PMBOK 10영역 — "이범통이의자에서"',
          body:
            '통합 · 이해관계자 · 범위 · 일정 · 원가 · 품질 · 자원 · 의사소통 · 위험 · 조달. 과제도 프로젝트로 관리되어야 합니다.',
        },
      ],
    },
  ],
};

export const ADSP_CH2_LESSONS: Lesson[] = [
  ADSP_2_1,
  ADSP_2_2,
  ADSP_2_3,
];
