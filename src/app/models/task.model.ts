import { v4 as createUuid } from 'uuid';
import { TaskEntity } from '../shared/database/entities/task.entity';

export class Task {
  private _id: string;

  constructor(private _detail: string, private _description: string, private _idUsuario: string) {
    this._id = createUuid();
    this._detail = _detail;
    this._description = _description;
    this._idUsuario = _idUsuario;
  }

  public get id() {
    return this._id;
  }

  public set id(id: string) {
    this._id = id;
  }

  public set detail(detail: string) {
    this._detail = detail;
  }

  public get detail() {
    return this._detail;
  }

  public set description(description: string) {
    this._description = description;
  }

  public get description() {
    return this._description;
  }

  public toJson() {
    return {
      id: this._id,
      detail: this._detail,
      description: this._description,
    };
  }

  public static create(entity: TaskEntity) {
    const task = new Task(entity.detail, entity.description, entity.userId);
    task.id = entity.id;

    return task;
  }
}
