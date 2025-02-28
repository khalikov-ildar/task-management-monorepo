import { UUID } from 'node:crypto';
import { IEvent } from './i-event';

export const PasswordResetRequestEventName = 'password-reset.requested-event';
export type PasswordResetRequestEventPayload = {
  userId: UUID;
  userEmail: string;
  tokenId: UUID;
};

export interface PasswordResetRequestEvent extends IEvent {
  event: typeof PasswordResetRequestEventName;
  payload: PasswordResetRequestEventPayload;
}

export function createPasswordResetRequestEvent(userId: UUID, userEmail: string, tokenId: UUID): PasswordResetRequestEvent {
  return {
    event: 'password-reset.requested-event',
    payload: {
      tokenId,
      userEmail,
      userId,
    },
  } satisfies PasswordResetRequestEvent;
}
