import { JSX } from 'react';
import classNames from 'classnames';
import classes from './BlockBar.module.css';

export type BlockBarMaterial = 'dirt' | 'diamond' | 'gold' | 'stone' | 'sand' | 'gravel';

export interface BlockBarProps {
  material?: BlockBarMaterial;
  heightPercent: number;
  revealed: boolean;
  label?: React.ReactNode;
  badge?: number;
  className?: string;
}

export function BlockBar({ material = 'dirt', heightPercent, revealed, label, badge, className }: BlockBarProps): JSX.Element {
  return (
    <div
      className={classNames(classes.bar, classes[material], { [classes.revealed]: revealed }, className)}
      data-badge={badge !== undefined && badge >= 1 ? badge : undefined}
      style={{ '--height': `${heightPercent}%` } as React.CSSProperties}
    >
      <div className={classes.label}>{label}</div>
      <div className={classes.rightFace}></div>
      <div className={classes.topFace}></div>
    </div>
  );
}
