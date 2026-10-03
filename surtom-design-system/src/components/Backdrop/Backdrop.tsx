import { JSX } from 'react';
import classes from './Backdrop.module.css';

export function Backdrop(): JSX.Element {
  return <div data-backdrop className={classes.backdrop} />;
}
