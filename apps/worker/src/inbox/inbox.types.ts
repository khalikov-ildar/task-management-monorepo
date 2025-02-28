export const InboxTypes = {
  emailConfirmation: 'emailConfirmation',
  passwordResetRequest: 'passwordResetRequest',
} as const;

export type InboxTypes = (typeof InboxTypes)[keyof typeof InboxTypes];
