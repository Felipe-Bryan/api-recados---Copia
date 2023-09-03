import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { UserRepository } from '../../../../../src/app/features/user/repositories/user.repository';
import { LoginUseCase } from '../../../../../src/app/features/authentication/usecases/login.usecase';
import { User } from '../../../../../src/app/models/user.model';
import { JwtService } from '../../../../../src/app/shared/services/jwt.service';

describe('Testes para o login usecase', () => {
  beforeAll(async () => {
    await Database.connect();
    await CacheDatabase.connect();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await Database.connection.destroy();
    await CacheDatabase.connection.quit();
  });

  const sut = new LoginUseCase();

  test('deveria retornar erro 404 se o usuário não existir', async () => {
    jest.spyOn(UserRepository.prototype, 'getByEmail').mockResolvedValue(undefined);

    const result = await sut.execute({
      email: 'wrong_email',
      password: 'any_password',
    });

    expect(result).toBeDefined();
    expect(result.code).toEqual(404);
    expect(result.ok).toBe(false);
    expect(result.msg).toBe('User not found');
    expect(result).not.toHaveProperty('data');
  });

  test('deveria retornar erro 401 se a senha estiver errada', async () => {
    const userMocked = new User('any_name', 'any_email', 'any_password');
    const cryptoPass = new JwtService().createToken(userMocked.password);
    userMocked.password = cryptoPass;

    jest.spyOn(UserRepository.prototype, 'getByEmail').mockResolvedValue(userMocked);

    const result = await sut.execute({
      email: 'any_email',
      password: 'wrong_password',
    });

    expect(result).toBeDefined();
    expect(result.code).toEqual(401);
    expect(result.ok).toBe(false);
    expect(result.msg).toBe('Authentication failed');
    expect(result).not.toHaveProperty('data');
  });

  test('deveria retornar sucesso caso dados estejam corretos', async () => {
    const userMocked = new User('any_name', 'any_email', 'any_password');
    const cryptoPass = new JwtService().createToken(userMocked.password);
    userMocked.password = cryptoPass;

    jest.spyOn(UserRepository.prototype, 'getByEmail').mockResolvedValue(userMocked);

    const result = await sut.execute({
      email: 'any_email',
      password: 'any_password',
    });

    expect(result).toBeDefined();
    expect(result.code).toEqual(200);
    expect(result.ok).toBe(true);
    expect(result.msg).toBe('Authentication sucessfully done');
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('tasks');
    expect(result.data).toHaveProperty('token');
    expect(result.data).toHaveProperty('id', userMocked.id);
    expect(result.data).toHaveProperty('name', userMocked.name);
    expect(result.data).toHaveProperty('email', userMocked.email);
  });
});
