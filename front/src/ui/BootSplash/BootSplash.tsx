import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './BootSplash.module.css';
import classNames from 'classnames';

interface LoadingProps {
  display: boolean;
}

function Loading({ display }: LoadingProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className={classNames(classes.loading, { [classes.hidden]: !display })}>
      <div className={classes.brand}>
        <img src="/assets/surtom_studios.png" alt={t('boot.logoAlt')} className={classes.logo} />
      </div>
      <div className={classes.loadingBar}>
        <div className={classes.loadingProgress}></div>
      </div>
    </div>
  );
}

export default Loading;
