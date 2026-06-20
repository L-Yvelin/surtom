import { JSX, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './Chat.module.css';
import classNames from 'classnames';
import ChatInput from './ChatInput/ChatInput';
import MessagesBox from './MessagesBox/Messages';
import { Server } from '@surtom/interfaces';
import useScreen from '../../hooks/useScreen';
import useChatStore from '../../stores/useChatStore';
import arrowImage from '../../assets/images/ui/arrow.png';
import Button from '../../ui/Button/Button';

interface MessageContent {
  text?: string;
  color?: string;
  words?: string[];
  answer?: string;
  attempts?: number;
  image?: string;
}

export type ChatPlayer = Pick<Server.User, 'name' | 'moderatorLevel'>;

export interface Message {
  id: string;
  player: ChatPlayer;
  content: MessageContent;
  type: Server.ChatMessage.Type;
  deleted?: number;
  reply?: string;
  date?: string;
}

interface ChatProps {
  chatButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function Chat({ chatButtonRef }: ChatProps): JSX.Element {
  const { t } = useTranslation();
  const messages = useChatStore((s) => s.messages);
  const { screenRef, visible } = useScreen('chat', chatButtonRef);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const scrollToBottom = useChatStore((state) => state.scrollToBottom);

  return (
    <div className={classNames(classes.chat, { [classes.hidden]: !visible })} ref={screenRef}>
      <div className={classes.messagesWrapper}>
        <MessagesBox messages={messages} onCloseToBottom={setIsNearBottom} />
        <div className={classes.scrollToBottom}>
          <Button
            text={
              <div className={classes.arrowContainer}>
                <img src={arrowImage} className={classes.arrow} alt={t('chat.scrollToBottomAlt')} />
              </div>
            }
            className={classNames(classes.scrollToBottomButton, { [classes.hidden]: isNearBottom })}
            onClick={() => scrollToBottom?.()}
            size="square"
          />
        </div>
      </div>
      <ChatInput onSend={() => {}} onImagePaste={() => {}} display={visible} />
    </div>
  );
}

export default Chat;
