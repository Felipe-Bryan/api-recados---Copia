import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { ListUserTasksUseCase } from '../../../../../src/app/features/task/usecases/list-user-tasks.usecase';
import { User } from '../../../../../src/app/models/user.model';
import { TaskRepository } from '../../../../../src/app/features/task/repositories/task.repository';
import { Task } from '../../../../../src/app/models/task.model';
import { GetUserByIdUseCase } from '../../../../../src/app/features/user/usecases/get-user-by-id.usecase';

describe('Testes para o list user tasks usecase', () => {
  beforeAll(async () => {
    await Database.connect();
    await CacheDatabase.connect();

    jest.setTimeout(20000);
  });

  afterAll(async () => {
    await Database.connection.destroy();
    await CacheDatabase.connection.quit();
  });

  const sut = new ListUserTasksUseCase();

  test('deveria retornar erro 404 caso usuario não exista', async () => {
    jest.spyOn(GetUserByIdUseCase.prototype, 'execute').mockResolvedValue({
      ok: false,
      code: 404,
      msg: 'User not found',
    });

    const result = await sut.execute('any_id');

    expect(result).toBeDefined();
    expect(result.code).toBe(404);
    expect(result.ok).toBe(false);
    expect(result.msg).toEqual('User not found');
    expect(result).not.toHaveProperty('data');
  });

  test('deveria retornar sucesso e array com os recados', async () => {
    const mockedUser = new User('any_name', 'any_email', '123456');
    const mockedTask = new Task('any_detail', 'any_description', mockedUser.id);
    mockedUser.tasks = [mockedTask];

    jest.spyOn(GetUserByIdUseCase.prototype, 'execute').mockResolvedValue({
      ok: true,
      code: 200,
      msg: 'User obtained',
      data: mockedUser,
    });

    jest.spyOn(TaskRepository.prototype, 'listUserTasks').mockResolvedValue([mockedTask]);

    const result = await sut.execute(mockedUser.id);

    expect(result).toBeDefined();
    expect(result.code).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('Tasks listed');
    expect(result).toHaveProperty('data');
    expect(result.data[0]).toHaveProperty('id', mockedTask.id);
    expect(result.data[0]).toHaveProperty('detail', 'any_detail');
    expect(result.data[0]).toHaveProperty('description', 'any_description');
  });
});
