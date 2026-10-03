import { JSX, useState } from 'react';
import classes from './ExperienceBar.module.css';
import { useLevelAnimation } from './useLevelAnimation';
import { getLevel, getRequiredXp } from './experience';
import { useTexture } from '../../minecraft/resourcePackStore';
import { Tooltip } from '../Tooltip/Tooltip';
import { MinecraftTooltip } from '../Tooltip/MinecraftTooltip/MinecraftTooltip';
import { Anchor } from '../Tooltip/utils';

export interface ExperienceProgress {
  current: number;
  total: number;
}

export interface ExperienceBarProps {
  xp: number;
  animate?: boolean;
  alt?: string;
  getTooltipTitle?: (progress: ExperienceProgress) => string;
  tooltipContent?: JSX.Element | string;
}

export function ExperienceBar({ xp, animate = true, alt = '', getTooltipTitle, tooltipContent }: ExperienceBarProps): JSX.Element {
  const level = getLevel(xp);
  const background = useTexture('gui/sprites/hud/experience_bar_background.png');
  const progress = useTexture('gui/sprites/hud/experience_bar_progress.png');

  const [realtimeLevel, setRealtimeLevel] = useState<number>(level);
  const levelIntegerPart = Math.floor(realtimeLevel);
  const levelPercentage = Math.round((realtimeLevel - levelIntegerPart) * 100);

  const currentLevelRequiredXp = getRequiredXp(levelIntegerPart);
  const nextLevelRequiredXp = getRequiredXp(levelIntegerPart + 1);

  useLevelAnimation(level, setRealtimeLevel, animate);

  const bar = (
    <div className={classes.content}>
      <img src={background} alt={alt} className={classes.background} />
      <img
        src={progress}
        alt={alt}
        className={classes.progress}
        style={
          {
            '--percentage': `${levelPercentage}%`,
          } as React.CSSProperties
        }
      />
      <p className={classes.level}>{levelIntegerPart}</p>
    </div>
  );

  return (
    <div className={classes.experienceBar}>
      {getTooltipTitle && tooltipContent !== undefined ? (
        <Tooltip
          anchor={Anchor.TOP_MIDDLE}
          tooltipContent={
            <MinecraftTooltip
              className={classes.minecraftTooltip}
              title={getTooltipTitle({ current: xp - currentLevelRequiredXp, total: nextLevelRequiredXp - currentLevelRequiredXp })}
            >
              {tooltipContent}
            </MinecraftTooltip>
          }
        >
          {bar}
        </Tooltip>
      ) : (
        bar
      )}
    </div>
  );
}
