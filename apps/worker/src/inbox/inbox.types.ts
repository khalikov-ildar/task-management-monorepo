export const InboxTypes = {
  emailConfirmation: 'emailConfirmation',
  passwordResetRequest: 'passwordResetRequest',
  passwordResetSuccess: 'passwordResetSuccess',
} as const;

export type InboxTypes = (typeof InboxTypes)[keyof typeof InboxTypes];
