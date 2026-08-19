import { JSX, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import classes from './Splash.module.css';

interface SplashProps {
  className?: string;
}

function pickSplashLine(t: (key: string, opts?: object) => string): string {
  const lines = Object.values(t('splash', { returnObjects: true }) as Record<string, string>);
  if (lines.length === 0) return '';
  return lines[Math.floor(Math.random() * lines.length)];
}

function Splash({ className }: SplashProps): JSX.Element {
  const { t } = useTranslation();
  const [text] = useState(() => pickSplashLine(t));

  return (
    <div className={classNames(classes.splash, className)}>
      <span className={classes.text}>{text}</span>
    </div>
  );
}

export default Splash;
