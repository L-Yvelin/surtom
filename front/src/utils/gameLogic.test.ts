import { LetterState } from '../components/Main/Game/Grid/types';
import { areWinningColors, validateWord } from './gameLogic';

describe('validateWord', () => {
  test('should validate a winning answer', () => {
    const solution = 'solution';
    const guess = 'solution';

    const result = validateWord(guess, solution);

    expect(areWinningColors(result)).toBe(true);
  });

  test('should find misplaced letter', () => {
    const solution = 'acd';
    const guess = 'abc';
    const expected = [LetterState.Correct, LetterState.Miss, LetterState.Misplaced]

    const result = validateWord(guess, solution);

    expect(result).toStrictEqual(expected);
  });

  test('should find only one misplaced letter when multiple occuring in guess', () => {
    const solution = 'abbb';
    const guess = 'caaa';
    const expected = [LetterState.Miss, LetterState.Misplaced, LetterState.Miss, LetterState.Miss]

    const result = validateWord(guess, solution);

    expect(result).toStrictEqual(expected);
  });
});
