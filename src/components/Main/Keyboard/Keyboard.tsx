import classes from "./Keyboard.module.css";
import { JSX, useEffect, useState } from "react";
import classNames from "classnames";
import {
  getKeyboardClass,
  getKeyboardLayout,
  getKeyClassName,
  getKeyStyle,
  KeyboardLayouts,
} from "./utils";

interface KeyboardProps {
  layout: KeyboardLayouts;
}

function Keyboard({ layout }: KeyboardProps): JSX.Element {
  const [keys, setKeys] = useState<string[][]>(getKeyboardLayout(layout));
  const [keyboardClass, setKeyboardClass] = useState<string>(classes.qwerty);

  useEffect(() => {
    setKeys(getKeyboardLayout(layout));
    setKeyboardClass(getKeyboardClass(layout));
  }, [layout]);

  return (
    <div className={classes.keyboardWrapper}>
      <div className={classNames(classes.keyboard, keyboardClass)}>
        {keys.flat().map((key, index) => (
          <button
            key={index}
            className={classNames(classes.key, getKeyClassName(key))}
            style={getKeyStyle(key)}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Keyboard;
