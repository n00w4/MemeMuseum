import { User } from "../models/database";
import Jwt from "jsonwebtoken";
import { Request } from "express";
import { ValidationError, UniqueConstraintError } from "sequelize";
import { randomBytes } from "crypto";

export class AuthController {
  /**
   * Handles post requests on /auth. Checks that the given credentials are valid
   * @param {Request} req - The request object
   * @returns {Promise<boolean>} - A boolean indicating whether the credentials are valid
   */
  static async checkCredentials(req: Request): Promise<boolean> {
    try {
      if (!req.body?.username || !req.body?.password) {
        return false;
      }

      const found = await User.findOne({
        where: {
          username: req.body.username,
          password: req.body.password,
        },
      });

      return found !== null;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * Attempts to create a new User
   * @param {Request} req - The request object
   * @returns {Promise<User>} - A promise that resolves to the created User
   */
  static async saveUser(req: Request): Promise<User | null> {
    try {
      if (!req.body?.username || !req.body?.password || !req.body?.email) {
        throw new Error("Missing required fields in request body");
      }

      const { username, password, email } = req.body;

      if (typeof username !== "string" || username.trim().length < 3) {
        throw new Error("Invalid username");
      }

      if (typeof password !== "string" || password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const user = new User({
        username: username.trim(),
        password: password,
        email: email?.toString().trim() || "",
      });

      return await user.save();
    } catch (error) {
      console.error("Error saving user:", error);

      if (error instanceof UniqueConstraintError) {
        console.error("Duplicate username or email");
      } else if (error instanceof ValidationError) {
        console.error(
          "Validation failed:",
          error.errors.map((e) => e.message)
        );
      }

      return null;
    }
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
    Jwt.verify(token, process.env.JWT_SECRET as string, callback);
  }

  /**
   * Generates a CSRF token
   * @returns {string} - A string representing the generated CSRF token
   */
  static readonly generateCsrfToken = (): string => {
    return randomBytes(100).toString("base64");
  };
}
