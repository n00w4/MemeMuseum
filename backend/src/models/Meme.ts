import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { User } from './User';
import { Tag } from './Tag';
import { Vote } from './Vote';
import { Comment } from './Comment';

export interface MemeAttributes {
  id: number;
  title: string;
  image: string;
  datetime_upload: Date;
  user_id: number;
}

export interface MemeCreationAttributes extends Optional<MemeAttributes, 'id'> {}

export class Meme extends Model<MemeAttributes, MemeCreationAttributes> implements MemeAttributes {
  public id!: number;
  public title!: string;
  public image!: string;
  public datetime_upload!: Date;
  public user_id!: number;

  // Associations
  public readonly user?: User;
  public readonly tags?: Tag[];
  public readonly votes?: Vote[];
  public readonly comments?: Comment[];

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initMemeModel(sequelize: Sequelize): void {
  Meme.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    datetime_upload: {
      type: DataTypes.DATE,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Meme',
    tableName: 'memes',
    timestamps: true
  });
}

