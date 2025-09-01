import { AuthController } from "../controllers/auth.controller";
import { RequestHandler } from 'express';
import { UserController } from "../controllers/user.controller";

/**
 * Middleware to optionally authenticate users using an HttpOnly cookie.
 * If the user is authenticated, the user object is attached to the request.
 * If not, the request continues without blocking.
 * @param req - The request object (with the Express-extended interface).
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const optionalAuthentication: RequestHandler = async (req, res, next) => {
  const token = req.cookies.sessionToken;

  if (!token) {
    next();
    return;
  }

  AuthController.isTokenValid(token, async (err, decodedToken) => {
    if (
      !err &&
      decodedToken &&
      typeof decodedToken === 'object' &&
      'user' in decodedToken
    ) {
      try {
        const username = (decodedToken as { user: string }).user;
        console.log('Token valid for username:', username);
        
        const user = await UserController.getUserByUsername(username);
        
        if (user) {
          (req as any).user = user;
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    } else {
      console.log('Invalid token or no user in token');
    }
    
    next();
  });
};