import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";

export interface MotFrancaisAttributes {
  ID: number;
  MotFrancais: string;
}

export type MotFrancaisPk = "ID";
export type MotFrancaisId = MotFrancais[MotFrancaisPk];
export type MotFrancaisOptionalAttributes = "ID";
export type MotFrancaisCreationAttributes = Optional<
  MotFrancaisAttributes,
  MotFrancaisOptionalAttributes
>;

export class MotFrancais
  extends Model<MotFrancaisAttributes, MotFrancaisCreationAttributes>
  implements MotFrancaisAttributes
{
  ID!: number;
  MotFrancais!: string;

  static initModel(sequelize: Sequelize.Sequelize): typeof MotFrancais {
    return MotFrancais.init(
      {
        ID: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        MotFrancais: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "MotFrancais",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "ID" }],
          },
        ],
      },
    );
  }
}
