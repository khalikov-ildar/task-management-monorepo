import { Deadline } from '../../../value-objects/task-deadline';

export function createValidDeadline(): Deadline {
  const now = new Date().getTime();
  const twoHoursAndOneSecond = 1000 * 60 * 60 * 2 + 1000;
  return Deadline.create(new Date(now + twoHoursAndOneSecond))._unsafeUnwrap();
}
