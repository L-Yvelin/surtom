import { Word, LetterState } from "./Message";
import useGameStore from "../stores/useGameStore";

export const gameFinished = (): boolean => {
  const { tries } = useGameStore.getState();
  return (
    tries[tries.length - 1]?.every(
      (letter) => letter.state === LetterState.Correct,
    ) || false
  );
};

export function isGuessValid(guess: string, solution: string): boolean {
  return guess.length === solution.length;
}

export function getWordColors(word: Word): Array<LetterState | undefined> {
  return word.flatMap((l) => l.state ?? undefined);
}

export function areWinningColors(colors: Array<LetterState | undefined>) {
  return colors.every((c) => c && c === LetterState.Correct);
}

export function isWinningWord(word: Word): boolean {
  return areWinningColors(getWordColors(word));
}

function getLetterMap(text: string): Record<string, number> {
  const letterMap: Record<string, number> = {};
  for (const char of text) {
    letterMap[char] = (letterMap[char] || 0) + 1;
  }
  return letterMap;
}

export function validateWord(
  guess: string[] | string,
  solution: string,
): LetterState[] {
  const solutionLettersCount = getLetterMap(solution);
  const result: LetterState[] = new Array(guess.length).fill(LetterState.Miss);

  // First pass: Identify correct letters
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === solution[i]) {
      result[i] = LetterState.Correct;
      solutionLettersCount[guess[i]]--;
    }
  }

  // Second pass: Identify misplaced letters and check unused letters
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === LetterState.Correct) continue;

    if (solution.includes(guess[i]) && solutionLettersCount[guess[i]] > 0) {
      result[i] = LetterState.Misplaced;
      solutionLettersCount[guess[i]]--;
    }
  }

  return result;
}

export function getValidatedWords(
  guesses: string[][],
  solution: string,
): Word[] {
  return guesses.map((guess) => {
    const states = validateWord(guess, solution.toUpperCase());
    return guess.map((char, i) => ({
      letter: char,
      state: states[i],
    }));
  });
}
