import { TaskStatus, TaskStatuses } from '../../value-objects/task-status';

describe('TaskStatus value object tests', () => {
  describe('[create] method tests', () => {
    it('Should create a TaskStatus with the default "pending" status when no value is provided', () => {
      const taskStatus = TaskStatus.create();
      expect(taskStatus.value).toBe('pending');
    });

    it('Should create a TaskStatus with a valid status value', () => {
      const validStatuses: TaskStatuses[] = ['approved', 'expired', 'pending', 'on-review'];
      validStatuses.forEach((status) => {
        const taskStatus = TaskStatus.create(status);
        expect(taskStatus.value).toBe(status);
      });
    });

    it('Should throw an error when an invalid status value is provided', () => {
      // @ts-expect-error: passing invalid value
      expect(() => TaskStatus.create('invalid')).toThrow('The invalid value is passed into task status');
    });
  });

  describe('[isEqualTo] method tests', () => {
    it('Should return true when two TaskStatus instances have the same status', () => {
      const taskStatus1 = TaskStatus.create('approved');
      const taskStatus2 = TaskStatus.create('approved');
      expect(taskStatus1.isEqualTo(taskStatus2)).toBe(true);
    });

    it('Should return false when two TaskStatus instances have different statuses', () => {
      const taskStatus1 = TaskStatus.create('approved');
      const taskStatus2 = TaskStatus.create('pending');
      expect(taskStatus1.isEqualTo(taskStatus2)).toBe(false);
    });
  });
});
