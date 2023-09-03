import { Database } from '../../../../main/database/database.connection';
import { User } from '../../../models/user.model';
import { UserEntity } from '../../../shared/database/entities/user.entity';

export class UserRepository {
  private connection = Database.connection.getRepository(UserEntity);

  public async create(user: User) {
    const userEntity = this.connection.create({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const results = await this.connection.save(userEntity);

    return UserRepository.toModel(results);
  }

  public async list() {
    const results = await this.connection.find();

    return results.map((entity) => UserRepository.toModel(entity));
  }

  public async get(id: string) {
    const result = await this.connection.findOneBy({
      id,
    });

    if (!result) {
      return undefined;
    }

    return UserRepository.toModel(result);
  }

  public async getByEmail(email: string) {
    const result = await this.connection.findOneBy({ email });

    if (!result) {
      return undefined;
    }

    return UserRepository.toModel(result);
  }

  public async update(user: User) {
    await this.connection.update(
      {
        id: user.id,
      },
      {
        name: user.name,
        password: user.password,
        email: user.email,
      }
    );
  }

  public async delete(id: string) {
    const result = await this.connection.delete({
      id,
    });

    return result.affected ?? 0;
  }

  public static toModel(entity: UserEntity | null): User {
    return User.create(entity);
  }
}
