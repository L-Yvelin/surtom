import { JSX, ReactNode } from 'react';
import classNames from 'classnames';
import { useTexture } from '../../minecraft/resourcePackStore';
import type { TextureKey } from '../../minecraft/textures';
import classes from './PlayerListRow.module.css';

export type PlayerPing = 1 | 2 | 3 | 4 | 5 | 'unknown';

const PING_TEXTURES: Record<PlayerPing, TextureKey> = {
  1: 'gui/sprites/icon/ping_1.png',
  2: 'gui/sprites/icon/ping_2.png',
  3: 'gui/sprites/icon/ping_3.png',
  4: 'gui/sprites/icon/ping_4.png',
  5: 'gui/sprites/icon/ping_5.png',
  unknown: 'gui/sprites/icon/ping_unknown.png',
};

export interface PlayerListRowProps {
  name?: string;
  nameColor?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
  actions?: ReactNode;
  ping?: PlayerPing;
  pingAlt?: string;
  className?: string;
}

function Ping({ level, alt }: { level: PlayerPing; alt: string }): JSX.Element {
  const src = useTexture(PING_TEXTURES[level]);
  return <img src={src} alt={alt} className={classes.ping} />;
}

export function PlayerListRow({ name, nameColor, icon, suffix, actions, ping, pingAlt = '', className }: PlayerListRowProps): JSX.Element {
  if (name === undefined) return <div className={classNames(classes.row, className)} />;

  return (
    <div className={classNames(classes.row, className)}>
      <span className={classes.icon}>{icon}</span>
      <span className={classes.name} style={nameColor ? { color: nameColor } : undefined}>
        {name}
      </span>
      {suffix !== undefined && <span className={classes.suffix}>{suffix}</span>}
      {(actions !== undefined || ping !== undefined) && (
        <span className={classes.trailing}>
          {actions}
          {ping !== undefined && <Ping level={ping} alt={pingAlt} />}
        </span>
      )}
    </div>
  );
}
