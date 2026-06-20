import { ReactNode, useEffect, useLayoutEffect, useState } from 'react';
import { useTooltip } from './useTooltip';
import { getTooltipPosition, Anchor } from './utils';
import { isDesktop } from 'react-device-detect';

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tooltipContent: ReactNode;
  offset?: number;
  anchor?: Anchor;
  activeOnMobile?: boolean;
  as?: React.ElementType;
};

function Tooltip({
  children,
  tooltipContent,
  offset = 10,
  anchor = Anchor.TOP_LEFT,
  activeOnMobile = false,
  className,
  as = 'span',
  ...props
}: Props) {
  const { setVisible, setContent, setPosition, tooltipRef } = useTooltip();
  const [pendingCoords, setPendingCoords] = useState<{ x: number; y: number } | null>(null);

  const As = as;

  useLayoutEffect(() => {
    if (!pendingCoords || !tooltipRef.current) return;
    const pos = getTooltipPosition(pendingCoords, tooltipRef.current, offset, anchor);
    setPosition(pos);
    setVisible(true);
  }, [pendingCoords, offset, anchor, setPosition, setVisible, tooltipRef]);

  const updatePosition = (x: number, y: number) => {
    if (!tooltipRef.current) return;
    const pos = getTooltipPosition({ x, y }, tooltipRef.current, offset, anchor);
    setPosition(pos);
  };

  const handleClick = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    setContent(tooltipContent);
    setPendingCoords({ x: clientX, y: clientY });
  };

  useEffect(() => {
    if (!activeOnMobile || isDesktop) return;

    const handleTouch = () => setVisible(false);
    document.addEventListener('touchstart', handleTouch);

    return () => {
      document.removeEventListener('touchstart', handleTouch);
    };
  }, [activeOnMobile, setVisible]);

  if (!isDesktop && !activeOnMobile) return <>{children}</>;

  return (
    <As
      onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
        if (isDesktop) {
          setContent(tooltipContent);
          setPendingCoords({ x: e.clientX, y: e.clientY });
        }
      }}
      onMouseLeave={() => isDesktop && setVisible(false)}
      onMouseMove={(e: React.MouseEvent<HTMLSpanElement>) => isDesktop && updatePosition(e.clientX, e.clientY)}
      onClick={(e: React.MouseEvent<HTMLSpanElement>) => !isDesktop && activeOnMobile && handleClick(e)}
      className={className}
      {...props}
    >
      {children}
    </As>
  );
}

export default Tooltip;
