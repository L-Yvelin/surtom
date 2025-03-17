import { JSX, ReactNode } from "react";
import classes from "./Button.module.css";
import buttonSound from "../../../assets/sounds/menu_stereo.mp3";
import classNames from "classnames";
import Marquee from "../Marquee/Marquee";

interface ButtonProps {
  text: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  size?: "normal" | "square";
}

function Button({
  text,
  onClick,
  className = "",
  size = "normal",
}: ButtonProps): JSX.Element {
  function handleOnClick(e: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(e);
    try {
      new Audio(buttonSound).play();
    } catch {
      return;
    }
  }

  return (
    <button
      className={classNames(classes.button, classes[size], className)}
      onClick={handleOnClick}
    >
      <Marquee text={text} className={classes.text} />
    </button>
  );
}

export default Button;
