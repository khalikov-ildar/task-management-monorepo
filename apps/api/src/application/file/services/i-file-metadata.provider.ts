import { UUID } from 'node:crypto';

export type FileDetails = { filename: string; fileLinkId: UUID };

export abstract class IFileMetadataProvider {
  abstract createMetadataForFile(details: FileDetails): string;
  abstract extractDetailsFromMetadata(metadata: string): FileDetails;
}
