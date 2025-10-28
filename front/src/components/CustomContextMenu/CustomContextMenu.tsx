import { JSX, ReactNode, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getTooltipPosition, Coordinates, Anchor } from "../Tooltip/utils";
import classes from "./CustomContextMenu.module.css";
import classNames from "classnames";

interface CustomContextMenuProps {
  children: ReactNode;
  menuContent: ReactNode;
  offset?: number;
}

function CustomContextMenu({
  children,
  menuContent,
  offset = 10,
}: CustomContextMenuProps): JSX.Element {
  const [position, setPosition] = useState<Coordinates>({ x: 0, y: 0 });
  const [visible, setVisible] = useState<boolean>(false);
  const [event, setEvent] = useState<React.MouseEvent | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!visible || !event || !menuRef.current) return;

    setPosition(
      getTooltipPosition(
        { x: event.clientX, y: event.clientY },
        menuRef.current,
        offset,
        Anchor.BOTTOM_RIGHT,
      ),
    );
  }, [visible, event, offset]);

  const closeMenu = () => {
    setVisible(false);
  };

  return (
    <span
      className={classes.wrapper}
      onContextMenu={(e) => {
        e.preventDefault();
        setEvent(e);
        setVisible(true);
        document.addEventListener("click", closeMenu, { once: true });
      }}
    >
      {children}
      {visible &&
        createPortal(
          <div className={classes.backdrop} data-ignore-click-outside>
            <div
              ref={menuRef}
              style={{ left: position.x, top: position.y }}
              className={classNames(classes.menu, {
                [classes.visible]: visible,
              })}
            >
              {menuContent}
            </div>
          </div>,
          document.body,
        )}
    </span>
  );
}

export default CustomContextMenu;
