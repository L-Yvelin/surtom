import { Server } from "../../../../interfaces/Message";

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

export const getPlayerColor = (moderatorLevel: number) => {
  switch (moderatorLevel) {
    case 1:
      return "#ff0000";
    case 2:
      return "#ff00ff";
    case 3:
      return "#ff0000";
    default:
      return "#000000";
  }
};

export function isUserMessage(
  message: Server.ChatMessage.Type
): message is Server.ChatMessage.User {
  return (
    message.type === Server.MessageType.MAIL_ALL ||
    message.type === Server.MessageType.PRIVATE_MESSAGE ||
    message.type === Server.MessageType.ENHANCED_MESSAGE
  );
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
  return isUserMessage(message) || isScoreMessage(message);
}

export function isEnhancedMessage(
  message: Server.ChatMessage.Type
): message is Extract<
  Server.ChatMessage.User,
  { type: Server.MessageType.ENHANCED_MESSAGE }
> {
  return message.type === Server.MessageType.ENHANCED_MESSAGE;
}

export function isMailAllMessage(
  message: Server.ChatMessage.Type
): message is Extract<
  Server.ChatMessage.User,
  { type: Server.MessageType.MAIL_ALL }
> {
  return message.type === Server.MessageType.MAIL_ALL;
}
