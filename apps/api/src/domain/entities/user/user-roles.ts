export const UserRoles = {
  Member: 'Member',
  Supervisor: 'Supervisor',
  Admin: 'Admin',
} as const;
export type UserRoles = (typeof UserRoles)[keyof typeof UserRoles];
