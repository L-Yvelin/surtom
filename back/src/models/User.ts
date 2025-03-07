import { WebSocket } from "ws";

class User {
  id: string;
  name: string;
  isModerator: number;
  connection: WebSocket;
  messageCount: number;
  lastMessageTimestamp: string | null;
  messageCooldown: number;
  cooldownMultiplier: number;
  sentTheScore: boolean;
  listeningTypes: Set<string>;
  ip: string;
  isLoggedIn: boolean;
  mobileDevice: boolean;
  banned: boolean;

  constructor(
    id: string,
    name: string,
    isModerator: number,
    connection: WebSocket,
    ip: string = "unknown",
    isLoggedIn: boolean = false,
    mobileDevice: boolean = false,
    banned: boolean = false
  ) {
    this.id = id;
    this.name = name || "default";
    this.isModerator = isModerator || 0;
    this.connection = connection;
    this.messageCount = 0;
    this.lastMessageTimestamp = null;
    this.messageCooldown = 1;
    this.cooldownMultiplier = 2;
    this.sentTheScore = false;
    this.listeningTypes = new Set();
    this.ip = ip;
    this.isLoggedIn = isLoggedIn;
    this.mobileDevice = mobileDevice;
    this.banned = banned;
  }
}

export default User;
