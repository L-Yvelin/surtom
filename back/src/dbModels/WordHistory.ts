import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { MinecraftSolution, MinecraftSolutionId } from './MinecraftSolution';
import type { Player, PlayerId } from './Player';
import type { ScoreContent, ScoreContentId } from './ScoreContent';
import type { Try, TryId } from './Try';
import type { World, WorldId } from './World';

export interface WordHistoryAttributes {
  ID: number;
  WorldID?: string;
  WordID: number;
  AssignedDate: Date;
}

export type WordHistoryPk = 'ID';
export type WordHistoryId = WordHistory[WordHistoryPk];
export type WordHistoryOptionalAttributes = 'ID' | 'WorldID' | 'AssignedDate';
export type WordHistoryCreationAttributes = Optional<WordHistoryAttributes, WordHistoryOptionalAttributes>;

export class WordHistory extends Model<WordHistoryAttributes, WordHistoryCreationAttributes> implements WordHistoryAttributes {
  ID!: number;
  WorldID?: string;
  WordID!: number;
  AssignedDate!: Date;

  // WordHistory belongsTo MinecraftSolution via WordID
  Word!: MinecraftSolution;
  getWord!: Sequelize.BelongsToGetAssociationMixin<MinecraftSolution>;
  setWord!: Sequelize.BelongsToSetAssociationMixin<MinecraftSolution, MinecraftSolutionId>;
  createWord!: Sequelize.BelongsToCreateAssociationMixin<MinecraftSolution>;
  // WordHistory belongsToMany Player via WordHistoryID and PlayerID
  PlayerID_Players!: Player[];
  getPlayerID_Players!: Sequelize.BelongsToManyGetAssociationsMixin<Player>;
  setPlayerID_Players!: Sequelize.BelongsToManySetAssociationsMixin<Player, PlayerId>;
  addPlayerID_Player!: Sequelize.BelongsToManyAddAssociationMixin<Player, PlayerId>;
  addPlayerID_Players!: Sequelize.BelongsToManyAddAssociationsMixin<Player, PlayerId>;
  createPlayerID_Player!: Sequelize.BelongsToManyCreateAssociationMixin<Player>;
  removePlayerID_Player!: Sequelize.BelongsToManyRemoveAssociationMixin<Player, PlayerId>;
  removePlayerID_Players!: Sequelize.BelongsToManyRemoveAssociationsMixin<Player, PlayerId>;
  hasPlayerID_Player!: Sequelize.BelongsToManyHasAssociationMixin<Player, PlayerId>;
  hasPlayerID_Players!: Sequelize.BelongsToManyHasAssociationsMixin<Player, PlayerId>;
  countPlayerID_Players!: Sequelize.BelongsToManyCountAssociationsMixin;
  // WordHistory hasMany ScoreContent via WordHistoryID
  ScoreContents!: ScoreContent[];
  getScoreContents!: Sequelize.HasManyGetAssociationsMixin<ScoreContent>;
  setScoreContents!: Sequelize.HasManySetAssociationsMixin<ScoreContent, ScoreContentId>;
  addScoreContent!: Sequelize.HasManyAddAssociationMixin<ScoreContent, ScoreContentId>;
  addScoreContents!: Sequelize.HasManyAddAssociationsMixin<ScoreContent, ScoreContentId>;
  createScoreContent!: Sequelize.HasManyCreateAssociationMixin<ScoreContent>;
  removeScoreContent!: Sequelize.HasManyRemoveAssociationMixin<ScoreContent, ScoreContentId>;
  removeScoreContents!: Sequelize.HasManyRemoveAssociationsMixin<ScoreContent, ScoreContentId>;
  hasScoreContent!: Sequelize.HasManyHasAssociationMixin<ScoreContent, ScoreContentId>;
  hasScoreContents!: Sequelize.HasManyHasAssociationsMixin<ScoreContent, ScoreContentId>;
  countScoreContents!: Sequelize.HasManyCountAssociationsMixin;
  // WordHistory hasMany Try via WordHistoryID
  Tries!: Try[];
  getTries!: Sequelize.HasManyGetAssociationsMixin<Try>;
  setTries!: Sequelize.HasManySetAssociationsMixin<Try, TryId>;
  addTry!: Sequelize.HasManyAddAssociationMixin<Try, TryId>;
  addTries!: Sequelize.HasManyAddAssociationsMixin<Try, TryId>;
  createTry!: Sequelize.HasManyCreateAssociationMixin<Try>;
  removeTry!: Sequelize.HasManyRemoveAssociationMixin<Try, TryId>;
  removeTries!: Sequelize.HasManyRemoveAssociationsMixin<Try, TryId>;
  hasTry!: Sequelize.HasManyHasAssociationMixin<Try, TryId>;
  hasTries!: Sequelize.HasManyHasAssociationsMixin<Try, TryId>;
  countTries!: Sequelize.HasManyCountAssociationsMixin;
  // WordHistory belongsTo World via WorldID
  World!: World;
  getWorld!: Sequelize.BelongsToGetAssociationMixin<World>;
  setWorld!: Sequelize.BelongsToSetAssociationMixin<World, WorldId>;
  createWorld!: Sequelize.BelongsToCreateAssociationMixin<World>;

  static initModel(sequelize: Sequelize.Sequelize): typeof WordHistory {
    return WordHistory.init(
      {
        ID: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        WorldID: {
          type: DataTypes.STRING(32),
          allowNull: true,
          references: {
            model: 'World',
            key: 'ID',
          },
        },
        WordID: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'MinecraftSolution',
            key: 'ID',
          },
        },
        AssignedDate: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      },
      {
        sequelize,
        tableName: 'WordHistory',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'ID' }],
          },
          {
            name: 'WordID',
            using: 'BTREE',
            fields: [{ name: 'WordID' }],
          },
          {
            name: 'WordHistory_idx_WorldID_AssignedDate',
            using: 'BTREE',
            fields: [{ name: 'WorldID' }, { name: 'AssignedDate' }],
          },
        ],
      },
    );
  }
}
