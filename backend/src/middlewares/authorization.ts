import { AuthController } from "../controllers/authController";
import { RequestHandler } from 'express';

/**
 * Middleware to verify user authentication. If the user is not logged in,
 * they are redirected to the login page with an appropriate error message.
 * @param req - The request object.
 * @param next - The next middleware function.
 */

export const enforceAuthentication: RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return next({ status: 401, message: 'Unauthorized' });
  }

  AuthController.isTokenValid(token, (err, decodedToken) => {
    if (
      err ||
      !decodedToken ||
      typeof decodedToken !== 'object' ||
      !('user' in decodedToken)
    ) {
      return next({ status: 401, message: 'Unauthorized' });
    }

    (req as any).username = (decodedToken as { user: string }).user;
    next();
  });
};

