import { UUID } from 'node:crypto';
import { IEvent } from './i-event';

export const EmailConfirmationEventName = 'email-confirmation.event';
export type EmailConfirmationEventPayload = {
  userId: UUID;
  userEmail: string;
  tokenId: UUID;
};

interface EmailConfirmationEvent extends IEvent<EmailConfirmationEventPayload> {
  event: typeof EmailConfirmationEventName;
  payload: EmailConfirmationEventPayload;
}

export function createEmailConfirmationEvent(userId: UUID, userEmail: string, tokenId: UUID): EmailConfirmationEvent {
  return { event: EmailConfirmationEventName, payload: { userId, userEmail, tokenId } };
}
