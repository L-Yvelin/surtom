import { memo, useMemo } from 'react';
import { Server } from '@surtom/interfaces';
import classes from './NameTag.module.css';
import classNames from 'classnames';
import { getPlayerColor } from '../Chat/utils';

interface NameTagProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Server.User;
  ref?: React.Ref<HTMLDivElement>;
}

const NameTag = ({ user, className, style, ref, ...props }: NameTagProps) => {
  const mergedStyle = useMemo<React.CSSProperties>(
    () => ({ color: getPlayerColor(user.moderatorLevel, user.name), ...style }),
    [user.moderatorLevel, user.name, style],
  );

  return (
    <div ref={ref} className={classNames(classes.container, className)} style={mergedStyle} {...props}>
      {user.name}
    </div>
  );
};

export default memo(NameTag);
