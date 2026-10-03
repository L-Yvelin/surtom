import { Children, JSX } from 'react';
import classNames from 'classnames';
import { PlayerListRow } from './PlayerListRow';
import classes from './PlayerList.module.css';

export type PlayerListProps = React.HTMLAttributes<HTMLDivElement> & {
  minRows?: number;
  ref?: React.Ref<HTMLDivElement>;
};

export function PlayerList({ className, minRows = 0, children, ref, ...rest }: PlayerListProps): JSX.Element {
  const items = Children.toArray(children);
  const fillerCount = Math.max(0, minRows - items.length);

  return (
    <div {...rest} ref={ref} className={classNames(classes.list, className)}>
      {items}
      {Array.from({ length: fillerCount }, (_, index) => (
        <PlayerListRow key={`filler-${index}`} />
      ))}
    </div>
  );
}
