import { JSX, useRef } from "react";
import classes from "./Chat.module.css";
import classNames from "classnames";
import ChatInput from "./ChatInput/ChatInput";
import MessagesBox from "./MessagesBox/Messages";
import { Player } from "../../interfaces/Player";
import useGameStore from "../../stores/useGameStore";
import useUIStore from "../../stores/useUIStore";
import useClickOutside from "../../hooks/useClickOutside";

interface MessageContent {
  text?: string;
  image?: string;
}

export type MessageType = "message" | "score" | "tellraw" | "mp";

export type ChatPlayer = Pick<Player, "name" | "isModerator">;

export interface Message {
  id: string;
  player: ChatPlayer;
  content: MessageContent;
  type: MessageType;
}

function Chat(): JSX.Element {
  const chatRef = useRef<HTMLDivElement>(null);
  const { messages } = useGameStore();
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
