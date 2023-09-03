import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

export class JwtService {
  public createToken(data: any): string {
    return jwt.sign(data, process.env.JWT_SECRET!);
  }

  public decodeToken(token: string): any {
    const result = jwt.decode(token);

    if (!result) {
      return null;
    }

    return result;
  }
}
