import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Score, ScoreId } from './Score';

export interface SurtomienAttributes {
  ID: number;
  Pseudo: string;
  MotDePasse: string;
  HashSession?: string;
  DateInscription: string;
  Admin: number;
  lastIp?: string;
  banned: number;
}

export type SurtomienPk = "ID";
export type SurtomienId = Surtomien[SurtomienPk];
export type SurtomienOptionalAttributes = "ID" | "HashSession" | "DateInscription" | "Admin" | "lastIp" | "banned";
export type SurtomienCreationAttributes = Optional<SurtomienAttributes, SurtomienOptionalAttributes>;

export class Surtomien extends Model<SurtomienAttributes, SurtomienCreationAttributes> implements SurtomienAttributes {
  ID!: number;
  Pseudo!: string;
  MotDePasse!: string;
  HashSession?: string;
  DateInscription!: string;
  Admin!: number;
  lastIp?: string;
  banned!: number;

  // Surtomien hasMany Score via Surtomien
  Scores!: Score[];
  getScores!: Sequelize.HasManyGetAssociationsMixin<Score>;
  setScores!: Sequelize.HasManySetAssociationsMixin<Score, ScoreId>;
  addScore!: Sequelize.HasManyAddAssociationMixin<Score, ScoreId>;
  addScores!: Sequelize.HasManyAddAssociationsMixin<Score, ScoreId>;
  createScore!: Sequelize.HasManyCreateAssociationMixin<Score>;
  removeScore!: Sequelize.HasManyRemoveAssociationMixin<Score, ScoreId>;
  removeScores!: Sequelize.HasManyRemoveAssociationsMixin<Score, ScoreId>;
  hasScore!: Sequelize.HasManyHasAssociationMixin<Score, ScoreId>;
  hasScores!: Sequelize.HasManyHasAssociationsMixin<Score, ScoreId>;
  countScores!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Surtomien {
    return Surtomien.init({
    ID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Pseudo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "uq_surtomien_pseudo"
    },
    MotDePasse: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    HashSession: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    DateInscription: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    Admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    lastIp: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    banned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'Surtomien',
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
        name: "uq_surtomien_pseudo",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "Pseudo" },
        ]
      },
    ]
  });
  }
}
