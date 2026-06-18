import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './Message.module.css';
import { Server, Client } from '@surtom/interfaces';
import MessageTool from './MessageTool/MessageTool';
import classNames from 'classnames';
import SwipeActions from '../../../../ui/SwipeActions/SwipeActions';
import useChatStore from '../../../../stores/useChatStore';
import CustomContextMenu from '../../../../ui/ContextMenu/ContextMenu';
import MessageContextMenu from './MessageContextMenu/MessageContextMenu';
import usePlayerStore from '../../../../stores/usePlayerStore';
import answerIcon from '../../../../assets/images/ui/answer.svg';
import deleteIcon from '../../../../assets/images/ui/delete.svg';
import { isPrivateMessage, isSavedChatMessage, isScoreMessage, isStatusMessage, isTextMessage } from '../../utils/messageFormatting';
import { isMobile } from 'react-device-detect';
import StatusContent from './Content/StatusContent';
import ScoreContent from './Content/ScoreContent';
import UserContent from './Content/UserContent';
import PrivateMessageContent from './Content/PrivateMessageContent';
import { useWebSocketStore } from '../../../../stores/useWebSocketStore';
import ReplyMessage from './ReplyMessage/ReplyMessage';

const MessageContent = ({ message }: { message: Server.ChatMessage.Type }): JSX.Element => {
  if (isStatusMessage(message)) {
    return <StatusContent message={message} />;
  } else if (isSavedChatMessage(message)) {
    if (isScoreMessage(message)) {
      return <ScoreContent message={message} />;
    } else if (isPrivateMessage(message)) {
      return <PrivateMessageContent message={message} />;
    } else if (isTextMessage(message)) {
      return <UserContent message={message} />;
    } else {
      return <></>;
    }
  } else {
    return <></>;
  }
};

function Message({ message }: { message: Server.ChatMessage.Type }): JSX.Element {
  const { t } = useTranslation();
  const setAnsweringTo = useChatStore((s) => s.setAnsweringTo);
  const focusInput = useChatStore((s) => s.focusInput);
  const sendMessage = useWebSocketStore((s) => s.sendMessage);
  const username = usePlayerStore((state) => state.player.name);
  const myModeratorLevel = usePlayerStore((state) => state.player.moderatorLevel);

  let id = '';
  let user: { name: string; moderatorLevel: number } = {
    name: '',
    moderatorLevel: 0,
  };
  if (isTextMessage(message) || isScoreMessage(message)) {
    id = message.content.id;
    user = message.content.user;
  }

  const handleRespond = (id: string) => {
    setAnsweringTo(id);
    focusInput();
  };

  const handleDelete = (id: string) => {
    const intId = parseInt(id);
    sendMessage({
      type: Client.MessageType.DELETE_MESSAGE,
      content: intId,
    });
  };

  const isMention = isTextMessage(message) && username && message.content.text.includes(`@${username}`);

  const date = new Date(message.content.timestamp);
  const timeString = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <CustomContextMenu
      menuContent={
        <MessageContextMenu
          actions={[
            ...(isSavedChatMessage(message) && id
              ? [
                  {
                    label: t('chat.actionReply'),
                    icon: answerIcon,
                    onClick: () => handleRespond(id),
                  },
                ]
              : []),
            ...(!isSavedChatMessage(message) || (user && myModeratorLevel > user.moderatorLevel) || user.name === username
              ? [
                  {
                    label: t('chat.actionDelete'),
                    icon: deleteIcon,
                    onClick: () => handleDelete(id),
                  },
                ]
              : []),
          ]}
        />
      }
      offset={5}
    >
      {isMobile ? (
        <SwipeActions direction="left" onSwipeOne={() => handleRespond(id)} onSwipeTwo={() => handleDelete(id)}>
          <div
            className={classNames(classes.message, { [classes.mention]: isMention })}
            id={id}
            data-replyId={isTextMessage(message) ? message.content.replyId : undefined}
          >
            <div className={classes.content}>
              <ReplyMessage message={message} />
              <MessageContent message={message} />
            </div>
          </div>
          <div className={classes.tool}>
            <MessageTool onDelete={() => handleDelete(id)} onRespond={() => handleRespond(id)} />
          </div>
        </SwipeActions>
      ) : (
        <div
          className={classNames(classes.message, { [classes.mention]: isMention })}
          id={id}
          data-replyId={isTextMessage(message) ? message.content.replyId : undefined}
        >
          <div className={classes.content}>
            <ReplyMessage message={message} />
            <MessageContent message={message} />
          </div>
          <p className={classes.timestamp}>{timeString}</p>
        </div>
      )}
    </CustomContextMenu>
  );
}

export default Message;
