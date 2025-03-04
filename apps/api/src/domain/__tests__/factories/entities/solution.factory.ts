import { Solution } from '../../../entities/solution/solution';
import { createValidFile } from './file.factory';
import { createValidTask } from './task.factory';

export function createValidSolution(): Solution {
  const task = createValidTask('high');
  const file = createValidFile();
  return new Solution(task, file, 's-s-s-s-s');
}
