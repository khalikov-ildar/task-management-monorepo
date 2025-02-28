type JoinedAssignees = ({
  user: {
    id: string;
    email: string;
    password: string;
    roleId: string;
    username: string;
    isEmailConfirmed: boolean;
  };
} & {
  userId: string;
  taskId: string;
})[];

export type TaskWithOwnerAndAssignees = {
  assignees: JoinedAssignees;
  owner: {
    id: string;
    email: string;
    password: string;
    roleId: string;
    username: string;
    isEmailConfirmed: boolean;
  };
} & {
  id: string;
  changedAt: Date | null;
  title: string;
  description: string;
  priority: string;
  deadline: Date;
  status: string;
  ownerId: string;
};

export type GetAssignedTaskDto = {
  id: string;
  title: string;
  description: string;
  priority: string;
  deadline: Date;
  status: string;
  changedAt: Date;
  owner: {
    id: string;
  };
  assignees: {
    userId: string;
  }[];
};
