import { Request, Response, NextFunction } from 'express';

export const verifyCsrfToken = (req: Request, res: Response, next: NextFunction) => {
    const csrfTokenFromCookie = req.cookies['XSRF-TOKEN'];
    const csrfTokenFromHeader = req.headers['x-xsrf-token'] as string | undefined;

    if (!csrfTokenFromCookie || csrfTokenFromHeader !== csrfTokenFromCookie) {
        res.status(403).send('Invalid CSRF token');
        return;
    }
    
    next();
};
