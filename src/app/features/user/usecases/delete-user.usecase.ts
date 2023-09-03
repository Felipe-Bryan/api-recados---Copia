import { Result } from '../../../shared/contracts/result.contract';
import { CacheRepository } from '../../../shared/database/repositories/cache.repository';
import { Return } from '../../../shared/util/return.adapter';
import { TaskRepository } from '../../task/repositories/task.repository';
import { UserRepository } from '../repositories/user.repository';
import { ListUsersUseCase } from './list-users.usecase';

export class DeleteUserUseCase {
  public async execute(id: string): Promise<Result> {
    await new TaskRepository().deleteTasks(id);

    const deleted = await new UserRepository().delete(id);

    if (deleted == 0) {
      return Return.notFound('User');
    }

    await new CacheRepository().delete('users');

    await new ListUsersUseCase().execute();

    return Return.success('User deleted', '');
  }
}
