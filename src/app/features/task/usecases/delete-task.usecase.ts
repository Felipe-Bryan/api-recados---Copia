import { Result } from '../../../shared/contracts/result.contract';
import { CacheRepository } from '../../../shared/database/repositories/cache.repository';
import { Return } from '../../../shared/util/return.adapter';
import { TaskRepository } from '../repositories/task.repository';
import { ListUserTasksUseCase } from './list-user-tasks.usecase';

interface DeleteTaskParams {
  userId: string;
  id: string;
}

export class DeleteTaskUseCase {
  public async execute(params: DeleteTaskParams): Promise<Result> {
    const deleted = await new TaskRepository().delete(params.id);

    if (deleted == 0) {
      return Return.notFound('Task');
    }

    await new CacheRepository().delete('tasks');

    await new ListUserTasksUseCase().execute(params.userId);

    return Return.success('Task deleted', '');
  }
}
