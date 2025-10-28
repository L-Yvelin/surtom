import type { Sequelize } from "sequelize";
import { Message as _Message } from "./Message";
import type { MessageAttributes, MessageCreationAttributes } from "./Message";
import { MotFrancais as _MotFrancais } from "./MotFrancais";
import type {
  MotFrancaisAttributes,
  MotFrancaisCreationAttributes,
} from "./MotFrancais";
import { MotMinecraft as _MotMinecraft } from "./MotMinecraft";
import type {
  MotMinecraftAttributes,
  MotMinecraftCreationAttributes,
} from "./MotMinecraft";
import { MotMinecraftValide as _MotMinecraftValide } from "./MotMinecraftValide";
import type {
  MotMinecraftValideAttributes,
  MotMinecraftValideCreationAttributes,
} from "./MotMinecraftValide";
import { MotValideCombine as _MotValideCombine } from "./MotValideCombine";
import type {
  MotValideCombineAttributes,
  MotValideCombineCreationAttributes,
} from "./MotValideCombine";
import { Player as _Player } from "./Player";
import type { PlayerAttributes, PlayerCreationAttributes } from "./Player";
import { ScoreContent as _ScoreContent } from "./ScoreContent";
import type {
  ScoreContentAttributes,
  ScoreContentCreationAttributes,
} from "./ScoreContent";
import { TextContent as _TextContent } from "./TextContent";
import type {
  TextContentAttributes,
  TextContentCreationAttributes,
} from "./TextContent";
import { Try as _Try } from "./Try";
import type { TryAttributes, TryCreationAttributes } from "./Try";
import { WordHistory as _WordHistory } from "./WordHistory";
import type {
  WordHistoryAttributes,
  WordHistoryCreationAttributes,
} from "./WordHistory";

export {
  _Message as Message,
  _MotFrancais as MotFrancais,
  _MotMinecraft as MotMinecraft,
  _MotMinecraftValide as MotMinecraftValide,
  _MotValideCombine as MotValideCombine,
  _Player as Player,
  _ScoreContent as ScoreContent,
  _TextContent as TextContent,
  _Try as Try,
  _WordHistory as WordHistory,
};

export type {
  MessageAttributes,
  MessageCreationAttributes,
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
  ScoreContentAttributes,
  ScoreContentCreationAttributes,
  TextContentAttributes,
  TextContentCreationAttributes,
  TryAttributes,
  TryCreationAttributes,
  WordHistoryAttributes,
  WordHistoryCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const Message = _Message.initModel(sequelize);
  const MotFrancais = _MotFrancais.initModel(sequelize);
  const MotMinecraft = _MotMinecraft.initModel(sequelize);
  const MotMinecraftValide = _MotMinecraftValide.initModel(sequelize);
  const MotValideCombine = _MotValideCombine.initModel(sequelize);
  const Player = _Player.initModel(sequelize);
  const ScoreContent = _ScoreContent.initModel(sequelize);
  const TextContent = _TextContent.initModel(sequelize);
  const Try = _Try.initModel(sequelize);
  const WordHistory = _WordHistory.initModel(sequelize);

  Player.belongsToMany(WordHistory, {
    as: "WordHistoryID_WordHistories",
    through: Try,
    foreignKey: "PlayerID",
    otherKey: "WordHistoryID",
  });
  WordHistory.belongsToMany(Player, {
    as: "PlayerID_Players",
    through: Try,
    foreignKey: "WordHistoryID",
    otherKey: "PlayerID",
  });
  ScoreContent.belongsTo(Message, { as: "ID_Message", foreignKey: "ID" });
  Message.hasOne(ScoreContent, { as: "ScoreContent", foreignKey: "ID" });
  TextContent.belongsTo(Message, { as: "ID_Message", foreignKey: "ID" });
  Message.hasOne(TextContent, { as: "TextContent", foreignKey: "ID" });
  TextContent.belongsTo(Message, { as: "Reply", foreignKey: "ReplyID" });
  Message.hasMany(TextContent, {
    as: "Reply_TextContents",
    foreignKey: "ReplyID",
  });
  WordHistory.belongsTo(MotMinecraft, { as: "Word", foreignKey: "WordID" });
  MotMinecraft.hasMany(WordHistory, {
    as: "WordHistories",
    foreignKey: "WordID",
  });
  Message.belongsTo(Player, { as: "Player", foreignKey: "PlayerID" });
  Player.hasMany(Message, { as: "Messages", foreignKey: "PlayerID" });
  Try.belongsTo(Player, { as: "Player", foreignKey: "PlayerID" });
  Player.hasMany(Try, { as: "Tries", foreignKey: "PlayerID" });
  Try.belongsTo(WordHistory, {
    as: "WordHistory",
    foreignKey: "WordHistoryID",
  });
  WordHistory.hasMany(Try, { as: "Tries", foreignKey: "WordHistoryID" });

  return {
    Message: Message,
    MotFrancais: MotFrancais,
    MotMinecraft: MotMinecraft,
    MotMinecraftValide: MotMinecraftValide,
    MotValideCombine: MotValideCombine,
    Player: Player,
    ScoreContent: ScoreContent,
    TextContent: TextContent,
    Try: Try,
    WordHistory: WordHistory,
  };
}
