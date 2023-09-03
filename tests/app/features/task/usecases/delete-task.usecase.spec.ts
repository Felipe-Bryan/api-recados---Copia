import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { DeleteTaskUseCase } from '../../../../../src/app/features/task/usecases/delete-task.usecase';
import { CacheRepository } from '../../../../../src/app/shared/database/repositories/cache.repository';
import { User } from '../../../../../src/app/models/user.model';
import { TaskRepository } from '../../../../../src/app/features/task/repositories/task.repository';
import { ListUserTasksUseCase } from '../../../../../src/app/features/task/usecases/list-user-tasks.usecase';

describe('Testes para o delete task usecase', () => {
  beforeAll(async () => {
    await Database.connect();
    await CacheDatabase.connect();

    jest.setTimeout(20000);
  });

  afterAll(async () => {
    await Database.connection.destroy();
    await CacheDatabase.connection.quit();
  });

  const sut = new DeleteTaskUseCase();

  test('deveria retornar erro 404 caso recado não exista', async () => {
    const mockedUser = new User('any_name', 'any_email', '123456');

    jest.spyOn(TaskRepository.prototype, 'delete').mockResolvedValue(0);

    const result = await sut.execute({
      userId: mockedUser.id,
      id: 'wrong-id',
    });

    expect(result).toBeDefined();
    expect(result.code).toBe(404);
    expect(result.ok).toBe(false);
    expect(result.msg).toEqual('Task not found');
    expect(result).not.toHaveProperty('data');
  });

  test('deveria retornar sucesso caso recado exista', async () => {
    const mockedUser = new User('any_name', 'any_email', '123456');

    jest.spyOn(TaskRepository.prototype, 'delete').mockResolvedValue(1);
    jest.spyOn(CacheRepository.prototype, 'delete').mockResolvedValue();
    jest.spyOn(ListUserTasksUseCase.prototype, 'execute').mockResolvedValue({
      ok: true,
      code: 200,
      msg: 'Tasks listed',
      data: [],
    });

    const result = await sut.execute({
      userId: mockedUser.id,
      id: 'wrong-id',
    });

    expect(result).toBeDefined();
    expect(result.code).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('Task deleted');
    expect(result).toHaveProperty('data', '');
  });
});
