import WS, { WebSocketServer } from "ws";
import { store } from "./store.js";
import { Server, Client } from "@interfaces/Message.js";
import FullUser from "./models/User.js";
import databaseService from "./services/databaseService.js";
import Constants from "./utils/constants.js";
import { handleCommand, subscribe } from "./handlers/commandHandler.js";
import {
  generateRandomHash,
  getRandomFunnyName,
  mapDatabaseMessageToMemoryMessage,
  mapDatabaseTypeToMemoryType,
  mapDatabaseUserToMemoryUser,
  mapScoreMessageToMemoryMessage,
  mapUserMessageToMemoryMessage,
  validateText,
} from "./utils/helpers.js";

subscribe("updateUsersList", updateUsersList);

console.log("SERVER STARTING...");

const wss = new WebSocketServer({ port: 27020 });

wss.on("error", (err) => {
  console.error("Websocket error:", err);
});

wss.on("listening", () => {
  console.log("Websocket server listening on port 27020");
});

wss.on("connection", async (connection, req) => {
  console.log("New connection");

  try {
    const cookies = req.headers?.cookie
      ?.split(";")
      .reduce((acc: { [key: string]: string }, cookie) => {
        let [key, value] = cookie.split("=");
        acc[key.trim()] = value.trim();
        return acc;
      }, {});

    let sessionUser: FullUser | null = null;
    const sessionHash = (cookies && cookies.modHash) || undefined;
    const usesMobileDevice = !!(cookies && cookies.mobileDevice);
    if (sessionHash)
      sessionUser = mapDatabaseUserToMemoryUser(
        await databaseService.getUserWithSessionHash(sessionHash)
      );

    const ip = (
      req.headers["x-forwarded-for"] || req.socket.remoteAddress
    )?.toString();

    const user = new FullUser(
      generateRandomHash(),
      sessionUser?.name || getRandomFunnyName(),
      sessionUser?.isModerator || 0,
      connection,
      ip,
      sessionUser ? true : false,
      usesMobileDevice
    );

    const userInfoMessage: Server.Message = {
      type: Server.MessageType.LOGIN,
      content: {
        user: {
          name: user.name,
          moderatorLevel: user.isModerator,
          isLoggedIn: user.isLoggedIn,
          isMobile: user.mobileDevice,
          sentTheScore: user.sentTheScore,
          words: user.isLoggedIn
            ? await databaseService.getDailyScore(user.name)
            : [],
          isBanned: user.banned,
        },
      },
    };
    user.connection.send(JSON.stringify(userInfoMessage));

    const statsMessage: Server.Message = {
      type: Server.MessageType.STATS,
      content: await databaseService.getScoreDistribution(user.name),
    };
    user.connection.send(JSON.stringify(statsMessage));

    const currentState = store.getState();
    currentState.users[user.id] = user;
    store.setState(currentState);

    let isAlive = true;
    const isDeadInterval = setInterval(() => {
      if (!isAlive) {
        console.log("Connection is dead, closing");
        connection.terminate();
        updateUsersList();
        clearInterval(isDeadInterval);
      }

      isAlive = false;
      connection.ping();
    }, 30000);

    connection.on("message", (stringMessage: string) => {
      isAlive = true;

      const message: Client.Message = JSON.parse(stringMessage);

      if (
        message.type !== Client.MessageType.PING &&
        message.type !== Client.MessageType.IS_TYPING
      ) {
        const text = JSON.stringify(message.content);

        const truncatedTexte =
          JSON.stringify(message.content).length > 100
            ? text.slice(0, 50) + "..." + text.slice(-50)
            : text.length > 50
            ? text.slice(0, 50) + "..."
            : text;

        console.log("Received message:", `${message.type}: ${truncatedTexte}`);
      }

      handleMessage(user, message);
    });

    connection.on("close", () => {
      console.log("Connection closed");

      clearInterval(isDeadInterval);
      const currentState = store.getState();
      delete currentState.users[user.id];
      store.setState(currentState);

      updateUsersList();
    });

    initializeConnection(user);
  } catch (e) {
    console.log(e);
  }
});

