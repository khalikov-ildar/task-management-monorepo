import { UUID } from 'node:crypto';
import { CustomError } from '../../common/error/custom-error';

export class SolutionErrors {
  public static notFound(id: UUID): CustomError {
    return new CustomError('NotFound', `Solution with id: "${id}" was not found`);
  }
}
