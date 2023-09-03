import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { createApp } from '../../../../../src/main/config/express.config';
import supertest from 'supertest';
import { UserEntity } from '../../../../../src/app/shared/database/entities/user.entity';

describe('Testando a rota que executa o login', () => {
  beforeAll(async () => {
    await Database.connect();
    await CacheDatabase.connect();

    jest.setTimeout(20000);

    await supertest(sut).post('/user').send({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password',
      confirmPassword: 'any_password',
    });
  });

  beforeEach(async () => {
    const cache = CacheDatabase.connection;
    await cache.flushall();
  });

  afterAll(async () => {
    await Database.connection.manager.delete(UserEntity, {});
    await Database.connection.destroy();
    await CacheDatabase.connection.quit();
  });

  const createSut = () => {
    return createApp();
  };

  const route = '/auth';

  const sut = createSut();

  test('deveria retornar 400 (fieldNotProvided) se o email não for informado', async () => {
    const result = await supertest(sut).post(route).send({
      password: 'any_password',
    });

    expect(result).toBeDefined();

    expect(result.status).toEqual(400);
    expect(result).toHaveProperty('body');

    expect(result.body).toHaveProperty('ok', false);
    expect(result.body).toHaveProperty('msg', 'Email was not provided');
    expect(result.body).not.toHaveProperty('data');
  });

  test('deveria retornar 400 (fieldNotProvided) se a senha não for informada', async () => {
    const result = await supertest(sut).post(route).send({
      email: 'any_email',
    });

    expect(result).toBeDefined();

    expect(result.status).toEqual(400);
    expect(result).toHaveProperty('body');

    expect(result.body).toHaveProperty('ok', false);
    expect(result.body).toHaveProperty('msg', 'Password was not provided');
    expect(result.body).not.toHaveProperty('data');
  });

  test('Deveria retornar erro 404 caso não exista o email informado', async () => {
    const result = await supertest(sut).post(route).send({
      email: 'wrong_email',
      password: 'any_password',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe(404);
    expect(result.status).toEqual(404);
    expect(result).toHaveProperty('status', 404);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('User not found');
    expect(result.body.ok).toBe(false);

    expect(result).not.toHaveProperty('body.data');
  });

  test('Deveria retornar erro 401 caso a senha esteja errada', async () => {
    const result = await supertest(sut).post(route).send({
      email: 'any_email',
      password: 'wrong_password',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe(401);
    expect(result.status).toEqual(401);
    expect(result).toHaveProperty('status', 401);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Authentication failed');
    expect(result.body.ok).toBe(false);

    expect(result).not.toHaveProperty('body.data');
  });

  test('Deveria retornar sucesso ao informar dados válidos', async () => {
    const result = await supertest(sut).post(route).send({
      email: 'any_email',
      password: 'any_password',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe(200);
    expect(result.status).toEqual(200);
    expect(result).toHaveProperty('status', 200);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Authentication sucessfully done');
    expect(result.body.ok).toBe(true);

    expect(result).toHaveProperty('body.data');
    expect(result.body.data).toHaveProperty('token');
    expect(result.body.data).toHaveProperty('id');
    expect(result.body.data).toHaveProperty('tasks');
    expect(result.body.data).toHaveProperty('name', 'any_name');
    expect(result.body.data).toHaveProperty('email', 'any_email');
  });
});
