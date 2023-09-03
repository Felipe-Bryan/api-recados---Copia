import { User } from '../../../models/user.model';
import { Result } from '../../../shared/contracts/result.contract';
import { CacheRepository } from '../../../shared/database/repositories/cache.repository';
import { JwtService } from '../../../shared/services/jwt.service';
import { Return } from '../../../shared/util/return.adapter';
import { UserRepository } from '../repositories/user.repository';
import { ListUsersUseCase } from './list-users.usecase';

interface CreateUserParams {
  name: string;
  email: string;
  password: string;
}

export class CreateUserUseCase {
  public async execute(params: CreateUserParams): Promise<Result> {
    const findEmail = await new UserRepository().getByEmail(params.email);

    if (findEmail) {
      return Return.alreadyExists();
    }

    const user = new User(params.name, params.email, params.password);

    const cryptoPass = new JwtService().createToken(params.password);

    user.password = cryptoPass;

    const result = await new UserRepository().create(user);

    await new CacheRepository().delete('users');

    await new ListUsersUseCase().execute();

    return Return.created(result, 'User created');
  }
}
