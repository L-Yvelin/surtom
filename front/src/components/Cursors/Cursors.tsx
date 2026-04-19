import { Server } from '@surtom/interfaces';
import classNames from 'classnames';
import classes from './Cursors.module.css';
import PlayerCursor from './PlayerCursor/PlayerCursor';

interface CursorsProps extends React.HTMLAttributes<HTMLDivElement> {
  cursors: Server.CursorPositionMessage[];
}

const Cursors = ({ cursors, className, ...props }: CursorsProps) => {
  return (
    <div aria-hidden className={classNames(classes.container, className)} {...props}>
      {cursors.map((cursor) => (
        <PlayerCursor key={cursor.user.name} cursor={cursor} />
      ))}
    </div>
  );
};

export default Cursors;
