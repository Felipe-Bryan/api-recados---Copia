import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { createApp } from '../../../../../src/main/config/express.config';
import supertest from 'supertest';
import { UserEntity } from '../../../../../src/app/shared/database/entities/user.entity';
import { User } from '../../../../../src/app/models/user.model';
import { CacheRepository } from '../../../../../src/app/shared/database/repositories/cache.repository';
import { TaskEntity } from '../../../../../src/app/shared/database/entities/task.entity';

describe('Testando a rota que cria um novo recado', () => {
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

  const createTask = (number: number) => {
    return {
      description: `Task-${number}_description`,
      detail: `Task-${number}_detail`,
    };
  };

  const createSut = () => {
    return createApp();
  };

  const createRoute = (userId: string) => {
    return `/user/${userId}/tasks/`;
  };

  const sut = createSut();

  test('Deveria retornar erro 404 caso não exista o usuário', async () => {
    await new CacheRepository().delete('loggedUser');

    const user = createUser('wrong');

    const task = createTask(1);

    const route = createRoute(user.id);

    const result = await supertest(sut).post(route).send(task);

    expect(result).toBeDefined();
    expect(result.status).toBe(404);
    expect(result.status).toEqual(404);
    expect(result).toHaveProperty('status', 404);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('User not found');
    expect(result.body.ok).toBe(false);

    expect(result).not.toHaveProperty('body.data');
  });

  test('Deveria retornar sucesso caso o usuario exista e esteja logado', async () => {
    const user = await setLoggedUser('any');

    const task = createTask(1);

    const route = createRoute(user.id);

    const result = await supertest(sut).post(route).send(task);

    expect(result).toBeDefined();
    expect(result.status).toBe(201);
    expect(result.status).toEqual(201);
    expect(result).toHaveProperty('status', 201);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Task created');
    expect(result.body.ok).toBe(true);

    expect(result).toHaveProperty('body.data');
    expect(result.body.data).toHaveProperty('detail', task.detail);
    expect(result.body.data).toHaveProperty('description', task.description);
  });

  test('Deveria retornar erro caso o detail informado seja menor que 1 caracter', async () => {
    const user = await setLoggedUser('any');

    // const task = createTask(1);

    const route = createRoute(user.id);

    const result = await supertest(sut).post(route).send({
      detail: '',
      description: 'any_description',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe(400);
    expect(result.status).toEqual(400);
    expect(result).toHaveProperty('status', 400);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Detail was not provided');
    expect(result.body.ok).toBe(false);

    expect(result).not.toHaveProperty('body.data');
  });

  test('Deveria retornar erro caso o description informado seja menor que 1 caracter', async () => {
    const user = await setLoggedUser('any');

    // const task = createTask(1);

    const route = createRoute(user.id);

    const result = await supertest(sut).post(route).send({
      detail: 'any_detail',
      description: '',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe(400);
    expect(result.status).toEqual(400);
    expect(result).toHaveProperty('status', 400);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Description was not provided');
    expect(result.body.ok).toBe(false);

    expect(result).not.toHaveProperty('body.data');
  });
});
