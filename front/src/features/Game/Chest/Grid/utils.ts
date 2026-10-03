import type { BlockTileMaterial } from '@surtom/design-system';
import { LetterState } from '@surtom/interfaces';

export function getMaterialForState(state: LetterState | undefined): BlockTileMaterial | undefined {
  switch (state) {
    case LetterState.Miss:
      return 'stone';
    case LetterState.Misplaced:
      return 'gold';
    case LetterState.Correct:
      return 'diamond';
    default:
      return undefined;
  }
}
