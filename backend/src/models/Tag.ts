import { Sequelize, DataTypes, Model, Optional } from "sequelize";


export interface TagAttributes {
  id: number;
  name: string;
}

export interface TagCreationAttributes extends Optional<TagAttributes, "id"> {}

export class Tag extends Model<TagAttributes, TagCreationAttributes> {
  public id!: number;
  public name!: string;

  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
}

export function initTagModel(sequelize: Sequelize) {
  Tag.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Tag',
    tableName: 'tags',
    timestamps: false
  });
}