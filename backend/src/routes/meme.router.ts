import express, { Request, Response, NextFunction } from "express";
import { MemeController } from "../controllers/meme.controller";
import { VoteController } from "../controllers/vote.controller";
import { CommentController } from "../controllers/comment.controller";
import { upload } from "../middlewares/upload";
import { MulterError } from "multer";
import { enforceAuthentication } from "../middlewares/enforceAuthentication";
import { optionalAuthentication } from "../middlewares/optionalAuthentication";
import { verifyCsrfToken } from "../middlewares/csrf";

export const memeRouter = express.Router();

/**
 * @swagger
 *  /api/v1/memes:
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
memeRouter.get("/memes", optionalAuthentication, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const memes = await MemeController.getAllMemes(req);
        return res.success('Memes retrieved successfully', memes);
    } catch (err) {
        console.error(err);
        return res.fail(500, 'Could not retrieve memes');
    }
});

/**
 * @swagger
 * /api/v1/memes:
 *   post:
 *     description: Create a new meme
 *     produces:
 *       - application/json
 *     requestBody:
 *       description: Meme data
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Meme title
 *               image:
 *                 type: string
 *                 format: binary
 *                 example: Meme image
 *               user_id:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Meme created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
memeRouter.post('/memes', enforceAuthentication,  verifyCsrfToken, async (req: Request, res: Response, next: NextFunction) => {
  upload.single('image')(req, res, async (err) => {
    try {
      if (err instanceof MulterError) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.fail(400, 'File too large. Maximum size is 10MB');
          case 'LIMIT_FILE_COUNT':
            return res.fail(400, 'Too many files. Only 1 file is allowed');
          case 'LIMIT_UNEXPECTED_FILE':
            return res.fail(400, 'Unexpected file field');
          case 'LIMIT_FIELD_COUNT':
            return res.fail(400, 'Too many fields');
          case 'LIMIT_FIELD_KEY':
            return res.fail(400, 'Field name too long');
          case 'LIMIT_FIELD_VALUE':
            return res.fail(400, 'Field value too long');
          case 'LIMIT_PART_COUNT':
            return res.fail(400, 'Too many parts');
          default:
            return res.fail(400, `Upload error: ${err.message}`);
        }
      }

      const { title, user_id } = req.body;
      
      if (!title) {
        return res.fail(400, 'Title is required');
      }
      
      if (!user_id) {
        return res.fail(400, 'User ID is required');
      }
      
      if (!req.file) {
        return res.fail(400, 'Image is required. Only JPEG, PNG, GIF, and WebP images are accepted');
      }
      
      const parsedUserId = parseInt(user_id, 10);
      if (isNaN(parsedUserId)) {
        return res.fail(400, 'User ID must be a number');
      }

      const meme = await MemeController.saveMeme({
        title,
        imageBuffer: req.file.buffer,
        user_id: parsedUserId
      });

      return res.success('Meme created successfully', meme, 201);

    } catch (error) {
      console.error('Meme creation error:', error);
      return res.fail(500, 'Could not create meme');
    }
  });
});

/**
 * @swagger
 *  /api/v1/meme-of-the-day:
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
        return res.success('Meme of the day retrieved successfully', meme);
    } catch (err) {
        console.error(err);
        return res.fail(500, 'Could not retrieve meme of the day');
    }
});

/**
 * @swagger
 *  /api/v1/memes/{id}:
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
        const meme = await MemeController.getAllMemes(req);
        meme ?? res.fail(404, 'Meme not found');
        return res.success('Memes retrieved successfully', meme);
    } catch (err) {
        console.error(err);
        return res.fail(500, 'Could not retrieve memes');
    }
});

/**
 * @swagger
 *  /api/v1/memes/{id}/vote:
 *    post:
 *      description: Vote on a meme
 *      produces:
 *        - application/json
 *      requestBody:
 *        description: Vote data
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                value:
 *                  type: number
 *                  example: 1
 *                user_id:
 *                  type: number
 *                  example: 1
 *      responses:
 *        200:
 *          description: Vote assigned successfully
 *        400:
 *          description: Bad request
 *        500:
 *          description: Internal server error
 */
memeRouter.post("/memes/:id/vote", enforceAuthentication, verifyCsrfToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.value !== 1 && req.body.value !== -1) {
        return res.fail(400, 'Value must be 1 or -1');
      }
      const vote = await VoteController.saveVote(req);
      return res.success('Vote assigned successfully', vote);
    } catch (err) {
        console.error(err);
        return res.fail(500, 'Could not retrieve memes');
    }
});

/**
 * @swagger
 *  /api/v1/memes/{id}/vote:
 *    delete:
 *      description: Remove a vote from a meme
 *      produces:
 *        - application/json
 *      requestBody:
 *        description: Vote data
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user_id:
 *                  type: number
 *                  example: 1
 *                meme_id:
 *                  type: number
 *                  example: 1
 *      responses:
 *        200:
 *          description: Vote removed successfully
 *        400:
 *          description: Bad request
 *        404:
 *          description: Vote not found
 *        500:
 *          description: Internal server error
 */
memeRouter.delete("/memes/:id/vote", enforceAuthentication, verifyCsrfToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id, meme_id } = req.body;
      if (!user_id || !meme_id) {
        return res.fail(400, 'User ID and Meme ID are required');
      }
      
      const deleted = await VoteController.deleteVote(req);
      if (deleted) {
        return res.success('Vote removed successfully', deleted);
      } else {
        return res.fail(404, 'Vote not found');
      }
    } catch (err) {
        console.error(err);
        return res.fail(500, 'Could not remove vote');
    }
});

/**
 * @swagger
 *  /api/v1/memes/{id}/comments:
 *    get:
 *      description: Retrieve comments for a meme
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: Comments fetched successfully
 *        400:
 *          description: Bad request
 *        500:
 *          description: Internal server error
 */
memeRouter.get("/memes/:id/comments", enforceAuthentication, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const memeId = parseInt(req.params.id, 10);
        if (isNaN(memeId)) {
            return res.fail(400, 'Invalid meme ID');
        }

        const comments = await CommentController.getComments(memeId);

        return res.success('Comments fetched successfully', comments);
    } catch (err) {
        console.error('Error fetching comments:', err);
        return res.fail(500, 'Could not fetch comments');
    }
});

/**
 * @swagger
 *  /api/v1/memes/{id}/comment:
 *    post:
 *      description: Create a comment on a meme
 *      produces:
 *        - application/json
 *      requestBody:
 *        description: Comment data
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user_id:
 *                  type: number
 *                  example: 1
 *                meme_id:
 *                  type: number
 *                  example: 1
 *                content:
 *                  type: string
 *                  example: This is a comment
 *      responses:
 *        200:
 *          description: Comment created successfully
 *        400:
 *          description: Bad request
 *        500:
 *          description: Internal server error
 */
memeRouter.post("/memes/:id/create-comment", enforceAuthentication, verifyCsrfToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const comment = await CommentController.saveComment(req);
        return res.success('Comment created successfully', comment);
    } catch (err) {
        console.error(err);
        return res.fail(500, 'Could not create comment');
    }
});
