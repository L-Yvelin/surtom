import { useEffect, useRef } from 'react';
import useUIStore from '../../stores/useUIStore';
import useChatStore from '../../stores/useChatStore';

const useShortcuts = () => {
  const { setVisibility } = useUIStore();

  const showChat = useUIStore((state) => state.showChat);
  const { focusInput } = useChatStore();
  const showChatRef = useRef(showChat);

  useEffect(() => {
    showChatRef.current = showChat;
  }, [showChat]);

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        setVisibility('showTab', true);
        break;
      case 'Escape':
        setVisibility('showTab', false);
        setVisibility('showStats', false);
        setVisibility('showCustomWord', false);
        setVisibility('showEndPage', false);
        setVisibility('showChat', false);
        break;
      case '/':
        if (!showChatRef.current) {
          setVisibility('showChat', true);
          event.preventDefault();
          focusInput('/');
        }
        break;
      case 't':
        if (!showChatRef.current) {
          setVisibility('showChat', true);
          event.preventDefault();
        }
        break;
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setVisibility('showTab', false);
    }
  };

  return { handleKeyDown, handleKeyUp };
};

export default useShortcuts;
