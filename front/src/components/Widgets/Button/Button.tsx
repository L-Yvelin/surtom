import { JSX, ReactNode } from 'react';
import classes from './Button.module.css';
import buttonSound from '../../../assets/sounds/menu_stereo.mp3';
import classNames from 'classnames';
import Marquee from '../Marquee/Marquee';

const buttonAudio = new Audio(buttonSound);
buttonAudio.preload = 'auto';

interface ButtonProps {
  text: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  size?: 'normal' | 'square';
}

function Button({ text, onClick, className = '', size = 'normal' }: ButtonProps): JSX.Element {
  function handleOnClick(e: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(e);
    try {
      buttonAudio.currentTime = 0;
      void buttonAudio.play();
    } catch {
      return;
    }
  }

  return (
    <button className={classNames(classes.button, classes[size], className)} onClick={handleOnClick}>
      <Marquee text={text} className={classes.text} />
      {/* {text} */}
    </button>
  );
}

export default Button;
