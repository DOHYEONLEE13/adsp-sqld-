import { useMemo } from 'react';

export interface DisplayChoice {
  displayIndex: number;
  originalIndex: number;
  label: string;
  text: string;
}

type RandomSource = () => number;

export function choiceLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

export function shuffledChoiceIndexes(
  length: number,
  random: RandomSource = Math.random,
): number[] {
  const indexes = Array.from({ length }, (_, index) => index);
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }

  const keptOriginalOrder = indexes.every(
    (originalIndex, index) => originalIndex === index,
  );
  if (length > 1 && keptOriginalOrder) {
    indexes.push(indexes.shift()!);
  }

  return indexes;
}

export function buildDisplayChoices(
  choices: string[],
  random: RandomSource = Math.random,
): DisplayChoice[] {
  return shuffledChoiceIndexes(choices.length, random).map(
    (originalIndex, displayIndex) => ({
      displayIndex,
      originalIndex,
      label: choiceLabel(displayIndex),
      text: choices[originalIndex],
    }),
  );
}

export function useShuffledChoices(
  choices: string[],
  shuffleKey?: string | number,
): DisplayChoice[] {
  const signature = `${shuffleKey ?? 'choices'}::${choices.join('\u001f')}`;
  return useMemo(() => buildDisplayChoices(choices), [signature]);
}
