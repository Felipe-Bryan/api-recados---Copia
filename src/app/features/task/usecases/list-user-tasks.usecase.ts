import { Result } from '../../../shared/contracts/result.contract';
import { Return } from '../../../shared/util/return.adapter';
import { GetUserByIdUseCase } from '../../user/usecases/get-user-by-id.usecase';
import { TaskRepository } from '../repositories/task.repository';

export class ListUserTasksUseCase {
  public async execute(userId: string): Promise<Result> {
    const user = await new GetUserByIdUseCase().execute(userId);

    if (!user.data) {
      return Return.notFound('User');
    }

    const result = await new TaskRepository().listUserTasks(userId);
    const data = result.map((task) => task.toJson());

    return Return.success('Tasks listed', data);
  }
}
