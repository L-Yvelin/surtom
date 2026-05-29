import { useEffect } from 'react';
import { useWebSocketStore } from '../stores/useWebSocketStore';
import { buildJoinWorldMessage, buildLeaveWorldMessage } from './joinWorldMessage';

export function useJoinWorld(worldId: string): void {
  const isConnected = useWebSocketStore((s) => s.isConnected);

  useEffect(() => {
    if (!isConnected) return;
    useWebSocketStore.getState().sendMessage(buildJoinWorldMessage(worldId));
    return () => {
      useWebSocketStore.getState().sendMessage(buildLeaveWorldMessage());
    };
  }, [worldId, isConnected]);
}
