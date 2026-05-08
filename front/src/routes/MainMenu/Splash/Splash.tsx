import { JSX, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import classes from './Splash.module.css';

interface SplashProps {
  className?: string;
}

function Splash({ className }: SplashProps): JSX.Element {
  const { t } = useTranslation();

  const text = useMemo(() => {
    const lines = t('splash.lines', { returnObjects: true }) as string[];
    if (!Array.isArray(lines) || lines.length === 0) return '';
    return lines[Math.floor(Math.random() * lines.length)];
  }, [t]);

  return (
    <div className={classNames(classes.splash, className)}>
      <span className={classes.text}>{text}</span>
    </div>
  );
}

export default Splash;
