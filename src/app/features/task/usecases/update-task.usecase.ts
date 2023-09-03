import { Task } from '../../../models/task.model';
import { Result } from '../../../shared/contracts/result.contract';
import { CacheRepository } from '../../../shared/database/repositories/cache.repository';
import { Return } from '../../../shared/util/return.adapter';
import { TaskRepository } from '../repositories/task.repository';
import { GetTaskByIdUseCase } from './get-task-by-id.usecase';
import { ListUserTasksUseCase } from './list-user-tasks.usecase';

interface UpdateTaskParams {
  userId: string;
  id: string;
  detail?: string;
  description?: string;
}

export class UpdateTaskUseCase {
  public async execute(params: UpdateTaskParams): Promise<Result> {
    const result = await new GetTaskByIdUseCase().execute(params.id);

    if (!result.data) {
      return Return.notFound('Task');
    }

    let newTask: Task = result.data;

    if (params.detail) {
      newTask.detail = params.detail;
    }

    if (params.description) {
      newTask.description = params.description;
    }

    result.data = newTask;

    await new TaskRepository().update(result.data);

    await new CacheRepository().delete('tasks');

    await new ListUserTasksUseCase().execute(params.userId);

    result.msg = 'Task updated';

    return result;
  }
}
