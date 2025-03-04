import { File } from '../../../entities/file/file';

export function createValidFile(): File {
  return new File('filename', 'etag', 's-s-s-s-s', 'a-a-a-a-a');
}
