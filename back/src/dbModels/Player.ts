import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import type { Message, MessageId } from "./Message";
import type { Try, TryId } from "./Try";
import type { WordHistory, WordHistoryId } from "./WordHistory";

export interface PlayerAttributes {
  ID: number;
  Username: string;
  Password: string;
  SessionHash?: string;
  RegistrationDate: string;
  IsAdmin: number;
  IsBanned: number;
}

export type PlayerPk = "ID";
export type PlayerId = Player[PlayerPk];
export type PlayerOptionalAttributes =
  | "ID"
  | "SessionHash"
  | "IsAdmin"
  | "IsBanned";
export type PlayerCreationAttributes = Optional<
  PlayerAttributes,
  PlayerOptionalAttributes
>;

export class Player
  extends Model<PlayerAttributes, PlayerCreationAttributes>
  implements PlayerAttributes
{
  ID!: number;
  Username!: string;
  Password!: string;
  SessionHash?: string;
  RegistrationDate!: string;
  IsAdmin!: number;
  IsBanned!: number;

  // Player hasMany Message via PlayerID
  Messages!: Message[];
  getMessages!: Sequelize.HasManyGetAssociationsMixin<Message>;
  setMessages!: Sequelize.HasManySetAssociationsMixin<Message, MessageId>;
  addMessage!: Sequelize.HasManyAddAssociationMixin<Message, MessageId>;
  addMessages!: Sequelize.HasManyAddAssociationsMixin<Message, MessageId>;
  createMessage!: Sequelize.HasManyCreateAssociationMixin<Message>;
  removeMessage!: Sequelize.HasManyRemoveAssociationMixin<Message, MessageId>;
  removeMessages!: Sequelize.HasManyRemoveAssociationsMixin<Message, MessageId>;
  hasMessage!: Sequelize.HasManyHasAssociationMixin<Message, MessageId>;
  hasMessages!: Sequelize.HasManyHasAssociationsMixin<Message, MessageId>;
  countMessages!: Sequelize.HasManyCountAssociationsMixin;
  // Player hasMany Try via PlayerID
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
  // Player belongsToMany WordHistory via PlayerID and WordHistoryID
  WordHistoryID_WordHistories!: WordHistory[];
  getWordHistoryID_WordHistories!: Sequelize.BelongsToManyGetAssociationsMixin<WordHistory>;
  setWordHistoryID_WordHistories!: Sequelize.BelongsToManySetAssociationsMixin<
    WordHistory,
    WordHistoryId
  >;
  addWordHistoryID_WordHistory!: Sequelize.BelongsToManyAddAssociationMixin<
    WordHistory,
    WordHistoryId
  >;
  addWordHistoryID_WordHistories!: Sequelize.BelongsToManyAddAssociationsMixin<
    WordHistory,
    WordHistoryId
  >;
  createWordHistoryID_WordHistory!: Sequelize.BelongsToManyCreateAssociationMixin<WordHistory>;
  removeWordHistoryID_WordHistory!: Sequelize.BelongsToManyRemoveAssociationMixin<
    WordHistory,
    WordHistoryId
  >;
  removeWordHistoryID_WordHistories!: Sequelize.BelongsToManyRemoveAssociationsMixin<
    WordHistory,
    WordHistoryId
  >;
  hasWordHistoryID_WordHistory!: Sequelize.BelongsToManyHasAssociationMixin<
    WordHistory,
    WordHistoryId
  >;
  hasWordHistoryID_WordHistories!: Sequelize.BelongsToManyHasAssociationsMixin<
    WordHistory,
    WordHistoryId
  >;
  countWordHistoryID_WordHistories!: Sequelize.BelongsToManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Player {
    return Player.init(
      {
        ID: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        Username: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: "Username",
        },
        Password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        SessionHash: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        RegistrationDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        IsAdmin: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: 0,
        },
        IsBanned: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        tableName: "Player",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "ID" }],
          },
          {
            name: "Username",
            unique: true,
            using: "BTREE",
            fields: [{ name: "Username" }],
          },
        ],
      },
    );
  }
}
