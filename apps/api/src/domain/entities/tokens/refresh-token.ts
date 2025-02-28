import { randomUUID, UUID } from 'node:crypto';

export class RefreshToken {
  public id: UUID;
  public isRevoked: boolean;
  public revokedAt?: Date;
  public createdAt: Date;

  constructor(
    public userId: UUID,
    public token: string,
    id?: UUID,
    isRevoked?: boolean,
    revokedAt?: Date,
    createdAt?: Date,
  ) {
    this.id = id ?? randomUUID();
    this.isRevoked = isRevoked ?? false;
    this.revokedAt = revokedAt ?? undefined;
    this.createdAt = createdAt ?? new Date();
  }

  public revoke(): void {
    this.isRevoked = true;
    this.revokedAt = new Date();
  }
}
