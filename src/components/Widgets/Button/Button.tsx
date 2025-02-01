import { JSX } from "react";
import classes from "./Button.module.css";

interface ButtonProps {
  text: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function Button({ text, onClick }: ButtonProps): JSX.Element {
  return (
    <button className={classes.button} onClick={(e) => onClick && onClick(e)}>
      <span className={classes.text}>{text}</span>
    </button>
  );
}

export default Button;
