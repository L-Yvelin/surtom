import FullUser from '../models/FullUser.js';
import { env } from '../config/env.js';

export function logMessage(message: string, user: FullUser): void {
  const logLine = `${new Date().toISOString()} (${user.id}) <${user.privateUser.name}> ${message}`;
  console.log(logLine);

  if (env.ntfyUrl) {
    fetch(env.ntfyUrl, {
      method: 'PUT',
      body: `<${user.privateUser.name}> ${message}`,
      headers: {
        'Content-Type': 'text/plain',
        Title: 'SURTOM',
        Click: 'https://surtom.yvelin.net/',
        'X-Icon': 'https://surtom.yvelin.net/images/diamond_block.png',
      },
    }).catch((err) => console.error('ntfy error:', err));
  }
}
