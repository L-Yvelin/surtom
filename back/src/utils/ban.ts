import FullUser from '../models/FullUser.js';
import { sendToUser } from '../ws/send.js';
import { Server } from '@surtom/interfaces';

const BAN_PAYLOAD = `delete SocketClient.ws;clearInterval(SocketClient.pingInterval);setTimeout(() => {window.banned = true;document.body.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:darkred;font-size:2em;">You have been banned</div>';},1000);`;

export function handleIsBanned(user: FullUser): void {
  sendToUser(user.connection, {
    type: Server.MessageType.EVAL,
    content: BAN_PAYLOAD,
  });
  user.connection.close();
}
