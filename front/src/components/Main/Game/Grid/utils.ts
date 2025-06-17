import { LetterState } from "../../../../../../interfaces/Message";
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
