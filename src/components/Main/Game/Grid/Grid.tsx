import { JSX } from "react";
import Row from "./Row/Row";
import classes from "./Grid.module.css";
import { Tries } from "./types";

interface GridProps {
  solution: string;
  tries: Tries;
}

function Grid({ solution, tries }: GridProps): JSX.Element {
  const height = 6;
  const size = solution.length;

  const rows = [
    ...tries.map((word, trIndex) => (
      <Row key={trIndex} word={word} size={size} />
    )),
    ...Array.from({ length: height - tries.length }).map((_, trIndex) => (
      <Row key={trIndex + tries.length} word={null} size={size} />
    )),
  ];

  return (
    <div>
      <table
        className={classes.grille}
        style={{ "--squares": `${size}` } as React.CSSProperties}
      >
        <tbody className={classes.tbody}>{rows}</tbody>
      </table>
    </div>
  );
}

export default Grid;
