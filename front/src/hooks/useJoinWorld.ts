import { useEffect } from 'react';
import { useWebSocketStore } from '../stores/useWebSocketStore';
import { buildJoinWorldMessage, buildLeaveWorldMessage } from './joinWorldMessage';

export function useJoinWorld(worldId: string): void {
  const isReady = useWebSocketStore((s) => s.isReady);

  useEffect(() => {
    if (!isReady) return;
    useWebSocketStore.getState().sendMessage(buildJoinWorldMessage(worldId));
    return () => {
      useWebSocketStore.getState().sendMessage(buildLeaveWorldMessage());
    };
  }, [worldId, isReady]);
}
