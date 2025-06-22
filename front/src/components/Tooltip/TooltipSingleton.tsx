import { createPortal } from "react-dom";
import { ReactNode } from "react";
import classNames from "classnames";
import classes from "./Tooltip.module.css";

interface Props {
  visible: boolean;
  content: ReactNode;
  position: { x: number; y: number };
  tooltipRef: React.RefObject<HTMLDivElement | null>;
}

export function TooltipSingleton({
  visible,
  content,
  position,
  tooltipRef,
}: Props) {
  if (!tooltipRef) {
    return;
  }
  
  return createPortal(
    <div
      ref={tooltipRef}
      className={classNames(classes.tooltip, { [classes.visible]: visible })}
      style={{ left: position.x, top: position.y }}
    >
      {content}
    </div>,
    document.body
  );
}
