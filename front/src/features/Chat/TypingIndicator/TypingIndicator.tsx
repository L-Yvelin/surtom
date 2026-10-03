import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useTypingStore } from '../../../stores/useTypingStore';
import classes from './TypingIndicator.module.css';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps): JSX.Element {
  const { t } = useTranslation();
  const typers = useTypingStore((s) => s.typers);

  let text = '';
  if (typers.length === 1) text = t('chat.typingOne', { name: typers[0] });
  else if (typers.length === 2) text = t('chat.typingTwo', { first: typers[0], second: typers[1] });
  else if (typers.length > 2) text = t('chat.typingMany');

  return (
    <div className={classNames(classes.typing, className)} role="status" aria-live="polite">
      {text}
    </div>
  );
}
