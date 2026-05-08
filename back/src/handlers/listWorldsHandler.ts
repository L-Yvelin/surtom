import { Server } from '@surtom/interfaces';
import FullUser from '../models/FullUser.js';
import { worldRegistry } from '../state/worldRegistry.js';
import { sendToUser } from '../ws/send.js';

export function buildWorldSummaries(): Server.WorldSummary[] {
  return worldRegistry.list().map((w) => ({
    id: w.id,
    displayName: w.displayName,
    language: w.language,
    persistent: w.persistent,
    memberCount: w.members().length,
  }));
}

export function handleListWorlds(user: FullUser): void {
  sendToUser(user.connection, {
    type: Server.MessageType.WORLD_LIST,
    content: buildWorldSummaries(),
  });
}
