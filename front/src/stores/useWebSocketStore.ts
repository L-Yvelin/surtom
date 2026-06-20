import { create } from 'zustand';
import { Server, Client } from '@surtom/interfaces';
import { validateServerMessage } from '@surtom/interfaces';
import Cookies from 'js-cookie';
import { isMobile } from 'react-device-detect';
import { handleServerMessage } from './wsMessageHandler';

interface WebSocketState {
  isConnected: boolean;
  isReady: boolean;
  lastMessageTimestamp: string;
  ws: WebSocket | null;
  reconnectTimer: NodeJS.Timeout | null;
  isConnecting: boolean;
  sendMessage: (message: Client.Message) => void;
  connect: () => void;
  disconnect: () => void;
}

const COOKIE_MOBILE_DEVICE = 'mobileDevice';

function setMobileDevice(isMobileDevice: boolean) {
  Cookies.set(COOKIE_MOBILE_DEVICE, String(isMobileDevice), { expires: 365 });
}

export const useWebSocketStore = create<WebSocketState>((set, get) => {
  const handleMessage = (data: Server.Message) =>
    handleServerMessage(data, {
      setLastMessageTimestamp: (ts) => set({ lastMessageTimestamp: ts }),
    });

  const scheduleReconnect = () => {
    const { reconnectTimer } = get();
    if (reconnectTimer) return;
    console.warn('Scheduling WebSocket reconnection...');
    const timer = setTimeout(() => {
      set({ reconnectTimer: null });
      get().connect();
    }, 2000);
    set({ reconnectTimer: timer });
  };

  const connect = () => {
    const { ws, isConnecting } = get();
    if (isConnecting || (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING))) {
      console.warn('WebSocket is already open or connecting.');
      console.log('WebSocket state :', ws?.readyState);
      return;
    }

    const protocol = import.meta.env.VITE_WEBSOCKET_PROTOCOL;
    const host = import.meta.env.VITE_WEBSOCKET_HOST;
    const port = import.meta.env.VITE_WEBSOCKET_PORT;
    const path = import.meta.env.VITE_WEBSOCKET_PATH ?? '';
    if (!protocol || !host) {
      console.error('WebSocket URL is not defined: missing VITE_WEBSOCKET_PROTOCOL or VITE_WEBSOCKET_HOST');
      return;
    }
    const defaultPort = protocol === 'wss' ? '443' : '80';
    const portSuffix = port && port !== defaultPort ? `:${port}` : '';
    const url = `${protocol}://${host}${portSuffix}${path}`;

    setMobileDevice(isMobile);
    set({ isConnecting: true });
    console.warn('Connecting WebSocket...');

    const socket = new WebSocket(url);
    set({ ws: socket });

    // Add event listeners
    socket.onopen = () => {
      console.warn('WebSocket connected!');
      set({ isConnected: true, isConnecting: false });
    };

    socket.onmessage = (event) => {
      let data: Server.Message;
      try {
        data = JSON.parse(event.data);
      } catch {
        console.warn('Received malformed WebSocket message:', event.data);
        return;
      }
      if (!validateServerMessage(data)) {
        console.warn('Received invalid server message:', data);
        return;
      }
      handleMessage(data);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      set({ isConnecting: false });
      socket.close();
    };

    socket.onclose = () => {
      console.warn('WebSocket connection closed!');
      set({ isConnected: false, isReady: false, isConnecting: false, ws: null });
      scheduleReconnect();
    };
  };

  const disconnect = () => {
    const { ws, reconnectTimer } = get();
    if (ws) {
      ws.onclose = null;
      ws.onerror = null;
      console.warn('Disconnecting WebSocket...');
      ws.close();
      set({ ws: null });
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      set({ reconnectTimer: null });
    }
    set({ isConnecting: false, isConnected: false, isReady: false });
  };

  const sendMessage = (message: Client.Message) => {
    const { ws } = get();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  return {
    isConnected: false,
    isReady: false,
    lastMessageTimestamp: '',
    ws: null,
    reconnectTimer: null,
    isConnecting: false,
    sendMessage,
    connect,
    disconnect,
  };
});

window.addEventListener('beforeunload', () => {
  useWebSocketStore.getState().disconnect();
});
