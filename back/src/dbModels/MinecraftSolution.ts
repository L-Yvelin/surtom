import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { WordHistory, WordHistoryId } from './WordHistory';

export interface MinecraftSolutionAttributes {
  ID: number;
  Language: string;
  Word: string;
  Rotation: number;
  AssignedDate?: string;
}

export type MinecraftSolutionPk = 'ID';
export type MinecraftSolutionId = MinecraftSolution[MinecraftSolutionPk];
export type MinecraftSolutionOptionalAttributes = 'ID' | 'Rotation' | 'AssignedDate';
export type MinecraftSolutionCreationAttributes = Optional<MinecraftSolutionAttributes, MinecraftSolutionOptionalAttributes>;

export class MinecraftSolution
  extends Model<MinecraftSolutionAttributes, MinecraftSolutionCreationAttributes>
  implements MinecraftSolutionAttributes
{
  ID!: number;
  Language!: string;
  Word!: string;
  Rotation!: number;
  AssignedDate?: string;

  // MinecraftSolution hasMany WordHistory via WordID
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

  static initModel(sequelize: Sequelize.Sequelize): typeof MinecraftSolution {
    return MinecraftSolution.init(
      {
        ID: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        Language: {
          type: DataTypes.STRING(8),
          allowNull: false,
        },
        Word: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        Rotation: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        AssignedDate: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'MinecraftSolution',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'ID' }],
          },
          {
            name: 'MinecraftSolution_uk_Language_Word',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'Language' }, { name: 'Word' }],
          },
          {
            name: 'MinecraftSolution_idx_Language_Rotation',
            using: 'BTREE',
            fields: [{ name: 'Language' }, { name: 'Rotation' }],
          },
        ],
      },
    );
  }
}
