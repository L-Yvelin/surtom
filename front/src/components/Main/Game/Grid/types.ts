export enum LetterState {
  Miss,
  Misplaced,
  Correct,
}

export interface Letter {
  letter: string;
  state?: LetterState;
}

export type Word = Letter[];

export type Tries = Word[];

export interface CellProps {
  letter: Letter | undefined;
}

export interface RowProps {
  word: Word | null;
  size: number;
}

export function getLetterColor(letter: LetterState): string {
  switch (letter) {
    case LetterState.Correct:
      return "🟦";
    case LetterState.Misplaced:
      return "🟨";
    case LetterState.Miss:
      return "⬜";
    default:
      return "⬜";
  }
}

export function getKeyColorClassName(state: LetterState): string {
  switch (state) {
    case LetterState.Correct:
      return "correct";
    case LetterState.Misplaced:
      return "misplaced";
    case LetterState.Miss:
      return "miss";
    default:
      return "";
  }
}
