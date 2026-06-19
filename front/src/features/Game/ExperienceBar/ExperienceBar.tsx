import { JSX, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './ExperienceBar.module.css';
import ExperienceBackground from '@mc/textures/gui/sprites/hud/experience_bar_background.png';
import ExperienceProgress from '@mc/textures/gui/sprites/hud/experience_bar_progress.png';
import { useLevelAnimation } from './useLevelAnimation';
import useGameStore from '../../../stores/useGameStore';
import Tooltip from '../../../ui/Tooltip/Tooltip';
import MinecraftTooltip from '../../../ui/Tooltip/MinecraftTooltip/MinecraftTooltip';
import { Anchor } from '../../../ui/Tooltip/utils';

interface ExperienceBarProps {
  xp: number;
}

// https://minecraft.wiki/w/Experience#Leveling_up
function getLevel(xp: number) {
  // levels 0-16
  if (xp <= 352) {
    return Math.sqrt(xp + 9) - 3;
  }
  // levels 17–31
  if (xp <= 1507) {
    return 81 / 10 + Math.sqrt((2 / 5) * (xp - 7839 / 40));
  }
  // levels 32+
  return 325 / 18 + Math.sqrt((2 / 9) * (xp - 54215 / 72));
}

function getRequiredXp(level: number): number {
  if (level <= 16) {
    return level * level + 6 * level;
  }
  if (level <= 31) {
    return (5 / 2) * level * level - (81 / 2) * level + 360;
  }
  return (9 / 2) * level * level - (325 / 2) * level + 2220;
}

const XPMinecraftTooltipContent = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <>
      <p>{t('experience.gainPerGame')}</p>
      <br />
      <p>{t('experience.gainWin')}</p>
      <br />
      <p>{t('experience.gainLoss')}</p>
      <br />
    </>
  );
};

function ExperienceBar({ xp }: ExperienceBarProps): JSX.Element {
  const { t } = useTranslation();
  const level = getLevel(xp);
  const hasLoaded = useGameStore((s) => s.hasLoaded);

  const [realtimeLevel, setRealtimeLevel] = useState<number>(level);
  const levelIntegerPart = Math.floor(realtimeLevel);
  const levelDecimalPart = String(Math.ceil(realtimeLevel * 100)).slice(-2);

  const currentLevelRequiredXp = getRequiredXp(levelIntegerPart);
  const nextLevelRequiredXp = getRequiredXp(levelIntegerPart + 1);
  const xpProgressToNextLevel = xp - currentLevelRequiredXp;
  const xpRequiredForNextLevel = nextLevelRequiredXp - currentLevelRequiredXp;

  useLevelAnimation(level, setRealtimeLevel, hasLoaded);

  return (
    <div className={classes.experienceBar}>
      <Tooltip
        anchor={Anchor.TOP_MIDDLE}
        tooltipContent={
          <MinecraftTooltip
            className={classes.minecraftTooltip}
            title={t('experience.progress', { current: xpProgressToNextLevel, total: xpRequiredForNextLevel })}
            children={<XPMinecraftTooltipContent />}
          />
        }
      >
        <div className={classes.content}>
          <img src={ExperienceBackground} alt={t('experience.barAlt')} className={classes.background} />
          <img
            src={ExperienceProgress}
            alt={t('experience.barAlt')}
            className={classes.progress}
            style={
              {
                '--percentage': `${levelDecimalPart}%`,
              } as React.CSSProperties
            }
          />
          <p className={classes.level}>{levelIntegerPart}</p>
        </div>
      </Tooltip>
    </div>
  );
}
export default ExperienceBar;
