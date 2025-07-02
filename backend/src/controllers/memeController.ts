import { Meme } from '../models/Meme';

export class MemeController {
    /**
     * Retrieves all memes from the database
     * @returns {Promise<Meme[]>} memes - An array of memes
     */
    static async getAllMemes(): Promise<Meme[]> {
        const memes = await Meme.findAll();
        return memes;
    }

    /**
     * Retrieves memes from the database
     * @param {number} limit - The maximum number of memes to retrieve
     * @returns {Promise<Meme[]>} memes - An array of memes
     */
    static async getMemes(limit: number): Promise<Meme[]> {
        const memes = await Meme.findAll({ limit: limit });
        return memes;
    }
}