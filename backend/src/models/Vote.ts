import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import { User } from "./User";
import { Meme } from "./Meme";

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
  
  // Associations
  public readonly user?: User;
  public readonly meme?: Meme;

  // Timestamps
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
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
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    meme_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'memes',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Vote',
    tableName: 'votes',
    timestamps: true
  });
}
