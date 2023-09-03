import { Database } from '../../../../main/database/database.connection';
import { TaskEntity } from '../../../shared/database/entities/task.entity';
import { Task } from '../../../models/task.model';

export class TaskRepository {
  private connection = Database.connection.getRepository(TaskEntity);

  public async create(task: Task, userId: string) {
    const taskEntity = this.connection.create({
      description: task.description,
      detail: task.detail,
      id: task.id,
      userId,
    });

    const results = await this.connection.save(taskEntity);

    return this.toModel(results);
  }

  public async listUserTasks(userId: string) {
    const result = await this.connection.find({
      where: { userId },
      relations: { user: true },
    });

    return result.map((row: any) => this.toModel(row));
  }

  public async getById(id: string) {
    const result = await this.connection.findOneBy({ id });

    if (!result) {
      return result;
    }

    return this.toModel(result);
  }

  public async update(task: Task) {
    await this.connection.update(
      {
        id: task.id,
      },
      {
        detail: task.detail,
        description: task.description,
      }
    );
  }

  public async delete(id: string) {
    const result = await this.connection.delete({
      id,
    });

    return result.affected ?? 0;
  }

  public async deleteTasks(userId: string) {
    const result = await this.connection.delete({
      userId,
    });

    return result.affected ?? 0;
  }

  public toModel(entity: TaskEntity) {
    return Task.create(entity);
  }
}
