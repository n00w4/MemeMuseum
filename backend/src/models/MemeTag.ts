import { Sequelize, DataTypes, Model } from "sequelize";
import { Meme } from "./Meme";
import { Tag } from "./Tag";

export interface MemeTagAttributes {

}

export class MemeTag extends Model<MemeTagAttributes> {
  public readonly meme?: Meme;
  public readonly tag?: Tag;
}

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