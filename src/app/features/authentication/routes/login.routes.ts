import { Router } from 'express';
import { LoginController } from '../controllers/login.controller';
import { LoginValidator } from '../validators/login.middleware';

export const loginRoutes = () => {
  const app = Router();

  app.post('/', [LoginValidator.validateFields], new LoginController().login);

  return app;
};
