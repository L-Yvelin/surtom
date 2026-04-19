import { Server } from '@surtom/interfaces';
import classes from './NameTag.module.css';
import classNames from 'classnames';
import { getPlayerColor } from '../Chat/utils';

interface NameTagProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Server.User;
}

const NameTag = ({ user, className, style, ...props }: NameTagProps) => {
  console.log(user);

  return (
    <div
      className={classNames(classes.container, className)}
      style={{ color: getPlayerColor(user.moderatorLevel, user.name), ...style }}
      {...props}
    >
      {user.name}
    </div>
  );
};

export default NameTag;
