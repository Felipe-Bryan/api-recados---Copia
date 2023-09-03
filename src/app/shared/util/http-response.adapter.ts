import { Response } from 'express';
import { Result } from '../contracts/result.contract';

export class ApiResponse {
  public static notFound(res: Response, entity: string) {
    return res.status(404).send({
      ok: false,
      msg: `${entity} not found`,
    });
  }

  public static serverError(res: Response, error: any) {
    return res.status(500).send({
      ok: false,
      msg: error.toString(),
    });
  }

  public static notProvided(res: Response, field: string) {
    return res.status(400).send({
      ok: false,
      msg: `${field} was not provided`,
    });
  }

  public static invalidField(res: Response, field: string) {
    return res.status(400).send({
      ok: false,
      msg: `${field} is invalid`,
    });
  }

  public static badRequest(res: Response, msg: string) {
    return res.status(400).send({
      ok: false,
      msg,
    });
  }

  public static done(res: Response, result: Result) {
    return res.status(result.code).send(result);
  }
}
