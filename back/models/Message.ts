import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Player, PlayerId } from './Player';
import type { ScoreContent, ScoreContentCreationAttributes, ScoreContentId } from './ScoreContent';
import type { TextContent, TextContentCreationAttributes, TextContentId } from './TextContent';

export interface MessageAttributes {
  ID: number;
  PlayerID: number;
  Timestamp: Date;
  Type: 'MAIL_ALL' | 'ENHANCED_MESSAGE' | 'SCORE';
  Deleted?: number;
}

export type MessagePk = "ID";
export type MessageId = Message[MessagePk];
export type MessageOptionalAttributes = "ID" | "Deleted";
export type MessageCreationAttributes = Optional<MessageAttributes, MessageOptionalAttributes>;

export class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  ID!: number;
  PlayerID!: number;
  Timestamp!: Date;
  Type!: 'MAIL_ALL' | 'ENHANCED_MESSAGE' | 'SCORE';
  Deleted?: number;

  // Message hasOne ScoreContent via ID
  ScoreContent!: ScoreContent;
  getScoreContent!: Sequelize.HasOneGetAssociationMixin<ScoreContent>;
  setScoreContent!: Sequelize.HasOneSetAssociationMixin<ScoreContent, ScoreContentId>;
  createScoreContent!: Sequelize.HasOneCreateAssociationMixin<ScoreContent>;
  // Message hasOne TextContent via ID
  TextContent!: TextContent;
  getTextContent!: Sequelize.HasOneGetAssociationMixin<TextContent>;
  setTextContent!: Sequelize.HasOneSetAssociationMixin<TextContent, TextContentId>;
  createTextContent!: Sequelize.HasOneCreateAssociationMixin<TextContent>;
  // Message hasMany TextContent via ReplyID
  Reply_TextContents!: TextContent[];
  getReply_TextContents!: Sequelize.HasManyGetAssociationsMixin<TextContent>;
  setReply_TextContents!: Sequelize.HasManySetAssociationsMixin<TextContent, TextContentId>;
  addReply_TextContent!: Sequelize.HasManyAddAssociationMixin<TextContent, TextContentId>;
  addReply_TextContents!: Sequelize.HasManyAddAssociationsMixin<TextContent, TextContentId>;
  createReply_TextContent!: Sequelize.HasManyCreateAssociationMixin<TextContent>;
  removeReply_TextContent!: Sequelize.HasManyRemoveAssociationMixin<TextContent, TextContentId>;
  removeReply_TextContents!: Sequelize.HasManyRemoveAssociationsMixin<TextContent, TextContentId>;
  hasReply_TextContent!: Sequelize.HasManyHasAssociationMixin<TextContent, TextContentId>;
  hasReply_TextContents!: Sequelize.HasManyHasAssociationsMixin<TextContent, TextContentId>;
  countReply_TextContents!: Sequelize.HasManyCountAssociationsMixin;
  // Message belongsTo Player via PlayerID
  Player!: Player;
  getPlayer!: Sequelize.BelongsToGetAssociationMixin<Player>;
  setPlayer!: Sequelize.BelongsToSetAssociationMixin<Player, PlayerId>;
  createPlayer!: Sequelize.BelongsToCreateAssociationMixin<Player>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Message {
    return Message.init({
    ID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    PlayerID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Player',
        key: 'ID'
      }
    },
    Timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    Type: {
      type: DataTypes.ENUM('MAIL_ALL','ENHANCED_MESSAGE','SCORE'),
      allowNull: false
    },
    Deleted: {
      type: DataTypes.TINYINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Message',
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
        name: "PlayerID",
        using: "BTREE",
        fields: [
          { name: "PlayerID" },
        ]
      },
    ]
  });
  }
}
