import { useCallback, useEffect, useRef } from 'react';
import useShortcuts from './useShortcuts';
import useGameLogic from './useGameLogic';
import useGameStore from '../../stores/useGameStore';
import useUIStore from '../../stores/useUIStore';
import useChatStore from '../../stores/useChatStore';

const isGameKey = (event: KeyboardEvent) => ['Enter', 'Backspace'].includes(event.key) || /^[a-z]$/.test(event.key);

const useKeyPress = () => {
  const gameFinished = useGameStore((s) => s.gameFinished);
  const isAnyInterfaceOpen = useUIStore((s) => s.isAnyInterfaceOpen);
  const showChat = useUIStore((s) => s.showChat);
  const focusInput = useChatStore((s) => s.focusInput);

  const shortcutsState = useShortcuts();
  const gameLogicState = useGameLogic();

  const handlersRef = useRef({
    showChat,
    isAnyInterfaceOpen,
    focusInput,
    gameFinished,
    shortcutsKeyDown: shortcutsState.handleKeyDown,
    shortcutsKeyUp: shortcutsState.handleKeyUp,
    gameKeyDown: gameLogicState.handleKeyDown,
  });

  handlersRef.current = {
    showChat,
    isAnyInterfaceOpen,
    focusInput,
    gameFinished,
    shortcutsKeyDown: shortcutsState.handleKeyDown,
    shortcutsKeyUp: shortcutsState.handleKeyUp,
    gameKeyDown: gameLogicState.handleKeyDown,
  };

  const handleKeyPress = useCallback((event: KeyboardEvent, state: 'up' | 'down') => {
    const h = handlersRef.current;
    if (state === 'down') {
      if (h.showChat && isGameKey(event)) {
        h.focusInput();
      } else if (!isGameKey(event) || h.gameFinished() || event.altKey) {
        h.shortcutsKeyDown(event);
      } else if (!h.isAnyInterfaceOpen() && !h.gameFinished()) {
        h.gameKeyDown(event);
      }
    } else {
      h.shortcutsKeyUp(event);
    }
  }, []);

  return {
    ...shortcutsState,
    ...gameLogicState,
    handleKeyPress,
  };
};

export const useGlobalKeyPress = () => {
  const { handleKeyPress } = useKeyPress();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => handleKeyPress(e, 'down');
    const handleKeyUp = (e: KeyboardEvent) => handleKeyPress(e, 'up');

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyPress]);
};

export default useKeyPress;
