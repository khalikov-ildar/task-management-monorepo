import { UUID } from 'node:crypto';

export class ConfirmEmailCommand {
  constructor(public readonly tokenId: UUID) {}
}
