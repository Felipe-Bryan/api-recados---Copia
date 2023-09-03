import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../../../shared/util/http-response.adapter';

export class TaskMiddleware {
  public static validateFieldsCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const { detail, description } = req.body;

      if (!detail) {
        return ApiResponse.notProvided(res, 'Detail');
      }

      if (!description) {
        return ApiResponse.notProvided(res, 'Description');
      }

      next();
    } catch (error) {
      return ApiResponse.serverError(res, error);
    }
  }

  public static validateLengthFields(req: Request, res: Response, next: NextFunction) {
    try {
      const { detail, description } = req.body;

      if (detail.length < 1) {
        return ApiResponse.invalidField(res, 'Detail');
      }

      if (description.length < 1) {
        return ApiResponse.invalidField(res, 'Description');
      }

      next();
    } catch (error) {
      ApiResponse.serverError(res, error);
    }
  }
}
