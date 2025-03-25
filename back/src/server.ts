import WS, { WebSocketServer } from "ws";
import { store } from "./store.js";
import { User as SimpleUser } from "@interfaces/Message.js";
import FullUser from "./models/User.js";
import databaseService from "./services/databaseService.js";
import Constants from "./utils/constants.js";
import { handleCommand, subscribe } from "./handlers/commandHandler.js";
import {
  generateRandomHash,
  getRandomFunnyName,
  handleIsBanned,
  mapDatabaseUserToMemoryUser,
  validateText,
  validateUsername,
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

    if (sessionUser) {
      if (sessionUser.banned) {
        handleIsBanned(user);
        return;
      } else {
        if (sessionUser.isModerator) {
          user.connection.send(
            JSON.stringify({
              Type: "mod",
              status: "success",
              moderatorHash: sessionHash,
            })
          );
        }
      }
    }

    user.connection.send(
      JSON.stringify({
        Type: "userData",
        Texte: {
          isLoggedIn: user.isLoggedIn,
          isModerator: user.isModerator,
          mobileDevice: user.mobileDevice,
          name: user.name,
          sentTheScore: user.sentTheScore,
          mots: user.isLoggedIn
            ? await databaseService.getDailyScore(user.name)
            : [],
        },
      })
    );

    user.connection.send(
      JSON.stringify({
        Type: "stats",
        Texte: JSON.stringify(
          await databaseService.getScoreDistribution(user.name)
        ),
      })
    );

    const currentState = store.getState();
    currentState.users[user.id] = user;
    store.setState(currentState);

    user.connection.send(
      JSON.stringify({ Type: "setUsername", Pseudo: user.name })
    );

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

    connection.on("message", (message: string) => {
      isAlive = true;

      message = JSON.parse(message);
      if ((message as any)?.Type !== "ping") {
        const type = (message as any)?.Type ?? "Unknown Type";
        const texte = (message as any)?.Texte ?? "";

        const truncatedTexte =
          texte.length > 100
            ? texte.slice(0, 50) + "..." + texte.slice(-50)
            : texte.length > 50
            ? texte.slice(0, 50) + "..."
            : texte;

        console.log("Received message:", `${type}: ${truncatedTexte}`);
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
    .getLastMessageTimestamp()
    .then((timestamp) => {
      if (timestamp) {
        user.connection.send(
          JSON.stringify({
            Type: "lastTimeMessage",
            lastMessageTimestamp: timestamp,
          })
        );
      }
    })
    .catch((err) => {
      console.error("Error getting last message timestamp:", err);
    });

  databaseService
    .getMessages(
      !!user.isModerator,
      Constants.MAX_MESSAGES_LOADED,
      !user.isLoggedIn
    )
    .then((messages) => {
      if (messages) {
        user.connection.send(
          JSON.stringify({
            Type: "getMessages",
            messages: messages,
          })
        );
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

async function handleMessage(user: FullUser, message: any): Promise<void> {
  const messageType = message.Type || "";
  const messageText = message.Texte || "";
  const messageImage = message.ImageData ?? null;
  const answeringId = message.Answer ?? null;

  if (!user.isModerator && !["ping", "isTyping"].includes(messageType)) {
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

  if (messageText?.length && messageText.startsWith("/")) {
    const command = messageText.substr(1).trim();
    handleCommand(user, command);
    return;
  }

  if (messageType === "getMessages") {
    databaseService
      .getMessages(
        !!user.isModerator,
        Constants.MAX_MESSAGES_LOADED,
        !user.isLoggedIn
      )
      .then((messages) => {
        const message = JSON.stringify({
          Type: "getMessages",
          messages: messages,
        });
        user.connection.send(message);
        console.log(
          `${new Date().toISOString()} (${
            user.id
          }) User got messages history: ${user.name}`
        );
      })
      .catch((err) => {
        console.error("Error getting messages:", err);
      });
  } else if (messageType === "mailAll" && messageText.trim().length > 0) {
    const isModerator = user.isModerator;

    if (
      (!user.isModerator && !validateText(messageText)) ||
      !validateUsername(user.name) ||
      (messageImage && messageImage.size > 110 * 1024)
    )
      return;

    try {
      const message = await databaseService.saveMessage(
        user.name,
        messageText,
        !!isModerator,
        "message",
        messageImage,
        answeringId
      );
      sendMessagesAll(message, !!isModerator);
      logMessage(messageText, user);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  } else if (
    messageType === "scoreToChat" &&
    messageText.trim().length > 0 &&
    !user.sentTheScore
  ) {
    const motDuJour = await databaseService.getTodaysWord();
    const decodedJson = JSON.parse(messageText);

    if (decodedJson && decodedJson.tab_couleurs && decodedJson.liste_mots) {
      const mots = JSON.stringify({
        couleurs: decodedJson.tab_couleurs,
        mots: decodedJson.liste_mots,
      });

      try {
        const message = await databaseService.saveMessage(
          user.name,
          mots,
          !!user.isModerator,
          "score"
        );
        sendMessagesAll(message, !!user.isModerator, "score");
        user.sentTheScore = true;
        console.log(
          `${new Date().toISOString()} (${user.id}) ${user.name} sent their ${
            decodedJson.tab_couleurs.length
          } ${decodedJson.tab_couleurs.length === 1 ? "try" : "tries"} score`
        );
      } catch (err) {
        console.error("Error saving score:", err);
      }
    } else {
      console.error(
        `${new Date().toISOString()} (${user.id}) ${
          user.name
        } Invalid JSON or missing 'tab_couleurs'`
      );
    }
  } else if (messageType === "deleteMessage" && user.isModerator) {
    const messageId = parseInt(messageText);
    if (!isNaN(messageId)) {
      databaseService
        .deleteMessage(messageId, user.isModerator)
        .then((deleted) => {
          if (deleted) {
            user.connection.send(
              JSON.stringify({ Type: "log", status: "success" })
            );
            sendMessagesAll(
              { ID: messageId },
              !!user.isModerator,
              "deleteMessage"
            );
          } else {
            user.connection.send(
              JSON.stringify({ Type: "log", status: "failure" })
            );
          }
        })
        .catch((err) => {
          console.error("Error deleting message:", err);
        });
    }
  } else if (messageType === "isTyping") {
    sendMessagesAll({ Texte: user.name }, !!user.isModerator, "isTyping");
  } else if (messageType === "ping") {
    return;
  } else {
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
      listeningTypes[messageType].forEach((u) => {
        u.send(JSON.stringify({ Type: messageType, Texte: messageText }));
      });
    } else {
      console.log(
        `${new Date().toISOString()} (${user.id}) ${
          user.name
        } Wrong message type or empty (${messageType})`
      );
    }
  }
}

function updateUsersList(): void {
  const currentState = store.getState();
  const userList = Object.values(currentState.users)
    .filter((user) => user.name)
    .reduce<Array<SimpleUser>>(
      (acc, user) => {
        const existingUser = acc.find((u) => u.name === user.name);
        if (!existingUser) {
          acc.push({
            name: user.name,
            isModerator: user.isModerator,
            isMobile: user.mobileDevice,
          });
        }
        return acc;
      },
      []
    );

  const message = { users: userList };
  sendMessagesAll(message, false, "usersList");
}

function sendMessagesAll(
  message: any,
  isModerator = false,
  messageType = "message"
): void {
  wss.clients.forEach((client) => {
    if (client.readyState === WS.OPEN) {
      client.send(
        JSON.stringify({
          ...message,
          Type: messageType,
          Moderator: isModerator,
        })
      );
    }
  });
}

export { updateUsersList };
