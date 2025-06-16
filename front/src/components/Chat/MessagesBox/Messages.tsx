import { JSX, useCallback, useEffect, useRef } from "react";
import { Server } from "../../../../../interfaces/Message";
import Message from "./Message/Message";
import classes from "./Messages.module.css";
import useChatStore from "../../../stores/useChatStore";

interface MessagesBoxProps {
  messages: Server.ChatMessage.Type[];
}

function MessagesBox({ messages }: MessagesBoxProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const setScrollToBottom = useChatStore((state) => state.setScrollToBottom);

  const scrollToBottomFunction = useCallback(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "instant",
    });
  }, []);

  useEffect(() => {
    setScrollToBottom(scrollToBottomFunction);
  }, [setScrollToBottom, scrollToBottomFunction]);

  function getMessageId(
    message: Server.ChatMessage.Type,
    rand: number
  ): string {
    const messageHash = Math.abs(
      Array.from(JSON.stringify(message)).reduce(
        (hash, char) => (hash << 5) - hash + char.charCodeAt(0),
        0
      )
    );
    return `${messageHash}-${rand}`;
  }

  let lastDate: string | null = null;

  const elements = messages
    .toReversed()
    .reduce<JSX.Element[]>((acc, message, index) => {
      acc.push(
        <div
          data-key={getMessageId(message, index)}
          key={getMessageId(message, index)}
          {...("id" in message.content && { "data-id": message.content.id })}
        >
          <Message message={message} />
        </div>
      );

      if ("timestamp" in message.content) {
        const messageDate = new Date(
          message.content.timestamp
        ).toLocaleDateString("fr", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        if (messageDate !== lastDate) {
          acc.push(
            <div
              data-key={`date-${getMessageId(message, index)}`}
              key={`date-${getMessageId(message, index)}`}
              className={classes.date}
            >
              <span className={classes.dateLeftBar}></span>
              {messageDate}
              <span className={classes.dateRightBar}></span>
            </div>
          );
          lastDate = messageDate;
        }
      }
      return acc;
    }, []);

  return (
    <div ref={containerRef} className={classes.messages}>
      {elements}
    </div>
  );
}

export default MessagesBox;
