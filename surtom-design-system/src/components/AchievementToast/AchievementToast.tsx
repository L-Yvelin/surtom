import { JSX } from 'react';
import classes from './AchievementToast.module.css';

export interface AchievementToastProps {
  title: string;
  description: string;
  icon: string;
  iconAlt?: string;
}

export function AchievementToast({ title, description, icon, iconAlt = '' }: AchievementToastProps): JSX.Element {
  return (
    <div className={classes.achievement}>
      <img src={icon} alt={iconAlt} className={classes.icon} />
      <div className={classes.content}>
        <div className={classes.title}>{title}</div>
        <div className={classes.description}>{description}</div>
      </div>
    </div>
  );
}
