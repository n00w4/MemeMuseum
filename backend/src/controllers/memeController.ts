import { Meme } from '../models/Meme';
import { FeaturedMeme } from '../models/FeaturedMeme';
import { Sequelize, ValidationError } from 'sequelize';
import { Request } from 'express';

export class MemeController {
    /**
     * Retrieves all memes from the database
     * @returns {Promise<Meme[]>} - An array of memes
     */
    static async getAllMemes(): Promise<Meme[]> {
        try {
            return await Meme.findAll();
        } catch (error) {
            console.error('Failed to fetch all memes:', error);
            return [];
        }
    }

    /**
     * Retrieves memes from the database
     * @param {number} limit - The maximum number of memes to retrieve
     * @returns {Promise<Meme[]>} - An array of memes
     */
    static async getMemes(limit: number): Promise<Meme[]> {
        try {
            // Validazione e sanitizzazione del limite
            const safeLimit = Math.min(Math.abs(limit), 100) || 10;
            
            return await Meme.findAll({ 
                limit: safeLimit,
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            console.error(`Error fetching ${limit} memes:`, error);
            return [];
        }
    }

    /**
     * Retrieves a random meme from the database
     * @returns {Promise<Meme | null>} - A random meme or null
     */
    static async getMemeOfTheDay(): Promise<Meme | null> {
        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            const featured = await FeaturedMeme.findOne({ where: { date: today } });
            
            if (featured) {
                const meme = await Meme.findByPk(featured.memeId);
                if (meme) return meme;
            }

            const randomMeme = await Meme.findOne({
                order: Sequelize.literal('RANDOM()')
            });

            if (randomMeme) {
                await FeaturedMeme.create({
                    memeId: randomMeme.id,
                    date: today
                });
                return randomMeme;
            }

            return null;
        } catch (error) {
            console.error('Error getting meme of the day:', error);
            return null;
        }
    }
  
    /**
     * Attempts to save a new Meme
     * @param data - The data to save the Meme
     * @returns {Promise<Meme | null>} - The created Meme or null on failure
     */
    static async saveMeme(data: { 
        title: string; 
        imageBuffer: Buffer; 
        user_id: number;
    }): Promise<Meme | null> {
        try {
            if (!data?.title || !data?.imageBuffer || !data?.user_id) {
                throw new Error('Missing required meme data');
            }

            if (data.title.length > 100) {
                throw new Error('Title exceeds maximum length (100 chars)');
            }

            if (data.imageBuffer.length > 5 * 1024 * 1024) {
                throw new Error('Image too large (max 5MB)');
            }

            const base64Image = data.imageBuffer.toString('base64');
            
            return await Meme.create({
                title: data.title.trim(),
                image: base64Image,
                user_id: data.user_id
            });
        } catch (error) {
            console.error('Error saving meme:', error);
            
            if (error instanceof ValidationError) {
                console.error('Validation errors:', error.errors.map(e => e.message));
            }
            
            return null;
        }
    }

    /**
     * Alternative method to save meme from Express request
     * @param req - Express request object
     */
    static async saveMemeFromRequest(req: Request): Promise<Meme | null> {
        try {
            if (!req.file?.buffer) {
                throw new Error('No image uploaded');
            }
            
            return this.saveMeme({
                title: req.body.title,
                imageBuffer: req.file.buffer,
                user_id: req.body.user_id
            });
        } catch (error) {
            console.error('Error saving meme from request:', error);
            return null;
        }
    }
}