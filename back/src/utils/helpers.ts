import bcrypt from "bcrypt";
import crypto from "crypto";
import Constants from "./constants.js";
import FullUser from "src/models/User.js";
import {
  User as BackUser,
  DatabaseMessage,
  DatabaseMessageType,
} from "../services/databaseService.js";
import store from "../store.js";
import { Server, Client } from "@interfaces/Message.js";

export function passwordInHashArray(
  password: string,
  hashArray: string[]
): boolean {
  return hashArray.some((hash) => bcrypt.compareSync(password, hash));
}

export function generateRandomHash(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function getRandomFunnyName(): string {
  return Constants.funnyNames[
    Math.floor(Math.random() * Constants.funnyNames.length)
  ];
}

export function validateUsername(username: string): boolean {
  const usernamePattern = /^[-_a-zA-Z0-9]{1,16}$/;
  return usernamePattern.test(username);
}

export function validateText(text: string): boolean {
  const textPattern = /^.{1,256}$/;
  return textPattern.test(text);
}

export function getUserRank(user: FullUser): string | null {
  return user.isModerator ? "moderator" : user.isLoggedIn ? "loggedIn" : null;
}

export function handleIsBanned(user: FullUser): void {
  const createPrivateMessage = (Pseudo = "¿¿¿", Type = "eval") => ({
    Pseudo,
    Moderator: user.isModerator,
    isLoggedIn: user.isLoggedIn,
    Texte: `delete SocketClient.ws;clearInterval(SocketClient.pingInterval);setTimeout(() => {window.banned = true;let a = document.querySelector("#loading-mask");a.style.display = 'flex';a.style.opacity='1';a.style.zIndex = '999999';a.querySelector('p').innerHTML="<span style='color: darkred;'>You have been banned</span>";body.innerHTML = a.outerHTML;const gifUrl = "https://i.giphy.com/media/Os2Az5qAUancc/giphy.webp"; const img = document.createElement('img'); img.src = gifUrl; img.style.width = "20%"; img.style.height = "auto"; img.style.position = "absolute"; img.style.top = "0"; img.style.left = "0"; img.style.border = "none"; document.querySelector('#loading-mask').appendChild(img); let xPosition = 0; let yPosition = 0; let xDirection = 1; let yDirection = 1; const speed = 2; function moveImage() { const windowWidth = window.innerWidth; const windowHeight = window.innerHeight; const imgWidth = img.clientWidth; const imgHeight = img.clientHeight; xPosition += xDirection * speed; yPosition += yDirection * speed; if (xPosition + imgWidth > windowWidth || xPosition < 0) { xDirection *= -1; xDirection += (Math.random() - 0.5) * 0.2; } if (yPosition + imgHeight > windowHeight || yPosition < 0) { yDirection *= -1; yDirection += (Math.random() - 0.5) * 0.2; } img.style.transform = 'translate(' + xPosition + 'px, ' + yPosition + 'px)'; requestAnimationFrame(moveImage);} moveImage();},3000);`,
    Type,
  });

  const message = createPrivateMessage();
  user.connection?.send(JSON.stringify(message));
  user.connection.close();
}

export function mapDatabaseUserToMemoryUser(
  user: BackUser | null
): FullUser | null {
  if (!user) return null;
  return (
    Object.values(store.getState().users).find((u) => u.name === user.Pseudo) ??
    null
  );
}
export function mapUserMessageToMemoryMessage(
  message: DatabaseMessage
): Server.TextChatMessageContent {
  return {
    id: message.ID.toString(),
    user: { name: message.Pseudo, moderatorLevel: message.Moderator },
    text: message.Texte,
    timestamp: message.Date,
    imageData: message.ImageData,
    replyId: message.Reply?.toString(),
  };
}

export function mapScoreMessageToMemoryMessage(
  message: DatabaseMessage
): Server.ScoreContent {
  return {
    id: message.ID.toString(),
    user: { name: message.Pseudo, moderatorLevel: message.Moderator },
    answer: message.Answer ?? "",
    attempts: message.Mots ? JSON.parse(message.Mots) : [],
  };
}

export function mapDatabaseTypeToMemoryType(
  type: DatabaseMessageType
): Server.SavedChatMessageType {
  switch (type) {
    case "score":
      return Server.MessageType.SCORE;
    case "enhancedMessage":
      return Server.MessageType.ENHANCED_MESSAGE;
    case "message":
      return Server.MessageType.MAIL_ALL;
  }
}

export function mapDatabaseMessageToMemoryMessage(
  message: DatabaseMessage
): Server.ChatMessageContent {
  switch (mapDatabaseTypeToMemoryType(message.Type)) {
    case Server.MessageType.ENHANCED_MESSAGE:
    case Server.MessageType.MAIL_ALL:
      return mapUserMessageToMemoryMessage(message);
    case Server.MessageType.SCORE:
      return mapScoreMessageToMemoryMessage(message);
  }
}

export function isScoreContentCoherent(content: Client.ScoreContent): boolean {
  return (
    content.attempts.length > 0 &&
    content.attempts.length <= 6 &&
    content.attempts.every(
      (attempt) => attempt.length === content.attempts[0].length
    )
  );
}
