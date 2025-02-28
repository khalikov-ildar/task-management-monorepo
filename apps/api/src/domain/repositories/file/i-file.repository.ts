import { UUID } from 'node:crypto';
import { File } from '../../entities/file/file';

export abstract class IFileRepository {
  abstract getById(id: UUID, tx?: any): Promise<File | null>;
  abstract getByEtag(etag: string, tx?: any): Promise<File | null>;
  abstract create(file: File, tx?: any): Promise<void>;
  abstract update(file: File, tx?: any): Promise<void>;
  abstract delete(file: File, tx?: any): Promise<void>;
}
