import { createContext, ReactNode } from "react";

interface TooltipContextType {
  setVisible: (visible: boolean) => void;
  setContent: (content: ReactNode) => void;
  setPosition: (pos: { x: number; y: number }) => void;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
}

const TooltipContext = createContext<TooltipContextType | null>(null);

export default TooltipContext;
