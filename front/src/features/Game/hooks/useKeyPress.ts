import { useCallback, useEffect, useRef } from 'react';
import useShortcuts from './useShortcuts';
import useGameLogic from './useGameLogic';
import useGameStore from '../../../stores/useGameStore';
import { useVisibility } from '../../../stores/useUIStore';
import useInputStore from '../../../stores/useInputStore';
import useChatStore from '../../../stores/useChatStore';
import { dispatchKey, KeyDispatchDeps } from './keyDispatcher';

const useKeyPress = () => {
  const gameFinished = useGameStore((s) => s.gameFinished);
  const showChat = useVisibility('chat');
  const focusInput = useChatStore((s) => s.focusInput);

  const shortcutsState = useShortcuts();
  const gameLogicState = useGameLogic();

  const handlersRef = useRef<KeyDispatchDeps>({
    showChat,
    focusInput,
    gameFinished,
    shortcutsKeyDown: shortcutsState.handleKeyDown,
    shortcutsKeyUp: shortcutsState.handleKeyUp,
    gameKeyDown: gameLogicState.handleKeyDown,
  });

  handlersRef.current = {
    showChat,
    focusInput,
    gameFinished,
    shortcutsKeyDown: shortcutsState.handleKeyDown,
    shortcutsKeyUp: shortcutsState.handleKeyUp,
    gameKeyDown: gameLogicState.handleKeyDown,
  };

  const handleKeyPress = useCallback((event: KeyboardEvent, state: 'up' | 'down') => {
    dispatchKey(event, state, useInputStore.getState().top(), handlersRef.current);
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
