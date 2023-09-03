import { Request, Response } from 'express';
import { ApiResponse } from '../../../shared/util/http-response.adapter';
import { CreateTaskUseCase } from '../usecases/create-task.usecase';
import { ListUserTasksUseCase } from '../usecases/list-user-tasks.usecase';
import { GetTaskByIdUseCase } from '../usecases/get-task-by-id.usecase';
import { UpdateTaskUseCase } from '../usecases/update-task.usecase';
import { DeleteTaskUseCase } from '../usecases/delete-task.usecase';

export class TaskController {
  public async create(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { description, detail } = req.body;

      const result = await new CreateTaskUseCase().execute({ userId, description, detail });

      return ApiResponse.done(res, result);
    } catch (error) {
      return ApiResponse.serverError(res, error);
    }
  }

  public async listUserTasks(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await new ListUserTasksUseCase().execute(userId);

      return ApiResponse.done(res, result);
    } catch (error) {
      return ApiResponse.serverError(res, error);
    }
  }

  public async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await new GetTaskByIdUseCase().execute(id);

      return ApiResponse.done(res, result);
    } catch (error) {
      return ApiResponse.serverError(res, error);
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const { userId, id } = req.params;
      const { detail, description } = req.body;

      const result = await new UpdateTaskUseCase().execute({ userId, id, detail, description });

      return ApiResponse.done(res, result);
    } catch (error) {
      return ApiResponse.serverError(res, error);
    }
  }

  public async delete(req: Request, res: Response) {
    try {
      const { userId, id } = req.params;

      const result = await new DeleteTaskUseCase().execute({ userId, id });

      return ApiResponse.done(res, result);
    } catch (error) {
      return ApiResponse.serverError(res, error);
    }
  }
}
