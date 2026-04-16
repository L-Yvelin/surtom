import { JSX, useState } from 'react';
import classes from './ExperienceBar.module.css';
import ExperienceBackground from '../../../assets/images/ui/experience_bar_background.png';
import ExperienceProgress from '../../../assets/images/ui/experience_bar_progress.png';
import { useLevelAnimation } from './useLevelAnimation';

interface ExperienceBarProps {
  xp: number;
}

function ExperienceBar({ xp }: ExperienceBarProps): JSX.Element {
  const level = getLevel(xp);

  const [realtimeLevel, setRealtimeLevel] = useState<number>(level);
  const integerPart = Math.floor(realtimeLevel);
  const decimalPart = String(Math.ceil(realtimeLevel * 100)).slice(-2);

  useLevelAnimation(level, setRealtimeLevel);

  function getLevel(xp: number) {
    if (xp <= 352) {
      return Math.sqrt(xp + 9) - 3;
    }
    if (xp <= 1507) {
      return 81 / 10 + Math.sqrt((2 / 5) * (xp - 7839 / 40));
    }
    return 325 / 18 + Math.sqrt((2 / 9) * (xp - 54215 / 72));
  }

  return (
    <div className={classes.experienceBar}>
      <div className={classes.content}>
        <img src={ExperienceBackground} alt="experience bar container" className={classes.background} />
        <img
          src={ExperienceProgress}
          alt="experience bar container"
          className={classes.progress}
          style={
            {
              '--percentage': `${decimalPart}%`,
            } as React.CSSProperties
          }
        />
        <p className={classes.level}>{integerPart}</p>
      </div>
    </div>
  );
}

export default ExperienceBar;
