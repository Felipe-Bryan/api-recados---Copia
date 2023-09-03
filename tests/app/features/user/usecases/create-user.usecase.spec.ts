import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { CreateUserUseCase } from '../../../../../src/app/features/user/usecases/create-user.usecase';
import { UserRepository } from '../../../../../src/app/features/user/repositories/user.repository';
import { ListUsersUseCase } from '../../../../../src/app/features/user/usecases/list-users.usecase';
import { CacheRepository } from '../../../../../src/app/shared/database/repositories/cache.repository';
import { User } from '../../../../../src/app/models/user.model';
import { JwtService } from '../../../../../src/app/shared/services/jwt.service';

describe('Testes para o create user usecase', () => {
  beforeAll(async () => {
    await Database.connect();
    await CacheDatabase.connect();
  });

  afterAll(async () => {
    await Database.connection.destroy();
    await CacheDatabase.connection.quit();
  });

  const sut = new CreateUserUseCase();

  test('deveria retornar erro 400 ao informar email já existente', async () => {
    const mockedUser = new User('any_name', 'match_email', '123456');

    jest.spyOn(UserRepository.prototype, 'getByEmail').mockResolvedValue(mockedUser);

    const result = await sut.execute({
      name: 'any_name',
      email: 'match_email',
      password: '123456',
    });

    expect(result).toBeDefined();
    expect(result.code).toBe(400);
    expect(result.ok).toBe(false);
    expect(result.msg).toEqual('Email already exists');
    expect(result).not.toHaveProperty('data');
  });

  test('deveria retornar sucesso ao informar dados válidos', async () => {
    const user = new User('any_name', 'any_email', '123456');
    const cryptoPass = new JwtService().createToken(user.password);
    user.password = cryptoPass;

    jest.spyOn(UserRepository.prototype, 'getByEmail').mockResolvedValue(undefined);
    jest.spyOn(UserRepository.prototype, 'create').mockResolvedValue(user);
    jest.spyOn(CacheRepository.prototype, 'delete').mockResolvedValue();
    jest.spyOn(ListUsersUseCase.prototype, 'execute').mockResolvedValue({
      ok: true,
      code: 200,
      msg: 'Users listed',
      data: user,
    });

    const result = await sut.execute(user);

    expect(result).toBeDefined();
    expect(result.code).toBe(201);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('User created');
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('id', user.id);
    expect(result.data).toHaveProperty('name', user.name);
    expect(result.data).toHaveProperty('password', cryptoPass);
  });
});
