import { Task } from '../../entities/task/task';
import { User } from '../../entities/user/user';
import { TaskPriority } from '../../value-objects/task-priority';
import { TaskStatus } from '../../value-objects/task-status';
import { Role } from '../../entities/user/role/role';
import { createValidReview } from '../factories/entities/review.factory';
import { createValidUser } from '../factories/entities/user.factory';
import { TaskErrors } from '../../errors/task/task.errors';
import { createValidDeadline } from '../factories/value-objects/deadline.factory';

describe('Task entity tests', () => {
  const adminRole = new Role('Admin', 's-s-s-s-s');
  const dummyUser = new User('email', 'password', 'username', adminRole);
  const dummyAssignees = [dummyUser];
  const acceptedReview = createValidReview('accepted');
  const rejectedReview = createValidReview('rejected');
  const taskTitle = 'title';
  const taskDescription = 'description';
  const lowPriority = TaskPriority.create('low');

  describe('Creation validations', () => {
    it('Should create a Task if all parameters are valid', () => {
      const deadline = createValidDeadline();
      const status = TaskStatus.create('pending');
      const result = Task.create(taskTitle, taskDescription, lowPriority, deadline, status, dummyUser, dummyAssignees);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const task = result.value;
        expect(task.title).toBe(taskTitle);
        expect(task.description).toBe(taskDescription);
        expect(task.priority.isEqualTo(lowPriority)).toBe(true);
        expect(task.deadline.isEqualTo(deadline)).toBe(true);
        expect(task.status.isEqualTo(status)).toBe(true);
        expect(task.owner).toBe(dummyUser);
        expect(task.assignees).toEqual(dummyAssignees);
        expect(Array.isArray(task.solutions)).toBe(true);
      }
    });

    it('Should fail creating a Task if the number of assignees is less than the minimum', () => {
      const deadline = createValidDeadline();
      const status = TaskStatus.create('pending');
      const result = Task.create(taskTitle, taskDescription, lowPriority, deadline, status, dummyUser, []);
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toEqual(
          TaskErrors.assigneesCountMustBeInRange(Task.minAssigneesCount, Task.maxAssigneesCount, 0).message,
        );
      }
    });

    it('Should fail creating a Task if the number of assignees is greater than the maximum', () => {
      const deadline = createValidDeadline();
      const status = TaskStatus.create('pending');
      const manyAssignees = Array.from({ length: Task.maxAssigneesCount + 1 }, () => createValidUser('Member'));
      const result = Task.create(taskTitle, taskDescription, lowPriority, deadline, status, dummyUser, manyAssignees);
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toEqual(
          TaskErrors.assigneesCountMustBeInRange(Task.minAssigneesCount, Task.maxAssigneesCount, Task.maxAssigneesCount + 1).message,
        );
      }
    });
  });

  describe('[markAsCompleted] method tests', () => {
    it('Should transition from pending to on-review when markAsCompleted is called and task is not expired', () => {
      const deadline = createValidDeadline();
      const status = TaskStatus.create('pending');
      const taskResult = Task.create(taskTitle, taskDescription, lowPriority, deadline, status, dummyUser, dummyAssignees);
      expect(taskResult.isOk()).toBe(true);
      if (taskResult.isOk()) {
        const task = taskResult.value;
        const result = task.markAsCompleted();
        expect(result.isOk()).toBe(true);
        expect(task.status.value).toBe('on-review');
      }
    });

    it('Should transition to expired state if the deadline has passed when markAsCompleted is called', () => {
      // Create a deadline in the past
      const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
      const deadline = { value: pastDate } as any; // casting as Deadline for test purposes
      const status = TaskStatus.create('pending');
      const taskResult = Task.create(taskTitle, taskDescription, lowPriority, deadline, status, dummyUser, dummyAssignees);
      expect(taskResult.isOk()).toBe(true);
      if (taskResult.isOk()) {
        const task = taskResult.value;
        const result = task.markAsCompleted();
        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
          expect(result.error.message).toEqual(TaskErrors.taskIsExpired().message);
        }
        expect(task.status.value).toBe('expired');
      }
    });
  });

  describe('[evaluateCompletion] method tests', () => {
    it('Should transition from on-review to approved if review is accepted', () => {
      const deadline = createValidDeadline();
      const pendingStatus = TaskStatus.create('pending');
      const taskResult = Task.create(taskTitle, taskDescription, lowPriority, deadline, pendingStatus, dummyUser, dummyAssignees);
      expect(taskResult.isOk()).toBe(true);
      if (taskResult.isOk()) {
        const task = taskResult.value;
        const markResult = task.markAsCompleted();
        expect(markResult.isOk()).toBe(true);
        expect(task.status.value).toBe('on-review');
        const review = acceptedReview;
        const evalResult = task.evaluateCompletion(review);
        expect(evalResult.isOk()).toBe(true);
        expect(task.status.value).toBe('approved');
      }
    });

    it('Should transition from on-review to pending if review is rejected', () => {
      const deadline = createValidDeadline();
      const pendingStatus = TaskStatus.create('pending');
      const taskResult = Task.create(taskTitle, taskDescription, lowPriority, deadline, pendingStatus, dummyUser, dummyAssignees);
      expect(taskResult.isOk()).toBe(true);
      if (taskResult.isOk()) {
        const task = taskResult.value;
        const markResult = task.markAsCompleted();
        expect(markResult.isOk()).toBe(true);
        expect(task.status.value).toBe('on-review');
        const review = rejectedReview;
        const evalResult = task.evaluateCompletion(review);
        expect(evalResult.isOk()).toBe(true);
        expect(task.status.value).toBe('pending');
      }
    });
  });

  describe('[changePriority] method tests', () => {
    it('Should successfully change priority in pending state', () => {
      const initialPriority = lowPriority;
      const newPriority = TaskPriority.create('high');
      const deadline = createValidDeadline();
      const pendingStatus = TaskStatus.create('pending');
      const taskResult = Task.create(taskTitle, taskDescription, initialPriority, deadline, pendingStatus, dummyUser, dummyAssignees);
      expect(taskResult.isOk()).toBe(true);
      if (taskResult.isOk()) {
        const task = taskResult.value;
        const result = task.changePriority(newPriority);
        expect(result.isOk()).toBe(true);
        expect(task.priority.isEqualTo(newPriority)).toBe(true);
      }
    });

    it('Should not change priority if task is not in pending state', () => {
      const initialPriority = lowPriority;
      const newPriority = TaskPriority.create('high');
      const deadline = createValidDeadline();
      const pendingStatus = TaskStatus.create('pending');
      const taskResult = Task.create(taskTitle, taskDescription, initialPriority, deadline, pendingStatus, dummyUser, dummyAssignees);
      expect(taskResult.isOk()).toBe(true);
      if (taskResult.isOk()) {
        const task = taskResult.value;
        const markResult = task.markAsCompleted();
        expect(markResult.isOk()).toBe(true);
        expect(task.status.value).toBe('on-review');
        const changeResult = task.changePriority(newPriority);
        expect(changeResult.isErr()).toBe(true);
        if (changeResult.isErr()) {
          expect(changeResult.error.message).toEqual(TaskErrors.taskStatusIsNotPending().message);
        }
        expect(task.priority.isEqualTo(initialPriority)).toBe(true);
      }
    });
  });
});
