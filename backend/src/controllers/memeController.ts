import { Meme } from '../models/Meme';

export class MemeController {
    /**
     * Retrieves memes from the database
     * @param {number} limit - The maximum number of memes to retrieve
     * @returns {Promise<Meme[]>} memes - An array of memes
     */
    static async getMemes(limit: number): Promise<Meme[]> {
        try {
            const memes = await Meme.findAll({ limit: limit });
            return memes;
        } catch (error) {
            console.error('Error retrieving memes:', error);
            throw error;
        }
    }
}