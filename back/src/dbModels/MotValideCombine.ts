import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";

export interface MotValideCombineAttributes {
  ID: number;
  MotValide: string;
}

export type MotValideCombinePk = "ID";
export type MotValideCombineId = MotValideCombine[MotValideCombinePk];
export type MotValideCombineOptionalAttributes = "ID" | "MotValide";
export type MotValideCombineCreationAttributes = Optional<
  MotValideCombineAttributes,
  MotValideCombineOptionalAttributes
>;

export class MotValideCombine
  extends Model<MotValideCombineAttributes, MotValideCombineCreationAttributes>
  implements MotValideCombineAttributes
{
  ID!: number;
  MotValide!: string;

  static initModel(sequelize: Sequelize.Sequelize): typeof MotValideCombine {
    return MotValideCombine.init(
      {
        ID: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        MotValide: {
          type: DataTypes.STRING(255),
          allowNull: false,
          defaultValue: "",
        },
      },
      {
        sequelize,
        tableName: "MotValideCombine",
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
