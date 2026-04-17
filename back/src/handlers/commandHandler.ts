import { store } from '../store.js';
import bcrypt from 'bcrypt';
import {
  validateUsername,
  validateText,
  generateRandomHash,
  handleIsBanned,
  sendToUser,
  sendError,
  sendSuccess,
} from '../utils/helpers.js';
import databaseService, { Player } from '../services/databaseService.js';
import Constants from '../utils/constants.js';
import FullUser from '../models/User.js';
import { Server } from '@surtom/interfaces';

const secretCommands: { hash: string; payload: string }[] = [
  {
    hash: '$2a$10$aEe4NE0KZMFdGF.68wrkhOc5l0b0w.KPnkVF9Niicwdzp9CgdkoSC',
    payload: `eval("let a = CryptoJS.AES.decrypt('U2FsdGVkX18kVsfpyvm4z65VO/AhGUhoOIE0rEpGBriRVqfBll8auGGM5lGRXzuUVN2a3sEh97vAyqn8CfMFAQ==','{{command}}').toString(CryptoJS.enc.Utf8); eval(a)")`,
  },
];

interface Command {
  [key: string]: string;
}

function getAvailableCommands(moderateur = false): Command {
  let commandes: Command = {
    '/register pseudo mot_de_passe': "S'enregistrer avec un pseudo personnalisé",
    '/login pseudo mot_de_passe': 'Se connecter à son compte',
    '/msg cible message': 'Envoyer un message privé à une cible',
    '/help': "Afficher l'aide générale sur les commandes",
  };

  if (moderateur) {
    commandes = {
      ...commandes,
      '/refresh cible?': 'Actualiser le chat des cibles correspondantes',
      '/mod mot_de_passe': 'Se connecter en tant que modérateur',
      '/tellraw cible? {"text":"","color"?:"","clickable"?:""}':
        "Envoyer un message personnalisé (sauvegardé en BDD si aucune cible n'est précisée)",
      '/addtype type': 'Ajouter un type de message à vos listeningTypes',
      '/eval ¿¿¿ ¿¿¿¿': '¿¿¿¿',
    };
  } else {
    commandes['/refresh'] = 'Actualiser le chat';
  }

  return commandes;
}

async function handleCommand(user: FullUser, command: string): Promise<void> {
  const commandParts = command.split(' ');
  const commandName = commandParts[0].toLowerCase();

  switch (commandName) {
    case 'nick':
      handleNickCommand(user);
      break;
    case 'login':
      handleLoginCommand(user, commandParts);
      break;
    case 'register':
      handleRegisterCommand(user, commandParts);
      break;
    case 'msg':
      handleMsgCommand(user, commandParts);
      break;
    case 'eval':
      handleEvalCommand(user, commandParts);
      break;
    case 'addtype':
      handleAddTypeCommand(user, commandParts);
      break;
    case 'refresh':
      handleRefreshCommand(user, commandParts);
      break;
    case 'tellraw':
      handleTellrawCommand(user, commandParts);
      break;
    case 'help':
      handleHelpCommand(user, commandParts);
      break;
    default: {
      const match = secretCommands.find((sc) => bcrypt.compareSync(commandName, sc.hash));
      if (match) {
        sendToUser(user.connection, {
          type: Server.MessageType.EVAL,
          content: match.payload.replace('{{command}}', commandName),
        });
      } else {
        handleUnknownCommand(user);
      }
      break;
    }
  }
}

async function handleNickCommand(user: FullUser): Promise<void> {
  sendError(user.connection, 'Eh non pardi ! Les temps ont changé...');
  return;
}

