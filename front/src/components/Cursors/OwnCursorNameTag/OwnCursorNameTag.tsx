import { useEffect, useRef } from 'react';
import useGameStore from '../../../stores/useGameStore';
import NameTag from '../../NameTag/NameTag';
import classes from './OwnCursorNameTag.module.css';

const OwnCursorNameTag = () => {
  const player = useGameStore((s) => s.player);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let x = 0;
    let y = 0;
    let rafId: number | null = null;

    const apply = () => {
      rafId = null;
      const el = ref.current;
      if (!el) return;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(20%, -120%)`;
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (rafId === null) {
        rafId = requestAnimationFrame(apply);
      }
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
