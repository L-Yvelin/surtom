import { ReactNode, useEffect, useRef, useState } from "react";
import classes from "./SwipeActions.module.css";
import classNames from "classnames";
import { isMobile } from "react-device-detect";

interface SwipeActionsProps {
  children: ReactNode;
  direction: "left" | "right";
  onSwipeOne: () => void;
  onSwipeTwo: () => void;
}

const SwipeActions = ({
  children,
  direction,
  onSwipeOne,
  onSwipeTwo,
}: SwipeActionsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);
  const [scrollLeft, setScrollLeft] = useState(0);

  const swipedForFirstAction = scrollLeft >= 50 && scrollLeft < 100;
  const swipedForSecondAction = scrollLeft >= 100;

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current && actionsRef.current) {
        const percentSwiped =
          (Math.abs(containerRef.current.scrollLeft) /
            actionsRef.current.offsetWidth) *
          100;

        setScrollLeft(percentSwiped);
      }
    };

    const el = containerRef.current;
    if (el) el.addEventListener("scroll", handleScroll);

    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const startSwipe = (startPosition: number) => {
    if (!isMobile || !containerRef.current) return;

    startX.current = startPosition;
    isSwiping.current = true;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", endSwipe);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", endSwipe);
  };

  const handleMouseMove = (e: MouseEvent) => moveSwipe(e.clientX);
  const handleTouchMove = (e: TouchEvent) => moveSwipe(e.touches[0].clientX);

  const moveSwipe = (currentX: number) => {
    if (!isSwiping.current || !containerRef.current) return;
    const deltaX = startX.current - currentX;
    containerRef.current.scrollLeft = direction === "left" ? deltaX : -deltaX;
  };

  const endSwipe = () => {
    if (!isSwiping.current || !containerRef.current || !actionsRef.current)
      return;
    isSwiping.current = false;

    const percentSwiped =
      (Math.abs(containerRef.current.scrollLeft) /
        actionsRef.current.offsetWidth) *
      100;

    if (percentSwiped >= 100) onSwipeTwo();
    else if (percentSwiped >= 50) onSwipeOne();

    containerRef.current.scrollLeft = 0;

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", endSwipe);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", endSwipe);
  };

  return (
    <div
      className={classes.swipeActions}
      ref={containerRef}
      onMouseDown={(e) => startSwipe(e.clientX)}
      onTouchStart={(e) => startSwipe(e.touches[0].clientX)}
    >
      <div className={classes.content}>{children}</div>
      <div
        className={classNames(classes.actions, {
          [classes.left]: direction === "left",
          [classes.firstAction]: swipedForFirstAction,
          [classes.secondAction]: swipedForSecondAction,
        })}
        ref={actionsRef}
      >
        <button className={classes.action}></button>
        <button className={classes.action}></button>
      </div>
    </div>
  );
};

export default SwipeActions;
