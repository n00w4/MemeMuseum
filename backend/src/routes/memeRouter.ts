import express, { Request, Response, NextFunction } from "express";
import { MemeController } from "../controllers/memeController";

export const memeRouter = express.Router();

/**
 * @swagger
 *  /memes:
 *    get:
 *      description: Retrieve all memes
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: Memes retrieved successfully
 *        500:
 *          description: Internal server error
 */
memeRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const memes = await MemeController.getAllMemes();
        res.success('Memes retrieved successfully', memes);
    } catch (err) {
        console.error(err);
        res.fail(500, 'Could not retrieve memes');
    }
});