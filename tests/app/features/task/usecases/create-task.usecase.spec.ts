import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { CreateTaskUseCase } from '../../../../../src/app/features/task/usecases/create-task.usecase';
import { CacheRepository } from '../../../../../src/app/shared/database/repositories/cache.repository';
import { User } from '../../../../../src/app/models/user.model';
import { TaskRepository } from '../../../../../src/app/features/task/repositories/task.repository';
import { Task } from '../../../../../src/app/models/task.model';
import { ListUserTasksUseCase } from '../../../../../src/app/features/task/usecases/list-user-tasks.usecase';

describe('Testes para o create task usecase', () => {
  beforeAll(async () => {
    await Database.connect();
    await CacheDatabase.connect();

    jest.setTimeout(20000);
  });

  afterAll(async () => {
    await Database.connection.destroy();
    await CacheDatabase.connection.quit();
  });

  const sut = new CreateTaskUseCase();

  test('deveria retornar erro 404 caso usuario não esteja logado', async () => {
    const mockedUser = new User('any_name', 'any_email', '123456');

    jest.spyOn(CacheRepository.prototype, 'get').mockResolvedValue(undefined);

    const result = await sut.execute({
      detail: 'any_detail',
      description: 'any_description',
      userId: mockedUser.id,
    });

    expect(result).toBeDefined();
    expect(result.code).toBe(404);
    expect(result.ok).toBe(false);
    expect(result.msg).toEqual('User not found');
    expect(result).not.toHaveProperty('data');
  });

  test('deveria retornar sucesso caso usuario esteja logado', async () => {
    const mockedUser = new User('any_name', 'any_email', '123456');
    const mockedTask = new Task('any_detail', 'any_description', mockedUser.id);

    jest.spyOn(CacheRepository.prototype, 'get').mockResolvedValue(mockedUser);
    jest.spyOn(TaskRepository.prototype, 'create').mockResolvedValue(mockedTask);
    jest.spyOn(ListUserTasksUseCase.prototype, 'execute').mockResolvedValue({
      ok: true,
      code: 200,
      msg: 'Tasks listed',
      data: mockedTask.toJson(),
    });
    jest.spyOn(CacheRepository.prototype, 'set').mockResolvedValue();

    const result = await sut.execute({
      detail: 'any_detail',
      description: 'any_description',
      userId: mockedUser.id,
    });

    expect(result).toBeDefined();
    expect(result.code).toBe(201);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('Task created');
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('id');
    expect(result.data).toHaveProperty('detail', 'any_detail');
    expect(result.data).toHaveProperty('description', 'any_description');
  });
});
