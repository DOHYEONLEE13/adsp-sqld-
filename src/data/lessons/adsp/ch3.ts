import type { Lesson } from '../types';

const ADSP_3_1: Lesson = {
  id: 'adsp-3-1',
  subject: 'adsp',
  chapter: 3,
  chapterTitle: '데이터 분석',
  topic: 'R 기초와 데이터 마트',
  title: '데이터 마트와 EDA',
  hook: '분석의 80% 는 데이터를 "쓸 수 있게 만드는" 시간입니다.',
  estimatedMinutes: 9,
  steps: [
    {
      id: 'adsp-3-1-s1',
      title: '요약변수 vs 파생변수',
      quizId: 'adsp-3-1-cp-01',
      dialogue: [
        { pose: 'wave', text: '이번에는 [요약변수 vs 파생변수] 를 배워보자!' },
        { pose: 'think', text: '[요약변수] = 있는 것을 [집계]\n[파생변수] = 새 [의미 부여]' },
        { pose: 'lightbulb', text: '왜 구분? — 분석 목적에 따라\n다른 변환 필요. 시험 단골 매칭.\n데이터 마트 (DW의 부서별 코너) 에 쌓아둠.' },
        { pose: 'happy', text: '비유: 학교 성적표 —\n[요약] 점수 합계·평균·최고점\n[파생] 합격 여부 (점수 ≥ 60)·등급(상중하).' },
        { pose: 'idle', text: '요약 vs 파생 매칭 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '실무에선 모델 만드는 시간보다 데이터 정리 시간이 더 깁니다. 그 정리 결과물이 "데이터 마트" — 분석 목적에 맞게 다듬어 둔 작은 창고입니다.',
        },
        {
          kind: 'section',
          title: 'DW vs 데이터 마트',
          body:
            'DW 가 전사 창고라면, 데이터 마트는 "마케팅팀 전용 코너" 처럼 부서·목적별로 뽑아 놓은 작은 저장소입니다. 더 빠르고, 더 집중되어 있고, 더 만들기 쉽습니다.',
        },
        {
          kind: 'table',
          title: '요약 vs 파생',
          headers: ['구분', '정의', '예시'],
          rows: [
            ['요약변수', '여러 행을 집계', '월별 총 매출, 고객별 평균 주문액'],
            ['파생변수', '기존 변수 조합/변환', 'BMI, 요일, 나이구간'],
          ],
        },
      ],
    },
    // ─── EDA 4원칙 — 1 step → 5 substeps ───
    {
      id: 'adsp-3-1-s2',
      title: 'EDA 개요',
      quizId: 'adsp-3-1-cp-02',
      dialogue: [
        { pose: 'wave', text: '이번에는 [EDA 4원칙] 을 배워보자!' },
        { pose: 'think', text: '튜키 4원칙:\n· [저]항성 · [잔]차\n· [재]표현 · [현]시성' },
        { pose: 'lightbulb', text: '줄여서 [저잔재현]!\n탐색적 데이터 분석 (Exploratory Data\nAnalysis) 의 4 기둥.' },
        { pose: 'happy', text: '비유: 모의고사 점수 첫인상 점검 —\n이상값 영향 (저)·예측 차이 (잔)\n·단위 바꾸기 (재)·시각화 (현).' },
        { pose: 'idle', text: '저잔재현 매칭 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'EDA(Exploratory Data Analysis) 는 튜키(Tukey) 가 정립한 단계. 모델링 전에 데이터의 형태·이상·관계를 파악합니다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"저·잔·재·현"',
          body:
            'Resistance(저항성) · Residual(잔차) · Re-expression(재표현) · Revelation(현시성). 영어는 모두 R 로 시작하지만 한국어 앞글자는 저잔재현.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s2-resistance',
      title: 'EDA ① 저항성',
      quizId: 'adsp-3-1-cp-02-resistance',
      dialogue: [
        { pose: 'wave', text: '① [저]항성 — 이상치에 안 흔들리게!' },
        { pose: 'think', text: '[Resistance] —\n[이상치 한두 개] 에 휘둘리지 않는 통계.' },
        { pose: 'lightbulb', text: '왜 필요? — 평균은 한 명 100점에\n바로 끌려가지만 중앙값은 그대로.\n→ 안전한 통계 선택.' },
        { pose: 'happy', text: '비유: 학급 30명 중 29명이 60점,\n한 명이 100점.\n평균 61.3 vs 중앙값 60 — 중앙값이 더 대표.' },
        { pose: 'idle', text: '저항성 통계 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '저항성(Resistance) 은 "소수의 이상치 때문에 결과가 크게 흔들리지 않는 통계를 쓰자" 는 원칙입니다. 평균·표준편차·분산은 한 점이 크게 튀면 통째로 끌려갑니다. 반면 중앙값·IQR·중위절대편차(MAD) 같은 통계는 이상치가 끼어들어도 거의 그대로예요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '학급 시험 점수가 [55 / 58 / 60 / 60 / 62 / 63 / 65 / 68 / 70 / 100(천재 한 명)]. 평균은 66.1 점으로 평범한 학생 누구의 점수도 안 닮음. 중앙값은 62.5 점으로 실제 학급 수준을 잘 대표. 평균이 한 명 때문에 통째로 왜곡된 사례 — 저항성이 떨어지는 통계의 위험을 보여줍니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "robust / 중앙값 / IQR"',
          body:
            '"중앙값", "IQR(사분위범위)", "Trimmed Mean(절사평균)", "robust 통계" 가 키워드면 저항성. 평균·분산·표준편차만 등장하면 비저항성.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s2-residual',
      title: 'EDA ② 잔차해석',
      quizId: 'adsp-3-1-cp-02-residual',
      dialogue: [
        { pose: 'wave', text: '② [잔]차 — 모델이 틀린 양 들여다보기!' },
        { pose: 'think', text: '[Residual] = 실제값 − 예측값.\n무작위면 OK, 패턴 남으면 모델 부적합.' },
        { pose: 'lightbulb', text: '왜? — 잔차에 추세·모양 보이면\n모델이 [잡아내지 못한 정보] 가\n남아있다는 신호.' },
        { pose: 'happy', text: '비유: 공부시간 → 모의고사 점수\n예측 모델. 잔차가 U자면 →\n비선형 (벼락치기 효과) 누락 신호!' },
        { pose: 'idle', text: '잔차해석 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '잔차해석(Residual) 은 모델 적합 후 잔차(실제 − 예측) 를 들여다보며 모델이 놓친 게 없는지 점검하는 원칙입니다. 좋은 모델일수록 잔차가 평균 0 주변에 무작위로 흩어져 있어요. 만약 잔차에 어떤 모양·추세가 보이면 그건 모델이 잡아내지 못한 정보가 남아 있다는 신호.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '공부시간 → 모의고사 점수 회귀모델을 만들고 잔차를 그렸더니 공부시간이 길수록 잔차가 점점 크게 흩어짐 → 등분산성 깨짐(이분산), 로그 변환 필요 / 잔차가 회차에 따라 위·아래로 출렁이는 패턴 → 시계열 자기상관 (회차 간 영향) 누락 / 잔차 vs 예측 점수 산점도가 U자 → 비선형 항 (벼락치기 효과) 누락. 모두 잔차의 패턴이 "이거 더 들여다 봐" 라고 알려주는 신호.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "잔차 산점도 / 모델 부적합 진단"',
          body:
            '"잔차 산점도 분석", "잔차 패턴 검토", "모델 부적합 진단" 이 키워드면 잔차해석. 데이터 자체의 시각화면 현시성, 변수 스케일 변환이면 재표현.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s2-reexpression',
      title: 'EDA ③ 재표현',
      quizId: 'adsp-3-1-cp-02-reexpression',
      dialogue: [
        { pose: 'wave', text: '③ [재]표현 — 변수 눈금 자체를 바꾸기!' },
        { pose: 'think', text: '[Re-expression] —\n로그·제곱근·역수 변환이 대표.\n한쪽 치우친 분포 펴주는 효과.' },
        { pose: 'lightbulb', text: '왜? — 회귀·t검정 가정\n(정규성·등분산) 맞추기 위해.\n원래 변수 그대로면 가정 깨짐.' },
        { pose: 'happy', text: '비유: 학생 공부시간 long-tail —\n대부분 1~2시간, 일부 12시간.\nlog(공부시간) 으로 바꾸면 비교 쉬움!' },
        { pose: 'idle', text: '재표현 사례 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '재표현(Re-expression) 은 변수의 척도(눈금) 를 다른 함수로 바꿔 분석에 더 적합한 형태로 만드는 원칙입니다. 한쪽으로 길게 늘어진 분포를 종 모양으로 펴주거나, 분산이 들쑥날쑥한 데이터를 균일하게 만들어 회귀·t검정의 가정을 충족시키기 위해 자주 사용.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '학생 공부시간 데이터는 한쪽 꼬리가 매우 길게 — 대부분 1~2시간, 소수 12시간 이상 → log(공부시간) 로 바꾸면 종 모양에 가까워짐 / 학원 수강 시간도 비슷한 long-tail 분포 → log 변환 / 공부시간-점수 회귀에서 잔차 분산이 공부시간에 따라 커지면 점수에 sqrt 또는 log 변환 / 시험 응시 분야 비율 데이터에선 Box-Cox 자동 탐색이 자주 사용. 모두 "원래 변수 그대로면 가정 못 맞춤 → 변환으로 맞춤".',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "로그/제곱근/Box-Cox 변환"',
          body:
            '"로그 변환", "제곱근 변환", "Box-Cox", "스케일 변환" 이 키워드면 재표현. 시각화로 단순 탐색이면 현시성, 잔차의 패턴을 본다면 잔차해석.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s2-revelation',
      title: 'EDA ④ 현시성',
      quizId: 'adsp-3-1-cp-02-revelation',
      dialogue: [
        { pose: 'wave', text: '④ [현]시성 — 시각화로 드러내기!' },
        { pose: 'think', text: '[Revelation] —\n히스토그램·박스플롯·산점도.\n숫자 표보다 그림 한 장.' },
        { pose: 'lightbulb', text: '왜? — 표·평균값으론 안 보이는\n패턴이 그림 한 장에서 단번에 드러남.\nEDA 4원칙 중 가장 자주 사용.' },
        { pose: 'happy', text: '비유: 반별 점수 박스플롯 그렸더니\n3반만 outlier 다수 → 채점 오류 발견!\n공부시간 vs 점수 산점도에서\n두 그룹 (학원 다니는·안 다니는) 분리.' },
        { pose: 'idle', text: '현시성 사례 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '현시성(Revelation) 은 적절한 시각화로 데이터에 숨은 구조·관계·이상을 드러내는 원칙입니다. EDA 4원칙 중 가장 자주 마주하는 활동 — 표나 평균값으론 안 보이는 패턴이 그림 한 장에서 단번에 드러나는 경우가 많거든요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '히스토그램으로 학년 점수 분포를 그려 양봉(쌍봉) 분포 발견 → 두 종류 학습자가 섞여 있다는 신호 / 박스플롯으로 반별 점수를 비교해 한 반만 outlier 다수 식별 → 채점 오류 후보 / 공부시간 vs 점수 산점도에서 두 그룹(학원·자습) 이 명확히 분리되는 걸 보고 새 변수 추가 / 요일 vs 자습실 인원 라인 차트에서 매주 시험 직전에 피크가 반복되는 주기성 발견. 모두 시각화 한 번이 "데이터를 들여다보게" 만들어 준 케이스.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "히스토그램/박스플롯/산점도"',
          body:
            '"히스토그램·박스플롯·산점도로 패턴 발견", "시각적 탐색" 이 키워드면 현시성. 잔차를 그리면 잔차해석으로 잡힐 수 있으니 초점에 따라 분리.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s2-review',
      title: 'EDA 복습',
      quizId: 'adsp-3-1-cp-02',
      group: 'adsp-3-1-s2',
      dialogue: [
        { pose: 'wave', text: '[EDA] 복습 시간이야!' },
        { pose: 'think', text: '방금 배운 핵심을\n다시 한 번 정리해보자.' },
        { pose: 'lightbulb', text: '시험 함정도 같이 떠올려봐 —\n자주 헷갈리는 포인트가 있을 거야.' },
        { pose: 'happy', text: '비유로 다시 떠올리면\n오래 기억에 남아!' },
        { pose: 'idle', text: '잘 정리됐어! 다음 스텝으로!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '복습 체크리스트',
          body:
            '바로 직전 스텝들에서 배운 개념·암기법·함정을 한 번 더 떠올리며 다음 그룹으로 넘어가요. 잘 안 떠오르는 항목이 있으면 이전 스텝으로 돌아가 확인하세요.',
        },
      ],
    },
    // ─── 결측값 처리 — 1 step → 5 substeps (overview + 4 방식) ───
    {
      id: 'adsp-3-1-s3',
      title: '결측값 처리 개요',
      quizId: 'adsp-3-1-cp-03',
      dialogue: [
        { pose: 'wave', text: '이번에는 [결측값 처리 4종] 을 배워보자!' },
        { pose: 'think', text: '4 방식:\n· [완]전제거 · [단]순대치\n· [다]중대치 · [모]델 기반' },
        { pose: 'lightbulb', text: '줄여서 [완단다모]!\n결측 메커니즘 (MCAR/MAR/MNAR)\n에 따라 선택.' },
        { pose: 'happy', text: '비유: 출석부 결석 처리 —\n행 삭제 / 반 평균 채움\n/ 5번 추정 / 비슷한 학생 점수.' },
        { pose: 'idle', text: '완단다모 매칭 문제!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"완·단·다·모"',
          body:
            '완전제거 · 단순대치 · 다중대치(MI) · 모델 기반. 결측 메커니즘 (MCAR/MAR/MNAR) 에 따라 선택.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '결측 매커니즘 (MCAR/MAR/MNAR)',
          body:
            'MCAR(완전 무작위) → 삭제해도 편향 X. MAR(다른 변수에 의존) → 모델 기반 추천. MNAR(결측 자체에 의미) → 삭제 시 편향 큼.',
        },
        {
          kind: 'table',
          headers: ['방식', '핵심', '비고'],
          rows: [
            ['완전 제거', 'Listwise / Pairwise', '간단·정보 손실'],
            ['단순 대치', '평균·중앙값·최빈값', '분산 과소평가'],
            ['다중 대치(MI)', '여러 번 대치 → 통합', '불확실성 반영'],
            ['모델 기반', '회귀·KNN 예측', '고품질·복잡'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-1-s3-deletion',
      title: '결측 처리 ① 완전 제거',
      quizId: 'adsp-3-1-cp-03-deletion',
      dialogue: [
        { pose: 'wave', text: '① [완전 제거] — 결석한 학생 행 삭제!' },
        { pose: 'think', text: '[Listwise / Pairwise Deletion] —\n결측 있는 행 통째 제외.' },
        { pose: 'lightbulb', text: '왜? — [간단·빠름].\n단점: 표본 줄고 정보 손실.\nMCAR 일 때만 안전.' },
        { pose: 'happy', text: '비유: 출석부에서 결석한 학생\n그 줄 통째로 [지움].\n실무: 결측 < 5% 이면 무난.' },
        { pose: 'idle', text: '완전 제거 사례 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '완전 제거(Listwise Deletion) 는 결측이 있는 레코드를 모두 제외. Pairwise 는 분석마다 가용 변수만 사용. 단순하지만 표본이 작아지고 MNAR 일 때 편향 발생.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"행 제거", "Listwise/Pairwise", "정보 손실". 평균/중앙값으로 채우면 단순 대치, 모델로 예측이면 모델 기반.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s3-simple',
      title: '결측 처리 ② 단순 대치',
      quizId: 'adsp-3-1-cp-03-simple',
      dialogue: [
        { pose: 'wave', text: '② [단순 대치] — 반 평균으로 채움!' },
        { pose: 'think', text: '[Single Imputation] —\n평균·중앙값·최빈값으로 [한 번] 채움.' },
        { pose: 'lightbulb', text: '왜? — [간단], 표본 유지.\n단점: [분산 과소평가] →\n통계 추론 왜곡.' },
        { pose: 'happy', text: '비유: 결석한 학생 점수를\n[반 평균] 으로 채워넣음.\n실무: 평균·중앙값 대치.' },
        { pose: 'idle', text: '단순 대치 사례 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '단순 대치(Simple Imputation) 는 평균·중앙값·최빈값 같은 단일 통계로 결측을 채움. 빠르지만 변동성을 줄여 통계적 추론을 왜곡할 수 있음.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"평균·중앙값·최빈값", "분산 과소평가". 여러 번 대치 후 통합이면 다중 대치, 회귀·KNN 면 모델 기반.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s3-multiple',
      title: '결측 처리 ③ 다중 대치 (MI)',
      quizId: 'adsp-3-1-cp-03-multiple',
      dialogue: [
        { pose: 'wave', text: '③ [다중 대치 (MI)] — 5번 추정 후 통합!' },
        { pose: 'think', text: '[Multiple Imputation] —\n[여러 번] 다르게 채워보고 결과 통합.' },
        { pose: 'lightbulb', text: '왜? — 단순 대치의 [분산 과소]\n문제 보완. [불확실성] 반영.' },
        { pose: 'happy', text: '비유: 결석한 학생 점수\n[5가지 시나리오] 로 추정 후 평균.\n실무: MICE 알고리즘.' },
        { pose: 'idle', text: '다중 대치 사례 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '다중 대치(Multiple Imputation, MI) 는 결측 값에 대해 여러 번(M회) 다른 값을 대치해 M개의 완전 데이터셋을 만들고, 분석 후 결과를 통합. 대치의 불확실성까지 반영.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"여러 번 대치 → 통합", "불확실성 반영". 단일 통계로 채우면 단순 대치, 단일 모델 예측이면 모델 기반.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s3-model',
      title: '결측 처리 ④ 모델 기반',
      quizId: 'adsp-3-1-cp-03-model',
      dialogue: [
        { pose: 'wave', text: '④ [모델 기반] — 비슷한 학생 점수로!' },
        { pose: 'think', text: '[KNN·회귀] 등 모델로\n결측 [예측해서 채움].' },
        { pose: 'lightbulb', text: '왜? — 다른 변수 정보까지 활용.\n가장 정교, 단 비용 큼.' },
        { pose: 'happy', text: '비유: 결석한 학생과\n[성향 비슷한 친구] 점수로 추정.\n실무: KNN imputation·회귀 대치.' },
        { pose: 'idle', text: '모델 기반 사례 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '모델 기반 대치는 회귀·KNN·랜덤포레스트 등으로 다른 변수에서 결측을 예측해 채움. 변수 간 관계를 활용해 단순 대치보다 정교.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"회귀·KNN 예측", "변수 간 관계 활용". 단일 통계는 단순, 다회 대치는 다중, 행 제거는 완전 제거.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s3-review',
      title: '결측값 처리 복습',
      quizId: 'adsp-3-1-cp-03',
      group: 'adsp-3-1-s3',
      dialogue: [
        { pose: 'wave', text: '[결측값 처리] 복습 시간이야!' },
        { pose: 'think', text: '방금 배운 핵심을\n다시 한 번 정리해보자.' },
        { pose: 'lightbulb', text: '시험 함정도 같이 떠올려봐 —\n자주 헷갈리는 포인트가 있을 거야.' },
        { pose: 'happy', text: '비유로 다시 떠올리면\n오래 기억에 남아!' },
        { pose: 'idle', text: '잘 정리됐어! 다음 스텝으로!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '복습 체크리스트',
          body:
            '바로 직전 스텝들에서 배운 개념·암기법·함정을 한 번 더 떠올리며 다음 그룹으로 넘어가요. 잘 안 떠오르는 항목이 있으면 이전 스텝으로 돌아가 확인하세요.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s4',
      title: '이상값 탐지 개요',
      quizId: 'adsp-3-1-cp-04',
      dialogue: [
        { pose: 'wave', text: '이번에는 [이상값 탐지 4종] 을 배워보자!' },
        { pose: 'think', text: '4 방법:\n· [ESD] · [IQR]\n· [Z-Score] · [DBScan]' },
        { pose: 'lightbulb', text: '왜? — 모든 이상값을 [무조건 제거] X.\n진짜 오류인지, 의미있는 극단값인지\n구분이 핵심.' },
        { pose: 'happy', text: '비유: 시험에서 너무 튀는 점수 —\n채점 오류일 수도, 진짜 천재일 수도.\n무작정 빼면 위험!' },
        { pose: 'idle', text: '이상값 탐지 매칭 문제!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '이상값 = 반드시 제거 아님',
          body:
            '오타·기기 오류는 제거. 사기 거래·고가치 고객처럼 진짜 극단값이면 남겨서 분석 대상으로 삼습니다.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s4-esd',
      title: '이상값 ① ESD',
      quizId: 'adsp-3-1-cp-04-esd',
      dialogue: [
        { pose: 'wave', text: '① [ESD] — 평균에서 ±3σ 밖!' },
        { pose: 'think', text: '[Extreme Studentized Deviate] —\n평균 ± [표준편차의 3배] 이상\n떨어진 점을 이상값으로.' },
        { pose: 'lightbulb', text: '왜? — 정규분포에서 99.7% 가\n[평균 ±3σ 안]. 밖으로 나가면 0.3% 미만.\n빠르고 단순.' },
        { pose: 'happy', text: '비유: 학생 시험점수 평균 70, σ=10\n→ 100점 이상 / 40점 이하가\n±3σ 밖 → 이상값 후보!' },
        { pose: 'idle', text: 'ESD 정의 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'ESD(Extreme Studentized Deviate) 는 "평균 ± 3·표준편차" 라는 정규분포 기반의 경계로 이상값을 판정하는 방법입니다. 정규분포에선 99.7% 의 데이터가 평균 ±3σ 안에 들어오므로, 이 밖으로 나가면 0.3% 미만의 극단적인 값으로 봅니다. 종 모양 분포에 가까운 데이터에서 가장 빠르고 단순한 방법.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '학생 시험점수가 평균 70, σ=10 인 정규분포라 가정 → 100점 초과 또는 40점 미만이 ESD 기준 이상값 / 신장 데이터(평균 170cm, σ=8) → 194cm 초과 / 146cm 미만 / 매월 평균 매출 1,000만원, σ=200만원인 가게 → 이번 달 1,800만원이면 이상값 후보. 모두 정규성 가정이 통하는 케이스.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — 정규성 깨지면 위험',
          body:
            '소득·매출처럼 한쪽 꼬리가 길게 늘어진 분포(skewed) 는 정규가 아니어서 ESD 가 "정상값을 이상값으로" 또는 그 반대로 오판하기 쉽습니다. 정규성 미확인이면 IQR 이 안전.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s4-iqr',
      title: '이상값 ② IQR',
      quizId: 'adsp-3-1-cp-04-iqr',
      dialogue: [
        { pose: 'wave', text: '② [IQR] — 박스플롯의 수염 밖!' },
        { pose: 'think', text: '[Interquartile Range] —\n[Q1 − 1.5·IQR / Q3 + 1.5·IQR] 밖이면 이상.' },
        { pose: 'lightbulb', text: '왜? — 분포 모양에 [가정 없음] → 안전.\n비대칭 long-tail 데이터에 강함.' },
        { pose: 'happy', text: '비유: 학원 수강 시간처럼\n한쪽 꼬리 긴 데이터 →\n정규 가정 깨져도 IQR 잘 작동!' },
        { pose: 'idle', text: 'IQR 정의 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'IQR(Interquartile Range, 사분위수 범위) 은 Q3(상위 25% 경계) 에서 Q1(하위 25% 경계) 을 뺀 폭입니다. 이 폭의 1.5배만큼을 양쪽에 더해 "Q1 − 1.5·IQR 미만" 또는 "Q3 + 1.5·IQR 초과" 를 이상값으로 판정합니다. 박스플롯의 수염 밖 점들이 바로 이 기준의 이상값.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '학원 수강 시간 — 한쪽 꼬리가 매우 길어 (대부분 1~2시간, 일부 8시간 이상) 정규 가정 불가. IQR 로 가르면 자연스럽게 장시간 수강생만 이상값으로 분류 / 모의고사 점수 long-tail — 일부 초고득점 매물 분리 / 자습 시간 — 대부분 짧고 일부 매우 긴 학생. 모두 비대칭 분포라 IQR 이 ESD 보다 안전한 케이스. 박스플롯 시각화와 1:1 매칭.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "Q1·Q3 / 1.5·IQR / 박스플롯"',
          body:
            '"분위수 기반", "1.5·IQR 경계", "박스플롯" 이 키워드면 IQR. 정규 분포 가정이면 ESD/Z-Score, 밀도 기반이면 DBScan.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s4-z',
      title: '이상값 ③ Z-Score',
      quizId: 'adsp-3-1-cp-04-z',
      dialogue: [
        { pose: 'wave', text: '③ [Z-Score] — 표준화 점수가 임계 밖!' },
        { pose: 'think', text: '[Z-Score] —\n값을 [(값 − 평균)/σ] 표준화한 뒤\n임계값 비교.' },
        { pose: 'lightbulb', text: '왜? — |z| > 2 면 의심,\n> 3 이면 강한 이상값.\nESD 와 비슷하지만 [임계값 조절] 가능.' },
        { pose: 'happy', text: '비유: 모의고사 점수 평균 70, σ=10\n→ 한 학생이 100점이면 z = 3 →\n강한 이상값. 95점이면 z = 2.5 → 의심.' },
        { pose: 'idle', text: 'Z-Score 정의 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Z-Score 는 각 데이터 값을 "(값 − 평균) / 표준편차" 로 변환해 평균에서 몇 σ 떨어졌는지를 숫자로 표현하는 방법입니다. 변환된 |z| 가 임계값(보통 2 또는 3) 을 넘으면 이상값으로 판정. 임계값을 데이터 특성에 맞게 조절할 수 있다는 게 ESD 보다 유연한 점입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '한 학년 모의고사 점수가 평균 70, σ=10 인 학교. 한 학생의 점수가 100점이면 z = (100-70)/10 = 3.0 → 강한 이상값 / 한 학생의 점수가 z = -2.5 → 평균보다 2.5σ 낮음 → 의심 / 보고서 분량 z 가 4 → 평균을 매우 크게 벗어나는 제출물 → 부정 의심 후보. 임계값을 2 로 두면 더 민감하게, 3 으로 두면 보수적으로 잡을 수 있어요.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "표준화 + 임계값"',
          body:
            '"표준화 점수", "|z| > 2 또는 3" 이 키워드면 Z-Score. 분포 가정 없는 분위수 기반이면 IQR, 밀도 기반이면 DBScan, 평균 ± 3σ 고정이면 ESD.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s4-dbscan',
      title: '이상값 ④ DBScan',
      quizId: 'adsp-3-1-cp-04-dbscan',
      dialogue: [
        { pose: 'wave', text: '④ [DBScan] — 주변에 친구가 적은 점!' },
        { pose: 'think', text: '[Density-Based] —\nε 반경 안에 친구(점) 가 너무 적으면 이상.' },
        { pose: 'lightbulb', text: '왜? — 본래 군집 알고리즘인데\nnoise 점을 [자동 마킹] →\n이상값 탐지로도 사용. 비선형·비정규 강함.' },
        { pose: 'happy', text: '비유: 학급 자리 배치 —\n친구 군집 (3~4명씩) 곳곳에 형성,\n혼자 떨어진 학생 = noise = 이상값!' },
        { pose: 'idle', text: 'DBScan 작동 원리 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'DBScan(Density-Based Spatial Clustering of Applications with Noise) 은 본래 군집 알고리즘이지만, "어느 군집에도 속하지 않는 점(noise)" 을 자동으로 분리해주기 때문에 이상값 탐지로도 자주 사용됩니다. 평균·분산이 아닌 거리·밀도 기반이라 비선형·비정규 분포에서도 강합니다.',
        },
        {
          kind: 'section',
          title: '핵심 두 파라미터 — ε 와 minPts',
          body:
            'ε(epsilon): 한 점의 "이웃" 으로 인정할 거리 반경. minPts: 그 반경 안에 최소 몇 개 점이 있어야 군집으로 보는지의 기준. 어떤 점의 ε 반경 안에 minPts 미만이면 어느 군집에도 못 끼어 noise 로 분류 → 자연스럽게 이상값.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '학급 자리 배치 좌표 — 친구끼리 모여 앉은 군집 (3~4명) 곳곳에 형성, 혼자 떨어진 학생은 noise → 이상값 / 학생 공부 시간대 분포 — 야간자습 군집·아침자습 군집 형성, 새벽 3시 같은 외딴 시간은 noise → 의심 / 시험 답안 패턴 — 정상 답안 군집 + 외딴 답안지 → 부정 답안 후보.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "ε 반경 + minPts / 밀도"',
          body:
            '"밀도 기반", "ε 반경 + minPts", "noise 자동 식별" 이 키워드면 DBScan. 평균·분산이 키워드면 ESD/Z, 분위수면 IQR.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s4-review',
      title: '이상값 탐지 복습',
      quizId: 'adsp-3-1-cp-04',
      group: 'adsp-3-1-s4',
      dialogue: [
        { pose: 'wave', text: '[이상값 탐지 —] 복습 시간이야!' },
        { pose: 'think', text: '방금 배운 핵심을\n다시 한 번 정리해보자.' },
        { pose: 'lightbulb', text: '시험 함정도 같이 떠올려봐 —\n자주 헷갈리는 포인트가 있을 거야.' },
        { pose: 'happy', text: '비유로 다시 떠올리면\n오래 기억에 남아!' },
        { pose: 'idle', text: '잘 정리됐어! 다음 스텝으로!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '복습 체크리스트',
          body:
            '바로 직전 스텝들에서 배운 개념·암기법·함정을 한 번 더 떠올리며 다음 그룹으로 넘어가요. 잘 안 떠오르는 항목이 있으면 이전 스텝으로 돌아가 확인하세요.',
        },
      ],
    },
    // ─── R 자료구조 — 1 step → 5 substeps (overview + 4 자료구조) ───
    {
      id: 'adsp-3-1-s5',
      title: 'R 자료구조 개요',
      quizId: 'adsp-3-1-cp-05',
      dialogue: [
        { pose: 'wave', text: '이번에는 [R 자료구조 4종] 을 배워보자!' },
        { pose: 'think', text: '4 종:\n· [벡]터 · [리]스트\n· [매]트릭스 · [데]이터프레임' },
        { pose: 'lightbulb', text: '줄여서 [벡리매데]!\n타입 (같음/다름) × 차원 (1/2)\n조합으로 4분. 할당은 \`<-\`.' },
        { pose: 'happy', text: '비유: 학용품 정리 —\n같은 펜 통 (벡) / 필통 (리)\n/ 펜 격자 (매) / 시간표 (데).' },
        { pose: 'idle', text: '벡리매데 매칭 문제!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"벡·리·매·데"',
          body:
            '벡터(vector) · 리스트(list) · 매트릭스(matrix) · 데이터프레임(data.frame). 타입(같음/다름) × 차원(1/2) 조합.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '할당 — "화살표" `<-`',
          body:
            '기본 할당 연산자는 `<-` (예: `x <- c(1,2,3)`). `=` 도 대부분 동작하나 관례는 `<-`.',
        },
        {
          kind: 'table',
          title: '자료구조 4가지',
          headers: ['구조', '특징', '예시'],
          rows: [
            ['vector', '같은 유형 1차원', 'c(1, 2, 3)'],
            ['list', '서로 다른 유형 혼합', 'list(name="A", age=30)'],
            ['matrix', '같은 유형 2차원', 'matrix(1:6, 2, 3)'],
            ['data.frame', '열마다 유형 다른 표', 'iris, mtcars'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-1-s5-vector',
      title: 'R ① vector',
      quizId: 'adsp-3-1-cp-05-vector',
      dialogue: [
        { pose: 'wave', text: '① [vector] — 같은 색 펜 한 통!' },
        { pose: 'think', text: '[Vector] —\n[같은 타입] 1차원 묶음.' },
        { pose: 'lightbulb', text: '왜 기본? — R 의 [원자] 자료구조.\n다른 자료구조의 빌딩블록.\n다른 타입 섞으면 자동 변환 (coercion).' },
        { pose: 'happy', text: '비유: 같은 색 [볼펜 한 통] —\n전부 동일 타입 1차원.\n실무: \`c(1, 2, 3)\` · 점수 리스트.' },
        { pose: 'idle', text: 'vector 사례 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'vector 는 R 의 기본 단위. 같은 타입의 1차원 묶음. c(1, 2, 3) · c("a", "b") · 1:10 모두 vector. 다른 타입을 섞으면 가장 일반적인 타입으로 자동 변환(coercion).',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"같은 타입 1차원", "c() 함수". 다른 타입 혼합이면 list, 표 형태면 data.frame.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s5-list',
      title: 'R ② list',
      quizId: 'adsp-3-1-cp-05-list',
      dialogue: [
        { pose: 'wave', text: '② [list] — 필통 안의 잡동사니!' },
        { pose: 'think', text: '[List] —\n[다른 타입] 혼합 1차원.' },
        { pose: 'lightbulb', text: '왜? — 한 묶음에\n[숫자·문자·논리·다른 list] 도 가능.\nR 의 만능 컨테이너.' },
        { pose: 'happy', text: '비유: [필통] —\n펜·지우개·자가 다 들어감.\n실무: \`list(name="홍길동", age=20, scores=c(80,90))\`.' },
        { pose: 'idle', text: 'list 사례 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'list 는 서로 다른 타입·길이의 요소를 한 객체에 담는 컨테이너. list(name="A", age=30, scores=c(90,85)) 처럼 이름 붙여 접근.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"이질적 타입 혼합", "list()". 단일 타입 1차원이면 vector, 단일 타입 2차원이면 matrix.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s5-matrix',
      title: 'R ③ matrix',
      quizId: 'adsp-3-1-cp-05-matrix',
      dialogue: [
        { pose: 'wave', text: '③ [matrix] — 같은 펜 격자 정리!' },
        { pose: 'think', text: '[Matrix] —\n[같은 타입] 2차원 (행 × 열).' },
        { pose: 'lightbulb', text: '왜? — 수치 행렬 연산 (선대수)\n에 최적화. 통계·ML 핵심 자료구조.\n행렬곱 \`%*%\` · 전치 \`t()\` · 역행렬 \`solve()\`.' },
        { pose: 'happy', text: '비유: 같은 색 펜을\n[격자 (3행 × 4열)] 로 정리.\n실무: \`matrix(1:12, nrow=3)\`.' },
        { pose: 'idle', text: 'matrix 사례 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'matrix 는 같은 타입의 2차원 배열. matrix(1:6, nrow=2, ncol=3) · 행렬 곱(%*%)·전치(t())·역행렬(solve()) 등 선형대수 연산 지원.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"같은 타입 2차원", "행·열". 열마다 타입 달라도 되면 data.frame, 1차원이면 vector.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s5-df',
      title: 'R ④ data.frame',
      quizId: 'adsp-3-1-cp-05-df',
      dialogue: [
        { pose: 'wave', text: '④ [data.frame] — 시간표!' },
        { pose: 'think', text: '[Data Frame] —\n[열마다 다른 타입] 가능한 2차원 표.' },
        { pose: 'lightbulb', text: '왜 가장 많이 쓰임? —\n현실 데이터는 열마다 타입 다름\n(이름:str, 나이:int, 합격:bool).' },
        { pose: 'happy', text: '비유: 학교 [시간표] —\n시간 (str) · 요일 (str) · 과목 (str)\n열마다 다른 타입.\n실무: 엑셀·CSV 그대로 매핑 / iris·mtcars.' },
        { pose: 'idle', text: 'data.frame 사례 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'data.frame 은 분석에서 가장 자주 다루는 자료구조. 행=관측치, 열=변수. 열마다 타입(숫자·문자·factor) 이 달라도 되며, dplyr 로 filter/select/mutate.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"열마다 타입 다른 표", "iris·mtcars", "행=관측치 열=변수". 모든 열 같은 타입이면 matrix.',
        },
      ],
    },
    {
      id: 'adsp-3-1-s5-review',
      title: 'R 자료구조 복습',
      quizId: 'adsp-3-1-cp-05',
      group: 'adsp-3-1-s5',
      dialogue: [
        { pose: 'wave', text: '[R 자료구조] 복습 시간이야!' },
        { pose: 'think', text: '방금 배운 핵심을\n다시 한 번 정리해보자.' },
        { pose: 'lightbulb', text: '시험 함정도 같이 떠올려봐 —\n자주 헷갈리는 포인트가 있을 거야.' },
        { pose: 'happy', text: '비유로 다시 떠올리면\n오래 기억에 남아!' },
        { pose: 'idle', text: '잘 정리됐어! 다음 스텝으로!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '복습 체크리스트',
          body:
            '바로 직전 스텝들에서 배운 개념·암기법·함정을 한 번 더 떠올리며 다음 그룹으로 넘어가요. 잘 안 떠오르는 항목이 있으면 이전 스텝으로 돌아가 확인하세요.',
        },
      ],
    },
  ],
};

const ADSP_3_2: Lesson = {
  id: 'adsp-3-2',
  subject: 'adsp',
  chapter: 3,
  chapterTitle: '데이터 분석',
  topic: '통계 분석',
  title: '확률분포와 척도',
  hook: '평균·분산·정규분포를 "언제 뭘 쓰는지" 기준으로.',
  estimatedMinutes: 10,
  steps: [
    // ─── 측정 척도 4단계 — 1 step → 5 substeps ───
    {
      id: 'adsp-3-2-s1',
      title: '측정 척도 개요',
      quizId: 'adsp-3-2-cp-01',
      dialogue: [
        { pose: 'wave', text: '같은 숫자라도 [척도]가 다르면 가능한 계산이 달라.' },
        { pose: 'think', text: '4단계: [명]목 · [서]열 · [등]간 · [비]율.' },
        { pose: 'idle', text: '먼저 위계와 가능한 연산 확인.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '척도가 낮을수록 정보량이 적고, 높을수록 가능한 연산이 자유롭습니다. 명목 < 순서(서열) < 등간 < 비율 위계.',
        },
        {
          kind: 'table',
          headers: ['척도', '예시', '연산'],
          rows: [
            ['명목', '성별·혈액형', '='],
            ['순서', '학점·만족도', '=, <'],
            ['등간', '섭씨·연도', '=, <, +/−'],
            ['비율', '키·몸무게', '모든 연산 + 비율'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-2-s1-nominal',
      title: '척도 ① 명목',
      quizId: 'adsp-3-2-cp-01-nominal',
      dialogue: [
        { pose: 'wave', text: '첫째 [명]목 — 그냥 [이름표] 야. 순서 없음.' },
        { pose: 'think', text: '예: 혈액형 A·B·O·AB. A 가 B 보다 큰가? 의미 없는 질문.' },
        { pose: 'happy', text: '가능한 연산은 [같다 / 다르다] 뿐.' },
        { pose: 'idle', text: '명목 척도 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '명목(Nominal) 척도는 카테고리를 구분하는 이름표일 뿐, 그 사이에 어떤 순서·크기·간격도 의미가 없는 척도입니다. "같다 / 다르다" 의 비교만 통하고, "크다·작다", "차이가 얼마", "두 배" 같은 비교는 모두 무의미합니다. 척도의 4단계 중 가장 정보량이 적은 단계.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '혈액형(A·B·O·AB) — A 가 B 보다 큰가? 무의미 / 성별(남·여·기타) — 어느 쪽이 위인가? 무의미 / 도시 코드("서울·부산·대구") — 1·2·3 으로 적혀 있어도 그건 라벨일 뿐 / 자동차 색상(빨·파·노) / 학과(컴공·경영·국문). 모두 분류만 가능, 산수는 무의미한 데이터.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — "1·2·3 코드는 명목"',
          body:
            '"1=서울, 2=부산, 3=대구" 처럼 숫자 코드가 들어가도 의미가 라벨이면 명목입니다. 평균을 내도 "2 = 부산" 이라는 결과가 의미 없으니까요. 학점 A·B·C 처럼 순서가 있으면 다음 단계(순서).',
        },
      ],
    },
    {
      id: 'adsp-3-2-s1-ordinal',
      title: '척도 ② 서열(순서)',
      quizId: 'adsp-3-2-cp-01-ordinal',
      dialogue: [
        { pose: 'wave', text: '둘째 [서]열 — 누가 [위인지 아래인지] 는 알지만 [얼마나 차이] 인지는 몰라.' },
        { pose: 'think', text: '예: 학점 A · B · C. A가 B보다 위인 건 분명. 그런데 A-B 차이가 B-C 와 같을까? 모름.' },
        { pose: 'happy', text: '가능한 연산은 [같다 / 다르다 / 크다 / 작다] 까지.' },
        { pose: 'idle', text: '순서 척도 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '순서(Ordinal, 서열) 척도는 값들 사이에 순위는 있지만 그 간격이 일정한지는 모르는 척도입니다. "A > B > C" 라고 줄세우는 건 의미 있지만, "A와 B의 차이가 B와 C의 차이와 같다" 라고 단정할 수는 없어요. 차이를 산수(빼기) 로 다루는 건 무의미.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '학점 A·B·C·D·F — 순위는 분명하지만 A와 B 사이 차이가 B와 C 사이 차이와 같다고 보장 못함 / 만족도 5단계(매우 만족 ~ 매우 불만족) — 4와 5의 차이가 1과 2의 차이와 같은지 알 수 없음 / 마라톤 순위(1·2·3등) — 1등과 2등의 시간 격차가 2등과 3등 격차와 같다는 보장 없음 / 군대 계급(이병·일병·상병·병장). 모두 줄세우기는 OK 인데 간격은 모르는 케이스.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "순위는 OK, 평균은 No"',
          body:
            '순서 척도에 평균을 내면 의미가 흐릿해집니다 — 만족도 평균 3.7 이 정확히 어떤 만족 상태인지 단정 못함. 차이가 일정한 의미를 가지면 다음 단계(등간).',
        },
      ],
    },
    {
      id: 'adsp-3-2-s1-interval',
      title: '척도 ③ 등간',
      quizId: 'adsp-3-2-cp-01-interval',
      dialogue: [
        { pose: 'wave', text: '셋째 [등]간 — 차이([빼기])는 의미 있지만 [비율(나누기)] 은 무의미.' },
        { pose: 'think', text: '대표 예: 섭씨 온도. 30°C - 20°C = 10°C 차이는 OK. 30°C ÷ 15°C = "두 배 덥다"? No.' },
        { pose: 'happy', text: '이유 — [0이 절대 0이 아니다]. 섭씨 0°C 가 "온도 없음" 이 아니거든.' },
        { pose: 'idle', text: '등간 척도 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '등간(Interval) 척도는 값의 차이(빼기) 가 일정한 의미를 갖는 척도입니다. "10°C 차이" 가 어디서나 같은 의미예요. 하지만 비율(나누기) 은 무의미한데, 그 이유는 "절대 0 (값이 진짜 없는 상태)" 이 정의되지 않았기 때문입니다. 0이 그저 "임의로 정한 기준점" 일 뿐.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '섭씨 온도 — 30°C 가 15°C 의 "두 배" 가 아닙니다. 0°C 도 "온도가 0" 이 아니라 그저 물의 어는점일 뿐 (실제 절대 0 은 -273°C) / 연도 — 2024년이 1012년의 "두 배" 가 아닙니다. AD/BC 의 0은 임의로 정한 기준점 / IQ 점수 — IQ 100 이 IQ 50 의 "두 배 똑똑" 이 아닙니다. IQ 0 = "지능 없음" 이 아니거든요. 모두 차이는 의미 있지만 비율은 의미 없는 케이스.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — 0의 의미가 등간 vs 비율을 가른다',
          body:
            '"0 이 진짜 \'없음\' 인가?" 가 핵심 질문. 섭씨 0°C / 연도 0년 / IQ 0 은 "없음" 이 아니므로 등간. 켈빈 0K (절대 0) / 키 0cm / 매출 0원 은 진짜 "없음" 이라 비율.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s1-ratio',
      title: '척도 ④ 비율',
      quizId: 'adsp-3-2-cp-01-ratio',
      dialogue: [
        { pose: 'wave', text: '마지막 [비]율 — [0이 진짜 없음] 을 의미해서 [비율 계산] 까지 자유로워.' },
        { pose: 'think', text: '예: 키 180cm 는 90cm 의 [두 배]. 명백히 의미 있어.' },
        { pose: 'happy', text: '+ - × ÷ 모두 OK. 척도 4단계 중 [가장 정보량이 많은] 단계.' },
        { pose: 'idle', text: '비율 척도 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '비율(Ratio) 척도는 절대 0 이 존재해 모든 산술 연산이 의미를 가지는 척도입니다. "두 배 / 절반" 같은 비율 표현이 명백히 통합니다. 4단계 척도 중 가장 정보량이 많고 자유롭게 분석할 수 있어요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '키 180cm vs 90cm → 두 배 (의미 있음, 키 0cm = "키 없음") / 매출 1,000만원 vs 500만원 → 두 배 (매출 0원 = "매출 없음") / 몸무게 80kg vs 40kg → 두 배 / 길이·시간(초) · 거리(km) · 볼륨(리터) · 켈빈 온도(0K = 분자 운동 없음). 모두 0 이 진짜 "없음" 이라 비율 비교가 자연스러움.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "두 배가 말이 되나?"',
          body:
            '"이 값이 다른 값의 두 배다" 라는 표현이 자연스러우면 비율, 어색하면 등간 이하. 키·몸무게·매출·길이는 비율, 섭씨 온도·연도·IQ 는 등간.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s1-review',
      title: '측정 척도 복습',
      quizId: 'adsp-3-2-cp-01',
      group: 'adsp-3-2-s1',
      dialogue: [
        { pose: 'wave', text: '[측정 척도] 복습 시간이야!' },
        { pose: 'think', text: '방금 배운 핵심을\n다시 한 번 정리해보자.' },
        { pose: 'lightbulb', text: '시험 함정도 같이 떠올려봐 —\n자주 헷갈리는 포인트가 있을 거야.' },
        { pose: 'happy', text: '비유로 다시 떠올리면\n오래 기억에 남아!' },
        { pose: 'idle', text: '잘 정리됐어! 다음 스텝으로!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '복습 체크리스트',
          body:
            '바로 직전 스텝들에서 배운 개념·암기법·함정을 한 번 더 떠올리며 다음 그룹으로 넘어가요. 잘 안 떠오르는 항목이 있으면 이전 스텝으로 돌아가 확인하세요.',
        },
      ],
    },
    // ─── 확률분포 — 1 step → 3 substeps (overview + 이산 + 연속) ───
    {
      id: 'adsp-3-2-s2',
      title: '확률분포 개요',
      quizId: 'adsp-3-2-cp-02',
      dialogue: [
        { pose: 'wave', text: '확률분포 — 이산 vs 연속 두 갈래.' },
        { pose: 'think', text: '이산: 셀 수 있는 결과. 연속: 실수 구간.' },
        { pose: 'idle', text: '먼저 두 갈래 + 대표 분포.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '구분 기준',
          body:
            '결과를 셀 수 있으면 이산 (베르누이·이항·포아송…), 실수 구간이면 연속 (정규·t·카이제곱·F·지수).',
        },
      ],
    },
    {
      id: 'adsp-3-2-s2-discrete',
      title: '확률분포 ① 이산 (Discrete)',
      quizId: 'adsp-3-2-cp-02-discrete',
      dialogue: [
        { pose: 'wave', text: '첫째 [이산] — 셀 수 있는 결과.' },
        { pose: 'think', text: '베르누이·이항·기하·포아송·다항.' },
        { pose: 'happy', text: '"희귀 사건이 단위시간 몇 번" → 포아송!' },
        { pose: 'idle', text: '이산 분포 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '이산 확률분포는 결과가 셀 수 있는 값. 베르누이(1회 성공/실패) · 이항(n회 중 k) · 기하(첫 성공까지) · 다항(여러 범주) · 포아송(단위시간 드문 사건).',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"셀 수 있음", "성공/실패", "단위시간 사건". 키·시간 같은 실수면 연속.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s2-continuous',
      title: '확률분포 ② 연속 (Continuous)',
      quizId: 'adsp-3-2-cp-02-continuous',
      dialogue: [
        { pose: 'wave', text: '둘째 [연속] — 실수 구간.' },
        { pose: 'think', text: '정규·t·카이제곱·F·지수.' },
        { pose: 'happy', text: '"표본 작음·모분산 모를 때 평균 검정" → t분포!' },
        { pose: 'idle', text: '연속 분포 용도를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '연속 확률분포는 결과가 실수 구간. 정규(기본·CLT) · t(소표본 평균) · 카이제곱(분산·적합도·독립성) · F(분산비·ANOVA) · 지수(사건 사이 대기시간).',
        },
        {
          kind: 'table',
          title: '연속 주 용도',
          headers: ['분포', '용도'],
          rows: [
            ['정규', '기본, 평균·분산'],
            ['t', '소표본 평균 검정'],
            ['χ²', '분산·적합도·독립성 검정'],
            ['F', '두 분산의 비 (ANOVA)'],
            ['지수', '사건 사이 대기시간'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-2-s2-review',
      title: '확률분포 복습',
      quizId: 'adsp-3-2-cp-02',
      group: 'adsp-3-2-s2',
      dialogue: [
        { pose: 'wave', text: '[확률분포 — 이산 vs 연속] 복습 시간이야!' },
        { pose: 'think', text: '방금 배운 핵심을\n다시 한 번 정리해보자.' },
        { pose: 'lightbulb', text: '시험 함정도 같이 떠올려봐 —\n자주 헷갈리는 포인트가 있을 거야.' },
        { pose: 'happy', text: '비유로 다시 떠올리면\n오래 기억에 남아!' },
        { pose: 'idle', text: '잘 정리됐어! 다음 스텝으로!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '복습 체크리스트',
          body:
            '바로 직전 스텝들에서 배운 개념·암기법·함정을 한 번 더 떠올리며 다음 그룹으로 넘어가요. 잘 안 떠오르는 항목이 있으면 이전 스텝으로 돌아가 확인하세요.',
        },
      ],
    },
    // ─── 좋은 추정량 4성질 (불효일충) — 1 step → 5 substeps ───
    {
      id: 'adsp-3-2-s3',
      title: '좋은 추정량 개요',
      quizId: 'adsp-3-2-cp-03',
      dialogue: [
        { pose: 'wave', text: '추정량이 좋은 이유는 [4가지 성질].' },
        { pose: 'think', text: '"[불효일충]" — 불편성 · 효율성 · 일치성 · 충분성.' },
        { pose: 'idle', text: '먼저 4성질 이름·구분.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"불·효·일·충"',
          body:
            'Unbiased(불편성) · Efficient(효율성) · Consistent(일치성) · Sufficient(충분성). "정규성" 은 포함되지 않습니다 — 함정.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s3-unbiased',
      title: '추정량 ① 불편성',
      quizId: 'adsp-3-2-cp-03-unbiased',
      dialogue: [
        { pose: 'wave', text: '첫째 [불]편성 — 추정한 값을 [무한 번 평균] 내면 진짜 모수.' },
        { pose: 'think', text: '한 번만 추정하면 빗나갈 수 있어도 [기댓값] 으로 보면 정확.' },
        { pose: 'happy', text: '예: 표본평균이 모평균의 불편추정량 — 통계학의 출발점.' },
        { pose: 'idle', text: '불편성 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '불편성(Unbiased) 은 "추정값을 무한 번 반복했을 때 평균이 정확히 진짜 모수가 되는" 성질입니다. 한 번의 추정은 빗나갈 수 있어도 체계적인 편향(bias) 이 없다는 뜻이에요. 식으로는 E[추정량] = 모수.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '여론조사를 1,000번 반복해 매번 1,000명 표본의 지지율을 추정한다 가정. 표본평균은 매번 진짜 지지율 50% 근처에서 49.8 / 50.3 / 50.1 처럼 흔들리지만 1,000번 평균하면 정확히 50%. 반면 항상 "지지자만 인터뷰" 하는 편향된 표집은 평균이 60% 처럼 한쪽으로 치우쳐 — 불편성 깨짐. 표본분산도 (n-1) 로 나눠야 불편추정량이 되는 게 같은 이유.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "기댓값 = 모수"',
          body:
            '"기댓값이 모수와 일치", "편향 0" 이 키워드면 불편성. 분산이 작다 = 효율성, 표본↑ 시 모수에 수렴 = 일치성.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s3-efficient',
      title: '추정량 ② 효율성',
      quizId: 'adsp-3-2-cp-03-efficient',
      dialogue: [
        { pose: 'wave', text: '둘째 [효]율성 — 같은 모수를 추정하는 후보들 중 [흔들림이 가장 작은] 것.' },
        { pose: 'think', text: '평균적으로 정답이어도 매번 +-30%씩 튀면 못 써. 같은 정답률에 [덜 튀는] 게 좋은 추정량.' },
        { pose: 'happy', text: '예: 정규분포에서 표본평균이 표본중앙값보다 효율적 — 분산이 더 작거든.' },
        { pose: 'idle', text: '효율성 의미를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '효율성(Efficient) 은 같은 모수를 추정하는 여러 불편추정량 중 분산(또는 MSE) 이 가장 작은 것을 의미합니다. 평균적으로는 둘 다 정답이라도 한 번의 추정에서 덜 흔들리는 게 더 좋은 추정량 — 매번 더 신뢰할 수 있으니까요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '정규분포 모집단의 모평균을 추정할 때 후보 두 개: 표본평균과 표본중앙값. 둘 다 불편추정량이지만 표본평균의 분산이 더 작아 효율적 / 모분산을 추정할 때 (n-1) 로 나눈 표본분산은 불편이고 (n) 으로 나눈 추정량은 편향. 정규분포 가정하에 (n-1) 로 나눈 게 효율 측면에서도 좋은 선택. 같은 "옳음" 안에서 더 안정적인 쪽이 효율적.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "분산 / MSE 가 작다"',
          body:
            '"분산이 가장 작다", "MSE 최소" 가 키워드면 효율성. 평균이 모수와 같다면 불편성, 표본 커지면 수렴이면 일치성.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s3-consistent',
      title: '추정량 ③ 일치성',
      quizId: 'adsp-3-2-cp-03-consistent',
      dialogue: [
        { pose: 'wave', text: '셋째 [일]치성 — [표본 크기 n] 이 커질수록 추정량이 [모수에 점점 다가감].' },
        { pose: 'think', text: '소수에선 빗나갈 수 있어도 표본을 100배 늘리면 거의 정답.' },
        { pose: 'happy', text: '예: 동전 앞면 확률 추정 — 10번 던지면 7/10=0.7 같이 흔들리지만 100만 번이면 0.5에 매우 가까움.' },
        { pose: 'idle', text: '일치성 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '일치성(Consistent) 은 표본 크기 n 이 커질수록 추정량이 모수에 확률적으로 수렴하는 성질입니다. "표본을 무한히 늘리면 결국 정답이 된다" 의 보장. 큰 표본을 가질 수만 있다면 신뢰할 수 있다는 의미라 통계 추론의 핵심 기반.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '동전의 앞면 확률을 추정할 때 10번 던지면 7번 앞면 = 0.7 처럼 0.5에서 멀리 빗나갈 수 있음. 1,000번 던지면 약 0.49~0.51, 100만 번 던지면 0.5에 매우 가까움 — 표본↑ 가 추정 정확도↑ / 여론조사 1,000명 vs 10만 명 — 후자가 진짜 지지율에 더 가까움 / 평균 키 추정 — 100명에서 174.3cm, 10,000명에서 173.85cm, 100만 명이면 모평균에 매우 근접.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "n↑ 시 모수에 수렴"',
          body:
            '"표본 크기↑ 시 모수에 수렴", "n → ∞ 일관성" 이 키워드면 일치성. 분산 작다 = 효율성, 표본 정보 다 담음 = 충분성.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s3-sufficient',
      title: '추정량 ④ 충분성',
      quizId: 'adsp-3-2-cp-03-sufficient',
      dialogue: [
        { pose: 'wave', text: '넷째 [충]분성 — 추정량이 표본의 [모수 관련 정보를 다] 담아냄.' },
        { pose: 'think', text: '추정량을 알면 [원 표본을 더 들여다 봐도] 모수에 대한 추가 정보가 안 나와.' },
        { pose: 'happy', text: '예: 베르누이 시행에서 "성공 횟수" 만 알면 모비율 추정에 충분 — 어떤 순서로 성공했는지는 정보가 더 안 됨.' },
        { pose: 'idle', text: '충분성 의미를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '충분성(Sufficient) 은 추정량이 표본의 모수 관련 정보를 모두 흡수했음을 의미합니다. "추정량 값만 알면 충분하다 — 원 표본을 다시 들여다봐도 모수에 대한 더 많은 정보가 안 나온다" 는 보장. 정보 손실 없이 데이터를 압축한 통계량이라는 뜻.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '동전 100번 던지기에서 모비율 p 를 추정할 때, "성공 횟수 = 47" 만 알면 p 추정에 충분. 어떤 순서(앞·뒤·앞·앞…)로 47번 성공이었는지는 추가 정보가 아님 / 정규분포의 모평균 추정에서 "표본평균" 이 충분통계량 / 균등분포 U(0, θ) 에서 모수 θ 추정엔 "표본 최댓값" 이 충분. 모두 정보를 다 흡수해 더 압축할 수 없는 추정량.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '시험 함정 — "정규성" 은 4성질에 없음',
          body:
            '추정량의 4성질은 [불]편성·[효]율성·[일]치성·[충]분성. "정규성" 이 끼어 있으면 그건 함정 선지입니다.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s3-review',
      title: '좋은 추정량 복습',
      quizId: 'adsp-3-2-cp-03',
      group: 'adsp-3-2-s3',
      dialogue: [
        { pose: 'wave', text: '[좋은 추정량] 복습 시간이야!' },
        { pose: 'think', text: '방금 배운 핵심을\n다시 한 번 정리해보자.' },
        { pose: 'lightbulb', text: '시험 함정도 같이 떠올려봐 —\n자주 헷갈리는 포인트가 있을 거야.' },
        { pose: 'happy', text: '비유로 다시 떠올리면\n오래 기억에 남아!' },
        { pose: 'idle', text: '잘 정리됐어! 다음 스텝으로!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '복습 체크리스트',
          body:
            '바로 직전 스텝들에서 배운 개념·암기법·함정을 한 번 더 떠올리며 다음 그룹으로 넘어가요. 잘 안 떠오르는 항목이 있으면 이전 스텝으로 돌아가 확인하세요.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s4',
      title: '중심극한정리 (CLT)',
      quizId: 'adsp-3-2-cp-04',
      dialogue: [
        { pose: 'wave', text: '통계학의 [슈퍼 무기] — [중심극한정리(CLT)].' },
        { pose: 'think', text: '모집단 분포가 뭐든, 표본크기 [n]이 충분히 크면 [표본평균]의 분포는 [정규]에 가까워져.' },
        { pose: 'lightbulb', text: '[n ≥ 30] 이 "충분히 크다" 의 관습적 기준. 여기서 [t분포]로 검정하는 근거가 나와.' },
        { pose: 'happy', text: '"모집단이 뭐든 [표본평균] 은 [정규]" — 이 한 줄이 핵심!' },
        { pose: 'idle', text: '정확한 조건, 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '통계 추론의 마법',
          body:
            '모집단 분포와 무관하게 n 이 커지면 표본 "평균" 의 분포가 정규분포에 가까워진다 — 이것이 CLT. 통계적 추론이 성립하는 토대입니다.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '흔한 오해',
          body:
            'CLT 는 "개별 관측값이 정규를 따른다" 는 말이 아닙니다. "표본 평균의 분포" 에 대한 진술이며, 보통 n ≥ 30 이면 정규로 근사합니다.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s5',
      title: '주성분 분석 (PCA)',
      quizId: 'adsp-3-2-cp-05',
      dialogue: [
        { pose: 'wave', text: '변수가 [100개] 있다면? 시각화·모델링 모두 힘들어. [차원 축소] 가 필요해.' },
        { pose: 'think', text: '[PCA(주성분 분석)] — [분산 최대] 방향을 새 축으로 잡아 축소.' },
        { pose: 'lightbulb', text: '원래 정보를 [최대한 보존]하면서 차원을 줄이는 [선형] 기법이야.' },
        { pose: 'happy', text: '[Scree Plot]에서 "꺾이는 지점"이 적정 주성분 수! 누적 분산비 [80~90%] 정도 기준.' },
        { pose: 'idle', text: '목적·원리, 체크!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '변수가 100개인 고객 데이터 — 그대로 분석하면 모델이 무거워지고 해석도 어렵습니다. "덜 중요한 방향은 버리고 중요한 방향 몇 개로 요약" 하는 것이 PCA. 수십 개 변수를 2~3개 주성분으로 압축해 시각화·모델 속도를 동시에 잡습니다.',
        },
        {
          kind: 'section',
          title: '핵심 아이디어 — 분산이 큰 방향',
          body:
            '데이터가 가장 넓게 "퍼져 있는" 방향을 1주성분으로, 그다음 퍼진 방향(1주성분과 직교) 을 2주성분으로… 순차로 뽑습니다. 분산이 클수록 정보량이 많다고 보는 거죠. 원 변수들의 선형결합으로 만들어집니다.',
        },
        {
          kind: 'keypoints',
          title: '적용 절차',
          items: [
            '1) 변수 표준화 — 스케일 다르면 큰 값 쪽으로 왜곡 → 필수',
            '2) 공분산(또는 상관) 행렬의 고유값·고유벡터 계산',
            '3) 분산 설명 비율 = 고유값 / 고유값 총합',
            '4) Scree Plot(팔꿈치) 또는 누적 설명력 70~80% 기준으로 K 결정',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '주의점',
          body:
            'PCA 는 **선형** 차원축소라 곡선·비선형 관계는 잡지 못합니다. 주성분은 원 변수들의 선형결합이라 해석이 어려울 수 있고, 정답 레이블을 고려하지 않는 **비지도** 기법입니다.',
        },
      ],
    },
    {
      id: 'adsp-3-2-s6',
      title: '다차원척도화 (MDS)',
      quizId: 'adsp-3-2-cp-06',
      dialogue: [
        { pose: 'wave', text: 'PCA 의 사촌 — [MDS(다차원척도화)].' },
        { pose: 'think', text: 'PCA 가 [변수]에서 시작한다면, MDS 는 [거리·유사도 행렬]에서 시작해.' },
        { pose: 'lightbulb', text: '개체들의 [상대적 거리]를 최대한 보존하면서 [2~3차원]에 배치 — 시각화에 강해.' },
        { pose: 'happy', text: '[계량형 MDS](수치 거리) vs [비계량형 MDS](순위 거리) 구분!' },
        { pose: 'idle', text: 'PCA 와 차이 포인트, 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '거리를 지도에 펼친다',
          body:
            '개체들 사이 "얼마나 비슷한가"(유사도) 또는 "얼마나 다른가"(거리) 를 입력받아, 그 관계를 최대한 보존하는 저차원(주로 2D) 좌표에 개체들을 배치하는 기법입니다. 도시 간 거리표만으로 세계 지도를 복원해보는 것과 같은 발상.',
        },
        {
          kind: 'table',
          title: '두 가지 방식',
          headers: ['구분', '입력', '보존 대상'],
          rows: [
            ['계량 MDS (Metric)', '실제 거리 값', '거리 자체'],
            ['비계량 MDS (Non-metric)', '순위(ordering)', '거리의 순서만'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Stress 값으로 적합도 판정',
          body:
            'Stress = 원래 거리와 투영 거리의 불일치 정도. 0 에 가까울수록 좋고, 0.05 이하 우수 / 0.1 이하 양호 / 0.2 초과면 재검토. 해석은 2D 평면에 찍힌 점들의 **상대 위치** 를 본다 — 가까우면 유사.',
        },
        {
          kind: 'keypoints',
          title: 'PCA 와 비교',
          items: [
            '공통점: 차원 축소 · 시각화를 돕는 비지도 기법',
            'PCA 는 원 변수(값) 에서 출발',
            'MDS 는 개체 간 거리·유사도에서 출발',
            '같은 데이터라도 "무엇을 보존하고 싶은가" 에 따라 선택',
          ],
        },
      ],
    },
  ],
};

const ADSP_3_3: Lesson = {
  id: 'adsp-3-3',
  subject: 'adsp',
  chapter: 3,
  chapterTitle: '데이터 분석',
  topic: '통계적 가설 검정',
  title: '가설 검정 · 회귀 · 시계열',
  hook: 'p-value 0.05 를 넘었을 때 정확히 무슨 일이 일어난 걸까?',
  estimatedMinutes: 12,
  steps: [
    // ─── p-value · 가설검정 5용어 — 1 step → 6 substeps ───
    {
      id: 'adsp-3-3-s1',
      title: '가설검정 5용어 개요',
      quizId: 'adsp-3-3-cp-01',
      dialogue: [
        { pose: 'wave', text: '가설검정 5용어 — 헷갈리면 시험에서 뚫림.' },
        { pose: 'think', text: '[H₀] · [H₁] · [α] · [p-value] · [1·2종 오류].' },
        { pose: 'idle', text: '먼저 5용어 매핑.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'warn',
          title: 'p-value 는 "H₀ 참일 확률" 이 아님',
          body:
            'p-value 는 "H₀ 가정 시 현재 이상 극단값이 나올 확률". α 보다 작으면 "우연으로 보기 어렵다" 라는 판단.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s1-h0',
      title: '가설검정 ① 귀무가설 (H₀)',
      quizId: 'adsp-3-3-cp-01-h0',
      dialogue: [
        { pose: 'wave', text: '첫째 [H₀] — "차이 없다 · 효과 없다".' },
        { pose: 'think', text: '기각의 대상. 우리가 부정하고 싶은 가설.' },
        { pose: 'idle', text: '귀무가설의 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '귀무가설(H₀, Null Hypothesis) 은 "차이 없음 · 효과 없음" 을 가정. 검정의 출발점 — 데이터가 H₀ 를 뒤집을 만큼 강한지를 봅니다.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"차이 없다", "효과 없다", "현 상태". 새로 주장할 것은 H₁(대립).',
        },
      ],
    },
    {
      id: 'adsp-3-3-s1-h1',
      title: '가설검정 ② 대립가설 (H₁)',
      quizId: 'adsp-3-3-cp-01-h1',
      dialogue: [
        { pose: 'wave', text: '둘째 [H₁] — "차이 있다 · 효과 있다".' },
        { pose: 'think', text: 'H₀ 를 기각하면 채택되는 가설. 우리가 증명하고 싶은 것.' },
        { pose: 'idle', text: '대립가설의 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '대립가설(H₁, Alternative Hypothesis) 은 "차이 있음 · 효과 있음" 을 주장. 연구자가 증명하고자 하는 가설로, H₀ 가 기각될 때 채택됩니다.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"차이 있다", "효과 있다", "주장하고 싶은 것". 부정·기각 대상은 H₀.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s1-alpha',
      title: '가설검정 ③ 유의수준 (α)',
      quizId: 'adsp-3-3-cp-01-alpha',
      dialogue: [
        { pose: 'wave', text: '셋째 [α] — 잘못 기각할 위험.' },
        { pose: 'think', text: '보통 0.05. "1종 오류를 허용할 최대 확률".' },
        { pose: 'idle', text: '유의수준의 의미를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '유의수준(α) 은 "참인 H₀ 를 잘못 기각할 위험" 의 허용 한도. 일반적으로 0.05. p-value < α 면 H₀ 기각.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"1종 오류 허용 한도", "보통 0.05". H₀ 가 거짓일 때 기각 못 할 위험은 β (2종 오류).',
        },
      ],
    },
    {
      id: 'adsp-3-3-s1-pvalue',
      title: '가설검정 ④ p-value',
      quizId: 'adsp-3-3-cp-01-pvalue',
      dialogue: [
        { pose: 'wave', text: '넷째 [p-value] — H₀ 참일 때 극단값 확률.' },
        { pose: 'think', text: 'H₀ 가정 + 현재 결과 이상의 극단값이 우연으로 나올 확률.' },
        { pose: 'idle', text: 'p-value 의 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'p-value 는 "H₀ 가 참이라고 가정할 때, 현재 데이터 또는 그보다 극단적인 결과가 나올 확률". α 보다 작으면 H₀ 기각.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '"H₀ 가 참일 확률" 이 아님',
          body:
            'p-value 는 H₀ 의 진위 확률이 아닙니다. "H₀ 가 참이라면 이런 데이터가 우연히 나올 확률" 이 정확한 정의.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s1-error',
      title: '가설검정 ⑤ 1종/2종 오류',
      quizId: 'adsp-3-3-cp-01-error',
      dialogue: [
        { pose: 'wave', text: '다섯째 [오류 2종] — 1종(α) · 2종(β).' },
        { pose: 'think', text: '1종: H₀ 맞는데 기각 (거짓 양성). 2종: H₀ 틀렸는데 채택 (놓침).' },
        { pose: 'idle', text: '오류 매칭을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '1종 오류(α) = H₀ 가 참인데 기각 (거짓 양성). 2종 오류(β) = H₀ 가 거짓인데 채택 (놓침). 검정력(Power) = 1 − β.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"1종 = H₀ 맞는데 기각 = α", "2종 = H₀ 틀렸는데 채택 = β". 검정력 = 1−β.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s1-review',
      title: '가설검정 5용어 복습',
      quizId: 'adsp-3-3-cp-01',
      group: 'adsp-3-3-s1',
      dialogue: [
        { pose: 'wave', text: '[가설검정 5용어 —] 복습 시간이야!' },
        { pose: 'think', text: '방금 배운 핵심을\n다시 한 번 정리해보자.' },
        { pose: 'lightbulb', text: '시험 함정도 같이 떠올려봐 —\n자주 헷갈리는 포인트가 있을 거야.' },
        { pose: 'happy', text: '비유로 다시 떠올리면\n오래 기억에 남아!' },
        { pose: 'idle', text: '잘 정리됐어! 다음 스텝으로!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '복습 체크리스트',
          body:
            '바로 직전 스텝들에서 배운 개념·암기법·함정을 한 번 더 떠올리며 다음 그룹으로 넘어가요. 잘 안 떠오르는 항목이 있으면 이전 스텝으로 돌아가 확인하세요.',
        },
      ],
    },
    // ─── t검정 3종 — 1 step → 4 substeps ───
    {
      id: 'adsp-3-3-s2',
      title: 't검정 3종 개요',
      quizId: 'adsp-3-3-cp-02',
      dialogue: [
        { pose: 'wave', text: 't검정은 평균 차이 검정 — 3가지 버전.' },
        { pose: 'think', text: '[일표본] · [대응표본] · [독립표본].' },
        { pose: 'idle', text: '먼저 3가지 구분 + 상황 매칭.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '독립 vs 대응 함정',
          body:
            '"같은 대상의 전/후" 는 대응표본. "서로 다른 두 집단" 은 독립표본. 시험 단골.',
        },
        {
          kind: 'table',
          headers: ['종류', '상황', '예시'],
          rows: [
            ['일표본', '평균 vs 기준값', '평균 수명 = 1000시간?'],
            ['대응표본', '같은 대상 전/후', '다이어트 전/후 체중'],
            ['독립표본', '서로 다른 두 집단', 'A조 vs B조 점수'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-3-s2-one',
      title: 't검정 ① 일표본',
      quizId: 'adsp-3-3-cp-02-one',
      dialogue: [
        { pose: 'wave', text: '첫째 [일표본 t] — [한 집단의 평균] 이 [기준값] 과 같은지 검정.' },
        { pose: 'think', text: '집단은 하나, 비교 상대는 [고정된 숫자] 한 개.' },
        { pose: 'happy', text: '예: 회사가 "이 전구 평균 수명은 1,000시간" 이라 광고. 실제로 그러한지 검증.' },
        { pose: 'idle', text: '일표본 t검정 상황을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '일표본(One-sample) t검정은 한 집단의 평균이 알려진 기준값과 같은지를 검증하는 검정입니다. H₀: μ = μ₀. 비교 상대가 또 다른 집단이 아니라 "특정 숫자" 라는 게 다른 t검정과의 결정적 차이.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '제조사가 "이 전구 평균 수명 = 1,000시간" 광고. 100개 표본의 평균이 985시간일 때, 광고가 맞는지 검정 / 학교가 "우리 학생 평균 키 170cm" 라 발표. 표본 평균과 실제 일치 여부 / 고객 만족도 평균이 회사 KPI 4.5점에 도달했는지 확인. 모두 비교 대상이 [집단 한 개 vs 숫자 한 개].',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "집단 1개 vs 숫자 1개"',
          body:
            '"평균 vs 특정값", "단일 그룹 vs 기준" 이 키워드면 일표본. 두 집단을 비교하면 독립표본, 같은 사람의 전/후를 비교하면 대응표본.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s2-paired',
      title: 't검정 ② 대응표본',
      quizId: 'adsp-3-3-cp-02-paired',
      dialogue: [
        { pose: 'wave', text: '둘째 [대응표본 t] — 같은 대상의 [전/후·처치 전/후] 비교.' },
        { pose: 'think', text: '핵심 — [같은 사람] 을 두 번 측정. 짝(pair) 으로 묶임.' },
        { pose: 'happy', text: '예: 다이어트 프로그램 참가자 30명의 시작 vs 12주 후 체중.' },
        { pose: 'idle', text: '대응표본 상황을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '대응표본(Paired) t검정은 같은 대상에서 두 시점 또는 두 조건을 측정해 차이의 평균이 0인지 검정합니다. 핵심은 "측정 대상이 같다" 는 것 — 같은 사람·같은 차량·같은 환자가 두 번 측정되어 자연스러운 짝(pair) 을 이룹니다. 분석 시엔 차이값(d = 사후 − 사전) 의 평균이 0인지 일표본 t로 풉니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '다이어트 프로그램 참가자 30명 — 시작 체중 vs 12주 후 체중 / 환자 50명 — 약 복용 전 혈압 vs 복용 후 혈압 / 같은 학생 30명 — 학기 초 시험 점수 vs 학기 말 점수 / 같은 차량 — 일반 타이어 vs 친환경 타이어 장착 후 연비. 모두 한 대상이 두 번 측정돼 짝지어진 데이터.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — "같은 대상" 을 놓치면 독립표본으로 오답',
          body:
            '"같은 사람", "같은 환자", "전/후" 같은 표현이 등장하면 대응표본. 만약 다이어트 그룹 vs 비다이어트 그룹처럼 다른 사람들이라면 독립표본이라 오답.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s2-indep',
      title: 't검정 ③ 독립표본',
      quizId: 'adsp-3-3-cp-02-indep',
      dialogue: [
        { pose: 'wave', text: '셋째 [독립표본 t] — [서로 다른 사람들] 로 구성된 두 그룹의 평균 비교.' },
        { pose: 'think', text: '핵심 — 두 그룹의 사람이 [겹치지 않음]. 짝지을 수 없음.' },
        { pose: 'happy', text: '예: A반(30명) vs B반(30명) 의 수학 점수 — 서로 다른 학생들.' },
        { pose: 'idle', text: '독립표본 상황을 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '독립표본(Two-sample) t검정은 서로 다른 두 집단의 평균을 비교합니다. 두 그룹의 구성원이 겹치지 않아 짝지을 수 없는 게 대응표본과의 차이. 등분산성이 가정되면 pooled variance, 등분산이 깨졌으면 Welch 의 t를 사용합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            'A반(30명) vs B반(30명) 의 수학 점수 — 학생 구성원이 다름 / 흡연자 그룹 vs 비흡연자 그룹의 폐활량 / 신약 투여 그룹(50명) vs 위약 그룹(50명) 의 회복 시간 / 남성 vs 여성의 평균 키. 모두 두 집단이 [서로 다른 사람들] 로 구성됨.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — 셋 중 무엇? 빠른 판별',
          body:
            '비교 상대가 [숫자 한 개] → 일표본 / [같은 대상의 두 측정] → 대응표본 / [서로 다른 두 그룹] → 독립표본. 시험 함정 1순위 — "같은 사람" 인지 "다른 사람" 인지.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s2-review',
      title: 't검정 3종 복습',
      quizId: 'adsp-3-3-cp-02',
      group: 'adsp-3-3-s2',
      dialogue: [
        { pose: 'wave', text: '[t검정 3종 —] 복습 시간이야!' },
        { pose: 'think', text: '방금 배운 핵심을\n다시 한 번 정리해보자.' },
        { pose: 'lightbulb', text: '시험 함정도 같이 떠올려봐 —\n자주 헷갈리는 포인트가 있을 거야.' },
        { pose: 'happy', text: '비유로 다시 떠올리면\n오래 기억에 남아!' },
        { pose: 'idle', text: '잘 정리됐어! 다음 스텝으로!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '복습 체크리스트',
          body:
            '바로 직전 스텝들에서 배운 개념·암기법·함정을 한 번 더 떠올리며 다음 그룹으로 넘어가요. 잘 안 떠오르는 항목이 있으면 이전 스텝으로 돌아가 확인하세요.',
        },
      ],
    },
    // ─── 회귀 4가정 (선분정독) — 1 step → 5 substeps ───
    {
      id: 'adsp-3-3-s3',
      title: '회귀 4가정 개요',
      quizId: 'adsp-3-3-cp-03',
      dialogue: [
        { pose: 'wave', text: '선형회귀가 의미 있으려면 [4가정] 충족.' },
        { pose: 'think', text: '"[선분정독]" — 선형성 · 등분산 · 정규성 · 독립성.' },
        { pose: 'idle', text: '먼저 SST = SSE + SSR + 4가정 개요.' },
      ],
      blocks: [
        {
          kind: 'section',
          title: 'SST = SSE + SSR',
          body:
            '총 변동(SST) = 설명된 변동(SSR) + 남은 잔차(SSE). R² = SSR/SST. 4가정이 무너지면 R² · p-value 모두 의심.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"선·분·정·독"',
          body:
            'Linearity · Homoscedasticity · Normality · Independence. "단조성" 같은 항목은 포함되지 않음.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s3-linear',
      title: '회귀 가정 ① 선형성',
      quizId: 'adsp-3-3-cp-03-linear',
      dialogue: [
        { pose: 'wave', text: '첫째 [선]형성 — X와 Y의 관계가 [직선] 모양이어야 회귀를 쓸 수 있음.' },
        { pose: 'think', text: '진단: 잔차 vs 적합값 산점도에 [곡선 모양] 이 안 보이면 OK.' },
        { pose: 'happy', text: '예: 광고비 vs 매출이 직선이면 회귀 OK. 광고비 1억 이후 매출이 정체된다면 곡선 — 선형성 위반.' },
        { pose: 'idle', text: '선형성 진단 도구를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '선형성(Linearity) 은 "X 가 1단위 증가할 때 Y 도 일정하게 증가/감소한다" 는 직선 관계 가정입니다. 회귀의 가장 기본 전제 — 만약 X-Y 가 곡선이거나 어느 구간 후 정체된다면 직선으로 그은 회귀선이 시스템을 잘못 묘사하게 됩니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기 + 진단법',
          body:
            '광고비 vs 매출 — 작은 광고비에선 매출이 비례 증가하지만 광고비 1억 이후 매출이 평탄해지면 곡선. 회귀선이 큰 영역에서 과대/과소 추정 / 진단 도구: "잔차 vs 적합값" 산점도에 U자·역U자 같은 곡선 패턴이 보이면 선형성 깨짐 / 위반 시 대응: 다항식 항(X²) 추가, 변수 변환(log·sqrt), 비선형 모델로 전환.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "잔차에 곡선 패턴"',
          body:
            '"잔차 산점도에 곡선 패턴이 보이면 선형성 위반". 부채꼴이면 등분산성 위반, 종 모양 분포는 정규성 이슈, 시간·공간 패턴은 독립성 이슈.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s3-homo',
      title: '회귀 가정 ② 분산 (등분산성)',
      quizId: 'adsp-3-3-cp-03-homo',
      dialogue: [
        { pose: 'wave', text: '둘째 [분]산 — 잔차의 [흩어짐 크기] 가 X 어디서나 [비슷] 해야 함.' },
        { pose: 'think', text: '진단: 잔차 산점도가 [부채꼴] 로 퍼지면 위반.' },
        { pose: 'happy', text: '예: 매출 작은 가게는 잔차도 작게, 큰 가게는 크게 → 점차 벌어지는 부채꼴 → 등분산 깨짐.' },
        { pose: 'idle', text: '등분산성 위반 신호를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '등분산성(Homoscedasticity) 은 X 의 어느 영역에서나 잔차의 흩어짐(분산) 이 비슷하게 일정하다는 가정입니다. 깨지면(이분산) 회귀계수의 표준오차 추정이 잘못되어 t·F 검정의 p-value 를 신뢰할 수 없게 됩니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기 + 진단법',
          body:
            '소득 vs 지출 회귀 — 저소득에선 지출이 좁게 모이고 고소득에선 넓게 흩어짐 → 부채꼴 패턴 / 매출 vs 광고 효과 — 큰 광고비일수록 매출 변동 폭이 커짐 → 우상향 부채꼴 / 진단 도구: 잔차 vs 적합값 산점도에서 "왼쪽 좁고 오른쪽 넓은" funnel / Breusch-Pagan 검정 / 위반 시 대응: 종속변수에 log·sqrt 변환(재표현), 가중최소제곱(WLS) 적용.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "잔차의 부채꼴"',
          body:
            '"잔차 산점도가 부채꼴(funnel)" 이 키워드면 등분산성 위반. 곡선 패턴이면 선형성, 시간 자기상관이면 독립성.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s3-normal',
      title: '회귀 가정 ③ 정규성',
      quizId: 'adsp-3-3-cp-03-normal',
      dialogue: [
        { pose: 'wave', text: '셋째 [정]규성 — 잔차의 분포가 [종 모양 정규분포] 여야 함.' },
        { pose: 'think', text: '진단: [QQ플롯] 의 점이 직선 위에 있으면 OK. Shapiro-Wilk 검정 도 사용.' },
        { pose: 'happy', text: '왜 중요? 회귀계수의 신뢰구간·p-value 가 정규성을 가정해 계산되거든.' },
        { pose: 'idle', text: '정규성 진단 도구를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정규성(Normality) 은 잔차가 평균 0인 정규분포를 따라야 한다는 가정입니다. 회귀계수의 신뢰구간·t·F 검정의 p-value 가 정규성 가정 위에서 계산되기 때문에 이 가정이 깨지면 통계적 추론이 흔들립니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기 + 진단법',
          body:
            '잔차 히스토그램이 한쪽으로 길게 뻗은 비대칭 (skewed) → 정규성 깨짐 / QQ플롯의 점들이 양 끝에서 대각선을 크게 벗어남 → 두꺼운 꼬리 (heavy tails) / 진단 도구: QQ플롯, Shapiro-Wilk 검정, 잔차 히스토그램 / 위반 시 대응: 종속변수 변환(log), 이상치 제거 후 재적합, 또는 표본이 충분히 크면 CLT 로 어느 정도 보완.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "QQ플롯 / Shapiro-Wilk"',
          body:
            '"QQ플롯", "Shapiro-Wilk 검정", "잔차 히스토그램 종 모양" 이 키워드면 정규성 가정. 분산 일정이면 등분산, 직선 관계면 선형성, 시간 자기상관이면 독립성.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s3-indep',
      title: '회귀 가정 ④ 독립성',
      quizId: 'adsp-3-3-cp-03-indep',
      dialogue: [
        { pose: 'wave', text: '넷째 [독]립성 — 한 잔차가 [다음 잔차에 영향] 주면 안 됨.' },
        { pose: 'think', text: '시계열에서 자주 깨져. 어제 잔차가 +이면 오늘도 +일 가능성 → 자기상관.' },
        { pose: 'happy', text: '진단: [Durbin-Watson] 통계량 ≈ 2 면 OK. 0이나 4에 가까우면 자기상관 의심.' },
        { pose: 'idle', text: '독립성 진단 도구를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '독립성(Independence) 은 잔차들이 서로 상관이 없어야 한다는 가정입니다. 한 관측의 잔차가 다른 관측의 잔차에 영향을 주면 안 됨. 시계열·반복측정·군집 데이터에서 자주 깨지며 깨지면 회귀계수 표준오차가 과소/과대 추정되어 검정 신뢰가 떨어집니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기 + 진단법',
          body:
            '주식 일별 종가를 회귀하면 어제 잔차가 +였을 때 오늘 잔차도 + 인 경향 → 자기상관 / 같은 환자에게서 반복 측정한 혈압 데이터 — 같은 환자의 측정끼리 상관 / 진단 도구: Durbin-Watson 통계량 (≈ 2 면 OK, 0이나 4 가까우면 의심), 잔차 ACF 그래프 / 위반 시 대응: 시계열 모델(ARIMA), 일반화 최소제곱(GLS), 혼합효과 모형.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "Durbin-Watson / 자기상관"',
          body:
            '"Durbin-Watson 통계량", "잔차 자기상관", "시계열에서 위반" 이 키워드면 독립성. 잔차 산포가 변하면 등분산, 분포 형태면 정규성, 곡선이면 선형성.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s3-review',
      title: '회귀 4가정 복습',
      quizId: 'adsp-3-3-cp-03',
      group: 'adsp-3-3-s3',
      dialogue: [
        { pose: 'wave', text: '[회귀 4가정] 복습 시간이야!' },
        { pose: 'think', text: '방금 배운 핵심을\n다시 한 번 정리해보자.' },
        { pose: 'lightbulb', text: '시험 함정도 같이 떠올려봐 —\n자주 헷갈리는 포인트가 있을 거야.' },
        { pose: 'happy', text: '비유로 다시 떠올리면\n오래 기억에 남아!' },
        { pose: 'idle', text: '잘 정리됐어! 다음 스텝으로!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '복습 체크리스트',
          body:
            '바로 직전 스텝들에서 배운 개념·암기법·함정을 한 번 더 떠올리며 다음 그룹으로 넘어가요. 잘 안 떠오르는 항목이 있으면 이전 스텝으로 돌아가 확인하세요.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s4',
      title: '다중공선성 · 변수 선택',
      quizId: 'adsp-3-3-cp-04',
      dialogue: [
        { pose: 'wave', text: '설명변수끼리 서로 너무 비슷하면? [다중공선성] 문제!' },
        { pose: 'think', text: '[VIF > 10] 이면 경고! 회귀계수의 분산이 [폭발]해 해석이 엉망.' },
        { pose: 'lightbulb', text: '변수 선택법 — [전진선택], [후진제거], [단계적(stepwise)].' },
        { pose: 'happy', text: '[AIC] · [BIC] 같은 정보 기준으로 모델 간 비교!' },
        { pose: 'idle', text: '탐지와 대응, 체크!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: 'VIF ≥ 10 이면 의심',
          body:
            '설명변수끼리 상관이 너무 크면 계수 해석이 불안정해집니다. VIF(Variance Inflation Factor) 가 10 이상이면 다중공선성을 의심하세요.',
        },
        {
          kind: 'table',
          headers: ['변수 선택법', '설명'],
          rows: [
            ['전진선택', '빈 상태에서 하나씩 추가'],
            ['후진제거', '전부에서 하나씩 제거'],
            ['단계선택', '전진 + 후진 혼합'],
            ['벌점 기반', 'Ridge(L2) / Lasso(L1) / ElasticNet'],
          ],
        },
        {
          kind: 'keypoints',
          title: '정보 기준',
          items: [
            'AIC: 복잡도 약한 벌점',
            'BIC: 표본 크기 반영, 더 엄격',
            "Mallow's Cp: 잔차와 변수 수 균형",
          ],
        },
      ],
    },
    // ─── 시계열 4성분 (추계순불) — 1 step → 5 substeps ───
    {
      id: 'adsp-3-3-s5',
      title: '시계열 4성분 개요',
      quizId: 'adsp-3-3-cp-05',
      dialogue: [
        { pose: 'wave', text: '시계열은 [4가지 성분] 으로 분해.' },
        { pose: 'think', text: '"[추계순불]" — 추세 · 계절 · 순환 · 불규칙.' },
        { pose: 'idle', text: '먼저 4성분 + 정상성 개요.' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"추·계·순·불"',
          body:
            'Trend(추세) · Seasonality(계절) · Cycle(순환) · Irregular(불규칙). "지연(Lag)" 은 ARIMA 파라미터지 분해 성분 아님 — 함정.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '정상성과 ARIMA',
          body:
            '모델링 전 정상성(평균·분산 시간 불변) 확보 필수. 도구는 차분(Differencing). AR/MA/ARMA/ARIMA 는 모형 확장 단계.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s5-trend',
      title: '시계열 ① 추세',
      quizId: 'adsp-3-3-cp-05-trend',
      dialogue: [
        { pose: 'wave', text: '첫 성분 [추]세 — [수년~수십 년] 단위의 [큰 방향성].' },
        { pose: 'think', text: '단기 출렁임을 다 걷어내고 멀찍이서 보면 보이는 큰 흐름.' },
        { pose: 'happy', text: '예: 한국 인구 증가율 — 1970년대부터 2020년대까지 큰 우하향 추세.' },
        { pose: 'idle', text: '추세 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '추세(Trend) 는 시계열의 장기적이고 일관된 방향성입니다. "수년~수십 년" 단위에서 시계열을 멀찍이 보면 드러나는 큰 흐름 — 우상향, 우하향, 평탄화. 단기 출렁임이나 1년 주기 반복을 모두 걷어낸 뒤 남는 큰 그림이에요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '한국 인구 증가율 — 70년대 2.5% 에서 2020년대 0% 대로 수십 년 우하향 / 글로벌 평균 기온 — 산업혁명 이후 100년+ 우상향 / 인터넷 사용자 수 — 1995년부터 2020년대까지 우상향 / 기업의 매출 성장 곡선 — 창업 후 10년 우상향. 모두 짧게 보면 안 보이고 긴 시야에서만 드러나는 큰 흐름.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "장기 / 일관된 방향"',
          body:
            '"장기 상승/하락", "수년~수십 년 변화" 가 키워드면 추세. 1년 단위 반복이면 계절성, 비고정 주기 등락이면 순환, 무작위면 불규칙.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s5-season',
      title: '시계열 ② 계절성',
      quizId: 'adsp-3-3-cp-05-season',
      dialogue: [
        { pose: 'wave', text: '둘째 [계]절성 — 매년·매주·매일처럼 [정확히 같은 주기] 로 반복.' },
        { pose: 'think', text: '여름엔 빙수, 12월엔 크리스마스 선물, 토요일엔 식당 — 주기가 [고정] 이야.' },
        { pose: 'happy', text: '시간 단위만 보면 분(점심시간) · 시간 · 일 · 주 · 월 · 년 다양해.' },
        { pose: 'idle', text: '계절성 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '계절성(Seasonality) 은 시·일·주·월·년 단위처럼 고정된 주기로 정확하게 반복되는 패턴입니다. "매년 8월에 늘 같은 모양" 처럼 주기가 일정하다는 게 핵심 — 다음 주기에 어느 정도 비슷한 패턴이 다시 올지 예측이 가능합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '아이스크림 매출 — 매년 7~8월 피크, 12~2월 저점 (1년 주기) / 식당 매출 — 매주 토요일 피크, 월요일 저점 (1주 주기) / 카페 트래픽 — 매일 오전 8~10시 피크 (1일 주기) / 카드 결제 — 매월 25일 월급일 직후 피크 (1개월 주기). 모두 정확히 같은 주기로 반복되는 형태.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "고정 주기 / 매년 같은 시점"',
          body:
            '"고정 주기 반복", "여름·겨울", "월말·요일 패턴" 이 키워드면 계절성. 주기가 들쭉날쭉이면 순환, 장기 방향만이면 추세.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s5-cycle',
      title: '시계열 ③ 순환',
      quizId: 'adsp-3-3-cp-05-cycle',
      dialogue: [
        { pose: 'wave', text: '셋째 [순]환 — 등락은 있는데 주기가 [고정 안 됨].' },
        { pose: 'think', text: '경기 사이클이 대표. 5~10년에 한 번 호황·불황이 오는데 정확히 5년이라곤 못 해.' },
        { pose: 'happy', text: '계절성 vs 순환의 차이 — 주기가 [고정] 이냐 [가변] 이냐가 결정.' },
        { pose: 'idle', text: '순환 예시를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '순환(Cycle) 은 계절성보다 길고 등락이 있지만 주기가 일정하지 않은 변동입니다. 다음 등락이 언제 올지 정확히 예측하기 어려운 게 계절성과의 결정적 차이. 보통 수년 단위로 펼쳐지는 큰 사이클입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '경기 사이클(호황·불황) — 짧으면 5년, 길면 10년 이상이지만 정확한 주기 없음 / 부동산 가격 사이클 — 7~10년 기간 등락이 있지만 매번 다름 / 금리 사이클 — 정책·외부 요인에 따라 주기가 변함 / IT 산업의 dot-com 버블·AI 붐 같은 기술 사이클. 모두 "오긴 오는데 언제일지 모름" 의 등락 패턴.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "주기가 가변 / 수년 등락"',
          body:
            '"경기 사이클", "주기가 불규칙", "수년 단위 등락" 이 키워드면 순환. 주기가 정확히 고정이면 계절성, 큰 방향성만이면 추세.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s5-irregular',
      title: '시계열 ④ 불규칙',
      quizId: 'adsp-3-3-cp-05-irregular',
      dialogue: [
        { pose: 'wave', text: '넷째 [불]규칙 — 추세·계절·순환을 [다 빼고 남는] 무작위 변동.' },
        { pose: 'think', text: '예: 코로나 첫 락다운 한 달 — 일회성·예측 불가의 큰 변동.' },
        { pose: 'happy', text: '특징 — [예측 불가능]. 모델이 다음 값을 정확히 맞히지 못하는 부분.' },
        { pose: 'idle', text: '불규칙 성분 정의를 골라봐.' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '불규칙(Irregular) 성분은 추세·계절성·순환을 모두 분해해 빼낸 뒤 남는 무작위 변동입니다. 일회성 외부 충격, 자연재해, 측정 오차, 알 수 없는 우연 — 시계열 모델이 미리 예측할 수 없는 부분이 모두 여기로 모입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '코로나 첫 락다운 한 달간 음식점 매출 폭락 — 일회성, 추세나 계절로 설명 불가 / 9·11 직후 항공권 수요 급락 — 예측 불가의 외부 충격 / 갑작스러운 자연재해(태풍·지진) 로 인한 단기 매출 변동 / 주식 시장의 일별 노이즈. 모두 추세·계절·순환을 다 분해해도 마지막에 남는 무작위 변동.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '시험 함정 — "Lag(지연)" 은 4성분이 아님',
          body:
            '시계열 4성분은 [추]세·[계]절·[순]환·[불]규칙. "지연(Lag)" 은 ARIMA 모델의 파라미터(AR/MA 의 lag 차수) 이지 분해 성분이 아닙니다 — 함정 선지로 자주 출제.',
        },
      ],
    },
    {
      id: 'adsp-3-3-s5-review',
      title: '시계열 4성분 복습',
      quizId: 'adsp-3-3-cp-05',
      group: 'adsp-3-3-s5',
      dialogue: [
        { pose: 'wave', text: '[시계열 4성분] 복습 시간이야!' },
        { pose: 'think', text: '방금 배운 핵심을\n다시 한 번 정리해보자.' },
        { pose: 'lightbulb', text: '시험 함정도 같이 떠올려봐 —\n자주 헷갈리는 포인트가 있을 거야.' },
        { pose: 'happy', text: '비유로 다시 떠올리면\n오래 기억에 남아!' },
        { pose: 'idle', text: '잘 정리됐어! 다음 스텝으로!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '복습 체크리스트',
          body:
            '바로 직전 스텝들에서 배운 개념·암기법·함정을 한 번 더 떠올리며 다음 그룹으로 넘어가요. 잘 안 떠오르는 항목이 있으면 이전 스텝으로 돌아가 확인하세요.',
        },
      ],
    },
  ],
};

const ADSP_3_4: Lesson = {
  id: 'adsp-3-4',
  subject: 'adsp',
  chapter: 3,
  chapterTitle: '데이터 분석',
  topic: '정형 데이터 마이닝',
  title: '분류 · 군집 · 연관',
  hook: '지도학습 · 비지도학습, 그리고 장바구니 분석까지.',
  estimatedMinutes: 12,
  steps: [
    {
      id: 'adsp-3-4-s1',
      title: '과적합 / 데이터 분할',
      quizId: 'adsp-3-4-cp-01',
      dialogue: [
        { pose: 'wave', text: '모델이 [훈련 데이터]는 100% 맞추는데 [새 데이터]엔 망하면? [과적합]이야.' },
        { pose: 'think', text: '원인 — [모델 복잡], [데이터 부족], [잡음 학습].' },
        { pose: 'lightbulb', text: '대응 — [훈련·검증·테스트] 분할 + [교차검증(CV)] + [정규화(L1/L2)].' },
        { pose: 'happy', text: '편향-분산 트레이드오프 — 너무 단순하면 [편향], 너무 복잡하면 [분산] 폭발!' },
        { pose: 'idle', text: '과적합 신호, 체크!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '데이터 마이닝은 "큰 데이터에서 규칙·패턴을 발굴" 하는 작업. 정답 레이블이 있으면 지도(분류·회귀), 없으면 비지도(군집·연관).',
        },
        {
          kind: 'section',
          title: '과적합 vs 과소적합',
          body:
            '훈련 데이터에만 과하게 맞추면 과적합 — 새 데이터에 못 맞춥니다. 반대로 아예 학습이 덜 되면 과소적합. 균형점을 찾는 것이 모델링의 핵심.',
        },
        {
          kind: 'table',
          title: '분할 방법 4가지',
          headers: ['방법', '설명'],
          rows: [
            ['Hold-out', '훈련/검증/테스트로 한 번 쪼갬'],
            ['K-fold CV', 'K조각으로 K번 검증, 평균'],
            ['LOOCV', 'K=N — 한 개씩 뺀다'],
            ['부트스트랩', '복원추출로 여러 표본 생성'],
          ],
        },
      ],
    },
    // ─── 앙상블 4종 — 1 step → 5 substeps ───
    {
      id: 'adsp-3-4-s2',
      title: '앙상블 개요',
      quizId: 'adsp-3-4-cp-02',
      dialogue: [
        { pose: 'wave', text: '이번에는 [앙상블 4종] 을 배워보자!' },
        { pose: 'think', text: '4 종:\n· [V]oting · [B]agging\n· [B]oosting · [S]tacking' },
        { pose: 'lightbulb', text: '줄여서 [다병순메]!\n다수결 · 병렬 · 순차 · 메타.\n여러 모델을 합쳐 [더 강한 모델].' },
        { pose: 'happy', text: '비유: 조별 시험 답안 —\n친구들 답 모아 다수결 / 같은 문제집 N번 평균\n/ 틀린 문제 가중 / 친구 답 → 선생님 종합.' },
        { pose: 'idle', text: '다병순메 매칭 문제!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"다·병·순·메"',
          body:
            'Voting(다수결) · Bagging(병렬) · Boosting(순차) · Stacking(메타). 4종 분류 기준.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Bagging vs Boosting (시험 빈출)',
          body:
            'Bagging = 병렬 학습 + 평균 (분산 감소). Boosting = 순차 학습 + 오차 보완 (편향 감소).',
        },
      ],
    },
    {
      id: 'adsp-3-4-s2-voting',
      title: '앙상블 ① Voting',
      quizId: 'adsp-3-4-cp-02-voting',
      dialogue: [
        { pose: 'wave', text: '① [Voting] — 친구 5명 다수결!' },
        { pose: 'think', text: '[Voting] —\n서로 다른 모델이 각자 답하고\n[다수결 / 확률 평균].' },
        { pose: 'lightbulb', text: '왜? — 이질적 모델의 [장점 결합].\nhard voting (다수결)\n/ soft voting (확률 평균).' },
        { pose: 'happy', text: '비유: 친구 5명에게 같은 문제 풀게 함\n→ 3명 이상 같은 답이면 그 답 채택.\n실무: 로지스틱 + RF + XGB 다수결.' },
        { pose: 'idle', text: 'Voting 정의 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Voting 은 서로 다른 종류의 분류기·회귀기를 학습시킨 뒤 각자의 예측을 다수결(hard voting) 또는 확률 평균(soft voting) 으로 합치는 가장 단순한 앙상블입니다. 친구 여러 명에게 같은 문제를 보여주고 의견을 모은다고 생각하면 직관적이에요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '학생 합격 예측 — 점수 모델·면접 모델·자기소개서 모델의 합산 → 2개 이상 "합격" 이면 합격 확정 / 친구 5명에게 같은 시험 문제를 풀게 한 뒤 다수결 답 채택 / 영화 추천 — 협업필터링 + 콘텐츠기반 + 인기도 모델의 점수 평균. 모두 [성격이 다른 모델] 들이 한 사례에 대해 각자 답하고 모은 결과.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "이질적 모델 / 다수결 / 평균"',
          body:
            '"다수결", "예측 평균", "이질적 모델 결합" 이 키워드면 Voting. 같은 알고리즘으로 부트스트랩하면 Bagging, 순차 보완이면 Boosting, 메타 모델 한 층 더면 Stacking.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s2-bagging',
      title: '앙상블 ② Bagging',
      quizId: 'adsp-3-4-cp-02-bagging',
      dialogue: [
        { pose: 'wave', text: '② [Bagging] — 부트스트랩 + 병렬!' },
        { pose: 'think', text: '[Bootstrap Aggregating] —\n같은 알고리즘 N개 [병렬] 학습\n→ 평균.' },
        { pose: 'lightbulb', text: '왜? — N개 모델 평균으로 [분산 감소].\n부트스트랩 (복원 추출) 으로 데이터 다양화.\n대표: Random Forest.' },
        { pose: 'happy', text: '비유: 같은 문제집을 [10번 다른 순서]\n로 풀고 평균 점수.\n실무: Random Forest = Bagging + 변수 무작위.' },
        { pose: 'idle', text: 'Bagging 효과 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Bagging(Bootstrap Aggregating) 은 같은 알고리즘 N 개를 병렬로 학습하되, 각각에게 부트스트랩(복원 허용 무작위 추출) 으로 약간씩 다른 데이터셋을 줍니다. 결과적으로 N 개 모델의 예측을 평균(다수결) 해서 분산을 줄이고 과적합을 완화합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            'Random Forest — Bagging 으로 N개의 결정나무를 만들고 변수까지 무작위 선택해 다양화. 가장 자주 쓰이는 모델 중 하나 / 학생이 [같은 문제집을 10번 다른 순서] 로 풀고 평균 점수를 내면 한 번의 운·실수 영향이 줄어듦 / 친구 여러 명이 살짝 다른 자료 일부씩만 보고 답을 낸 뒤 평균 → 한 사람 의견의 변동 영향 줄임. "여러 사본을 만들어 평균을 내면 흔들림이 줄어든다" 가 Bagging 의 핵심 직관.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "병렬 / 부트스트랩 / 분산 감소"',
          body:
            '"병렬 학습", "부트스트랩 샘플링", "분산 감소" 가 키워드면 Bagging. 순차로 오차를 보완하면 Boosting, 이질적 모델의 다수결이면 Voting.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s2-boosting',
      title: '앙상블 ③ Boosting',
      quizId: 'adsp-3-4-cp-02-boosting',
      dialogue: [
        { pose: 'wave', text: '③ [Boosting] — 순차 + 오차 보완!' },
        { pose: 'think', text: '[Boosting] —\n약한 모델을 [순차] 학습 +\n[이전 오차] 가중치 ↑.' },
        { pose: 'lightbulb', text: '왜? — [편향 감소] 강함.\n대회 우승 단골 (XGBoost·LightGBM).\nBagging vs Boosting 시험 빈출.' },
        { pose: 'happy', text: '비유: 1차 모의고사에서\n[틀린 문제만] 다음 회차에 가중 학습 →\n약점 집중 보완. 실무: AdaBoost·XGBoost·LightGBM.' },
        { pose: 'idle', text: 'Boosting 핵심 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Boosting 은 약한 학습기(stump 같은 단순 모델) 를 순차로 학습시키며, 매 단계마다 이전 모델이 틀린 샘플에 더 큰 가중치를 두어 점진적으로 오차를 줄여나가는 앙상블입니다. 편향(bias) 을 줄이는 게 강점이라 단일 약한 모델로는 못 풀던 문제도 잘 풀어요.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '학생 시험 대비 — 1차 모의고사에서 자주 틀린 문제를 다음 모의고사 학습에 더 비중. 약점 단원만 집중 → 다음 회차 점수 ↑. 또 틀리면 또 가중. 점진적 완성 / AdaBoost — 첫 분류기가 틀린 데이터에 가중치 ↑ → 다음 분류기가 그 부분 집중 학습 / Gradient Boosting / XGBoost / LightGBM — 데이터 분석 대회 우승자가 가장 많이 쓰는 모델군. 모두 "지난 번 실수를 다음 번에 보완" 의 순차적 학습.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — Bagging vs Boosting',
          body:
            '시험 빈출. Bagging = 병렬 + 분산 감소 (랜덤 포레스트). Boosting = 순차 + 편향 감소 (XGBoost·LightGBM). 둘을 섞어 묻는 게 단골.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s2-stacking',
      title: '앙상블 ④ Stacking',
      quizId: 'adsp-3-4-cp-02-stacking',
      dialogue: [
        { pose: 'wave', text: '④ [Stacking] — 베이스 → 메타 모델!' },
        { pose: 'think', text: '[Stacking] —\n베이스 모델들의 [예측 자체]\n를 새 모델의 입력으로.' },
        { pose: 'lightbulb', text: '왜? — "어떤 모델 의견 얼마나 믿을지"\n까지 학습. 단순 Voting 보다 강함.\n대회 상위권 단골 패턴.' },
        { pose: 'happy', text: '비유: 친구 4명 답 받아서\n[선생님이 종합 판단] (1차→2차 평가).\n실무: RF + XGB + LR → 메타 LR.' },
        { pose: 'idle', text: 'Stacking 작동 방식 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'Stacking 은 여러 베이스 모델(랜덤포레스트·XGBoost·로지스틱 등) 의 예측 결과를 모아 새로운 학습 데이터셋으로 만든 뒤, 그 위에 메타(블렌더) 모델 하나를 더 학습시키는 앙상블입니다. "예측의 예측" 이라는 한 층을 더 쌓는 것 — 다양한 모델의 강점을 한 번 더 결합합니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '학생 평가 — 1차 평가에서 친구 4명 (수학·국어·영어·과학 담당) 이 각자 의견을 내고, 2차 평가에서 [선생님이 4명의 답을 종합] 해 최종 평가 / 데이터 분석 대회 솔루션 — 1층에서 RF·XGB·LR·LightGBM 4모델을 학습 → 2층에서 이 4 예측을 입력으로 받는 로지스틱 회귀가 최종 예측 / 합격 예측 — 시험 모델 + 면접 모델 + 자기소개서 모델의 점수를 메타 모델이 종합. 단순한 Voting 보다 "어떤 모델 의견을 얼마나 믿을지" 까지 학습한다는 게 핵심.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "예측을 입력으로 / 메타 모델"',
          body:
            '"예측을 다시 입력", "메타(블렌더) 모델", "층 쌓기" 가 키워드면 Stacking. 단순 다수결은 Voting, 부트스트랩 평균은 Bagging, 순차 오차 보완은 Boosting.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s2-review',
      title: '앙상블 복습',
      quizId: 'adsp-3-4-cp-02',
      group: 'adsp-3-4-s2',
      dialogue: [
        { pose: 'wave', text: '[앙상블] 복습 시간이야!' },
        { pose: 'think', text: '방금 배운 핵심을\n다시 한 번 정리해보자.' },
        { pose: 'lightbulb', text: '시험 함정도 같이 떠올려봐 —\n자주 헷갈리는 포인트가 있을 거야.' },
        { pose: 'happy', text: '비유로 다시 떠올리면\n오래 기억에 남아!' },
        { pose: 'idle', text: '잘 정리됐어! 다음 스텝으로!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '복습 체크리스트',
          body:
            '바로 직전 스텝들에서 배운 개념·암기법·함정을 한 번 더 떠올리며 다음 그룹으로 넘어가요. 잘 안 떠오르는 항목이 있으면 이전 스텝으로 돌아가 확인하세요.',
        },
      ],
    },
    // ─── 연관분석 3 (지신향) — 1 step → 4 substeps ───
    {
      id: 'adsp-3-4-s3',
      title: '연관분석 개요',
      quizId: 'adsp-3-4-cp-03',
      dialogue: [
        { pose: 'wave', text: '이번에는 [연관분석 3지표] 를 배워보자!' },
        { pose: 'think', text: '3 지표:\n· [지]지도 · [신]뢰도 · [향]상도' },
        { pose: 'lightbulb', text: '줄여서 [지신향]!\n알고리즘: Apriori (후보-검증 반복)\n· FP-Growth (FP-Tree 빠른 탐색).' },
        { pose: 'happy', text: '비유: 학교 매점 — "빵 산 학생이 우유도?"\n장바구니 규칙. 슈퍼 "맥주+기저귀" 와 동일!' },
        { pose: 'idle', text: '지신향 매칭 문제!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"지·신·향"',
          body:
            'Support(지지도) · Confidence(신뢰도) · Lift(향상도). 향상도 > 1 양의 연관, = 1 독립, < 1 음의 연관.',
        },
        {
          kind: 'keypoints',
          title: '알고리즘',
          items: [
            'Apriori: 빈발 항목집합 후보 생성-검증 반복',
            'FP-Growth: FP-Tree 로 탐색 속도 개선',
          ],
        },
      ],
    },
    {
      id: 'adsp-3-4-s3-support',
      title: '연관분석 ① 지지도',
      quizId: 'adsp-3-4-cp-03-support',
      dialogue: [
        { pose: 'wave', text: '① [지]지도 — 전체에서 얼마나 자주?' },
        { pose: 'think', text: '[Support] —\n[전체 거래 중] A 와 B 가\n[같이 등장] 하는 비율.' },
        { pose: 'lightbulb', text: '왜? — "이 규칙이 [얼마나 자주]\n나타나는가" 첫 필터.\n너무 낮으면 우연 가능성 ↑.' },
        { pose: 'happy', text: '비유: 학교 매점 100 거래 중\n[빵+우유] 12 거래 → Support = 12%.\n슈퍼 [맥주+기저귀] 동일 패턴.' },
        { pose: 'idle', text: '지지도 정의 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '지지도(Support) = "A·B 가 함께 등장한 거래 수 ÷ 전체 거래 수" 입니다. 발견한 규칙이 얼마나 자주 일어나는지를 측정해요. 지지도가 너무 낮으면 어쩌다 한두 번 일어나는 우연일 가능성이 커서, 마이닝 시작 전에 최소 지지도(min support) 기준을 정해 그 이상만 본격 분석합니다.',
        },
        {
          kind: 'section',
          title: '예시로 — 슈퍼마켓 100 거래',
          body:
            '전체 100 거래 중 [맥주+기저귀] 가 함께 나온 거래가 12건이라면 Support({맥주, 기저귀}) = 12 / 100 = 12%. 만약 그 조합이 단 1건이라면 Support = 1% — 우연의 가능성이 높아 분석 가치 낮음. 지지도는 "이 규칙이 사업적으로 의미 있을 만큼 빈번한가" 를 거르는 첫 필터 역할.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "동시 등장 빈도 / 전체 대비"',
          body:
            '"동시 등장 비율", "전체 대비 빈도" 가 키워드면 Support. "A 산 사람 중 B 비율" 은 Confidence, "랜덤 대비 배수" 는 Lift.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s3-confidence',
      title: '연관분석 ② 신뢰도',
      quizId: 'adsp-3-4-cp-03-confidence',
      dialogue: [
        { pose: 'wave', text: '② [신]뢰도 — A 산 사람 중 B 도 산 비율!' },
        { pose: 'think', text: '[Confidence] —\nP(B|A) = "A 를 골랐을 때\nB 도 따라올 [조건부 확률]".' },
        { pose: 'lightbulb', text: '왜? — 추천·번들링·진열 결정에 직결.\n주의: Confidence 만 보면 함정 (Lift 와 함께).' },
        { pose: 'happy', text: '비유: 매점에서 [빵 산 학생 50명] 중\n30명이 우유도 샀다 → Confidence = 60%.\n슈퍼: 맥주 산 50명 중 30명이 기저귀.' },
        { pose: 'idle', text: '신뢰도 정의 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '신뢰도(Confidence) = P(B|A) = "A·B 가 함께 등장한 거래 수 ÷ A 가 등장한 거래 수". A 라는 행동이 일어났을 때 B 가 따라올 조건부 확률입니다. "맥주를 산 사람들 중 60%가 기저귀도 샀다" 같이 추천·번들링·진열 결정에 직접 쓰입니다.',
        },
        {
          kind: 'section',
          title: '예시로 — 맥주 → 기저귀',
          body:
            '맥주가 등장한 거래 50건, 그 중 [맥주+기저귀] 가 함께 등장한 게 30건이라면 Confidence(맥주 → 기저귀) = 30 / 50 = 60% / 모바일 앱에서 "결제 페이지 진입한 사용자" 중 90%가 "결제 완료" 까지 갔다면 Confidence = 90%. 마트에선 맥주 옆에 기저귀를 진열, 앱에선 결제 단계 이탈 줄이는 캠페인 설계에 직결.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '함정 — Confidence 가 높아도 [Lift 가 낮으면] 의미 약함',
          body:
            '"맥주 → 우유 Confidence 80%" 라도 우유 자체가 거래 90%에 등장하는 흔한 상품이면, 맥주 안 사도 우유 살 사람들이 대부분이라 인과/연관이 약함. 다음 지표인 Lift 가 이걸 보정합니다.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s3-lift',
      title: '연관분석 ③ 향상도',
      quizId: 'adsp-3-4-cp-03-lift',
      dialogue: [
        { pose: 'wave', text: '③ [향]상도 — 랜덤 대비 몇 배?' },
        { pose: 'think', text: '[Lift] = Confidence(A→B) ÷ P(B)\n= "A 모를 때 B 비율" 대비\n"A 알 때 B 비율".' },
        { pose: 'lightbulb', text: '왜? — Confidence 의 [함정 보정].\nLift > 1 양의 연관 / = 1 독립\n/ < 1 음의 연관.' },
        { pose: 'happy', text: '비유: 빵 안 산 학생의 우유 구매율 대비\n[빵 산 학생의 우유 구매율 1.8배] →\n진짜 묶어 진열할 가치 있음!' },
        { pose: 'idle', text: '향상도 해석 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '향상도(Lift) = 신뢰도 ÷ 전체에서 B 의 등장 비율 = P(B|A) ÷ P(B). 이는 "A 를 봤을 때 B 가 등장할 확률" 이 "A 와 무관하게 B 가 등장할 확률" 의 몇 배인지를 측정합니다. 연관성의 진짜 강도를 측정하는 핵심 지표 — Confidence 의 함정을 보정해줘요.',
        },
        {
          kind: 'section',
          title: '예시로 — Lift 해석',
          body:
            'Lift = 1.8 → A 를 산 사람의 B 구매 확률이 일반 평균의 1.8배 (양의 연관, 의미 있음) / Lift = 1.0 → A 와 B 는 독립 (Confidence 가 높아도 의미 없음) / Lift = 0.6 → A 를 산 사람일수록 오히려 B 를 덜 산다 (음의 연관, 같은 종류 상품 대체 관계). 마트에서 [맥주, 기저귀] 가 Lift 2.0 이라면 진짜 묶어 진열할 가치가 있음.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — 세 지표 한 번에',
          body:
            '[지]지도 — 전체 대비 빈도 / [신]뢰도 — A 안에서 B 비율 / [향]상도 — 랜덤 대비 배수. 시험에선 보통 세 값 계산 후 Lift > 1 인지로 의미 있는 규칙 판별.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s3-review',
      title: '연관분석 복습',
      quizId: 'adsp-3-4-cp-03',
      group: 'adsp-3-4-s3',
      dialogue: [
        { pose: 'wave', text: '[연관분석] 복습 시간이야!' },
        { pose: 'think', text: '방금 배운 핵심을\n다시 한 번 정리해보자.' },
        { pose: 'lightbulb', text: '시험 함정도 같이 떠올려봐 —\n자주 헷갈리는 포인트가 있을 거야.' },
        { pose: 'happy', text: '비유로 다시 떠올리면\n오래 기억에 남아!' },
        { pose: 'idle', text: '잘 정리됐어! 다음 스텝으로!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '복습 체크리스트',
          body:
            '바로 직전 스텝들에서 배운 개념·암기법·함정을 한 번 더 떠올리며 다음 그룹으로 넘어가요. 잘 안 떠오르는 항목이 있으면 이전 스텝으로 돌아가 확인하세요.',
        },
      ],
    },
    // ─── 군집 알고리즘 — 1 step → 5 substeps (overview + 4 method) ───
    {
      id: 'adsp-3-4-s4',
      title: '군집 개요',
      quizId: 'adsp-3-4-cp-04',
      dialogue: [
        { pose: 'wave', text: '이번에는 [군집 4종] 을 배워보자!' },
        { pose: 'think', text: '4 알고리즘:\n· [계]층적 · [K-means]\n· [DBSCAN] · [EM·SOM]' },
        { pose: 'lightbulb', text: '줄여서 [계중밀확]!\n계층·중심·밀도·확률 4 분류 기준.\n레이블 없이 [유사한 것끼리] 묶기.' },
        { pose: 'happy', text: '비유: 학급 친구 그룹 —\n조직도 / "3개 그룹 만들어줘" / 친구 밀도\n/ 확률·격자 배치.' },
        { pose: 'idle', text: '계중밀확 매칭 문제!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '"계·중·밀·확"',
          body:
            '계층적(Hierarchical) · K-means(중심) · DBSCAN(밀도) · EM·SOM(확률). 군집 4 알고리즘 분류 기준.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'K-means 최적 K',
          body:
            'Elbow(팔꿈치) 법 — WCSS 를 K 에 따라 그려 꺾이는 지점. 실루엣 계수 — 1 에 가까울수록 잘 분리.',
        },
        {
          kind: 'table',
          headers: ['방법', '특징'],
          rows: [
            ['계층적', '덴드로그램 합병/분할'],
            ['K-means', '중심 K개 반복 재배정'],
            ['DBSCAN', '밀도 기반, K 불필요, 이상치 강함'],
            ['EM/SOM', '확률·격자 기반'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-4-s4-hier',
      title: '군집 ① 계층적 (Hierarchical)',
      quizId: 'adsp-3-4-cp-04-hier',
      dialogue: [
        { pose: 'wave', text: '① [계층적] — 조직도 비유!' },
        { pose: 'think', text: '[Hierarchical] —\n[합병형 (Bottom-up)] /\n[분할형 (Top-down)] 트리.' },
        { pose: 'lightbulb', text: '왜? — K 사전 결정 [불필요].\n덴드로그램 (트리) 으로\n원하는 깊이에서 자르기 가능.' },
        { pose: 'happy', text: '비유: 학교 [조직도] —\n가까운 친구 → 같은 반 → 같은 학년 → 학교.\n덴드로그램이 그 트리야.' },
        { pose: 'idle', text: '계층적 군집 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '계층적 군집은 데이터를 점점 합치거나(합병형, agglomerative) 큰 덩어리에서 쪼개며(분할형, divisive) 트리(덴드로그램) 를 형성. K 를 미리 정할 필요 없습니다. 학교 조직도처럼 "친한 친구 → 같은 반 → 같은 학년 → 학교" 로 점점 묶이는 구조와 동일합니다.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"덴드로그램", "합병형/분할형", "K 불필요". 중심점 K개 반복이면 K-means, 밀도 기반이면 DBSCAN, 확률 할당이면 EM.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "트리 / 깊이 자르기"',
          body:
            '"덴드로그램 트리", "합병/분할", "K 사전 지정 불필요" 가 키워드면 계층적. K 미리 결정이면 K-means.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s4-kmeans',
      title: '군집 ② K-means',
      quizId: 'adsp-3-4-cp-04-kmeans',
      dialogue: [
        { pose: 'wave', text: '② [K-means] — "그룹 K개 만들어줘"!' },
        { pose: 'think', text: '[K-means] —\nK 개 [중심점 ↔ 거리] 반복 재배정.\nK 미리 결정.' },
        { pose: 'lightbulb', text: '왜? — 빠르고 단순.\n구형 클러스터 강함.\nK 선택: Elbow법·실루엣 계수.' },
        { pose: 'happy', text: '비유: 친구 그룹 [3개] 만들어줘\n→ 중심 학생 3명 정해서 가까운 사람끼리.\n실무: 고객 세분화·이미지 압축.' },
        { pose: 'idle', text: 'K-means 핵심 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'K-means 는 K 개의 중심점을 두고 각 점을 가장 가까운 중심에 할당 → 중심 갱신 → 반복. K 를 미리 정해야 하고, 구형 클러스터에 강함. "친구 그룹 3개 만들어줘" 처럼 K 가 비즈니스 요구로 정해질 때 직관적입니다.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"K 사전 지정", "중심점 반복", "유클리드 거리". 트리 구조면 계층적, 밀도면 DBSCAN, 확률이면 EM.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "K 미리 / 중심점 반복"',
          body:
            '"K 사전 결정", "중심점 ↔ 거리 반복" 이 키워드면 K-means. K 불필요면 계층적·DBSCAN.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s4-dbscan',
      title: '군집 ③ DBSCAN',
      quizId: 'adsp-3-4-cp-04-dbscan',
      dialogue: [
        { pose: 'wave', text: '③ [DBSCAN] — 친구 밀도 기준!' },
        { pose: 'think', text: '[Density-Based] —\nε 반경 안 점 ≥ minPts 면 [핵심점].\nK 불필요.' },
        { pose: 'lightbulb', text: '왜? — 비구형 클러스터 + 이상치 강건.\n외딴 점 = noise (이상값) 자동 분류.' },
        { pose: 'happy', text: '비유: 학급 친구 밀도 —\n친구 모인 그룹 + 외딴 학생은 noise.\n실무: 위치 기반·이상 거래 탐지.' },
        { pose: 'idle', text: 'DBSCAN 강점 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'DBSCAN(Density-Based) 은 밀도가 충분한 영역을 클러스터로, 외곽은 noise(이상값) 로 분류. K 사전 지정 불필요 + 비구형 클러스터 + 이상치 강건. 학급에서 친구가 모여 앉은 자리는 군집, 외딴 학생은 noise 로 자동 분류되는 구조와 동일합니다.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"밀도 기반", "ε 반경 + minPts", "K 불필요", "noise 자동 식별", "비구형 OK". K 미리 지정이면 K-means, 트리면 계층적.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "밀도 / noise 분류"',
          body:
            '"밀도 기반", "ε + minPts", "noise 자동 분리" 가 키워드면 DBSCAN. K 미리면 K-means, 트리면 계층적.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s4-em-som',
      title: '군집 ④ EM · SOM',
      quizId: 'adsp-3-4-cp-04-em-som',
      dialogue: [
        { pose: 'wave', text: '④ [EM·SOM] — 확률·격자 기반!' },
        { pose: 'think', text: '[EM] = 가우시안 혼합 [확률] 할당.\n[SOM] = 신경망 [2D 격자] 투영.' },
        { pose: 'lightbulb', text: '왜? — 단순 거리 기반 한계 보완.\nEM: "이 점 A그룹 70%, B그룹 30%" 확률\nSOM: 고차원 → 2D 시각화.' },
        { pose: 'happy', text: '비유: EM = 학생을 [확률] 로 그룹 배정\n(A 70% / B 30%).\nSOM = [격자] 좌석 배치.' },
        { pose: 'idle', text: 'EM·SOM 정의 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            'EM(Expectation-Maximization) 은 가우시안 혼합 모델로 각 점이 클러스터에 속할 확률을 학습합니다 — "이 학생은 A 그룹 70%, B 그룹 30%" 처럼 부드러운 할당. SOM(Self-Organizing Map) 은 신경망 기반 2D 격자 투영으로 고차원 데이터를 격자 좌표로 시각화합니다.',
        },
        {
          kind: 'section',
          title: '시험 키워드',
          body:
            '"EM = 확률 할당, 가우시안 혼합", "SOM = 신경망 격자 2D 투영". 단순 거리·중심점이면 K-means, 트리면 계층적, 밀도면 DBSCAN.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "확률 / 격자 / 신경망"',
          body:
            '"확률 할당·가우시안 혼합" 이면 EM. "신경망 격자·2D 투영" 이면 SOM. 거리·중심점이면 K-means, 밀도면 DBSCAN.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s4-review',
      title: '군집 복습',
      quizId: 'adsp-3-4-cp-04',
      group: 'adsp-3-4-s4',
      dialogue: [
        { pose: 'wave', text: '[군집] 복습 시간이야!' },
        { pose: 'think', text: '방금 배운 핵심을\n다시 한 번 정리해보자.' },
        { pose: 'lightbulb', text: '시험 함정도 같이 떠올려봐 —\n자주 헷갈리는 포인트가 있을 거야.' },
        { pose: 'happy', text: '비유로 다시 떠올리면\n오래 기억에 남아!' },
        { pose: 'idle', text: '잘 정리됐어! 다음 스텝으로!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '복습 체크리스트',
          body:
            '바로 직전 스텝들에서 배운 개념·암기법·함정을 한 번 더 떠올리며 다음 그룹으로 넘어가요. 잘 안 떠오르는 항목이 있으면 이전 스텝으로 돌아가 확인하세요.',
        },
      ],
    },
    // ─── 분류 평가지표 — 1 step → 5 substeps ───
    {
      id: 'adsp-3-4-s5',
      title: '평가지표 ① 오분류표 개요',
      quizId: 'adsp-3-4-cp-05',
      dialogue: [
        { pose: 'wave', text: '이번에는 [분류 평가지표] 를 배워보자!' },
        { pose: 'think', text: '[오분류표] (Confusion Matrix) —\nTP / FP / FN / TN 의 2×2 표.' },
        { pose: 'lightbulb', text: '왜? — 모든 지표 (정확도·정밀도·재현율·F1·ROC)\n가 이 4 칸에서 파생.\n실제 vs 예측 분류 결과.' },
        { pose: 'happy', text: '비유: 시험 채점 표 —\n맞게 양성·놓침·오경보·정상기각.\n어떤 시나리오에 어떤 지표 쓸지가 핵심.' },
        { pose: 'idle', text: '오분류표 정의 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '오분류표(Confusion Matrix) — 행=실제, 열=예측의 2×2 표. TP(맞게 양성), FP(거짓 양성), FN(놓친 양성), TN(맞게 음성). 정확도·정밀도·재현율·F1·ROC 모두 이 4 칸에서 계산.',
        },
        {
          kind: 'table',
          title: '오분류표',
          headers: ['', '예측 양성', '예측 음성'],
          rows: [
            ['실제 양성', 'TP (적중)', 'FN (놓침)'],
            ['실제 음성', 'FP (오경보)', 'TN (정상기각)'],
          ],
        },
      ],
    },
    {
      id: 'adsp-3-4-s5-acc',
      title: '평가지표 ② 정확도 (Accuracy)',
      quizId: 'adsp-3-4-cp-05-acc',
      dialogue: [
        { pose: 'wave', text: '② [정확도] — 전체 중 맞춘 비율!' },
        { pose: 'think', text: '[Accuracy] —\n(TP + TN) ÷ 전체.\n가장 직관적 지표.' },
        { pose: 'lightbulb', text: '왜 함정? — 클래스 [불균형] 시 무력.\n100명 중 1명만 합격인데 [전부 불합격]\n예측해도 정확도 99%.' },
        { pose: 'happy', text: '비유: 시험 100문제 중 95개 맞으면 95%.\n근데 양성 1: 음성 99 비율이면\n"모두 음성" 이라 외쳐도 99% — 함정!' },
        { pose: 'idle', text: '정확도 부적절 케이스 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정확도(Accuracy) = (TP + TN) ÷ 전체. 시험에서 100문제 중 95개 맞히면 95% 라고 하는 것과 똑같습니다. 가장 직관적이고 입에 붙는 지표지만, 클래스 불균형(양성과 음성 비율이 크게 차이남) 상황에서는 무력해진다는 결정적 약점이 있어요.',
        },
        {
          kind: 'section',
          title: '함정 — 불균형에서의 정확도 거짓말',
          body:
            '학생 합격 예측을 예로 들면 100명 중 진짜 합격은 1명뿐이고 99명은 불합격입니다. 모델이 게으르게 "모두 불합격" 이라고만 답해도 99명을 맞히니 정확도는 무려 99%. 하지만 정작 1명의 합격자는 놓쳤습니다 — 가장 중요한 일을 놓친 모델이에요. 희귀 시험 합격·드문 사고 예측처럼 양성이 드문 문제에서 정확도만 보는 건 위험.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — 클래스가 균형 잡혔을 때만 신뢰',
          body:
            '양성:음성 비율이 50:50 ~ 30:70 정도면 정확도가 의미 있습니다. 1:99 처럼 한쪽이 압도적이면 정밀도·재현율·F1 으로 보조해야 함.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s5-prec',
      title: '평가지표 ③ 정밀도 (Precision)',
      quizId: 'adsp-3-4-cp-05-prec',
      dialogue: [
        { pose: 'wave', text: '③ [정밀도] — 양성이라 외친 것 중 진짜!' },
        { pose: 'think', text: '[Precision] = TP ÷ (TP + FP).\n"모델이 양성이라고 예측한 것 중\n진짜 양성 비율".' },
        { pose: 'lightbulb', text: '왜? — "양성!" 이라고 외쳤는데\n[헛소리] 면 비용 큰 경우에 우선.\n잘못 외치면 신뢰 ↓.' },
        { pose: 'happy', text: '비유: "이 학생 합격" 이라고 외쳤는데\n실제로 불합격이면 신뢰 추락.\n실무: 추천·검색·광고 타겟팅.' },
        { pose: 'idle', text: '정밀도 우선 케이스 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '정밀도(Precision) = TP ÷ (TP + FP). 풀어쓰면 "모델이 양성이라고 외친 횟수 중 진짜 양성이었던 비율". 거짓 양성(FP, 양성이 아닌데 양성이라 외침) 의 비용이 클 때 중요한 지표입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '학생 합격 예측: "합격" 이라고 골랐는데 실제로 불합격이면 학생·학부모 신뢰 추락 → 정밀도 우선 / 학교 우수 동아리 선발: "이 학생 적합" 이라 외쳤는데 실제로 안 맞으면 동아리 분위기 파괴 → 정밀도 우선 / 쇼핑몰 추천 시스템: 추천했는데 안 사면 사용자 이탈 → 정밀도 우선 / 검색 엔진 상위 결과: 무관한 결과 섞이면 사용자 이탈 → 정밀도 우선. 모두 "양성이라 외쳤다 = 행동을 한다" 는 시나리오라 헛 외침이 곧 손실.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "잘못 외치면 신뢰·비용 ↓"',
          body:
            '"양성이라 분류하면 곧장 행동(추천/광고/검사) 이 일어나는데, 그 행동이 잘못되면 손해" 인 경우 정밀도. 반대로 "놓치면 큰일" 이면 재현율.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s5-recall',
      title: '평가지표 ④ 재현율 (Recall)',
      quizId: 'adsp-3-4-cp-05-recall',
      dialogue: [
        { pose: 'wave', text: '④ [재현율] — 실제 양성 중 잡은 비율!' },
        { pose: 'think', text: '[Recall] = TP ÷ (TP + FN).\n"실제 양성 중 모델이 잡아낸 비율".\n다른 이름 [민감도].' },
        { pose: 'lightbulb', text: '왜? — [놓치면 치명적] 인 경우 우선.\n학생 합격·시험 부정·건강 검진처럼\n한 명 놓침이 큰 후속 손실.' },
        { pose: 'happy', text: '비유: 입시에서 [실제 합격생] 100명 중\n90명을 불합격으로 오판하면 진학 기회 박탈.\n실무: 암 진단·사기 탐지.' },
        { pose: 'idle', text: '재현율 우선 케이스 문제!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '재현율(Recall, 민감도 Sensitivity) = TP ÷ (TP + FN). 풀어쓰면 "진짜 양성이 100명이었다면 그 중 모델이 몇 명을 잡아냈는가". 놓침(FN, 양성을 음성으로 오판) 의 비용이 클 때 중요한 지표입니다.',
        },
        {
          kind: 'section',
          title: '구체 사례로 감잡기',
          body:
            '대학 입시 예측: 실제 합격생 100명 중 90명을 불합격으로 오판하면 그 90명이 진학 기회를 놓침 → 재현율 우선 / 시험 부정 탐지: 부정 100건 중 30건만 잡고 70건을 놓치면 시험 신뢰성 붕괴 → 재현율 우선 / 학교 건강 검진: 진짜 환자를 정상으로 보내면 치료 시기 놓침 → 재현율 우선 / 코로나 진단키트: 양성 환자를 음성으로 보내면 추가 전파 → 재현율 우선. 공통점은 "한 번 놓친 양성이 큰 후속 손실".',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '식별 팁 — "놓치면 끝장"',
          body:
            '"양성을 놓치면 인명·금전·안전 피해가 직접" 이면 재현율. "양성으로 외쳐서 행동했는데 그게 헛것이었을 때 손해" 면 정밀도. 둘 다 중요하면 F1.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s5-f1',
      title: '평가지표 ⑤ F1 · ROC · Lift',
      quizId: 'adsp-3-4-cp-05-f1',
      dialogue: [
        { pose: 'wave', text: '⑤ [F1·ROC·Lift] — 시나리오별 선택!' },
        { pose: 'think', text: '[F1] = 정밀도·재현율 조화평균.\n[ROC] = TPR vs FPR 곡선.\n[Lift] = 상위 X% 타겟팅.' },
        { pose: 'lightbulb', text: '왜? — 균형은 F1 / 임계값 비교는 ROC·AUC\n/ 상위 X% 행동 (장학생 선발·우수반) 은 Lift.\n시나리오별 골라 쓰기.' },
        { pose: 'happy', text: '비유: 학생 평가 종합 —\nF1 (균형) / ROC-AUC (임계값 비교)\n/ Lift (상위 10% 우수 학생 선별).' },
        { pose: 'idle', text: '시나리오별 지표 문제!' },
      ],
      blocks: [
        {
          kind: 'keypoints',
          title: '복합 지표',
          items: [
            'F1 = 2·(P·R) / (P+R) — 정밀도·재현율의 조화평균. 균형 필요할 때.',
            'ROC: TPR(=Recall) vs FPR 곡선. 임계값 변화 따라 그림.',
            'AUC: ROC 곡선 아래 면적. 1=완벽 / 0.5=무작위 / <0.5=뒤집힘.',
            'Lift: 모델이 잡은 양성률 ÷ 무작위 양성률. 1보다 크면 효과 있음.',
            'Gain: 상위 X% 선별 시 실제 양성의 몇 % 잡았는지 누적 곡선.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '시나리오별 선택',
          body:
            '균형: F1. 임계값 비교: ROC/AUC. 상위 X% 행동(마케팅·우량 고객 선별): Lift / Gain.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s5-review',
      title: '평가지표 ① 오분류표 복습',
      quizId: 'adsp-3-4-cp-05',
      group: 'adsp-3-4-s5',
      dialogue: [
        { pose: 'wave', text: '[평가지표 ① 오분류표] 복습 시간이야!' },
        { pose: 'think', text: '방금 배운 핵심을\n다시 한 번 정리해보자.' },
        { pose: 'lightbulb', text: '시험 함정도 같이 떠올려봐 —\n자주 헷갈리는 포인트가 있을 거야.' },
        { pose: 'happy', text: '비유로 다시 떠올리면\n오래 기억에 남아!' },
        { pose: 'idle', text: '잘 정리됐어! 다음 스텝으로!' },
      ],
      blocks: [
        {
          kind: 'callout',
          tone: 'tip',
          title: '복습 체크리스트',
          body:
            '바로 직전 스텝들에서 배운 개념·암기법·함정을 한 번 더 떠올리며 다음 그룹으로 넘어가요. 잘 안 떠오르는 항목이 있으면 이전 스텝으로 돌아가 확인하세요.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s6',
      title: '로지스틱 회귀',
      quizId: 'adsp-3-4-cp-06',
      dialogue: [
        { pose: 'wave', text: '[로지스틱 회귀] — "당뇨냐 아니냐" 처럼 [분류] 문제에 쓰는 회귀!' },
        { pose: 'think', text: '선형회귀는 음수·2도 나올 수 있어 부적합 → [시그모이드] 로 0~1 사이 확률로!' },
        { pose: 'lightbulb', text: '[odds] = p/(1−p) · [logit] = ln(odds) 로 선형 모델링. [Odds Ratio] > 1 → 양의 영향!' },
        { pose: 'happy', text: '다중 분류로 확장 = [소프트맥스 회귀]. 평가는 [ROC/AUC] · 검정은 [Wald]!' },
        { pose: 'idle', text: '회귀 이름이지만 실은 [분류기]. 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"이 환자가 당뇨냐 아니냐" 처럼 **분류** 가 필요한데, 일반 선형회귀는 예측값이 음수나 2 가 나올 수 있어 부적합합니다. 로지스틱 회귀는 출력을 0~1 사이 확률로 바꿔주는 똑똑한 회귀입니다.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '핵심 공식 — 시그모이드',
          body:
            'P(y=1 | x) = 1 / (1 + e^−(β₀ + β₁x)). S 자형 곡선으로 확률을 반환 → 보통 0.5 를 기준으로 0 / 1 을 판정. 다중 분류로 확장하면 소프트맥스 회귀입니다.',
        },
        {
          kind: 'keypoints',
          title: '해석의 언어 — odds 와 log-odds',
          items: [
            'odds = p / (1 − p) — 일어날 확률 대 일어나지 않을 확률',
            'log-odds(logit) = ln(odds) — 선형결합으로 모델링',
            '계수 지수화 → exp(β) = "X 1단위 증가 시 odds 몇 배"',
            'Odds Ratio > 1: 양의 영향 · < 1: 음의 영향',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '평가·검정 지표',
          body:
            '회귀처럼 R² 를 쓰지 않고 분류 지표(정확도·정밀도·재현율·ROC/AUC) 를 사용합니다. 계수 검정은 Wald 검정, 모델 비교는 이탈도(Deviance) 또는 AIC.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s7',
      title: '의사결정나무',
      quizId: 'adsp-3-4-cp-07',
      dialogue: [
        { pose: 'wave', text: '[의사결정나무] — 뿌리에서 "나이 > 30?" 같은 [질문을 타고] 잎까지 내려가!' },
        { pose: 'think', text: '분리 기준 4가지: [정보이득] (ID3) · [이득비] (C4.5) · [지니] (CART) · [카이제곱] (CHAID).' },
        { pose: 'lightbulb', text: '최대 장점은 [해석이 쉽다]! 규칙이 그대로 보여서 "왜 그렇게 예측했나" 설명 가능.' },
        { pose: 'happy', text: '약점은 [과적합] — [가지치기] (사전/사후) 로 해결. 앙상블로도 보완!' },
        { pose: 'idle', text: '알고리즘별 분리 기준 매칭, 확실히! 문제로!' },
      ],
      blocks: [
        {
          kind: 'section',
          title: '"질문을 타고 내려가는" 분류',
          body:
            '뿌리 노드에서 "나이 > 30?" 같은 질문으로 데이터를 둘(또는 여러 개) 로 나누고, 가지마다 또 질문을 던집니다. 잎(leaf) 에 도달하면 그게 최종 예측. 규칙이 그대로 보여서 해석이 뛰어난 것이 최대 장점.',
        },
        {
          kind: 'table',
          title: '분리 기준(불순도) 과 대표 알고리즘',
          headers: ['분리 기준', '의미', '대표 알고리즘'],
          rows: [
            ['정보이득 (엔트로피 감소)', '불확실성이 얼마나 줄었나', 'ID3'],
            ['이득비 (Gain Ratio)', '정보이득을 분기 수로 보정', 'C4.5 · C5.0'],
            ['지니계수 (Gini)', '범주 불순도', 'CART'],
            ['카이제곱 통계량', '독립성 검정 기반', 'CHAID'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '과적합과 가지치기(Pruning)',
          body:
            '나무가 깊어지면 훈련 데이터에 과하게 맞춰져 새 데이터에 흔들립니다. 사전 가지치기(최대 깊이·최소 샘플 수 제한) 또는 사후 가지치기(일단 크게 키운 뒤 불필요한 가지 제거) 로 해결합니다.',
        },
        {
          kind: 'keypoints',
          title: '장단점',
          items: [
            '장점: 해석 쉬움 · 비선형 관계 포착 · 범주·수치 변수 모두 처리',
            '단점: 과적합 위험 · 데이터 작은 변화에도 구조 크게 달라짐',
            '대응: 앙상블(랜덤 포레스트·부스팅) 로 약점 보완',
          ],
        },
      ],
    },
    {
      id: 'adsp-3-4-s8',
      title: 'K-최근접이웃 (K-NN)',
      quizId: 'adsp-3-4-cp-08',
      dialogue: [
        { pose: 'wave', text: '[K-NN] — "비슷한 애들 [K 명] 보고 다수결로 따라 한다!"' },
        { pose: 'think', text: '학습은 데이터 [저장만] — 예측할 때 모든 점과 거리 계산. [게으른 학습기]!' },
        { pose: 'lightbulb', text: 'K 작으면 [과적합] · K 크면 [과소적합]. [홀수 K] 로 동률 회피!' },
        { pose: 'happy', text: '거리 측도: [유클리드] · [맨해튼] · [민코프스키] · [마할라노비스] (상관 반영).' },
        { pose: 'idle', text: '스케일 다르면 [표준화] 필수 (키 170 vs 체중 65)! 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"비슷한 애들이 뭐였는지 보고 따라 한다." 새 데이터가 들어오면 가장 가까운 K개 이웃의 다수결로 범주를 정합니다. 학습 단계는 데이터를 "저장만" 할 뿐이라서 **게으른 학습기(lazy learner)** 로 불립니다.',
        },
        {
          kind: 'keypoints',
          title: '핵심 포인트',
          items: [
            'K 가 작을수록 경계가 들쭉날쭉 → 과적합 위험',
            'K 가 클수록 경계가 부드러움 → 과소적합 위험',
            '홀수 K 가 자주 쓰임 (다수결 동률 회피)',
            '학습은 가벼운데 예측 시 모든 데이터와 거리 계산 → 데이터 커지면 느림',
          ],
        },
        {
          kind: 'table',
          title: '주요 거리 측도',
          headers: ['이름', '용도'],
          rows: [
            ['유클리드 (Euclidean)', '기본 — 연속형 변수'],
            ['맨해튼 (Manhattan)', '격자·이동 거리 직관적'],
            ['민코프스키 (Minkowski)', '유클리드·맨해튼의 일반형'],
            ['마할라노비스 (Mahalanobis)', '변수 간 상관을 반영'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '표준화는 거의 필수',
          body:
            '키(170cm) 와 체중(65kg) 처럼 스케일이 크게 다르면 큰 값 변수에 거리가 지배당합니다. min-max 스케일링 또는 Z-점수 표준화로 맞춘 뒤 사용합니다.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s9',
      title: '나이브베이즈 분류기 (NBC)',
      quizId: 'adsp-3-4-cp-09',
      dialogue: [
        { pose: 'wave', text: '[나이브베이즈] — [베이즈 정리] + "특징들이 모두 [독립]" 이라는 순진한 가정!' },
        { pose: 'think', text: '복잡한 결합확률이 [각 확률의 곱] 으로 단순화 → 학습·예측 매우 빠름.' },
        { pose: 'lightbulb', text: '사후확률 ∝ [사전 × 가능도]. 클래스별 계산해서 가장 큰 거 선택!' },
        { pose: 'happy', text: '변형: [Gaussian NB] (연속형) · [Multinomial NB] (단어빈도) · [Bernoulli NB] (이진).' },
        { pose: 'idle', text: '대표 활용: [스팸 필터] · [문서 분류]. 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '"베이즈 정리 + 순진한 가정 하나." 각 특징이 서로 **조건부 독립** 이라고 가정하면, 복잡한 결합확률이 "각 특징 확률의 곱" 으로 확 단순해집니다. 스팸 필터·텍스트 분류의 고전.',
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '핵심 수식',
          body:
            'P(C | x₁, …, xₙ) ∝ P(C) · Π P(xᵢ | C). 사후확률 ∝ 사전 × 가능도. 클래스마다 이 값을 계산해 가장 큰 값을 고릅니다.',
        },
        {
          kind: 'keypoints',
          title: '왜 "순진한(naive)" 인가',
          items: [
            '현실에선 특징들이 서로 완전히 독립인 경우가 드물지만, 그래도 가정해 버림',
            '의외로 많은 도메인에서 단순화가 성능을 크게 해치지 않음',
            '장점: 학습·예측 매우 빠름 · 적은 데이터로도 동작',
            '단점: 특징 간 의존성이 강하면 정확도 하락',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '대표 활용 + 변형',
          body:
            '스팸 메일 필터 · 문서 분류 · 의료 진단 보조. 변형: Gaussian NB(연속형) · Multinomial NB(텍스트 단어 빈도) · Bernoulli NB(이진 특성).',
        },
      ],
    },
    {
      id: 'adsp-3-4-s10',
      title: '서포트 벡터 머신 (SVM)',
      quizId: 'adsp-3-4-cp-10',
      dialogue: [
        { pose: 'wave', text: '[SVM] — 두 집단 사이에 선 그을 때, [가장 여유롭게] 긋자!' },
        { pose: 'think', text: '[마진] (경계까지 거리) 최대화. 경계 결정하는 소수 점이 [서포트 벡터]!' },
        { pose: 'lightbulb', text: '[하드 마진] (완전 분리) vs [소프트 마진] (약간 허용, 파라미터 C 로 조정).' },
        { pose: 'happy', text: '[커널 트릭] — 선형 분리 안 되면 [고차원으로 올려서] 풀자! (RBF · 다항 · 시그모이드)' },
        { pose: 'idle', text: '[고차원·소표본] 에 강함. 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '두 집단 사이에 선을 긋는다면, **가장 여유롭게** 긋는 게 안전하겠죠. SVM 은 그 "여유(margin)" 가 최대가 되는 경계(초평면) 를 찾습니다. 경계에 가장 가까운 소수 점이 "서포트 벡터" — 이들이 경계를 결정합니다.',
        },
        {
          kind: 'keypoints',
          title: '핵심 개념',
          items: [
            '마진(margin): 경계와 가장 가까운 샘플 사이 거리',
            '서포트 벡터: 마진 경계 위의 샘플 — 이 점들만 경계에 영향',
            '하드 마진: 완전 분리 가정 / 소프트 마진: 약간의 오분류 허용',
            '하이퍼파라미터 C: 오분류 허용 정도 — 클수록 경계 빡빡',
          ],
        },
        {
          kind: 'callout',
          tone: 'mnemonic',
          title: '커널 트릭 — "올려서 풀자"',
          body:
            '선형으로 나눌 수 없는 데이터도 더 높은 차원으로 옮기면 선형 분리가 가능합니다. RBF(가우시안)·다항·시그모이드 커널이 대표적. 원공간으로 돌아오면 복잡한 곡선 경계처럼 보입니다.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '강점과 약점',
          body:
            '강점: 고차원·소표본에 강하고 일반화 성능이 우수. 약점: 대용량 데이터에 학습이 느리고, 커널·C 튜닝 결과가 성능에 크게 영향.',
        },
      ],
    },
    {
      id: 'adsp-3-4-s11',
      title: '인공신경망 · 딥러닝',
      quizId: 'adsp-3-4-cp-11',
      dialogue: [
        { pose: 'wave', text: '[인공신경망] — 뇌 뉴런을 수식으로 흉내. 층을 [깊게] 쌓으면 [딥러닝]!' },
        { pose: 'think', text: '구조: [입력층] → [은닉층 × N] → [출력층]. 학습은 [오차역전파] 로 뒤에서부터 가중치 조정.' },
        { pose: 'lightbulb', text: '활성화 함수: [시그모이드] (0~1) · [tanh] · [ReLU] (현대 표준) · [Softmax] (다중분류).' },
        { pose: 'happy', text: '3대 구조: [CNN] (이미지) · [RNN/LSTM] (시계열) · [Transformer] (BERT·GPT)!' },
        { pose: 'idle', text: '대량 데이터 + GPU + 역전파 = 2010년대 폭발적 성장! 문제로!' },
      ],
      blocks: [
        {
          kind: 'intro',
          body:
            '뇌의 뉴런이 신호를 받아 임계를 넘으면 다음 뉴런에 전달 — 이걸 수식으로 흉내 낸 것이 인공신경망(ANN). 그 층(layer) 을 여러 개 깊게 쌓은 것이 딥러닝(Deep Learning) 입니다.',
        },
        {
          kind: 'section',
          title: '기본 구조',
          body:
            '입력층 → (은닉층 × N) → 출력층. 각 뉴런은 "가중합(Σwᵢxᵢ + b) → 활성화 함수 → 출력" 흐름. 학습은 **오차역전파(Backpropagation)** 로 출력 쪽 오차를 뒤에서부터 거꾸로 전달해 가중치를 조정합니다.',
        },
        {
          kind: 'table',
          title: '대표 활성화 함수',
          headers: ['함수', '출력 범위', '특징'],
          rows: [
            ['시그모이드', '(0, 1)', '확률 해석 용이 · 기울기 소실 문제'],
            ['tanh', '(−1, 1)', '중심 0 으로 개선'],
            ['ReLU', '[0, ∞)', '현재 은닉층 표준 · 계산 빠름'],
            ['Softmax', '(0, 1), 합 = 1', '다중 분류 출력층'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: '딥러닝 3대 구조',
          body:
            'CNN(Convolutional): 이미지·영상 특징 추출. RNN/LSTM: 시계열·언어 순차 데이터. Transformer: 현대 자연어 처리의 주류(BERT, GPT 계열).',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: '자주 틀리는 포인트',
          body:
            '은닉층이 1개만 있는 신경망은 얕은(shallow) ANN 이고, "여러 층" 이 깊게 쌓여야 딥러닝으로 봅니다. 대량 데이터 · GPU 연산 · 역전파 세 박자가 갖춰지며 2010년대 이후 폭발적으로 발전했습니다.',
        },
      ],
    },
  ],
};

export const ADSP_CH3_LESSONS: Lesson[] = [
  ADSP_3_1,
  ADSP_3_2,
  ADSP_3_3,
  ADSP_3_4,
];
