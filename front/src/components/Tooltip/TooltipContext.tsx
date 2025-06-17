import { createContext, ReactNode, useContext, useRef, useState } from "react";
import { TooltipSingleton } from "./TooltipSingleton";

const TooltipContext = createContext<any>(null);

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [className, setClassName] = useState<string>("");
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  return (
    <TooltipContext.Provider value={{ setVisible, setContent, setPosition, tooltipRef, setClassName }}>
      {children}
      <TooltipSingleton
        visible={visible}
        content={content}
        position={position}
        tooltipRef={tooltipRef}
        className={className}
      />
    </TooltipContext.Provider>
  );
}

export const useTooltip = () => useContext(TooltipContext);
