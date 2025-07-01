import { Jwt, JwtPayload } from "jsonwebtoken";
import { AuthController } from "../controllers/authController";
import { Request, NextFunction } from 'express';

/**
 * Middleware to verify user authentication. If the user is not logged in,
 * they are redirected to the login page with an appropriate error message.
 * @param req - The request object.
 * @param next - The next middleware function.
 */

interface AuthenticatedRequest extends Request {
  username?: string;
}

export function enforceAuthentication(
  req: AuthenticatedRequest,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    next({ status: 401, message: 'Unauthorized' });
    return;
  }

  AuthController.isTokenValid(
  token,
  (err: Error | null, decodedToken?: string | Jwt | JwtPayload) => {
    if (
      err ||
      !decodedToken ||
      typeof decodedToken !== 'object' ||
      !('user' in decodedToken)
    ) {
      next({ status: 401, message: 'Unauthorized' });
    } else {
      const { user } = decodedToken as { user: string };
      req.username = user;
      next();
    }
  }
);
}

