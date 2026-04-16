import { ReactNode, useEffect, useRef, useState } from 'react';
import classes from './SwipeActions.module.css';
import classNames from 'classnames';
import { isMobile } from 'react-device-detect';
import answerIcon from '../../../assets/images/ui/answer.svg';
import deleteIcon from '../../../assets/images/ui/delete.svg';

interface SwipeActionsProps {
  children: ReactNode;
  direction: 'left' | 'right';
  onSwipeOne: () => void;
  onSwipeTwo: () => void;
}

const SwipeActions = ({ children, direction, onSwipeOne, onSwipeTwo }: SwipeActionsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);
  const [scrollLeft, setScrollLeft] = useState(0);

  const swipedForFirstAction = scrollLeft >= 30 && scrollLeft < 80;
  const swipedForSecondAction = scrollLeft >= 80;

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current && actionsRef.current) {
        const percentSwiped = (Math.abs(containerRef.current.scrollLeft) / actionsRef.current.offsetWidth) * 100;

        setScrollLeft(percentSwiped);
      }
    };

    const el = containerRef.current;
    if (el) el.addEventListener('scroll', handleScroll);

    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const startSwipe = (startPositionX: number, startPositionY: number) => {
    if (!isMobile || !containerRef.current) return;

    startX.current = startPositionX;
    startY.current = startPositionY;
    isSwiping.current = true;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', endSwipe);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', endSwipe);
  };

  const handleMouseMove = (e: MouseEvent) => moveSwipe(e.clientX, e.clientY);
  const handleTouchMove = (e: TouchEvent) => moveSwipe(e.touches[0].clientX, e.touches[0].clientY);

  const moveSwipe = (currentX: number, currentY: number) => {
    if (!isSwiping.current || !containerRef.current) return;

    const deltaX = startX.current - currentX;
    const deltaY = startY.current - currentY;

    // If the movement is more vertical than horizontal, prevent swipe
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      endSwipe();
      return;
    }

    containerRef.current.scrollLeft = direction === 'left' ? deltaX : -deltaX;
  };

  const endSwipe = () => {
    if (!isSwiping.current || !containerRef.current || !actionsRef.current) return;
    isSwiping.current = false;

    const percentSwiped = (Math.abs(containerRef.current.scrollLeft) / actionsRef.current.offsetWidth) * 100;

    if (percentSwiped >= 30 && percentSwiped < 80) onSwipeOne();
    else if (percentSwiped >= 80) onSwipeTwo();

    containerRef.current.scrollLeft = 0;

    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', endSwipe);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', endSwipe);
  };

  return (
    <div
      className={classes.swipeActions}
      ref={containerRef}
      onMouseDown={(e) => startSwipe(e.clientX, e.clientY)}
      onTouchStart={(e) => startSwipe(e.touches[0].clientX, e.touches[0].clientY)}
    >
      <div className={classes.content}>{children}</div>
      <div className={classes.actionsWrapper}>
        <div
          className={classNames(classes.actions, {
            [classes.left]: direction === 'left',
            [classes.firstAction]: swipedForFirstAction,
            [classes.secondAction]: swipedForSecondAction,
          })}
          ref={actionsRef}
        >
          {swipedForFirstAction ? <img className={classes.actionIcon} src={answerIcon} /> : null}
          {swipedForSecondAction ? <img className={classes.actionIcon} src={deleteIcon} /> : null}
        </div>
      </div>
    </div>
  );
};

export default SwipeActions;
