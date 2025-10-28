import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import type { Player, PlayerId } from "./Player";
import type { WordHistory, WordHistoryId } from "./WordHistory";

export interface TryAttributes {
  PlayerID: number;
  WordHistoryID: number;
  Attempts: string;
  Win: number;
  AttemptCount: number;
}

export type TryPk = "PlayerID" | "WordHistoryID";
export type TryId = Try[TryPk];
export type TryOptionalAttributes = "Win" | "AttemptCount";
export type TryCreationAttributes = Optional<
  TryAttributes,
  TryOptionalAttributes
>;

export class Try
  extends Model<TryAttributes, TryCreationAttributes>
  implements TryAttributes
{
  PlayerID!: number;
  WordHistoryID!: number;
  Attempts!: string;
  Win!: number;
  AttemptCount!: number;

  // Try belongsTo Player via PlayerID
  Player!: Player;
  getPlayer!: Sequelize.BelongsToGetAssociationMixin<Player>;
  setPlayer!: Sequelize.BelongsToSetAssociationMixin<Player, PlayerId>;
  createPlayer!: Sequelize.BelongsToCreateAssociationMixin<Player>;
  // Try belongsTo WordHistory via WordHistoryID
  WordHistory!: WordHistory;
  getWordHistory!: Sequelize.BelongsToGetAssociationMixin<WordHistory>;
  setWordHistory!: Sequelize.BelongsToSetAssociationMixin<
    WordHistory,
    WordHistoryId
  >;
  createWordHistory!: Sequelize.BelongsToCreateAssociationMixin<WordHistory>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Try {
    return Try.init(
      {
        PlayerID: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: "Player",
            key: "ID",
          },
        },
        WordHistoryID: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: "WordHistory",
            key: "ID",
          },
        },
        Attempts: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        Win: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: 0,
        },
        AttemptCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        tableName: "Try",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "PlayerID" }, { name: "WordHistoryID" }],
          },
          {
            name: "Try_fk_WordHistory",
            using: "BTREE",
            fields: [{ name: "WordHistoryID" }],
          },
        ],
      },
    );
  }
}
