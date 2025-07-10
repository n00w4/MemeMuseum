import express, { Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/authController";

export const authRouter = express.Router();

/**
 * @swagger
 *  /api/v1/login:
 *    post:
 *      description: User login and authentication
 *      produces:
 *        - application/json
 *      requestBody:
 *        description: User credentials (username/email and password) for authentication
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                usr:
 *                  type: string
 *                  example: user_example
 *                pwd:
 *                  type: string
 *                  example: StrongP@ssw0rd!
 *      responses:
 *        200:
 *          description: User authenticated
 *        401:
 *          description: Invalid credentials
 */
authRouter.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  const isAuthenticated = await AuthController.checkCredentials(req);
  if (isAuthenticated) {
    const token = AuthController.issueToken(req.body.usr);
    res.success("Login successful", { token });
  } else {
    res.fail(401, "Invalid credentials. Try again.");
  }
});

/**
 * @swagger
 *  /api/v1/signup:
 *    post:
 *      description: User registration
 *      produces:
 *        - application/json
 *      requestBody:
 *        description: User credentials (username/email and password)
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                usr:
 *                  type: string
 *                  example: user_example
 *                pwd:
 *                  type: string
 *                  example: StrongP@ssw0rd!
 *                email:
 *                  type: string
 *                  example: email@example.com
 *      responses:
 *        201:
 *          description: User created
 *        500:
 *          description: Could not save user
 */
authRouter.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await AuthController.saveUser(req);
    res.success("User created", user, 201);
  } catch (err) {
    console.error(err);
    res.fail(500, "Could not save user");
  }
});
