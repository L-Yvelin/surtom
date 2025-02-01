import { JSX } from "react";
import { GridProps } from "./types";
import Row from "./Row/Row";
import classes from "./Grid.module.css";

function Grid({ solution, tries }: GridProps): JSX.Element {
  const size = solution.length;
  const height = 6;

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
