import { Server } from '@surtom/interfaces';
import { useTranslation } from 'react-i18next';
import { isSavedChatMessage, isTextMessage } from '../../../utils/messageFormatting';
import { SimpleMessage } from '../../../ChatInput/ChatInput';
import classes from './ReplyMessage.module.css';
import useChatStore from '../../../../../stores/useChatStore';

interface ReplyMessageProps {
  message: Server.ChatMessage.Type;
}

function ReplyMessage({ message }: ReplyMessageProps) {
  const { t } = useTranslation();
  const messages = useChatStore((s) => s.messages);

  const messageFromId = (id: string): Server.ChatMessage.SavedType | undefined => {
    return messages.find((m) => isSavedChatMessage(m) && m.content.id === id);
  };

  if (!isTextMessage(message) || !message.content.replyId) {
    return null;
  }

  const replyMessage = messageFromId(message.content.replyId);

  if (replyMessage) {
    return (
      <>
        <span>
          ↱&nbsp;
          <SimpleMessage message={replyMessage} />
        </span>
        <br />
      </>
    );
  }

  return (
    <>
      <span className={classes.error}>↱&nbsp;{t('chat.replyError')}</span>
      <br />
    </>
  );
}

export default ReplyMessage;
