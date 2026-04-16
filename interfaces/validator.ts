import typia from 'typia';
import { Server, Client } from './Message.js';

export const validateServerMessage = typia.createIs<Server.Message>();
export const validateClientMessage = typia.createIs<Client.Message>();
