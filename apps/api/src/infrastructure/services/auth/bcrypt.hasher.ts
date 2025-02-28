import { Injectable } from '@nestjs/common';
import { IPasswordHasher } from '../../../application/auth/services/i-password.hasher';
import { hash, compare } from 'bcrypt';

@Injectable()
export class BcryptHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return await hash(password, 10);
  }
  async verify(hashed: string, password: string): Promise<boolean> {
    return await compare(password, hashed);
  }
}
