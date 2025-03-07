import { JSX } from "react";
import classes from "./Achievement.module.css";
import { AchievementIcon } from "./utils";

export interface AchievementProps {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export class Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;

  constructor(
    title: string,
    description: string,
    icon: string = AchievementIcon.BOOK
  ) {
    this.id = Math.random().toString(36).substring(2, 11);
    this.title = title;
    this.description = description;
    this.icon = icon;
  }
}

function AchievementCard({
  title,
  description,
  icon = AchievementIcon.BOOK,
}: AchievementProps): JSX.Element {
  return (
    <div className={classes.achievement}>
      <img src={icon} alt="Achievement icon" className={classes.icon} />
      <div className={classes.content}>
        <div className={classes.title}>{title}</div>
        <div className={classes.description}>{description}</div>
      </div>
    </div>
  );
}

export default AchievementCard;
