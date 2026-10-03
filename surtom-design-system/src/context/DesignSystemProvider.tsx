import { ReactNode } from 'react';
import { DesignSystemContext } from './DesignSystemContext';
import { TooltipProvider } from '../components/Tooltip/TooltipProvider';

interface DesignSystemProviderProps {
  soundEnabled?: boolean;
  children: ReactNode;
}

export function DesignSystemProvider({ soundEnabled = true, children }: DesignSystemProviderProps) {
  return (
    <DesignSystemContext value={{ soundEnabled }}>
      <TooltipProvider>{children}</TooltipProvider>
    </DesignSystemContext>
  );
}
