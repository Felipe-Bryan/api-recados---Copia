import { Task } from '../../../models/task.model';
import { Result } from '../../../shared/contracts/result.contract';
import { CacheRepository } from '../../../shared/database/repositories/cache.repository';
import { JwtService } from '../../../shared/services/jwt.service';
import { Return } from '../../../shared/util/return.adapter';
import { ListUserTasksUseCase } from '../../task/usecases/list-user-tasks.usecase';
import { UserRepository } from '../../user/repositories/user.repository';

interface LoginParams {
  email: string;
  password: string;
}

export class LoginUseCase {
  public async execute(params: LoginParams): Promise<Result> {
    const user = await new UserRepository().getByEmail(params.email);

    if (!user) {
      return Return.notFound('User');
    }

    const uncryptoPass = new JwtService().decodeToken(user.password);

    if (uncryptoPass !== params.password) {
      return Return.invalidCredentials();
    }

    const token = new JwtService().createToken(user.id);

    const userTasks: Task[] = (await new ListUserTasksUseCase().execute(user.id)).data;

    const loggedUser = { ...user.toJson(), token, tasks: userTasks };

    await new CacheRepository().set('loggedUser', loggedUser);

    return Return.success('Authentication sucessfully done', loggedUser);
  }
}
