import { Router, Request, Response } from 'express';
import { authRouter } from './authRouter';
import { memeRouter } from './memeRouter';

const apiRouter = Router();

apiRouter.use('/api/v1/auth', authRouter);
apiRouter.use('/api/v1/', memeRouter);

// status check route
apiRouter.get('/api/v1/status', (req: Request, res: Response) => {
  res.success('MEMEMUSEUM API v1 is up and running!', null, 200);
});

export default apiRouter;