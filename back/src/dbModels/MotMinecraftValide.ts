import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";

export interface MotMinecraftValideAttributes {
  ID: number;
  MotMinecraftValide: string;
}

export type MotMinecraftValidePk = "ID";
export type MotMinecraftValideId = MotMinecraftValide[MotMinecraftValidePk];
export type MotMinecraftValideOptionalAttributes = "ID";
export type MotMinecraftValideCreationAttributes = Optional<
  MotMinecraftValideAttributes,
  MotMinecraftValideOptionalAttributes
>;

export class MotMinecraftValide
  extends Model<
    MotMinecraftValideAttributes,
    MotMinecraftValideCreationAttributes
  >
  implements MotMinecraftValideAttributes
{
  ID!: number;
  MotMinecraftValide!: string;

  static initModel(sequelize: Sequelize.Sequelize): typeof MotMinecraftValide {
    return MotMinecraftValide.init(
      {
        ID: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        MotMinecraftValide: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "MotMinecraftValide",
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
