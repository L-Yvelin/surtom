import { useRef } from 'react';
import useClickOutside from './useClickOutside';
import useUIStore, { useVisibility } from '../stores/useUIStore';
import useInputStore, { useModalScope } from '../stores/useInputStore';

const useToast = (id: string, toastButtonRef?: React.RefObject<HTMLElement | null>, onEscape?: () => void) => {
  const toastRef = useRef<HTMLDivElement>(null);
  const visible = useVisibility(id);
  const setVisibility = useUIStore((s) => s.setVisibility);

  const close = () => setVisibility(id, false);
  const closeIfTop = () => {
    const top = useInputStore.getState().top();
    if (top && top.id !== id) return;
    close();
  };

  useClickOutside(toastRef, closeIfTop, toastButtonRef ? [toastButtonRef] : []);
  useModalScope(id, visible, onEscape ?? close);

  return { toastRef, visible };
};

export default useToast;
