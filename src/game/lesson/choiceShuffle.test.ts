import { describe, expect, it } from 'vitest';
import { buildDisplayChoices, shuffledChoiceIndexes } from './choiceShuffle';

describe('choice shuffle', () => {
  it('keeps original indexes so grading can use the source answerIndex', () => {
    const choices = ['correct', 'wrong 1', 'wrong 2', 'wrong 3'];
    const displayChoices = buildDisplayChoices(choices, () => 0.99);

    expect(displayChoices).toHaveLength(choices.length);
    expect(displayChoices.map((choice) => choice.originalIndex).sort()).toEqual([
      0, 1, 2, 3,
    ]);
    for (const displayChoice of displayChoices) {
      expect(displayChoice.text).toBe(choices[displayChoice.originalIndex]);
    }
  });

  it('does not leave every choice in the original position', () => {
    expect(shuffledChoiceIndexes(4, () => 0)).toEqual([1, 2, 3, 0]);
  });

  it('labels choices by visible order, not original answer order', () => {
    const displayChoices = buildDisplayChoices(['A0', 'A1', 'A2'], () => 0);

    expect(displayChoices.map((choice) => choice.label)).toEqual(['A', 'B', 'C']);
    expect(displayChoices.map((choice) => choice.originalIndex)).toEqual([1, 2, 0]);
  });
});
