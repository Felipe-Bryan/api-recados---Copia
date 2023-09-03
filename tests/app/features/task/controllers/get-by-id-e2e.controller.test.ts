import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { createApp } from '../../../../../src/main/config/express.config';
import supertest from 'supertest';
import { UserEntity } from '../../../../../src/app/shared/database/entities/user.entity';
import { User } from '../../../../../src/app/models/user.model';
import { CacheRepository } from '../../../../../src/app/shared/database/repositories/cache.repository';
import { TaskEntity } from '../../../../../src/app/shared/database/entities/task.entity';
import { Task } from '../../../../../src/app/models/task.model';
import { ListUserTasksUseCase } from '../../../../../src/app/features/task/usecases/list-user-tasks.usecase';

describe('Testando a rota que busca um recado por id', () => {
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
    await Database.connection.manager.delete(TaskEntity, {});
    await Database.connection.manager.delete(UserEntity, {});
    await Database.connection.destroy();
    await CacheDatabase.connection.quit();
  });

  const setLoggedUser = async (name: string): Promise<User> => {
    await supertest(sut)
      .post('/user')
      .send({
        name: `${name}_name`,
        email: `${name}_email`,
        password: `${name}_password`,
        confirmPassword: `${name}_password`,
      });

    const user = await supertest(sut)
      .post('/auth')
      .send({
        email: `${name}_email`,
        password: `${name}_password`,
      });

    return user.body.data;
  };

  const createUser = (name: string) => {
    const user = new User(`${name}_name`, `${name}_email`, `${name}_password`);

    return user;
  };

  const createTask = (number: number, user: User) => {
    return new Task(`Task-${number}-description`, `Task-${number}_detail`, user.id);
  };

  const createSut = () => {
    return createApp();
  };

  const createRoute = (userId: string) => {
    return `/user/${userId}/tasks`;
  };

  const sut = createSut();

  test('Deveria retornar erro caso o usuario não esteja logado', async () => {
    await new CacheRepository().delete('loggedUser');

    const user = createUser('any');

    const task = createTask(1, user);

    const route = createRoute(user.id);

    const result = await supertest(sut).get(`${route}/${task.id}`).send(task);

    expect(result).toBeDefined();
    expect(result.status).toBe(401);
    expect(result.status).toEqual(401);
    expect(result).toHaveProperty('status', 401);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Authentication failed');
    expect(result.body.ok).toBe(false);

    expect(result).not.toHaveProperty('body.data');
  });

  test('Deveria retornar erro caso o recado não exista', async () => {
    const user = await setLoggedUser('any');

    const task = createTask(1, user);

    const route = createRoute(user.id);

    const result = await supertest(sut).get(`${route}/${task.id}`).send(task);

    expect(result).toBeDefined();
    expect(result.status).toBe(404);
    expect(result.status).toEqual(404);
    expect(result).toHaveProperty('status', 404);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Task not found');
    expect(result.body.ok).toBe(false);

    expect(result).not.toHaveProperty('body.data');
  });

  test('Deveria retornar sucesso caso encontre o recado', async () => {
    const user = await setLoggedUser('any');
    const route = createRoute(user.id);

    const task = await supertest(sut).post(`${route}`).send({
      detail: 'any_detail',
      description: 'any_description',
      userId: user.id,
    });

    const userTasks = await new ListUserTasksUseCase().execute(user.id);

    const result = await supertest(sut).get(`${route}/${userTasks.data[0].id}`).send();

    expect(result).toBeDefined();
    expect(result.status).toBe(200);
    expect(result.status).toEqual(200);
    expect(result).toHaveProperty('status', 200);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Task obtained(cache)');
    expect(result.body.ok).toBe(true);

    expect(result).toHaveProperty('body.data');
    expect(result.body.data).toHaveProperty('id');
    expect(result.body.data).toHaveProperty('detail', 'any_detail');
    expect(result.body.data).toHaveProperty('description', 'any_description');
  });
});
