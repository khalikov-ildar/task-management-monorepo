import { CustomError } from '../../common/error/custom-error';

export class ReviewErrors {
  public static reviewCannotBeCreatedByMember(): CustomError {
    return new CustomError('Forbidden', 'You have no permissions to review the task');
  }
}
