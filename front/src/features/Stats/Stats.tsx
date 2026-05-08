import React, { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './Stats.module.css';
import ScoreDistribution from './ScoreDistribution/ScoreDistribution';
import { calculateStats } from './utils/scoreCalculation';
import Button from '../../ui/Button/Button';
import MinecraftToast from '../../ui/MinecraftToast/MinecraftToast';
import useGameStore from '../../stores/useGameStore';
import useUIStore, { useVisibility } from '../../stores/useUIStore';

interface StatsProps {
  statsButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function Stats({ statsButtonRef }: StatsProps): JSX.Element {
  const { t } = useTranslation();
  const scores = useGameStore((s) => s.scores);
  const setVisibility = useUIStore((s) => s.setVisibility);
  const display = useVisibility('stats');
  const { total, increaseFactor } = calculateStats(scores);

  return (
    <MinecraftToast id="stats" toastButtonRef={statsButtonRef} className={classes.stats}>
      <div className={classes.title}>{t('stats.gamesCount', { count: total })}</div>
      <div className={classes.subtitle}>{t('stats.scoreDistribution')}</div>
      <ScoreDistribution display={display} scores={scores} total={total} increaseFactor={increaseFactor} />
      <Button text={t('common.close')} onClick={() => setVisibility('stats', false)} />
    </MinecraftToast>
  );
}

export default Stats;
