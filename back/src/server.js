var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import WebSocket from "ws";
import readline from "readline";
import { store } from "./store";
import User from "./models/User";
import databaseService from "./services/databaseService";
import Constants from "./utils/constants";
import { handleCommand, subscribe } from "./handlers/commandHandler";
import { generateRandomHash, getRandomFunnyName, handleIsBanned, mapDatabaseUserToMemoryUser, validateText, validateUsername, } from "./utils/helpers";
subscribe("updateUsersList", updateUsersList);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
rl.on("line", (input) => {
    if (input === "list users") {
        const currentState = store.getState();
        console.log("Current users:");
        for (const userId in currentState.users) {
            const user = currentState.users[userId];
            console.log(`- ${user.name} (ID: ${user.id})`);
        }
    }
});
const wss = new WebSocket.Server({ port: 27020 });
wss.on("connection", (connection, req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const cookies = (_b = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.cookie) === null || _b === void 0 ? void 0 : _b.split(";").reduce((acc, cookie) => {
            let [key, value] = cookie.split("=");
            acc[key.trim()] = value.trim();
            return acc;
        }, {});
        let sessionUser = null;
        const sessionHash = (cookies && cookies.modHash) || undefined;
        const usesMobileDevice = !!(cookies && cookies.mobileDevice);
        if (sessionHash)
            sessionUser = mapDatabaseUserToMemoryUser(yield databaseService.getUserWithSessionHash(sessionHash));
        const ip = (_c = (req.headers["x-forwarded-for"] || req.socket.remoteAddress)) === null || _c === void 0 ? void 0 : _c.toString();
        const user = new User(generateRandomHash(), (sessionUser === null || sessionUser === void 0 ? void 0 : sessionUser.name) || getRandomFunnyName(), (sessionUser === null || sessionUser === void 0 ? void 0 : sessionUser.isModerator) || 0, connection, ip, sessionUser ? true : false, usesMobileDevice);
        if (sessionUser) {
            if (sessionUser.banned) {
                handleIsBanned(user);
                return;
            }
            else {
                if (sessionUser.isModerator) {
                    user.connection.send(JSON.stringify({
                        Type: "mod",
                        status: "success",
                        moderatorHash: sessionHash,
                    }));
                }
            }
        }
        user.connection.send(JSON.stringify({
            Type: "userData",
            Texte: {
                isLoggedIn: user.isLoggedIn,
                isModerator: user.isModerator,
                mobileDevice: user.mobileDevice,
                name: user.name,
                sentTheScore: user.sentTheScore,
                mots: user.isLoggedIn
                    ? yield databaseService.getDailyScore(user.name)
                    : [],
            },
        }));
        user.connection.send(JSON.stringify({
            Type: "stats",
            Texte: JSON.stringify(yield databaseService.getScoreDistribution(user.name)),
        }));
        const currentState = store.getState();
        currentState.users[user.id] = user;
        store.setState(currentState);
        user.connection.send(JSON.stringify({ Type: "setUsername", Pseudo: user.name }));
        connection.on("message", (message) => {
            var _a, _b;
            message = JSON.parse(message);
            if ((message === null || message === void 0 ? void 0 : message.Type) !== "ping") {
                const type = (_a = message === null || message === void 0 ? void 0 : message.Type) !== null && _a !== void 0 ? _a : "Unknown Type";
                const texte = (_b = message === null || message === void 0 ? void 0 : message.Texte) !== null && _b !== void 0 ? _b : "";
                const truncatedTexte = texte.length > 100
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
            const currentState = store.getState();
            delete currentState.users[user.id];
            store.setState(currentState);
            updateUsersList();
        });
        initializeConnection(user);
    }
    catch (e) {
        console.log(e);
    }
}));
function initializeConnection(user) {
    updateUsersList();
    console.log(`New connection: [${user.ip}] ${user.name}`);
    databaseService
        .getLastMessageTimestamp()
        .then((timestamp) => {
        if (timestamp) {
            user.connection.send(JSON.stringify({
                Type: "lastTimeMessage",
                lastMessageTimestamp: timestamp,
            }));
        }
    })
        .catch((err) => {
        console.error("Error getting last message timestamp:", err);
    });
    databaseService
        .getMessages(!!user.isModerator, Constants.MAX_MESSAGES_LOADED, !user.isLoggedIn)
        .then((messages) => {
        if (messages) {
            user.connection.send(JSON.stringify({
                Type: "getMessages",
                messages: messages,
            }));
        }
    })
        .catch((err) => {
        console.error("Error getting last message timestamp:", err);
    });
}
function logMessage(message, user) {
    const logMessage = `${new Date().toISOString()} (${user.id}) <${user.name}> ${message}`;
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
function handleMessage(user, message) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const messageType = message.Type || "";
        const messageText = message.Texte || "";
        const messageImage = (_a = message.ImageData) !== null && _a !== void 0 ? _a : null;
        const answeringId = (_b = message.Answer) !== null && _b !== void 0 ? _b : null;
        if (!user.isModerator && !["ping", "isTyping"].includes(messageType)) {
            user.messageCount++;
            if (user.messageCount > 5) {
                if (user.lastMessageTimestamp !== null) {
                    const timeSinceLastMessage = Date.now() - new Date(user.lastMessageTimestamp).getTime();
                    if (timeSinceLastMessage < user.messageCooldown * 1000) {
                        user.messageCooldown *= user.cooldownMultiplier;
                        console.log(`${new Date().toISOString()} (${user.id}) ${user.name} Message cooldown in effect`);
                        return;
                    }
                    else {
                        user.messageCooldown = 1;
                    }
                }
            }
            user.lastMessageTimestamp = new Date().toISOString();
        }
        if ((messageText === null || messageText === void 0 ? void 0 : messageText.length) && messageText.startsWith("/")) {
            const command = messageText.substr(1).trim();
            handleCommand(user, command);
            return;
        }
        if (messageType === "getMessages") {
            databaseService
                .getMessages(!!user.isModerator, Constants.MAX_MESSAGES_LOADED, !user.isLoggedIn)
                .then((messages) => {
                const message = JSON.stringify({
                    Type: "getMessages",
                    messages: messages,
                });
                user.connection.send(message);
                console.log(`${new Date().toISOString()} (${user.id}) User got messages history: ${user.name}`);
            })
                .catch((err) => {
                console.error("Error getting messages:", err);
            });
        }
        else if (messageType === "mailAll" && messageText.trim().length > 0) {
            const isModerator = user.isModerator;
            if ((!user.isModerator && !validateText(messageText)) ||
                !validateUsername(user.name) ||
                (messageImage && messageImage.size > 110 * 1024))
                return;
            try {
                const message = yield databaseService.saveMessage(user.name, messageText, !!isModerator, "message", messageImage, answeringId);
                sendMessagesAll(message, !!isModerator);
                logMessage(messageText, user);
            }
            catch (err) {
                console.error("Error saving message:", err);
            }
        }
        else if (messageType === "scoreToChat" &&
            messageText.trim().length > 0 &&
            !user.sentTheScore) {
            const motDuJour = yield databaseService.getTodaysWord();
            const decodedJson = JSON.parse(messageText);
            if (decodedJson && decodedJson.tab_couleurs && decodedJson.liste_mots) {
                const mots = JSON.stringify({
                    couleurs: decodedJson.tab_couleurs,
                    mots: decodedJson.liste_mots,
                });
                try {
                    const message = yield databaseService.saveMessage(user.name, mots, !!user.isModerator, "score");
                    sendMessagesAll(message, !!user.isModerator, "score");
                    user.sentTheScore = true;
                    console.log(`${new Date().toISOString()} (${user.id}) ${user.name} sent their ${decodedJson.tab_couleurs.length} ${decodedJson.tab_couleurs.length === 1 ? "try" : "tries"} score`);
                }
                catch (err) {
                    console.error("Error saving score:", err);
                }
            }
            else {
                console.error(`${new Date().toISOString()} (${user.id}) ${user.name} Invalid JSON or missing 'tab_couleurs'`);
            }
        }
        else if (messageType === "deleteMessage" && user.isModerator) {
            const messageId = parseInt(messageText);
            if (!isNaN(messageId)) {
                databaseService
                    .deleteMessage(messageId, user.isModerator)
                    .then((deleted) => {
                    if (deleted) {
                        user.connection.send(JSON.stringify({ Type: "log", status: "success" }));
                        sendMessagesAll({ ID: messageId }, !!user.isModerator, "deleteMessage");
                    }
                    else {
                        user.connection.send(JSON.stringify({ Type: "log", status: "failure" }));
                    }
                })
                    .catch((err) => {
                    console.error("Error deleting message:", err);
                });
            }
        }
        else if (messageType === "isTyping") {
            sendMessagesAll({ Texte: user.name }, !!user.isModerator, "isTyping");
        }
        else if (messageType === "ping") {
            user.connection.send(JSON.stringify({ Type: "pong" }));
        }
        else {
            const listeningTypes = Object.values(store.getState().users).reduce((acc, user) => {
                user.listeningTypes.forEach((type) => {
                    if (!acc[type]) {
                        acc[type] = [];
                    }
                    acc[type].push(user.connection);
                });
                return acc;
            }, {});
            if (listeningTypes[messageType]) {
                console.log(`${new Date().toISOString()} (${user.id}) ${user.name} Sent to custom type (${messageType})`);
                listeningTypes[messageType].forEach((u) => {
                    u.send(JSON.stringify({ Type: messageType, Texte: messageText }));
                });
            }
            else {
                console.log(`${new Date().toISOString()} (${user.id}) ${user.name} Wrong message type or empty (${messageType})`);
            }
        }
    });
}
function updateUsersList() {
    const currentState = store.getState();
    const userList = Object.values(currentState.users)
        .filter((user) => user.name)
        .reduce((acc, user) => {
        const existingUser = acc.find((u) => u.name === user.name);
        if (!existingUser) {
            acc.push({
                name: user.name,
                isModerator: user.isModerator,
                isMobile: user.mobileDevice,
            });
        }
        return acc;
    }, []);
    const message = { users: userList };
    sendMessagesAll(message, false, "usersList");
}
function sendMessagesAll(message, isModerator = false, messageType = "message") {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(Object.assign(Object.assign({}, message), { Type: messageType, Moderator: isModerator })));
        }
    });
}
export { updateUsersList };
