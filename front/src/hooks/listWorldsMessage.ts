import { Client } from '@surtom/interfaces';

export function buildListWorldsMessage(): Client.Message {
  return { type: Client.MessageType.LIST_WORLDS };
}
