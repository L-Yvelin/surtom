import WS, { WebSocketServer } from "ws";
import { store } from "src/store.js";
import { Server, Client } from "./models/Message";
import FullUser from "src/models/User.js";
import databaseService from "src/services/databaseService.js";
import Constants from "src/utils/constants.js";
import { handleCommand, subscribe } from "src/handlers/commandHandler.js";
import {
  generateRandomHash,
  getRandomFunnyName,
  validateText,
} from "src/utils/helpers.js";

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

    console.log(cookies);

    const ip = (
      req.headers["x-forwarded-for"] || req.socket.remoteAddress
    )?.toString();

    let sessionUser: FullUser | null = null;
    const sessionHash = (cookies && cookies.modHash) || undefined;
    const usesMobileDevice = cookies && cookies.mobileDevice === 'true' || false;
    if (sessionHash) {
      const player = await databaseService.getPlayerBySessionHash(sessionHash);
      if (player) {
        // Build PrivateUser from Player
        const privateUser: Server.PrivateUser = {
          name: player.username,
          moderatorLevel: player.isAdmin,
          isLoggedIn: true,
          isMobile: usesMobileDevice,
          sentTheScore: false,
          words: [],
          isBanned: !!player.isBanned,
          xp: 0,
        };
        sessionUser = new FullUser(generateRandomHash(), privateUser, connection, ip);
      }
    }

    // Build PrivateUser for FullUser
    const privateUser: Server.PrivateUser = sessionUser
      ? sessionUser.privateUser
      : {
        name: getRandomFunnyName(),
        moderatorLevel: 0,
        isLoggedIn: false,
        isMobile: usesMobileDevice,
        sentTheScore: false,
        words: [],
        isBanned: false,
        xp: 0,
      };

    const user = new FullUser(
      generateRandomHash(),
      privateUser,
      connection,
      ip
    );

    const userInfoMessage: Server.Message = {
      type: Server.MessageType.LOGIN,
      content: {
        user: user.privateUser,
      },
    };
    user.connection.send(JSON.stringify(userInfoMessage));

    const statsMessage: Server.Message = {
      type: Server.MessageType.STATS,
      content: await databaseService.getScoreDistribution(user.privateUser.name),
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
        const text = JSON.stringify(message.content) ?? "";

        const truncatedTexte =
          text.length > 100
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

  console.log(`New connection: [${user.ip}] ${user.privateUser.name}`);

  databaseService
    .getMessages(
      !!user.privateUser.moderatorLevel,
      Constants.MAX_MESSAGES_LOADED,
      !user.privateUser.isLoggedIn
    )
    .then((DBmessages) => {
      if (DBmessages) {
        const userMessages = DBmessages.filter(
          (msg) =>
            msg.type === Server.MessageType.MAIL_ALL ||
            msg.type === Server.MessageType.ENHANCED_MESSAGE ||
            msg.type === Server.MessageType.SCORE
        ) as Server.ChatMessage.SavedType[];
        const message: Server.Message = {
          type: Server.MessageType.GET_MESSAGES,
          content: userMessages,
        };
        user.connection.send(JSON.stringify(message));
      }
    })
    .catch((err) => {
      console.error("Error getting last message timestamp:", err);
    });

  databaseService.getTodaysWord().then((word) => {
    if (word) {
      databaseService.getValidWords(word.toUpperCase()).then((validWords) => {
        const message: Server.Message = {
          type: Server.MessageType.DAILY_WORDS,
          content: [...(validWords.map(w => w.toUpperCase())), word.toUpperCase()],
        };
        user.connection.send(JSON.stringify(message));
      });
    } else {
      console.error("No word found for today");
    }
  });
}

