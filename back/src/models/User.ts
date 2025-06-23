import WS from "ws";
import { Server } from "./Message";

class FullUser {
  id: string;
  privateUser: Server.PrivateUser;
  connection: WS;
  messageCount: number;
  lastMessageTimestamp: string | null;
  messageCooldown: number;
  cooldownMultiplier: number;
  listeningTypes: string[];
  ip: string;

  constructor(
    id: string,
    privateUser: Server.PrivateUser,
    connection: WS,
    ip: string = "unknown"
  ) {
    this.id = id;
    this.privateUser = privateUser;
    this.connection = connection;
    this.messageCount = 0;
    this.lastMessageTimestamp = null;
    this.messageCooldown = 1;
    this.cooldownMultiplier = 2;
    this.listeningTypes = [];
    this.ip = ip;
  }
}

export default FullUser;
