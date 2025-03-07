"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordInHashArray = passwordInHashArray;
exports.generateRandomHash = generateRandomHash;
exports.getRandomFunnyName = getRandomFunnyName;
exports.validateUsername = validateUsername;
exports.validateText = validateText;
exports.getUserRank = getUserRank;
exports.handleIsBanned = handleIsBanned;
exports.mapDatabaseUserToMemoryUser = mapDatabaseUserToMemoryUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const constants_1 = __importDefault(require("./constants"));
const store_1 = __importDefault(require("../store"));
function passwordInHashArray(password, hashArray) {
    return hashArray.some((hash) => bcrypt_1.default.compareSync(password, hash));
}
function generateRandomHash() {
    return crypto_1.default.randomBytes(16).toString("hex");
}
function getRandomFunnyName() {
    return constants_1.default.funnyNames[Math.floor(Math.random() * constants_1.default.funnyNames.length)];
}
function validateUsername(username) {
    const usernamePattern = /^[-_a-zA-Z0-9]{1,16}$/;
    return usernamePattern.test(username);
}
function validateText(text) {
    const textPattern = /^.{1,256}$/;
    return textPattern.test(text);
}
function getUserRank(user) {
    return user.isModerator ? "moderator" : user.isLoggedIn ? "loggedIn" : null;
}
function handleIsBanned(user) {
    var _a;
    const createPrivateMessage = (Pseudo = "¿¿¿", Type = "eval") => ({
        Pseudo,
        Moderator: user.isModerator,
        isLoggedIn: user.isLoggedIn,
        Texte: `delete SocketClient.ws;clearInterval(SocketClient.pingInterval);setTimeout(() => {window.banned = true;let a = document.querySelector("#loading-mask");a.style.display = 'flex';a.style.opacity='1';a.style.zIndex = '999999';a.querySelector('p').innerHTML="<span style='color: darkred;'>You have been banned</span>";body.innerHTML = a.outerHTML;const gifUrl = "https://i.giphy.com/media/Os2Az5qAUancc/giphy.webp"; const img = document.createElement('img'); img.src = gifUrl; img.style.width = "20%"; img.style.height = "auto"; img.style.position = "absolute"; img.style.top = "0"; img.style.left = "0"; img.style.border = "none"; document.querySelector('#loading-mask').appendChild(img); let xPosition = 0; let yPosition = 0; let xDirection = 1; let yDirection = 1; const speed = 2; function moveImage() { const windowWidth = window.innerWidth; const windowHeight = window.innerHeight; const imgWidth = img.clientWidth; const imgHeight = img.clientHeight; xPosition += xDirection * speed; yPosition += yDirection * speed; if (xPosition + imgWidth > windowWidth || xPosition < 0) { xDirection *= -1; xDirection += (Math.random() - 0.5) * 0.2; } if (yPosition + imgHeight > windowHeight || yPosition < 0) { yDirection *= -1; yDirection += (Math.random() - 0.5) * 0.2; } img.style.transform = 'translate(' + xPosition + 'px, ' + yPosition + 'px)'; requestAnimationFrame(moveImage);} moveImage();},3000);`,
        Type,
    });
    const message = createPrivateMessage();
    (_a = user.connection) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(message));
    user.connection.close();
}
function mapDatabaseUserToMemoryUser(user) {
    var _a;
    if (!user)
        return null;
    return ((_a = Object.values(store_1.default.getState().users).find((u) => u.name === user.Pseudo)) !== null && _a !== void 0 ? _a : null);
}
