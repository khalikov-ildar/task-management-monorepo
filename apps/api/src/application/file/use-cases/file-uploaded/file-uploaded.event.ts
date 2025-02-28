import { UUID } from 'node:crypto';

export class FileUploadedEvent {
  constructor(
    public readonly fileLinkId: UUID,
    public readonly etag: string,
    public readonly metadata: string,
  ) {}
}
