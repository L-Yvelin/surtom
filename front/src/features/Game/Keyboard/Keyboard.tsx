import { JSX, useEffect, useState } from 'react';
import classNames from 'classnames';
import classes from './Keyboard.module.css';
import { useGameStore } from '../../../stores/useGameStore';
import { getKeyboardClass, getKeyboardLayout, KeyboardLayouts } from './utils';
import { LetterState } from '@surtom/interfaces';
import Key from './Key';
import useKeyPress from '../hooks/useKeyPress';

interface KeyboardProps {
  layout: KeyboardLayouts;
}

function Keyboard({ layout }: KeyboardProps): JSX.Element {
  const tries = useGameStore((s) => s.tries);
  const [keys, setKeys] = useState(() => getKeyboardLayout(layout));
  const [keyboardClass, setKeyboardClass] = useState(() => getKeyboardClass(layout));
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const showProgression = useGameStore((s) => s.showProgression);
  const { handleKeyPress } = useKeyPress();

  useEffect(() => {
    const controller = new AbortController();

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const displayKey = key === 'enter' ? '↲' : key === 'backspace' ? '⌫' : key;
      setPressedKey(displayKey);
    };

    const handleKeyUp = () => {
      setPressedKey(null);
    };

    window.addEventListener('keydown', handleKeyDown, { signal: controller.signal });
    window.addEventListener('keyup', handleKeyUp, { signal: controller.signal });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    setKeys(getKeyboardLayout(layout));
    setKeyboardClass(getKeyboardClass(layout));
  }, [layout]);

  const keyColors = tries.reduce(
    (acc, t) => {
      t.forEach(({ letter, state }) => {
        if (state !== undefined && (!acc[letter] || acc[letter] < state)) {
          acc[letter] = state;
        }
      });
      return acc;
    },
    {} as Record<string, LetterState>,
  );

  return (
    <div className={classes.keyboardWrapper}>
      <div className={classNames(classes.keyboard, keyboardClass)}>
        {keys.flat().map((key, index) => (
          <Key
            key={index}
            keyLabel={key}
            keyColor={showProgression ? keyColors[key.toUpperCase()] : undefined}
            pressed={pressedKey === key}
            onKeyPressed={(e) => handleKeyPress(e, 'down')}
          />
        ))}
      </div>
    </div>
  );
}

export default Keyboard;
