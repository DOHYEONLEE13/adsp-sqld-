import type { Lesson } from '../types';
import { SQLD_CH1_LESSONS } from './ch1-modeling';
import { SQLD_CH2_LESSONS } from './ch2-sql';

export const SQLD_LESSONS: Lesson[] = [
  ...SQLD_CH1_LESSONS,
  ...SQLD_CH2_LESSONS,
];
