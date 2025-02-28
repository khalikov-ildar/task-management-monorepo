import { randomUUID, UUID } from 'node:crypto';

export class EmailVerificationToken {
  public readonly id: UUID;

  constructor(
    public readonly userId: UUID,
    public readonly userEmail: string,
    public readonly token: string,
    id?: UUID,
  ) {
    this.id = id ?? randomUUID();
  }
}
