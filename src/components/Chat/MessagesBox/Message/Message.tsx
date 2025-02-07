import { JSX } from "react";
import classes from "./Message.module.css";
import { ChatPlayer, MessageType } from "../../Chat";

interface MessageProps {
  id: string;
  type: MessageType;
  player: ChatPlayer;
  text?: string;
}

function MessageLine({ id, type, player, text }: MessageProps): JSX.Element {
  return (
    <div className={classes.message}>
      <span className={classes.username}>&lt;{player.name}&gt;</span>{" "}
      <span className={classes.text}>{text}</span>
    </div>
  );
}

export default MessageLine;
