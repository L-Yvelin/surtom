import { useEffect, useRef } from 'react';
import useUIStore, { useVisibility } from '../../../stores/useUIStore';
import useInputStore from '../../../stores/useInputStore';
import useChatStore from '../../../stores/useChatStore';
import { GAME_MENU_TOAST_ID } from '../../../ui/GameMenu/GameMenu';

export function handleEscape(closeAll: () => void): void {
  const top = useInputStore.getState().top();
  if (top?.policy === 'modal' && top.onEscape) {
    top.onEscape();
    return;
  }
  closeAll();
}

const useShortcuts = () => {
  const setVisibility = useUIStore((s) => s.setVisibility);
  const toggle = useUIStore((s) => s.toggle);
  const showChat = useVisibility('chat');
  const focusInput = useChatStore((s) => s.focusInput);
  const showChatRef = useRef(showChat);

  useEffect(() => {
    showChatRef.current = showChat;
  }, [showChat]);

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        setVisibility('tab', true);
        break;
      case 'Escape':
        toggle(GAME_MENU_TOAST_ID);
        break;
      case '/':
        if (!showChatRef.current) {
          setVisibility('chat', true);
          event.preventDefault();
          focusInput('/');
        }
        break;
      case 't':
        if (!showChatRef.current) {
          setVisibility('chat', true);
          event.preventDefault();
        }
        break;
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setVisibility('tab', false);
    }
  };

  return { handleKeyDown, handleKeyUp };
};

export default useShortcuts;
