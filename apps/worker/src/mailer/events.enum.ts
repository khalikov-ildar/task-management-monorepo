import { EmailConfirmationEventName, PasswordResetRequestEventName, PasswordResetSuccessEventName } from '@app/contracts';

export const Events = {
  EmailConfirmationEventName: EmailConfirmationEventName,
  PasswordResetRequestEventName: PasswordResetRequestEventName,
  PasswordResetSuccessEventName: PasswordResetSuccessEventName,
} as const;

export type Events = (typeof Events)[keyof typeof Events];
