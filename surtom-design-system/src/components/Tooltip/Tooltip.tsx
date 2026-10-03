import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

export function Tooltip({
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

  const hoveredRef = useRef(false);

  const As = as;

  const hide = useCallback(() => {
    hoveredRef.current = false;
    setPendingCoords(null);
    setVisible(false);
  }, [setVisible]);

  useEffect(
    () => () => {
      if (hoveredRef.current) setVisible(false);
    },
    [setVisible],
  );

  useLayoutEffect(() => {
    if (!pendingCoords || !tooltipRef.current) return;
    const pos = getTooltipPosition(pendingCoords, tooltipRef.current, offset, anchor);
    setPosition(pos);
    setVisible(true);
  }, [pendingCoords, offset, anchor, setPosition, setVisible, tooltipRef]);

  const updatePosition = (x: number, y: number) => {
    if (!hoveredRef.current || !tooltipRef.current) return;
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

    const handleTouch = () => hide();
    document.addEventListener('touchstart', handleTouch);

    return () => {
      document.removeEventListener('touchstart', handleTouch);
    };
  }, [activeOnMobile, hide]);

  if (!isDesktop && !activeOnMobile) return <>{children}</>;

  return (
    <As
      onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
        if (isDesktop) {
          hoveredRef.current = true;
          setContent(tooltipContent);
          setPendingCoords({ x: e.clientX, y: e.clientY });
        }
      }}
      onMouseLeave={() => isDesktop && hide()}
      onMouseMove={(e: React.MouseEvent<HTMLSpanElement>) => isDesktop && updatePosition(e.clientX, e.clientY)}
      onClick={(e: React.MouseEvent<HTMLSpanElement>) => !isDesktop && activeOnMobile && handleClick(e)}
      className={className}
      {...props}
    >
      {children}
    </As>
  );
}
