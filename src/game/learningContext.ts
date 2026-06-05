import type { Subject } from '@/types/question';
import {
  EXPANSION_SUBJECTS,
  isExpansionSubjectId,
  type ExpansionSubjectId,
} from './expansionSubjects';

export const CORE_SUBJECT_ACCENT: Record<Subject, string> = {
  adsp: '#67e8f9',
  sqld: '#c084fc',
};

export const LAST_LEARN_HASH_KEY = 'questdp:last-learn-hash:v1';
export const LAST_EXPANSION_VIEW_KEY = 'questdp:last-expansion-view:v1';

export type LastLearnContext =
  | {
      kind: 'core';
      subject: Subject;
      label: string;
      accent: string;
      route: string;
    }
  | {
      kind: 'expansion';
      subjectId: ExpansionSubjectId;
      label: string;
      accent: string;
      route: string;
    };

export function readLastLearnHash(): string {
  if (typeof window === 'undefined') return '/game';
  try {
    const saved = window.localStorage.getItem(LAST_LEARN_HASH_KEY);
    return saved?.startsWith('/game') ? saved : '/game';
  } catch {
    return '/game';
  }
}

export function rememberCurrentLearnHash(): void {
  if (typeof window === 'undefined') return;
  const hash = window.location.hash.replace(/^#/, '') || '/game';
  if (!hash.startsWith('/game')) return;
  try {
    window.localStorage.setItem(LAST_LEARN_HASH_KEY, hash);
  } catch {
    // localStorage can be unavailable in embedded browsers.
  }
}

export function getLastLearnContext(
  fallbackSubject?: Subject | null,
): LastLearnContext | null {
  const route = readLastLearnHash();
  const routeSubject = /^\/game\/([^/?#]+)/.exec(route)?.[1];

  if (routeSubject === 'adsp' || routeSubject === 'sqld') {
    return coreContext(routeSubject, route);
  }

  if (routeSubject && isExpansionSubjectId(routeSubject)) {
    const subject = EXPANSION_SUBJECTS[routeSubject];
    return {
      kind: 'expansion',
      subjectId: routeSubject,
      label: readExpansionVariantLabel(routeSubject),
      accent: subject.accent,
      route: `/game/${routeSubject}`,
    };
  }

  return fallbackSubject ? coreContext(fallbackSubject, `/game/${fallbackSubject}`) : null;
}

function coreContext(subject: Subject, route: string): LastLearnContext {
  return {
    kind: 'core',
    subject,
    label: subject.toUpperCase(),
    accent: CORE_SUBJECT_ACCENT[subject],
    route,
  };
}

function readExpansionVariantLabel(subjectId: ExpansionSubjectId): string {
  const subject = EXPANSION_SUBJECTS[subjectId];
  if (typeof window === 'undefined') return subject.routeLabel;

  try {
    const raw = window.localStorage.getItem(LAST_EXPANSION_VIEW_KEY);
    if (!raw) return subject.routeLabel;
    const saved = JSON.parse(raw) as {
      subjectId?: string;
      variantId?: string;
    };
    if (saved.subjectId !== subjectId || !saved.variantId) {
      return subject.routeLabel;
    }
    return (
      subject.variants.find((variant) => variant.id === saved.variantId)
        ?.shortLabel ?? subject.routeLabel
    );
  } catch {
    return subject.routeLabel;
  }
}
