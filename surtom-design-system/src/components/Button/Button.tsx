import { JSX, ReactNode } from 'react';
import classNames from 'classnames';
import classes from './Button.module.css';
import buttonSound from '../../assets/sounds/menu_stereo.mp3';
import { Marquee } from '../Marquee/Marquee';
import { useDesignSystem } from '../../context/DesignSystemContext';
import { createSoundPlayer } from '../../utils/sound';

const clickSound = createSoundPlayer(buttonSound);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  text: ReactNode;
  size?: 'normal' | 'square';
  ref?: React.Ref<HTMLButtonElement>;
  shouldMarquee?: boolean;
};

export function Button({
  text,
  onClick,
  className = '',
  size = 'normal',
  disabled = false,
  ref,
  shouldMarquee = true,
  ...props
}: ButtonProps): JSX.Element {
  const { soundEnabled } = useDesignSystem();

  function handleOnClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    onClick?.(e);
    if (soundEnabled) clickSound.play();
  }

  return (
    <button
      {...props}
      ref={ref}
      className={classNames(classes.button, classes[size], className, { [classes.disabled]: disabled })}
      onClick={handleOnClick}
      disabled={disabled}
    >
      {shouldMarquee ? <Marquee text={text} className={classes.text} /> : <span className={classes.text}>{text}</span>}
    </button>
  );
}
