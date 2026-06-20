import { useEffect } from 'react';
import { useChatStore } from '../stores/useChatStore';
import { useCursorsStore } from '../stores/useCursorsStore';
import { useGameStore } from '../stores/useGameStore';
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
  useEffect(() => {
    resetGameWorld();
    return () => {
      resetGameSession();
    };
  }, [worldId]);
}
