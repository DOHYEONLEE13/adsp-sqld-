import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

export const SITE_ORIGIN = 'https://quest-dp.com';
export const DEFAULT_IMAGE = `${SITE_ORIGIN}/og/default.png`;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const LESSONS_ROOT = path.join(REPO_ROOT, 'src/data/lessons');
const BLOG_FILE = path.join(REPO_ROOT, 'src/data/seo/blog.ts');
const FAQ_FILE = path.join(REPO_ROOT, 'src/data/seo/faq.ts');
const GLOSSARY_FILE = path.join(REPO_ROOT, 'src/data/seo/glossary.ts');
const EXAM_SCHEDULE_FILE = path.join(REPO_ROOT, 'src/data/seo/examSchedule.ts');
const COMHWAL_CONCEPT_FILE = path.join(REPO_ROOT, 'src/data/comhwal/concepts.ts');
const COMHWAL_EXPANSION_CONCEPT_FILE = path.join(
  REPO_ROOT,
  'src/data/comhwal/expansionConcepts.ts',
);
const BLOG_DEFAULT_AUTHOR = 'QuestDP 운영팀';
const BLOG_DEFAULT_REVIEWED_AT = '2026-06-12';

const COMHWAL_TOPIC_SOURCES = [
  {
    planetKey: 'computer-general',
    planetLabel: '컴퓨터 일반',
    sectionLabel: '컴활 컴퓨터 일반',
    file: COMHWAL_CONCEPT_FILE,
    marker: 'const COMPUTER_GENERAL_TOPICS',
    priority: '0.72',
    blogHref: '/blog/comhwal-컴퓨터-일반-우선순위',
    blogLabel: '컴퓨터 일반 우선순위',
  },
  {
    planetKey: 'spreadsheet-general',
    planetLabel: '스프레드시트 일반',
    sectionLabel: '컴활 스프레드시트 일반',
    file: COMHWAL_EXPANSION_CONCEPT_FILE,
    marker: 'export const SPREADSHEET_GENERAL_TOPICS',
    priority: '0.70',
    blogHref: '/blog/comhwal-7일-필기-플랜',
    blogLabel: '컴활 7일 필기 플랜',
  },
  {
    planetKey: 'database-general',
    planetLabel: '데이터베이스 일반',
    sectionLabel: '컴활 데이터베이스 일반',
    file: COMHWAL_EXPANSION_CONCEPT_FILE,
    marker: 'export const DATABASE_GENERAL_TOPICS',
    priority: '0.68',
    blogHref: '/blog/comhwal-필기에서-실기-전환법',
    blogLabel: '필기에서 실기 전환법',
  },
];

const SUBJECT_LABEL = {
  adsp: 'ADsP 데이터분석 준전문가',
  sqld: 'SQLD SQL 개발자',
  comhwal: '컴퓨터활용능력 필기',
};

const INDEXABLE_LESSON_STEP_IDS = new Set([
  'adsp-1-1-s1',
  'adsp-1-1-s3-seci',
  'adsp-1-1-s4-dm',
  'adsp-1-1-s4-dw',
  'adsp-1-1-s4-lake',
  'adsp-1-1-s4-olap',
  'adsp-1-1-s4-oltp',
  'adsp-1-1-s5-crm',
  'adsp-1-1-s5-dbms',
  'adsp-1-1-s5-erp',
  'adsp-1-1-s5-scm',
  'adsp-1-2-s1-3v',
  'adsp-1-2-s3',
  'adsp-2-1-s1',
  'adsp-2-1-s2-crisp',
  'adsp-2-1-s2-kdd',
  'adsp-2-1-s3',
  'adsp-2-1-s4-agile',
  'adsp-2-1-s4-waterfall',
  'adsp-2-2-s1',
  'adsp-2-2-s2',
  'adsp-2-2-s3',
  'adsp-2-2-s4',
  'adsp-2-3-s4',
  'adsp-2-3-s5',
  'adsp-3-1-s2',
  'adsp-3-1-s3',
  'adsp-3-1-s4',
  'adsp-3-2-s4',
  'adsp-3-2-s5',
  'adsp-3-2-s6',
  'adsp-3-3-s1',
  'adsp-3-3-s2',
  'adsp-3-3-s4',
  'adsp-3-3-s5',
  'adsp-3-4-s1',
  'adsp-3-4-s2',
  'adsp-3-4-s3',
  'adsp-3-4-s4',
  'adsp-3-4-s5',
  'sqld-1-1-s1',
  'sqld-1-1-s10',
  'sqld-1-1-s2',
  'sqld-1-1-s3',
  'sqld-1-1-s4',
  'sqld-1-1-s4-req',
  'sqld-1-1-s5-kind',
  'sqld-1-1-s5-time',
  'sqld-1-1-s6',
  'sqld-1-1-s7',
  'sqld-1-1-s7-cardinality',
  'sqld-1-1-s7-erd-order',
  'sqld-1-1-s8',
  'sqld-1-1-s8-main',
  'sqld-1-1-s9',
  'sqld-1-2-s1',
  'sqld-1-2-s2',
  'sqld-1-2-s3',
  'sqld-1-2-s3-bcnf',
  'sqld-1-2-s4',
  'sqld-1-2-s6',
  'sqld-1-2-s6-acid',
  'sqld-1-2-s7',
  'sqld-1-2-s8',
  'sqld-2-1-s10',
  'sqld-2-1-s11',
  'sqld-2-1-s12',
  'sqld-2-1-s2',
  'sqld-2-1-s3',
  'sqld-2-1-s7',
  'sqld-2-1-s9',
  'sqld-2-2-s1',
  'sqld-2-2-s10',
  'sqld-2-2-s3',
  'sqld-2-2-s4',
  'sqld-2-2-s6',
  'sqld-2-2-s7',
  'sqld-2-2-s8',
  'sqld-2-3-s5-ddl',
]);

const CURRICULUM_FACTS = {
  adsp: {
    label: 'ADsP 데이터분석준전문가',
    authority: 'KDATA 데이터자격검정',
    exam: '데이터분석준전문가(ADsP)',
    method: '필기시험',
    subjects: '데이터 이해 · 데이터분석 기획 · 데이터분석',
    questions: '총 50문항 · 90분',
    scoring: '총점 60점 이상 · 과목별 40% 미만 과락',
    scope: '데이터 이해 10문항 · 데이터분석 기획 10문항 · 데이터분석 30문항',
    eligibility: '제한 없음',
    officialUrl: 'https://www.dataq.or.kr/www/sub/a_06.do',
    officialNote: '시험 일정과 응시료는 회차별로 바뀔 수 있어 KDATA 공식 안내에서 확인하세요.',
    strategy:
      '1·2과목에서 데이터 분석의 말문을 먼저 열고, 3과목 데이터 분석은 R 기초, 통계, 가설검정, 머신러닝을 짧게 여러 번 회전시키는 쪽이 안정적입니다.',
  },
  sqld: {
    label: 'SQLD SQL 개발자',
    authority: 'KDATA 데이터자격검정',
    exam: 'SQL 개발자(SQLD)',
    method: '필기시험',
    subjects: '데이터 모델링의 이해 · SQL 기본 및 활용',
    questions: '총 50문항 · 90분',
    scoring: '총점 60점 이상 · 과목별 40% 미만 과락',
    scope: '데이터 모델링의 이해 10문항 · SQL 기본 및 활용 40문항',
    eligibility: '제한 없음',
    officialUrl: 'https://www.dataq.or.kr/www/sub/a_04.do',
    officialNote: '시험 일정과 응시료는 회차별로 바뀔 수 있어 KDATA 공식 안내에서 확인하세요.',
    strategy:
      'SQLD는 2과목 SQL 기본 및 활용의 비중이 큽니다. 모델링은 큰 틀을 먼저 잡고 SELECT 실행 순서, JOIN, 서브쿼리, 윈도우 함수를 손으로 확인하는 흐름이 좋습니다.',
  },
  comhwal: {
    label: '컴활 필기',
    authority: '대한상공회의소 자격평가사업단',
    exam: '컴퓨터활용능력 필기',
    method: '필기 객관식 · 실기 컴퓨터 작업형',
    subjects: '1급 3과목 · 2급 2과목',
    questions: '1급 60문항 · 60분 / 2급 40문항 · 40분',
    scoring: '필기: 과목당 40점 이상 · 평균 60점 이상',
    scope:
      '1급: 컴퓨터 일반, 스프레드시트 일반, 데이터베이스 일반 / 2급: 컴퓨터 일반, 스프레드시트 일반',
    eligibility: '제한 없음',
    officialUrl: 'https://license.korcham.net/co/examguide.do?cd=0103&mm=21',
    officialNote: '상시시험 일정과 응시료는 지역·접수 시점에 따라 달라질 수 있어 대한상공회의소 공식 안내에서 확인하세요.',
    strategy:
      '컴활은 범위표보다 실제 화면의 말이 먼저입니다. 컴퓨터 일반으로 공통 단어를 만들고, 스프레드시트와 데이터베이스는 화면에서 만나는 기능 단위로 붙이는 편이 덜 막힙니다.',
  },
  'comhwal-1': {
    label: '컴활 1급 필기',
    authority: '대한상공회의소 자격평가사업단',
    exam: '컴퓨터활용능력 1급 필기',
    method: '필기 객관식 · 실기 컴퓨터 작업형',
    subjects: '컴퓨터 일반 · 스프레드시트 일반 · 데이터베이스 일반',
    questions: '객관식 60문항 · 60분',
    scoring: '필기: 과목당 40점 이상 · 평균 60점 이상',
    scope: '컴퓨터 일반 · 스프레드시트 일반 · 데이터베이스 일반',
    eligibility: '제한 없음',
    officialUrl: 'https://license.korcham.net/co/examguide.do?cd=0103&mm=21',
    officialNote: '상시시험 일정과 응시료는 지역·접수 시점에 따라 달라질 수 있어 대한상공회의소 공식 안내에서 확인하세요.',
    strategy:
      '1급은 데이터베이스 일반까지 들어갑니다. 공통 과목인 컴퓨터 일반으로 말문을 트고, 스프레드시트와 데이터베이스는 실기 화면과 연결되는 단어부터 확장하세요.',
  },
  'comhwal-2': {
    label: '컴활 2급 필기',
    authority: '대한상공회의소 자격평가사업단',
    exam: '컴퓨터활용능력 2급 필기',
    method: '필기 객관식 · 실기 컴퓨터 작업형',
    subjects: '컴퓨터 일반 · 스프레드시트 일반',
    questions: '객관식 40문항 · 40분',
    scoring: '필기: 과목당 40점 이상 · 평균 60점 이상',
    scope: '컴퓨터 일반 · 스프레드시트 일반',
    eligibility: '제한 없음',
    officialUrl: 'https://license.korcham.net/co/examguide.do?cd=0103&mm=21',
    officialNote: '상시시험 일정과 응시료는 지역·접수 시점에 따라 달라질 수 있어 대한상공회의소 공식 안내에서 확인하세요.',
    strategy:
      '2급은 데이터베이스 일반이 빠집니다. 컴퓨터 일반에서 용어를 정리하고, 스프레드시트 일반은 엑셀 화면에서 바로 떠올릴 수 있는 기능부터 반복하세요.',
  },
};

