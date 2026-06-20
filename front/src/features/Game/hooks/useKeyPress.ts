import { useEffect, useRef } from 'react';
import useShortcuts from './useShortcuts';
import useGameLogic from './useGameLogic';
import { useGameStore } from '../../../stores/useGameStore';
import { isGameFinished } from '../utils/gameLogic';
import { useVisibility } from '../../../stores/useUIStore';
import { UI } from '../../../ui/ids';
import useInputStore from '../../../stores/useInputStore';
import { useChatStore } from '../../../stores/useChatStore';
import { dispatchKey } from './keyDispatcher';

const useKeyPress = () => {
  const gameFinished = useGameStore((s) => isGameFinished(s.tries));
  const showChat = useVisibility(UI.CHAT);
  const focusInput = useChatStore((s) => s.focusInput);

  const shortcutsState = useShortcuts();
  const gameLogicState = useGameLogic();

  const handleKeyPress = (event: KeyboardEvent, state: 'up' | 'down') => {
    dispatchKey(event, state, useInputStore.getState().top(), {
      showChat,
      focusInput,
      gameFinished,
      shortcutsKeyDown: shortcutsState.handleKeyDown,
      shortcutsKeyUp: shortcutsState.handleKeyUp,
      gameKeyDown: gameLogicState.handleKeyDown,
    });
  };

  return {
    ...shortcutsState,
    ...gameLogicState,
    handleKeyPress,
  };
};

export const useGlobalKeyPress = () => {
  const { handleKeyPress } = useKeyPress();
  const handleKeyPressRef = useRef(handleKeyPress);
  handleKeyPressRef.current = handleKeyPress;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => handleKeyPressRef.current(e, 'down');
    const handleKeyUp = (e: KeyboardEvent) => handleKeyPressRef.current(e, 'up');

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
};

export default useKeyPress;
