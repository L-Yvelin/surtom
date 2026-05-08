import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface DictionaryAttributes {
  ID: number;
  Language: string;
  Word: string;
}

export type DictionaryPk = 'ID';
export type DictionaryId = Dictionary[DictionaryPk];
export type DictionaryOptionalAttributes = 'ID';
export type DictionaryCreationAttributes = Optional<DictionaryAttributes, DictionaryOptionalAttributes>;

export class Dictionary extends Model<DictionaryAttributes, DictionaryCreationAttributes> implements DictionaryAttributes {
  ID!: number;
  Language!: string;
  Word!: string;

  static initModel(sequelize: Sequelize.Sequelize): typeof Dictionary {
    return Dictionary.init(
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
        tableName: 'Dictionary',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'ID' }],
          },
          {
            name: 'Dictionary_uk_Language_Word',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'Language' }, { name: 'Word' }],
          },
        ],
      },
    );
  }
}
