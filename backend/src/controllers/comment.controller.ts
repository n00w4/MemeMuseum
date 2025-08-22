import { Comment } from "../models/Comment";
import { Request } from "express";
import { ValidationError, Op } from "sequelize"; // Import aggiuntivo per gestire errori specifici

export class CommentController {
    /**
     * Retrieves all comments from the database
     * @returns {Promise<Comment[]>} - A promise that resolves to an array of comments
     */
    static async getAllComments(): Promise<Comment[]> {
        try {
            return await Comment.findAll();
        } catch (error) {
            console.error('Failed to fetch comments:', error);
            return [];
        }
    }

    /**
     * Retrieves comments from the database
     * @param {number} limit - The maximum number of comments to retrieve
     * @returns {Promise<Comment[]>} - A promise that resolves to an array of comments
     */
    static async getComments(limit: number): Promise<Comment[]> {
        try {
            if (!Number.isInteger(limit)) {
                console.warn('Invalid limit parameter:', limit);
                limit = 10;
            }
            
            return await Comment.findAll({ 
                limit: Math.min(limit, 100),
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            console.error(`Error fetching ${limit} comments:`, error);
            return [];
        }
    }

    /**
     * Attempts to create a new Comment
     * @param req - The request object
     * @returns {Promise<Comment | null>} - A promise that resolves to a comment or null
     */
    static async saveComment(req: Request): Promise<Comment | null> {
        try {
            if (!req.body?.content || !req.body?.user_id || !req.body?.meme_id) {
                throw new Error('Missing required comment fields');
            }

            if (req.body.content.length > 1000) {
                throw new Error('Comment exceeds maximum length (1000 chars)');
            }

            const comment = new Comment({
                content: req.body.content.toString().trim(),
                user_id: Number(req.body.user_id),
                meme_id: Number(req.body.meme_id)
            });

            return await comment.save();
        } catch (error) {
            console.error('Error saving comment:', error);
            
            if (error instanceof ValidationError) {
                console.error('Validation errors:', error.errors.map(e => e.message));
            }
            
            return null;
        }
    }

    /**
     * Attempts to delete a Comment
     * @param req - The request object
     * @returns {Promise<boolean>} - A promise that resolves to a boolean
     */
    static async deleteComment(req: Request): Promise<boolean> {
        try {
            if (!req.body?.user_id || !req.body?.meme_id) {
                throw new Error('Missing deletion parameters');
            }

            const deletedCount = await Comment.destroy({
                where: {
                    [Op.and]: [
                        { user_id: Number(req.body.user_id) },
                        { meme_id: Number(req.body.meme_id) }
                    ]
                }
            });
            
            return deletedCount > 0;
        } catch (error) {
            console.error('Error deleting comment:', error);
            return false;
        }
    }
}