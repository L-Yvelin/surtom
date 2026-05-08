import { useEffect, useRef } from 'react';
import useChatStore from '../stores/useChatStore';
import useCursorsStore from '../stores/useCursorsStore';
import useGameStore from '../stores/useGameStore';
import useInputStore from '../stores/useInputStore';
import useUIStore from '../stores/useUIStore';

export function resetGameSession(): void {
  useGameStore.getState().resetSession();
  useChatStore.getState().resetSession();
  useUIStore.getState().resetSession();
  useInputStore.getState().resetSession();
}

export function resetGameWorld(): void {
  useGameStore.getState().resetWorld();
  useChatStore.getState().resetWorld();
  useCursorsStore.getState().resetWorld();
}

export function useGameSession(worldId: string = 'default'): void {
  const previousWorldIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (previousWorldIdRef.current !== undefined && previousWorldIdRef.current !== worldId) {
      resetGameWorld();
    }
    previousWorldIdRef.current = worldId;

    return () => {
      resetGameSession();
    };
  }, [worldId]);
}
