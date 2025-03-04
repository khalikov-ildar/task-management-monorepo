import { ReviewStatus, ReviewStatuses } from '../../value-objects/review-status';

describe('ReviewStatus value object tests', () => {
  describe('[create] method tests', () => {
    it('Should create a ReviewStatus with a valid status value', () => {
      const validStatuses: ReviewStatuses[] = ['accepted', 'rejected'];
      validStatuses.forEach((status) => {
        const reviewStatus = ReviewStatus.create(status);
        expect(reviewStatus.value).toBe(status);
      });
    });

    it('Should throw an error when an invalid status value is provided', () => {
      const invalidValue = 'pending';
      // @ts-expect-error: intentionally passing an invalid value to test error handling
      expect(() => ReviewStatus.create(invalidValue)).toThrow(`The invalid value passed into review status: ${invalidValue}`);
    });
  });

  describe('isEqualTo()', () => {
    it('Should return true when two ReviewStatus instances have the same status', () => {
      const reviewStatus1 = ReviewStatus.create('accepted');
      const reviewStatus2 = ReviewStatus.create('accepted');
      expect(reviewStatus1.isEqualTo(reviewStatus2)).toBe(true);
    });

    it('Should return false when two ReviewStatus instances have different statuses', () => {
      const reviewStatus1 = ReviewStatus.create('accepted');
      const reviewStatus2 = ReviewStatus.create('rejected');
      expect(reviewStatus1.isEqualTo(reviewStatus2)).toBe(false);
    });
  });
});
