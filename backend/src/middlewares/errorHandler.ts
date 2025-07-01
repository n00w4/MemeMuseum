import { Request, Response, NextFunction } from 'express';

/**
 * Error handler middleware
 * @param err - The error object
 * @param req - The request object
 * @param res - The response object
 * @param next - The next middleware function
 */

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    res.status(err.status ?? 500).json({
        code: err.status ?? 500,
        description: err.message ?? "An error occurred"
    });
}

export default errorHandler;