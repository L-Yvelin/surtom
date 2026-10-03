import { JSX } from 'react';
import classNames from 'classnames';
import classes from './BlockTile.module.css';

export type BlockTileMaterial = 'diamond' | 'gold' | 'stone';

export interface BlockTileProps extends React.HTMLAttributes<HTMLDivElement> {
  material?: BlockTileMaterial;
  ref?: React.Ref<HTMLDivElement>;
}

export function BlockTile({ material, className, ref, ...props }: BlockTileProps): JSX.Element {
  return <div ref={ref} className={classNames(classes.tile, material && classes[material], className)} {...props} />;
}
