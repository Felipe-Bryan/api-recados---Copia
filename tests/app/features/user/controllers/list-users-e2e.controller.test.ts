import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { createApp } from '../../../../../src/main/config/express.config';
import supertest from 'supertest';
import { UserEntity } from '../../../../../src/app/shared/database/entities/user.entity';
import { User } from '../../../../../src/app/models/user.model';
import { CacheRepository } from '../../../../../src/app/shared/database/repositories/cache.repository';

describe('Testando a rota que lista usuários', () => {
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

  test('Deveria retornar a lista de usuários do banco de dados caso não haja cache', async () => {
    const sut = createSut();

    await new CacheRepository().delete('users');

    const user = new User('any_name', 'any_email', 'any_password');

    await createUser(user);

    const result = await supertest(sut).get(route).send();

    expect(result).toBeDefined();
    expect(result.status).toBe(200);
    expect(result.status).toEqual(200);
    expect(result).toHaveProperty('status', 200);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Users listed');
    expect(result.body.ok).toBe(true);
    expect(result).toHaveProperty('body.data');
  });

  test('Deveria retornar a lista de usuários em cache caso exista', async () => {
    const sut = createSut();

    await new CacheRepository().delete('users');

    const user = new User('any_name', 'any_email', 'any_password');
    const array: User[] = [user];

    await new CacheRepository().set('users', array);

    const result = await supertest(sut).get(route).send();

    expect(result).toBeDefined();
    expect(result.status).toBe(200);
    expect(result.status).toEqual(200);
    expect(result).toHaveProperty('status', 200);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Users listed (cache)');
    expect(result.body.ok).toBe(true);
    expect(result).toHaveProperty('body.data');
  });
});
