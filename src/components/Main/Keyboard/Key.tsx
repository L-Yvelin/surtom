import classes from "./Key.module.css";
import classNames from "classnames";
import { JSX } from "react";
import { LetterState, getKeyColorClassName } from "../Game/Grid/types";
import { getKeyClassName, getKeyStyle, getButtonKeyEvent } from "./utils";

interface KeyProps {
  keyLabel: string;
  keyColor: LetterState;
}

function Key({ keyLabel, keyColor }: KeyProps): JSX.Element {
  return (
    <button
      className={classNames(
        classes.key,
        getKeyClassName(keyLabel),
        classes[getKeyColorClassName(keyColor)]
      )}
      style={getKeyStyle(keyLabel)}
      onClick={() =>
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: getButtonKeyEvent(keyLabel) })
        )
      }
    >
      {keyLabel}
    </button>
  );
}

export default Key;