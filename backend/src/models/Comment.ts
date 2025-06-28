import { Sequelize, DataTypes, Model, Optional } from "sequelize";

export interface CommentAttributes {
  id: number;
  content: string;
  user_id: number;
  meme_id: number;
  createdAt?: Date;
}

export interface CommentCreationAttributes extends Optional<CommentAttributes, "id" | "createdAt"> {}

export class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: number;
  public content!: string;
  public user_id!: number;
  public meme_id!: number;
 
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
}

export function initCommentModel(sequelize: Sequelize) {
  Comment.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.STRING(255),
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
    tableName: 'comments',
    modelName: 'Comment',
    timestamps: true
  });
}