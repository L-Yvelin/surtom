import { Server } from '@surtom/interfaces';
import classes from './Cursor.module.css';
import classNames from 'classnames';
import Stick from '../../../assets/images/items/stick.png';
import NameTag from '../../NameTag/NameTag';

interface CursorProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Server.User;
  nameTagClassName?: string;
}

const Cursor = ({ user, className, nameTagClassName, ...props }: CursorProps) => {
  return (
    <div className={classNames(classes.container, className)} {...props}>
      <NameTag user={user} className={classNames(classes.nameTag, nameTagClassName)} />
      <div className={classes.item} style={{ backgroundImage: `url(${Stick})` }} />
    </div>
  );
};

export default Cursor;
