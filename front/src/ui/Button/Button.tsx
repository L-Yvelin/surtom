import { JSX, ReactNode } from 'react';
import classes from './Button.module.css';
import buttonSound from '@mc/sounds/random/click_stereo.ogg';
import classNames from 'classnames';
import Marquee from '../Marquee/Marquee';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { createSoundPlayer } from '../../utils/sound';

const clickSound = createSoundPlayer(buttonSound);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  text: ReactNode;
  size?: 'normal' | 'square';
  ref?: React.Ref<HTMLButtonElement>;
};

function Button({ text, onClick, className = '', size = 'normal', disabled = false, ref, ...props }: ButtonProps): JSX.Element {
  const sound = useSettingsStore((s) => s.sound);

  function handleOnClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    onClick?.(e);
    if (sound) clickSound.play();
  }

  return (
    <button
      {...props}
      ref={ref}
      className={classNames(classes.button, classes[size], className, { [classes.disabled]: disabled })}
      onClick={handleOnClick}
      disabled={disabled}
    >
      <Marquee text={text} className={classes.text} />
    </button>
  );
}

export default Button;
