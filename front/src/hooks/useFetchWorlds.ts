import { useEffect } from 'react';
import { useWebSocketStore } from '../stores/useWebSocketStore';
import { useWorldsStore } from '../stores/useWorldsStore';
import { buildListWorldsMessage } from './listWorldsMessage';

export function useFetchWorlds(): void {
  const isReady = useWebSocketStore((s) => s.isReady);

  useEffect(() => {
    if (!isReady) return;

    const { setFetching, reset } = useWorldsStore.getState();
    reset();
    setFetching(true);
    useWebSocketStore.getState().sendMessage(buildListWorldsMessage());
  }, [isReady]);
}
