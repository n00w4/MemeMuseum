import { Response, Request, NextFunction } from "express";
import { ApiResponse } from "../common/ApiResponse";

declare module "express-serve-static-core" {
  interface Response {
    success: <T>(message: string, data: T, status?: number) => void;
    fail: (status: number, message: string, data?: null) => void;
  }
}

/**
 * Middleware to wrap responses in a consistent format.
 * @param req - The request object (with the Express-extended interface).
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export function responseWrapper(req: Request, res: Response, next: NextFunction) {
  res.success = function <T>(message: string, data: T, status: number = 200) {
    res.status(status).json(new ApiResponse<T>(status, message, data));
  };

  res.fail = function (status: number, message: string, data: null = null) {
    res.status(status).json(new ApiResponse(status, message, data));
  };

  next();
}

export default responseWrapper;