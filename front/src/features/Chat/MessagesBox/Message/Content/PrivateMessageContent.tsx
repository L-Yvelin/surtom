import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Server } from '@surtom/interfaces';
import messageClasses from '../Message.module.css';
import classes from './PrivateMessageContent.module.css';
import PlayerName from '../PlayerName/PlayerName';
import { formatText } from './formatText';
import MessageImages from './MessageImages';

function PrivateMessageContent({ message }: { message: Server.ChatMessage.Text }): JSX.Element {
  const { t } = useTranslation();
  const user = message.content.user;
  return (
    <>
      <span className={classes.tag}>{t('chat.privateTag')}</span>
      <span className={messageClasses.username}>
        &lt;
        <PlayerName name={user.name} moderatorLevel={user.moderatorLevel} />
        &gt;&nbsp;
      </span>
      <span className={messageClasses.text}>{formatText(message.content.text)}</span>
      <MessageImages text={message.content.text} imageData={message.content.imageData} />
    </>
  );
}

export default PrivateMessageContent;
