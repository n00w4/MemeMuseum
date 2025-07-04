import { Comment } from "../models/Comment";
import { Request } from "express";

export class CommentController {
    /**
     * Retrieves all comments from the database
     * @returns {Promise<Comment[]>} - A promise that resolves to an array of comments
     */
    static async getAllComments(): Promise<Comment[]> {
        const comments = await Comment.findAll();
        return comments;
    }

    /**
     * Retrieves comments from the database
     * @param {number} limit - The maximum number of comments to retrieve
     * @returns {Promise<Comment[]>} - A promise that resolves to an array of comments
     */
    static async getComments(limit: number): Promise<Comment[]> {
        const comments = await Comment.findAll({ limit: limit });
        return comments;
    }

    /**
     * Attempts to create a new Comment
     * @param req - The request object
     * @returns {Promise<Comment>} - A promise that resolves to a comment
     */
    static async saveComment(req: Request): Promise<Comment> {
        const comment = new Comment({
            content: req.body.content,
            user_id: req.body.user_id,
            meme_id: req.body.meme_id
        });
        return comment.save();
    }

    /**
     * Attempts to delete a Comment
     * @param req - The request object
     * @returns {Promise<boolean>} - A promise that resolves to a boolean
     */
    static async deleteComment(req: Request): Promise<boolean> {
        const deletedCount = await Comment.destroy({
            where: {
                user_id: req.body.user_id,
                meme_id: req.body.meme_id
            }
        });
        return deletedCount > 0;
    }
}