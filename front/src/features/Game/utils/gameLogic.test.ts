import { LetterState, Word } from '@surtom/interfaces';
import { areWinningColors, getValidatedWords, getWordColors, isGameFinished, isWinningWord, validateWord } from './gameLogic';

const C = LetterState.Correct;
const X = LetterState.Miss;
const M = LetterState.Misplaced;

const winningTry: Word = [
  { letter: 'A', state: C },
  { letter: 'B', state: C },
  { letter: 'C', state: C },
];

const losingTry: Word = [
  { letter: 'A', state: C },
  { letter: 'B', state: M },
  { letter: 'C', state: X },
];

describe('validateWord', () => {
  test('exact match returns all Correct', () => {
    expect(validateWord('solution', 'solution')).toStrictEqual([C, C, C, C, C, C, C, C]);
  });

  test('no overlap returns all Miss', () => {
    expect(validateWord('xyz', 'abc')).toStrictEqual([X, X, X]);
  });

  test('marks misplaced letters', () => {
    expect(validateWord('abc', 'acd')).toStrictEqual([C, X, M]);
  });

  test('duplicate letter in guess only counts once when solution has one', () => {
    expect(validateWord('caaa', 'abbb')).toStrictEqual([X, M, X, X]);
  });

  test('duplicate letter where one is Correct does not flag others as Misplaced', () => {
    // solution 'abc' has one 'a'; guess 'aab' → first 'a' Correct, second 'a' Miss, 'b' Misplaced.
    expect(validateWord('aab', 'abc')).toStrictEqual([C, X, M]);
  });

  test('correct position consumed before misplaced even if it appears later in guess', () => {
    // solution 'abc' → 'aba': first 'a' Correct, 'b' Correct, last 'a' Miss (no remaining 'a').
    expect(validateWord('aba', 'abc')).toStrictEqual([C, C, X]);
  });

  test('two duplicates both swapped are both Misplaced', () => {
    // solution 'abba', guess 'baab' → all swapped, none Correct, all Misplaced.
    expect(validateWord('baab', 'abba')).toStrictEqual([M, M, M, M]);
  });

  test('is case sensitive (different cases are misses)', () => {
    expect(validateWord('ABC', 'abc')).toStrictEqual([X, X, X]);
  });

  test('accepts string[] as guess', () => {
    expect(validateWord(['a', 'b', 'c'], 'abc')).toStrictEqual([C, C, C]);
  });

  test('empty inputs return empty array', () => {
    expect(validateWord('', '')).toStrictEqual([]);
  });
});

describe('isGameFinished', () => {
  test('empty tries → false', () => {
    expect(isGameFinished([])).toBe(false);
  });

  test('5 non-winning tries → false (off-by-one boundary)', () => {
    expect(isGameFinished(Array(5).fill(losingTry))).toBe(false);
  });

  test('6 non-winning tries → true (length cap)', () => {
    expect(isGameFinished(Array(6).fill(losingTry))).toBe(true);
  });

  test('first try is winning → true', () => {
    expect(isGameFinished([winningTry])).toBe(true);
  });

  test('last try winning among many → true', () => {
    expect(isGameFinished([losingTry, losingTry, winningTry])).toBe(true);
  });
});

describe('areWinningColors', () => {
  test('all Correct → true', () => {
    expect(areWinningColors([C, C, C])).toBe(true);
  });

  test('one non-Correct → false', () => {
    expect(areWinningColors([C, M, C])).toBe(false);
    expect(areWinningColors([C, X, C])).toBe(false);
  });

  test('contains undefined → false', () => {
    expect(areWinningColors([C, undefined, C])).toBe(false);
  });

  test('empty array → true (vacuous)', () => {
    expect(areWinningColors([])).toBe(true);
  });
});

describe('isWinningWord', () => {
  test('all Correct → true', () => {
    expect(isWinningWord(winningTry)).toBe(true);
  });

  test('mixed → false', () => {
    expect(isWinningWord(losingTry)).toBe(false);
  });
});

describe('getWordColors', () => {
  test('extracts states in order', () => {
    expect(getWordColors(losingTry)).toStrictEqual([C, M, X]);
  });

  test('missing state becomes undefined', () => {
    const word: Word = [{ letter: 'A' } as Word[number], { letter: 'B', state: C }];
    expect(getWordColors(word)).toStrictEqual([undefined, C]);
  });
});

describe('getValidatedWords', () => {
  test('validates each guess independently against solution (callers pass uppercase guesses)', () => {
    const result = getValidatedWords(
      [
        ['A', 'B', 'C'],
        ['C', 'A', 'B'],
      ],
      'abc',
    );
    expect(result).toStrictEqual([
      [
        { letter: 'A', state: C },
        { letter: 'B', state: C },
        { letter: 'C', state: C },
      ],
      [
        { letter: 'C', state: M },
        { letter: 'A', state: M },
        { letter: 'B', state: M },
      ],
    ]);
  });

  test('uppercases the solution but not the guess (lowercase guess → all Miss)', () => {
    const result = getValidatedWords([['a', 'b', 'c']], 'abc');
    expect(result[0].map((l) => l.state)).toStrictEqual([X, X, X]);
  });

  test('preserves the original letter casing in the output', () => {
    const result = getValidatedWords([['A', 'B', 'C']], 'abc');
    expect(result[0].map((l) => l.letter)).toStrictEqual(['A', 'B', 'C']);
  });
});
