import { User } from '../../../models/user.model';
import { Result } from '../../../shared/contracts/result.contract';
import { CacheRepository } from '../../../shared/database/repositories/cache.repository';
import { Return } from '../../../shared/util/return.adapter';

export class GetTaskByIdUseCase {
  public async execute(id: string): Promise<Result> {
    const loggedUser: User = await new CacheRepository().get('loggedUser');

    if (!loggedUser) {
      return Return.invalidCredentials();
    }

    const task = loggedUser.tasks.find((task) => task.id === id);

    if (!task) {
      return Return.notFound('Task');
    }

    return Return.success('Task obtained(cache)', task);
  }
}
