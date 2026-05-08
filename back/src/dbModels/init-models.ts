import type { Sequelize } from 'sequelize';
import { Dictionary as _Dictionary } from './Dictionary';
import type { DictionaryAttributes, DictionaryCreationAttributes } from './Dictionary';
import { Message as _Message } from './Message';
import type { MessageAttributes, MessageCreationAttributes } from './Message';
import { MinecraftSolution as _MinecraftSolution } from './MinecraftSolution';
import type { MinecraftSolutionAttributes, MinecraftSolutionCreationAttributes } from './MinecraftSolution';
import { MinecraftWord as _MinecraftWord } from './MinecraftWord';
import type { MinecraftWordAttributes, MinecraftWordCreationAttributes } from './MinecraftWord';
import { Player as _Player } from './Player';
import type { PlayerAttributes, PlayerCreationAttributes } from './Player';
import { ScoreContent as _ScoreContent } from './ScoreContent';
import type { ScoreContentAttributes, ScoreContentCreationAttributes } from './ScoreContent';
import { TextContent as _TextContent } from './TextContent';
import type { TextContentAttributes, TextContentCreationAttributes } from './TextContent';
import { Try as _Try } from './Try';
import type { TryAttributes, TryCreationAttributes } from './Try';
import { WordHistory as _WordHistory } from './WordHistory';
import type { WordHistoryAttributes, WordHistoryCreationAttributes } from './WordHistory';
import { World as _World } from './World';
import type { WorldAttributes, WorldCreationAttributes } from './World';

export {
  _Dictionary as Dictionary,
  _Message as Message,
  _MinecraftSolution as MinecraftSolution,
  _MinecraftWord as MinecraftWord,
  _Player as Player,
  _ScoreContent as ScoreContent,
  _TextContent as TextContent,
  _Try as Try,
  _WordHistory as WordHistory,
  _World as World,
};

export type {
  DictionaryAttributes,
  DictionaryCreationAttributes,
  MessageAttributes,
  MessageCreationAttributes,
  MinecraftSolutionAttributes,
  MinecraftSolutionCreationAttributes,
  MinecraftWordAttributes,
  MinecraftWordCreationAttributes,
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
  WorldAttributes,
  WorldCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const Dictionary = _Dictionary.initModel(sequelize);
  const Message = _Message.initModel(sequelize);
  const MinecraftSolution = _MinecraftSolution.initModel(sequelize);
  const MinecraftWord = _MinecraftWord.initModel(sequelize);
  const Player = _Player.initModel(sequelize);
  const ScoreContent = _ScoreContent.initModel(sequelize);
  const TextContent = _TextContent.initModel(sequelize);
  const Try = _Try.initModel(sequelize);
  const WordHistory = _WordHistory.initModel(sequelize);
  const World = _World.initModel(sequelize);

  Player.belongsToMany(WordHistory, { as: 'WordHistoryID_WordHistories', through: Try, foreignKey: 'PlayerID', otherKey: 'WordHistoryID' });
  WordHistory.belongsToMany(Player, { as: 'PlayerID_Players', through: Try, foreignKey: 'WordHistoryID', otherKey: 'PlayerID' });
  ScoreContent.belongsTo(Message, { as: 'ID_Message', foreignKey: 'ID' });
  Message.hasOne(ScoreContent, { as: 'ScoreContent', foreignKey: 'ID' });
  TextContent.belongsTo(Message, { as: 'ID_Message', foreignKey: 'ID' });
  Message.hasOne(TextContent, { as: 'TextContent', foreignKey: 'ID' });
  TextContent.belongsTo(Message, { as: 'Reply', foreignKey: 'ReplyID' });
  Message.hasMany(TextContent, { as: 'Reply_TextContents', foreignKey: 'ReplyID' });
  WordHistory.belongsTo(MinecraftSolution, { as: 'Word', foreignKey: 'WordID' });
  MinecraftSolution.hasMany(WordHistory, { as: 'WordHistories', foreignKey: 'WordID' });
  Message.belongsTo(Player, { as: 'Player', foreignKey: 'PlayerID' });
  Player.hasMany(Message, { as: 'Messages', foreignKey: 'PlayerID' });
  Try.belongsTo(Player, { as: 'Player', foreignKey: 'PlayerID' });
  Player.hasMany(Try, { as: 'Tries', foreignKey: 'PlayerID' });
  ScoreContent.belongsTo(WordHistory, { as: 'WordHistory', foreignKey: 'WordHistoryID' });
  WordHistory.hasMany(ScoreContent, { as: 'ScoreContents', foreignKey: 'WordHistoryID' });
  Try.belongsTo(WordHistory, { as: 'WordHistory', foreignKey: 'WordHistoryID' });
  WordHistory.hasMany(Try, { as: 'Tries', foreignKey: 'WordHistoryID' });
  Message.belongsTo(World, { as: 'World', foreignKey: 'WorldID' });
  World.hasMany(Message, { as: 'Messages', foreignKey: 'WorldID' });
  WordHistory.belongsTo(World, { as: 'World', foreignKey: 'WorldID' });
  World.hasMany(WordHistory, { as: 'WordHistories', foreignKey: 'WorldID' });

  return {
    Dictionary: Dictionary,
    Message: Message,
    MinecraftSolution: MinecraftSolution,
    MinecraftWord: MinecraftWord,
    Player: Player,
    ScoreContent: ScoreContent,
    TextContent: TextContent,
    Try: Try,
    WordHistory: WordHistory,
    World: World,
  };
}
