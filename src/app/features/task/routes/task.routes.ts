import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { TaskMiddleware } from '../validators/task.middleware';
import { UserMiddleware } from '../../user/validators/user.middleware';

export const taskRoutes = () => {
  const app = Router({
    mergeParams: true,
  });

  app.post(
    '/',
    [TaskMiddleware.validateFieldsCreate, TaskMiddleware.validateLengthFields],
    new TaskController().create
  );
  app.get('/', [UserMiddleware.validateUser], new TaskController().listUserTasks);
  app.get('/:id', new TaskController().getById);
  app.put('/:id', new TaskController().update);
  app.delete('/:id', new TaskController().delete);

  return app;
};
