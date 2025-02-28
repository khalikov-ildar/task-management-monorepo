import { randomUUID, UUID } from 'node:crypto';

export class File {
  public id: UUID;

  constructor(
    public readonly name: string,
    public readonly etag: string,
    public readonly uploaderId: UUID,
    public readonly fileLinkId: UUID,
    id?: UUID,
  ) {
    this.id = id ?? randomUUID();
  }
}
