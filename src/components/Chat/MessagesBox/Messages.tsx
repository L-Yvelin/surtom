import { JSX } from "react";
import { Message } from "../Chat";
import MessageLine from "./Message/Message";
import classes from "./Messages.module.css";

interface MessagesBoxProps {
  messages: Message[];
}

function MessagesBox({ messages }: MessagesBoxProps): JSX.Element {
  return (
    <div className={classes.messages}>
      {messages.map((message) => (
        <MessageLine
          key={message.id}
          id={message.id}
          type={"message"}
          player={message.player}
          text={message.content.text}
        />
      ))}
    </div>
  );
}

export default MessagesBox;
