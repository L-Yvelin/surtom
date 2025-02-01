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

export interface GridProps {
  solution: string;
  tries: Tries;
}

export interface CellProps {
  letter: Letter | undefined;
}

export interface RowProps {
  word: Word | null;
  size: number;
}
