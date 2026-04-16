import { Server } from '@surtom/interfaces';
import { isSavedChatMessage, isTextMessage } from '../../../utils';
import { SimpleMessage } from '../../../ChatInput/ChatInput';
import classes from './ReplyMessage.module.css';
import useChatStore from '../../../../../stores/useChatStore';

interface ReplyMessageProps {
  message: Server.ChatMessage.Type;
}

function ReplyMessage({ message }: ReplyMessageProps) {
  const { messages } = useChatStore();

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
      <span className={classes.error}>↱&nbsp;Impossible de charger la réponse</span>
      <br />
    </>
  );
}

export default ReplyMessage;
