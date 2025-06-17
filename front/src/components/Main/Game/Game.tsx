import { JSX } from "react";
import classes from "./Game.module.css";
import Grid from "./Grid/Grid";
import useGameStore from "../../../stores/useGameStore";

function Game(): JSX.Element {
  const { solution, tries, letters } = useGameStore();
  const shownSolution = solution ?? "      ";

  function getChestLabel(length: number): string {
    if (
      [24, 25].includes(new Date().getDate()) &&
      new Date().getMonth() === 11
    ) {
      return "Coffre de noël";
    } else if (length < 7) {
      return "Coffre de l'Ender";
    } else {
      return "Grand coffre";
    }
  }

  return (
    <div className={classes.coffre}>
      <div className={classes.coffreUi}>
        <p className={classes.chestLabel}>
          {getChestLabel(shownSolution.length)}
        </p>
        <Grid
          solution={shownSolution}
          tries={[...tries, letters]}
        />
      </div>
    </div>
  );
}

export default Game;
