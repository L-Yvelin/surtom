import React, { ReactNode, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { JSX } from "react";
import classes from "./Marquee.module.css";

interface MarqueeProps {
  text: ReactNode;
  className?: string;
  play?: "on" | "off" | "auto";
}

function Marquee({
  text,
  className = "",
  play = "auto",
}: MarqueeProps): JSX.Element {
  const [transform, setTransform] = useState<number>(0);

  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const animation = () => {
      if (textRef.current) {
        const overflow =
          textRef.current.scrollWidth - textRef.current.offsetWidth;

        if (overflow === 0) return;

        let start = 0;
        let direction: "forward" | "backward" = "forward";

        const animate = () => {
          if (direction === "forward") {
            if (start + 1 < overflow) {
              start += 1;
              setTransform(start);
            } else {
              direction = "backward";
            }
          } else if (direction === "backward") {
            if (start - 1 > 0) {
              start -= 1;
              setTransform(start);
            } else {
              direction = "forward";
            }
          }
          requestAnimationFrame(animate);
        };

        animate();
      }
    };

    window.addEventListener("load", animation);
  }, []);

  return (
    <div className={classNames(className, classes.marquee, classes[play])}>
      <span
        className={classes.text}
        style={{ "--transform": `-${transform}px` } as React.CSSProperties}
        ref={textRef}
      >
        {text}
      </span>
    </div>
  );
}

export default Marquee;
