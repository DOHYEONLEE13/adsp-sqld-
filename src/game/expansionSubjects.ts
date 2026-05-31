import {
  Database,
  FileSpreadsheet,
  Monitor,
  type LucideIcon,
} from 'lucide-react';

export type ExpansionSubjectId = 'comhwal';
export type ExpansionVariantId = string;

export interface ExpansionVariant {
  id: ExpansionVariantId;
  title: string;
  shortLabel: string;
  subtitle: string;
  meta: string;
}

export interface ExpansionPlanet {
  key: string;
  title: string;
  subtitle: string;
  variantIds: ExpansionVariantId[];
  icon: LucideIcon;
}

export interface ExpansionSubjectConfig {
  id: ExpansionSubjectId;
  routeLabel: string;
  accent: string;
  accentRgb: string;
  variants: ExpansionVariant[];
  planets: ExpansionPlanet[];
}

export const EXPANSION_SUBJECTS: Record<
  ExpansionSubjectId,
  ExpansionSubjectConfig
> = {
  comhwal: {
    id: 'comhwal',
    routeLabel: 'COMHWAL',
    accent: '#A7E96A',
    accentRgb: '167, 233, 106',
    variants: [
      {
        id: 'grade-1',
        title: '컴활 1급',
        shortLabel: '컴활 1급',
        subtitle: '컴퓨터활용능력 필기',
        meta: '3과목',
      },
      {
        id: 'grade-2',
        title: '컴활 2급',
        shortLabel: '컴활 2급',
        subtitle: '컴퓨터활용능력 필기',
        meta: '2과목',
      },
    ],
    planets: [
      {
        key: 'computer-general',
        title: '컴퓨터 일반',
        subtitle: '필기 과목',
        variantIds: ['grade-1', 'grade-2'],
        icon: Monitor,
      },
      {
        key: 'spreadsheet-general',
        title: '스프레드시트 일반',
        subtitle: '필기 과목',
        variantIds: ['grade-1', 'grade-2'],
        icon: FileSpreadsheet,
      },
      {
        key: 'database-general',
        title: '데이터베이스 일반',
        subtitle: '필기 과목',
        variantIds: ['grade-1'],
        icon: Database,
      },
    ],
  },
};

export function isExpansionSubjectId(
  value: string | undefined,
): value is ExpansionSubjectId {
  return value === 'comhwal';
}