const CURRICULUM_REVIEW = {
  adsp: {
    basis: '2026년 KDATA 데이터자격검정 시험범위',
    reviewedAt: '2026-06-12',
  },
  sqld: {
    basis: '2026년 KDATA 데이터자격검정 시험범위',
    reviewedAt: '2026-06-12',
  },
  comhwal: {
    basis: '2024년 변경 출제기준 및 2026년 대한상공회의소 자격평가사업단 안내',
    reviewedAt: '2026-06-12',
  },
  'comhwal-1': {
    basis: '2024년 변경 출제기준 및 2026년 대한상공회의소 자격평가사업단 안내',
    reviewedAt: '2026-06-12',
  },
  'comhwal-2': {
    basis: '2024년 변경 출제기준 및 2026년 대한상공회의소 자격평가사업단 안내',
    reviewedAt: '2026-06-12',
  },
};

const STUDY_METHOD_IMAGES = [
  {
    url: `${SITE_ORIGIN}/seo/features/questdp-course-selection.jpg`,
    title: 'QuestDP 과목 선택 화면',
    caption: 'ADsP와 SQLD 중 원하는 자격증 카드를 골라 학습 은하로 진입하는 화면',
  },
  {
    url: `${SITE_ORIGIN}/seo/features/questdp-sqld-learning-roadmap.jpg`,
    title: 'QuestDP SQLD 학습 로드맵',
    caption: 'SQLD SQL 기본 및 활용 챕터의 개념 스텝을 따라가는 학습 탭',
  },
  {
    url: `${SITE_ORIGIN}/seo/features/questdp-daily-quests.jpg`,
    title: 'QuestDP 오늘의 퀘스트',
    caption: '오늘 복습할 문제와 일일 미션을 모아 보여주는 퀘스트 탭',
  },
  {
    url: `${SITE_ORIGIN}/seo/features/questdp-weakness-analysis.jpg`,
    title: 'QuestDP 나의 약점',
    caption: '학습 결과를 바탕으로 다시 볼 약점 단원을 보여주는 나의 약점 탭',
  },
  {
    url: `${SITE_ORIGIN}/seo/features/questdp-friends-ranking.jpg`,
    title: 'QuestDP 친구 비교',
    caption: '친구 태그를 추가하고 XP 리더보드를 비교하는 친구 탭',
  },
  {
    url: `${SITE_ORIGIN}/seo/features/questdp-sqld-lesson-having.jpg`,
    title: 'QuestDP 개념 레슨 화면',
    caption: 'SQLD HAVING 개념을 마스코트와 함께 학습하는 레슨 화면',
  },
  {
    url: `${SITE_ORIGIN}/seo/features/questdp-chapter-mock-exams.jpg`,
    title: 'QuestDP 챕터 모의고사',
    caption: 'SQLD 챕터 모의고사 1, 2, 3, FINAL을 선택하는 학습 화면',
  },
  {
    url: `${SITE_ORIGIN}/seo/features/questdp-study-dashboard.jpg`,
    title: 'QuestDP 학습 대시보드',
    caption: '프로필, 북마크, 누적 학습 상태를 확인하는 통계 탭',
  },
  {
    url: `${SITE_ORIGIN}/seo/features/questdp-pricing-plans.jpg`,
    title: 'QuestDP 요금제 화면',
    caption: '무료, Pro, Max 플랜을 비교하는 요금제 페이지',
  },
];

