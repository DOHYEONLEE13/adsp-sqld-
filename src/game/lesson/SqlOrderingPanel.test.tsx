// @vitest-environment jsdom

import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SqlOrderingPanel from './SqlOrderingPanel';
import type { MultipleChoiceQuestion } from '@/types/question';

const question: MultipleChoiceQuestion = {
  id: 'sqld-sql-order-test',
  subject: 'sqld',
  chapter: 2,
  chapterTitle: 'SQL 기본 및 활용',
  topic: 'SQL 기본',
  type: 'multiple_choice',
  question: '블록을 순서대로 눌러 SQL을 완성하세요.',
  choices: [
    'SELECT -> FROM -> WHERE',
    'FROM -> SELECT -> WHERE',
    'WHERE -> SELECT -> FROM',
    'SELECT -> WHERE -> FROM',
  ],
  answerIndex: 0,
  interaction: {
    kind: 'sql_ordering',
    dialect: 'standard',
    instruction: '기본 조회 순서를 맞춰 보세요.',
    template: ['', '\n  NAME\n', ' EMP\n', ' ID = 1;'],
    tokens: ['FROM', 'WHERE', 'SELECT'],
    answer: ['SELECT', 'FROM', 'WHERE'],
  },
};

let root: Root | null = null;
let host: HTMLDivElement | null = null;

afterEach(() => {
  if (root) {
    act(() => root?.unmount());
  }
  host?.remove();
  root = null;
  host = null;
});

function renderPanel(onChoose = vi.fn()) {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => {
    root?.render(<SqlOrderingPanel question={question} onChoose={onChoose} />);
  });
  return { host, onChoose };
}

function clickButton(text: string) {
  const button = Array.from(document.querySelectorAll('button')).find(
    (el) => el.textContent?.trim() === text,
  );
  if (!button) throw new Error(`button not found: ${text}`);
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('SqlOrderingPanel', () => {
  it('renders the SQL dialect and grading controls', () => {
    renderPanel();

    expect(document.body.textContent).toContain('Standard SQL');
    expect(document.body.textContent).toContain('SQL Lab');
    expect(document.body.textContent).toContain('순서 조립');
    expect(document.body.textContent).toContain('Build Query');
  });

  it('submits the correct answer index when blocks are selected in order', () => {
    const onChoose = vi.fn();
    renderPanel(onChoose);

    clickButton('SELECT');
    clickButton('FROM');
    clickButton('WHERE');
    clickButton('채점');

    expect(onChoose).toHaveBeenCalledWith(0);
  });

  it('submits a wrong answer index when blocks are selected out of order', () => {
    const onChoose = vi.fn();
    renderPanel(onChoose);

    clickButton('FROM');
    clickButton('SELECT');
    clickButton('WHERE');
    clickButton('채점');

    expect(onChoose).toHaveBeenCalledWith(1);
  });
});
