import WS from 'ws';
import { Server } from '@surtom/interfaces';
import { COOLDOWN_INITIAL_SECONDS, COOLDOWN_MULTIPLIER } from '../config/constants.js';

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
  worldId: string | null;
  playerId: number | null;

  constructor(id: string, privateUser: Server.PrivateUser, connection: WS, ip: string = 'unknown', worldId: string | null = null) {
    this.id = id;
    this.privateUser = privateUser;
    this.connection = connection;
    this.messageCount = 0;
    this.lastMessageTimestamp = null;
    this.messageCooldown = COOLDOWN_INITIAL_SECONDS;
    this.cooldownMultiplier = COOLDOWN_MULTIPLIER;
    this.listeningTypes = [];
    this.ip = ip;
    this.worldId = worldId;
    this.playerId = null;
  }
}

export default FullUser;
