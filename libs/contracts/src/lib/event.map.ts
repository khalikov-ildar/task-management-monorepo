import { EmailConfirmationEvent, EmailConfirmationEventName } from './email-confirmation.event';
import { PasswordResetRequestEvent, PasswordResetRequestEventName } from './password-reset-request.event';

export interface EventMap {
  [EmailConfirmationEventName]: EmailConfirmationEvent;
  [PasswordResetRequestEventName]: PasswordResetRequestEvent;
}

export type GetEventTypeByName<T extends string> = T extends keyof EventMap ? EventMap[T] : never;
