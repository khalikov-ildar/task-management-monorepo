export const AuthTypes = {
  Bearer: 'Bearer',
  Cookie: 'Cookie',
  None: 'None',
} as const;
export type AuthTypes = (typeof AuthTypes)[keyof typeof AuthTypes];
