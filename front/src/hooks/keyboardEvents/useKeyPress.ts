import { useEffect } from 'react';
import useShortcuts from './useShortcuts';
import useGameLogic from './useGameLogic';
import useGameStore from '../../stores/useGameStore';
import useUIStore from '../../stores/useUIStore';
import useChatStore from '../../stores/useChatStore';

const useKeyPress = () => {
  const { gameFinished } = useGameStore();
  const { isAnyInterfaceOpen, showChat } = useUIStore();
  const { focusInput } = useChatStore();

  const shortcutsState = useShortcuts();
  const gameLogicState = useGameLogic();

  useEffect(() => {
    const isGameKey = (event: KeyboardEvent) => ['Enter', 'Backspace'].includes(event.key) || /^[a-z]$/.test(event.key);

    const handleKeyPress = (event: KeyboardEvent, state: 'up' | 'down') => {
      if (state === 'down') {
        if (showChat && isGameKey(event)) {
          focusInput();
        } else if (!isGameKey(event) || gameFinished() || event.altKey) {
          shortcutsState.handleKeyDown(event);
        } else if (!isAnyInterfaceOpen() && !gameFinished()) {
          gameLogicState.handleKeyDown(event);
        }
      } else {
        shortcutsState.handleKeyUp(event);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => handleKeyPress(e, 'down');
    const handleKeyUp = (e: KeyboardEvent) => handleKeyPress(e, 'up');

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    showChat,
    isAnyInterfaceOpen,
    focusInput,
    gameFinished,
    shortcutsState.handleKeyDown,
    shortcutsState.handleKeyUp,
    gameLogicState.handleKeyDown,
  ]);

  return {
    ...shortcutsState,
    ...gameLogicState,
  };
};

export default useKeyPress;
