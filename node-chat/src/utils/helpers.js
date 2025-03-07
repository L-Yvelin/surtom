import bcrypt from "bcrypt";
import crypto from "crypto";
import Constants from "./constants";
import store from "../store";
export function passwordInHashArray(password, hashArray) {
    return hashArray.some((hash) => bcrypt.compareSync(password, hash));
}
export function generateRandomHash() {
    return crypto.randomBytes(16).toString("hex");
}
export function getRandomFunnyName() {
    return Constants.funnyNames[Math.floor(Math.random() * Constants.funnyNames.length)];
}
export function validateUsername(username) {
    const usernamePattern = /^[-_a-zA-Z0-9]{1,16}$/;
    return usernamePattern.test(username);
}
export function validateText(text) {
    const textPattern = /^.{1,256}$/;
    return textPattern.test(text);
}
export function getUserRank(user) {
    return user.isModerator ? "moderator" : user.isLoggedIn ? "loggedIn" : null;
}
export function handleIsBanned(user) {
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
export function mapDatabaseUserToMemoryUser(user) {
    var _a;
    if (!user)
        return null;
    return ((_a = Object.values(store.getState().users).find((u) => u.name === user.Pseudo)) !== null && _a !== void 0 ? _a : null);
}
