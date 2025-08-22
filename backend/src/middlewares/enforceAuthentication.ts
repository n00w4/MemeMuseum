import { ApiError } from "../common/ApiError";
import { AuthController } from "../controllers/auth.controller";
import { RequestHandler } from 'express';

/**
 * Middleware to enforce authentication using an HttpOnly cookie.
 * If the user is not authenticated, the request is blocked.
 * @param req - The request object (with the Express-extended interface).
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const enforceAuthentication: RequestHandler = (req, res, next) => {
  const token = req.cookies.sessionToken;

  if (!token) {
    return next(new ApiError(401, 'Unauthorized: No token provided.'));
  }

  AuthController.isTokenValid(token, (err, decodedToken) => {
    if (
      err ||
      !decodedToken ||
      typeof decodedToken !== 'object' ||
      !('user' in decodedToken)
    ) {
      return next(new ApiError(401, 'Unauthorized: Invalid token.'));
    }

    (req as any).username = (decodedToken as { user: string }).user;
    next();
  });
};

