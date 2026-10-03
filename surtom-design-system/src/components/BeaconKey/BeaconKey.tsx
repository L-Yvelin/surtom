import { JSX } from 'react';
import classNames from 'classnames';
import classes from './BeaconKey.module.css';

export type BeaconKeyVariant = 'default' | 'diamond' | 'gold' | 'inactive';

export type BeaconKeyProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BeaconKeyVariant;
  pressed?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

export function BeaconKey({ variant = 'default', pressed = false, className, ref, ...props }: BeaconKeyProps): JSX.Element {
  return (
    <button
      ref={ref}
      className={classNames(classes.key, variant !== 'default' && classes[variant], { [classes.pressed]: pressed }, className)}
      {...props}
    />
  );
}
