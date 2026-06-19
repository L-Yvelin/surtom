import { JSX, ReactNode } from 'react';
import classNames from 'classnames';
import classes from './Screen.module.css';
import useToast from '../../hooks/useToast';

type ScreenVariant = 'panel' | 'dim';

interface ScreenProps {
  id: string;
  variant?: ScreenVariant;
  anchorRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  children: ReactNode;
}

function Screen({ id, variant = 'panel', anchorRef, className, children }: ScreenProps): JSX.Element {
  const { toastRef, visible } = useToast(id, anchorRef);

  return (
    <div ref={toastRef} className={classNames(classes.screen, classes[variant], className, { [classes.hidden]: !visible })}>
      {children}
    </div>
  );
}

export default Screen;
