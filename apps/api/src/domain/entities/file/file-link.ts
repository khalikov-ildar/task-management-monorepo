import { UUID } from 'node:crypto';

export class FileLink {
  public isUsed: boolean;
  public readonly fileId?: UUID;

  constructor(
    public readonly id: UUID,
    public readonly userId: UUID,
    public readonly link: string,
    isUsed?: boolean,

    fileId?: UUID,
  ) {
    this.isUsed = isUsed ?? false;
    this.fileId = fileId ?? undefined;
  }

  public use(): void {
    this.isUsed = true;
  }
}