function initializeConnection(user: FullUser): void {
  updateUsersList();

  console.log(`New connection: [${user.ip}] ${user.name}`);

  databaseService
    .getMessages(
      !!user.isModerator,
      Constants.MAX_MESSAGES_LOADED,
      !user.isLoggedIn
    )
    .then((DBmessages) => {
      if (DBmessages) {
        const message: Server.Message = {
          type: Server.MessageType.GET_MESSAGES,
          content: DBmessages.map((m) => ({
            type: mapDatabaseTypeToMemoryType(m.Type),
            content: mapDatabaseMessageToMemoryMessage(m),
          })) as Server.ChatMessage[],
        };
        user.connection.send(JSON.stringify(message));
      }
    })
    .catch((err) => {
      console.error("Error getting last message timestamp:", err);
    });
}

function logMessage(message: string, user: FullUser): void {
  const logMessage = `${new Date().toISOString()} (${user.id}) <${
    user.name
  }> ${message}`;
  console.log(logMessage);
  fetch("https://ntfy.sh/surtom3630", {
    method: "PUT",
    body: `<${user.name}> ${message}`,
    headers: {
      "Content-Type": "text/plain",
      Title: "SURTOM",
      Click: "https://surtom.yvelin.net/",
      "X-Icon": "https://surtom.yvelin.net/images/diamond_block.png",
    },
  });
}

async function handleMessage(
  user: FullUser,
  message: Client.Message
): Promise<void> {
  if (message.type === Client.MessageType.PING) {
    return;
  }

  // Handle command
  if (
    message.type === Client.MessageType.CHAT_MESSAGE &&
    message.content.text.startsWith("/")
  ) {
    const command = message.content.text.slice(1).trim();
    handleCommand(user, command);
    return;
  }

  // Increment message count and handle rate limiting
  if (!user.isModerator && message.type !== Client.MessageType.IS_TYPING) {
    user.messageCount++;

    if (user.messageCount > 5) {
      if (user.lastMessageTimestamp !== null) {
        const timeSinceLastMessage =
          Date.now() - new Date(user.lastMessageTimestamp).getTime();
        if (timeSinceLastMessage < user.messageCooldown * 1000) {
          user.messageCooldown *= user.cooldownMultiplier;
          console.log(
            `${new Date().toISOString()} (${user.id}) ${
              user.name
            } Message cooldown in effect`
          );
          return;
        } else {
          user.messageCooldown = 1;
        }
      }
    }

    user.lastMessageTimestamp = new Date().toISOString();
  }

  switch (message.type) {
    case Client.MessageType.CHAT_MESSAGE:
    case Client.MessageType.SCORE_TO_CHAT:
      await handleChatMessage(user, message);
      break;
    case Client.MessageType.DELETE_MESSAGE:
      await handleDeleteMessage(user, message.content);
      break;
    case Client.MessageType.IS_TYPING:
      sendMessagesAll({
        type: Server.MessageType.IS_TYPING,
        content: user.name,
      });
      break;
    default:
      // @ts-expect-error
      handleCustomMessageType(user, message.type, message.content);
      break;
  }
}

async function handleChatMessage(
  user: FullUser,
  chatMessage: Client.ChatMessage
): Promise<void> {
  switch (chatMessage.type) {
    case Client.MessageType.SCORE_TO_CHAT:
      await handleScoreToChat(user, chatMessage.content);
      break;
    case Client.MessageType.CHAT_MESSAGE:
      if (
        (!user.isModerator && !validateText(chatMessage.content.text.trim())) ||
        (chatMessage.content.imageData &&
          chatMessage.content.imageData.size > 110 * 1024)
      ) {
        return;
      }
      await handleMailAll(user, chatMessage);
      break;
  }
}

async function handleMailAll(
  user: FullUser,
  chatMessage: Extract<
    Client.ChatMessage,
    { type: Client.MessageType.CHAT_MESSAGE }
  >
) {
  try {
    const savedMessage = await databaseService.saveMessage(
      user.name,
      chatMessage.content.text,
      !!user.isModerator,
      "message",
      chatMessage.content.imageData,
      parseInt(chatMessage.content.replyId ?? "") || undefined
    );

    if (!savedMessage) {
      console.error(
        `${new Date().toISOString()} (${user.id}) ${
          user.name
        } Failed to save message`
      );
      return;
    }

    const message: Server.ChatMessage = {
      type: Server.MessageType.MAIL_ALL,
      content: mapUserMessageToMemoryMessage(savedMessage),
    };

    sendMessagesAll({
      type: Server.MessageType.MESSAGE,
      content: message,
    } as Server.Message);
    logMessage(message.content.text, user);
  } catch (err) {
    console.error("Error saving message:", err);
  }
}

