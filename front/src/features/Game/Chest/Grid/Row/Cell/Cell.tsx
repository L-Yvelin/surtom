import classNames from 'classnames';
import { JSX } from 'react';
import { CellProps } from '../../types';
import { getClassForState } from '../../utils';
import classes from './Cell.module.css';

function Cell({ letter, confidential, cellSize, as: Tag = 'td' }: CellProps): JSX.Element {
  const letterStateClass = letter ? getClassForState(letter.state) : '';
  const inner = (
    <div className={classNames(classes.cell, letterStateClass)} style={{ width: cellSize, height: cellSize, fontSize: cellSize }}>
      {letter && !confidential ? letter.letter : ''}
    </div>
  );
  if (Tag === 'div') return inner;
  return <td className={classes.td}>{inner}</td>;
}

export default Cell;
