import express, { Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/authController";

export const authRouter = express.Router();

/**
 * @swagger
 *  /login:
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
authRouter.post("/login", async (req: Request, res: Response) => {
  const isAuthenticated = await AuthController.checkCredentials(req, res);
  if (isAuthenticated) {
    res.json(AuthController.issueToken(req.body.usr));
  } else {
    res.status(401).json({ error: "Invalid credentials. Try again." });
  }
});

/**
 * @swagger
 *  /signup:
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
 *        401:
 *          description: Invalid credentials
 */
authRouter.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await AuthController.saveUser(req, res);
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
    next({ status: 500, message: "Could not save user" });
  }
});
