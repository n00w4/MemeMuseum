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
memeRouter.get("/memes", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const memes = await MemeController.getAllMemes();
        res.success('Memes retrieved successfully', memes);
    } catch (err) {
        console.error(err);
        res.fail(500, 'Could not retrieve memes');
    }
});

/**
 * @swagger
 *  /meme-of-the-day:
 *    get:
 *      description: Retrieve the meme of the day
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: Meme of the day retrieved successfully
 *        500:
 *          description: Internal server error
 */
memeRouter.get("/meme-of-the-day", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const meme = await MemeController.getMemeOfTheDay();
        res.success('Meme of the day retrieved successfully', meme);
    } catch (err) {
        console.error(err);
        res.fail(500, 'Could not retrieve meme of the day');
    }
});

/**
 * @swagger
 *  /memes/{id}:
 *    get:
 *      description: Retrieve the meme with the specified ID
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: Meme retrieved successfully
 *        404:
 *          description: Meme not found
 *        500:
 *          description: Internal server error
 */
memeRouter.get("/memes/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const meme = await MemeController.getMemes(parseInt(req.params.id));
        meme ?? res.fail(404, 'Meme not found');
        res.success('Memes retrieved successfully', meme);
    } catch (err) {
        console.error(err);
        res.fail(500, 'Could not retrieve memes');
    }
})