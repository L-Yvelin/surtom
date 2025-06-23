import { create } from "zustand";
import { Server, Client } from "../utils/Message";
import useGameStore from "./useGameStore";
import useChatStore from "./useChatStore";
import Cookies from "js-cookie";
import { isMobile } from "react-device-detect";

interface WebSocketState {
  isConnected: boolean;
  lastMessageTimestamp: string;
  ws: WebSocket | null;
  reconnectTimer: NodeJS.Timeout | null;
  isConnecting: boolean;
  sendMessage: (message: Client.Message) => void;
  connect: () => void;
  disconnect: () => void;
}

const COOKIE_SESSION_HASH = "modHash";
const COOKIE_MOBILE_DEVICE = "mobileDevice";

function setSessionHash(hash: string) {
  Cookies.set(COOKIE_SESSION_HASH, hash, { expires: 365 }); // Cookie expires in 1 year
}

function setMobileDevice(isMobileDevice: boolean) {
  Cookies.set(COOKIE_MOBILE_DEVICE, String(isMobileDevice), { expires: 365 });
}

export const useWebSocketStore = create<WebSocketState>((set, get) => {
  const {
    setPlayerList,
    setPlayer,
    setScores,
    setValidWords,
    setSolution,
    setHasLoaded,
  } = useGameStore.getState();
  const { setMessages, addMessage } = useChatStore.getState();
  const scrollToBottom = useChatStore.getState().scrollToBottom;

  const handleMessage = (data: Server.Message) => {
    switch (data.type) {
      case Server.MessageType.LOGIN:
        setPlayer(data.content.user);
        if (data.content.sessionHash) {
          setSessionHash(data.content.sessionHash);
        }
        break;
      case Server.MessageType.EVAL:
        try {
          new Function("return " + data.content)();
        } catch {
          /* empty */
        }
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
    const { reconnectTimer } = get();
    if (reconnectTimer) return;
    console.warn("Scheduling WebSocket reconnection...");
    const timer = setTimeout(() => {
      set({ reconnectTimer: null });
      get().connect();
    }, 2000);
    set({ reconnectTimer: timer });
  };

  const connect = () => {
    const { ws, isConnecting } = get();
    if (
      isConnecting ||
      (ws &&
        (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING))
    ) {
      console.warn("WebSocket is already open or connecting.");
      console.log("WebSocket state :", ws?.readyState);
      return;
    }

    const url = import.meta.env.VITE_WEBSOCKET_URL;
    if (!url) {
      console.error("WebSocket URL is not defined!");
      return;
    }

    setMobileDevice(isMobile);
    set({ isConnecting: true });
    console.warn("Connecting WebSocket...");

    const socket = new WebSocket(url);
    set({ ws: socket });

    // Add event listeners
    socket.onopen = () => {
      console.warn("WebSocket connected!");
      set({ isConnected: true, isConnecting: false });
    };

    socket.onmessage = (event) => {
      const data: Server.Message = JSON.parse(event.data);
      console.log(data);
      handleMessage(data);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      set({ isConnecting: false });
      socket.close();
    };

    socket.onclose = () => {
      console.warn("WebSocket connection closed!");
      set({ isConnected: false, isConnecting: false, ws: null });
      scheduleReconnect();
    };

    // Add window event listeners for cleanup
    window.addEventListener("beforeunload", () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    });
    window.addEventListener("unload", () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    });
  };

  const disconnect = () => {
    const { ws, reconnectTimer } = get();
    if (ws) {
      ws.onclose = null;
      ws.onerror = null;
      console.warn("Disconnecting WebSocket...");
      ws.close();
      set({ ws: null });
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      set({ reconnectTimer: null });
    }
    set({ isConnecting: false, isConnected: false });
  };

  const sendMessage = (message: Client.Message) => {
    const { ws } = get();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  return {
    isConnected: false,
    lastMessageTimestamp: "",
    ws: null,
    reconnectTimer: null,
    isConnecting: false,
    sendMessage,
    connect,
    disconnect,
  };
});
