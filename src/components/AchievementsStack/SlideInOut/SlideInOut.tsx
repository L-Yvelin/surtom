import React, { JSX, useEffect, useState } from "react";
import classes from "./SlideInOut.module.css";
import classNames from "classnames";

interface SlideInOutProps {
  child: JSX.Element;
  lifeTime: number;
  transitionDuration: number;
  side?: "top" | "bottom" | "left" | "right";
  onComplete?: () => void;
}

function SlideInOut({
  child,
  lifeTime,
  transitionDuration,
  side = "bottom",
  onComplete,
}: SlideInOutProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);

    // Leaving animation timeout
    setTimeout(() => {
      setIsVisible(false);
    }, (transitionDuration + lifeTime) * 1000);
  }, [lifeTime, transitionDuration]);

  const handleAnimationEnd = () => {
    if (!isVisible && onComplete) {
      onComplete();
    }
  };

  return (
    <div
      className={classNames(
        classes[side],
        classes.slideInOut,
        { [classes.slideIn]: isVisible },
        { [classes.slideOut]: !isVisible }
      )}
      style={
        {
          "--transitionDuration": `${transitionDuration}s`,
        } as React.CSSProperties
      }
      onAnimationEnd={handleAnimationEnd}
    >
      {child}
    </div>
  );
}

export default SlideInOut;