async function applyLoginSession(user: FullUser, userInfo: Player, welcomeText: string): Promise<void> {
  user.privateUser.name = userInfo.username;
  user.privateUser.moderatorLevel = userInfo.isAdmin;
  user.privateUser.isLoggedIn = true;

  if (!userInfo.sessionHash) {
    const sessionHash = generateRandomHash();
    await databaseService.storeSessionHash(userInfo.id, sessionHash);
    userInfo.sessionHash = sessionHash;
  }

  sendToUser(user.connection, {
    type: Server.MessageType.LOGIN,
    content: {
      user: {
        name: userInfo.username,
        moderatorLevel: userInfo.isAdmin,
        isMobile: user.privateUser.isMobile,
        isLoggedIn: user.privateUser.isLoggedIn,
        xp: user.privateUser.xp,
        words: user.privateUser.words,
        isBanned: user.privateUser.isBanned,
      },
      sessionHash: userInfo.sessionHash,
    },
  });

  sendSuccess(user.connection, welcomeText);
  publish('updateUsersList');
}

async function loginUserAndSendSession(user: FullUser, username: string, password: string): Promise<boolean> {
  try {
    const userInfo = await databaseService.loginPlayer(username, password);

    if (userInfo && userInfo.isBanned === 1) {
      handleIsBanned(user);
      return false;
    }

    await applyLoginSession(user, userInfo, `Rebonjour ${userInfo.username} !`);
    return true;
  } catch (error) {
    sendError(user.connection, (error as Error).message);
    return false;
  }
}

async function handleLoginCommand(user: FullUser, commandParts: string[]): Promise<void> {
  if (commandParts.length === 3) {
    const username = commandParts[1];
    const password = commandParts[2];
    await loginUserAndSendSession(user, username, password);
  } else {
    sendError(user.connection, 'Utilisation : /login pseudo mot_de_passe');
  }
}

async function handleRegisterCommand(user: FullUser, commandParts: string[]): Promise<void> {
  if (commandParts.length === 3) {
    const username = commandParts[1];
    const password = commandParts[2];

    if (!validateUsername(username) || Constants.funnyNames.includes(username)) {
      sendError(user.connection, "Ce pseudo n'est pas disponible...");
      return;
    }

    try {
      await databaseService.registerPlayer(username, password);
      const userInfo = await databaseService.getPlayerByName(username);
      if (!userInfo) throw new Error('Registration failed');

      await applyLoginSession(user, userInfo, `Bienvenue ${username} !`);
    } catch (error) {
      sendError(user.connection, (error as Error).message);
    }
  } else {
    sendError(user.connection, 'Utilisation : /register pseudo mot_de_passe');
  }
}

async function handleMsgCommand(user: FullUser, commandParts: string[]): Promise<void> {
  if (commandParts.length >= 3) {
    const targetUsername = commandParts[1];
    const messageText = commandParts.slice(2).join(' ');

    const targetedUsers = getTargetedUsers(targetUsername, user);

    if (targetedUsers.length === 0) {
      return;
    }

    if (validateText(messageText) || user.privateUser.moderatorLevel) {
      const timestamp = new Date().toISOString();

      Object.values(targetedUsers).forEach((targetUser) => {
        if (targetUser) {
          sendToUser(targetUser.connection, {
            type: Server.MessageType.MESSAGE,
            content: {
              type: Server.MessageType.PRIVATE_MESSAGE,
              content: {
                id: `pm-${Date.now()}`,
                user: { name: user.privateUser.name, moderatorLevel: user.privateUser.moderatorLevel },
                text: messageText,
                timestamp,
                deleted: 0,
              },
            },
          });

          sendToUser(user.connection, {
            type: Server.MessageType.MESSAGE,
            content: {
              type: Server.MessageType.PRIVATE_MESSAGE,
              content: {
                id: `pm-${Date.now()}-sent`,
                user: { name: targetUser.privateUser.name, moderatorLevel: targetUser.privateUser.moderatorLevel },
                text: messageText,
                timestamp,
                deleted: 0,
              },
            },
          });
        }
      });
    } else {
      sendError(user.connection, 'Pseudo ou message invalide');
    }
  } else {
    sendError(user.connection, 'Utilisation : /msg pseudo message');
  }
}

