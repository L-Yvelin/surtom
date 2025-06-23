import { Server } from "../../utils/Message";

export const funnyNames = [
  "Surtomien",
  "Cracotto",
  "Marmeluche",
  "Ziboulette",
  "Bidulette",
  "Farfelucho",
  "Patacroute",
  "Zozo",
  "Frimousse",
  "Zigzag",
  "Turlututu",
  "Bouboule",
  "Cacahuete",
  "ChocoBrioche",
  "Roudoudou",
  "Cornichon",
  "Choupette",
  "Bibop",
  "Tornade",
  "Cocorico",
  "Biscotto",
  "Frisottis",
  "Barbapapa",
  "Rigolito",
  "Loufoquet",
  "Gribouille",
  "Papouille",
  "Cocotte",
  "Patachou",
  "Filoufou",
  "Zinzolin",
  "Chocolala",
  "Zigouigoui",
  "TchouTchou",
  "Roudoudouf",
  "Tournicoti",
  "Choubidou",
  "Fantastik",
  "Snickerdoodle",
  "BimBamBoum",
  "Chamallow",
];

export const rank = {
  1: "Admin",
  2: "Super-Admin",
  3: "👑",
};

export function getPlayerColor(moderatorLevel: number, pseudo: string): string {
  if (moderatorLevel) {
    switch (moderatorLevel) {
      case 1:
        return "rgb(155 185 244)";
      case 2:
        return "rgb(150 40 150)";
      case 3:
        return "rgb(240, 75, 75)";
      default:
        return "rgb(255, 255, 134)";
    }
  } else if (funnyNames.includes(pseudo)) {
    return "white";
  } else {
    return "rgb(255, 255, 134)";
  }
}

export function isTextMessage(
  message: Server.ChatMessage.Type
): message is Server.ChatMessage.Text {
  return (
    message.type === Server.MessageType.MAIL_ALL ||
    message.type === Server.MessageType.PRIVATE_MESSAGE ||
    message.type === Server.MessageType.ENHANCED_MESSAGE
  );
}

export function isPrivateMessage(
  message: Server.ChatMessage.Type
): message is Server.ChatMessage.Text {
  return message.type === Server.MessageType.PRIVATE_MESSAGE;
}

export function isScoreMessage(
  message: Server.ChatMessage.Type
): message is Server.ChatMessage.Score {
  return message.type === Server.MessageType.SCORE;
}

export function isStatusMessage(
  message: Server.ChatMessage.Type
): message is Server.ChatMessage.Status {
  return (
    message.type === Server.MessageType.SUCCESS ||
    message.type === Server.MessageType.ERROR
  );
}

export function isSavedChatMessage(
  message: Server.ChatMessage.Type
): message is Server.ChatMessage.SavedType {
  return isTextMessage(message) || isScoreMessage(message) || isEnhancedMessage(message);
}

export function isEnhancedMessage(
  message: Server.ChatMessage.Type
): message is Extract<
  Server.ChatMessage.Text,
  { type: Server.MessageType.ENHANCED_MESSAGE }
> {
  return message.type === Server.MessageType.ENHANCED_MESSAGE;
}

export function isMailAllMessage(
  message: Server.ChatMessage.Type
): message is Extract<
  Server.ChatMessage.Text,
  { type: Server.MessageType.MAIL_ALL }
> {
  return message.type === Server.MessageType.MAIL_ALL;
}

type URL = `https://${string}.${
  | "jpg"
  | "jpeg"
  | "png"
  | "webp"
  | "avif"
  | "gif"
  | "svg"}${`?${string}` | ""}`;
export function extractImageUrls(text: string): URL[] {
  const urlRegex =
    /https:\/\/[^\s]+?\.(jpg|jpeg|png|webp|avif|gif|svg)(\?[^\s]*)?/g;
  const matches = text.match(urlRegex);
  return matches ? (matches as URL[]) : [];
}

export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const matches = text.match(urlRegex);
  return matches ? matches : [];
}