const CORE_ROUTES = [
  {
    group: 'core',
    path: '/',
    changefreq: 'weekly',
    priority: '1.0',
    title: 'QuestDP — ADsP·SQLD·컴활 자격증 학습사이트 | 게임형 문제풀이',
    description:
      'QuestDP는 ADsP·SQLD·컴활 자격증을 게임처럼 공부하는 학습사이트입니다. 로드맵과 퀘스트를 따라 개념을 익히고, 문제풀이와 약점 복습으로 시험을 준비하세요.',
    h1: 'ADSP, SQLD, 컴활까지 놀면서 합격!',
    eyebrow: 'QuestDP · ADsP · SQLD · 컴활 게임형 학습',
    summary:
      'ADsP, SQLD, 컴활 시험 범위를 짧은 개념 스텝과 즉시 문제 풀이로 나누어 학습합니다. 로드맵, 약점 분석, 망각곡선 복습을 한 화면에서 이어갈 수 있습니다.',
    image: `${SITE_ORIGIN}/og/questdp-home.png`,
    minSeoTextChars: 1000,
    links: [
      { href: '/study-method', label: '학습 원리 보기' },
      { href: '/curriculum/adsp', label: 'ADsP 커리큘럼' },
      { href: '/curriculum/sqld', label: 'SQLD 커리큘럼' },
      { href: '/curriculum/comhwal', label: '컴활 커리큘럼' },
      { href: '/blog', label: '공부법 블로그' },
    ],
  },
  {
    group: 'core',
    path: '/study-method',
    changefreq: 'monthly',
    priority: '0.9',
    title: 'ADsP·SQLD·컴활 공부법 — 게임처럼 반복하는 QuestDP 학습법',
    description:
      'ADsP와 SQLD, 컴활을 개념 스텝, 즉시 문제풀이, 약점 점수, 망각곡선 복습으로 공부하는 QuestDP의 학습 구조를 정리했습니다.',
    h1: 'ADsP·SQLD·컴활 공부법',
    eyebrow: 'Study Method',
    summary:
      '처음 보는 개념은 작은 단위로 나누고, 바로 문제를 풀고, 틀린 지점은 약점 노드와 복습 큐로 다시 만납니다. QuestDP는 시험 범위를 읽는 공부에서 끝내지 않고 행동하는 공부로 바꿉니다.',
    image: `${SITE_ORIGIN}/og/questdp-method.png`,
    images: STUDY_METHOD_IMAGES,
    type: 'article',
    links: [
      { href: '/curriculum/adsp', label: 'ADsP 시험 범위' },
      { href: '/curriculum/sqld', label: 'SQLD 시험 범위' },
      { href: '/curriculum/comhwal', label: '컴활 시험 범위' },
      { href: '/faq/adsp', label: 'ADsP FAQ' },
      { href: '/faq/sqld', label: 'SQLD FAQ' },
      { href: '/faq/comhwal', label: '컴활 FAQ' },
    ],
  },
  {
    group: 'core',
    path: '/curriculum/adsp',
    changefreq: 'weekly',
    priority: '0.9',
    title: 'ADsP 학습사이트 · KDATA 시험범위 커리큘럼 — QuestDP',
    description:
      'ADsP를 처음 준비할 때 1·2과목과 3과목을 어떻게 나눠 보면 덜 막히는지 안내합니다. 짧은 개념 스텝과 바로 푸는 문제로 시험 범위를 확인하세요.',
    h1: 'ADsP, 3과목을 같은 방식으로 외우지 마세요',
    eyebrow: 'KDATA ADsP',
    summary:
      'ADsP는 1·2과목에서 용어를 먼저 만들고, 3과목 통계·R·머신러닝을 자주 회전시키는 쪽이 덜 막힙니다. 긴 요약 대신 짧은 개념과 바로 푸는 문제로 나눠 보세요.',
    links: [
      { href: '/study-method', label: 'QuestDP 공부법' },
      { href: '/faq/adsp', label: 'ADsP 자주 묻는 질문' },
      { href: '/blog/adsp-2주-합격-로드맵', label: 'ADsP 2주 로드맵' },
    ],
  },
  {
    group: 'core',
    path: '/curriculum/sqld',
    changefreq: 'weekly',
    priority: '0.9',
    title: 'SQLD 학습사이트 · KDATA 시험범위 커리큘럼 — QuestDP',
    description:
      'SQLD를 처음 준비할 때 모델링과 SQL 기본·활용을 어떻게 나눠 보면 덜 막히는지 안내합니다. SELECT, JOIN, 서브쿼리, 윈도우 함수를 짧은 스텝으로 확인하세요.',
    h1: 'SQLD, SQL부터 손에 잡히게 보세요',
    eyebrow: 'KDATA SQLD',
    summary:
      'SQLD는 SQL 기본 및 활용 40문항이 점수를 크게 흔듭니다. 모델링은 큰 틀을 먼저 잡고, SELECT 실행 순서·JOIN·서브쿼리·윈도우 함수를 작은 문제로 자주 확인하세요.',
    links: [
      { href: '/study-method', label: 'QuestDP 공부법' },
      { href: '/faq/sqld', label: 'SQLD 자주 묻는 질문' },
      { href: '/blog/sqld-7일-압축-로드맵', label: 'SQLD 7일 로드맵' },
    ],
  },
  {
    group: 'core',
    path: '/curriculum/comhwal',
    changefreq: 'weekly',
    priority: '0.9',
    title: '컴활 학습사이트 · 컴퓨터활용능력 1급·2급 필기 커리큘럼 — QuestDP',
    description:
      '컴활 1급·2급 필기 범위를 처음 준비하는 사람 기준으로 풀어봅니다. 컴퓨터 일반, 스프레드시트, 데이터베이스를 어디서부터 보면 덜 막히는지 확인하세요.',
    h1: '컴활, 여기서부터 보면 덜 막혀요',
    eyebrow: '컴퓨터활용능력 필기',
    summary:
      '범위표만 보면 딱딱하지만 실제로는 컴퓨터 화면에서 자주 만나는 말을 차례로 익히는 시험입니다. 1급과 2급의 차이를 먼저 보고, 공개된 개념 카드부터 시작하세요.',
    links: [
      { href: '/curriculum/comhwal-1', label: '컴활 1급 필기 범위' },
      { href: '/curriculum/comhwal-2', label: '컴활 2급 필기 범위' },
      { href: '/faq/comhwal', label: '컴활 자주 묻는 질문' },
      { href: '/topics/comhwal/computer-general/001', label: '컴퓨터 일반 001 보기' },
    ],
  },
  {
    group: 'core',
    path: '/curriculum/comhwal-1',
    changefreq: 'weekly',
    priority: '0.85',
    title: '컴활 1급 필기 학습사이트 · 시험범위 커리큘럼 — QuestDP',
    description:
      '컴활 1급 필기 3과목을 처음부터 같은 무게로 들고 가지 않도록, 공통 과목부터 데이터베이스까지 이어지는 순서를 안내합니다.',
    h1: '컴활 1급, 공통 과목부터 차근차근',
    eyebrow: '컴퓨터활용능력 1급',
    summary:
      '1급은 60문항 60분, 컴퓨터 일반·스프레드시트 일반·데이터베이스 일반 3과목입니다. 공통 용어로 말문을 트고, 스프레드시트와 데이터베이스를 화면 감각에 맞춰 붙이세요.',
    links: [
      { href: '/curriculum/comhwal', label: '컴활 전체 범위' },
      { href: '/curriculum/comhwal-2', label: '컴활 2급 범위' },
      { href: '/faq/comhwal', label: '컴활 FAQ' },
      { href: '/blog/comhwal-1급-vs-2급', label: '컴활 1급 vs 2급' },
    ],
  },
  {
    group: 'core',
    path: '/curriculum/comhwal-2',
    changefreq: 'weekly',
    priority: '0.85',
    title: '컴활 2급 필기 학습사이트 · 시험범위 커리큘럼 — QuestDP',
    description:
      '컴활 2급 필기 2과목인 컴퓨터 일반과 스프레드시트 일반을 노베이스도 덜 막히는 순서로 안내합니다.',
    h1: '컴활 2급, 용어부터 가볍게',
    eyebrow: '컴퓨터활용능력 2급',
    summary:
      '2급은 40문항 40분, 컴퓨터 일반과 스프레드시트 일반 2과목입니다. 데이터베이스가 빠지는 대신 기본 용어와 엑셀 화면 감각을 촘촘히 잡는 쪽이 효율적입니다.',
    links: [
      { href: '/curriculum/comhwal', label: '컴활 전체 범위' },
      { href: '/curriculum/comhwal-1', label: '컴활 1급 범위' },
      { href: '/faq/comhwal', label: '컴활 FAQ' },
      { href: '/blog/comhwal-필기-비전공자-공부법', label: '컴활 비전공자 공부법' },
    ],
  },
  {
    group: 'core',
    path: '/faq/adsp',
    changefreq: 'monthly',
    priority: '0.8',
    title: 'ADsP 학습사이트 FAQ — 시험 범위·기출문제·공부법',
    description:
      'ADsP 문제 수, 시험 범위, 합격 기준, 비전공자 공부 순서와 기출 복습법을 처음 준비하는 사람 기준으로 짧게 답합니다.',
    h1: 'ADsP 처음 준비할 때 자주 막히는 질문',
    eyebrow: 'ADsP 질문 모음',
    summary:
      '통계부터 해야 할지, 기출부터 풀어야 할지 헷갈릴 때 먼저 보는 질문 모음입니다. 시험 구조와 공부 순서를 짧게 확인하세요.',
    links: [
      { href: '/curriculum/adsp', label: 'ADsP 커리큘럼' },
      { href: '/blog/adsp-비전공자-가이드', label: 'ADsP 비전공자 가이드' },
    ],
  },
  {
    group: 'core',
    path: '/faq/sqld',
    changefreq: 'monthly',
    priority: '0.8',
    title: 'SQLD 학습사이트 FAQ — 시험 범위·기출문제·공부법',
    description:
      'SQLD 문제 수, 시험 범위, 합격 기준, SQL 공부 순서와 기출 복습법을 처음 준비하는 사람 기준으로 짧게 답합니다.',
    h1: 'SQLD 처음 준비할 때 자주 막히는 질문',
    eyebrow: 'SQLD 질문 모음',
    summary:
      'SQL 문법이 낯설 때 어디부터 봐야 하는지, 모델링과 SQL을 어떻게 나눠 공부할지 먼저 확인하는 질문 모음입니다.',
    links: [
      { href: '/curriculum/sqld', label: 'SQLD 커리큘럼' },
      { href: '/blog/sqld-노랭이-vs-questdp', label: 'SQLD 문제집 비교' },
    ],
  },
  {
    group: 'core',
    path: '/faq/comhwal',
    changefreq: 'monthly',
    priority: '0.8',
    title: '컴활 학습사이트 FAQ — 1급·2급 필기 시험범위·문항 수·공부법',
    description:
      '컴활 1급·2급 차이, 필기 문항 수, 합격 기준, 노베이스 공부 순서를 처음 준비하는 사람 기준으로 짧게 답합니다.',
    h1: '컴활 처음 시작할 때 자주 묻는 질문',
    eyebrow: '컴퓨터활용능력 필기',
    summary:
      '1급과 2급 중 뭘 고를지, 필기는 몇 문제인지, 어디서부터 시작할지처럼 시작 전에 자주 걸리는 질문만 모았습니다.',
    links: [
      { href: '/curriculum/comhwal', label: '컴활 커리큘럼' },
      { href: '/blog/comhwal-1급-vs-2급', label: '컴활 1급 vs 2급' },
      { href: '/blog/comhwal-필기-비전공자-공부법', label: '컴활 비전공자 공부법' },
    ],
  },
  {
    group: 'core',
    path: '/glossary',
    changefreq: 'monthly',
    priority: '0.8',
    title: 'ADsP·SQLD·컴활 용어 사전 — QuestDP',
    description:
      'ADsP, SQLD, 컴활 시험에 자주 등장하는 데이터 분석, SQL, 모델링, 컴퓨터 일반 용어를 초보자 기준으로 정리한 QuestDP 용어 사전입니다.',
    h1: 'ADsP·SQLD·컴활 용어 사전',
    eyebrow: 'Glossary',
    summary:
      '시험 문제를 읽을 때 막히기 쉬운 개념어를 짧은 설명과 함께 정리합니다. 커리큘럼과 블로그에서 다시 연결되는 보조 학습 페이지입니다.',
    links: [
      { href: '/curriculum/adsp', label: 'ADsP 개념 보기' },
      { href: '/curriculum/sqld', label: 'SQLD 개념 보기' },
      { href: '/curriculum/comhwal', label: '컴활 개념 보기' },
    ],
  },
  {
    group: 'blog',
    path: '/blog',
    changefreq: 'weekly',
    priority: '0.85',
    title: 'ADsP·SQLD·컴활 공부법 블로그 — QuestDP',
    description:
      'ADsP 공부법, SQLD 공부법, 컴활 필기 공부법, 비전공자 학습 순서와 복습 전략을 정리한 QuestDP 블로그입니다.',
    h1: 'ADsP·SQLD·컴활 공부법 블로그',
    eyebrow: 'Blog',
    summary:
      '시험 범위 정리, 독학 로드맵, 기출 복습 순서처럼 검색자가 실제로 궁금해하는 주제를 QuestDP 관점으로 정리합니다.',
    type: 'blog',
    links: [
      { href: '/study-method', label: '학습 원리' },
      { href: '/curriculum/adsp', label: 'ADsP 커리큘럼' },
      { href: '/curriculum/sqld', label: 'SQLD 커리큘럼' },
      { href: '/curriculum/comhwal', label: '컴활 커리큘럼' },
    ],
  },
  {
    group: 'core',
    path: '/pricing',
    changefreq: 'monthly',
    priority: '0.9',
    title: 'QuestDP 요금제 — ADsP·SQLD·컴활 게임형 학습사이트',
    description:
      'ADsP·SQLD·컴활 게임형 학습사이트 QuestDP의 무료 플랜, Pro 7일 이용권, Max 30일 이용권과 환불 기준을 확인하세요.',
    h1: 'QuestDP 요금제',
    eyebrow: 'Pricing',
    summary:
      'Pro는 결제일부터 7일, Max는 결제일부터 30일 이용합니다. 두 상품 모두 단건 결제이며 자동 갱신되지 않습니다.',
    links: [
      { href: '/refund', label: '환불 정책' },
      { href: '/terms', label: '이용약관' },
    ],
  },
  {
    group: 'core',
    path: '/contact',
    changefreq: 'monthly',
    priority: '0.5',
    title: '고객문의 — QuestDP',
    description:
      'QuestDP 고객문의 페이지. 결제·환불, 계정·로그인, ADsP·SQLD·컴활 학습 및 문제 오류를 이메일로 문의할 수 있습니다.',
    h1: 'QuestDP 고객문의',
    eyebrow: 'Support',
    summary:
      '메일 앱이 열리지 않아도 이메일 주소를 복사해 문의할 수 있습니다. 결제·환불, 계정·로그인, 학습·문제 오류, 기술 오류 문의에 필요한 정보를 안내합니다.',
    links: [
      { href: '/pricing', label: '요금제' },
      { href: '/refund', label: '환불 정책' },
      { href: '/terms', label: '이용약관' },
    ],
  },
  {
    group: 'core',
    path: '/about',
    changefreq: 'monthly',
    priority: '0.8',
    title: 'QuestDP 소개 — ADsP·SQLD·컴활 게임형 학습사이트',
    description:
      'QuestDP는 한국 ADsP·SQLD·컴활 자격증 학습을 우주 탐험 RPG와 마이크로 러닝 방식으로 재구성한 학습사이트입니다.',
    h1: 'QuestDP 소개',
    eyebrow: 'About',
    summary:
      'QuestDP는 시험 범위를 작은 개념 단위로 나누고, 문제 풀이와 복습을 게임 루프 안에 배치해 꾸준히 이어가기 쉽게 만든 학습 서비스입니다.',
    links: [
      { href: '/study-method', label: '학습 방식' },
      { href: '/pricing', label: '요금제' },
    ],
  },
  {
    group: 'core',
    path: '/privacy',
    changefreq: 'yearly',
    priority: '0.3',
    title: '개인정보처리방침 — QuestDP',
    description: 'QuestDP의 개인정보 수집, 이용, 보관, 파기 기준을 안내합니다.',
    h1: '개인정보처리방침',
    eyebrow: 'Legal',
    summary: '서비스 이용 과정에서 처리되는 개인정보와 이용자의 권리를 안내합니다.',
    links: [{ href: '/about', label: 'QuestDP 소개' }],
  },
  {
    group: 'core',
    path: '/terms',
    changefreq: 'yearly',
    priority: '0.3',
    title: '이용약관 — QuestDP',
    description:
      'QuestDP 서비스 이용 조건, 회원의 권리·의무, 개념 설명·문제·해설 콘텐츠 보호 기준을 안내합니다.',
    h1: '이용약관',
    eyebrow: 'Legal',
    summary:
      'QuestDP 서비스 이용에 필요한 기본 약관과 책임 범위, 개념 설명·문제·해설의 무단 복제·배포 금지 기준을 안내합니다.',
    links: [{ href: '/privacy', label: '개인정보처리방침' }],
  },
  {
    group: 'core',
    path: '/refund',
    changefreq: 'yearly',
    priority: '0.3',
    title: '환불 정책 — QuestDP',
    description: 'QuestDP 결제, 환불, 청약철회 기준을 안내합니다.',
    h1: '환불 정책',
    eyebrow: 'Legal',
    summary: '프리미엄 이용권 결제와 환불 기준을 명확히 안내합니다.',
    links: [
      { href: '/pricing', label: '요금제' },
      { href: '/terms', label: '이용약관' },
    ],
  },
];

export function getSeoRouteManifest() {
  const blogPosts = collectBlogRoutes();
  const lessons = collectLessonRoutes();
  const topics = collectComhwalTopicRoutes();
  const glossaryTerms = parseGlossaryTerms();
  const examRoutes = collectExamRoutes();
  const core = [...CORE_ROUTES, ...examRoutes].map((route) =>
    normalizeRoute(enhanceCoreRoute(route, { blogPosts, lessons, topics, glossaryTerms })),
  );
  const all = [...core, ...blogPosts, ...lessons, ...topics];
  assertUniquePaths(all);
  assertNoQuizPaths(all);
  return { core, blog: blogPosts, lessons, topics, all };
}

export function canonicalForPath(routePath) {
  if (routePath === '/') return `${SITE_ORIGIN}/`;
  const cleanPath = routePath.endsWith('/')
    ? routePath.slice(0, -1)
    : routePath;
  return `${SITE_ORIGIN}${encodeURI(cleanPath)}/`;
}

