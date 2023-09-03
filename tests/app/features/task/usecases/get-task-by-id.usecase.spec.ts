import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { GetTaskByIdUseCase } from '../../../../../src/app/features/task/usecases/get-task-by-id.usecase';
import { CacheRepository } from '../../../../../src/app/shared/database/repositories/cache.repository';
import { User } from '../../../../../src/app/models/user.model';
import { Task } from '../../../../../src/app/models/task.model';

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

  const sut = new GetTaskByIdUseCase();

  test('deveria retornar erro caso usuario não esteja logado', async () => {
    jest.spyOn(CacheRepository.prototype, 'get').mockResolvedValue(undefined);

    const result = await sut.execute('any_id');

    expect(result).toBeDefined();
    expect(result.code).toBe(401);
    expect(result.ok).toBe(false);
    expect(result.msg).toEqual('Authentication failed');
    expect(result).not.toHaveProperty('data');
  });

  test('deveria retornar erro 404 caso não encontre o recado', async () => {
    const mockedUser = new User('any_name', 'any_email', '123456');

    jest.spyOn(CacheRepository.prototype, 'get').mockResolvedValue(mockedUser);

    const result = await sut.execute('any_id');

    expect(result).toBeDefined();
    expect(result.code).toBe(404);
    expect(result.ok).toBe(false);
    expect(result.msg).toEqual('Task not found');
    expect(result).not.toHaveProperty('data');
  });

  test('deveria retornar sucesso caso encontre o recado e o usuario esteja logado', async () => {
    const mockedUser = new User('any_name', 'any_email', '123456');

    const mockedTask = new Task('any_detail', 'any_description', mockedUser.id);

    mockedUser.tasks = [mockedTask];

    jest.spyOn(CacheRepository.prototype, 'get').mockResolvedValue(mockedUser);

    const result = await sut.execute(mockedTask.id);

    expect(result).toBeDefined();
    expect(result.code).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('Task obtained(cache)');
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('id');
    expect(result.data).toHaveProperty('detail');
    expect(result.data).toHaveProperty('description');
  });
});
