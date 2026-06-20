import { useEffect, useRef } from 'react';
import useUIStore, { useVisibility } from '../../../stores/useUIStore';
import useInputStore from '../../../stores/useInputStore';
import useChatStore from '../../../stores/useChatStore';
import { UI } from '../../../ui/ids';

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
  const showChat = useVisibility(UI.CHAT);
  const focusInput = useChatStore((s) => s.focusInput);
  const showChatRef = useRef(showChat);

  useEffect(() => {
    showChatRef.current = showChat;
  }, [showChat]);

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        setVisibility(UI.TAB, true);
        break;
      case 'Escape':
        handleEscape(() => toggle(UI.GAME_MENU));
        break;
      case '/':
        if (!showChatRef.current) {
          setVisibility(UI.CHAT, true);
          event.preventDefault();
          focusInput('/');
        }
        break;
      case 't':
        if (!showChatRef.current) {
          setVisibility(UI.CHAT, true);
          event.preventDefault();
        }
        break;
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setVisibility(UI.TAB, false);
    }
  };

  return { handleKeyDown, handleKeyUp };
};

export default useShortcuts;
