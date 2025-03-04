import { Result } from 'neverthrow';
import { Deadline } from '../../value-objects/task-deadline';
import { DeadlineErrors } from '../../errors/task/deadline-errors';

describe('Deadline value object tests', () => {
  // Fixed time for testing: January 1, 2021, 12:00:00
  const baseTime = new Date('2021-01-01T12:00:00.000Z').getTime();
  const twoHours = 1000 * 60 * 60 * 2; // two hours in ms

  beforeAll(() => {
    jest.useFakeTimers({ now: baseTime });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('[create] method tests', () => {
    it('Should return an error if the provided deadline is less than or equal to two hours from now', () => {
      const deadlineDate = new Date(baseTime + twoHours);
      const result: Result<Deadline, unknown> = Deadline.create(deadlineDate);

      expect(result.isErr()).toBe(true); // if your Result type supports isErr

      expect(result._unsafeUnwrapErr()).toEqual(DeadlineErrors.mustBeAtLeastTwoHoursFromNow());
    });

    it('Should return an error if the provided deadline is in the past', () => {
      const pastDate = new Date(baseTime - 10000); // 10 seconds ago
      const result = Deadline.create(pastDate);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual(DeadlineErrors.mustBeAtLeastTwoHoursFromNow());
    });

    it('Should create a Deadline if the provided date is more than two hours in the future', () => {
      const validDate = new Date(baseTime + twoHours + 60 * 1000); // two hours and one minute
      const result = Deadline.create(validDate);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().value.getTime()).toEqual(validDate.getTime());
    });
  });

  describe('[isEqualTo] method tests', () => {
    it('Should return true for two deadlines with the same time', () => {
      const date = new Date(baseTime + twoHours + 1000 * 120);
      const result1 = Deadline.create(date);
      const result2 = Deadline.create(date);

      expect(result1.isOk()).toBe(true);
      expect(result2.isOk()).toBe(true);

      const deadline1 = result1._unsafeUnwrap();
      const deadline2 = result2._unsafeUnwrap();

      expect(deadline1.isEqualTo(deadline2)).toBe(true);
    });

    it('Should return false for two deadlines with different times', () => {
      const date1 = new Date(baseTime + twoHours + 1000 * 120); // +2 minutes
      const date2 = new Date(baseTime + twoHours + 1000 * 180); // +3 minutes

      const result1 = Deadline.create(date1);
      const result2 = Deadline.create(date2);

      expect(result1.isOk()).toBe(true);
      expect(result2.isOk()).toBe(true);

      const deadline1 = result1._unsafeUnwrap();
      const deadline2 = result2._unsafeUnwrap();

      expect(deadline1.isEqualTo(deadline2)).toBe(false);
    });
  });
});
