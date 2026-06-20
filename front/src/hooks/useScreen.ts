import { useRef } from 'react';
import useClickOutside from './useClickOutside';
import useUIStore, { useVisibility } from '../stores/useUIStore';
import useInputStore, { useModalScope } from '../stores/useInputStore';
import type { UIId } from '../ui/ids';

const useScreen = (id: UIId, anchorRef?: React.RefObject<HTMLElement | null>, onEscape?: () => void) => {
  const screenRef = useRef<HTMLDivElement>(null);
  const visible = useVisibility(id);
  const setVisibility = useUIStore((s) => s.setVisibility);

  const close = () => setVisibility(id, false);
  const closeIfTop = () => {
    const top = useInputStore.getState().top();
    if (top && top.id !== id) return;
    close();
  };

  useClickOutside(screenRef, closeIfTop, anchorRef ? [anchorRef] : []);
  useModalScope(id, visible, onEscape ?? close);

  return { screenRef, visible };
};

export default useScreen;
