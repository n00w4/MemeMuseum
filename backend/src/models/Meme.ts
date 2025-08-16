import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { User } from './User';
import { Tag } from './Tag';
import { Vote } from './Vote';
import { Comment } from './Comment';

export interface MemeAttributes {
  id: number;
  title: string;
  image: string;
  user_id: number;
}

export interface MemeCreationAttributes extends Optional<MemeAttributes, 'id'> {}

export class Meme extends Model<MemeAttributes, MemeCreationAttributes> implements MemeAttributes {
  public id!: number;
  public title!: string;
  public image!: string;
  public user_id!: number;

  public readonly user?: User;
  public readonly tags?: Tag[];
  public readonly votes?: Vote[];
  public readonly comments?: Comment[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public setTags!: (tags: Tag[] | number[]) => Promise<void>;
  public addTag!: (tag: Tag) => Promise<void>;
  public removeTag!: (tag: Tag) => Promise<void>;
  public hasTag!: (tag: Tag) => Promise<boolean>;
  public countTags!: () => Promise<number>;
  public getTags!: () => Promise<Tag[]>;
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

