import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import type { Message, MessageId } from "./Message";

export interface TextContentAttributes {
  ID: number;
  Text: string;
  ImageData?: string;
  ReplyID?: number;
}

export type TextContentPk = "ID";
export type TextContentId = TextContent[TextContentPk];
export type TextContentOptionalAttributes = "ImageData" | "ReplyID";
export type TextContentCreationAttributes = Optional<
  TextContentAttributes,
  TextContentOptionalAttributes
>;

export class TextContent
  extends Model<TextContentAttributes, TextContentCreationAttributes>
  implements TextContentAttributes
{
  ID!: number;
  Text!: string;
  ImageData?: string;
  ReplyID?: number;

  // TextContent belongsTo Message via ID
  ID_Message!: Message;
  getID_Message!: Sequelize.BelongsToGetAssociationMixin<Message>;
  setID_Message!: Sequelize.BelongsToSetAssociationMixin<Message, MessageId>;
  createID_Message!: Sequelize.BelongsToCreateAssociationMixin<Message>;
  // TextContent belongsTo Message via ReplyID
  Reply!: Message;
  getReply!: Sequelize.BelongsToGetAssociationMixin<Message>;
  setReply!: Sequelize.BelongsToSetAssociationMixin<Message, MessageId>;
  createReply!: Sequelize.BelongsToCreateAssociationMixin<Message>;

  static initModel(sequelize: Sequelize.Sequelize): typeof TextContent {
    return TextContent.init(
      {
        ID: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: "Message",
            key: "ID",
          },
        },
        Text: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        ImageData: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        ReplyID: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "Message",
            key: "ID",
          },
        },
      },
      {
        sequelize,
        tableName: "TextContent",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "ID" }],
          },
          {
            name: "ReplyID",
            using: "BTREE",
            fields: [{ name: "ReplyID" }],
          },
        ],
      },
    );
  }
}
