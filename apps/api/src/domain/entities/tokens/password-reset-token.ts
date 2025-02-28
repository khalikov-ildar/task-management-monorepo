import { randomUUID, UUID } from 'node:crypto';

export class PasswordResetToken {
  public readonly id: UUID;
  public isUsed: boolean;
  public usedAt?: Date;

  constructor(
    public readonly token: string,
    public readonly userId: UUID,
    isUsed?: boolean,
    usedAt?: Date,
    id?: UUID,
  ) {
    this.isUsed = isUsed ?? false;
    this.usedAt = usedAt ?? undefined;
    this.id = id ?? randomUUID();
  }

  use(): void {
    this.isUsed = true;
  }
}
