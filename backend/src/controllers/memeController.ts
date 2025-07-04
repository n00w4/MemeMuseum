import { Meme } from '../models/Meme';
import { FeaturedMeme } from '../models/FeaturedMeme';
import { Sequelize } from 'sequelize';

export class MemeController {
    /**
     * Retrieves all memes from the database
     * @returns {Promise<Meme[]>} - An array of memes
     */
    static async getAllMemes(): Promise<Meme[]> {
        const memes = await Meme.findAll();
        return memes;
    }

    /**
     * Retrieves memes from the database
     * @param {number} limit - The maximum number of memes to retrieve
     * @returns {Promise<Meme[]>} - An array of memes
     */
    static async getMemes(limit: number): Promise<Meme[]> {
        const memes = await Meme.findAll({ limit: limit });
        return memes;
    }

    /**
     * Retrieves a random meme from the database
     * @returns {Promise<Meme>} - A random meme
     */
    static async getMemeOfTheDay(): Promise<Meme | null> {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    let featured = await FeaturedMeme.findOne({ where: { date: today } });

    if (featured) {
      return await Meme.findOne({ where: { id: featured.memeId } });
    }

    let meme = await Meme.findOne({
      order: [Sequelize.literal('RANDOM()')]
    });

    if (meme) {
      await FeaturedMeme.create({
        memeId: meme.id,
        date: today
      });
    }

    return meme;
  }
  
  /**
   * Attempts to save a new Meme
   * @param data - The data to save the Meme
   * @returns {Promise<Meme>} - A promise that resolves to the created Meme
   */
  static async saveMeme(data: { title: string, imageBuffer: Buffer, user_id: number }): Promise<Meme> {
    const base64Image = data.imageBuffer.toString('base64');
    return Meme.create({
      title: data.title,
      image: base64Image,
      user_id: data.user_id
    });
  }
}