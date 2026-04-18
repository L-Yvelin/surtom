import { JSX, useCallback, useEffect, useRef } from 'react';
import { Server } from '@surtom/interfaces';
import Message from './Message/Message';
import classes from './Messages.module.css';
import useChatStore from '../../../stores/useChatStore';

interface MessagesBoxProps {
  messages: Server.ChatMessage.Type[];
  onCloseToBottom?: (isNearBottom: boolean) => void;
}

function MessagesBox({ messages, onCloseToBottom }: MessagesBoxProps): JSX.Element {
  const NEAR_BOTTOM_THRESHOLD = 150;
  const containerRef = useRef<HTMLDivElement>(null);
  const setScrollToBottom = useChatStore((state) => state.setScrollToBottom);

  const scrollToBottom = useCallback(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'instant',
    });
  }, []);

  useEffect(() => {
    setScrollToBottom(scrollToBottom);
  }, [setScrollToBottom, scrollToBottom]);

  const handleScroll = () => {
    if (!onCloseToBottom || !containerRef.current) return;
    const { scrollTop } = containerRef.current;
    const isNearBottom = scrollTop > -NEAR_BOTTOM_THRESHOLD;

    onCloseToBottom(isNearBottom);
  };

  const renderedMessages: JSX.Element[] = [];
  let prevDate: string | null = null;

  const reversed = [...messages].reverse();

  for (let i = 0; i < reversed.length; i++) {
    const msg = reversed[i];
    const hasTimestamp = 'timestamp' in msg.content;
    const id = `${hasTimestamp ? msg.content.timestamp : 'no-ts'}-${msg.type}-${'id' in msg.content ? msg.content.id : 'no-id'}`;

    let dateSeparator: JSX.Element | null = null;

    if (hasTimestamp) {
      const currentDate = new Date(msg.content.timestamp).toLocaleDateString('fr', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (prevDate && currentDate !== prevDate) {
        dateSeparator = (
          <div key={`date-${id}`} className={classes.date} data-key={`date-${id}`}>
            <span className={classes.dateLeftBar}></span>
            {prevDate}
            <span className={classes.dateRightBar}></span>
          </div>
        );
      }

      prevDate = currentDate;
    }

    if (dateSeparator) renderedMessages.push(dateSeparator);

    renderedMessages.push(
      <div key={id} data-key={id} {...('id' in msg.content && { 'data-id': msg.content.id })}>
        <Message message={msg} />
      </div>,
    );
  }

  return (
    <div ref={containerRef} className={classes.messages} onScroll={handleScroll}>
      {renderedMessages}
    </div>
  );
}

export default MessagesBox;
