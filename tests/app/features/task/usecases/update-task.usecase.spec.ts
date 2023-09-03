import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { UpdateTaskUseCase } from '../../../../../src/app/features/task/usecases/update-task.usecase';
import { CacheRepository } from '../../../../../src/app/shared/database/repositories/cache.repository';
import { User } from '../../../../../src/app/models/user.model';
import { TaskRepository } from '../../../../../src/app/features/task/repositories/task.repository';
import { Task } from '../../../../../src/app/models/task.model';
import { ListUserTasksUseCase } from '../../../../../src/app/features/task/usecases/list-user-tasks.usecase';
import { GetTaskByIdUseCase } from '../../../../../src/app/features/task/usecases/get-task-by-id.usecase';

describe('Testes para o update task usecase', () => {
  beforeAll(async () => {
    await Database.connect();
    await CacheDatabase.connect();

    jest.setTimeout(20000);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await Database.connection.destroy();
    await CacheDatabase.connection.quit();
  });

  const sut = new UpdateTaskUseCase();

  test('deveria retornar erro 404 caso não encontre o recado', async () => {
    const mockedUser = new User('any_name', 'any_email', '123456');

    jest.spyOn(GetTaskByIdUseCase.prototype, 'execute').mockResolvedValue({
      ok: false,
      code: 404,
      msg: 'Task not found',
    });

    const result = await sut.execute({
      userId: mockedUser.id,
      id: 'any_id',
    });

    expect(result).toBeDefined();
    expect(result.code).toBe(404);
    expect(result.ok).toBe(false);
    expect(result.msg).toEqual('Task not found');
    expect(result).not.toHaveProperty('data');
  });

  test('deveria retornar sucesso e alterar a propriedade informada (detail)', async () => {
    const mockedUser = new User('any_name', 'any_email', '123456');
    const mockedTask = new Task('any_detail', 'any_description', mockedUser.id);

    jest.spyOn(GetTaskByIdUseCase.prototype, 'execute').mockResolvedValue({
      ok: true,
      code: 200,
      msg: 'Task obtained(cache)',
      data: mockedTask,
    });

    jest.spyOn(TaskRepository.prototype, 'update').mockResolvedValue();
    jest.spyOn(CacheRepository.prototype, 'delete').mockResolvedValue();
    jest.spyOn(ListUserTasksUseCase.prototype, 'execute').mockResolvedValue({
      ok: true,
      code: 200,
      msg: 'Tasks listed',
      data: [],
    });

    const result = await sut.execute({
      userId: mockedUser.id,
      id: mockedTask.id,
      detail: 'new_detail',
    });

    expect(result).toBeDefined();
    expect(result.code).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('Task updated');
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('id');
    expect(result.data).toHaveProperty('detail', 'new_detail');
    expect(result.data).toHaveProperty('description', 'any_description');
  });

  test('deveria retornar sucesso e alterar a propriedade informada (detail)', async () => {
    const mockedUser = new User('any_name', 'any_email', '123456');
    const mockedTask = new Task('any_detail', 'any_description', mockedUser.id);

    jest.spyOn(GetTaskByIdUseCase.prototype, 'execute').mockResolvedValue({
      ok: true,
      code: 200,
      msg: 'Task obtained(cache)',
      data: mockedTask,
    });

    jest.spyOn(TaskRepository.prototype, 'update').mockResolvedValue();
    jest.spyOn(CacheRepository.prototype, 'delete').mockResolvedValue();
    jest.spyOn(ListUserTasksUseCase.prototype, 'execute').mockResolvedValue({
      ok: true,
      code: 200,
      msg: 'Tasks listed',
      data: [],
    });

    const result = await sut.execute({
      userId: mockedUser.id,
      id: mockedTask.id,
      description: 'new_description',
    });

    expect(result).toBeDefined();
    expect(result.code).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('Task updated');
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('id');
    expect(result.data).toHaveProperty('detail', 'any_detail');
    expect(result.data).toHaveProperty('description', 'new_description');
  });
});
