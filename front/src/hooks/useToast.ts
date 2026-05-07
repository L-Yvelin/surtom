import { useRef } from 'react';
import useClickOutside from './useClickOutside';
import useUIStore, { useVisibility } from '../stores/useUIStore';

const useToast = (id: string, toastButtonRef?: React.RefObject<HTMLElement | null>) => {
  const toastRef = useRef<HTMLDivElement>(null);
  const visible = useVisibility(id);
  const setVisibility = useUIStore((s) => s.setVisibility);

  useClickOutside(toastRef, () => setVisibility(id, false), toastButtonRef ? [toastButtonRef] : []);

  return { toastRef, visible };
};

export default useToast;