function logMessage(message: string, user: FullUser): void {
  const logMessage = `${new Date().toISOString()} (${user.id}) <${user.privateUser.name
    }> ${message}`;
  console.log(logMessage);
  fetch("https://ntfy.sh/surtom3630", {
    method: "PUT",
    body: `<${user.privateUser.name}> ${message}`,
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
  if (!user.privateUser.moderatorLevel && message.type !== Client.MessageType.IS_TYPING) {
    user.messageCount++;

    if (user.messageCount > 5) {
      if (user.lastMessageTimestamp !== null) {
        const timeSinceLastMessage =
          Date.now() - new Date(user.lastMessageTimestamp).getTime();
        if (timeSinceLastMessage < user.messageCooldown * 1000) {
          user.messageCooldown *= user.cooldownMultiplier;
          console.log(
            `${new Date().toISOString()} (${user.id}) ${user.privateUser.name
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
        content: user.privateUser.name,
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
      await handleScoreToChat(user, chatMessage);
      break;
    case Client.MessageType.CHAT_MESSAGE:
      if (
        (!user.privateUser.moderatorLevel && !validateText(chatMessage.content.text.trim())) ||
        (chatMessage.content.imageData &&
          chatMessage.content.imageData.length > 110 * 1024)
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
      user.privateUser,
      chatMessage
    );

    if (!savedMessage) {
      console.error(
        `${new Date().toISOString()} (${user.id}) ${user.privateUser.name
        } Failed to save message`
      );
      return;
    }

    sendMessagesAll(savedMessage);
    logMessage(chatMessage.content.text, user);
  } catch (err) {
    console.error("Error saving message:", err);
  }
}

async function handleScoreToChat(user: FullUser, message: Extract<Client.Message, { type: Client.MessageType.SCORE_TO_CHAT }>): Promise<void> {
  if (user.privateUser.sentTheScore) return;

  if (!message.content.attempts || !Array.isArray(message.content.attempts) || message.content.attempts.length > 6) {
    console.error(
      `${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Invalid score data: invalid attempts`
    );
    return;
  }

  let scoreSolution: string | null = null;
  if (message.content.custom && typeof message.content.custom === 'string') {
    scoreSolution = message.content.custom;
  } else {
    scoreSolution = await databaseService.getTodaysWord();
  }

  if (!scoreSolution) {
    console.error(
      `${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Could not determine reference word for score validation.`
    );
    return;
  }

  const attemptsAreValid = message.content.attempts.every(
    (attempt) =>
      Array.isArray(attempt) &&
      attempt.length === scoreSolution!.length &&
      attempt.every(letter => typeof letter === 'string') &&
      attempt[0][0] === scoreSolution![0]
  );

  if (!attemptsAreValid) {
    console.error(
      `${new Date().toISOString()} (${user.id}) ${user.privateUser.name} Invalid attempts: not all attempts match the reference word's first letter and length.`
    );
    return;
  }

  try {
    const savedMessage = await databaseService.saveMessage(
      user.privateUser,
      message
    );

    if (!savedMessage) {
      console.error(
        `${new Date().toISOString()} (${user.id}) ${user.privateUser.name
        } Failed to save score message`
      );
      return;
    }

    sendMessagesAll(savedMessage);
    logMessage("Score sent", user);
  } catch (err) {
    console.error("Error saving score message:", err);
  }
}

async function handleDeleteMessage(
  user: FullUser,
  messageId: number
): Promise<void> {
  if (!user.privateUser.moderatorLevel || isNaN(messageId)) return;

  try {
    const deleted = await databaseService.toggleMessage(
      messageId,
      user.privateUser
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
      `${new Date().toISOString()} (${user.id}) ${user.privateUser.name
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
      `${new Date().toISOString()} (${user.id}) ${user.privateUser.name
      } Wrong message type or empty (${messageType})`
    );
  }
}

function updateUsersList(): void {
  const { users } = store.getState();
  const userList = Object.values(users)
    .filter((user) => user.privateUser.name)
    .reduce<Array<Server.User>>((acc, user) => {
      const existingUser = acc.find((u) => u.name === user.privateUser.name);
      if (!existingUser) {
        acc.push({
          name: user.privateUser.name,
          moderatorLevel: user.privateUser.moderatorLevel,
          isMobile: user.privateUser.isMobile,
          isLoggedIn: user.privateUser.isLoggedIn,
          xp: user.privateUser.xp,
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
