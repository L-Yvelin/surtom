import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { WordHistory, WordHistoryId } from './WordHistory';

export interface MotMinecraftAttributes {
  ID: number;
  MotMinecraft: string;
  Date?: string;
  Rotation: number;
}

export type MotMinecraftPk = "ID";
export type MotMinecraftId = MotMinecraft[MotMinecraftPk];
export type MotMinecraftOptionalAttributes = "ID" | "Date" | "Rotation";
export type MotMinecraftCreationAttributes = Optional<MotMinecraftAttributes, MotMinecraftOptionalAttributes>;

export class MotMinecraft extends Model<MotMinecraftAttributes, MotMinecraftCreationAttributes> implements MotMinecraftAttributes {
  ID!: number;
  MotMinecraft!: string;
  Date?: string;
  Rotation!: number;

  // MotMinecraft hasMany WordHistory via WordID
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

  static initModel(sequelize: Sequelize.Sequelize): typeof MotMinecraft {
    return MotMinecraft.init({
    ID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    MotMinecraft: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    Rotation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'MotMinecraft',
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
    ]
  });
  }
}
