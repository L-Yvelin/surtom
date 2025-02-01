import { LetterState } from "./types";
import rowClasses from "./Row/Cell/Cell.module.css";

export function getClassForState(state: LetterState | undefined): string {
  switch (state) {
    case LetterState.Miss:
      return rowClasses.missed;
    case LetterState.Misplaced:
      return rowClasses.misplaced;
    case LetterState.Correct:
      return rowClasses.correct;
    default:
      return rowClasses.empty;
  }
}

export function getChestLabel(length: number): string {
  if ([24, 25].includes(new Date().getDate()) && new Date().getMonth() === 11) {
    return "Coffre de noël";
  } else if (length < 7) {
    return "Coffre de l'Ender";
  } else {
    return "Grand coffre";
  }
}
