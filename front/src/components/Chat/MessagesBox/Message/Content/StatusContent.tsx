import { JSX } from "react";
import { Server } from "@surtom/interfaces";
import classes from "../Message.module.css";

function StatusContent({
  message,
}: {
  message: Server.ChatMessage.Status;
}): JSX.Element {
  return (
    <span
      className={classes.text}
      style={{
        color:
          message.type === Server.MessageType.SUCCESS ? "green" : "darkred",
      }}
    >
      {message.content.text}
    </span>
  );
}

export default StatusContent;
