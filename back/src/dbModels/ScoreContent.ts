import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Message, MessageId } from './Message';
import type { WordHistory, WordHistoryId } from './WordHistory';

export interface ScoreContentAttributes {
  ID: number;
  WordHistoryID?: number;
  Answer: string;
  Attempts: string;
  IsCustom: number;
}

export type ScoreContentPk = 'ID';
export type ScoreContentId = ScoreContent[ScoreContentPk];
export type ScoreContentOptionalAttributes = 'WordHistoryID' | 'IsCustom';
export type ScoreContentCreationAttributes = Optional<ScoreContentAttributes, ScoreContentOptionalAttributes>;

export class ScoreContent extends Model<ScoreContentAttributes, ScoreContentCreationAttributes> implements ScoreContentAttributes {
  ID!: number;
  WordHistoryID?: number;
  Answer!: string;
  Attempts!: string;
  IsCustom!: number;

  // ScoreContent belongsTo Message via ID
  ID_Message!: Message;
  getID_Message!: Sequelize.BelongsToGetAssociationMixin<Message>;
  setID_Message!: Sequelize.BelongsToSetAssociationMixin<Message, MessageId>;
  createID_Message!: Sequelize.BelongsToCreateAssociationMixin<Message>;
  // ScoreContent belongsTo WordHistory via WordHistoryID
  WordHistory!: WordHistory;
  getWordHistory!: Sequelize.BelongsToGetAssociationMixin<WordHistory>;
  setWordHistory!: Sequelize.BelongsToSetAssociationMixin<WordHistory, WordHistoryId>;
  createWordHistory!: Sequelize.BelongsToCreateAssociationMixin<WordHistory>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ScoreContent {
    return ScoreContent.init(
      {
        ID: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'Message',
            key: 'ID',
          },
        },
        WordHistoryID: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'WordHistory',
            key: 'ID',
          },
        },
        Answer: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        Attempts: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        IsCustom: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        tableName: 'ScoreContent',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'ID' }],
          },
          {
            name: 'ScoreContent_idx_WordHistoryID',
            using: 'BTREE',
            fields: [{ name: 'WordHistoryID' }],
          },
        ],
      },
    );
  }
}
