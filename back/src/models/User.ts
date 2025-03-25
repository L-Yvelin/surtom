import WS from "ws";

class FullUser {
  id: string;
  name: string;
  isModerator: number;
  connection: WS;
  messageCount: number;
  lastMessageTimestamp: string | null;
  messageCooldown: number;
  cooldownMultiplier: number;
  sentTheScore: boolean;
  listeningTypes: string[];
  ip: string;
  isLoggedIn: boolean;
  mobileDevice: boolean;
  banned: boolean;

  constructor(
    id: string,
    name: string,
    isModerator: number,
    connection: WS,
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
    this.listeningTypes = [];
    this.ip = ip;
    this.isLoggedIn = isLoggedIn;
    this.mobileDevice = mobileDevice;
    this.banned = banned;
  }
}

export default FullUser;
