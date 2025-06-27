import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Messages, MessagesId } from './Messages';

export interface MessageImagesAttributes {
  ImageID: number;
  MessageID: number;
  ImageData?: string;
  CreatedAt: Date;
}

export type MessageImagesPk = "ImageID";
export type MessageImagesId = MessageImages[MessageImagesPk];
export type MessageImagesOptionalAttributes = "ImageID" | "ImageData" | "CreatedAt";
export type MessageImagesCreationAttributes = Optional<MessageImagesAttributes, MessageImagesOptionalAttributes>;

export class MessageImages extends Model<MessageImagesAttributes, MessageImagesCreationAttributes> implements MessageImagesAttributes {
  ImageID!: number;
  MessageID!: number;
  ImageData?: string;
  CreatedAt!: Date;

  // MessageImages belongsTo Messages via MessageID
  Message!: Messages;
  getMessage!: Sequelize.BelongsToGetAssociationMixin<Messages>;
  setMessage!: Sequelize.BelongsToSetAssociationMixin<Messages, MessagesId>;
  createMessage!: Sequelize.BelongsToCreateAssociationMixin<Messages>;

  static initModel(sequelize: Sequelize.Sequelize): typeof MessageImages {
    return MessageImages.init({
    ImageID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    MessageID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Messages',
        key: 'ID'
      }
    },
    ImageData: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'MessageImages',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ImageID" },
        ]
      },
      {
        name: "MessageID",
        using: "BTREE",
        fields: [
          { name: "MessageID" },
        ]
      },
    ]
  });
  }
}
