import { ReactNode, useRef, useState } from 'react';
import { TooltipSingleton } from './TooltipSingleton';
import TooltipContext from './TooltipContext';

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  return (
    <TooltipContext.Provider value={{ setVisible, setContent, setPosition, tooltipRef }}>
      {children}
      <TooltipSingleton visible={visible} content={content} position={position} tooltipRef={tooltipRef} />
    </TooltipContext.Provider>
  );
}
