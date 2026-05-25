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

const SUBJECT_LABEL = {
  adsp: 'ADsP 데이터분석 준전문가',
  sqld: 'SQLD SQL 개발자',
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
    title: 'QuestDP — ADsP 게임·SQLD 게임 학습사이트',
    description:
      'QuestDP는 ADsP와 SQLD를 우주 탐험 RPG처럼 배우는 한국어 학습사이트입니다. 개념 스텝, 문제 풀이, 약점 복습으로 시험 범위를 반복 학습합니다.',
    h1: 'QuestDP',
    eyebrow: 'ADsP · SQLD 게임형 학습',
    summary:
      'ADsP와 SQLD 시험 범위를 짧은 개념 스텝과 즉시 문제 풀이로 나누어 학습합니다. 로드맵, 약점 분석, 망각곡선 복습을 한 화면에서 이어갈 수 있습니다.',
    image: `${SITE_ORIGIN}/og/questdp-home.png`,
    links: [
      { href: '/study-method', label: '학습 원리 보기' },
      { href: '/curriculum/adsp', label: 'ADsP 커리큘럼' },
      { href: '/curriculum/sqld', label: 'SQLD 커리큘럼' },
      { href: '/blog', label: '공부법 블로그' },
    ],
  },
  {
    group: 'core',
    path: '/study-method',
    changefreq: 'monthly',
    priority: '0.9',
    title: 'ADsP·SQLD 공부법 — 게임처럼 반복하는 QuestDP 학습법',
    description:
      'ADsP와 SQLD를 개념 스텝, 즉시 문제풀이, 약점 점수, 망각곡선 복습으로 공부하는 QuestDP의 학습 구조를 정리했습니다.',
    h1: 'ADsP·SQLD 공부법',
    eyebrow: 'Study Method',
    summary:
      '처음 보는 개념은 작은 단위로 나누고, 바로 문제를 풀고, 틀린 지점은 약점 노드와 복습 큐로 다시 만납니다. QuestDP는 시험 범위를 읽는 공부에서 끝내지 않고 행동하는 공부로 바꿉니다.',
    image: `${SITE_ORIGIN}/og/questdp-method.png`,
    images: STUDY_METHOD_IMAGES,
    type: 'article',
    links: [
      { href: '/curriculum/adsp', label: 'ADsP 시험 범위' },
      { href: '/curriculum/sqld', label: 'SQLD 시험 범위' },
      { href: '/faq/adsp', label: 'ADsP FAQ' },
      { href: '/faq/sqld', label: 'SQLD FAQ' },
    ],
  },
  {
    group: 'core',
    path: '/curriculum/adsp',
    changefreq: 'weekly',
    priority: '0.9',
    title: 'ADsP 학습사이트 · KDATA 시험범위 커리큘럼 — QuestDP',
    description:
      'KDATA ADsP 시험 범위, 과목별 핵심 개념, ADsP 기출문제 복습 흐름을 게임형 로드맵으로 정리한 커리큘럼입니다.',
    h1: 'ADsP 커리큘럼',
    eyebrow: 'KDATA ADsP',
    summary:
      '데이터 이해, 데이터 분석 기획, 데이터 분석 과목을 작은 개념 스텝으로 나누어 학습합니다. 각 스텝은 관련 문제와 연결되어 시험 범위를 순서대로 확인할 수 있습니다.',
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
      'KDATA SQLD 시험 범위, 데이터 모델링, SQL 기본 및 활용, SQLD 기출문제 복습 흐름을 게임형 로드맵으로 정리했습니다.',
    h1: 'SQLD 커리큘럼',
    eyebrow: 'KDATA SQLD',
    summary:
      '데이터 모델링의 이해와 SQL 기본 및 활용을 개념 스텝으로 나누고, JOIN, 서브쿼리, 윈도우 함수 같은 핵심 주제를 반복 학습합니다.',
    links: [
      { href: '/study-method', label: 'QuestDP 공부법' },
      { href: '/faq/sqld', label: 'SQLD 자주 묻는 질문' },
      { href: '/blog/sqld-7일-압축-로드맵', label: 'SQLD 7일 로드맵' },
    ],
  },
  {
    group: 'core',
    path: '/faq/adsp',
    changefreq: 'monthly',
    priority: '0.8',
    title: 'ADsP 학습사이트 FAQ — 시험 범위·기출문제·공부법',
    description:
      'ADsP 몇 문제, ADsP 시험 범위, ADsP 기출문제 공부법, 비전공자 학습 순서에 대한 QuestDP FAQ입니다.',
    h1: 'ADsP FAQ',
    eyebrow: 'ADsP 질문 모음',
    summary:
      'ADsP를 처음 준비하는 사람이 자주 묻는 시험 범위, 문제 수, 공부 순서, 기출 복습 방법을 한 번에 확인할 수 있습니다.',
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
      'SQLD 몇 문제, SQLD 시험 범위, SQLD 기출문제 공부법, SQLD 합격률과 학습 순서에 대한 QuestDP FAQ입니다.',
    h1: 'SQLD FAQ',
    eyebrow: 'SQLD 질문 모음',
    summary:
      'SQLD를 처음 준비하는 사람이 자주 묻는 시험 범위, 문제 수, SQL 우선순위, 기출 복습 방법을 한 번에 확인할 수 있습니다.',
    links: [
      { href: '/curriculum/sqld', label: 'SQLD 커리큘럼' },
      { href: '/blog/sqld-노랭이-vs-questdp', label: 'SQLD 문제집 비교' },
    ],
  },
  {
    group: 'core',
    path: '/glossary',
    changefreq: 'monthly',
    priority: '0.8',
    title: 'ADsP·SQLD 용어 사전 — QuestDP',
    description:
      'ADsP와 SQLD 시험에 자주 등장하는 데이터 분석, SQL, 모델링 용어를 초보자 기준으로 정리한 QuestDP 용어 사전입니다.',
    h1: 'ADsP·SQLD 용어 사전',
    eyebrow: 'Glossary',
    summary:
      '시험 문제를 읽을 때 막히기 쉬운 개념어를 짧은 설명과 함께 정리합니다. 커리큘럼과 블로그에서 다시 연결되는 보조 학습 페이지입니다.',
    links: [
      { href: '/curriculum/adsp', label: 'ADsP 개념 보기' },
      { href: '/curriculum/sqld', label: 'SQLD 개념 보기' },
    ],
  },
  {
    group: 'blog',
    path: '/blog',
    changefreq: 'weekly',
    priority: '0.85',
    title: 'ADsP·SQLD 공부법 블로그 — QuestDP',
    description:
      'ADsP 공부법, SQLD 공부법, 비전공자 학습 순서, 기출문제 복습 전략을 정리한 QuestDP 블로그입니다.',
    h1: 'ADsP·SQLD 공부법 블로그',
    eyebrow: 'Blog',
    summary:
      '시험 범위 정리, 독학 로드맵, 기출 복습 순서처럼 검색자가 실제로 궁금해하는 주제를 QuestDP 관점으로 정리합니다.',
    type: 'blog',
    links: [
      { href: '/study-method', label: '학습 원리' },
      { href: '/curriculum/adsp', label: 'ADsP 커리큘럼' },
      { href: '/curriculum/sqld', label: 'SQLD 커리큘럼' },
    ],
  },
  {
    group: 'core',
    path: '/pricing',
    changefreq: 'monthly',
    priority: '0.9',
    title: 'QuestDP 요금제 — ADsP·SQLD 게임형 학습사이트',
    description:
      'ADsP·SQLD 게임형 학습사이트 QuestDP의 무료 플랜, 오픈 베타 쿠폰, 프리미엄 이용 안내를 확인하세요.',
    h1: 'QuestDP 요금제',
    eyebrow: 'Pricing',
    summary:
      '정식 결제 오픈 전에는 오픈 베타 쿠폰으로 프리미엄 기능을 체험할 수 있습니다. 결제 관련 안내는 심사와 운영 정책에 맞춰 투명하게 제공합니다.',
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
      'QuestDP 고객문의 페이지. 결제·환불, 계정·로그인, ADsP·SQLD 학습 및 문제 오류를 이메일로 문의할 수 있습니다.',
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
    title: 'QuestDP 소개 — ADsP·SQLD 게임형 학습사이트',
    description:
      'QuestDP는 한국 ADsP·SQLD 자격증 학습을 우주 탐험 RPG와 마이크로 러닝 방식으로 재구성한 학습사이트입니다.',
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
  const core = CORE_ROUTES.map(normalizeRoute);
  const blogPosts = collectBlogRoutes();
  const lessons = collectLessonRoutes();
  const all = [...core, ...blogPosts, ...lessons];
  assertUniquePaths(all);
  assertNoQuizPaths(all);
  return { core, blog: blogPosts, lessons, all };
}

