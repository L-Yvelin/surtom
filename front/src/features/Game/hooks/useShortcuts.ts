import { useEffect, useRef } from 'react';
import useUIStore, { useVisibility } from '../../../stores/useUIStore';
import useInputStore from '../../../stores/useInputStore';
import { useChatStore } from '../../../stores/useChatStore';
import { useSettingsStore } from '../../../stores/useSettingsStore';
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
  const keybindings = useSettingsStore((s) => s.keybindings);
  const showChatRef = useRef(showChat);

  useEffect(() => {
    showChatRef.current = showChat;
  }, [showChat]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleEscape(() => toggle(UI.GAME_MENU));
      return;
    }
    if (event.key === keybindings.playerList) {
      event.preventDefault();
      setVisibility(UI.TAB, true);
      return;
    }
    if (event.key === keybindings.openCommand) {
      if (!showChatRef.current) {
        setVisibility(UI.CHAT, true);
        event.preventDefault();
        focusInput('/');
      }
      return;
    }
    if (event.key === keybindings.openChat) {
      if (!showChatRef.current) {
        setVisibility(UI.CHAT, true);
        event.preventDefault();
      }
      return;
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === keybindings.playerList) {
      event.preventDefault();
      setVisibility(UI.TAB, false);
    }
  };

  return { handleKeyDown, handleKeyUp };
};

export default useShortcuts;
