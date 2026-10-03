import { JSX } from 'react';
import { BeaconKey } from '@surtom/design-system';
import { LetterState } from '@surtom/interfaces';
import { getKeyClassName, getKeyStyle, getButtonKeyEvent, getKeyVariant } from './utils';

interface KeyProps {
  keyLabel: string;
  keyColor: LetterState | undefined;
  pressed?: boolean;
  onKeyPressed?: (e: KeyboardEvent) => void;
}

function Key({ keyLabel, keyColor, pressed, onKeyPressed }: KeyProps): JSX.Element {
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (onKeyPressed) {
      const event = new KeyboardEvent('keydown', { key: getButtonKeyEvent(keyLabel) });
      onKeyPressed(event);
    }
  };

  return (
    <BeaconKey
      variant={getKeyVariant(keyColor)}
      pressed={pressed}
      className={getKeyClassName(keyLabel)}
      style={getKeyStyle(keyLabel)}
      onPointerDown={handlePointerDown}
    >
      {keyLabel}
    </BeaconKey>
  );
}

export default Key;
