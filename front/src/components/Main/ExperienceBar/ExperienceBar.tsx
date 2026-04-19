import { JSX, useState } from 'react';
import classes from './ExperienceBar.module.css';
import ExperienceBackground from '../../../assets/images/ui/experience_bar_background.png';
import ExperienceProgress from '../../../assets/images/ui/experience_bar_progress.png';
import { useLevelAnimation } from './useLevelAnimation';
import useGameStore from '../../../stores/useGameStore';
import Tooltip from '../../Tooltip/Tooltip';
import MinecraftTooltip from '../../Tooltip/MinecraftTooltip/MinecraftTooltip';
import { Anchor } from '../../Tooltip/utils';

interface ExperienceBarProps {
  xp: number;
}

function ExperienceBar({ xp }: ExperienceBarProps): JSX.Element {
  const level = getLevel(xp);
  const hasLoaded = useGameStore((s) => s.hasLoaded);

  const [realtimeLevel, setRealtimeLevel] = useState<number>(level);
  const integerPart = Math.floor(realtimeLevel);
  const decimalPart = String(Math.ceil(realtimeLevel * 100)).slice(-2);

  useLevelAnimation(level, setRealtimeLevel, hasLoaded);

  function getLevel(xp: number) {
    if (xp <= 352) {
      return Math.sqrt(xp + 9) - 3;
    }
    if (xp <= 1507) {
      return 81 / 10 + Math.sqrt((2 / 5) * (xp - 7839 / 40));
    }
    return 325 / 18 + Math.sqrt((2 / 9) * (xp - 54215 / 72));
  }

  const XPMinecraftTooltipContent = (): JSX.Element => {
    return (
      <>
        <p>Gain par partie:</p>
        <br />
        <p>
          Victoire: 35 - (tentatives - 1)<sup>2</sup>
        </p>
        <br />
        <p>Defaite: 5</p>
        <br />
      </>
    );
  };

  return (
    <div className={classes.experienceBar}>
      <Tooltip
        anchor={Anchor.TOP_MIDDLE}
        tooltipContent={
          <MinecraftTooltip className={classes.minecraftTooltip} title={"CALCUL D'EXPÉRIENCE"} children={<XPMinecraftTooltipContent />} />
        }
      >
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
      </Tooltip>
    </div>
  );
}
export default ExperienceBar;
