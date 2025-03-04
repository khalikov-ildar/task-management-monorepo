import { UUID } from 'node:crypto';
import { IEvent } from './i-event';

export const PasswordResetSuccessEventName = 'password-reset.success-event';
export type PasswordResetSuccessEventPayload = {
  userEmail: string;
  userId: UUID;
};

interface PasswordResetSuccessEvent extends IEvent<PasswordResetSuccessEventPayload> {
  event: typeof PasswordResetSuccessEventName;
  payload: PasswordResetSuccessEventPayload;
}

export function createPasswordResetSuccessEvent(userEmail: string, userId: UUID): PasswordResetSuccessEvent {
  return {
    event: PasswordResetSuccessEventName,
    payload: {
      userEmail,
      userId,
    },
  } satisfies PasswordResetSuccessEvent;
}
