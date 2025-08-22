import { Router, Request, Response } from 'express';
import { authRouter } from './auth.router';
import { memeRouter } from './meme.router';
import { userRouter } from './user.router';

const apiRouter = Router();

apiRouter.use('/api/v1/auth', authRouter);
apiRouter.use('/api/v1/', memeRouter);
apiRouter.use('/api/v1/users', userRouter);

// status check route
apiRouter.get('/api/v1/status', (req: Request, res: Response) => {
  res.success('MEMEMUSEUM API v1 is up and running!', null, 200);
});

export default apiRouter;