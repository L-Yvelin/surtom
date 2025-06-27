import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Message, MessageId } from './Message';

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
export type PlayerOptionalAttributes = "ID" | "SessionHash" | "RegistrationDate" | "IsAdmin" | "IsBanned";
export type PlayerCreationAttributes = Optional<PlayerAttributes, PlayerOptionalAttributes>;

export class Player extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes {
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

  static initModel(sequelize: Sequelize.Sequelize): typeof Player {
    return Player.init({
    ID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "Username"
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    SessionHash: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    RegistrationDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('curdate')
    },
    IsAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    IsBanned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'Player',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ID" },
        ]
      },
      {
        name: "Username",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "Username" },
        ]
      },
    ]
  });
  }
}
