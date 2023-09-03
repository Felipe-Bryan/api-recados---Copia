import { User } from '../../../models/user.model';
import { Result } from '../../../shared/contracts/result.contract';
import { CacheRepository } from '../../../shared/database/repositories/cache.repository';
import { Return } from '../../../shared/util/return.adapter';
import { UserRepository } from '../repositories/user.repository';
import { ListUsersUseCase } from './list-users.usecase';

export class GetUserByIdUseCase {
  public async execute(id: string): Promise<Result> {
    const cachedUsers: User[] = await new CacheRepository().get('users');

    // Existe lista em cache
    if (cachedUsers) {
      const cacheResult = cachedUsers.find((user) => user.id === id);

      //Não encontra o usuario em cache
      if (!cacheResult) {
        //Busca no BD
        const result = await new UserRepository().get(id);

        //Não encontra usuário no BD
        if (!result) {
          return Return.notFound('User');
        }

        //Encontra usuário no BD
        //Atualiza cache
        await new ListUsersUseCase().execute();

        //Retorna usuário encontrado no BD
        return Return.success('User obtained', result.toList());
      }

      //Encontra usuário em cache
      return Return.success('User obtained (cache)', cacheResult);
    }

    //Não existe lista em cache
    const result = await new UserRepository().get(id);

    if (!result) {
      return Return.notFound('User');
    }

    await new ListUsersUseCase().execute();

    return Return.success('User obtained', result.toList());
  }
}
