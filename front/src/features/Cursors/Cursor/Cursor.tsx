import { Server } from '@surtom/interfaces';
import classes from './Cursor.module.css';
import classNames from 'classnames';
import Stick from '@mc/textures/item/stick.png';
import NameTag from '../../../ui/NameTag/NameTag';

interface CursorProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Server.User;
  nameTagClassName?: string;
}

const stickStyle: React.CSSProperties = { backgroundImage: `url(${Stick})` };

const Cursor = ({ user, className, nameTagClassName, ...props }: CursorProps) => {
  return (
    <div className={classNames(classes.container, className)} {...props}>
      <NameTag user={user} className={classNames(classes.nameTag, nameTagClassName)} />
      <div className={classes.item} style={stickStyle} />
    </div>
  );
};

export default Cursor;
