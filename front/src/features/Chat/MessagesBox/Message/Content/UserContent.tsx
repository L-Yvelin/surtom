import { JSX } from 'react';
import { Server } from '@surtom/interfaces';
import i18n from '../../../../../i18n';
import classes from '../Message.module.css';
import PlayerName from '../PlayerName/PlayerName';
import { isTextMessage, isEnhancedMessage } from '../../../utils/messageFormatting';
import classNames from 'classnames';
import { formatText } from './formatText';
import MessageImages from './MessageImages';

const enhancedMessageContent = (text: string): JSX.Element => {
  let parsedContent: Server.ChatMessage.Content.EnhancedTextMessageContent | Server.ChatMessage.Content.EnhancedTextMessageContent[];

  try {
    parsedContent = JSON.parse(text);
  } catch (err) {
    console.error('Error while parsing enhanced message', err);
    return <>{i18n.t('chat.messageError')}</>;
  }

  const formatNewlines = (text: string) => {
    const parts = text.split('\n');
    return parts.map((part, i) => (
      <span key={i}>
        {formatText(part)}
        {i < parts.length - 1 && <br />}
      </span>
    ));
  };

  const createMessage = (text: string, color?: string, onClickAction?: string, key?: number) => {
    return (
      <span
        key={key}
        style={{ color }}
        onClick={() => {
          if (onClickAction) {
            try {
              const action = new Function(onClickAction);
              action();
            } catch {
              console.error('Error while executing action', onClickAction);
            }
          }
        }}
        className={classNames({ [classes.clickable]: !!onClickAction })}
      >
        {formatNewlines(text)}
      </span>
    );
  };

  return Array.isArray(parsedContent) ? (
    <>{parsedContent.map((message, index) => createMessage(message.text, message.color, message.clickable, index))}</>
  ) : (
    createMessage(parsedContent.text, parsedContent.color, parsedContent.clickable)
  );
};

function UserContent({ message }: { message: Server.ChatMessage.Text }): JSX.Element {
  const user = message.content.user;
  return (
    <>
      {user?.name && (
        <span className={classes.username}>
          &lt;
          <PlayerName name={user.name} moderatorLevel={user.moderatorLevel} />
          &gt;&nbsp;
        </span>
      )}
      {isTextMessage(message) && (
        <>
          <span className={classes.text}>
            {isEnhancedMessage(message) ? enhancedMessageContent(message.content.text) : <p>{formatText(message.content.text)}</p>}
          </span>
          <MessageImages text={message.content.text} imageData={message.content.imageData} />
        </>
      )}
    </>
  );
}

export default UserContent;
