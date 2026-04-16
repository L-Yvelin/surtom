import { useContext } from 'react';
import TooltipContext from './TooltipContext';

export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) throw new Error('useTooltip must be used within TooltipProvider');
  return context;
};
