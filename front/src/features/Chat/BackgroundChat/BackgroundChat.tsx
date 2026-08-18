import { JSX, useEffect, useRef, useState } from 'react';
import { Server } from '@surtom/interfaces';
import classNames from 'classnames';
import Message from '../MessagesBox/Message/Message';
import { getMessageKey } from '../utils/messageFormatting';
import { useChatStore } from '../../../stores/useChatStore';
import classes from './BackgroundChat.module.css';

const FADE_OUT_MS = 10000;

type BackgroundChatProps = {
  className?: string;
  hidden?: boolean;
};

type FadingMessage = {
  key: string;
  message: Server.ChatMessage.Type;
};

function BackgroundChat({ className, hidden }: BackgroundChatProps): JSX.Element {
  const messages = useChatStore((s) => s.messages);
  const [fading, setFading] = useState<FadingMessage[]>([]);
  const seenRef = useRef<Set<string> | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const keyed = messages.map((message) => ({ key: getMessageKey(message), message }));

    if (seenRef.current === null) {
      seenRef.current = new Set(keyed.map((entry) => entry.key));
      return;
    }

    const fresh = keyed.filter((entry) => !seenRef.current!.has(entry.key));
    if (fresh.length === 0) return;

    fresh.forEach((entry) => seenRef.current!.add(entry.key));
    setFading((prev) => [...prev, ...fresh]);

    fresh.forEach((entry) => {
      const timer = setTimeout(() => {
        setFading((prev) => prev.filter((item) => item.key !== entry.key));
      }, FADE_OUT_MS);
      timersRef.current.push(timer);
    });
  }, [messages]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  return (
    <div className={classNames(classes.root, className, { [classes.hidden]: hidden })} aria-hidden>
      {fading.map(({ key, message }) => (
        <div key={key} className={classes.message}>
          <Message message={message} />
        </div>
      ))}
    </div>
  );
}

export default BackgroundChat;
