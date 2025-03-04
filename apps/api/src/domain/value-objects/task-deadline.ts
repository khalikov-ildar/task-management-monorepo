import { err, ok, Result } from 'neverthrow';
import { DeadlineErrors } from '../errors/task/deadline-errors';
import { CustomError } from '../common/error/custom-error';

export class Deadline {
  private constructor(public readonly value: Date) {}

  public static create(value: Date): Result<Deadline, CustomError> {
    const twoHours = 1000 * 60 * 60 * 2;
    const twoHoursFromNow = Date.now() + twoHours;

    if (value.getTime() <= twoHoursFromNow) {
      return err(DeadlineErrors.mustBeAtLeastTwoHoursFromNow());
    }

    return ok(new Deadline(value));
  }

  public isEqualTo(to: Deadline): boolean {
    return this.value.getTime() === to.value.getTime();
  }
}
