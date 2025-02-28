import { UUID } from 'node:crypto';
import { Solution } from '../../entities/solution/solution';

export abstract class ISolutionRepository {
  abstract getById(id: UUID, tx?: any): Promise<Solution | null>;
  abstract create(solution: Solution, tx?: any): Promise<void>;
  abstract update(solution: Solution, tx?: any): Promise<void>;
  abstract delete(solution: Solution, tx?: any): Promise<void>;
  abstract updateStatus(solution: Solution, tx?: any): Promise<void>;
}
