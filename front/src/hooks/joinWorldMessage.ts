import { Client } from '@surtom/interfaces';

export function buildJoinWorldMessage(worldId: string): Client.Message {
  return {
    type: Client.MessageType.JOIN_WORLD,
    content: { worldId },
  };
}

export function buildLeaveWorldMessage(): Client.Message {
  return { type: Client.MessageType.LEAVE_WORLD };
}
