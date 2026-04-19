import { ReactNode, useEffect, useRef } from 'react';
import { useTooltip } from './useTooltip';
import { getTooltipPosition, Anchor } from './utils';
import { isDesktop } from 'react-device-detect';

interface Props {
  children: ReactNode;
  tooltipContent: ReactNode;
  offset?: number;
  anchor?: Anchor;
  activeOnMobile?: boolean;
}

function Tooltip({ children, tooltipContent, offset = 10, anchor = Anchor.TOP_LEFT, activeOnMobile = false }: Props) {
  const { setVisible, setContent, setPosition, tooltipRef } = useTooltip();
  const pendingPosRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const updatePosition = (x: number, y: number) => {
    pendingPosRef.current = { x, y };
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const pending = pendingPosRef.current;
      if (!pending || !tooltipRef.current) return;
      const pos = getTooltipPosition(pending, tooltipRef.current, offset, anchor);
      setPosition(pos);
    });
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
    document.addEventListener('touchstart', handleTouch);

    return () => {
      document.removeEventListener('touchstart', handleTouch);
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
