import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { GetUserByIdUseCase } from '../../../../../src/app/features/user/usecases/get-user-by-id.usecase';
import { CacheRepository } from '../../../../../src/app/shared/database/repositories/cache.repository';
import { UserRepository } from '../../../../../src/app/features/user/repositories/user.repository';
import { ListUsersUseCase } from '../../../../../src/app/features/user/usecases/list-users.usecase';
import { User } from '../../../../../src/app/models/user.model';

describe('Testes para o get user by id usecase', () => {
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

  const sut = new GetUserByIdUseCase();

  test('Deveria retornar erro ao não econtrar usuario em cache nem no BD', async () => {
    const mockedUser = new User('any_name', 'any_email', 'any_password');
    const wrongUser = new User('any_name', 'any_email', 'any_password');

    jest.spyOn(CacheRepository.prototype, 'get').mockResolvedValue([mockedUser]);
    jest.spyOn(UserRepository.prototype, 'get').mockResolvedValue(undefined);

    const result = await sut.execute(wrongUser.id);

    expect(result).toBeDefined();
    expect(result.code).toBe(404);
    expect(result.ok).toBe(false);
    expect(result.msg).toEqual('User not found');

    expect(result).not.toHaveProperty('data');
  });

  test('Deveria retornar usuário encontrado no BD caso exista lista em cache mas não exista o usuário na lista', async () => {
    const mockedUser = new User('any_name', 'any_email', 'any_password');
    const userToFind = new User('userToFind_name', 'userToFind_email', 'userToFind_password');

    const mockedArray: User[] = [mockedUser];

    jest.spyOn(CacheRepository.prototype, 'get').mockResolvedValue(mockedArray);
    jest.spyOn(UserRepository.prototype, 'get').mockResolvedValue(userToFind);
    jest.spyOn(ListUsersUseCase.prototype, 'execute').mockResolvedValue({
      ok: true,
      code: 200,
      msg: 'Users listed',
      data: mockedArray,
    });

    const result = await sut.execute(userToFind.id);

    expect(result).toBeDefined();
    expect(result.code).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('User obtained');

    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('id', userToFind.id);
    expect(result.data).toHaveProperty('name', userToFind.name);
    expect(result.data).toHaveProperty('email', userToFind.email);
  });

  test('Deveria retornar usuário encontrado em cache', async () => {
    const mockedUser = new User('any_name', 'any_email', 'any_password');

    const mockedArray: User[] = [mockedUser];

    jest.spyOn(CacheRepository.prototype, 'get').mockResolvedValue(mockedArray);

    const result = await sut.execute(mockedUser.id);

    expect(result).toBeDefined();
    expect(result.code).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('User obtained (cache)');

    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('id', mockedUser.id);
    expect(result.data).toHaveProperty('name', mockedUser.name);
    expect(result.data).toHaveProperty('email', mockedUser.email);
  });

  test('Deveria retornar usuário não encontrado quando não existe lista em cache e não existe o usuario no BD', async () => {
    const mockedUser = new User('any_name', 'any_email', 'any_password');

    jest.spyOn(CacheRepository.prototype, 'get').mockResolvedValue(undefined);
    jest.spyOn(UserRepository.prototype, 'get').mockResolvedValue(undefined);

    const result = await sut.execute(mockedUser.id);

    expect(result).toBeDefined();
    expect(result.code).toBe(404);
    expect(result.ok).toBe(false);
    expect(result.msg).toEqual('User not found');

    expect(result).not.toHaveProperty('data');
  });

  test('Deveria retornar usuário encontrado no BD quando não existe lista em cache', async () => {
    const mockedUser = new User('any_name', 'any_email', 'any_password');

    jest.spyOn(CacheRepository.prototype, 'get').mockResolvedValue(undefined);
    jest.spyOn(UserRepository.prototype, 'get').mockResolvedValue(mockedUser);
    jest.spyOn(ListUsersUseCase.prototype, 'execute').mockResolvedValue({
      ok: true,
      code: 200,
      msg: 'Users listed',
    });

    const result = await sut.execute(mockedUser.id);

    expect(result).toBeDefined();
    expect(result.code).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('User obtained');

    expect(result).toHaveProperty('data');
    expect(result.data).toHaveProperty('id', mockedUser.id);
    expect(result.data).toHaveProperty('name', mockedUser.name);
    expect(result.data).toHaveProperty('email', mockedUser.email);
  });
});
