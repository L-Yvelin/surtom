import { JSX, useCallback, useEffect, useRef } from "react";
import { Message } from "../Chat";
import MessageLine from "./Message/Message";
import classes from "./Messages.module.css";
import useChatStore from "../../../stores/useChatStore";

interface MessagesBoxProps {
  messages: Message[];
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

  let lastDate: string | null = null;

  const elements = messages
    .toReversed()
    .reduce<JSX.Element[]>((acc, message) => {
      acc.push(
        <MessageLine
          key={message.id}
          id={message.id}
          type={message.type}
          player={message.player}
          text={message.content.text}
        />
      );

      if (message.date) {
        const messageDate = new Date(message.date).toLocaleDateString("fr", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        if (messageDate !== lastDate) {
          acc.push(
            <div key={`date-${message.id}`} className={classes.date}>
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
