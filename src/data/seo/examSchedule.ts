/**
 * examSchedule.ts — 시험 회차 허브 템플릿 데이터.
 *
 * 운영 규칙:
 *   - 일정·접수기간·발표일·응시료 같은 변동 값은 추측해서 채우지 않는다.
 *   - 공식 사이트에서 회차별 정보를 확인한 뒤 TODO 값을 실제 값으로 바꾼다.
 *   - 하나라도 TODO가 남은 subject는 sitemap 제출 대상이 아니다.
 *   - 회차 데이터가 모두 채워진 subject만 indexable로 전환한다.
 */

export type ExamSubject = 'adsp' | 'sqld' | 'comhwal';
export type TodoValue = 'TODO';

export interface ExamRound {
  round: string | TodoValue;
  registrationPeriod: string | TodoValue;
  examDate: string | TodoValue;
  resultDate: string | TodoValue;
  note?: string;
}

export interface ExamScheduleHub {
  subject: ExamSubject;
  label: string;
  examName: string;
  officialUrl: string;
  sourceLabel: string;
  description: string;
  rounds: ExamRound[];
}

export const EXAM_SCHEDULE_HUBS: Record<ExamSubject, ExamScheduleHub> = {
  adsp: {
    subject: 'adsp',
    label: 'ADsP',
    examName: '데이터분석준전문가(ADsP)',
    officialUrl: 'https://www.dataq.or.kr/www/sub/a_06.do',
    sourceLabel: 'KDATA 데이터자격검정',
    description:
      'ADsP 회차별 접수기간, 시험일, 합격자 발표일을 정리하기 위한 허브입니다. 현재는 공식 일정 확인 전 템플릿 상태입니다.',
    rounds: [
      {
        round: 'TODO',
        registrationPeriod: 'TODO',
        examDate: 'TODO',
        resultDate: 'TODO',
        note: 'KDATA 공식 일정 공지 확인 후 입력',
      },
    ],
  },
  sqld: {
    subject: 'sqld',
    label: 'SQLD',
    examName: 'SQL 개발자(SQLD)',
    officialUrl: 'https://www.dataq.or.kr/www/sub/a_04.do',
    sourceLabel: 'KDATA 데이터자격검정',
    description:
      'SQLD 회차별 접수기간, 시험일, 합격자 발표일을 정리하기 위한 허브입니다. 현재는 공식 일정 확인 전 템플릿 상태입니다.',
    rounds: [
      {
        round: 'TODO',
        registrationPeriod: 'TODO',
        examDate: 'TODO',
        resultDate: 'TODO',
        note: 'KDATA 공식 일정 공지 확인 후 입력',
      },
    ],
  },
  comhwal: {
    subject: 'comhwal',
    label: '컴활',
    examName: '컴퓨터활용능력',
    officialUrl: 'https://license.korcham.net/co/examguide.do?cd=0103&mm=21',
    sourceLabel: '대한상공회의소 자격평가사업단',
    description:
      '컴퓨터활용능력 상시시험 접수와 발표 정보를 정리하기 위한 허브입니다. 현재는 공식 일정 확인 전 템플릿 상태입니다.',
    rounds: [
      {
        round: 'TODO',
        registrationPeriod: 'TODO',
        examDate: 'TODO',
        resultDate: 'TODO',
        note: '대한상공회의소 지역별 상시시험 일정 확인 후 입력',
      },
    ],
  },
};

export const EXAM_SUBJECTS = Object.keys(EXAM_SCHEDULE_HUBS) as ExamSubject[];

export function isExamSubject(value: string): value is ExamSubject {
  return value === 'adsp' || value === 'sqld' || value === 'comhwal';
}

export function getExamScheduleHub(subject: ExamSubject): ExamScheduleHub {
  return EXAM_SCHEDULE_HUBS[subject];
}

export function isScheduleValueFilled(value: string): boolean {
  return value.trim() !== '' && value.trim() !== 'TODO';
}

export function hasPublishedExamSchedule(hub: ExamScheduleHub): boolean {
  return (
    hub.rounds.length > 0 &&
    hub.rounds.every(
      (round) =>
        isScheduleValueFilled(round.round) &&
        isScheduleValueFilled(round.registrationPeriod) &&
        isScheduleValueFilled(round.examDate) &&
        isScheduleValueFilled(round.resultDate),
    )
  );
}
