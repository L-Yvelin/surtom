import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { MotMinecraft, MotMinecraftId } from './MotMinecraft';

export interface WordHistoryAttributes {
  ID: number;
  WordID: number;
  AssignedDate: string;
}

export type WordHistoryPk = "ID";
export type WordHistoryId = WordHistory[WordHistoryPk];
export type WordHistoryOptionalAttributes = "ID";
export type WordHistoryCreationAttributes = Optional<WordHistoryAttributes, WordHistoryOptionalAttributes>;

export class WordHistory extends Model<WordHistoryAttributes, WordHistoryCreationAttributes> implements WordHistoryAttributes {
  ID!: number;
  WordID!: number;
  AssignedDate!: string;

  // WordHistory belongsTo MotMinecraft via WordID
  Word!: MotMinecraft;
  getWord!: Sequelize.BelongsToGetAssociationMixin<MotMinecraft>;
  setWord!: Sequelize.BelongsToSetAssociationMixin<MotMinecraft, MotMinecraftId>;
  createWord!: Sequelize.BelongsToCreateAssociationMixin<MotMinecraft>;

  static initModel(sequelize: Sequelize.Sequelize): typeof WordHistory {
    return WordHistory.init({
    ID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    WordID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'MotMinecraft',
        key: 'ID'
      }
    },
    AssignedDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'WordHistory',
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
        name: "WordID",
        using: "BTREE",
        fields: [
          { name: "WordID" },
        ]
      },
    ]
  });
  }
}
