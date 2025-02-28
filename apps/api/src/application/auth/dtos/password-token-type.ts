import { UUID } from 'node:crypto';

export type PasswordTokenType = {
  sub: UUID;
};
