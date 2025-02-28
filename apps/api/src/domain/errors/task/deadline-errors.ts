import { CustomError } from '../../common/error/custom-error';

export class DeadlineErrors {
  public static mustBeAtLeastTwoHoursFromNow(): CustomError {
    return new CustomError('Validation', 'Deadline must be at least two hours from now');
  }
}
