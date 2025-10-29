import { JSX } from 'react';
import classes from './Loading.module.css';
import classNames from 'classnames';

interface LoadingProps {
  display: boolean;
}

function Loading({ display }: LoadingProps): JSX.Element {
  return (
    <div className={classNames(classes.loading, { [classes.hidden]: !display })}>
      <div className={classes.brand}>
        <img src="/assets/mojang.png" alt="Mojang logo" className={classes.logo} />
      </div>
      <div className={classes.loadingBar}>
        <div className={classes.loadingProgress}></div>
      </div>
    </div>
  );
}

export default Loading;
