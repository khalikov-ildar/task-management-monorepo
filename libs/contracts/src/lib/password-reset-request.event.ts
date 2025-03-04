import { UUID } from 'node:crypto';
import { IEvent } from './i-event';

export const PasswordResetRequestEventName = 'password-reset.requested-event';
export type PasswordResetRequestEventPayload = {
  userId: UUID;
  userEmail: string;
  tokenId: UUID;
};

interface PasswordResetRequestEvent extends IEvent<PasswordResetRequestEventPayload> {
  event: typeof PasswordResetRequestEventName;
  payload: PasswordResetRequestEventPayload;
}

export function createPasswordResetRequestEvent(userId: UUID, userEmail: string, tokenId: UUID): PasswordResetRequestEvent {
  return {
    event: PasswordResetRequestEventName,
    payload: {
      tokenId,
      userEmail,
      userId,
    },
  } satisfies PasswordResetRequestEvent;
}
