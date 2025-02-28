import { EmailTokenType } from '../dtos/email-token-type';

export abstract class IEmailTokenProvider {
  abstract signEmailToken(email: string): Promise<string>;
  abstract verifyEmailToken(token: string): Promise<EmailTokenType>;
}
