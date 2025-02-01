import { JSX } from "react";
import classes from "./Button.module.css";
import buttonSound from "../../../assets/sounds/menu_stereo.mp3";

interface ButtonProps {
  text: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function Button({ text, onClick }: ButtonProps): JSX.Element {
  function handleOnClick(e: React.MouseEvent<HTMLButtonElement>) {
    try {
      new Audio(buttonSound).play();
    } catch {}
    onClick && onClick(e);
  }

  return (
    <button className={classes.button} onClick={handleOnClick}>
      <span className={classes.text}>{text}</span>
    </button>
  );
}

export default Button;
