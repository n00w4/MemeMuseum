import { Sequelize, DataTypes, Model, Optional } from "sequelize";

export interface MemeTagAttributes {
    meme_id: number;
    tag_id: number;
}

export class MemeTag extends Model<MemeTagAttributes> {}

export function initMemeTagModel(sequelize: Sequelize) {
  MemeTag.init({
    meme_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'MemeTag',
    tableName: 'meme_tags',
    timestamps: false
  });
}