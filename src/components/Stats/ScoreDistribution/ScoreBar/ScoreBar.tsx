import classNames from "classnames";
import { useState, useEffect } from "react";
import classes from "./ScoreBar.module.css";

type ScoreBarProps = {
  index: number;
  value: number;
  total: number;
  increaseFactor: number;
};

const ScoreBar: React.FC<ScoreBarProps> = ({
  index,
  value,
  total,
  increaseFactor,
}) => {
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    setInitialized(true);
  }, []);

  const percentage = total > 0 ? (value / total) * (100 + increaseFactor) : 0;
  return (
    <div
      className={classNames(classes.scoreBar, classes[`scoreBar${index}`], {
        [classes.initialState]: !initialized,
      })}
      data-nb-games={value >= 1 ? value : undefined}
      style={{ "--height": `${percentage}%` } as React.CSSProperties}
    >
      <div className={classes.number}>{index}</div>
      <div className={classes.rightFace}></div>
      <div className={classes.topFace}></div>
    </div>
  );
};

export default ScoreBar;