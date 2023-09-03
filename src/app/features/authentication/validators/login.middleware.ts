import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../../../shared/util/http-response.adapter';

export class LoginValidator {
  public static validateFields(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return ApiResponse.notProvided(res, 'Email');
      }

      if (!password) {
        return ApiResponse.notProvided(res, 'Password');
      }

      next();
    } catch (error: any) {
      return ApiResponse.serverError(res, error);
    }
  }
}
