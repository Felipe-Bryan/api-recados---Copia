import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { createApp } from '../../../../../src/main/config/express.config';
import supertest from 'supertest';
import { UserEntity } from '../../../../../src/app/shared/database/entities/user.entity';
import { User } from '../../../../../src/app/models/user.model';

describe('Testando a rota que atualiza um usuário', () => {
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
    await Database.connection.manager.delete(UserEntity, {});
    await Database.connection.destroy();
    await CacheDatabase.connection.quit();
  });

  const createDBUser = async (name: string) => {
    const database = Database.connection;
    const userRepository = database.getRepository(UserEntity);

    const user = new User(`${name}_name`, `${name}_email`, `${name}_password`);

    const entity = userRepository.create({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
    });

    await userRepository.save(entity);

    return user;
  };

  const createUser = (name: string) => {
    const user = new User(`${name}_name`, `${name}_email`, `${name}_password`);

    return user;
  };

  const createSut = () => {
    return createApp();
  };

  const route = '/user';

  test('Deveria retornar erro 404 caso não encontre usuário', async () => {
    const sut = createSut();
    await createDBUser('any');
    const wrongUser = createUser('wrong');

    const result = await supertest(sut).put(`${route}/${wrongUser.id}`).send();

    expect(result).toBeDefined();
    expect(result.status).toBe(404);
    expect(result.status).toEqual(404);
    expect(result).toHaveProperty('status', 404);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('User not found');
    expect(result.body.ok).toBe(false);

    expect(result).not.toHaveProperty('body.data');
  });

  test('Deveria retornar sucesso e usuario com nome alterado', async () => {
    const sut = createSut();
    const user = await createDBUser('any');

    const result = await supertest(sut).put(`${route}/${user.id}`).send({
      name: 'new_name',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe(200);
    expect(result.status).toEqual(200);
    expect(result).toHaveProperty('status', 200);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('User updated');
    expect(result.body.ok).toBe(true);

    expect(result).toHaveProperty('body.data');
    expect(result.body.data.name).toBe('new_name');
    expect(result.body.data.id).toBe(user.id);
    expect(result.body.data.email).toBe(user.email);
  });

  test('Deveria retornar sucesso e alterar senha no BD mas não exibir a senha na resposta da API', async () => {
    const sut = createSut();
    const user = await createDBUser('any');

    const result = await supertest(sut).put(`${route}/${user.id}`).send({
      password: 'new_password',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe(200);
    expect(result.status).toEqual(200);
    expect(result).toHaveProperty('status', 200);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('User updated');
    expect(result.body.ok).toBe(true);

    expect(result).toHaveProperty('body.data');
    expect(result.body.data.name).toBe(user.name);
    expect(result.body.data.id).toBe(user.id);
    expect(result.body.data.email).toBe(user.email);
  });

  test('Deveria retornar erro ao tentar utilizar email já existente', async () => {
    const sut = createSut();
    await createDBUser('exist');
    const userToUpdate = await createDBUser('any');

    const result = await supertest(sut).put(`${route}/${userToUpdate.id}`).send({
      email: 'exist_email',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe(400);
    expect(result.status).toEqual(400);
    expect(result).toHaveProperty('status', 400);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Email already exists');
    expect(result.body.ok).toBe(false);

    expect(result).not.toHaveProperty('body.data');
  });

  test('Deveria retornar sucesso e usuario com email alterado', async () => {
    const sut = createSut();
    const user = await createDBUser('any');

    const result = await supertest(sut).put(`${route}/${user.id}`).send({
      email: 'new_email',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe(200);
    expect(result.status).toEqual(200);
    expect(result).toHaveProperty('status', 200);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('User updated');
    expect(result.body.ok).toBe(true);

    expect(result).toHaveProperty('body.data');
    expect(result.body.data.name).toBe(user.name);
    expect(result.body.data.id).toBe(user.id);
    expect(result.body.data.email).toBe('new_email');
  });
});
