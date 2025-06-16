import { create } from "zustand";
import useGameStore from "./useGameStore";
import useChatStore from "./useChatStore";
import { Client, Server } from "../../../interfaces/Message";

interface WebSocketState {
  isConnected: boolean;
  lastMessageTimestamp: string;
  sendMessage: (message: Client.Message) => void;
  connect: () => void;
  disconnect: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => {
  const { setPlayerList, setScores } = useGameStore.getState();
  const { setMessages, addMessage } = useChatStore.getState();
  const scrollToBottom = useChatStore.getState().scrollToBottom;

  let ws: WebSocket | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;

  window.addEventListener("beforeunload", () => {
    if (ws && ws.OPEN) {
      ws.close();
    }
  });

  window.addEventListener("unload", () => {
    if (ws && ws.OPEN) {
      ws.close();
    }
  });

  const connect = () => {
    if (ws && ws.readyState !== WebSocket.CLOSED) {
      console.warn(
        "Can't connect: WebSocket is already in",
        ws?.readyState,
        "state."
      );
      return;
    }

    console.warn("Connecting WebSocket...", ws?.readyState);

    const url = import.meta.env.VITE_WEBSOCKET_URL;
    if (!url) {
      console.error("WebSocket URL is not defined!");
      return;
    }

    ws = new WebSocket(url);

    ws.onopen = () => {
      console.warn("WebSocket connected!");
      set({ isConnected: true });
    };

    ws.onmessage = (event) => {
      const data: Server.Message = JSON.parse(event.data);
      console.log(data);

      handleMessage(data);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      ws?.close();
    };

    ws.onclose = () => {
      console.warn("WebSocket connection closed!");
      set({ isConnected: false });
      scheduleReconnect();
    };
  };

  const disconnect = () => {
    if (ws) {
      ws.onclose = null;
      ws.onerror = null;
      console.warn("Disconnecting WebSocket...");
      ws.close();
      ws = null;
    }
  };

  const sendMessage = (message: Client.Message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  const handleMessage = (data: Server.Message) => {
    switch (data.type) {
      case Server.MessageType.LOGIN: {
        break;
      }
      case Server.MessageType.STATS: {
        const stats = data.content;
        setScores(stats);
        break;
      }
      case Server.MessageType.USER_LIST: {
        const usersList = data.content;
        setPlayerList(usersList);
        break;
      }
      case Server.MessageType.LAST_TIME_MESSAGE: {
        const lastTimeMessage = data.content;
        set({ lastMessageTimestamp: lastTimeMessage });
        break;
      }
      case Server.MessageType.GET_MESSAGES: {
        const getMessages = data.content;
        setMessages(getMessages);
        scrollToBottom?.();
        break;
      }
      case Server.MessageType.MESSAGE: {
        const message = data.content;
        addMessage(message);
        scrollToBottom?.();
        break;
      }
      default:
        console.warn("Unknown message type:", data.type);
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, 2000);
  };

  return {
    isConnected: false,
    lastMessageTimestamp: "",
    sendMessage,
    connect,
    disconnect,
  };
});
