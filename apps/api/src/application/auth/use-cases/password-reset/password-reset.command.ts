import { UUID } from 'node:crypto';

export class PasswordResetCommand {
  constructor(
    public readonly tokenId: UUID,
    public readonly newPassword: string,
  ) {}
}
