import { Server } from '@surtom/interfaces';
import Cursor from '../Cursor/Cursor';
import classes from './PlayerCursor.module.css';
import classNames from 'classnames';

interface CursorProps extends React.HTMLAttributes<HTMLDivElement> {
  cursor: Server.CursorPositionMessage;
  containerWidth: number;
  containerHeight: number;
}

const PlayerCursor = ({ cursor, containerWidth, containerHeight, className, ...props }: CursorProps) => {
  const style: React.CSSProperties = {
    transform: `translate3d(${cursor.cursor.x * containerWidth}px, ${cursor.cursor.y * containerHeight}px, 0)`,
    willChange: 'transform',
  };

  return <Cursor user={cursor.user} className={classNames(classes.container, className)} {...props} style={style} />;
};

export default PlayerCursor;
