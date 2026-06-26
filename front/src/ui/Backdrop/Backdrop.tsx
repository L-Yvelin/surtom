import { JSX } from 'react';
import classes from './Backdrop.module.css';

function Backdrop(): JSX.Element {
  return <div data-backdrop className={classes.backdrop} />;
}

export default Backdrop;
