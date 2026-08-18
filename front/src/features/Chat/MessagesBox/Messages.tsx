import { JSX, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Server } from '@surtom/interfaces';
import Message from './Message/Message';
import classes from './Messages.module.css';
import { useChatStore } from '../../../stores/useChatStore';
import usePlayerStore from '../../../stores/usePlayerStore';
import { findFirstUnreadId } from '../utils/unread';
import { getMessageKey } from '../utils/messageFormatting';
import classNames from 'classnames';

type MessagesBoxProps = React.HTMLAttributes<HTMLDivElement> & {
  messages: Server.ChatMessage.Type[];
  onCloseToBottom?: (isNearBottom: boolean) => void;
};

const NEAR_BOTTOM_THRESHOLD = 150;

function MessagesBox({ messages, onCloseToBottom, className, ...props }: MessagesBoxProps): JSX.Element {
  const { t, i18n } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const setScrollToBottom = useChatStore((state) => state.setScrollToBottom);
  const setScrollToFirstUnread = useChatStore((state) => state.setScrollToFirstUnread);
  const lastReadAt = useChatStore((state) => state.lastReadAt);
  const selfName = usePlayerStore((state) => state.player.name);

  const firstUnreadId = findFirstUnreadId(messages, lastReadAt, selfName);

  const dateFormatter = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'instant',
    });
  };

  const scrollToFirstUnread = () => {
    const target = containerRef.current?.querySelector('[data-first-unread="true"]');
    if (target) {
      target.scrollIntoView({ behavior: 'instant', block: 'center' });
    } else {
      scrollToBottom();
      setTimeout(() => {
        scrollToBottom();
      }, 1000);
    }
  };

  useEffect(() => {
    setScrollToBottom(scrollToBottom);
  }, [setScrollToBottom]);

  useEffect(() => {
    setScrollToFirstUnread(scrollToFirstUnread);
  }, [setScrollToFirstUnread]);

  const handleScroll = () => {
    if (!onCloseToBottom || !containerRef.current) return;
    const { scrollTop } = containerRef.current;
    const isNearBottom = scrollTop > -NEAR_BOTTOM_THRESHOLD;
    onCloseToBottom(isNearBottom);
  };

  const renderedMessages: JSX.Element[] = [];
  let prevDate: string | null = null;
  const reversed = messages.slice().reverse();

  for (let i = 0; i < reversed.length; i++) {
    const msg = reversed[i];
    const hasTimestamp = 'timestamp' in msg.content;
    const id = getMessageKey(msg);

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

    if (dateSeparator) renderedMessages.push(dateSeparator);

    const isFirstUnread = 'id' in msg.content && msg.content.id === firstUnreadId;

    renderedMessages.push(
      <div
        key={id}
        data-key={id}
        {...('id' in msg.content && { 'data-id': msg.content.id })}
        {...(isFirstUnread && { 'data-first-unread': 'true' })}
      >
        <Message message={msg} />
      </div>,
    );

    if (isFirstUnread) {
      renderedMessages.push(
        <div key={`unread-${id}`} className={classes.unread}>
          <span className={classes.unreadBar}></span>
          {t('chat.newMessages')}
          <span className={classes.unreadBar}></span>
        </div>,
      );
    }
  }

  return (
    <div ref={containerRef} className={classNames(classes.messages, className)} onScroll={handleScroll} {...props}>
      {renderedMessages}
    </div>
  );
}

export default MessagesBox;
