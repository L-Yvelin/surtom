import classes from './Key.module.css';
import classNames from 'classnames';
import { JSX } from 'react';
import { LetterState } from '../../../utils/Message.ts';
import { getKeyColorClassName } from '../Chest/Grid/types.ts';
import { getKeyClassName, getKeyStyle, getButtonKeyEvent } from './utils';

interface KeyProps {
  keyLabel: string;
  keyColor: LetterState;
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
    <button
      className={classNames(classes.key, getKeyClassName(keyLabel), classes[getKeyColorClassName(keyColor)], {
        [classes.pressed]: pressed,
      })}
      style={getKeyStyle(keyLabel)}
      onPointerDown={handlePointerDown}
    >
      {keyLabel}
    </button>
  );
}

export default Key;
