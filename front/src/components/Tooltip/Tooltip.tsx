import { isDesktop } from "react-device-detect";
import { JSX, ReactNode, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getTooltipPosition, Anchor, Coordinates } from "./utils";
import classes from "./Tooltip.module.css";
import classNames from "classnames";

interface TooltipProps {
  children: ReactNode;
  tooltipContent: ReactNode;
  offset?: number;
  anchor?: Anchor;
  activeOnMobile?: boolean;
}

function Tooltip({
  children,
  tooltipContent,
  offset = 10,
  anchor = Anchor.TOP_LEFT,
  activeOnMobile = false,
}: TooltipProps): JSX.Element {
  const [position, setPosition] = useState<Coordinates>({
    x: 0,
    y: 0,
  });
  const [visible, setVisible] = useState<boolean>(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = (event: React.MouseEvent) => {
    if (!tooltipRef.current) return;
    setPosition(
      getTooltipPosition(
        { x: event.clientX, y: event.clientY },
        tooltipRef.current,
        offset,
        anchor
      )
    );
  };

  return (
    <span
      className={classes.wrapper}
      onMouseEnter={(e) => {
        updatePosition(e);
        setVisible(true);
      }}
      onMouseLeave={() => setVisible(false)}
      onMouseMove={updatePosition}
    >
      {children}
      {(isDesktop || activeOnMobile) &&
        createPortal(
          <div
            ref={tooltipRef}
            style={{
              left: position.x,
              top: position.y,
            }}
            className={classNames(classes.tooltip, {[classes.visible]: visible})}
          >
            {tooltipContent}
          </div>,
          document.body
        )}
    </span>
  );
}

export default Tooltip;
