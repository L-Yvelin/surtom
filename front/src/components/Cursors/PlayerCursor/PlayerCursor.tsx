import { Server } from '@surtom/interfaces';
import Cursor from '../Cursor/Cursor';
import classes from './PlayerCursor.module.css';
import classNames from 'classnames';

interface CursorProps extends React.HTMLAttributes<HTMLDivElement> {
  cursor: Server.CursorPositionMessage;
}

const PlayerCursor = ({ cursor, className, ...props }: CursorProps) => {
  return (
    <Cursor
      user={cursor.user}
      className={classNames(classes.container, className)}
      {...props}
      style={{ left: `${cursor.cursor.x * 100}%`, top: `${cursor.cursor.y * 100}%` }}
    />
  );
};

export default PlayerCursor;
