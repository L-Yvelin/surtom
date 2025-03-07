import { JSX, useRef } from "react";
import classes from "./Chat.module.css";
import classNames from "classnames";
import ChatInput from "./ChatInput/ChatInput";
import MessagesBox from "./MessagesBox/Messages";
import { Player } from "../../interfaces/Player";
import useUIStore from "../../stores/useUIStore";
import useClickOutside from "../../hooks/useClickOutside";
import useChatStore from "../../stores/useChatStore";

interface MessageContent {
  text?: string;
  color?: string;
  words?: string[];
  answer?: string;
  attempts?: number;
  image?: string;
}

export type MessageType = "message" | "score" | "tellraw" | "enhancedMessage" | "commandError" | "commandSuccess" | "privateMessage" | "privateMessageSent";

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

  useClickOutside(chatRef, () => setVisibility("showChat", false));

  return (
    <div
      className={classNames(classes.chat, { [classes.hidden]: !display })}
      ref={chatRef}
    >
      <MessagesBox messages={messages} />
      <ChatInput
        onSend={() => {}}
        onImagePaste={() => {}}
        display={display}
      />
    </div>
  );
}

export default Chat;
