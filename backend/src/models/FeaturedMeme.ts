import { Model, DataTypes } from 'sequelize';
import sequelize from './database';

export class FeaturedMeme extends Model {
  public id!: number;
  public memeId!: number;
  public date!: string;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FeaturedMeme.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  memeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'memes', key: 'id' }
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  sequelize,
  modelName: 'FeaturedMeme',
  tableName: 'featured_meme',
  timestamps: false
});
