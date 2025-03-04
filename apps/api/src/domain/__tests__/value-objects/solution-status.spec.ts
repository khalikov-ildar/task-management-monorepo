import { SolutionStatuses, SolutionStatus } from '../../value-objects/solution-status';

describe('SolutionStatus value object tests', () => {
  describe('[create] method tests', () => {
    it('Should create a SolutionStatus with a valid status value', () => {
      const validStatuses: SolutionStatuses[] = ['pending', 'reviewed'];
      validStatuses.forEach((status) => {
        const solutionStatus = SolutionStatus.create(status);
        expect(solutionStatus.value).toBe(status);
      });
    });

    it('Should throw an error when an invalid status value is provided', () => {
      const invalidValue = 'invalid';
      // @ts-expect-error: intentionally passing an invalid value for testing
      expect(() => SolutionStatus.create(invalidValue)).toThrow(`The invalid value is passed into review status: ${invalidValue}`);
    });
  });

  describe('[isEqualTo] method tests', () => {
    it('Should return true when two SolutionStatus instances have the same status', () => {
      const solutionStatus1 = SolutionStatus.create('pending');
      const solutionStatus2 = SolutionStatus.create('pending');
      expect(solutionStatus1.isEqualTo(solutionStatus2)).toBe(true);
    });

    it('Should return false when two SolutionStatus instances have different statuses', () => {
      const solutionStatus1 = SolutionStatus.create('pending');
      const solutionStatus2 = SolutionStatus.create('reviewed');
      expect(solutionStatus1.isEqualTo(solutionStatus2)).toBe(false);
    });
  });
});
