import { UUID } from 'node:crypto';
import { IEvent } from './i-event';

export const EmailConfirmationEventName = 'password-reset.requested-event';
export type EmailConfirmationEventPayload = {
  userId: UUID;
  userEmail: string;
  tokenId: UUID;
};

export interface EmailConfirmationEvent extends IEvent {
  event: typeof EmailConfirmationEventName;
  payload: EmailConfirmationEventPayload;
}

export function createEmailConfirmationEvent(userId: UUID, userEmail: string, tokenId: UUID): EmailConfirmationEvent {
  return { event: 'password-reset.requested-event', payload: { userId, userEmail, tokenId } };
}
