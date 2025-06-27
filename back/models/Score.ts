import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Surtomien, SurtomienId } from './Surtomien';

export interface ScoreAttributes {
  Mots: string;
  Date: string;
  Surtomien: string;
}

export type ScorePk = "Date" | "Surtomien";
export type ScoreId = Score[ScorePk];
export type ScoreOptionalAttributes = "Date";
export type ScoreCreationAttributes = Optional<ScoreAttributes, ScoreOptionalAttributes>;

export class Score extends Model<ScoreAttributes, ScoreCreationAttributes> implements ScoreAttributes {
  Mots!: string;
  Date!: string;
  Surtomien!: string;

  // Score belongsTo Surtomien via Surtomien
  Surtomien_Surtomien!: Surtomien;
  getSurtomien_Surtomien!: Sequelize.BelongsToGetAssociationMixin<Surtomien>;
  setSurtomien_Surtomien!: Sequelize.BelongsToSetAssociationMixin<Surtomien, SurtomienId>;
  createSurtomien_Surtomien!: Sequelize.BelongsToCreateAssociationMixin<Surtomien>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Score {
    return Score.init({
    Mots: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('curdate'),
      primaryKey: true
    },
    Surtomien: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Surtomien',
        key: 'Pseudo'
      }
    }
  }, {
    sequelize,
    tableName: 'Score',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "Date" },
          { name: "Surtomien" },
        ]
      },
      {
        name: "fk_Score_SurtomienID",
        using: "BTREE",
        fields: [
          { name: "Surtomien" },
        ]
      },
    ]
  });
  }
}
