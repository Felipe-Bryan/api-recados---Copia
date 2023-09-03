import { User } from '../../../models/user.model';
import { Result } from '../../../shared/contracts/result.contract';
import { CacheRepository } from '../../../shared/database/repositories/cache.repository';
import { JwtService } from '../../../shared/services/jwt.service';
import { Return } from '../../../shared/util/return.adapter';
import { UserRepository } from '../repositories/user.repository';
import { GetUserByIdUseCase } from './get-user-by-id.usecase';
import { ListUsersUseCase } from './list-users.usecase';

interface UpdateUserParams {
  id: string;
  name?: string;
  password?: string;
  email?: string;
}

export class UpdateUserUseCase {
  public async execute(params: UpdateUserParams): Promise<Result> {
    const user = await new GetUserByIdUseCase().execute(params.id);

    if (!user.data) {
      return Return.notFound('User');
    }

    let newUser: User = user.data;

    if (params.name) {
      newUser.name = params.name;
    }

    if (params.password) {
      const cryptoPass = new JwtService().createToken(params.password);

      newUser.password = cryptoPass;
    }

    if (params.email) {
      const findEmail = await new UserRepository().getByEmail(params.email);

      if (findEmail) {
        return Return.alreadyExists();
      }

      newUser.email = params.email;
    }

    user.data = newUser;
    user.msg = 'User updated';

    await new UserRepository().update(user.data);

    await new CacheRepository().delete('users');

    await new ListUsersUseCase().execute();

    return user;
  }
}
