import { useEffect, useRef } from 'react';
import { Client } from '@surtom/interfaces';
import usePlayerStore from '../../../stores/usePlayerStore';
import { useWebSocketStore } from '../../../stores/useWebSocketStore';
import NameTag from '../../../ui/NameTag/NameTag';
import classes from './OwnCursorNameTag.module.css';

const THROTTLE_MS = 50;

const OwnCursorNameTag = () => {
  const player = usePlayerStore((s) => s.player);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { sendMessage } = useWebSocketStore.getState();

    let x = 0;
    let y = 0;
    let rafId: number | null = null;
    let lastSent = 0;

    const apply = () => {
      rafId = null;
      const el = ref.current;
      if (!el) return;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(20%, -120%)`;
      el.style.visibility = 'visible';
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (rafId === null) {
        rafId = requestAnimationFrame(apply);
      }

      const now = performance.now();
      if (now - lastSent < THROTTLE_MS) return;
      lastSent = now;

      sendMessage({
        type: Client.MessageType.CURSOR_POSITION,
        content: { cursor: { x: x / window.innerWidth, y: y / window.innerHeight } },
      });
    };

    document.addEventListener('mousemove', onMove);

    return () => {
      document.removeEventListener('mousemove', onMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return <NameTag ref={ref} user={player} className={classes.container} />;
};

export default OwnCursorNameTag;
