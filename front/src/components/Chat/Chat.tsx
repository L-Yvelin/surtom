import { JSX, useRef } from "react";
import classes from "./Chat.module.css";
import classNames from "classnames";
import ChatInput from "./ChatInput/ChatInput";
import MessagesBox from "./MessagesBox/Messages";
import { Player } from "../../interfaces/Player";
import useUIStore from "../../stores/useUIStore";
import useClickOutside from "../../hooks/useClickOutside";
import useChatStore from "../../stores/useChatStore";
import arrowImage from "../../assets/images/ui/arrow.png";
import Button from "../Widgets/Button/Button";

interface MessageContent {
  text?: string;
  color?: string;
  words?: string[];
  answer?: string;
  attempts?: number;
  image?: string;
}

export type MessageType =
  | "message"
  | "score"
  | "tellraw"
  | "enhancedMessage"
  | "commandError"
  | "commandSuccess"
  | "privateMessage"
  | "privateMessageSent";
export type AnswerableMessageType =
  | "message"
  | "score"
  | "tellraw"
  | "enhancedMessage";

export type ChatPlayer = Pick<Player, "name" | "isModerator">;

export interface Message {
  id: string;
  player: ChatPlayer;
  content: MessageContent;
  type: MessageType;
  deleted?: number;
  reply?: string;
  date?: string;
}

function Chat(): JSX.Element {
  const chatRef = useRef<HTMLDivElement>(null);
  const { messages } = useChatStore();
  const { showChat: display, setVisibility } = useUIStore();
  const scrollToBottom = useChatStore((state) => state.scrollToBottom);

  useClickOutside(chatRef, () => setVisibility("showChat", false));

  return (
    <div
      className={classNames(classes.chat, { [classes.hidden]: !display })}
      ref={chatRef}
    >
      <div className={classes.messagesWrapper}>
        <MessagesBox messages={messages} />
        <div className={classes.scrollToBottom}>
          <Button
            text={
              <div className={classes.arrowContainer}>
                <img
                  src={arrowImage}
                  className={classes.arrow}
                  alt="Arrow to scroll to bottom"
                />
              </div>
            }
            className={classes.scrollToBottomButton}
            onClick={() => scrollToBottom?.()}
            size="square"
          />
        </div>
      </div>
      <ChatInput onSend={() => {}} onImagePaste={() => {}} display={display} />
    </div>
  );
}

export default Chat;
