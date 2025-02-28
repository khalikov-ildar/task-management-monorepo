import { Solution } from '../../../domain/entities/solution/solution';
import { User } from '../../../domain/entities/user/user';

export class ReviewPolicyService {
  public static canCreate(solution: Solution, reviewer: User): boolean {
    return solution.creatorId === reviewer.id;
  }
}
