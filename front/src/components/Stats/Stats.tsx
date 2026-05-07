import React, { JSX } from 'react';
import classes from './Stats.module.css';
import ScoreDistribution from './ScoreDistribution/ScoreDistribution';
import { calculateStats } from './utils';
import Button from '../Widgets/Button/Button';
import MinecraftToast from '../MinecraftToast/MinecraftToast';
import useGameStore from '../../stores/useGameStore';
import useUIStore, { useVisibility } from '../../stores/useUIStore';

interface StatsProps {
  statsButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function Stats({ statsButtonRef }: StatsProps): JSX.Element {
  const scores = useGameStore((s) => s.scores);
  const setVisibility = useUIStore((s) => s.setVisibility);
  const display = useVisibility('stats');
  const { total, increaseFactor } = calculateStats(scores);

  return (
    <MinecraftToast id="stats" toastButtonRef={statsButtonRef} className={classes.stats}>
      <div className={classes.title}>{total} parties</div>
      <div className={classes.subtitle}>Répartition des scores</div>
      <ScoreDistribution display={display} scores={scores} total={total} increaseFactor={increaseFactor} />
      <Button text={'Fermer'} onClick={() => setVisibility('stats', false)} />
    </MinecraftToast>
  );
}

export default Stats;
