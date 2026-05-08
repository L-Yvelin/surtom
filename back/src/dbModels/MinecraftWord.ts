import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface MinecraftWordAttributes {
  ID: number;
  Language: string;
  Word: string;
}

export type MinecraftWordPk = 'ID';
export type MinecraftWordId = MinecraftWord[MinecraftWordPk];
export type MinecraftWordOptionalAttributes = 'ID';
export type MinecraftWordCreationAttributes = Optional<MinecraftWordAttributes, MinecraftWordOptionalAttributes>;

export class MinecraftWord extends Model<MinecraftWordAttributes, MinecraftWordCreationAttributes> implements MinecraftWordAttributes {
  ID!: number;
  Language!: string;
  Word!: string;

  static initModel(sequelize: Sequelize.Sequelize): typeof MinecraftWord {
    return MinecraftWord.init(
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
      },
      {
        sequelize,
        tableName: 'MinecraftWord',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'ID' }],
          },
          {
            name: 'MinecraftWord_uk_Language_Word',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'Language' }, { name: 'Word' }],
          },
        ],
      },
    );
  }
}
