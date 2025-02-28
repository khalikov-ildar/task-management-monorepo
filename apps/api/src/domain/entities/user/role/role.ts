import { randomUUID, UUID } from 'node:crypto';
import { UserRoles } from '../user-roles';

export class Role {
  public id: UUID;

  constructor(
    public readonly name: UserRoles,
    id?: UUID,
  ) {
    this.id = id ?? randomUUID();
  }
}
