import { Result } from '../../../shared/contracts/result.contract';
import { CacheRepository } from '../../../shared/database/repositories/cache.repository';
import { UserRepository } from '../repositories/user.repository';

export class ListUsersUseCase {
  public async execute(): Promise<Result> {
    // verifica cache
    const cachedUsers = await new CacheRepository().get('users');

    if (cachedUsers) {
      return {
        ok: true,
        code: 200,
        msg: 'Users listed (cache)',
        data: cachedUsers,
      };
    }

    const result = await new UserRepository().list();

    const data = result.map((user) => user.toList());

    await new CacheRepository().set('users', data);

    return {
      ok: true,
      code: 200,
      msg: 'Users listed',
      data,
    };
  }
}
