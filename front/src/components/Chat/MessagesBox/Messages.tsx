import { JSX, useCallback, useEffect, useRef, useMemo } from "react";
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

  const elements = useMemo(() => {
    let lastDate: string | null = null;

    return messages
      .toReversed()
      .map((message, index) => {
        const stringified = JSON.stringify(message);
        const hash = Math.abs(
          Array.from(stringified).reduce(
            (hash, char) => (hash << 5) - hash + char.charCodeAt(0),
            0
          )
        );
        const messageId = `${hash}-${index}`;

        const blocks: JSX.Element[] = [];

        if ("timestamp" in message.content) {
          const messageDate = new Date(
            message.content.timestamp
          ).toLocaleDateString("fr", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          if (lastDate && messageDate !== lastDate) {
            blocks.push(
              <div
                data-key={`date-${messageId}`}
                key={`date-${messageId}`}
                className={classes.date}
              >
                <span className={classes.dateLeftBar}></span>
                {messageDate}
                <span className={classes.dateRightBar}></span>
              </div>
            );
          }

          lastDate = messageDate;
        }

        blocks.push(
          <div
            data-key={messageId}
            key={messageId}
            {...("id" in message.content && { "data-id": message.content.id })}
          >
            <Message message={message} />
          </div>
        );

        return blocks;
      })
      .flat();
  }, [messages]);

  return (
    <div ref={containerRef} className={classes.messages}>
      {elements}
    </div>
  );
}

export default MessagesBox;
