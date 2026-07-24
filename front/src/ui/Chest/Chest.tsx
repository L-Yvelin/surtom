import { JSX } from 'react';
import classes from './Chest.module.css';

interface ChestProps {
  title: React.ReactNode;
  slots: React.ReactNode[];
  rows?: number;
  cols?: number;
}

function Chest({ title, slots, rows = 6, cols = 9 }: ChestProps): JSX.Element {
  const chestStyle = { '--chest-width': 18 * cols + 14 } as React.CSSProperties;
  const gridStyle = {
    gridTemplateColumns: `repeat(${cols}, calc(16 * var(--chest-s)))`,
    gridTemplateRows: `repeat(${rows}, calc(16 * var(--chest-s)))`,
  } as React.CSSProperties;

  return (
    <div className={classes.chest} style={chestStyle}>
      <div className={classes.inner}>
        <div className={classes.top}>
          <span className={classes.title}>{title}</span>
          <div className={classes.grid} style={gridStyle}>
            {Array.from({ length: rows * cols }, (_, i) => (
              <div key={i} className={classes.slot}>
                {slots[i]}
              </div>
            ))}
          </div>
        </div>
        <div className={classes.bottom} />
      </div>
    </div>
  );
}

export default Chest;
