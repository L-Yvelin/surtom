import { CSSProperties } from "react";
import { Letter, LetterState, Word } from "@surtom/interfaces";

export interface CellProps {
  letter: Letter | undefined;
  confidential?: boolean;
  cellSize?: CSSProperties["width"];
}

export interface RowProps {
  word: Word | null;
  size: number;
  confidential?: boolean;
  cellSize?: CSSProperties["width"];
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
