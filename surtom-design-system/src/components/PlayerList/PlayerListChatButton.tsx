import { JSX } from 'react';
import classNames from 'classnames';
import { useTexture } from '../../minecraft/resourcePackStore';
import classes from './PlayerListChatButton.module.css';

export interface PlayerListChatButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
}

export function PlayerListChatButton({ label, className, ...rest }: PlayerListChatButtonProps): JSX.Element {
  const src = useTexture('gui/sprites/toast/social_interactions.png');

  return (
    <button type="button" {...rest} aria-label={label} className={classNames(classes.button, className)}>
      <img src={src} alt="" className={classes.icon} />
    </button>
  );
}
