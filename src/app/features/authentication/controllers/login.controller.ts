import { Request, Response } from 'express';
import { ApiResponse } from '../../../shared/util/http-response.adapter';
import { LoginUseCase } from '../usecases/login.usecase';

export class LoginController {
  public async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await new LoginUseCase().execute({ email, password });

      return ApiResponse.done(res, result);
    } catch (error: any) {
      return ApiResponse.serverError(res, error);
    }
  }
}
