import { JSX, useEffect, useRef } from 'react';
import classes from './TextField.module.css';
import classNames from 'classnames';

interface TextFieldProps {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pattern?: string;
  className?: string;
  autoFocus?: boolean;
}

function TextField({ onChange, pattern, className, autoFocus }: TextFieldProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const regex = pattern ? new RegExp(`^${pattern}$`) : null;

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!regex || regex.test(e.target.value)) {
      onChange?.(e);
    } else {
      e.target.value = e.target.value.slice(0, -1);
    }
  };

  return (
    <div className={classNames(classes.textField, className)}>
      <input ref={inputRef} className={classes.text} onChange={handleInput} type="text" maxLength={15} />
    </div>
  );
}

export default TextField;
