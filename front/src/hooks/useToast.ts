import { useCallback, useRef } from 'react';
import useClickOutside from './useClickOutside';
import useUIStore, { useVisibility } from '../stores/useUIStore';
import { useModalScope } from '../stores/useInputStore';

const useToast = (id: string, toastButtonRef?: React.RefObject<HTMLElement | null>) => {
  const toastRef = useRef<HTMLDivElement>(null);
  const visible = useVisibility(id);
  const setVisibility = useUIStore((s) => s.setVisibility);

  const close = useCallback(() => setVisibility(id, false), [id, setVisibility]);

  useClickOutside(toastRef, close, toastButtonRef ? [toastButtonRef] : []);
  useModalScope(id, visible, close);

  return { toastRef, visible };
};

export default useToast;