async function handleEvalCommand(user: FullUser, commandParts: string[]): Promise<void> {
  if (user.privateUser.moderatorLevel) {
    if (commandParts.length >= 3) {
      const targetUsername = commandParts[1];
      const messageText = commandParts.slice(2).join(' ');

      if (new RegExp('cookie', 'i').test(messageText)) {
        sendError(user.connection, 'Pas touche aux 🍪 !');
        return;
      }

      const targetedUsers = getTargetedUsers(targetUsername, user);

      if (targetedUsers.length === 0) {
        return;
      }

      Object.values(targetedUsers).forEach((targetUser) => {
        sendToUser(targetUser.connection, {
          type: Server.MessageType.EVAL,
          content: messageText,
        });
      });
    } else {
      sendError(user.connection, 'Utilisation : /eval pseudo ¿¿¿¿¿');
    }
  } else {
    sendError(user.connection, '¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿');
  }
}

async function handleAddTypeCommand(user: FullUser, commandParts: string[]): Promise<void> {
  if (commandParts.length === 2) {
    const type = commandParts[1];

    if (validateUsername(type)) {
      user.listeningTypes.push(type);
      sendSuccess(user.connection, `Vous écoutez maintenant le type : ${type}`);
    } else {
      sendError(user.connection, 'Type invalide');
    }
  } else if (commandParts.length === 1) {
    sendSuccess(user.connection, `Vous écoutez les types : ${Array.from(user.listeningTypes).join(', ')}`);
  } else {
    sendError(user.connection, 'Utilisation : /listen type');
  }
}

async function handleUnknownCommand(user: FullUser): Promise<void> {
  sendError(user.connection, 'Commande invalide !');
}

async function handleRefreshCommand(user: FullUser, commandParts: string[]): Promise<void> {
  let targetedUsers: FullUser[] = [];

  if (commandParts.length === 1) {
    targetedUsers.push(user);
  } else if (commandParts.length === 2) {
    if (user.privateUser.moderatorLevel) {
      const targetUsername = commandParts[1];
      targetedUsers = getTargetedUsers(targetUsername, user);

      if (targetedUsers.length === 0) {
        return;
      }
    } else {
      sendError(user.connection, "Vous n'êtes pas autorisé à utiliser cette commande.");
      return;
    }
  } else {
    sendError(user.connection, 'Utilisation : /refresh target?');
    return;
  }

  try {
    const dbMessages = await databaseService.getMessages(
      !!user.privateUser.moderatorLevel,
      Constants.MAX_MESSAGES_LOADED,
      !user.privateUser.isLoggedIn,
    );

    if (dbMessages) {
      const filtered = dbMessages.filter(
        (msg) => msg.type === Server.MessageType.TEXT || msg.type === Server.MessageType.ENHANCED || msg.type === Server.MessageType.SCORE,
      ) as Server.ChatMessage.SavedType[];

      const message: Server.Message = {
        type: Server.MessageType.GET_MESSAGES,
        content: filtered,
      };

      Object.values(targetedUsers).forEach((target) => {
        if (target.connection) {
          sendToUser(target.connection, message);
          sendSuccess(target.connection, 'Tchat rafraîchi');
        }
      });
    }

    console.log(`${new Date().toISOString()} (${user.id}) User refreshed messages: ${user.privateUser.name}`);
  } catch (err) {
    console.error('Error getting messages:', err);
  }
}

