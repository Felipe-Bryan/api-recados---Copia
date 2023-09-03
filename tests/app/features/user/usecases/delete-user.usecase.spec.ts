import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { DeleteUserUseCase } from '../../../../../src/app/features/user/usecases/delete-user.usecase';
import { UserRepository } from '../../../../../src/app/features/user/repositories/user.repository';
import { TaskRepository } from '../../../../../src/app/features/task/repositories/task.repository';
import { CacheRepository } from '../../../../../src/app/shared/database/repositories/cache.repository';
import { ListUsersUseCase } from '../../../../../src/app/features/user/usecases/list-users.usecase';
import { User } from '../../../../../src/app/models/user.model';

describe('Testes para o delete user usecase', () => {
  beforeAll(async () => {
    await Database.connect();
    await CacheDatabase.connect();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await Database.connection.destroy();
    await CacheDatabase.connection.quit();
  });

  const sut = new DeleteUserUseCase();

  test('deveria retornar erro 404 ao informar id inexistente', async () => {
    jest.spyOn(TaskRepository.prototype, 'deleteTasks').mockResolvedValue(0);
    jest.spyOn(UserRepository.prototype, 'delete').mockResolvedValue(0);

    const result = await sut.execute('any_id');

    expect(result).toBeDefined();
    expect(result.code).toBe(404);
    expect(result.ok).toBe(false);
    expect(result.msg).toEqual('User not found');
    expect(result).not.toHaveProperty('data');
  });

  test('deveria retornar sucesso ao informar id válido', async () => {
    const array = [new User('any_name', 'any_email', '123456')];

    jest.spyOn(TaskRepository.prototype, 'deleteTasks').mockResolvedValue(1);
    jest.spyOn(UserRepository.prototype, 'delete').mockResolvedValue(1);
    jest.spyOn(CacheRepository.prototype, 'delete').mockResolvedValue();
    jest.spyOn(ListUsersUseCase.prototype, 'execute').mockResolvedValue({
      ok: true,
      code: 200,
      msg: 'Users listed',
      data: array,
    });

    const result = await sut.execute('any_id');

    expect(result).toBeDefined();
    expect(result.code).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('User deleted');
    expect(result).toHaveProperty('data');
    expect(result.data).toBe('');
  });
});
