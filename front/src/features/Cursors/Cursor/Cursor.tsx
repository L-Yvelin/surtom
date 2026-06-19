import { Server } from '@surtom/interfaces';
import classes from './Cursor.module.css';
import classNames from 'classnames';
import NameTag from '../../../ui/NameTag/NameTag';
import { useTexture } from '../../../stores/useResourcePackStore';

interface CursorProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Server.User;
  nameTagClassName?: string;
}

const Cursor = ({ user, className, nameTagClassName, ...props }: CursorProps) => {
  const stick = useTexture('item/stick.png');

  return (
    <div className={classNames(classes.container, className)} {...props}>
      <NameTag user={user} className={classNames(classes.nameTag, nameTagClassName)} />
      <div className={classes.item} style={{ backgroundImage: `url(${stick})` }} />
    </div>
  );
};

export default Cursor;
