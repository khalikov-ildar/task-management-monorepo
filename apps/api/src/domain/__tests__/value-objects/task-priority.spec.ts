import { TaskPriorities, TaskPriority } from '../../value-objects/task-priority';

describe('TaskPriority value object tests', () => {
  describe('[create] method tests', () => {
    it('Should create a TaskPriority with a valid priority value', () => {
      const validPriorities: TaskPriorities[] = ['low', 'medium', 'high'];
      validPriorities.forEach((priority) => {
        const taskPriority = TaskPriority.create(priority);
        expect(taskPriority.value).toBe(priority);
      });
    });

    it('Should throw an error when an invalid priority value is provided', () => {
      const invalidValue = 'invalid';
      // @ts-expect-error: intentionally passing an invalid value for testing
      expect(() => TaskPriority.create(invalidValue)).toThrow(`The invalid value is passed into task priority: ${invalidValue}`);
    });
  });

  describe('[isEqualTo] method tests', () => {
    it('Should return true when two TaskPriority instances have the same priority', () => {
      const taskPriority1 = TaskPriority.create('low');
      const taskPriority2 = TaskPriority.create('low');
      expect(taskPriority1.isEqualTo(taskPriority2)).toBe(true);
    });

    it('Should return false when two TaskPriority instances have different priorities', () => {
      const taskPriority1 = TaskPriority.create('low');
      const taskPriority2 = TaskPriority.create('high');
      expect(taskPriority1.isEqualTo(taskPriority2)).toBe(false);
    });
  });
});
