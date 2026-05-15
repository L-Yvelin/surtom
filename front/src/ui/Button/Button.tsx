import { JSX, ReactNode } from 'react';
import classes from './Button.module.css';
import buttonSound from '../../assets/sounds/menu_stereo.mp3';
import classNames from 'classnames';
import Marquee from '../Marquee/Marquee';
import { useSettingsStore } from '../../stores/useSettingsStore';

const buttonAudio: HTMLAudioElement | null = typeof Audio !== 'undefined' ? new Audio(buttonSound) : null;
if (buttonAudio) buttonAudio.preload = 'auto';

interface ButtonProps {
  text: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  size?: 'normal' | 'square';
  disabled?: boolean;
}

function Button({ text, onClick, className = '', size = 'normal', disabled = false }: ButtonProps): JSX.Element {
  const sound = useSettingsStore((s) => s.sound);

  function handleOnClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    onClick?.(e);
    try {
      if (!sound || !buttonAudio) return;

      buttonAudio.currentTime = 0;
      void buttonAudio.play();
    } catch {
      return;
    }
  }

  return (
    <button
      className={classNames(classes.button, classes[size], className, { [classes.disabled]: disabled })}
      onClick={handleOnClick}
      disabled={disabled}
    >
      <Marquee text={text} className={classes.text} />
    </button>
  );
}

export default Button;
