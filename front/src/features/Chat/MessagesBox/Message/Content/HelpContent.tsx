import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import classes from '../Message.module.css';

function HelpContent(): JSX.Element {
  const { t } = useTranslation();
  return (
    <span className={classes.text} style={{ color: 'LemonChiffon' }}>
      {t('chat.help')}
    </span>
  );
}

export default HelpContent;