function collectExamRoutes() {
  return parseExamScheduleHubs().map((hub) => {
    const indexable = hasPublishedExamSchedule(hub);
    const curriculumPath = hub.subject === 'comhwal' ? '/curriculum/comhwal' : `/curriculum/${hub.subject}`;
    return {
      group: 'core',
      path: `/exams/${hub.subject}`,
      changefreq: indexable ? 'weekly' : 'monthly',
      priority: indexable ? '0.72' : '0.1',
      indexable,
      title: `${hub.label} 시험 회차 허브 — QuestDP`,
      description: hub.description,
      h1: `${hub.label} 시험 회차 허브`,
      eyebrow: 'Exam Hub',
      summary: indexable
        ? `${hub.examName} 회차별 접수기간, 시험일, 발표일을 공식 기준으로 정리합니다.`
        : `${hub.examName} 회차 허브는 공식 일정 입력 전 템플릿 상태입니다. TODO 데이터가 남아 있어 sitemap에는 제출하지 않습니다.`,
      links: [
        { href: curriculumPath, label: `${hub.label} 커리큘럼` },
        { href: hub.officialUrl, label: `${hub.sourceLabel} 공식 안내` },
      ],
      staticContentHtml: renderExamScheduleStaticContent(hub),
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `${hub.label} 시험 회차 허브`,
          description: hub.description,
          url: canonicalForPath(`/exams/${hub.subject}`),
          inLanguage: 'ko-KR',
          isAccessibleForFree: true,
          about: hub.examName,
        },
        breadcrumbJsonLd([
          ['홈', '/'],
          [hub.label, curriculumPath],
          ['시험 회차 허브', `/exams/${hub.subject}`],
        ]),
      ],
    };
  });
}

function collectBlogRoutes() {
  return parseBlogPosts().map((post) => {
    const summary = firstBlogParagraphs(post)
      .slice(0, 2)
      .join(' ') || post.subtitle || post.description;
    const faqJsonLd = post.faqs.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a,
            },
          })),
        }
      : null;

    return normalizeRoute({
      group: 'blog',
      path: `/blog/${post.slug}`,
      changefreq: 'monthly',
      priority: '0.8',
      title: `${post.title} — QuestDP`,
      description: post.description,
      h1: post.title,
      eyebrow: [categoryLabel(post.category), post.publishedAt].filter(Boolean).join(' · '),
      summary,
      image: `${SITE_ORIGIN}/og/blog-${post.slug}.png`,
      type: 'article',
      links: [
        { href: '/blog', label: '블로그 목록' },
        { href: '/study-method', label: 'QuestDP 공부법' },
        { href: '/curriculum/adsp', label: 'ADsP 커리큘럼' },
        { href: '/curriculum/sqld', label: 'SQLD 커리큘럼' },
        { href: '/curriculum/comhwal', label: '컴활 커리큘럼' },
      ],
      minSeoTextChars: 1500,
      staticContentHtml: renderBlogStaticContent(post),
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.description,
          inLanguage: 'ko-KR',
          datePublished: post.publishedAt || undefined,
          dateModified: post.reviewedAt || post.updatedAt || post.publishedAt || undefined,
          author: { '@type': 'Organization', name: post.author || BLOG_DEFAULT_AUTHOR, url: `${SITE_ORIGIN}/about` },
          publisher: { '@type': 'Organization', name: 'QuestDP' },
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalForPath(`/blog/${post.slug}`) },
          image: `${SITE_ORIGIN}/og/blog-${post.slug}.png`,
          keywords: post.primaryKeyword || undefined,
        },
        ...(faqJsonLd ? [faqJsonLd] : []),
        breadcrumbJsonLd([
          ['홈', '/'],
          ['블로그', '/blog'],
          [post.title, `/blog/${post.slug}`],
        ]),
      ],
    });
  });
}

function parseBlogPosts() {
  if (!fs.existsSync(BLOG_FILE)) return [];
  const src = fs.readFileSync(BLOG_FILE, 'utf8');
  return [
    ...extractTypedObjectChunks(src, 'BlogPost'),
    ...extractTypedObjectChunks(src, 'BlogPostDraft'),
  ]
    .map((chunk) => {
      const slug = readStringProp(chunk, 'slug');
      const title = readStringProp(chunk, 'title');
      if (!slug || !title) return null;
      const blocks = extractArrayAfterProperty(chunk, 'blocks')
        ? extractTopLevelObjectLiterals(extractArrayAfterProperty(chunk, 'blocks'))
            .map(parseBlogBlock)
            .filter(Boolean)
        : [];
      const faqs = extractArrayAfterProperty(chunk, 'faqs')
        ? extractTopLevelObjectLiterals(extractArrayAfterProperty(chunk, 'faqs'))
            .map((faqChunk) => ({
              q: cleanText(readStringProp(faqChunk, 'q')),
              a: cleanText(readStringProp(faqChunk, 'a')),
            }))
            .filter((item) => item.q && item.a)
        : [];
      return {
        slug,
        title,
        subtitle: cleanText(readStringProp(chunk, 'subtitle')),
        category: readStringProp(chunk, 'category'),
        primaryKeyword: cleanText(readStringProp(chunk, 'primaryKeyword')),
        publishedAt: readStringProp(chunk, 'publishedAt'),
        updatedAt: readStringProp(chunk, 'updatedAt'),
        author: cleanText(readStringProp(chunk, 'author')) || BLOG_DEFAULT_AUTHOR,
        reviewedAt: readStringProp(chunk, 'reviewedAt') || readStringProp(chunk, 'updatedAt') || BLOG_DEFAULT_REVIEWED_AT,
        readingMinutes: readNumberProp(chunk, 'readingMinutes'),
        description: cleanText(readStringProp(chunk, 'metaDescription')),
        blocks,
        faqs,
        relatedSlugs: readStringArrayProp(chunk, 'relatedSlugs'),
      };
    })
    .filter(Boolean);
}

function parseBlogBlock(blockChunk) {
  const kind = readStringProp(blockChunk, 'kind');
  if (!kind) return null;
  if (kind === 'p' || kind === 'h2' || kind === 'h3' || kind === 'quote') {
    return {
      kind,
      text: cleanText(readStringProp(blockChunk, 'text')),
      cite: cleanText(readStringProp(blockChunk, 'cite')),
    };
  }
  if (kind === 'callout') {
    return {
      kind,
      title: cleanText(readStringProp(blockChunk, 'title')),
      body: cleanText(readStringProp(blockChunk, 'body')),
    };
  }
  if (kind === 'ul' || kind === 'ol') {
    return {
      kind,
      items: readStringArrayProp(blockChunk, 'items').map(cleanText).filter(Boolean),
    };
  }
  if (kind === 'table') {
    return {
      kind,
      headers: readStringArrayProp(blockChunk, 'headers').map(cleanText),
      rows: readTableRows(blockChunk).map((row) => row.map(cleanText)),
    };
  }
  if (kind === 'cta') {
    return {
      kind,
      label: cleanText(readStringProp(blockChunk, 'label')),
      href: readStringProp(blockChunk, 'href'),
    };
  }
  return null;
}

function firstBlogParagraphs(post) {
  return post.blocks
    .filter((block) => block.kind === 'p' || block.kind === 'callout')
    .map((block) => cleanText(block.text || block.body))
    .filter(Boolean);
}

function enhanceCoreRoute(route, context) {
  if (route.path === '/about') {
    return {
      ...route,
      staticContentHtml: renderAboutStaticContent(),
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: route.h1,
          description: route.description,
          url: canonicalForPath(route.path),
          inLanguage: 'ko-KR',
          isPartOf: { '@type': 'WebSite', name: 'QuestDP', url: SITE_ORIGIN },
          publisher: { '@type': 'Organization', name: 'QuestDP', url: SITE_ORIGIN },
        },
        breadcrumbJsonLd([
          ['홈', '/'],
          ['QuestDP 소개', '/about'],
        ]),
      ],
    };
  }

  if (route.path === '/blog') {
    return {
      ...route,
      minSeoTextChars: 1500,
      staticContentHtml: renderBlogIndexStaticContent(context.blogPosts),
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'QuestDP 공부법 블로그',
          description: route.description,
          url: canonicalForPath(route.path),
          inLanguage: 'ko-KR',
          publisher: { '@type': 'Organization', name: 'QuestDP', url: SITE_ORIGIN },
          blogPost: context.blogPosts.slice(0, 12).map((post) => ({
            '@type': 'BlogPosting',
            headline: post.h1,
            url: post.canonical,
            description: post.description,
          })),
        },
        breadcrumbJsonLd([
          ['홈', '/'],
          ['블로그', '/blog'],
        ]),
      ],
    };
  }

  if (route.path === '/glossary') {
    return {
      ...route,
      minSeoTextChars: 2500,
      staticContentHtml: renderGlossaryStaticContent(context.glossaryTerms),
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'DefinedTermSet',
          name: 'QuestDP ADsP·SQLD·컴활 용어 사전',
          url: canonicalForPath(route.path),
          hasDefinedTerm: context.glossaryTerms.map((term) => ({
            '@type': 'DefinedTerm',
            name: term.term,
            alternateName: term.aliases,
            description: term.short,
            termCode: term.slug,
            inDefinedTermSet: canonicalForPath(route.path),
            url: `${canonicalForPath(route.path)}#${term.slug}`,
          })),
        },
        breadcrumbJsonLd([
          ['홈', '/'],
          ['용어 사전', '/glossary'],
        ]),
      ],
    };
  }

  const faqSubject = route.path.match(/^\/faq\/(adsp|sqld|comhwal)$/)?.[1];
  if (faqSubject) {
    const faq = getFaqBySubject(faqSubject);
    if (!faq) return route;
    return {
      ...route,
      minSeoTextChars: 1500,
      staticContentHtml: renderFaqStaticContent(faq),
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.groups.flatMap((group) =>
            group.items.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.a,
              },
            })),
          ),
        },
        breadcrumbJsonLd([
          ['홈', '/'],
          [CURRICULUM_FACTS[faqSubject]?.label || faqSubject.toUpperCase(), faqSubject === 'comhwal' ? '/curriculum/comhwal' : `/curriculum/${faqSubject}`],
          ['자주 묻는 질문', route.path],
        ]),
      ],
    };
  }

  const curriculumSubject = route.path.match(/^\/curriculum\/(adsp|sqld|comhwal|comhwal-1|comhwal-2)$/)?.[1];
  if (curriculumSubject) {
    return {
      ...route,
      minSeoTextChars: 1500,
      staticContentHtml: renderCurriculumStaticContent(curriculumSubject, context),
      jsonLd: buildCurriculumJsonLd(curriculumSubject, route, context),
    };
  }

  return route;
}

