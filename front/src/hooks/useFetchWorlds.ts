import { useEffect } from 'react';
import { useWebSocketStore } from '../stores/useWebSocketStore';
import { useWorldsStore } from '../stores/useWorldsStore';
import { buildListWorldsMessage } from './listWorldsMessage';

export function useFetchWorlds(): void {
  const isConnected = useWebSocketStore((s) => s.isConnected);

  useEffect(() => {
    if (!isConnected) return;

    const { setFetching, reset } = useWorldsStore.getState();
    reset();
    setFetching(true);
    useWebSocketStore.getState().sendMessage(buildListWorldsMessage());
  }, [isConnected]);
}
