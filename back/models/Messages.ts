import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { MessageImages, MessageImagesId } from './MessageImages';
import type { ScoreData, ScoreDataCreationAttributes, ScoreDataId } from './ScoreData';

export interface MessagesAttributes {
  ID: number;
  Pseudo: string;
  Texte: string;
  Date: Date;
  Moderator: number;
  Type: 'score' | 'message' | 'enhancedMessage';
  Supprime: number;
  Reply?: number;
}

export type MessagesPk = "ID";
export type MessagesId = Messages[MessagesPk];
export type MessagesOptionalAttributes = "ID" | "Date" | "Moderator" | "Type" | "Supprime" | "Reply";
export type MessagesCreationAttributes = Optional<MessagesAttributes, MessagesOptionalAttributes>;

export class Messages extends Model<MessagesAttributes, MessagesCreationAttributes> implements MessagesAttributes {
  ID!: number;
  Pseudo!: string;
  Texte!: string;
  Date!: Date;
  Moderator!: number;
  Type!: 'score' | 'message' | 'enhancedMessage';
  Supprime!: number;
  Reply?: number;

  // Messages hasMany MessageImages via MessageID
  MessageImages!: MessageImages[];
  getMessageImages!: Sequelize.HasManyGetAssociationsMixin<MessageImages>;
  setMessageImages!: Sequelize.HasManySetAssociationsMixin<MessageImages, MessageImagesId>;
  addMessageImage!: Sequelize.HasManyAddAssociationMixin<MessageImages, MessageImagesId>;
  addMessageImages!: Sequelize.HasManyAddAssociationsMixin<MessageImages, MessageImagesId>;
  createMessageImage!: Sequelize.HasManyCreateAssociationMixin<MessageImages>;
  removeMessageImage!: Sequelize.HasManyRemoveAssociationMixin<MessageImages, MessageImagesId>;
  removeMessageImages!: Sequelize.HasManyRemoveAssociationsMixin<MessageImages, MessageImagesId>;
  hasMessageImage!: Sequelize.HasManyHasAssociationMixin<MessageImages, MessageImagesId>;
  hasMessageImages!: Sequelize.HasManyHasAssociationsMixin<MessageImages, MessageImagesId>;
  countMessageImages!: Sequelize.HasManyCountAssociationsMixin;
  // Messages belongsTo Messages via Reply
  Reply_Message!: Messages;
  getReply_Message!: Sequelize.BelongsToGetAssociationMixin<Messages>;
  setReply_Message!: Sequelize.BelongsToSetAssociationMixin<Messages, MessagesId>;
  createReply_Message!: Sequelize.BelongsToCreateAssociationMixin<Messages>;
  // Messages hasOne ScoreData via MessageID
  ScoreDatum!: ScoreData;
  getScoreDatum!: Sequelize.HasOneGetAssociationMixin<ScoreData>;
  setScoreDatum!: Sequelize.HasOneSetAssociationMixin<ScoreData, ScoreDataId>;
  createScoreDatum!: Sequelize.HasOneCreateAssociationMixin<ScoreData>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Messages {
    return Messages.init({
    ID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Pseudo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Texte: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    Moderator: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    Type: {
      type: DataTypes.ENUM('score','message','enhancedMessage'),
      allowNull: false,
      defaultValue: "message"
    },
    Supprime: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    Reply: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Messages',
        key: 'ID'
      }
    }
  }, {
    sequelize,
    tableName: 'Messages',
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
        name: "fk_messages_answer",
        using: "BTREE",
        fields: [
          { name: "Reply" },
        ]
      },
    ]
  });
  }
}
