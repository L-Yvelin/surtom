import { JSX } from 'react';
import { BlockTile } from '@surtom/design-system';
import { CellProps } from '../../types';
import { getMaterialForState } from '../../utils';
import classes from './Cell.module.css';

function Cell({ letter, confidential, cellSize, as: Tag = 'td' }: CellProps): JSX.Element {
  const inner = (
    <BlockTile
      material={letter ? getMaterialForState(letter.state) : undefined}
      className={classes.cell}
      style={{ width: cellSize, height: cellSize, fontSize: cellSize }}
    >
      {letter && !confidential ? letter.letter : ''}
    </BlockTile>
  );
  if (Tag === 'div') return inner;
  return <td className={classes.td}>{inner}</td>;
}

export default Cell;
