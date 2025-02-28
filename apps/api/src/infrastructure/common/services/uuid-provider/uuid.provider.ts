import { IUuidProvider } from '../../../../application/common/services/i-uuid.provider';
import { randomUUID, UUID } from 'crypto';

export class UuidProvider implements IUuidProvider {
  generate(): UUID {
    return randomUUID();
  }
}
