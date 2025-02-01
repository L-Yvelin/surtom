import { JSX, useState } from "react";
import classes from "./ExperienceBar.module.css";
import ExperienceBackground from "../../../assets/images/ui/experience_bar_background.png";
import ExperienceProgress from "../../../assets/images/ui/experience_bar_progress.png";
import { useLevelAnimation } from "./useLevelAnimation";

interface ExperienceBarProps {
  level: number;
}

function ExperienceBar({ level }: ExperienceBarProps): JSX.Element {
  const [realtimeLevel, setRealtimeLevel] = useState<number>(level);
  const integerPart = Math.floor(realtimeLevel);
  const decimalPart = String(Math.ceil(realtimeLevel * 100)).slice(-2);

  useLevelAnimation(level, setRealtimeLevel);

  return (
    <div className={classes.experienceBar}>
      <div className={classes.content}>
        <img
          src={ExperienceBackground}
          alt="experience bar container"
          className={classes.background}
        />
        <img
          src={ExperienceProgress}
          alt="experience bar container"
          className={classes.progress}
          style={
            {
              "--percentage": `${decimalPart}%`,
            } as React.CSSProperties
          }
        />
        <p className={classes.level}>{integerPart}</p>
      </div>
    </div>
  );
}

export default ExperienceBar;
