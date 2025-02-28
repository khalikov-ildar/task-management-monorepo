import { UUID } from 'node:crypto';
import { FileLink } from '../../entities/file/file-link';

export abstract class IFileLinkRepository {
  abstract getById(id: UUID, tx?: any): Promise<FileLink | null>;
  abstract save(link: FileLink, tx?: any): Promise<void>;
  abstract update(link: FileLink, tx?: any): Promise<void>;
  abstract deleteById(id: UUID, tx?: any): Promise<void>;
}
