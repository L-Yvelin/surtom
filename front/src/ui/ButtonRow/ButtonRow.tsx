import { JSX, ReactNode } from 'react';
import classNames from 'classnames';
import classes from './ButtonRow.module.css';

type ButtonRowProps = React.HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

function ButtonRow({ children, className = '', ...props }: ButtonRowProps): JSX.Element {
  return (
    <div className={classNames(classes.row, className)} {...props}>
      {children}
    </div>
  );
}

export default ButtonRow;
