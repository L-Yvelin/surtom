import { JSX, ReactNode } from 'react';
import classNames from 'classnames';
import classes from './Screen.module.css';

export type ScreenVariant = 'panel' | 'dim';

export interface ScreenProps {
  visible?: boolean;
  variant?: ScreenVariant;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
  children: ReactNode;
}

export function Screen({ visible = true, variant = 'panel', className, ref, children }: ScreenProps): JSX.Element {
  return (
    <div ref={ref} className={classNames(classes.screen, classes[variant], className, { [classes.hidden]: !visible })}>
      {children}
    </div>
  );
}