export function canonicalForPath(routePath) {
  if (routePath === '/') return `${SITE_ORIGIN}/`;
  const cleanPath = routePath.endsWith('/')
    ? routePath.slice(0, -1)
    : routePath;
  return `${SITE_ORIGIN}${encodeURI(cleanPath)}/`;
}

function collectBlogRoutes() {
  if (!fs.existsSync(BLOG_FILE)) return [];
  const src = fs.readFileSync(BLOG_FILE, 'utf8');
  const chunks = extractTypedObjectChunks(src, 'BlogPost');
  return chunks
    .map((chunk) => {
      const slug = readStringProp(chunk, 'slug');
      const title = readStringProp(chunk, 'title');
      const subtitle = readStringProp(chunk, 'subtitle');
      const description = readStringProp(chunk, 'metaDescription') || subtitle;
      const publishedAt = readStringProp(chunk, 'publishedAt');
      const category = readStringProp(chunk, 'category');
      if (!slug || !title) return null;
      const firstParagraphs = [...chunk.matchAll(/\btext:\s*(['"`])([\s\S]*?)\1/g)]
        .map((m) => cleanText(m[2]))
        .filter(Boolean)
        .slice(0, 2);
      const summary = firstParagraphs.length > 0
        ? firstParagraphs.join(' ')
        : subtitle || description;
      return normalizeRoute({
        group: 'blog',
        path: `/blog/${slug}`,
        changefreq: 'monthly',
        priority: '0.8',
        title: `${title} — QuestDP`,
        description,
        h1: title,
        eyebrow: [categoryLabel(category), publishedAt].filter(Boolean).join(' · '),
        summary,
        image: `${SITE_ORIGIN}/og/blog-${slug}.png`,
        type: 'article',
        links: [
          { href: '/blog', label: '블로그 목록' },
          { href: '/study-method', label: 'QuestDP 공부법' },
          { href: '/curriculum/adsp', label: 'ADsP 커리큘럼' },
          { href: '/curriculum/sqld', label: 'SQLD 커리큘럼' },
        ],
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: title,
            description,
            inLanguage: 'ko-KR',
            datePublished: publishedAt || undefined,
            author: { '@type': 'Organization', name: 'QuestDP', url: SITE_ORIGIN },
            publisher: { '@type': 'Organization', name: 'QuestDP' },
            mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalForPath(`/blog/${slug}`) },
            image: `${SITE_ORIGIN}/og/blog-${slug}.png`,
          },
          breadcrumbJsonLd([
            ['홈', '/'],
            ['블로그', '/blog'],
            [title, `/blog/${slug}`],
          ]),
        ],
      });
    })
    .filter(Boolean);
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
  const dialogue = firstStringAfterProp(stepChunk, 'text');
  const introBody = firstStringAfterProp(stepChunk, 'body');
  const base = dialogue || introBody || `${lesson.topic}의 핵심 개념을 짧게 배우고 바로 문제로 확인합니다.`;
  const cleaned = cleanText(base);
  const subject = lesson.subject === 'sqld' ? 'SQLD' : 'ADsP';
  return truncate(`${cleaned} ${subject} ${lesson.topic} 개념을 QuestDP 레슨에서 단계별로 정리합니다.`, 158);
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

function cleanText(value) {
  return String(value || '')
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
    total: manifest.all.length,
  }, null, 2));
}
