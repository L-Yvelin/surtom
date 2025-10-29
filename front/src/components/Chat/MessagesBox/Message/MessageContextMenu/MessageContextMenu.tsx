import { JSX } from 'react';
import classes from './MessageContextMenu.module.css';

interface MessageContextMenuProps {
  actions: {
    label: string;
    icon?: string;
    onClick: () => void;
  }[];
}

const MessageContextMenu = ({ actions }: MessageContextMenuProps): JSX.Element => {
  return (
    <div className={classes.container}>
      {actions.map(({ label, icon, onClick }, index) => (
        <button key={`${index}-${label}`} className={classes.action} onClick={onClick}>
          <span>{label}</span>
          {icon ? <img src={icon} className={classes.icon} /> : null}
        </button>
      ))}
    </div>
  );
};

export default MessageContextMenu;
