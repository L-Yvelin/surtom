import type { Sequelize } from "sequelize";
import { Message as _Message } from "./Message";
import type { MessageAttributes, MessageCreationAttributes } from "./Message";
import { MessageImages as _MessageImages } from "./MessageImages";
import type { MessageImagesAttributes, MessageImagesCreationAttributes } from "./MessageImages";
import { Messages as _Messages } from "./Messages";
import type { MessagesAttributes, MessagesCreationAttributes } from "./Messages";
import { MotFrancais as _MotFrancais } from "./MotFrancais";
import type { MotFrancaisAttributes, MotFrancaisCreationAttributes } from "./MotFrancais";
import { MotMinecraft as _MotMinecraft } from "./MotMinecraft";
import type { MotMinecraftAttributes, MotMinecraftCreationAttributes } from "./MotMinecraft";
import { MotMinecraftValide as _MotMinecraftValide } from "./MotMinecraftValide";
import type { MotMinecraftValideAttributes, MotMinecraftValideCreationAttributes } from "./MotMinecraftValide";
import { MotValideCombine as _MotValideCombine } from "./MotValideCombine";
import type { MotValideCombineAttributes, MotValideCombineCreationAttributes } from "./MotValideCombine";
import { Player as _Player } from "./Player";
import type { PlayerAttributes, PlayerCreationAttributes } from "./Player";
import { Score as _Score } from "./Score";
import type { ScoreAttributes, ScoreCreationAttributes } from "./Score";
import { ScoreContent as _ScoreContent } from "./ScoreContent";
import type { ScoreContentAttributes, ScoreContentCreationAttributes } from "./ScoreContent";
import { ScoreData as _ScoreData } from "./ScoreData";
import type { ScoreDataAttributes, ScoreDataCreationAttributes } from "./ScoreData";
import { Surtomien as _Surtomien } from "./Surtomien";
import type { SurtomienAttributes, SurtomienCreationAttributes } from "./Surtomien";
import { TextContent as _TextContent } from "./TextContent";
import type { TextContentAttributes, TextContentCreationAttributes } from "./TextContent";
import { WordHistory as _WordHistory } from "./WordHistory";
import type { WordHistoryAttributes, WordHistoryCreationAttributes } from "./WordHistory";

export {
  _Message as Message,
  _MessageImages as MessageImages,
  _Messages as Messages,
  _MotFrancais as MotFrancais,
  _MotMinecraft as MotMinecraft,
  _MotMinecraftValide as MotMinecraftValide,
  _MotValideCombine as MotValideCombine,
  _Player as Player,
  _Score as Score,
  _ScoreContent as ScoreContent,
  _ScoreData as ScoreData,
  _Surtomien as Surtomien,
  _TextContent as TextContent,
  _WordHistory as WordHistory,
};

export type {
  MessageAttributes,
  MessageCreationAttributes,
  MessageImagesAttributes,
  MessageImagesCreationAttributes,
  MessagesAttributes,
  MessagesCreationAttributes,
  MotFrancaisAttributes,
  MotFrancaisCreationAttributes,
  MotMinecraftAttributes,
  MotMinecraftCreationAttributes,
  MotMinecraftValideAttributes,
  MotMinecraftValideCreationAttributes,
  MotValideCombineAttributes,
  MotValideCombineCreationAttributes,
  PlayerAttributes,
  PlayerCreationAttributes,
  ScoreAttributes,
  ScoreCreationAttributes,
  ScoreContentAttributes,
  ScoreContentCreationAttributes,
  ScoreDataAttributes,
  ScoreDataCreationAttributes,
  SurtomienAttributes,
  SurtomienCreationAttributes,
  TextContentAttributes,
  TextContentCreationAttributes,
  WordHistoryAttributes,
  WordHistoryCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const Message = _Message.initModel(sequelize);
  const MessageImages = _MessageImages.initModel(sequelize);
  const Messages = _Messages.initModel(sequelize);
  const MotFrancais = _MotFrancais.initModel(sequelize);
  const MotMinecraft = _MotMinecraft.initModel(sequelize);
  const MotMinecraftValide = _MotMinecraftValide.initModel(sequelize);
  const MotValideCombine = _MotValideCombine.initModel(sequelize);
  const Player = _Player.initModel(sequelize);
  const Score = _Score.initModel(sequelize);
  const ScoreContent = _ScoreContent.initModel(sequelize);
  const ScoreData = _ScoreData.initModel(sequelize);
  const Surtomien = _Surtomien.initModel(sequelize);
  const TextContent = _TextContent.initModel(sequelize);
  const WordHistory = _WordHistory.initModel(sequelize);

  ScoreContent.belongsTo(Message, { as: "ID_Message", foreignKey: "ID"});
  Message.hasOne(ScoreContent, { as: "ScoreContent", foreignKey: "ID"});
  TextContent.belongsTo(Message, { as: "ID_Message", foreignKey: "ID"});
  Message.hasOne(TextContent, { as: "TextContent", foreignKey: "ID"});
  TextContent.belongsTo(Message, { as: "Reply", foreignKey: "ReplyID"});
  Message.hasMany(TextContent, { as: "Reply_TextContents", foreignKey: "ReplyID"});
  MessageImages.belongsTo(Messages, { as: "Message", foreignKey: "MessageID"});
  Messages.hasMany(MessageImages, { as: "MessageImages", foreignKey: "MessageID"});
  Messages.belongsTo(Messages, { as: "Reply_Message", foreignKey: "Reply"});
  Messages.hasMany(Messages, { as: "Messages", foreignKey: "Reply"});
  ScoreData.belongsTo(Messages, { as: "Message", foreignKey: "MessageID"});
  Messages.hasOne(ScoreData, { as: "ScoreDatum", foreignKey: "MessageID"});
  WordHistory.belongsTo(MotMinecraft, { as: "Word", foreignKey: "WordID"});
  MotMinecraft.hasMany(WordHistory, { as: "WordHistories", foreignKey: "WordID"});
  Message.belongsTo(Player, { as: "Player", foreignKey: "PlayerID"});
  Player.hasMany(Message, { as: "Messages", foreignKey: "PlayerID"});
  Score.belongsTo(Surtomien, { as: "Surtomien_Surtomien", foreignKey: "Surtomien"});
  Surtomien.hasMany(Score, { as: "Scores", foreignKey: "Surtomien"});

  return {
    Message: Message,
    MessageImages: MessageImages,
    Messages: Messages,
    MotFrancais: MotFrancais,
    MotMinecraft: MotMinecraft,
    MotMinecraftValide: MotMinecraftValide,
    MotValideCombine: MotValideCombine,
    Player: Player,
    Score: Score,
    ScoreContent: ScoreContent,
    ScoreData: ScoreData,
    Surtomien: Surtomien,
    TextContent: TextContent,
    WordHistory: WordHistory,
  };
}
