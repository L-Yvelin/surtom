import React, { ReactNode, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { JSX } from 'react';
import classes from './Marquee.module.css';

interface MarqueeProps {
  text: ReactNode;
  className?: string;
  play?: 'on' | 'off' | 'auto';
}

function Marquee({ text, className = '', play = 'auto' }: MarqueeProps): JSX.Element {
  const textRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!textRef.current || play === 'off') return;

    let start = 0;
    let direction: 'forward' | 'backward' = 'forward';
    const PAUSE_DURATION = 60;
    let pauseFrames = PAUSE_DURATION;

    const startAnimation = (overflow: number) => {
      cancelAnimationFrame(rafRef.current);
      start = 0;
      direction = 'forward';
      pauseFrames = 0;

      const animate = () => {
        if (pauseFrames > 0) {
          pauseFrames--;
          rafRef.current = requestAnimationFrame(animate);
          return;
        }

        if (direction === 'forward') {
          if (start + 1 <= overflow) {
            start += 1;
            textRef.current!.style.setProperty('--transform', `-${start}px`);
          } else {
            direction = 'backward';
            pauseFrames = PAUSE_DURATION;
          }
        } else {
          if (start - 1 >= 0) {
            start -= 1;
            textRef.current!.style.setProperty('--transform', `-${start}px`);
          } else {
            direction = 'forward';
            pauseFrames = PAUSE_DURATION;
          }
        }

        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(() => {
      if (!textRef.current) return;

      const overflow = textRef.current.scrollWidth - textRef.current.offsetWidth;

      cancelAnimationFrame(rafRef.current);
      textRef.current.style.setProperty('--transform', '0px');

      if (overflow > 0) {
        startAnimation(overflow);
      }
    });

    observer.observe(textRef.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [play]);

  return (
    <div className={classNames(className, classes.marquee, classes[play])}>
      <span className={classes.text} ref={textRef}>
        {text}
      </span>
    </div>
  );
}

export default Marquee;
