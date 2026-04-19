import { JSX, useCallback, useEffect, useMemo, useRef } from 'react';
import { Server } from '@surtom/interfaces';
import Message from './Message/Message';
import classes from './Messages.module.css';
import useChatStore from '../../../stores/useChatStore';

interface MessagesBoxProps {
  messages: Server.ChatMessage.Type[];
  onCloseToBottom?: (isNearBottom: boolean) => void;
}

const NEAR_BOTTOM_THRESHOLD = 150;

const dateFormatter = new Intl.DateTimeFormat('fr', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

function MessagesBox({ messages, onCloseToBottom }: MessagesBoxProps): JSX.Element {
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

  const onCloseToBottomRef = useRef(onCloseToBottom);
  onCloseToBottomRef.current = onCloseToBottom;

  const handleScroll = useCallback(() => {
    if (!onCloseToBottomRef.current || !containerRef.current) return;
    const { scrollTop } = containerRef.current;
    const isNearBottom = scrollTop > -NEAR_BOTTOM_THRESHOLD;

    onCloseToBottomRef.current(isNearBottom);
  }, []);

  const renderedMessages = useMemo(() => {
    const out: JSX.Element[] = [];
    let prevDate: string | null = null;
    const reversed = messages.slice().reverse();

    for (let i = 0; i < reversed.length; i++) {
      const msg = reversed[i];
      const hasTimestamp = 'timestamp' in msg.content;
      const id = `${hasTimestamp ? msg.content.timestamp : 'no-ts'}-${msg.type}-${'id' in msg.content ? msg.content.id : 'no-id'}`;

      let dateSeparator: JSX.Element | null = null;

      if (hasTimestamp) {
        const currentDate = dateFormatter.format(new Date(msg.content.timestamp));

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

      if (dateSeparator) out.push(dateSeparator);

      out.push(
        <div key={id} data-key={id} {...('id' in msg.content && { 'data-id': msg.content.id })}>
          <Message message={msg} />
        </div>,
      );
    }
    return out;
  }, [messages]);

  return (
    <div ref={containerRef} className={classes.messages} onScroll={handleScroll}>
      {renderedMessages}
    </div>
  );
}

export default MessagesBox;
