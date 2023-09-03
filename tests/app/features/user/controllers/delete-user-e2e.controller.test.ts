import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { createApp } from '../../../../../src/main/config/express.config';
import supertest from 'supertest';
import { UserEntity } from '../../../../../src/app/shared/database/entities/user.entity';
import { User } from '../../../../../src/app/models/user.model';

describe('Testando a rota que deleta um usuário', () => {
  beforeAll(async () => {
    await Database.connect();
    await CacheDatabase.connect();

    jest.setTimeout(20000);
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

    const result = await supertest(sut).delete(`${route}/${wrongUser.id}`).send();

    expect(result).toBeDefined();
    expect(result.status).toBe(404);
    expect(result.status).toEqual(404);
    expect(result).toHaveProperty('status', 404);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('User not found');
    expect(result.body.ok).toBe(false);
    expect(result).not.toHaveProperty('body.data');
  });

  test('Deveria retornar sucesso ao deletar usuário', async () => {
    const sut = createSut();
    const user = await createDBUser('any');

    const result = await supertest(sut).delete(`${route}/${user.id}`).send();

    expect(result).toBeDefined();
    expect(result.status).toBe(200);
    expect(result.status).toEqual(200);
    expect(result).toHaveProperty('status', 200);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('User deleted');
    expect(result.body.ok).toBe(true);
    expect(result).toHaveProperty('body.data', '');
  });
});
