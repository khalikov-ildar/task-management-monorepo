import { UUID } from 'node:crypto';

export abstract class IFileStorageRepository {
  abstract requestUploadLink(fileLinkId: UUID, fileName: string, type: string, size: number): Promise<string>;
}
