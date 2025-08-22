import { Request } from "express";
import { User } from "../models/User";
import { AuthController } from "./auth.controller";

export class UserController {
  /**
   * Get current user information from token
   * @param req - Express Request object
   * @returns User object if token is valid, null otherwise
   */
  static async getCurrentUserFromToken(req: Request): Promise<User | null> {
    try {
        const token = req.cookies.sessionToken;

      if (!token) {
        return null;
      }

      const decodedToken: any = await new Promise((resolve, reject) => {
        AuthController.isTokenValid(token, (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        });
      });

      if (!decodedToken?.user) {
        return null;
      }

      const user = await User.findOne({
        where: {
          username: decodedToken.user,
        },
        attributes: ["id", "username", "email"],
      });

      return user;
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      return null;
    }
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await User.findOne({
        where: { username },
        attributes: ["id", "username", "email"],
      });
      return user;
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      return null;
    }
  }
}
