import { JSX, useRef } from "react";
import classes from "./Chat.module.css";
import classNames from "classnames";
import ChatInput from "./ChatInput/ChatInput";
import MessagesBox from "./MessagesBox/Messages";
import { Server } from "../../utils/Message";
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

export type ChatPlayer = Pick<Server.User, "name" | "moderatorLevel">;

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
  const chatRef = useRef<HTMLDivElement>(null);
  const { messages } = useChatStore();
  const { showChat: display, setVisibility } = useUIStore();
  const scrollToBottom = useChatStore((state) => state.scrollToBottom);

  useClickOutside(chatRef, () => setVisibility("showChat", false), [
    chatButtonRef,
  ]);

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
