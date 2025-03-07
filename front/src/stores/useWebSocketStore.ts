import { create } from "zustand";
import useGameStore from "./useGameStore";
import { MessageType } from "../components/Chat/Chat";
import useChatStore from "./useChatStore";

interface UserData {
  isLoggedIn: boolean;
  isModerator: boolean;
  mobileDevice: boolean;
  name: string;
  sentTheScore: boolean;
  mots: string[];
}

type Stats = Record<string, number>;

interface SetUsername {
  Pseudo: string;
}

interface UsersList {
  users: { name: string; isModerator: number; isMobile: boolean }[];
}

interface LastTimeMessage {
  lastMessageTimestamp: string;
}

interface GetMessages {
  messages: ServerMessage[];
}

interface ServerMessage {
  ID: string;
  Pseudo: string;
  Texte: string;
  Date: string;
  Moderator: number;
  Type: MessageType;
  Supprime: number;
  Reply: string | undefined;
  Couleurs: string | undefined;
  Mots: string[] | undefined;
  Answer: string | undefined;
  Attempts: number | undefined;
  ImageData: string | undefined;
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

  const connect = () => {
    if (ws) return;
    console.warn("Connecting WebSocket...");

    const url = process.env.REACT_APP_WEBSOCKET_URL;
    if (!url) {
      console.error("WebSocket URL is not defined!");
      return;
    }

    ws = new WebSocket(url);

    ws.onopen = () => {
      set({ isConnected: true });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);

      handleMessage(data);
    };

    ws.onclose = () => {
      console.warn("WebSocket connection closed!");
      set({ isConnected: false });
      scheduleReconnect();
    };
  };

  const disconnect = () => {
    if (ws) {
      console.warn("Disconnecting WebSocket...");
      ws.close();
      ws = null;
    }
  };

  const sendMessage = (message: any, type: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ Type: type, ...message }));
    }
  };

  const handleMessage = (data: any) => {
    switch (data.Type) {
      case "userData":
        const userData: UserData = data.Texte;
        break;
      case "stats":
        const stats: Stats = JSON.parse(data.Texte);
        setScores(stats);
        break;
      case "setUsername":
        const setUsernameData: SetUsername = data;
        useGameStore.getState().setPlayer({ name: setUsernameData.Pseudo });
        break;
      case "usersList":
        const usersList: UsersList = data;
        setPlayerList(
          usersList.users.map((user) => {
            return {
              name: user.name,
              isMobile: user.isMobile,
              isModerator: user.isModerator,
              xp: 0,
            };
          })
        );
        console.log(usersList.users);
        break;
      case "lastTimeMessage":
        const lastTimeMessage: LastTimeMessage = data;
        set({ lastMessageTimestamp: lastTimeMessage.lastMessageTimestamp });
        break;
      case "getMessages":
        const getMessages: GetMessages = data;
        setMessages(
          getMessages.messages.map((message) => {
            return {
              id: message.ID ?? Math.random().toString(),
              player: {
                name: message.Pseudo,
                isMobile: message.Moderator === 1,
                isModerator: message.Moderator,
                xp: 0,
              },
              content: {
                text: message.Texte,
                color: message.Couleurs,
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
