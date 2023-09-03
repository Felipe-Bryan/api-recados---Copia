import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { UpdateUserUseCase } from '../../../../../src/app/features/user/usecases/update.usecase';
import { GetUserByIdUseCase } from '../../../../../src/app/features/user/usecases/get-user-by-id.usecase';
import { User } from '../../../../../src/app/models/user.model';
import { ListUsersUseCase } from '../../../../../src/app/features/user/usecases/list-users.usecase';
import { CacheRepository } from '../../../../../src/app/shared/database/repositories/cache.repository';
import { UserRepository } from '../../../../../src/app/features/user/repositories/user.repository';
import { JwtService } from '../../../../../src/app/shared/services/jwt.service';

describe('Testes para o update user usecase', () => {
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

  const sut = new UpdateUserUseCase();

  test('deveria retornar not found caso id não exista no banco de dados', async () => {
    jest.spyOn(GetUserByIdUseCase.prototype, 'execute').mockResolvedValue({
      code: 404,
      ok: false,
      msg: 'User not found',
    });

    const params = { id: 'wrong_id' };

    const result = await sut.execute(params);

    expect(result).toBeDefined();
    expect(result.code).toBe(404);
    expect(result.ok).toBe(false);
    expect(result.msg).toEqual('User not found');
    expect(result).not.toHaveProperty('data');
  });

  test('deveria retornar sucesso e o novo valor informado (name)', async () => {
    const mockedUser = new User('any_name', 'any_email', '123456');
    const array = [mockedUser];

    jest.spyOn(GetUserByIdUseCase.prototype, 'execute').mockResolvedValue({
      code: 200,
      ok: true,
      msg: 'User obtained',
      data: mockedUser.toList(),
    });
    jest.spyOn(CacheRepository.prototype, 'delete').mockResolvedValue();
    jest.spyOn(UserRepository.prototype, 'update').mockResolvedValue();
    jest.spyOn(ListUsersUseCase.prototype, 'execute').mockResolvedValue({
      ok: true,
      code: 200,
      msg: 'Users listed',
      data: array,
    });

    const params = {
      id: mockedUser.id,
      name: 'new_name',
    };

    const result = await sut.execute(params);

    expect(result).toBeDefined();
    expect(result.code).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('User updated');
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('name', 'new_name');
    expect(result.data).toHaveProperty('id', mockedUser.id);
    expect(result.data).toHaveProperty('email', mockedUser.email);
  });

  test('deveria retornar sucesso e o novo valor informado (password)', async () => {
    const mockedUser = new User('any_name', 'any_email', '123456');
    const array = [mockedUser];

    jest.spyOn(GetUserByIdUseCase.prototype, 'execute').mockResolvedValue({
      code: 200,
      ok: true,
      msg: 'User obtained',
      data: mockedUser.toList(),
    });
    jest.spyOn(CacheRepository.prototype, 'delete').mockResolvedValue();
    jest.spyOn(UserRepository.prototype, 'update').mockResolvedValue();
    jest.spyOn(ListUsersUseCase.prototype, 'execute').mockResolvedValue({
      ok: true,
      code: 200,
      msg: 'Users listed',
      data: array,
    });

    const params = {
      id: mockedUser.id,
      password: 'new_password',
    };

    const result = await sut.execute(params);

    expect(result).toBeDefined();
    expect(result.code).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('User updated');
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('password', new JwtService().createToken(params.password));
    expect(result.data).toHaveProperty('id', mockedUser.id);
  });

  test('deveria retornar erro ao tentar utilizar email já cadastrado', async () => {
    const mockedUser = new User('any_name', 'any_email', '123456');
    const mockedOtherUser = new User('any_name', 'repeated_email', '123456');

    jest.spyOn(GetUserByIdUseCase.prototype, 'execute').mockResolvedValue({
      code: 200,
      ok: true,
      msg: 'User obtained',
      data: mockedUser.toList(),
    });
    jest.spyOn(CacheRepository.prototype, 'delete').mockResolvedValue();
    jest.spyOn(UserRepository.prototype, 'getByEmail').mockResolvedValue(mockedOtherUser);

    const params = {
      id: mockedUser.id,
      email: 'repeated_email',
    };

    const result = await sut.execute(params);

    expect(result).toBeDefined();
    expect(result.code).toBe(400);
    expect(result.ok).toBe(false);
    expect(result.msg).toEqual('Email already exists');
    expect(result).not.toHaveProperty('data');
  });

  test('deveria retornar sucesso e o novo email caso email não exista no banco de dados', async () => {
    const mockedUser = new User('any_name', 'any_email', '123456');
    const array = [mockedUser];

    jest.spyOn(GetUserByIdUseCase.prototype, 'execute').mockResolvedValue({
      code: 200,
      ok: true,
      msg: 'User obtained',
      data: mockedUser.toList(),
    });
    jest.spyOn(UserRepository.prototype, 'getByEmail').mockResolvedValue(undefined);

    jest.spyOn(UserRepository.prototype, 'update').mockResolvedValue();
    jest.spyOn(CacheRepository.prototype, 'delete').mockResolvedValue();
    jest.spyOn(ListUsersUseCase.prototype, 'execute').mockResolvedValue({
      ok: true,
      code: 200,
      msg: 'Users listed',
      data: array,
    });

    const params = {
      id: mockedUser.id,
      email: 'new_email',
    };

    const result = await sut.execute(params);

    expect(result).toBeDefined();
    expect(result.code).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('User updated');
    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('email', 'new_email');
    expect(result.data).toHaveProperty('id', mockedUser.id);
  });
});
