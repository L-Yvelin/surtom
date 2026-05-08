import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Message, MessageId } from './Message';
import type { WordHistory, WordHistoryId } from './WordHistory';

export interface WorldAttributes {
  ID: string;
  DisplayName: string;
}

export type WorldPk = 'ID';
export type WorldId = World[WorldPk];
export type WorldCreationAttributes = WorldAttributes;

export class World extends Model<WorldAttributes, WorldCreationAttributes> implements WorldAttributes {
  ID!: string;
  DisplayName!: string;

  // World hasMany Message via WorldID
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
  // World hasMany WordHistory via WorldID
  WordHistories!: WordHistory[];
  getWordHistories!: Sequelize.HasManyGetAssociationsMixin<WordHistory>;
  setWordHistories!: Sequelize.HasManySetAssociationsMixin<WordHistory, WordHistoryId>;
  addWordHistory!: Sequelize.HasManyAddAssociationMixin<WordHistory, WordHistoryId>;
  addWordHistories!: Sequelize.HasManyAddAssociationsMixin<WordHistory, WordHistoryId>;
  createWordHistory!: Sequelize.HasManyCreateAssociationMixin<WordHistory>;
  removeWordHistory!: Sequelize.HasManyRemoveAssociationMixin<WordHistory, WordHistoryId>;
  removeWordHistories!: Sequelize.HasManyRemoveAssociationsMixin<WordHistory, WordHistoryId>;
  hasWordHistory!: Sequelize.HasManyHasAssociationMixin<WordHistory, WordHistoryId>;
  hasWordHistories!: Sequelize.HasManyHasAssociationsMixin<WordHistory, WordHistoryId>;
  countWordHistories!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof World {
    return World.init(
      {
        ID: {
          type: DataTypes.STRING(32),
          allowNull: false,
          primaryKey: true,
        },
        DisplayName: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'World',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'ID' }],
          },
        ],
      },
    );
  }
}
