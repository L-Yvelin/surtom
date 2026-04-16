import React, { JSX } from 'react';
import classes from './Stats.module.css';
import classNames from 'classnames';
import useClickOutside from '../../hooks/useClickOutside';
import ScoreDistribution from './ScoreDistribution/ScoreDistribution';
import { calculateStats } from './utils';
import Button from '../Widgets/Button/Button';
import useGameStore from '../../stores/useGameStore';
import useUIStore from '../../stores/useUIStore';

interface StatsProps {
  statsButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function Stats({ statsButtonRef }: StatsProps): JSX.Element {
  const statsRef = React.useRef<HTMLDivElement>(null);
  const { scores } = useGameStore();
  const { setVisibility, showStats: display } = useUIStore();
  const { total, increaseFactor } = calculateStats(scores);

  useClickOutside(statsRef, () => setVisibility('showStats', false), [statsButtonRef]);

  return (
    <div className={classNames(classes.stats, { [classes.hidden]: !display })} ref={statsRef}>
      <div className={classes.title}>{total} parties</div>
      <div className={classes.subtitle}>Répartition des scores</div>
      <ScoreDistribution display={display} scores={scores} total={total} increaseFactor={increaseFactor} />
      <Button text={'Fermer'} onClick={() => setVisibility('showStats', false)} />
    </div>
  );
}

export default Stats;
