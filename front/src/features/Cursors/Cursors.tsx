import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import classes from './Cursors.module.css';
import PlayerCursor from './PlayerCursor/PlayerCursor';
import useCursorsStore from '../../stores/useCursorsStore';
import useGameStore from '../../stores/useGameStore';

type CursorsProps = React.HTMLAttributes<HTMLDivElement>;

const Cursors = ({ className, ...props }: CursorsProps) => {
  const cursors = useCursorsStore((s) => s.cursors);
  const playerList = useGameStore((s) => s.playerList);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const playerNames = new Set(playerList.map((p) => p.name));
  const visibleCursors = cursors.filter((c) => playerNames.has(c.user.name));

  return (
    <div aria-hidden ref={containerRef} className={classNames(classes.container, className)} {...props}>
      {visibleCursors.map((cursor) => (
        <PlayerCursor key={cursor.user.name} cursor={cursor} containerWidth={size.width} containerHeight={size.height} />
      ))}
    </div>
  );
};

export default Cursors;
