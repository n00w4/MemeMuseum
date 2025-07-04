import { User } from "../models/database";
import Jwt from "jsonwebtoken";
import { Request } from "express";

export class AuthController {
  /**
   * Handles post requests on /auth. Checks that the given credentials are valid
   * @param {Request} req - The request object
   * @returns {Promise<boolean>} - A boolean indicating whether the credentials are valid
   */
  static async checkCredentials(req: Request): Promise<boolean> {
    const found = await User.findOne({
      where: {
        email: req.body.email,
        password: req.body.pwd
      }
    });
    
    return found !== null;
  }

  /**
   * Attempts to create a new User
   * @param {Request} req - The request object
   * @returns {Promise<User>} - A promise that resolves to the created User
   */
  static async saveUser(req: Request): Promise<User> {
    const user = new User({
      username: req.body.usr, 
      password: req.body.pwd,
      email: req.body.email
    });
    
    return user.save();
  }

  /**
   * Issues a token to the user
   * @param {string} username - The username of the user
   * @returns {string} - A string representing the issued token
   */
  static issueToken(username: string): string {
    return Jwt.sign(
      { user: username, iss: "MemeMuseum" }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: `${24 * 60 * 60}s` }
    );
  }

  /**
   * Checks if the given token is valid
   * @param {string} token - The token to check
   * @param {Jwt.VerifyCallback} callback - The callback to call if the token is valid
   */
  static isTokenValid(token: string, callback: Jwt.VerifyCallback): void {
    Jwt.verify(token, process.env.TOKEN_SECRET as string, callback);
  }
}