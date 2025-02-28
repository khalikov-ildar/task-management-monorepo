import { PasswordTokenType } from '../dtos/password-token-type';

export abstract class IPasswordTokenProvider {
  abstract signPasswordToken(payload: PasswordTokenType): Promise<string>;
  abstract verifyPasswordToken(token: string): Promise<PasswordTokenType>;
}
