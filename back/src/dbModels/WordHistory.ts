import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import type { MotMinecraft, MotMinecraftId } from "./MotMinecraft";
import type { Player, PlayerId } from "./Player";
import type { Try, TryId } from "./Try";

export interface WordHistoryAttributes {
  ID: number;
  WordID: number;
  AssignedDate: string;
}

export type WordHistoryPk = "ID";
export type WordHistoryId = WordHistory[WordHistoryPk];
export type WordHistoryOptionalAttributes = "ID";
export type WordHistoryCreationAttributes = Optional<
  WordHistoryAttributes,
  WordHistoryOptionalAttributes
>;

export class WordHistory
  extends Model<WordHistoryAttributes, WordHistoryCreationAttributes>
  implements WordHistoryAttributes
{
  ID!: number;
  WordID!: number;
  AssignedDate!: string;

  // WordHistory belongsTo MotMinecraft via WordID
  Word!: MotMinecraft;
  getWord!: Sequelize.BelongsToGetAssociationMixin<MotMinecraft>;
  setWord!: Sequelize.BelongsToSetAssociationMixin<
    MotMinecraft,
    MotMinecraftId
  >;
  createWord!: Sequelize.BelongsToCreateAssociationMixin<MotMinecraft>;
  // WordHistory belongsToMany Player via WordHistoryID and PlayerID
  PlayerID_Players!: Player[];
  getPlayerID_Players!: Sequelize.BelongsToManyGetAssociationsMixin<Player>;
  setPlayerID_Players!: Sequelize.BelongsToManySetAssociationsMixin<
    Player,
    PlayerId
  >;
  addPlayerID_Player!: Sequelize.BelongsToManyAddAssociationMixin<
    Player,
    PlayerId
  >;
  addPlayerID_Players!: Sequelize.BelongsToManyAddAssociationsMixin<
    Player,
    PlayerId
  >;
  createPlayerID_Player!: Sequelize.BelongsToManyCreateAssociationMixin<Player>;
  removePlayerID_Player!: Sequelize.BelongsToManyRemoveAssociationMixin<
    Player,
    PlayerId
  >;
  removePlayerID_Players!: Sequelize.BelongsToManyRemoveAssociationsMixin<
    Player,
    PlayerId
  >;
  hasPlayerID_Player!: Sequelize.BelongsToManyHasAssociationMixin<
    Player,
    PlayerId
  >;
  hasPlayerID_Players!: Sequelize.BelongsToManyHasAssociationsMixin<
    Player,
    PlayerId
  >;
  countPlayerID_Players!: Sequelize.BelongsToManyCountAssociationsMixin;
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

  static initModel(sequelize: Sequelize.Sequelize): typeof WordHistory {
    return WordHistory.init(
      {
        ID: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        WordID: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "MotMinecraft",
            key: "ID",
          },
        },
        AssignedDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "WordHistory",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "ID" }],
          },
          {
            name: "WordID",
            using: "BTREE",
            fields: [{ name: "WordID" }],
          },
        ],
      },
    );
  }
}
