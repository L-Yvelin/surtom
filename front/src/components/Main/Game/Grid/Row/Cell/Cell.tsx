import { JSX } from "react";
import { CellProps } from "../../types";
import { getClassForState } from "../../utils";
import classes from "./Cell.module.css";
import classNames from "classnames";

function Cell({ letter, confidential, cellSize }: CellProps): JSX.Element {
  const letterStateClass = letter
    ? getClassForState(letter.state)
    : classes.empty;
  return (
    <td className={classes.td}>
      <div
        className={classNames(classes.cell, letterStateClass, {
          [classes.noBorder]: cellSize,
        })}
        style={{ width: cellSize, height: cellSize, fontSize: cellSize }}
      >
        {letter && !confidential ? letter.letter : ""}
      </div>
    </td>
  );
}

export default Cell;
