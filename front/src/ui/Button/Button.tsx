import { JSX, ReactNode } from 'react';
import classes from './Button.module.css';
import buttonSound from '../../assets/sounds/menu_stereo.mp3';
import classNames from 'classnames';
import Marquee from '../Marquee/Marquee';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { createSoundPlayer } from '../../utils/sound';

const clickSound = createSoundPlayer(buttonSound);

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
    if (sound) clickSound.play();
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
