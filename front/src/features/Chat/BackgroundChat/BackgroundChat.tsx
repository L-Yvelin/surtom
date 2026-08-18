import { JSX, useEffect, useRef, useState } from 'react';
import { Server } from '@surtom/interfaces';
import classNames from 'classnames';
import Message from '../MessagesBox/Message/Message';
import { useChatStore } from '../../../stores/useChatStore';
import classes from './BackgroundChat.module.css';

const FADE_OUT_MS = 10000;

type BackgroundChatProps = {
  className?: string;
  messageClassName?: string;
  hidden?: boolean;
};

type FadingMessage = {
  key: string;
  message: Server.ChatMessage.Type;
};

function BackgroundChat({ className, messageClassName, hidden }: BackgroundChatProps): JSX.Element {
  const liveMessage = useChatStore((s) => s.liveMessage);
  const [fading, setFading] = useState<FadingMessage[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!liveMessage) return;

    const key = `live-${liveMessage.id}`;
    const entry = { key, message: liveMessage.message };
    setFading((prev) => [...prev, entry]);

    const timer = setTimeout(() => {
      setFading((prev) => prev.filter((item) => item.key !== key));
    }, FADE_OUT_MS);
    timersRef.current.push(timer);
  }, [liveMessage]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  return (
    <div className={classNames(classes.root, className, { [classes.hidden]: hidden })} aria-hidden>
      {fading.map(({ key, message }) => (
        <div key={key} className={classes.message}>
          <Message message={message} className={messageClassName} />
        </div>
      ))}
    </div>
  );
}

export default BackgroundChat;