function getFaqBySubject(subject) {
  if (!fs.existsSync(FAQ_FILE)) return null;
  const src = fs.readFileSync(FAQ_FILE, 'utf8');
  return extractTypedObjectChunks(src, 'SubjectFAQ')
    .map((chunk) => {
      const parsedSubject = readStringProp(chunk, 'subject');
      const groupsArray = extractArrayAfterProperty(chunk, 'groups');
      const groups = groupsArray
        ? extractTopLevelObjectLiterals(groupsArray)
            .map((groupChunk) => {
              const itemsArray = extractArrayAfterProperty(groupChunk, 'items');
              const items = itemsArray
                ? extractTopLevelObjectLiterals(itemsArray)
                    .map((itemChunk) => ({
                      q: cleanText(readStringProp(itemChunk, 'q')),
                      a: cleanText(readStringProp(itemChunk, 'a')),
                    }))
                    .filter((item) => item.q && item.a)
                : [];
              return {
                heading: cleanText(readStringProp(groupChunk, 'heading')),
                items,
              };
            })
            .filter((group) => group.heading && group.items.length > 0)
        : [];
      return {
        subject: parsedSubject,
        title: cleanText(readStringProp(chunk, 'title')),
        metaTitle: cleanText(readStringProp(chunk, 'metaTitle')),
        metaDescription: cleanText(readStringProp(chunk, 'metaDescription')),
        groups,
      };
    })
    .find((faq) => faq.subject === subject) || null;
}

function parseGlossaryTerms() {
  if (!fs.existsSync(GLOSSARY_FILE)) return [];
  const src = fs.readFileSync(GLOSSARY_FILE, 'utf8');
  return extractTopLevelObjectsFromArrayAfterMarker(src, 'export const GLOSSARY')
    .map((chunk) => ({
      slug: readStringProp(chunk, 'slug'),
      term: cleanText(readStringProp(chunk, 'term')),
      aliases: readStringArrayProp(chunk, 'aliases').map(cleanText).filter(Boolean),
      subject: readStringProp(chunk, 'subject'),
      category: cleanText(readStringProp(chunk, 'category')),
      short: cleanText(readStringProp(chunk, 'short')),
      analogy: cleanText(readStringProp(chunk, 'analogy')),
      examPoint: cleanText(readStringProp(chunk, 'examPoint')),
      relatedStepId: readStringProp(chunk, 'relatedStepId'),
    }))
    .filter((term) => term.slug && term.term && term.short && term.analogy && term.examPoint);
}

function parseExamScheduleHubs() {
  if (!fs.existsSync(EXAM_SCHEDULE_FILE)) return [];
  const src = fs.readFileSync(EXAM_SCHEDULE_FILE, 'utf8');
  const root = extractObjectAfterMarker(src, 'export const EXAM_SCHEDULE_HUBS');
  return ['adsp', 'sqld', 'comhwal']
    .map((subject) => {
      const chunk = extractObjectAfterProperty(root, subject);
      if (!chunk) return null;
      const roundsArray = extractArrayAfterProperty(chunk, 'rounds') || '';
      const rounds = extractTopLevelObjectLiterals(roundsArray).map((roundChunk) => ({
        round: cleanText(readStringProp(roundChunk, 'round')),
        registrationPeriod: cleanText(readStringProp(roundChunk, 'registrationPeriod')),
        examDate: cleanText(readStringProp(roundChunk, 'examDate')),
        resultDate: cleanText(readStringProp(roundChunk, 'resultDate')),
        note: cleanText(readStringProp(roundChunk, 'note')),
      }));
      return {
        subject,
        label: cleanText(readStringProp(chunk, 'label')),
        examName: cleanText(readStringProp(chunk, 'examName')),
        officialUrl: readStringProp(chunk, 'officialUrl'),
        sourceLabel: cleanText(readStringProp(chunk, 'sourceLabel')),
        description: cleanText(readStringProp(chunk, 'description')),
        rounds,
      };
    })
    .filter(Boolean);
}

function hasPublishedExamSchedule(hub) {
  return hub.rounds.length > 0 && hub.rounds.every((round) =>
    isScheduleValueFilled(round.round) &&
    isScheduleValueFilled(round.registrationPeriod) &&
    isScheduleValueFilled(round.examDate) &&
    isScheduleValueFilled(round.resultDate),
  );
}

function isScheduleValueFilled(value) {
  return String(value || '').trim() !== '' && String(value || '').trim() !== 'TODO';
}

function renderExamScheduleStaticContent(hub) {
  const rows = hub.rounds.map((round) =>
    [
      '<tr>',
      `<td>${escapeHtml(round.round)}</td>`,
      `<td>${escapeHtml(round.registrationPeriod)}</td>`,
      `<td>${escapeHtml(round.examDate)}</td>`,
      `<td>${escapeHtml(round.resultDate)}</td>`,
      `<td>${escapeHtml(round.note || '-')}</td>`,
      '</tr>',
    ].join(''),
  );
  const isPublished = hasPublishedExamSchedule(hub);
  return [
    '<section class="seo-static-section">',
    `<h2>${escapeHtml(hub.examName)} 회차 데이터 상태</h2>`,
    `<p>${escapeHtml(hub.description)}</p>`,
    '<table><thead><tr><th>회차</th><th>접수 기간</th><th>시험일</th><th>발표일</th><th>메모</th></tr></thead>',
    `<tbody>${rows.join('')}</tbody></table>`,
    isPublished
      ? '<p>공식 일정 확인이 끝난 회차만 이 페이지에 게시합니다.</p>'
      : '<p>현재 이 페이지는 일정 데이터가 TODO 상태라 검색엔진에 제출하지 않습니다.</p>',
    '</section>',
    '<section class="seo-static-section">',
    '<h2>공식 확인 링크</h2>',
    `<p>일정, 접수 기간, 발표일, 응시료는 ${escapeHtml(hub.sourceLabel)} 공식 사이트에서 확인한 뒤 입력합니다. <a href="${escapeHtml(hub.officialUrl)}">공식 사이트 확인</a></p>`,
    '</section>',
  ].join('\n');
}

function renderGlossaryStaticContent(terms) {
  const parts = [
    '<section class="seo-static-section">',
    '<h2>용어를 읽는 순서</h2>',
    '<p>각 용어는 정의, 쉬운 비유, 시험 포인트 순서로 정리했습니다. 처음 보는 단어는 정의만 외우지 말고 어떤 상황에서 쓰이는지까지 함께 확인하세요.</p>',
    '</section>',
  ];
  const byCategory = new Map();
  for (const term of terms) {
    const list = byCategory.get(term.category) || [];
    list.push(term);
    byCategory.set(term.category, list);
  }
  for (const [category, categoryTerms] of byCategory) {
    parts.push('<section class="seo-static-section">');
    parts.push(`<h2>${escapeHtml(category)}</h2>`);
    for (const term of categoryTerms) {
      parts.push(
        `<article id="${escapeHtml(term.slug)}" data-glossary-term="true">`,
        `<h3>${escapeHtml(term.term)}</h3>`,
        `<p><strong>정의</strong> ${escapeHtml(term.short)}</p>`,
        `<p><strong>쉬운 비유</strong> ${escapeHtml(term.analogy)}</p>`,
        `<p><strong>시험 포인트</strong> ${escapeHtml(term.examPoint)}</p>`,
        term.relatedStepId
          ? `<p><a href="/lesson/${escapeHtml(term.relatedStepId)}">관련 학습 페이지</a></p>`
          : '',
        '</article>',
      );
    }
    parts.push('</section>');
  }
  return parts.filter(Boolean).join('\n');
}

function renderBlogStaticContent(post) {
  const parts = [];
  if (post.subtitle) parts.push(`<p class="seo-lead">${escapeHtml(post.subtitle)}</p>`);
  parts.push(
    `<p class="seo-meta">작성 ${escapeHtml(post.publishedAt || '')} · 검수 ${escapeHtml(post.reviewedAt || '')} · ${escapeHtml(post.author || BLOG_DEFAULT_AUTHOR)}</p>`,
  );
  for (const block of post.blocks) {
    parts.push(renderBlogBlock(block));
  }
  if (post.faqs.length > 0) {
    parts.push('<section class="seo-static-section"><h2>자주 묻는 질문</h2>');
    for (const faq of post.faqs) {
      parts.push(
        `<h3>Q. ${escapeHtml(faq.q)}</h3><p>${escapeHtml(faq.a)}</p>`,
      );
    }
    parts.push('</section>');
  }
  return parts.filter(Boolean).join('\n');
}

function renderAboutStaticContent() {
  return [
    '<section class="seo-static-section">',
    '<h2>콘텐츠는 이렇게 만들고 검수합니다</h2>',
    '<p>QuestDP의 개념 설명, 문제, 해설은 자체 제작 학습 콘텐츠입니다. 공개된 시험 범위를 초보자가 이해할 수 있는 순서로 다시 나누고, 문제는 앱 안에서 바로 확인할 수 있게 구성합니다.</p>',
    '<ul>',
    '<li>문제은행은 scripts/validate-questions.mjs의 M1~M6 검증을 통과해야 합니다. JSON/필수 필드, answerIndex 범위, 중복 보기, 정답 단서 노출, 해설 부족, id 중복을 확인합니다.</li>',
    '<li>엑셀 함수 계산형 문항은 필요할 때 Excel COM Evaluate로 실제 엑셀 계산 결과를 재검산합니다.</li>',
    '<li>콘텐츠 수정 이력은 docs/content-edit-log.md에 남겨 다음 검수자가 변경 이유와 검증 결과를 추적할 수 있게 합니다.</li>',
    '<li>시험 범위 기준은 ADsP·SQLD는 KDATA 데이터자격검정, 컴활은 대한상공회의소 자격평가사업단 출제기준과 안내입니다.</li>',
    '</ul>',
    '</section>',
    '<section class="seo-static-section">',
    '<h2>대상 자격증</h2>',
    '<p>QuestDP는 ADsP, SQLD, 컴퓨터활용능력 필기를 짧은 개념 스텝과 즉시 문제풀이로 나누어 학습하도록 설계한 사이트입니다. 실제 풀이 흐름은 게임 화면에서 이어지고, 공개 SEO 페이지는 시험 범위와 개념 이해를 돕기 위한 본문 중심으로 유지합니다.</p>',
    '</section>',
  ].join('\n');
}

