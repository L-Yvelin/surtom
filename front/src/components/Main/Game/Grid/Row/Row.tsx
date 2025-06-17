import { JSX } from "react";
import { RowProps } from "../types";
import Cell from "./Cell/Cell";

function Row({ word, size, confidential, cellSize }: RowProps): JSX.Element {
  return (
    <tr>
      {Array.from({ length: size }).map((_, tdIndex) => (
        <Cell
          key={tdIndex}
          letter={(word && word[tdIndex]) ?? undefined}
          confidential={confidential}
          cellSize={cellSize}
        />
      ))}
    </tr>
  );
}

export default Row;
