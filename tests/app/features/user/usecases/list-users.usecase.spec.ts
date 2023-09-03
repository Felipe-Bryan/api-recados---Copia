import { Database } from '../../../../../src/main/database/database.connection';
import { CacheDatabase } from '../../../../../src/main/database/redis.connection';
import { ListUsersUseCase } from '../../../../../src/app/features/user/usecases/list-users.usecase';
import { User } from '../../../../../src/app/models/user.model';
import { CacheRepository } from '../../../../../src/app/shared/database/repositories/cache.repository';
import { UserRepository } from '../../../../../src/app/features/user/repositories/user.repository';

describe('Testes para o list users usecase', () => {
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

  const sut = new ListUsersUseCase();

  test('deveria retornar a lista de usuários em cache caso exista', async () => {
    const mockedUser = new User('any_name', 'any_email', 'any_password');
    const mockedArray: User[] = [mockedUser];

    jest.spyOn(CacheRepository.prototype, 'get').mockResolvedValue(mockedArray);

    const result = await sut.execute();

    expect(result).toBeDefined();
    expect(result.code).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('Users listed (cache)');
    expect(result).toHaveProperty('data', mockedArray);
  });

  test('deveria retornar a lista de usuários do banco de dados', async () => {
    const mockedUser = new User('any_name', 'any_email', 'any_password');
    const mockedArray: User[] = [mockedUser];

    jest.spyOn(CacheRepository.prototype, 'get').mockResolvedValue(undefined);
    jest.spyOn(UserRepository.prototype, 'list').mockResolvedValue(mockedArray);
    jest.spyOn(CacheRepository.prototype, 'set').mockResolvedValue();

    const result = await sut.execute();

    expect(result).toBeDefined();
    expect(result.code).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('Users listed');
    expect(result).toHaveProperty(
      'data',
      mockedArray.map((item) => item.toList())
    );
  });

  test('deveria retornar uma lista vazia caso não existam usuários cadastrados', async () => {
    const mockedArray: User[] = [];

    jest.spyOn(CacheRepository.prototype, 'get').mockResolvedValue(undefined);
    jest.spyOn(UserRepository.prototype, 'list').mockResolvedValue(mockedArray);
    jest.spyOn(CacheRepository.prototype, 'set').mockResolvedValue();

    const result = await sut.execute();

    expect(result).toBeDefined();
    expect(result.code).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.msg).toEqual('Users listed');
    expect(result).toHaveProperty(
      'data',
      mockedArray.map((item) => item.toList())
    );
  });
});