function renderBlogBlock(block) {
  if (block.kind === 'p') return `<p>${escapeHtml(block.text)}</p>`;
  if (block.kind === 'h2') return `<h2>${escapeHtml(block.text)}</h2>`;
  if (block.kind === 'h3') return `<h3>${escapeHtml(block.text)}</h3>`;
  if (block.kind === 'quote') {
    return `<blockquote>${escapeHtml(block.text)}${block.cite ? `<cite>${escapeHtml(block.cite)}</cite>` : ''}</blockquote>`;
  }
  if (block.kind === 'callout') {
    return `<aside class="seo-callout">${block.title ? `<h3>${escapeHtml(block.title)}</h3>` : ''}<p>${escapeHtml(block.body)}</p></aside>`;
  }
  if (block.kind === 'ul' || block.kind === 'ol') {
    const tag = block.kind;
    const items = (block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    return `<${tag}>${items}</${tag}>`;
  }
  if (block.kind === 'table') {
    return renderTable(block.headers || [], block.rows || []);
  }
  if (block.kind === 'cta' && block.href && block.label) {
    return `<p><a href="${escapeHtml(encodeURI(block.href))}">${escapeHtml(block.label)}</a></p>`;
  }
  return '';
}

function renderBlogIndexStaticContent(blogPosts) {
  const parts = [
    '<section class="seo-static-section">',
    '<h2>최근 공부법 글</h2>',
    '<p>QuestDP 블로그는 ADsP, SQLD, 컴활을 처음 준비하는 사람이 실제로 검색하는 질문을 기준으로 정리합니다. 시험범위, 준비 순서, 비전공자 공부법, 회독 방식처럼 바로 판단이 필요한 주제부터 다룹니다.</p>',
    '<ul>',
  ];
  for (const post of blogPosts) {
    parts.push(
      `<li><a href="${escapeHtml(encodeURI(post.path))}">${escapeHtml(post.h1)}</a> — ${escapeHtml(post.summary || post.description)}</li>`,
    );
  }
  parts.push('</ul></section>');
  parts.push(
    '<section class="seo-static-section"><h2>읽는 순서</h2><p>자격증을 고르는 단계라면 ADsP와 SQLD 비교 글을 먼저 보고, 이미 과목을 골랐다면 각 커리큘럼과 FAQ로 넘어가세요. 컴활은 1급과 2급 차이를 확인한 뒤 컴퓨터 일반 토픽부터 읽으면 처음 보는 말이 덜 낯섭니다.</p></section>',
  );
  return parts.join('\n');
}

function renderFaqStaticContent(faq) {
  const parts = [
    `<p class="seo-lead">${escapeHtml(faq.metaDescription)}</p>`,
  ];
  for (const group of faq.groups) {
    parts.push('<section class="seo-static-section">');
    parts.push(`<h2>${escapeHtml(group.heading)}</h2>`);
    for (const item of group.items) {
      parts.push(`<h3>Q. ${escapeHtml(item.q)}</h3>`);
      parts.push(`<p>${escapeHtml(item.a)}</p>`);
    }
    parts.push('</section>');
  }
  return parts.join('\n');
}

function renderCurriculumStaticContent(subject, context) {
  const facts = CURRICULUM_FACTS[subject];
  if (!facts) return '';
  const parts = [
    '<section class="seo-static-section">',
    `<h2>${escapeHtml(facts.exam)} 시험 사실</h2>`,
    '<dl class="seo-facts">',
    `<dt>시행기관</dt><dd>${escapeHtml(facts.authority)}</dd>`,
    `<dt>시험 방식</dt><dd>${escapeHtml(facts.method)}</dd>`,
    `<dt>과목 구성</dt><dd>${escapeHtml(facts.subjects)}</dd>`,
    `<dt>문항 / 시간</dt><dd>${escapeHtml(facts.questions)}</dd>`,
    `<dt>합격 기준</dt><dd>${escapeHtml(facts.scoring)}</dd>`,
    `<dt>시험 범위</dt><dd>${escapeHtml(facts.scope)}</dd>`,
    `<dt>응시 자격</dt><dd>${escapeHtml(facts.eligibility)}</dd>`,
    '</dl>',
    `<p>${escapeHtml(facts.strategy)}</p>`,
    `<p>${escapeHtml(facts.officialNote)} <a href="${escapeHtml(facts.officialUrl)}">공식 일정·응시료 확인</a></p>`,
    '</section>',
  ];

  if (subject === 'adsp' || subject === 'sqld') {
    parts.push(renderCoreCurriculumSections(subject, context.lessons));
  } else {
    parts.push(renderComhwalCurriculumSections(subject, context.topics));
  }

  parts.push(
    '<section class="seo-static-section"><h2>QuestDP에서 보는 방식</h2><p>긴 요약문을 한 번에 외우는 대신, 토픽을 작게 나누고 개념을 본 직후 바로 문제로 확인합니다. 공개 SEO 페이지는 시험범위와 개념 이해를 돕기 위한 본문 중심으로 두고, 실제 풀이 흐름은 게임 화면에서 이어가도록 분리합니다.</p></section>',
  );

  const review = CURRICULUM_REVIEW[subject];
  if (review) {
    parts.push(
      `<p class="seo-meta">이 페이지는 ${escapeHtml(review.basis)} 기준, 최종 검수 ${escapeHtml(review.reviewedAt)}</p>`,
    );
  }

  return parts.filter(Boolean).join('\n');
}

function renderCoreCurriculumSections(subject, lessons) {
  const subjectLessons = lessons.filter((lesson) => lesson.seoSubject === subject);
  const chapters = new Map();
  for (const lesson of subjectLessons) {
    const chapterKey = lesson.seoChapter || 0;
    if (!chapters.has(chapterKey)) {
      chapters.set(chapterKey, {
        title: lesson.seoChapterTitle || `Chapter ${chapterKey}`,
        topics: new Map(),
      });
    }
    const chapter = chapters.get(chapterKey);
    const topicKey = lesson.seoTopic || '기타';
    if (!chapter.topics.has(topicKey)) chapter.topics.set(topicKey, []);
    chapter.topics.get(topicKey).push(lesson);
  }

  const parts = [];
  for (const [chapterNo, chapter] of [...chapters.entries()].sort((a, b) => a[0] - b[0])) {
    parts.push('<section class="seo-static-section">');
    parts.push(`<h2>${escapeHtml(chapterNo)}과목 ${escapeHtml(chapter.title)}</h2>`);
    for (const [topic, steps] of chapter.topics) {
      parts.push(`<h3>${escapeHtml(topic)}</h3>`);
      parts.push('<ul>');
      for (const step of steps) {
        parts.push(
          `<li><a href="${escapeHtml(encodeURI(step.path))}">${escapeHtml(step.h1)}</a> — ${escapeHtml(step.summary)}</li>`,
        );
      }
      parts.push('</ul>');
    }
    parts.push('</section>');
  }
  return parts.join('\n');
}

function renderComhwalCurriculumSections(subject, topics) {
  const allowedTopics = topics.filter((topic) => {
    if (subject === 'comhwal-2') return topic.seoPlanetKey !== 'database-general';
    return true;
  });
  const planets = new Map();
  for (const topic of allowedTopics) {
    const planetKey = topic.seoPlanetKey || 'comhwal';
    if (!planets.has(planetKey)) {
      planets.set(planetKey, {
        label: topic.seoPlanetLabel || '컴활 필기',
        topics: [],
      });
    }
    planets.get(planetKey).topics.push(topic);
  }

  const parts = [];
  for (const planet of planets.values()) {
    parts.push('<section class="seo-static-section">');
    parts.push(`<h2>${escapeHtml(planet.label)}</h2>`);
    parts.push('<ul>');
    for (const topic of planet.topics) {
      const cardSummary = (topic.seoCardTitles || []).slice(0, 4).join(', ');
      parts.push(
        `<li><a href="${escapeHtml(encodeURI(topic.path))}">${escapeHtml(topic.seoTopicId)} ${escapeHtml(topic.seoTopicTitle)}</a> — ${escapeHtml(cardSummary || topic.summary)}</li>`,
      );
    }
    parts.push('</ul>');
    parts.push('</section>');
  }
  return parts.join('\n');
}

function buildCurriculumJsonLd(subject, route, context) {
  const facts = CURRICULUM_FACTS[subject];
  const items = subject === 'adsp' || subject === 'sqld'
    ? context.lessons
        .filter((lesson) => lesson.seoSubject === subject)
        .map((lesson) => ({ name: lesson.h1, url: lesson.canonical }))
    : context.topics
        .filter((topic) => subject !== 'comhwal-2' || topic.seoPlanetKey !== 'database-general')
        .map((topic) => ({ name: `${topic.seoTopicId} ${topic.seoTopicTitle}`, url: topic.canonical }));

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: `${facts?.label || route.h1} 시험범위 커리큘럼`,
      description: route.description,
      provider: {
        '@type': 'Organization',
        name: 'QuestDP',
        sameAs: SITE_ORIGIN,
      },
      inLanguage: 'ko-KR',
      educationalLevel: facts?.label || route.h1,
      isAccessibleForFree: true,
      about: facts ? [facts.exam, facts.scope] : undefined,
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: items.slice(0, 100).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: item.url,
        name: item.name,
      })),
    },
    breadcrumbJsonLd([
      ['홈', '/'],
      [facts?.label || route.h1, route.path],
      ['시험범위', route.path],
    ]),
  ];
}

function renderComhwalTopicStaticContent(source, topic) {
  const parts = [
    '<section class="seo-static-section">',
    `<h2>${escapeHtml(source.sectionLabel)} ${escapeHtml(topic.id)}번 개념</h2>`,
    `<p>이 페이지는 ${escapeHtml(topic.title)}를 처음 보는 사람도 화면이나 상황으로 떠올릴 수 있게 개념 카드 중심으로 정리합니다. 문제는 토픽당 1개 티저만 공개하고, 정답과 해설은 정적 HTML에 싣지 않습니다.</p>`,
    '</section>',
  ];

  parts.push('<section class="seo-static-section">');
  parts.push('<h2>개념 카드</h2>');
  for (const [index, card] of topic.cards.entries()) {
    parts.push(`<article class="seo-concept-card"><h3>${String(index + 1).padStart(2, '0')}. ${escapeHtml(card.title)}</h3>`);
    parts.push(`<p>${escapeHtml(cleanText(card.body))}</p>`);
    if (card.keyPoints?.length) {
      parts.push('<ul>');
      for (const point of card.keyPoints) parts.push(`<li>${escapeHtml(cleanText(point))}</li>`);
      parts.push('</ul>');
    }
    if (card.examTip) {
      parts.push(`<p><strong>시험 포인트</strong> ${escapeHtml(cleanText(card.examTip))}</p>`);
    }
    parts.push('</article>');
  }
  parts.push('</section>');

  const teaserCard = topic.cards.find((card) => card.correct || card.questionPrompt);
  if (teaserCard) {
    parts.push('<section class="seo-question-teaser" data-seo-question-teaser="true">');
    parts.push('<h2>체크포인트 문제 티저</h2>');
    parts.push(`<p>${escapeHtml(teaserCard.questionPrompt || `${topic.title}에서 방금 배운 핵심은 무엇인가요?`)}</p>`);
    const choices = buildQuestionTeaserChoices(teaserCard);
    if (choices.length > 0) {
      parts.push('<ol>');
      for (const choice of choices) parts.push(`<li>${escapeHtml(cleanText(choice))}</li>`);
      parts.push('</ol>');
    }
    parts.push('<p>정답과 해설은 공개 토픽 HTML에 넣지 않고, QuestDP 게임 화면에서 직접 풀면서 확인합니다.</p>');
    parts.push('</section>');
  }

  return parts.join('\n');
}

function buildQuestionTeaserChoices(card) {
  const choices = [card.correct, ...(card.wrongChoices || [])]
    .map(cleanText)
    .filter(Boolean);
  if (choices.length <= 1) return choices;
  const offset = Math.abs(hashString(`${card.title}:${card.questionPrompt}`)) % choices.length;
  return choices.slice(offset).concat(choices.slice(0, offset));
}

function hashString(value) {
  let hash = 0;
  for (const ch of String(value)) hash = ((hash << 5) - hash + ch.codePointAt(0)) | 0;
  return hash;
}

function collectComhwalTopicRoutes() {
  return COMHWAL_TOPIC_SOURCES.flatMap((source) => {
    const topics = collectComhwalTopicSpecs(source);
    return topics.map((topic, index) => buildComhwalTopicRoute(source, topics, topic, index));
  });
}

