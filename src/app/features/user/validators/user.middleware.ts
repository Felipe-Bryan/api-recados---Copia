import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../../../shared/util/http-response.adapter';
import { UserRepository } from '../repositories/user.repository';

export class UserMiddleware {
  public static validateCreateFields(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (!name) {
        return ApiResponse.notProvided(res, 'Name');
      }

      if (!email) {
        return ApiResponse.notProvided(res, 'Email');
      }

      if (!password) {
        return ApiResponse.notProvided(res, 'Password');
      }

      if (password.length < 5) {
        return ApiResponse.badRequest(res, 'Password should be at least 5 characters');
      }

      if (password !== confirmPassword) {
        return ApiResponse.badRequest(res, 'Passwords do not match');
      }

      next();
    } catch (error: any) {
      return ApiResponse.serverError(res, error);
    }
  }

  public static async validateEmailAlreadyExists(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const userEmail = await new UserRepository().getByEmail(email);

      if (userEmail) {
        return ApiResponse.badRequest(res, 'Email already exists');
      }

      next();
    } catch (error: any) {
      return ApiResponse.serverError(res, error);
    }
  }

  public static async validateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const user = await new UserRepository().get(userId);

      if (!user) {
        return ApiResponse.notFound(res, 'User');
      }

      next();
    } catch (error) {
      return ApiResponse.serverError(res, error);
    }
  }
}
