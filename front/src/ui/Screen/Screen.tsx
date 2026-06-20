import { JSX, ReactNode } from 'react';
import classNames from 'classnames';
import classes from './Screen.module.css';
import useScreen from '../../hooks/useScreen';
import type { UIId } from '../ids';

type ScreenVariant = 'panel' | 'dim';

interface ScreenProps {
  id: UIId;
  variant?: ScreenVariant;
  anchorRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  onEscape?: () => void;
  children: ReactNode;
}

function Screen({ id, variant = 'panel', anchorRef, className, onEscape, children }: ScreenProps): JSX.Element {
  const { screenRef, visible } = useScreen(id, anchorRef, onEscape);

  return (
    <div ref={screenRef} className={classNames(classes.screen, classes[variant], className, { [classes.hidden]: !visible })}>
      {children}
    </div>
  );
}

export default Screen;
