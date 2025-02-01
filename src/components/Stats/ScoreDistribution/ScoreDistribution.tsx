import classes from "./ScoreDistribution.module.css";
import { ScoreStats } from "../utils";
import ScoreBar from "./ScoreBar/ScoreBar";

type ScoreDistributionProps = {
  scores: ScoreStats;
  total: number;
  increaseFactor: number;
};

const ScoreDistribution: React.FC<ScoreDistributionProps> = ({
  scores,
  total,
  increaseFactor,
}) => (
  <div className={classes.scoreDistribution}>
    {[1, 2, 3, 4, 5, 6].map((index) => (
      <ScoreBar
        key={index}
        index={index}
        value={scores[index] || 0}
        total={total}
        increaseFactor={increaseFactor}
      />
    ))}
  </div>
);

export default ScoreDistribution;