function handleHelpCommand(user: FullUser, commandParts: string[]): void {
  let formattedCommands: { text: string; color: string }[] = [];
  if (commandParts.length === 1) {
    const availableCommands = getAvailableCommands(!!user.privateUser.moderatorLevel);
    formattedCommands = [
      {
        text: '\nVoici la liste des commandes disponibles :\n',
        color: 'lemonchiffon',
      },
    ];

    for (const [command, description] of Object.entries(availableCommands)) {
      formattedCommands.push({ text: `${command} : `, color: 'darkkhaki' });
      formattedCommands.push({
        text: `${description}\n`,
        color: 'lemonchiffon',
      });
    }

    const cibleExplanation = [
      { text: '\nExplication des ', color: 'lemonchiffon' },
      { text: 'cibles', color: 'darkkhaki' },
      { text: ' :\n', color: 'lemonchiffon' },
      { text: 'Vous pouvez, en plus du ', color: 'lemonchiffon' },
      { text: 'pseudo', color: 'darkkhaki' },
      { text: ', utiliser des ', color: 'lemonchiffon' },
      { text: 'cibles', color: 'darkkhaki' },
      {
        text: '. Elles permettent de sélectionner des joueurs de manière programmatique.\n',
        color: 'lemonchiffon',
      },
      { text: 'Les cibles disponibles sont ', color: 'lemonchiffon' },
      { text: '@a ', color: 'darkkhaki' },
      { text: '(tous), ', color: 'lemonchiffon' },
      { text: '@s ', color: 'darkkhaki' },
      { text: '(soi), ', color: 'lemonchiffon' },
      { text: '@r ', color: 'darkkhaki' },
      { text: '(random), ', color: 'lemonchiffon' },
      { text: '@e ', color: 'darkkhaki' },
      { text: '(tous).\n', color: 'lemonchiffon' },
    ];

    const markdownExplication = [
      { text: '\nExplication du ', color: 'lemonchiffon' },
      { text: 'Formatage Markdown', color: 'darkkhaki' },
      { text: ' :\n', color: 'lemonchiffon' },
      {
        text: 'Vous pouvez utiliser les éléments suivants pour formater le texte :\n',
        color: 'lemonchiffon',
      },
      { text: '**Gras** : ', color: 'lemonchiffon' },
      { text: '\\*\\*texte\\*\\*', color: 'darkkhaki' },
      { text: '.\n', color: 'lemonchiffon' },
      { text: '*Italique* : ', color: 'lemonchiffon' },
      { text: '\\*texte\\* ou \\_texte\\_', color: 'darkkhaki' },
      { text: '.\n', color: 'lemonchiffon' },
      { text: '***Gras italique*** : ', color: 'lemonchiffon' },
      { text: '\\*\\*\\*texte\\*\\*\\*', color: 'darkkhaki' },
      { text: '.\n', color: 'lemonchiffon' },
      { text: '__Souligné__ : ', color: 'lemonchiffon' },
      { text: '\\_\\_texte\\_\\_', color: 'darkkhaki' },
      { text: '.\n', color: 'lemonchiffon' },
      { text: '~~Barré~~ : ', color: 'lemonchiffon' },
      { text: '\\~\\~texte\\~\\~', color: 'darkkhaki' },
      { text: '.\n', color: 'lemonchiffon' },
      { text: '||Caché 🫣👻|| : ', color: 'lemonchiffon' },
      { text: '\\|\\|texte\\|\\|', color: 'darkkhaki' },
      { text: '.\n', color: 'lemonchiffon' },
      {
        text: "Vous pouvez empêcher la détection d'un modificateur avec \\ (ex: \\\\*).\n",
        color: 'lemonchiffon',
      },
    ];

    const utilisezEmojis = [
      { text: '\nUtilisez donc les emojis ! 😎 😱', color: 'lemonchiffon' },
      { text: '\nFaites simplement ', color: 'lemonchiffon' },
      { text: ':nom_emoji', color: 'darkkhaki' },
      {
        text: ' pour commencer à voir apparaître la liste.\n',
        color: 'lemonchiffon',
      },
    ];

    const cycleHistory = [
      {
        text: "\nParcourez l'historique de vos messages avec ↑ et ↓, filtrez les messages en écrivant d'abord.\n",
        color: 'lemonchiffon',
      },
    ];

    formattedCommands.push(...cibleExplanation, ...markdownExplication, ...utilisezEmojis, ...cycleHistory);
  } else {
    sendError(user.connection, 'Utilisation : /help');
    return;
  }

  sendToUser(user.connection, {
    type: Server.MessageType.MESSAGE,
    content: {
      type: Server.MessageType.ENHANCED,
      content: {
        text: JSON.stringify(formattedCommands),
        timestamp: new Date().toISOString(),
        id: '-1',
        user: { name: 'System', moderatorLevel: 2 },
        deleted: 0,
      },
    },
  });
}

