import { Request, Response } from 'express';
import { ApiResponse } from '../../../shared/util/http-response.adapter';
import { ListUsersUseCase } from '../usecases/list-users.usecase';
import { GetUserByIdUseCase } from '../usecases/get-user-by-id.usecase';
import { UpdateUserUseCase } from '../usecases/update.usecase';
import { CreateUserUseCase } from '../usecases/create-user.usecase';
import { DeleteUserUseCase } from '../usecases/delete-user.usecase';

export class UserController {
  public async create(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      const result = await new CreateUserUseCase().execute({ name, email, password });

      return ApiResponse.done(res, result);
    } catch (error: any) {
      return ApiResponse.serverError(res, error);
    }
  }

  public async list(req: Request, res: Response) {
    try {
      const result = await new ListUsersUseCase().execute();

      return ApiResponse.done(res, result);
    } catch (error: any) {
      return ApiResponse.serverError(res, error);
    }
  }

  public async get(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await new GetUserByIdUseCase().execute(id);

      return ApiResponse.done(res, result);
    } catch (error: any) {
      return ApiResponse.serverError(res, error);
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, password, email } = req.body;

      const result = await new UpdateUserUseCase().execute({ id, name, password, email });

      return ApiResponse.done(res, result);
    } catch (error) {
      return ApiResponse.serverError(res, error);
    }
  }

  public async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await new DeleteUserUseCase().execute(id);

      return ApiResponse.done(res, result);
    } catch (error) {
      return ApiResponse.serverError(res, error);
    }
  }
}
