import { UUID } from 'node:crypto';
import { CustomError } from '../../common/error/custom-error';

export class FileErrors {
  public static NotFound(id: UUID): CustomError {
    return new CustomError('NotFound', `File with id :"${id}" was not found`);
  }
}
