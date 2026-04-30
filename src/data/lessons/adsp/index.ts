import type { Lesson } from '../types';
import { ADSP_CH1_LESSONS } from './ch1';
import { ADSP_CH2_LESSONS } from './ch2';
import { ADSP_CH3_LESSONS } from './ch3';

export const ADSP_LESSONS: Lesson[] = [
  ...ADSP_CH1_LESSONS,
  ...ADSP_CH2_LESSONS,
  ...ADSP_CH3_LESSONS,
];
