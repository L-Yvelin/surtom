import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Messages, MessagesId } from './Messages';

export interface ScoreDataAttributes {
  MessageID: number;
  Couleurs?: string;
  Mots?: string;
  Answer?: string;
  Attempts?: number;
  Custom: number;
}

export type ScoreDataPk = "MessageID";
export type ScoreDataId = ScoreData[ScoreDataPk];
export type ScoreDataOptionalAttributes = "Couleurs" | "Mots" | "Answer" | "Attempts" | "Custom";
export type ScoreDataCreationAttributes = Optional<ScoreDataAttributes, ScoreDataOptionalAttributes>;

export class ScoreData extends Model<ScoreDataAttributes, ScoreDataCreationAttributes> implements ScoreDataAttributes {
  MessageID!: number;
  Couleurs?: string;
  Mots?: string;
  Answer?: string;
  Attempts?: number;
  Custom!: number;

  // ScoreData belongsTo Messages via MessageID
  Message!: Messages;
  getMessage!: Sequelize.BelongsToGetAssociationMixin<Messages>;
  setMessage!: Sequelize.BelongsToSetAssociationMixin<Messages, MessagesId>;
  createMessage!: Sequelize.BelongsToCreateAssociationMixin<Messages>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ScoreData {
    return ScoreData.init({
    MessageID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Messages',
        key: 'ID'
      }
    },
    Couleurs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Mots: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Answer: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Attempts: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Custom: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'ScoreData',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "MessageID" },
        ]
      },
    ]
  });
  }
}
