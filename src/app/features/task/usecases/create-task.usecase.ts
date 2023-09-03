import { Task } from '../../../models/task.model';
import { User } from '../../../models/user.model';
import { Result } from '../../../shared/contracts/result.contract';
import { CacheRepository } from '../../../shared/database/repositories/cache.repository';
import { Return } from '../../../shared/util/return.adapter';
import { TaskRepository } from '../repositories/task.repository';
import { ListUserTasksUseCase } from './list-user-tasks.usecase';

interface CreateTaskParams {
  userId: string;
  description: string;
  detail: string;
}

export class CreateTaskUseCase {
  public async execute(params: CreateTaskParams): Promise<Result> {
    const loggedUser: User = await new CacheRepository().get('loggedUser');

    if (!loggedUser) {
      return Return.notFound('User');
    }

    const task = new Task(params.detail, params.description, params.userId);

    const result = await new TaskRepository().create(task, params.userId);

    const tasksUpdated = await new ListUserTasksUseCase().execute(params.userId);

    loggedUser.tasks = tasksUpdated.data;

    await new CacheRepository().set('loggedUser', loggedUser);

    return Return.created(result.toJson(), 'Task created');
  }
}
