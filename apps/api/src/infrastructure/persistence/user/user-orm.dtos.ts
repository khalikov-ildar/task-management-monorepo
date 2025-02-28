export type UserWithRoles = {
  role: {
    id: string;
    name: string;
  };
} & {
  id: string;
  roleId: string;
  username: string;
  email: string;
  password: string;
};
