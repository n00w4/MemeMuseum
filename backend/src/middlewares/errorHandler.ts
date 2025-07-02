import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../common/ApiError';

/**
 * Error handler middleware
 * @param err - The error object
 * @param req - The request object
 * @param res - The response object
 * @param next - The next middleware function
 */

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof ApiError) {
        res.status(err.status).json({
            code: err.status,
            description: err.message,
        });
    }

    console.error('Unhandled error:', err);
    res.status(500).json({
        code: 500,
        description: 'Internal Server Error'
    });
}

export default errorHandler;