import express, { Request, Response, NextFunction } from "express";
import { enforceAuthentication } from "../middlewares/enforceAuthentication";
import { UserController } from "../controllers/user.controller";

export const userRouter = express.Router();

/**
 * @swagger
 *  /api/v1/users/me:
 *    get:
 *      description: Get current user information
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: User data retrieved successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: number
 *                    example: 1
 *                  username:
 *                    type: string
 *                    example: user_example
 *                  email:
 *                    type: string
 *                    example: user@example.com
 *        401:
 *          description: Unauthorized - Invalid or missing token
 *        500:
 *          description: Internal server error
 */
userRouter.get(
  "/me", enforceAuthentication,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UserController.getCurrentUserFromToken(req);
      if (user) {
        res.success("User data retrieved successfully", user, 200);
      } else {
        res.fail(401, "Unauthorized - Invalid token");
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
      res.fail(500, "Internal server error");
    }
  }
);