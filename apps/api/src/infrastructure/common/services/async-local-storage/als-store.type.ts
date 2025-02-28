import { Role } from '../../../../domain/entities/user/role/role';
import { UUID } from 'node:crypto';

export interface AlsStructure {
  traceId: UUID;
  refreshToken: string;
  userId: UUID;
  role: Role;
  maskedIp: string;
  path: string;
}

type AlsStructureKey = keyof AlsStructure;

export type AlsStore = Map<AlsStructureKey, AlsStructure[AlsStructureKey]>;
