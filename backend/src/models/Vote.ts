import { Sequelize, DataTypes, Model, Optional } from "sequelize";

export interface VoteAttributes {
  id: number;
  value: number;
  user_id: number;
  meme_id: number;
}

export interface VoteCreationAttributes extends Optional<VoteAttributes, 'id'> { }

export class Vote extends Model<VoteAttributes, VoteCreationAttributes> {
  public id!: number;
  public value!: number;
  public user_id!: number;
  public meme_id!: number;
}

export function initVoteModel(sequelize: Sequelize) {
  Vote.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    meme_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Vote',
    tableName: 'votes',
    timestamps: true
  });
}