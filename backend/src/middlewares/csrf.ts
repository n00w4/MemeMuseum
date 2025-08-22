import { Request, Response, NextFunction } from "express";
import { ApiError } from "../common/ApiError";

/**
 * CSRF token verification middleware
 * @param req - The request object (with the Express-extended interface).
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const verifyCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const csrfTokenFromCookie = req.cookies["XSRF-TOKEN"];
  const csrfTokenFromHeader = req.headers["x-xsrf-token"] as string | undefined;

  if (!csrfTokenFromCookie) {
    return next(new ApiError(403, 'CSRF token missing from cookie.'));
  }

  if (!csrfTokenFromHeader) {
    return next(new ApiError(403, 'CSRF token missing from header.'));
  }

  let decodedHeaderToken: string;
  try {
    decodedHeaderToken = decodeURIComponent(csrfTokenFromHeader);
  } catch (error) {
    console.error("Error decoding CSRF token from header:", error);
    return next(new ApiError(400, 'Invalid CSRF token format in header.'));
  }

  if (decodedHeaderToken !== csrfTokenFromCookie) {
    return next(new ApiError(403, 'CSRF token mismatch between cookie and header.'));
  }

  next();
};
