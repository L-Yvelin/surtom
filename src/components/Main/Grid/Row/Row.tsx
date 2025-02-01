import { JSX } from "react";
import { RowProps } from "../types";
import Cell from "./Cell/Cell";

function Row({ word, size }: RowProps): JSX.Element {
  return (
    <tr>
      {Array.from({ length: size }).map((_, tdIndex) => (
        <Cell key={tdIndex} letter={(word && word[tdIndex]) ?? undefined} />
      ))}
    </tr>
  );
}

export default Row;
