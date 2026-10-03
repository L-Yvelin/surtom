import { JSX, ReactNode } from 'react';
import { Screen as DesignSystemScreen, type ScreenVariant } from '@surtom/design-system';
import useScreen from '../../hooks/useScreen';
import type { UIId } from '../ids';

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
    <DesignSystemScreen ref={screenRef} visible={visible} variant={variant} className={className}>
      {children}
    </DesignSystemScreen>
  );
}

export default Screen;
