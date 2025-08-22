import { Vote } from "../models/Vote";
import { Request } from "express";
import { ValidationError, Op } from "sequelize";

export class VoteController {
    /**
     * Attempts to create a new Vote
     * @param {Request} req - The request object 
     * @returns {Promise<Vote | null>} - The created Vote or null on failure
     */
    static async saveVote(req: Request): Promise<Vote | null> {
        try {
            if (!req.body?.value || !req.body?.user_id || !req.body?.meme_id) {
                throw new Error('Missing required vote fields');
            }

            const voteValue = Number(req.body.value);
            if (![-1, 1].includes(voteValue)) {
                throw new Error('Invalid vote value. Must be -1 or 1');
            }

            let existingVote = await Vote.findOne({
                where: {
                    user_id: req.body.user_id,
                    meme_id: req.body.meme_id
                }
            });

            if (existingVote) {
                existingVote.value = voteValue;
                return await existingVote.save();
            }

            const vote = new Vote({
                value: voteValue,
                user_id: Number(req.body.user_id),
                meme_id: Number(req.body.meme_id)
            });

            return await vote.save();
        } catch (error) {
            console.error('Error saving vote:', error);
            
            if (error instanceof ValidationError) {
                console.error('Validation errors:', error.errors.map(e => e.message));
            }
            
            return null;
        }
    }

    /**
     * Attempts to delete a Vote
     * @param {Request} req - The request object
     * @returns {Promise<boolean>} - True if vote was deleted
     */
    static async deleteVote(req: Request): Promise<boolean> {
        try {
            if (!req.body?.user_id || !req.body?.meme_id) {
                throw new Error('Missing required parameters for vote deletion');
            }

            const deletedCount = await Vote.destroy({
                where: {
                    [Op.and]: [
                        { user_id: Number(req.body.user_id) },
                        { meme_id: Number(req.body.meme_id) }
                    ]
                }
            });
            
            return deletedCount > 0;
        } catch (error) {
            console.error('Error deleting vote:', error);
            return false;
        }
    }

    /**
     * Alternative method to handle vote creation/update
     * @param userId - User ID
     * @param memeId - Meme ID
     * @param value - Vote value (-1, 0, 1)
     * @returns {Promise<Vote | null>} - The created/updated vote
     */
    static async setVote(userId: number, memeId: number, value: number): Promise<Vote | null> {
        try {
            if (!userId || !memeId || ![-1, 0, 1].includes(value)) {
                throw new Error('Invalid vote parameters');
            }

            const [vote] = await Vote.upsert({
                user_id: userId,
                meme_id: memeId,
                value: value
            }, {
                conflictFields: ['user_id', 'meme_id'] // Chiave univoca
            });

            return vote;
        } catch (error) {
            console.error('Error setting vote:', error);
            return null;
        }
    }
}