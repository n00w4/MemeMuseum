import { User } from "../models/database";
import Jwt from "jsonwebtoken";
import { Request, Response } from "express";

export class AuthController {
  /**
   * Handles post requests on /auth. Checks that the given credentials are valid
   */
  static async checkCredentials(req: Request, res: Response): Promise<boolean> {
    const found = await User.findOne({
      where: {
        username: req.body.usr,
        password: req.body.pwd
      }
    });
    
    return found !== null;
  }

  /**
   * Attempts to create a new User
   */
  static async saveUser(req: Request, res: Response): Promise<any> {
    const user = new User({
      username: req.body.usr, 
      password: req.body.pwd,
      email: req.body.email
    });
    
    return user.save();
  }

  static issueToken(username: string): string {
    return Jwt.sign(
      { user: username }, 
      process.env.TOKEN_SECRET as string, 
      { expiresIn: `${24 * 60 * 60}s` }
    );
  }

  static isTokenValid(token: string, callback: Jwt.VerifyCallback): void {
    Jwt.verify(token, process.env.TOKEN_SECRET as string, callback);
  }
}