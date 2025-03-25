import { create } from "zustand";
import useGameStore from "./useGameStore";
import {
  Message as ServerMessage,
} from "../../../interfaces/Message";
import useChatStore from "./useChatStore";

interface UserData {
  isLoggedIn: boolean;
  isModerator: boolean;
  mobileDevice: boolean;
  name: string;
  sentTheScore: boolean;
  mots: string[];
}

interface WebSocketState {
  isConnected: boolean;
  lastMessageTimestamp: string;
  sendMessage: (message: any, type: string) => void;
  connect: () => void;
  disconnect: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => {
  const { setPlayerList, setScores } = useGameStore.getState();
  const { setMessages } = useChatStore.getState();
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
      const data = JSON.parse(event.data);
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

  const sendMessage = (message: any, type: MessageType) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ Type: type, ...message }));
    }
  };

  const handleMessage = (data: ServerMessage) => {
    switch (data.type) {
      case MessageType.USER: {
        console.log("GOT USER!");
        break;
      }
      case MessageType.STATS: {
        const stats = data.content;
        setScores(stats);
        break;
      }
      case MessageType.USER_LIST: {
        const usersList = data.content;
        setPlayerList(
          usersList.map((user) => {
            return { ...user, xp: 0 };
          })
        );
        break;
      }
      case MessageType.LAST_TIME_MESSAGE: {
        const lastTimeMessage = data.content;
        set({ lastMessageTimestamp: lastTimeMessage });
        break;
      }
      case MessageType.GET_MESSAGES: {
        const getMessages = data.content;
        setMessages(
          getMessages.map((message) => {
            return {
              id: message.id ?? Math.random().toString(),
              player: {
                name: message.user,
                isModerator: message.isModerator,
                xp: 0,
              },
              content: {
                text: message.text,
                words: message.Mots,
                answer: message.Answer,
                attempts: message.Attempts,
                image: message.ImageData,
              },
              type: message.Type,
              deleted: message.Supprime,
              reply: message.Reply,
              date: message.Date,
            };
          })
        );
        scrollToBottom?.();
        break;
      }
      default:
        console.warn("Unknown message type:", data.Type);
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
