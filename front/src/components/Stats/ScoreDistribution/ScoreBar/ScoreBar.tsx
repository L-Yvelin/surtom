import classNames from 'classnames';
import classes from './ScoreBar.module.css';

type ScoreBarProps = {
  display: boolean;
  index: number;
  value: number;
  total: number;
  increaseFactor: number;
};

function ScoreBar({ display, index, value, total, increaseFactor }: ScoreBarProps) {
  const percentage = total > 0 ? (value / total) * (100 + increaseFactor) : 0;
  return (
    <div
      className={classNames(classes.scoreBar, classes[`scoreBar${index}`], {
        [classes.display]: display,
      })}
      data-nb-games={value >= 1 ? value : undefined}
      style={{ '--height': `${percentage}%` } as React.CSSProperties}
    >
      <div className={classes.number}>{index}</div>
      <div className={classes.rightFace}></div>
      <div className={classes.topFace}></div>
    </div>
  );
}

export default ScoreBar;
