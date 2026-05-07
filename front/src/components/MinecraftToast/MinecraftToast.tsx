import classNames from 'classnames';
import classes from './MinecraftToast.module.css';
import useToast from '../../hooks/useToast';

interface MinecraftToastProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  toastButtonRef?: React.RefObject<HTMLElement | null>;
}

const MinecraftToast = ({ id, children, className, toastButtonRef, ...props }: MinecraftToastProps) => {
  const { toastRef, visible } = useToast(id, toastButtonRef);

  return (
    <div ref={toastRef} className={classNames(classes.toast, className, { [classes.hidden]: !visible })} {...props}>
      {children}
    </div>
  );
};

export default MinecraftToast;
