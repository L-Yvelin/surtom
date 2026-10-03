import { CSSProperties } from 'react';
import { Letter, LetterState, Word } from '@surtom/interfaces';

export interface CellProps {
  letter: Letter | undefined;
  confidential?: boolean;
  cellSize?: CSSProperties['width'];
  as?: 'td' | 'div';
}

export interface RowProps {
  word: Word | null;
  size: number;
  confidential?: boolean;
  cellSize?: CSSProperties['width'];
}

export function getLetterColor(letter: LetterState): string {
  switch (letter) {
    case LetterState.Correct:
      return '🟦';
    case LetterState.Misplaced:
      return '🟨';
    case LetterState.Miss:
      return '⬜';
    default:
      return '⬜';
  }
}
