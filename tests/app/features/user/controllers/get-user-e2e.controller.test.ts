import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { createApp } from '../../../../../src/main/config/express.config';
import supertest from 'supertest';
import { UserEntity } from '../../../../../src/app/shared/database/entities/user.entity';
import { User } from '../../../../../src/app/models/user.model';
import { CacheRepository } from '../../../../../src/app/shared/database/repositories/cache.repository';

describe('Testando a rota que busca um usuário específico', () => {
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

  const createUser = async (user: User) => {
    const database = Database.connection;
    const userRepository = database.getRepository(UserEntity);

    const entity = userRepository.create({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
    });

    await userRepository.save(entity);
  };

  const createSut = () => {
    return createApp();
  };

  const route = '/user';

  test('Deveria retornar erro ao não econtrar usuario em cache nem no BD quando existir lista em cache', async () => {
    const sut = createSut();

    await new CacheRepository().delete('users');

    const user = new User('any_name', 'any_email', 'any_password');
    const wrongUser = new User('any_name', 'any_email', 'any_password');

    await new CacheRepository().set('users', [user.toList()]);

    const result = await supertest(sut).get(`${route}/${wrongUser.id}`).send();

    expect(result).toBeDefined();
    expect(result.status).toBe(404);
    expect(result.status).toEqual(404);
    expect(result).toHaveProperty('status', 404);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('User not found');
    expect(result.body.ok).toBe(false);
    expect(result).not.toHaveProperty('body.data');
  });

  test('Deveria retornar usuário encontrado no BD caso exista lista em cache mas não exista o usuário na lista', async () => {
    const sut = createSut();

    await new CacheRepository().delete('users');

    const user = new User('bd_name', 'bd_email', 'bd_password');
    const cachedUser = new User('cache_name', 'cache_email', 'cache_password');

    await createUser(user);

    const array = [cachedUser.toList()];

    await new CacheRepository().set('users', array);

    const result = await supertest(sut).get(`${route}/${user.id}`).send();

    expect(result).toBeDefined();
    expect(result.status).toBe(200);
    expect(result.status).toEqual(200);
    expect(result).toHaveProperty('status', 200);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('User obtained');
    expect(result.body.ok).toBe(true);
    expect(result).toHaveProperty('body.data', user.toList());
  });

  test('Deveria retornar usuário encontrado em cache', async () => {
    const sut = createSut();

    await new CacheRepository().delete('users');

    const user = new User('any_name', 'any_email', 'any_password');

    const array = [user.toList()];

    await new CacheRepository().set('users', array);

    const result = await supertest(sut).get(`${route}/${user.id}`).send();

    expect(result).toBeDefined();
    expect(result.status).toBe(200);
    expect(result.status).toEqual(200);
    expect(result).toHaveProperty('status', 200);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('User obtained (cache)');
    expect(result.body.ok).toBe(true);
    expect(result).toHaveProperty('body.data', user.toList());
  });

  test('Deveria retornar usuário não encontrado quando não existe lista em cache e não existe o usuario no BD', async () => {
    const sut = createSut();

    await new CacheRepository().delete('users');

    const user = new User('any_name', 'any_email', 'any_password');
    const wrongUser = new User('any_name', 'any_email', 'any_password');

    await createUser(user);

    const result = await supertest(sut).get(`${route}/${wrongUser.id}`).send();

    expect(result).toBeDefined();
    expect(result.status).toBe(404);
    expect(result.status).toEqual(404);
    expect(result).toHaveProperty('status', 404);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('User not found');
    expect(result.body.ok).toBe(false);
    expect(result).not.toHaveProperty('body.data');
  });

  test('Deveria retornar usuário encontrado no BD quando não existe lista em cache', async () => {
    const sut = createSut();

    await new CacheRepository().delete('users');

    const user = new User('any_name', 'any_email', 'any_password');

    await createUser(user);

    const result = await supertest(sut).get(`${route}/${user.id}`).send();

    expect(result).toBeDefined();
    expect(result.status).toBe(200);
    expect(result.status).toEqual(200);
    expect(result).toHaveProperty('status', 200);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('User obtained');
    expect(result.body.ok).toBe(true);
    expect(result).toHaveProperty('body.data', user.toList());
  });
});
