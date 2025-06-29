import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Meme } from './Meme';
import { Vote } from './Vote';
import { Comment } from './Comment';

export interface UserAttributes {
  id: number;
  username: string;
  password: string;
  email: string;
  createdAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;

  public readonly createdAt!: Date;

  public readonly memes?: Meme[];
  public readonly votes?: Vote[];
  public readonly comments?: Comment[];

}
export function initUserModel(sequelize: Sequelize): void {
  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30],
        is: /^[a-zA-Z0-9_-]+$/,
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [8, 255],
      },
    },
  }, {
    sequelize,
    tableName: 'users',
    modelName: 'User'
  });
}
