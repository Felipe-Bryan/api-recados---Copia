import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { createApp } from '../../../../../src/main/config/express.config';
import supertest from 'supertest';
import { UserEntity } from '../../../../../src/app/shared/database/entities/user.entity';
import { User } from '../../../../../src/app/models/user.model';

describe('Testando a rota que cria um usuário', () => {
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

  test('Deveria retornar erro 400 caso não seja informado nome', async () => {
    const sut = createSut();
    const result = await supertest(sut).post(route).send({});

    expect(result).toBeDefined();
    expect(result.status).toBe(400);
    expect(result.status).toEqual(400);
    expect(result).toHaveProperty('status', 400);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Name was not provided');
    expect(result.body.ok).toBe(false);
  });

  test('Deveria retornar erro 400 caso não seja informado e-mail', async () => {
    const sut = createSut();

    const result = await supertest(sut).post(route).send({
      name: 'any_name',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe(400);
    expect(result.status).toEqual(400);
    expect(result).toHaveProperty('status', 400);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Email was not provided');
    expect(result.body.ok).toBe(false);
  });

  test('Deveria retornar erro 400 caso seja informado email já existente', async () => {
    const sut = createSut();
    const user = new User('any_name', 'repeated_email', 'any_password');

    await createUser(user);

    const result = await supertest(sut).post(route).send({
      name: 'any_name',
      email: 'repeated_email',
      password: 'any_password',
      confirmPassword: 'any_password',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe(400);
    expect(result.status).toEqual(400);
    expect(result).toHaveProperty('status', 400);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Email already exists');
    expect(result.body.ok).toBe(false);
  });

  test('Deveria retornar erro 400 caso não seja informado senha', async () => {
    const sut = createSut();

    const result = await supertest(sut).post(route).send({
      name: 'any_name',
      email: 'any_email',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe(400);
    expect(result.status).toEqual(400);
    expect(result).toHaveProperty('status', 400);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Password was not provided');
    expect(result.body.ok).toBe(false);
  });

  test('Deveria retornar erro 400 caso senha informada seja menor de 5 caracteres', async () => {
    const sut = createSut();

    const result = await supertest(sut).post(route).send({
      name: 'any_name',
      email: 'any_email',
      password: 'any',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe(400);
    expect(result.status).toEqual(400);
    expect(result).toHaveProperty('status', 400);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Password should be at least 5 characters');
    expect(result.body.ok).toBe(false);
  });

  test('Deveria retornar erro 400 caso senha informada não coincida com confirmação de senha', async () => {
    const sut = createSut();

    const result = await supertest(sut).post(route).send({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password',
      confirmPassword: 'wrong_pass',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe(400);
    expect(result.status).toEqual(400);
    expect(result).toHaveProperty('status', 400);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('Passwords do not match');
    expect(result.body.ok).toBe(false);
  });

  test('Deveria retornar status 201 caso usuário seja criado com sucesso', async () => {
    const sut = createSut();

    const result = await supertest(sut).post(route).send({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password',
      confirmPassword: 'any_password',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe(201);
    expect(result.status).toEqual(201);
    expect(result).toHaveProperty('status', 201);
    expect(result).toHaveProperty('body.ok');
    expect(result.body.msg).toBe('User created');
    expect(result.body.ok).toBe(true);
  });
});
