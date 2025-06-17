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

let ws: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let isConnecting = false;
let listenersAdded = false;

export const useWebSocketStore = create<WebSocketState>((set) => {
  const { setPlayerList, setPlayer, setScores, setValidWords, setSolution, setHasLoaded } =
    useGameStore.getState();
  const { setMessages, addMessage } = useChatStore.getState();
  const scrollToBottom = useChatStore.getState().scrollToBottom;

  if (!listenersAdded) {
    window.addEventListener("beforeunload", () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    window.addEventListener("unload", () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    listenersAdded = true;
  }

  const connect = () => {
    if (
      isConnecting ||
      (ws &&
        (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING))
    ) {
      console.warn("WebSocket is already open or connecting.");
      return;
    }

    const url = import.meta.env.VITE_WEBSOCKET_URL;
    if (!url) {
      console.error("WebSocket URL is not defined!");
      return;
    }

    isConnecting = true;
    console.warn("Connecting WebSocket...");

    ws = new WebSocket(url);

    ws.onopen = () => {
      console.warn("WebSocket connected!");
      isConnecting = false;
      set({ isConnected: true });
    };

    ws.onmessage = (event) => {
      const data: Server.Message = JSON.parse(event.data);
      console.log(data);
      handleMessage(data);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      isConnecting = false;
      ws?.close();
    };

    ws.onclose = () => {
      console.warn("WebSocket connection closed!");
      isConnecting = false;
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
    isConnecting = false;
  };

  const sendMessage = (message: Client.Message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  const handleMessage = (data: Server.Message) => {
    switch (data.type) {
      case Server.MessageType.LOGIN:
        setPlayer(data.content.user);
        break;
      case Server.MessageType.STATS:
        setScores(data.content);
        break;
      case Server.MessageType.USER_LIST:
        setPlayerList(data.content);
        break;
      case Server.MessageType.LAST_TIME_MESSAGE:
        set({ lastMessageTimestamp: data.content });
        break;
      case Server.MessageType.GET_MESSAGES:
        setMessages(data.content);
        scrollToBottom?.();
        break;
      case Server.MessageType.MESSAGE:
        addMessage(data.content);
        scrollToBottom?.();
        break;
      case Server.MessageType.DAILY_WORDS:
        setSolution(data.content[data.content.length - 1]);
        setValidWords(data.content);
        setHasLoaded(true);
        break;
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
