import { useEffect, useRef } from 'react';
import useUIStore, { useVisibility } from '../../stores/useUIStore';
import useChatStore from '../../stores/useChatStore';

const useShortcuts = () => {
  const setVisibility = useUIStore((s) => s.setVisibility);
  const closeAll = useUIStore((s) => s.closeAll);
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
        closeAll();
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
