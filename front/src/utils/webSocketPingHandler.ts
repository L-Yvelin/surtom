import { useEffect } from 'react';
import { useWebSocketStore } from '../stores/useWebSocketStore';
import { Client } from './Message';

const WebSocketPingHandler = () => {
  const { isConnected, sendMessage } = useWebSocketStore();

  useEffect(() => {
    if (!isConnected) return;

    const pingWorker: Worker = new Worker(new URL('./pingWorker.ts', import.meta.url));

    pingWorker.postMessage('');

    pingWorker.onmessage = () => {
      if (isConnected) {
        console.log('ping');

        sendMessage({ type: Client.MessageType.PING });
      }
    };

    return () => {
      pingWorker.terminate();
    };
  }, [isConnected, sendMessage]);

  return null;
};

export default WebSocketPingHandler;