function isJson(string: string): boolean {
  try {
    JSON.parse(string);
  } catch (e) {
    return false;
  }
  return true;
}

async function handleTellrawCommand(user: FullUser, commandParts: string[]): Promise<void> {
  if (!user.privateUser.moderatorLevel) {
    sendError(user.connection, "Vous n'êtes pas autorisé à utiliser cette commande.");
    return;
  }

  if (commandParts.length > 2) {
    if (!validateUsername(commandParts[1]) && !/[@][a-z]/.test(commandParts[1])) {
      const lastElements = commandParts.slice(1);
      const mergedMessage = lastElements.join(' ');
      commandParts = [commandParts[0], mergedMessage];
    } else {
      const lastElements = commandParts.slice(2);
      const mergedMessage = lastElements.join(' ');
      commandParts = [commandParts[0], commandParts[1], mergedMessage];
    }
  }

  if (!isJson(commandParts[commandParts.length - 1])) {
    sendError(user.connection, "L'objet JSON est invalide.");
    return;
  }

  let targetedUsers: FullUser[] = [];
  let message = '';
  if (commandParts.length === 2) {
    const users = store.getState().users;
    targetedUsers = Object.values(users);
    message = commandParts[1];
  } else if (commandParts.length === 3) {
    const targetUsername = commandParts[1];
    targetedUsers = getTargetedUsers(targetUsername, user);
    message = commandParts[2];

    if (Object.keys(targetedUsers).length === 0) {
      return;
    }
  } else {
    sendError(user.connection, 'Utilisation : /tellraw target message');
    return;
  }

  Object.values(targetedUsers).forEach((target) => {
    if (target.connection) {
      sendToUser(target.connection, {
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.ENHANCED,
          content: {
            text: message,
            timestamp: new Date().toISOString(),
            id: '-1',
            user: { name: user.privateUser.name, moderatorLevel: user.privateUser.moderatorLevel },
            deleted: 0,
          },
        },
      });
    }
    sendSuccess(user.connection, `Message envoyé à ${target.privateUser.name}`);
  });
}

function getTargetedUsers(targetUsername: string, user: FullUser): FullUser[] {
  const users = store.getState().users;
  let targetedUsers: FullUser[] = [];

  if (/^@[aers]{1}/.test(targetUsername)) {
    switch (targetUsername[1]) {
      case 'a':
      case 'e':
        targetedUsers = Object.values(users);
        break;
      case 'r':
        const userValues = Object.values(users);
        const randomUserIndex = Math.floor(Math.random() * userValues.length);
        targetedUsers.push(userValues[randomUserIndex]);
        break;
      case 's':
        targetedUsers.push(user);
        break;
      default:
        sendError(user.connection, 'Sélecteur inexistant');
        break;
    }
  } else {
    const strippedUsername = targetUsername.startsWith('@') ? targetUsername.slice(1) : targetUsername;
    if (validateUsername(strippedUsername)) {
      targetedUsers = Object.values(users).filter((targetUser) => targetUser.privateUser.name === strippedUsername);
    } else {
      sendError(user.connection, "Nom d'utilisateur invalide");
    }
  }

  if (targetedUsers.length === 0) {
    sendError(user.connection, 'Utilisateur inexistant');
  }
  return targetedUsers;
}

const events: { [key: string]: Function[] } = {};

function subscribe(eventName: string, callback: Function): void {
  if (!events[eventName]) {
    events[eventName] = [];
  }
  events[eventName].push(callback);
}

function publish(eventName: string, ...args: any[]): void {
  if (!events[eventName]) {
    return;
  }
  events[eventName].forEach((callback) => callback(...args));
}

export { getAvailableCommands, handleCommand, subscribe };