function collectComhwalTopicSpecs(source) {
  if (!fs.existsSync(source.file)) return [];
  const src = fs.readFileSync(source.file, 'utf8');
  const topicChunks = extractTopLevelObjectsFromArrayAfterMarker(src, source.marker);
  const objectTopics = topicChunks
    .map((chunk) => {
      const id = readStringProp(chunk, 'id');
      const section = readStringProp(chunk, 'section');
      const title = readStringProp(chunk, 'title');
      const cardsArray = extractArrayAfterProperty(chunk, 'cards');
      const cards = cardsArray
        ? extractTopLevelObjectLiterals(cardsArray)
            .map((cardChunk) => ({
              title: readStringProp(cardChunk, 'title'),
              body: readStringProp(cardChunk, 'body'),
              keyPoints: readStringArrayProp(cardChunk, 'keyPoints'),
              examTip: readStringProp(cardChunk, 'examTip'),
              correct: readStringProp(cardChunk, 'correct'),
              wrongChoices: readStringArrayProp(cardChunk, 'wrongChoices'),
              questionPrompt: readStringProp(cardChunk, 'questionPrompt'),
              explanation: readStringProp(cardChunk, 'explanation'),
            }))
            .filter((card) => card.title && card.body)
        : [];
      if (!id || !title || cards.length === 0) return null;
      return { id, section, title, cards };
    })
    .filter(Boolean);
  if (objectTopics.length > 0) return objectTopics;

  return extractTopicCallChunksAfterMarker(src, source.marker)
    .map((chunk) => {
      const cardsOpen = nextCodeChar(chunk, '[', 0);
      if (cardsOpen < 0) return null;
      const cardsClose = findMatching(chunk, cardsOpen, '[', ']');
      const [id, section, title] = readStringLiterals(chunk.slice(0, cardsOpen));
      const cards = extractTopLevelObjectLiterals(chunk.slice(cardsOpen + 1, cardsClose))
        .map((cardChunk) => ({
          title: readStringProp(cardChunk, 'title'),
          body: readStringProp(cardChunk, 'body'),
          keyPoints: readStringArrayProp(cardChunk, 'keyPoints'),
          examTip: readStringProp(cardChunk, 'examTip'),
          correct: readStringProp(cardChunk, 'correct'),
          wrongChoices: readStringArrayProp(cardChunk, 'wrongChoices'),
          questionPrompt: readStringProp(cardChunk, 'questionPrompt'),
          explanation: readStringProp(cardChunk, 'explanation'),
        }))
        .filter((card) => card.title && card.body);
      if (!id || !title || cards.length === 0) return null;
      return { id, section, title, cards };
    })
    .filter(Boolean);
}

function buildComhwalTopicRoute(source, topics, topic, index) {
  const path = `/topics/comhwal/${source.planetKey}/${topic.id}`;
  const summary = truncate(
    `${topic.cards.slice(0, 2).map((card) => card.body).join(' ')} 컴활 필기 ${source.planetLabel} ${topic.id} ${topic.title}를 길게 외우지 않도록 짧은 카드와 바로 확인하는 문제로 나눴습니다.`,
    180,
  );
  const teaserQuestions = topic.cards
    .filter((card) => card.correct || card.questionPrompt)
    .slice(0, 1)
    .map((card) => ({
      '@type': 'Question',
      name:
        card.questionPrompt ||
        `${topic.title}에서 방금 배운 핵심은 무엇인가요?`,
      suggestedAnswer: buildQuestionTeaserChoices(card).map((choice) => ({
        '@type': 'Answer',
        text: choice,
      })),
    }));
  const links = [
    { href: '/curriculum/comhwal', label: '컴활 커리큘럼' },
    { href: '/faq/comhwal', label: '컴활 FAQ' },
    { href: source.blogHref, label: source.blogLabel },
  ];
  if (topics[index - 1]) {
    links.push({
      href: `/topics/comhwal/${source.planetKey}/${topics[index - 1].id}`,
      label: `이전 토픽 ${topics[index - 1].id}`,
    });
  }
  if (topics[index + 1]) {
    links.push({
      href: `/topics/comhwal/${source.planetKey}/${topics[index + 1].id}`,
      label: `다음 토픽 ${topics[index + 1].id}`,
    });
  }

  return normalizeRoute({
    group: 'topics',
    path,
    changefreq: 'monthly',
    priority: source.priority,
    title: `${topic.title} — ${source.sectionLabel} 개념 카드 | QuestDP`,
    description: summary,
    h1: `${topic.title}, 바로 이해하고 확인하기`,
    eyebrow: `${source.planetLabel} ${topic.id}`,
    summary,
    type: 'article',
    links,
    minSeoTextChars: 850,
    staticContentHtml: renderComhwalTopicStaticContent(source, topic),
    seoSubject: 'comhwal',
    seoPlanetKey: source.planetKey,
    seoPlanetLabel: source.planetLabel,
    seoTopicId: topic.id,
    seoTopicTitle: topic.title,
    seoSectionTitle: topic.section,
    seoCardTitles: topic.cards.map((card) => card.title),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        name: `${topic.title} 컴활 개념 카드`,
        description: summary,
        url: canonicalForPath(path),
        inLanguage: 'ko-KR',
        learningResourceType: 'Concept overview',
        teaches: [topic.title, source.sectionLabel, topic.section].filter(Boolean),
        educationalLevel: '컴퓨터활용능력 필기',
        provider: { '@type': 'Organization', name: 'QuestDP', url: SITE_ORIGIN },
        isAccessibleForFree: true,
        hasPart: topic.cards.slice(0, 12).map((card, cardIndex) => ({
          '@type': 'CreativeWork',
          position: cardIndex + 1,
          name: card.title,
          text: card.body,
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Quiz',
        name: `${topic.title} 체크포인트 문제`,
        about: topic.title,
        inLanguage: 'ko-KR',
        educationalLevel: '컴퓨터활용능력 필기',
        assesses: `${topic.id} ${topic.title}`,
        provider: { '@type': 'Organization', name: 'QuestDP', url: SITE_ORIGIN },
        hasPart: teaserQuestions,
      },
      breadcrumbJsonLd([
        ['홈', '/'],
        ['컴활 커리큘럼', '/curriculum/comhwal'],
        [source.planetLabel, '/curriculum/comhwal'],
        [topic.title, path],
      ]),
    ],
  });
}

function collectLessonRoutes() {
  const lessonFiles = [];
  for (const subject of ['adsp', 'sqld']) {
    const dir = path.join(LESSONS_ROOT, subject);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith('.ts')) lessonFiles.push(path.join(dir, file));
    }
  }

  const routes = [];
  for (const file of lessonFiles) {
    const src = fs.readFileSync(file, 'utf8');
    for (const lessonChunk of extractLessonObjectChunks(src)) {
      const lesson = {
        id: readStringProp(lessonChunk, 'id'),
        subject: readStringProp(lessonChunk, 'subject'),
        chapter: readNumberProp(lessonChunk, 'chapter'),
        chapterTitle: readStringProp(lessonChunk, 'chapterTitle'),
        topic: readStringProp(lessonChunk, 'topic'),
        title: readStringProp(lessonChunk, 'title'),
        hook: readStringProp(lessonChunk, 'hook'),
      };
      const stepsArray = extractArrayAfterProperty(lessonChunk, 'steps');
      if (!lesson.id || !lesson.subject || !lesson.topic || !stepsArray) continue;
      const steps = extractTopLevelObjectLiterals(stepsArray)
        .map((stepChunk) => ({
          id: readStringProp(stepChunk, 'id'),
          title: readStringProp(stepChunk, 'title'),
          description: makeStepDescription(stepChunk, lesson),
        }))
        .filter((step) => step.id && step.title);

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const indexable = INDEXABLE_LESSON_STEP_IDS.has(step.id);
        const related = steps
          .filter((other) => other.id !== step.id)
          .slice(Math.max(0, i - 2), i)
          .concat(steps.slice(i + 1, i + 3))
          .slice(0, 4)
          .map((other) => ({ href: `/lesson/${other.id}`, label: other.title }));
        routes.push(normalizeRoute({
          group: 'lessons',
          path: `/lesson/${step.id}`,
          changefreq: 'monthly',
          priority: '0.7',
          title: `${step.title} — ${lesson.topic} ${SUBJECT_LABEL[lesson.subject] || ''} 개념 | QuestDP`,
          description: step.description,
          h1: step.title,
          eyebrow: `${SUBJECT_LABEL[lesson.subject] || lesson.subject.toUpperCase()} · ${lesson.chapterTitle || `Chapter ${lesson.chapter}`} · ${lesson.topic}`,
          summary: step.description,
          type: 'article',
          indexable,
          seoSubject: lesson.subject,
          seoChapter: lesson.chapter,
          seoChapterTitle: lesson.chapterTitle,
          seoTopic: lesson.topic,
          seoLessonTitle: lesson.title,
          seoStepTitle: step.title,
          links: [
            { href: lesson.subject === 'sqld' ? '/curriculum/sqld' : '/curriculum/adsp', label: `${SUBJECT_LABEL[lesson.subject] || lesson.subject.toUpperCase()} 커리큘럼` },
            ...related,
            { href: '/study-method', label: 'QuestDP 학습 방식' },
          ].slice(0, 6),
          jsonLd: [
            {
              '@context': 'https://schema.org',
              '@type': 'LearningResource',
              name: step.title,
              description: step.description,
              inLanguage: 'ko-KR',
              learningResourceType: 'Concept overview',
              teaches: lesson.topic,
              educationalLevel: SUBJECT_LABEL[lesson.subject] || undefined,
              provider: { '@type': 'Organization', name: 'QuestDP', url: SITE_ORIGIN },
              isAccessibleForFree: true,
            },
            breadcrumbJsonLd([
              ['홈', '/'],
              [SUBJECT_LABEL[lesson.subject] || lesson.subject.toUpperCase(), lesson.subject === 'sqld' ? '/curriculum/sqld' : '/curriculum/adsp'],
              [lesson.topic, lesson.subject === 'sqld' ? '/curriculum/sqld' : '/curriculum/adsp'],
              [step.title, `/lesson/${step.id}`],
            ]),
          ],
        }));
      }
    }
  }
  return routes.sort((a, b) => a.path.localeCompare(b.path));
}

function normalizeRoute(route) {
  const image = route.image || DEFAULT_IMAGE;
  return {
    type: 'website',
    ...route,
    image,
    canonical: canonicalForPath(route.path),
    description: truncate(cleanText(route.description || route.summary || route.h1), 158),
    summary: cleanText(route.summary || route.description || route.h1),
    links: (route.links || []).filter((link) => link?.href && link?.label),
  };
}

function makeStepDescription(stepChunk, lesson) {
  const base =
    firstLessonBlockDescription(stepChunk) ||
    lesson.hook ||
    `${lesson.topic}의 핵심 개념을 짧게 배우고 바로 문제로 확인합니다.`;
  const cleaned = cleanText(base);
  const subject = lesson.subject === 'sqld' ? 'SQLD' : 'ADsP';
  return truncate(`${cleaned} ${subject} ${lesson.topic} 개념을 QuestDP 레슨에서 단계별로 정리합니다.`, 158);
}

