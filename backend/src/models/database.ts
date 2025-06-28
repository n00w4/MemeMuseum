import { Dialect, Sequelize } from 'sequelize';
import 'dotenv/config';
import { initUserModel, User } from "./User";
import { initMemeModel, Meme } from "./Meme";
import { initMemeTagModel, MemeTag } from "./MemeTag";
import { initTagModel, Tag } from "./Tag";
import { initVoteModel, Vote } from "./Vote";
import { initCommentModel, Comment } from "./Comment";

const dbConnectionUri = process.env.DB_CONNECTION_URI;
const dbDialect = process.env.DB_DIALECT;

if (!dbConnectionUri || !dbDialect) {
  throw new Error('Missing DB_CONNECTION_URI or DB_DIALECT environment variables. Please check your .env file.');
}

export const sequelize = new Sequelize(dbConnectionUri, {
  dialect: dbDialect as Dialect
});

initUserModel(sequelize);
initMemeModel(sequelize);
initMemeTagModel(sequelize);
initTagModel(sequelize);
initVoteModel(sequelize);
initCommentModel(sequelize);

Meme.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Meme, { foreignKey: "user_id", as: "memes" });

User.hasMany(Vote, { foreignKey: "user_id", as: "votes" });
Vote.belongsTo(User, { foreignKey: "user_id", as: "user" });
Meme.hasMany(Vote, { foreignKey: "meme_id", as: "votes" });
Vote.belongsTo(Meme, { foreignKey: "meme_id", as: "meme" });

Meme.hasMany(Comment, { foreignKey: "meme_id", as: "comments" });
Comment.belongsTo(Meme, { foreignKey: "meme_id", as: "meme" });
User.hasMany(Comment, { foreignKey: "user_id", as: "comments" });
Comment.belongsTo(User, { foreignKey: "user_id", as: "user" });

Meme.belongsToMany(Tag, {
  through: MemeTag,
  foreignKey: "meme_id",
  otherKey: "tag_id",
  as: "tags",
});

Tag.belongsToMany(Meme, {
  through: MemeTag,
  foreignKey: "tag_id",
  otherKey: "meme_id",
  as: "memes",
});

export const syncDatabase = async (force: boolean = false): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    await sequelize.sync({ force });
    console.log(`Database synchronized ${force ? '(recreated)' : '(updated)'} successfully.`);
  } catch (error) {
    console.error('Unable to synchronize the database:', error);
    throw error;
  }
};

export { User, Meme, Tag, Vote, Comment, MemeTag };

export default sequelize;