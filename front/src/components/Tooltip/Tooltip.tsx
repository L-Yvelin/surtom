import { ReactNode, useEffect } from "react";
import { useTooltip } from "./TooltipContext";
import { getTooltipPosition, Anchor } from "./utils";
import { isDesktop } from "react-device-detect";

interface Props {
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
}: Props) {
  const { setVisible, setContent, setPosition, tooltipRef } = useTooltip();

  const updatePosition = (x: number, y: number) => {
    if (!tooltipRef.current) return;
    const pos = getTooltipPosition(
      { x, y },
      tooltipRef.current,
      offset,
      anchor
    );
    setPosition(pos);
  };

  const handleClick = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    updatePosition(clientX, clientY);
    setContent(tooltipContent);
    setVisible(true);
  };

  useEffect(() => {
    if (!activeOnMobile || isDesktop) return;

    const handleTouch = () => setVisible(false);
    document.addEventListener("touchstart", handleTouch);

    return () => {
      document.removeEventListener("touchstart", handleTouch);
    };
  }, [activeOnMobile, setVisible]);

  if (!isDesktop && !activeOnMobile) return <>{children}</>;

  return (
    <span
      onMouseEnter={(e) => {
        if (isDesktop) {
          updatePosition(e.clientX, e.clientY);
          setContent(tooltipContent);
          setVisible(true);
        }
      }}
      onMouseLeave={() => isDesktop && setVisible(false)}
      onMouseMove={(e) => isDesktop && updatePosition(e.clientX, e.clientY)}
      onClick={(e) => !isDesktop && activeOnMobile && handleClick(e)}
    >
      {children}
    </span>
  );
}

export default Tooltip;