function firstLessonBlockDescription(stepChunk) {
  const blocksArray = extractArrayAfterProperty(stepChunk, 'blocks');
  if (!blocksArray) return '';
  const blocks = extractTopLevelObjectLiterals(blocksArray);
  const preferredKinds = ['intro', 'section', 'example', 'callout', 'keypoints'];
  const block = blocks.find((candidate) => readStringProp(candidate, 'kind') === 'intro') ||
    blocks.find((candidate) => preferredKinds.includes(readStringProp(candidate, 'kind'))) ||
    blocks[0];
  if (!block) return '';
  return (
    readStringProp(block, 'body') ||
    readStringProp(block, 'text') ||
    readStringArrayProp(block, 'items')[0] ||
    ''
  );
}

function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, itemPath], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: canonicalForPath(itemPath),
    })),
  };
}

function categoryLabel(category) {
  const labels = {
    roadmap: '로드맵',
    comparison: '비교',
    guide: '가이드',
    beginner: '입문',
    strategy: '공부법',
  };
  return labels[category] || category || '';
}

function assertUniquePaths(routes) {
  const seen = new Set();
  for (const route of routes) {
    if (seen.has(route.path)) throw new Error(`Duplicate SEO route path: ${route.path}`);
    seen.add(route.path);
  }
}

function assertNoQuizPaths(routes) {
  const quizRoute = routes.find((route) => route.path.startsWith('/quiz/'));
  if (quizRoute) throw new Error(`Quiz routes are excluded from SEO manifest: ${quizRoute.path}`);
}

function extractLessonObjectChunks(src) {
  return extractTypedObjectChunks(src, 'Lesson');
}

function extractTypedObjectChunks(src, typeName) {
  const chunks = [];
  const re = new RegExp(`const\\s+\\w+\\s*:\\s*${typeName}\\s*=\\s*{`, 'g');
  let match;
  while ((match = re.exec(src)) !== null) {
    const openIndex = src.indexOf('{', match.index);
    const closeIndex = findMatching(src, openIndex, '{', '}');
    if (closeIndex > openIndex) chunks.push(src.slice(openIndex, closeIndex + 1));
    re.lastIndex = closeIndex + 1;
  }
  return chunks;
}

function extractTopLevelObjectsFromArrayAfterMarker(src, marker) {
  const markerIndex = src.indexOf(marker);
  if (markerIndex < 0) return [];
  const equalsIndex = src.indexOf('=', markerIndex);
  if (equalsIndex < 0) return [];
  const openIndex = src.indexOf('[', equalsIndex);
  if (openIndex < 0) return [];
  const closeIndex = findMatching(src, openIndex, '[', ']');
  if (closeIndex < openIndex) return [];
  return extractTopLevelObjectLiterals(src.slice(openIndex + 1, closeIndex));
}

function extractObjectAfterMarker(src, marker) {
  const markerIndex = src.indexOf(marker);
  if (markerIndex < 0) return '';
  const equalsIndex = src.indexOf('=', markerIndex);
  if (equalsIndex < 0) return '';
  const openIndex = src.indexOf('{', equalsIndex);
  if (openIndex < 0) return '';
  const closeIndex = findMatching(src, openIndex, '{', '}');
  if (closeIndex < openIndex) return '';
  return src.slice(openIndex, closeIndex + 1);
}

function extractObjectAfterProperty(src, prop) {
  const propIndex = findPropertyIndex(src, prop);
  if (propIndex < 0) return '';
  const colon = src.indexOf(':', propIndex);
  if (colon < 0) return '';
  const openIndex = src.indexOf('{', colon);
  if (openIndex < 0) return '';
  const closeIndex = findMatching(src, openIndex, '{', '}');
  if (closeIndex < openIndex) return '';
  return src.slice(openIndex, closeIndex + 1);
}

function extractTopicCallChunksAfterMarker(src, marker) {
  const markerIndex = src.indexOf(marker);
  if (markerIndex < 0) return [];
  const equalsIndex = src.indexOf('=', markerIndex);
  if (equalsIndex < 0) return [];
  const openIndex = src.indexOf('[', equalsIndex);
  if (openIndex < 0) return [];
  const closeIndex = findMatching(src, openIndex, '[', ']');
  if (closeIndex < openIndex) return [];

  const arraySource = src.slice(openIndex + 1, closeIndex);
  const chunks = [];
  let i = 0;
  while (i < arraySource.length) {
    const callIndex = arraySource.indexOf('topic(', i);
    if (callIndex < 0) break;
    const openParen = arraySource.indexOf('(', callIndex);
    const closeParen = findMatching(arraySource, openParen, '(', ')');
    if (closeParen < openParen) break;
    chunks.push(arraySource.slice(openParen + 1, closeParen));
    i = closeParen + 1;
  }
  return chunks;
}

function readStringLiterals(src) {
  const values = [];
  let i = 0;
  while (i < src.length) {
    const quote = src[i];
    if (quote !== "'" && quote !== '"') {
      i++;
      continue;
    }
    let out = '';
    i++;
    while (i < src.length) {
      if (src[i] === '\\') {
        out += src[i + 1] ?? '';
        i += 2;
        continue;
      }
      if (src[i] === quote) {
        i++;
        break;
      }
      out += src[i];
      i++;
    }
    values.push(out);
  }
  return values;
}

function extractArrayAfterProperty(src, prop) {
  const propIndex = findPropertyIndex(src, prop);
  if (propIndex < 0) return null;
  const colon = src.indexOf(':', propIndex);
  const openIndex = src.indexOf('[', colon);
  if (openIndex < 0) return null;
  const closeIndex = findMatching(src, openIndex, '[', ']');
  if (closeIndex < openIndex) return null;
  return src.slice(openIndex + 1, closeIndex);
}

function extractTopLevelObjectLiterals(arraySource) {
  const out = [];
  let i = 0;
  while (i < arraySource.length) {
    const openIndex = nextCodeChar(arraySource, '{', i);
    if (openIndex < 0) break;
    const closeIndex = findMatching(arraySource, openIndex, '{', '}');
    if (closeIndex < openIndex) break;
    out.push(arraySource.slice(openIndex, closeIndex + 1));
    i = closeIndex + 1;
  }
  return out;
}

function readStringProp(src, prop) {
  const propIndex = findPropertyIndex(src, prop);
  if (propIndex < 0) return '';
  const colon = src.indexOf(':', propIndex);
  if (colon < 0) return '';
  return readStringLiteral(src, colon + 1);
}

function readStringArrayProp(src, prop) {
  const arraySource = extractArrayAfterProperty(src, prop);
  if (!arraySource) return [];
  return readStringLiterals(arraySource);
}

function readTableRows(src) {
  const rowsSource = extractArrayAfterProperty(src, 'rows');
  if (!rowsSource) return [];
  return extractTopLevelArrays(rowsSource).map(readStringLiterals);
}

function extractTopLevelArrays(arraySource) {
  const out = [];
  let i = 0;
  while (i < arraySource.length) {
    const openIndex = nextCodeChar(arraySource, '[', i);
    if (openIndex < 0) break;
    const closeIndex = findMatching(arraySource, openIndex, '[', ']');
    if (closeIndex < openIndex) break;
    out.push(arraySource.slice(openIndex + 1, closeIndex));
    i = closeIndex + 1;
  }
  return out;
}

function firstStringAfterProp(src, prop) {
  const propIndex = findPropertyIndex(src, prop);
  if (propIndex < 0) return '';
  const colon = src.indexOf(':', propIndex);
  if (colon < 0) return '';
  return readStringLiteral(src, colon + 1);
}

function readNumberProp(src, prop) {
  const propIndex = findPropertyIndex(src, prop);
  if (propIndex < 0) return 0;
  const colon = src.indexOf(':', propIndex);
  const match = src.slice(colon + 1).match(/\s*(\d+)/);
  return match ? Number(match[1]) : 0;
}

function findPropertyIndex(src, prop) {
  const re = new RegExp(`\\b${prop}\\s*:`, 'g');
  const match = re.exec(src);
  return match ? match.index : -1;
}

function readStringLiteral(src, start) {
  let i = start;
  while (i < src.length && /\s/.test(src[i])) i++;
  const quote = src[i];
  if (!['"', "'", '`'].includes(quote)) return '';
  i++;
  let value = '';
  while (i < src.length) {
    const ch = src[i];
    if (ch === '\\') {
      const next = src[i + 1];
      if (next === 'n') value += '\n';
      else if (next === 'r') value += '\r';
      else if (next === 't') value += '\t';
      else value += next ?? '';
      i += 2;
      continue;
    }
    if (ch === quote) break;
    value += ch;
    i++;
  }
  return value;
}

function nextCodeChar(src, target, start) {
  let state = 'code';
  let quote = '';
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];
    if (state === 'code') {
      if (ch === '/' && next === '/') {
        state = 'lineComment';
        i++;
        continue;
      }
      if (ch === '/' && next === '*') {
        state = 'blockComment';
        i++;
        continue;
      }
      if (['"', "'", '`'].includes(ch)) {
        state = 'string';
        quote = ch;
        continue;
      }
      if (ch === target) return i;
      continue;
    }
    if (state === 'string') {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === quote) state = 'code';
      continue;
    }
    if (state === 'lineComment') {
      if (ch === '\n') state = 'code';
      continue;
    }
    if (state === 'blockComment') {
      if (ch === '*' && next === '/') {
        state = 'code';
        i++;
      }
    }
  }
  return -1;
}

function findMatching(src, openIndex, openChar, closeChar) {
  let depth = 0;
  let state = 'code';
  let quote = '';
  for (let i = openIndex; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];
    if (state === 'code') {
      if (ch === '/' && next === '/') {
        state = 'lineComment';
        i++;
        continue;
      }
      if (ch === '/' && next === '*') {
        state = 'blockComment';
        i++;
        continue;
      }
      if (['"', "'", '`'].includes(ch)) {
        state = 'string';
        quote = ch;
        continue;
      }
      if (ch === openChar) depth++;
      if (ch === closeChar) {
        depth--;
        if (depth === 0) return i;
      }
      continue;
    }
    if (state === 'string') {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === quote) state = 'code';
      continue;
    }
    if (state === 'lineComment') {
      if (ch === '\n') state = 'code';
      continue;
    }
    if (state === 'blockComment') {
      if (ch === '*' && next === '/') {
        state = 'code';
        i++;
      }
    }
  }
  return -1;
}

function renderTable(headers, rows) {
  if (headers.length === 0 && rows.length === 0) return '';
  const head = headers.length
    ? `<thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>`
    : '';
  const body = rows.length
    ? `<tbody>${rows
        .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
        .join('')}</tbody>`
    : '';
  return `<table>${head}${body}</table>`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cleanText(value) {
  return String(value || '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/\[([^\]]+)\]/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value, length) {
  const clean = cleanText(value);
  return clean.length > length ? `${clean.slice(0, length - 1)}…` : clean;
}

if (process.argv[1] === __filename) {
  const manifest = getSeoRouteManifest();
  console.log(JSON.stringify({
    core: manifest.core.length,
    blog: manifest.blog.length,
    lessons: manifest.lessons.length,
    topics: manifest.topics.length,
    total: manifest.all.length,
  }, null, 2));
}