async function handleScoreToChat(user: FullUser, content: any): Promise<void> {
  if (user.sentTheScore) return;

  const { tab_couleurs, liste_mots } = content;
  if (!tab_couleurs || !liste_mots) {
    console.error(
      `${new Date().toISOString()} (${user.id}) ${
        user.name
      } Invalid score data: missing tab_couleurs or liste_mots`
    );
    return;
  }

  const mots = JSON.stringify({
    couleurs: tab_couleurs,
    mots: liste_mots,
  });

  try {
    const savedScore = await databaseService.saveMessage(
      user.name,
      mots,
      !!user.isModerator,
      "score"
    );

    if (!savedScore) {
      console.error(
        `${new Date().toISOString()} (${user.id}) ${
          user.name
        } Failed to save score message`
      );
      return;
    }

    const message: Server.ChatMessage = {
      content: mapScoreMessageToMemoryMessage(savedScore),
      type: Server.MessageType.SCORE,
    };

    sendMessagesAll({
      type: Server.MessageType.MESSAGE,
      content: message,
    });
    user.sentTheScore = true;
    console.log(
      `${new Date().toISOString()} (${user.id}) ${user.name} sent their ${
        tab_couleurs.length
      } ${tab_couleurs.length === 1 ? "try" : "tries"} score`
    );
  } catch (err) {
    console.error("Error saving score:", err);
  }
}

async function handleDeleteMessage(
  user: FullUser,
  messageId: number
): Promise<void> {
  if (!user.isModerator || isNaN(messageId)) return;

  try {
    const deleted = await databaseService.deleteMessage(
      messageId,
      user.isModerator
    );

    if (deleted) {
      user.connection.send(
        JSON.stringify({
          type: Server.MessageType.LOG,
          content: `Successfully deleted message with id ${messageId}`,
        })
      );

      sendMessagesAll({
        type: Server.MessageType.DELETE_MESSAGE,
        content: messageId,
      });
    } else {
      user.connection.send(
        JSON.stringify({
          type: Server.MessageType.LOG,
          content: `Failed to delete message with id ${messageId}`,
        })
      );
    }
  } catch (err) {
    console.error("Error deleting message:", err);
  }
}

function handleCustomMessageType(
  user: FullUser,
  messageType: string,
  messageContent: any
): void {
  const listeningTypes = Object.values(store.getState().users).reduce<{
    [key: string]: WS[];
  }>((acc, user) => {
    user.listeningTypes.forEach((type) => {
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(user.connection as WS);
    });
    return acc;
  }, {});

  if (listeningTypes[messageType]) {
    console.log(
      `${new Date().toISOString()} (${user.id}) ${
        user.name
      } Sent to custom type (${messageType})`
    );

    listeningTypes[messageType].forEach((connection) => {
      connection.send(
        JSON.stringify({
          type: messageType,
          content: messageContent,
        })
      );
    });
  } else {
    console.log(
      `${new Date().toISOString()} (${user.id}) ${
        user.name
      } Wrong message type or empty (${messageType})`
    );
  }
}

function updateUsersList(): void {
  const currentState = store.getState();
  const userList = Object.values(currentState.users)
    .filter((user) => user.name)
    .reduce<Array<Server.User>>((acc, user) => {
      const existingUser = acc.find((u) => u.name === user.name);
      if (!existingUser) {
        acc.push({
          name: user.name,
          moderatorLevel: user.isModerator,
          isMobile: user.mobileDevice,
          isLoggedIn: user.isLoggedIn,
        });
      }
      return acc;
    }, []);

  const message: Server.Message = {
    content: userList,
    type: Server.MessageType.USER_LIST,
  };
  sendMessagesAll(message);
}

function sendMessagesAll(message: Server.Message): void {
  wss.clients.forEach((client) => {
    if (client.readyState === WS.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

export { updateUsersList };
