import { Vote } from "../models/Vote";
import { Request } from "express";

export class VoteController {
    /**
     * Attempts to create a new Vote
     * @param {Request} req - The request object 
     * @returns {Promise<Vote>} - A promise that resolves to the created Vote
     */
    static async saveVote(req: Request): Promise<Vote> {
        const vote = new Vote({
            value: req.body.value,
            user_id: req.body.user_id,
            meme_id: req.body.meme_id
        });
        return vote.save();
    }

    /**
     * Attempts to delete a Vote
     * @param {Request} req - The request object
     * @returns {Promise<Vote>} - A promise that resolves to the deleted Vote
     */
    static async deleteVote(req: Request): Promise<boolean> {
        const deletedCount = await Vote.destroy({
            where: {
                user_id: req.body.user_id,
                meme_id: req.body.meme_id
            }
        });
        return deletedCount > 0;
    }
}