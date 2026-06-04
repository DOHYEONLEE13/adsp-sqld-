import { COMHWAL_CONCEPT_CHAPTERS, getComhwalTopicCards } from '@/data/comhwal/concepts';
import { ALL_LESSONS, type Lesson, type LessonStep } from '@/data/lessons';
import { SUBJECT_SCHEMAS } from '@/data/subjects';
import { EXPANSION_SUBJECTS } from '@/game/expansionSubjects';
import type { SeoCurriculumSubject } from '@/types/seo';
import type { Subject } from '@/types/question';

export interface CurriculumStep {
  id: string;
  title: string;
  href: string;
  indexInChapter: number;
  description?: string;
}

export interface CurriculumLesson {
  title: string;
  steps: CurriculumStep[];
  lesson?: Lesson;
}

export interface CurriculumTopic {
  topic: string;
  topicId?: string;
  sectionTitle?: string;
  href?: string;
  lessons: CurriculumLesson[];
  totalCards?: number;
  available: boolean;
}

export interface CurriculumChapter {
  chapter: number;
  title: string;
  subtitle?: string;
  topics: CurriculumTopic[];
  totalLessons: number;
  totalSteps: number;
  totalTopics: number;
  availableTopics: number;
}

export interface SubjectCurriculum {
  subject: SeoCurriculumSubject;
  title: string;
  label: string;
  chapters: CurriculumChapter[];
  totalChapters: number;
  totalTopics: number;
  totalLessons: number;
  totalSteps: number;
  availableTopics: number;
  isExpansion: boolean;
}

export function getCurriculum(
  subject: SeoCurriculumSubject,
): SubjectCurriculum {
  if (subject === 'adsp' || subject === 'sqld') {
    return getCoreCurriculum(subject);
  }
  return getComhwalCurriculum(subject);
}

function getCoreCurriculum(subject: Subject): SubjectCurriculum {
  const schema = SUBJECT_SCHEMAS[subject];
  const subjectLessons = ALL_LESSONS.filter((lesson) => lesson.subject === subject);

  let totalLessons = 0;
  let totalSteps = 0;
  let totalTopics = 0;
  let availableTopics = 0;

  const chapters: CurriculumChapter[] = schema.chapters.map((schemaChapter) => {
    const chapterLessons = schemaChapter.topics
      .map((topic) =>
        subjectLessons.find(
          (lesson) =>
            lesson.chapter === schemaChapter.chapter && lesson.topic === topic,
        ),
      )
      .filter((lesson): lesson is Lesson => !!lesson);

    let chapterStepIndex = 0;
    const topics: CurriculumTopic[] = schemaChapter.topics.map((topic) => {
      totalTopics++;
      const lesson = chapterLessons.find((entry) => entry.topic === topic);
      if (!lesson) {
        return {
          topic,
          lessons: [],
          available: false,
        };
      }

      availableTopics++;
      const steps = lesson.steps.map((step) =>
        mapLessonStep(step, chapterStepIndex++),
      );

      return {
        topic,
        lessons: [{ title: lesson.title, lesson, steps }],
        available: true,
      };
    });

    const chapterTotalLessons = chapterLessons.length;
    const chapterTotalSteps = chapterLessons.reduce(
      (sum, lesson) => sum + lesson.steps.length,
      0,
    );

    totalLessons += chapterTotalLessons;
    totalSteps += chapterTotalSteps;

    return {
      chapter: schemaChapter.chapter,
      title: schemaChapter.title,
      topics,
      totalLessons: chapterTotalLessons,
      totalSteps: chapterTotalSteps,
      totalTopics: topics.length,
      availableTopics: topics.filter((topic) => topic.available).length,
    };
  });

  return {
    subject,
    title: schema.title,
    label:
      subject === 'adsp'
        ? 'ADsP 데이터분석준전문가'
        : 'SQLD SQL 개발자',
    chapters,
    totalChapters: chapters.length,
    totalTopics,
    totalLessons,
    totalSteps,
    availableTopics,
    isExpansion: false,
  };
}

function mapLessonStep(step: LessonStep, indexInChapter: number): CurriculumStep {
  return {
    id: step.id,
    title: step.title,
    href: `/lesson/${step.id}`,
    indexInChapter,
  };
}

function getComhwalCurriculum(
  subject: Exclude<SeoCurriculumSubject, Subject>,
): SubjectCurriculum {
  const config = EXPANSION_SUBJECTS.comhwal;
  const variantId =
    subject === 'comhwal-1'
      ? 'grade-1'
      : subject === 'comhwal-2'
        ? 'grade-2'
        : null;
  const label =
    subject === 'comhwal-1'
      ? '컴활 1급 필기'
      : subject === 'comhwal-2'
        ? '컴활 2급 필기'
        : '컴활 필기';
  const indexedPlanets = config.planets.filter((planet) =>
    variantId ? planet.variantIds.includes(variantId) : true,
  );
  const contentChapterKeys = new Set(
    COMHWAL_CONCEPT_CHAPTERS.map((chapter) => chapter.planetKey),
  );

  let totalTopics = 0;
  let totalLessons = 0;
  let totalSteps = 0;
  let availableTopics = 0;

  const chapters: CurriculumChapter[] = indexedPlanets.map((planet, index) => {
    let chapterStepIndex = 0;
    const topics: CurriculumTopic[] = [];

    for (const section of planet.sections) {
      for (const topic of section.topics) {
        totalTopics++;
        const cards = contentChapterKeys.has(planet.key)
          ? getComhwalTopicCards(planet.key, topic.id)
          : [];
        const href =
          cards.length > 0
            ? `/topics/comhwal/${planet.key}/${topic.id}`
            : undefined;
        const steps: CurriculumStep[] = cards.map((card) => ({
          id: card.id,
          title: card.title,
          href: href ?? '#',
          indexInChapter: chapterStepIndex++,
          description: card.body,
        }));

        if (cards.length > 0) {
          availableTopics++;
          totalLessons++;
          totalSteps += cards.length;
        }

        topics.push({
          topic: topic.title,
          topicId: topic.id,
          sectionTitle: section.title,
          href,
          totalCards: cards.length,
          lessons:
            cards.length > 0
              ? [{ title: `${topic.title} 개념 카드`, steps }]
              : [],
          available: cards.length > 0,
        });
      }
    }

    return {
      chapter: index + 1,
      title: planet.title,
      subtitle: planet.variantIds.length === 1 ? '컴활 1급 전용 과목' : '컴활 1·2급 공통 과목',
      topics,
      totalLessons: topics.filter((topic) => topic.available).length,
      totalSteps: topics.reduce((sum, topic) => sum + (topic.totalCards ?? 0), 0),
      totalTopics: topics.length,
      availableTopics: topics.filter((topic) => topic.available).length,
    };
  });

  return {
    subject,
    title: config.routeLabel,
    label,
    chapters,
    totalChapters: chapters.length,
    totalTopics,
    totalLessons,
    totalSteps,
    availableTopics,
    isExpansion: true,
  };
}
