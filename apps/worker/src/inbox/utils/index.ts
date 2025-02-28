import { EmailConfirmationEventPayload, IEvent, PasswordResetRequestEventPayload } from '@app/contracts';
import { InboxTypes } from '../inbox.types';

export function getEventPayloadByInboxType<T extends IEvent>(inboxType: InboxTypes, event: T) {
  switch (inboxType) {
    case 'emailConfirmation':
      return event.payload as EmailConfirmationEventPayload;
    case 'passwordResetRequest':
      return event.payload as PasswordResetRequestEventPayload;
  }
}
