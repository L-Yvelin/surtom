import { createContext, useContext } from 'react';

export interface DesignSystemContextValue {
  soundEnabled: boolean;
}

export const DesignSystemContext = createContext<DesignSystemContextValue>({ soundEnabled: true });

export const useDesignSystem = (): DesignSystemContextValue => useContext(DesignSystemContext);
