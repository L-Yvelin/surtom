import { CSSProperties, JSX, useEffect } from "react";
import Row from "./Row/Row";
import classes from "./Grid.module.css";
import { Tries } from "../../../../../../interfaces/Message";

interface GridProps {
  solution: string;
  tries: Tries;
  confidential?: boolean;
  className?: string;
  cellSize?: CSSProperties["width"];
}

function Grid({
  solution,
  tries,
  confidential = false,
  className,
  cellSize,
}: GridProps): JSX.Element {
  const height = 6;
  const size = solution.length;

  useEffect(() => {
    console.log(tries.length);
  }, [tries.length]);

  const rows = [
    ...tries
      .slice(0, 6)
      .map((word, trIndex) => (
        <Row
          key={trIndex}
          word={word}
          size={size}
          confidential={confidential}
          cellSize={cellSize}
        />
      )),
    ...Array.from({ length: height - tries.length }).map((_, trIndex) => (
      <Row
        key={trIndex + tries.length}
        word={null}
        size={size}
        confidential={confidential}
        cellSize={cellSize}
      />
    )),
  ];

  return (
    <div className={className}>
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
