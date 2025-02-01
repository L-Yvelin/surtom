import React, { JSX } from "react";
import classes from "./Stats.module.css";
import classNames from "classnames";
import useClickOutside from "../../hooks/useClickOutside";
import ScoreDistribution from "./ScoreDistribution/ScoreDistribution";
import { ScoreStats, calculateStats } from "./utils";
import Button from "../Widgets/Button/Button";

interface StatsProps {
  scores: ScoreStats;
  display: boolean;
  setShowStats: (value: (prev: boolean) => boolean) => void;
  statsButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function Stats({
  scores,
  display,
  setShowStats,
  statsButtonRef,
}: StatsProps): JSX.Element {
  const statsRef = React.useRef<HTMLDivElement>(null);
  const { total, increaseFactor } = calculateStats(scores);

  useClickOutside(statsRef, () => setShowStats(() => false), [statsButtonRef]);

  return !display ? (
    <></>
  ) : (
    <div
      className={classNames(classes.stats, { [classes.hidden]: !display })}
      ref={statsRef}
    >
      <div className={classes.title}>{total} parties</div>
      <div className={classes.subtitle}>Répartition des scores</div>
      <ScoreDistribution
        scores={scores}
        total={total}
        increaseFactor={increaseFactor}
      />
      <Button text={"Fermer"} onClick={() => setShowStats(() => false)} />
    </div>
  );
}

export default Stats;
