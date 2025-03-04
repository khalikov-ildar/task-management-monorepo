import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject } from '@nestjs/common';
import { IFileMetadataProvider, FileDetails } from '../../../application/file/services/i-file-metadata.provider';

@Injectable()
export class FileMetadataProvider implements IFileMetadataProvider {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
  createMetadataForFile(details: FileDetails): string {
    throw new Error(details.fileLinkId);
  }
  extractDetailsFromMetadata(metadata: string): FileDetails {
    throw new Error(metadata);
  }
}
