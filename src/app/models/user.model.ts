import { v4 as createUuid } from 'uuid';
import { Task } from './task.model';

export class User {
  private _id: string;
  private _tasks: Task[];

  constructor(private _name: string, private _email: string, private _password: string) {
    this._id = createUuid();
    this._tasks = [];
    this._name = _name;
    this._email = _email;
    this._password = _password;
  }

  public get name(): string {
    return this._name;
  }

  public set name(name: string) {
    this._name = name;
  }

  public get id(): string {
    return this._id;
  }

  public set id(id: string) {
    this._id = id;
  }

  public get email(): string {
    return this._email;
  }

  public set email(email: string) {
    this._email = email;
  }

  public set password(password: string) {
    this._password = password;
  }

  public get password(): string {
    return this._password;
  }

  public get tasks(): Task[] {
    return this._tasks;
  }

  public set tasks(tasks: Task[]) {
    this._tasks = tasks;
  }

  public toJson() {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      tasks: this._tasks.map((task) => task.toJson()),
    };
  }

  public toList() {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
    };
  }

  public static create(entity: any) {
    const user = new User(entity.name, entity.email, entity.password);
    user.id = entity.id;

    return user;
  }
}
