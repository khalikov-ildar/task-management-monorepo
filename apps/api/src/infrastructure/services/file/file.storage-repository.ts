import { Injectable } from '@nestjs/common';
import { IFileMetadataProvider } from '../../../application/file/services/i-file-metadata.provider';
import { IFileStorageRepository } from '../../../domain/repositories/file/i-file-storage.repository';
import * as Minio from 'minio';

@Injectable()
export class FileStorage implements IFileStorageRepository {
  private static readonly fileTtlInSeconds: number = 60 * 10;

  private readonly minio: Minio.Client;
  private readonly bucket: string = 'asdasdsa';

  constructor(private readonly fileMetadataProvider: IFileMetadataProvider) {
    this.minio = new Minio.Client({
      endPoint: 'play.min.io',
      port: 9000,
      useSSL: false,
      accessKey: 'Q3AM3UQ867SPQQA43P2F',
      secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG',
    });
  }

  async requestUploadLink(metadata: string): Promise<string> {
    return await this.minio.presignedPutObject(this.bucket, metadata, FileStorage.fileTtlInSeconds);
  }
}
