import { UUID } from 'node:crypto';

export abstract class IUuidProvider {
  abstract generate(): UUID;
}
