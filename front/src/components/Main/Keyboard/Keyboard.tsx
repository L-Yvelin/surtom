import React, { JSX, useEffect, useState, useMemo } from "react";
import classNames from "classnames";
import classes from "./Keyboard.module.css";
import useGameStore from "../../../stores/useGameStore";
import { getKeyboardClass, getKeyboardLayout, KeyboardLayouts } from "./utils";
import { LetterState } from "../Game/Grid/types";
import Key from "./Key";

interface KeyboardProps {
  layout: KeyboardLayouts;
}

const Keyboard = React.memo(function Keyboard({ layout }: KeyboardProps): JSX.Element {
  const { tries } = useGameStore();
  const [keys, setKeys] = useState(() => getKeyboardLayout(layout));
  const [keyboardClass, setKeyboardClass] = useState(() =>
    getKeyboardClass(layout)
  );

  useEffect(() => {
    setKeys(getKeyboardLayout(layout));
    setKeyboardClass(getKeyboardClass(layout));
  }, [layout]);

  const keyColors = useMemo(() => 
    tries.reduce((acc, t) => {
      t.forEach(({ letter, state }) => {
        if (state !== undefined && (!acc[letter] || acc[letter] < state)) {
          acc[letter] = state;
        }
      });
      return acc;
    }, {} as Record<string, LetterState>)
  , [tries]);

  return (
    <div className={classes.keyboardWrapper}>
      <div className={classNames(classes.keyboard, keyboardClass)}>
        {keys.flat().map((key, index) => (
          <Key key={index} keyLabel={key} keyColor={keyColors[key]} />
        ))}
      </div>
    </div>
  );
});

export default Keyboard;
