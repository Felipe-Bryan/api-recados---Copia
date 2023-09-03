import cors from 'cors';
import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { userRoutes } from '../../app/features/user/routes/user.routes';
import { loginRoutes } from '../../app/features/authentication/routes/login.routes';
dotenv.config();

export const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cors());

  app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({
      ok: true,
      msg: 'API Recados',
    });
  });

  // ROUTES
  app.use('/user', userRoutes());
  app.use('/auth', loginRoutes());

  return app;
};
